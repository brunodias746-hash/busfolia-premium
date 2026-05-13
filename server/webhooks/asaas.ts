/**
 * Asaas Webhook Handler
 * Handles payment events from Asaas (PIX, Credit Card, Boleto)
 */
import type { Request, Response } from "express";
import crypto from "crypto";
import { ENV } from "../_core/env";
import {
  updateOrderStatus,
  createPayment,
  incrementEventSoldCount,
  getOrderWithDetails,
} from "../db";
import { sendEmail, generateOrderConfirmationEmail } from "../_core/email";

// ─── Types ───

interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    dueDate: string;
    description?: string;
    externalReference?: string; // our order shortId or order ID
    invoiceUrl?: string;
    bankSlipUrl?: string;
    confirmedDate?: string;
    paymentDate?: string;
  };
}

// ─── Webhook Signature Verification ───

export function verifyAsaasWebhookSignature(
  rawBody: Buffer | string,
  receivedToken: string | undefined
): boolean {
  const webhookSecret = ENV.asaasWebhookSecret;
  
  if (!webhookSecret) {
    console.error("[Asaas Webhook] No webhook secret configured");
    return false;
  }

  // Asaas sends the webhook access token in the header
  // Compare it with our stored webhook secret
  if (!receivedToken) {
    console.error("[Asaas Webhook] No access token in request");
    return false;
  }

  return receivedToken === webhookSecret;
}

// ─── Webhook Handler ───

export async function handleAsaasWebhook(req: Request, res: Response) {
  try {
    // Get the access token from headers
    const accessToken = req.headers["asaas-access-token"] as string | undefined;

    // Verify signature
    if (!verifyAsaasWebhookSignature(req.body, accessToken)) {
      console.error("[Asaas Webhook] Signature verification failed");
      // Return 200 to avoid retries on invalid signatures
      return res.status(200).json({ received: true, verified: false });
    }

    // Parse body
    let payload: AsaasWebhookPayload;
    try {
      payload = typeof req.body === "string" 
        ? JSON.parse(req.body) 
        : req.body;
    } catch (err) {
      console.error("[Asaas Webhook] Failed to parse body");
      return res.status(200).json({ received: true });
    }

    console.log(`[Asaas Webhook] Event: ${payload.event} | Payment: ${payload.payment?.id}`);

    // Respond immediately with 200 OK
    res.status(200).json({ received: true, verified: true });

    // Process event asynchronously
    (async () => {
      try {
        await processAsaasEvent(payload);
      } catch (err: any) {
        console.error(`[Asaas Webhook] Error processing event: ${err.message}`);
      }
    })();
  } catch (err: any) {
    console.error("[Asaas Webhook] Unexpected error:", err);
    return res.status(200).json({ received: true });
  }
}

// ─── Event Processing ───

async function processAsaasEvent(payload: AsaasWebhookPayload) {
  const { event, payment } = payload;

  if (!payment || !payment.externalReference) {
    console.log(`[Asaas Webhook] No externalReference in payment, skipping`);
    return;
  }

  // externalReference is our order ID (number)
  const orderId = parseInt(payment.externalReference, 10);
  if (isNaN(orderId)) {
    console.error(`[Asaas Webhook] Invalid externalReference: ${payment.externalReference}`);
    return;
  }

  switch (event) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED": {
      console.log(`[Asaas Webhook] Payment ${payment.id} confirmed/received for order ${orderId}`);

      // Get order details
      const orderDetails = await getOrderWithDetails(orderId);
      if (!orderDetails) {
        console.error(`[Asaas Webhook] Order ${orderId} not found`);
        return;
      }

      // Skip if already paid
      if (orderDetails.status === "paid") {
        console.log(`[Asaas Webhook] Order ${orderId} already paid, skipping`);
        return;
      }

      // Update order status to paid
      await updateOrderStatus(orderId, "paid");

      // Create payment record
      await createPayment({
        orderId,
        asaasPaymentId: payment.id,
        gateway: "asaas",
        method: payment.billingType.toLowerCase(), // "pix", "credit_card", "boleto"
        amountReceivedCents: Math.round(payment.value * 100),
        feeAsaasCents: Math.round((payment.value - payment.netValue) * 100),
        status: "succeeded",
        processedAt: new Date(),
      });

      // Increment sold count
      await incrementEventSoldCount(orderDetails.eventId, orderDetails.quantity);

      // Send confirmation email
      if (orderDetails.boardingPoint) {
        const boardingPointLabel = `${orderDetails.boardingPoint.city} - ${orderDetails.boardingPoint.locationName}`;
        const transportDates = JSON.parse(orderDetails.transportDates || "[]") as string[];

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
          console.log(`[Asaas Webhook] Email sent to ${orderDetails.customerEmail}`);
        } else {
          console.error(`[Asaas Webhook] Email failed: ${emailResult.error}`);
        }
      }

      console.log(`[Asaas Webhook] Order ${orderId} marked as paid. Qty: ${orderDetails.quantity}`);
      break;
    }

    case "PAYMENT_OVERDUE": {
      console.log(`[Asaas Webhook] Payment ${payment.id} overdue for order ${orderId}`);
      // Don't cancel immediately - just log. User might still pay.
      break;
    }

    case "PAYMENT_DELETED":
    case "PAYMENT_REFUNDED": {
      console.log(`[Asaas Webhook] Payment ${payment.id} ${event.toLowerCase()} for order ${orderId}`);
      const orderDetails = await getOrderWithDetails(orderId);
      if (orderDetails && orderDetails.status !== "canceled") {
        await updateOrderStatus(orderId, "canceled");
        console.log(`[Asaas Webhook] Order ${orderId} marked as canceled`);
      }
      break;
    }

    default:
      console.log(`[Asaas Webhook] Unhandled event: ${event}`);
  }
}
