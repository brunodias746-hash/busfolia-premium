import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getStripe } from "../lib/stripe";
import { ENV } from "./env";
import {
  getOrderByStripeSession,
  updateOrderStatus,
  createPayment,
  incrementEventSoldCount,
  getOrderWithDetails,
} from "../db";
import { sendEmail, generateOrderConfirmationEmail } from "./email";
import type Stripe from "stripe";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // CRITICAL: Stripe webhook MUST be registered BEFORE express.json()
  // because express.json() consumes the request body, and we need the raw Buffer
  // for Stripe signature verification
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string | undefined;
      if (!sig) {
        console.error("[Webhook] Missing stripe-signature header");
        return res.status(200).json({ verified: false, error: "Missing signature" });
      }

      let event: Stripe.Event;
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret
        );
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(200).json({ verified: false, error: `Webhook Error: ${err.message}` });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`[Webhook] Processing checkout.session.completed for session: ${session.id}`);

            const order = await getOrderByStripeSession(session.id);
            if (!order) {
              console.error(`[Webhook] No order found for session: ${session.id}`);
              break;
            }

            if (order.status === "paid") {
              console.log(`[Webhook] Order ${order.shortId} already paid, skipping`);
              break;
            }

            // Update order status to paid
            await updateOrderStatus(order.id, "paid");

            // Create payment record
            await createPayment({
              orderId: order.id,
              stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
              stripeSessionId: session.id,
              method: session.payment_method_types?.[0] ?? "card",
              amountReceivedCents: session.amount_total ?? order.totalAmountCents,
              status: "succeeded",
              processedAt: new Date(),
            });

            // Increment sold count on event
            await incrementEventSoldCount(order.eventId, order.quantity);

            // Get full order details with boarding point
            const orderDetails = await getOrderWithDetails(order.id);
            if (orderDetails && orderDetails.boardingPoint) {
              const boardingPointLabel = `${orderDetails.boardingPoint.city} - ${orderDetails.boardingPoint.locationName}`;
              const transportDates = JSON.parse(orderDetails.transportDates || "[]") as string[];
              
              // Send confirmation email
              const emailHtml = generateOrderConfirmationEmail({
                customerName: orderDetails.customerName,
                customerEmail: orderDetails.customerEmail,
                shortId: orderDetails.shortId,
                boardingPoint: boardingPointLabel,
                transportDates,
                quantity: orderDetails.quantity,
                totalAmountCents: orderDetails.totalAmountCents,
                whatsappLink: "https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po",
              });
              
              const emailResult = await sendEmail({
                to: orderDetails.customerEmail,
                subject: `Confirmação de Pedido - BusFolia ${orderDetails.shortId}`,
                html: emailHtml,
              });
              
              if (emailResult.success) {
                console.log(`[Webhook] Confirmation email sent to ${orderDetails.customerEmail}`);
              } else {
                console.error(`[Webhook] Failed to send confirmation email: ${emailResult.error}`);
              }
            }

            console.log(`[Webhook] Order ${order.shortId} marked as paid. Qty: ${order.quantity}`);
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await getOrderByStripeSession(session.id);
            if (order && order.status === "pending_checkout") {
              await updateOrderStatus(order.id, "canceled");
              console.log(`[Webhook] Order ${order.shortId} marked as canceled (session expired)`);
            }
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err: any) {
        console.error(`[Webhook] Error processing event ${event.type}:`, err.message);
        // Return 200 to prevent Stripe from retrying
        return res.status(200).json({ error: "Processing error, acknowledged" });
      }

      return res.status(200).json({ verified: true, received: true });
    } catch (err: any) {
      console.error("[Webhook] Unexpected error:", err);
      return res.status(200).json({ error: "Unexpected error" });
    }
  });
  
  // Configure body parser with larger size limit for file uploads
  // This MUST come after the webhook registration
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // CRITICAL: Add blocker middleware for API routes BEFORE setupVite
  // This prevents Vite from intercepting API calls
  app.use("/api", (req, res, next) => {
    // If we reach here, the API route wasn't handled, so 404
    res.status(404).json({ error: "API endpoint not found" });
  });
  
  // development mode uses Vite, production mode uses static files
  // This MUST come AFTER ALL specific API routes to avoid intercepting them
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
