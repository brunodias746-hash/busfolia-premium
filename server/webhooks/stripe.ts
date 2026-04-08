import { Router, raw } from "express";
import { ENV } from "../_core/env";
import { getStripe } from "../lib/stripe";
import {
  getOrderByStripeSession,
  updateOrderStatus,
  createPayment,
  incrementEventSoldCount,
  getOrderWithDetails,
} from "../db";
import { sendEmail, generateOrderConfirmationEmail } from "../_core/email";
import type Stripe from "stripe";

const stripeWebhookRouter = Router();

// CRITICAL: raw body parser BEFORE any JSON parsing for signature verification
stripeWebhookRouter.post(
  "/api/stripe/webhook",
  raw({ type: "application/json" }),
  async (req, res) => {
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
        sig!,
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
  }
);

export { stripeWebhookRouter };
