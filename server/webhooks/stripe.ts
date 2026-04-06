import { Router, raw } from "express";
import { ENV } from "../_core/env";
import { getStripe } from "../lib/stripe";
import {
  getOrderByStripeSession,
  updateOrderStatus,
  createPayment,
  incrementEventSoldCount,
} from "../db";
import type Stripe from "stripe";

const stripeWebhookRouter = Router();

// CRITICAL: raw body parser BEFORE any JSON parsing for signature verification
stripeWebhookRouter.post(
  "/api/webhooks/stripe",
  raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig) {
      console.error("[Webhook] Missing stripe-signature header");
      return res.status(400).json({ error: "Missing signature" });
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
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
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

    return res.json({ received: true });
  }
);

export { stripeWebhookRouter };
