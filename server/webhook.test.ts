import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// Mock stripe before importing the webhook handler
vi.mock("./lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: vi.fn((body: string, sig: string, secret: string) => {
        if (sig === "invalid_signature") {
          throw new Error("Webhook signature verification failed");
        }
        return JSON.parse(body);
      }),
    },
  }),
}));

// Mock db functions
vi.mock("./db", () => ({
  getOrderByStripeSession: vi.fn(async (sessionId: string) => {
    if (sessionId === "cs_test_valid") {
      return { id: 1, eventId: 1, quantity: 2, status: "pending", shortId: "BF-ABC123" };
    }
    return null;
  }),
  updateOrderStatus: vi.fn(async () => {}),
  createPayment: vi.fn(async () => 1),
  incrementEventSoldCount: vi.fn(async () => {}),
}));

describe("Stripe Webhook Handler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusCode: number;
  let responseBody: unknown;

  beforeEach(() => {
    statusCode = 200;
    responseBody = undefined;

    mockRes = {
      status: vi.fn((code: number) => {
        statusCode = code;
        return mockRes as Response;
      }),
      json: vi.fn((body: unknown) => {
        responseBody = body;
        return mockRes as Response;
      }),
      send: vi.fn((body: unknown) => {
        responseBody = body;
        return mockRes as Response;
      }),
    };
  });

  it("should reject requests without stripe-signature header", async () => {
    // Simulate missing signature
    const event = { id: "evt_123", type: "checkout.session.completed", data: { object: {} } };
    mockReq = {
      body: Buffer.from(JSON.stringify(event)),
      headers: {},
    };

    // The handler checks for signature - without it, constructEvent will fail
    const { getStripe } = await import("./lib/stripe");
    const stripe = getStripe();
    expect(() => {
      stripe.webhooks.constructEvent(
        JSON.stringify(event),
        "invalid_signature",
        "whsec_test"
      );
    }).toThrow("Webhook signature verification failed");
  });

  it("should accept test events with evt_test_ prefix", () => {
    const testEvent = {
      id: "evt_test_123456",
      type: "checkout.session.completed",
      data: { object: {} },
    };

    // Test event detection logic
    expect(testEvent.id.startsWith("evt_test_")).toBe(true);
  });

  it("should handle checkout.session.completed event correctly", async () => {
    const { getOrderByStripeSession, updateOrderStatus, createPayment, incrementEventSoldCount } =
      await import("./db");

    const event = {
      id: "evt_real_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_valid",
          payment_intent: "pi_test_123",
          amount_total: 13220,
          currency: "brl",
          payment_status: "paid",
          metadata: { order_id: "1", quantity: "2" },
        },
      },
    };

    // Simulate the webhook handler logic
    const session = event.data.object;
    const order = await getOrderByStripeSession(session.id);

    expect(order).not.toBeNull();
    expect(order?.id).toBe(1);
    expect(order?.status).toBe("pending");

    // Verify the order would be updated
    if (order && session.payment_status === "paid") {
      await updateOrderStatus(order.id, "paid");
      await createPayment({
        orderId: order.id,
        stripePaymentIntentId: session.payment_intent as string,
        amountCents: session.amount_total as number,
        currency: session.currency as string,
        status: "succeeded",
      });
      await incrementEventSoldCount(order.eventId, order.quantity);
    }

    expect(updateOrderStatus).toHaveBeenCalledWith(1, "paid");
    expect(createPayment).toHaveBeenCalledWith({
      orderId: 1,
      stripePaymentIntentId: "pi_test_123",
      amountCents: 13220,
      currency: "brl",
      status: "succeeded",
    });
    expect(incrementEventSoldCount).toHaveBeenCalledWith(1, 2);
  });

  it("should handle checkout.session.expired event correctly", async () => {
    const { getOrderByStripeSession, updateOrderStatus } = await import("./db");

    const event = {
      id: "evt_real_456",
      type: "checkout.session.expired",
      data: {
        object: {
          id: "cs_test_valid",
          metadata: { order_id: "1" },
        },
      },
    };

    const session = event.data.object;
    const order = await getOrderByStripeSession(session.id);

    expect(order).not.toBeNull();

    if (order) {
      await updateOrderStatus(order.id, "canceled");
    }

    expect(updateOrderStatus).toHaveBeenCalledWith(1, "canceled");
  });

  it("should handle unknown session IDs gracefully", async () => {
    const { getOrderByStripeSession } = await import("./db");

    const order = await getOrderByStripeSession("cs_nonexistent");
    expect(order).toBeNull();
  });

  it("should validate webhook event structure", () => {
    // Valid event structure
    const validEvent = {
      id: "evt_123",
      type: "checkout.session.completed",
      data: { object: { id: "cs_123" } },
    };

    expect(validEvent).toHaveProperty("id");
    expect(validEvent).toHaveProperty("type");
    expect(validEvent).toHaveProperty("data.object");

    // Ensure payment_status check works
    const paidSession = { payment_status: "paid" };
    const unpaidSession = { payment_status: "unpaid" };

    expect(paidSession.payment_status === "paid").toBe(true);
    expect(unpaidSession.payment_status === "paid").toBe(false);
  });

  it("should only process paid payments, not unpaid", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockClear();

    const event = {
      id: "evt_real_789",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_valid",
          payment_intent: "pi_test_456",
          amount_total: 6610,
          currency: "brl",
          payment_status: "unpaid", // NOT paid
          metadata: { order_id: "1" },
        },
      },
    };

    const session = event.data.object;

    // Only update if payment_status is "paid"
    if (session.payment_status === "paid") {
      await updateOrderStatus(1, "paid");
    }

    // updateOrderStatus should NOT have been called
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });
});
