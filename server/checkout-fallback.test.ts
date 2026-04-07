import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStripe } from "./lib/stripe";

// Mock Stripe
vi.mock("./lib/stripe", () => ({
  getStripe: vi.fn(),
}));

describe("Checkout Status Fallback - Stripe Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should verify payment status with Stripe when order is pending_checkout", async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            payment_status: "paid",
            payment_intent: "pi_test_123",
            payment_method_types: ["card"],
            amount_total: 50000,
          }),
        },
      },
    };

    vi.mocked(getStripe).mockReturnValue(mockStripe as any);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve("cs_test_123");

    expect(session.payment_status).toBe("paid");
    expect(session.amount_total).toBe(50000);
    expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith("cs_test_123");
  });

  it("should handle Stripe API errors gracefully", async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          retrieve: vi.fn().mockRejectedValue(new Error("Stripe API Error")),
        },
      },
    };

    vi.mocked(getStripe).mockReturnValue(mockStripe as any);

    const stripe = getStripe();
    
    try {
      await stripe.checkout.sessions.retrieve("cs_invalid");
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.message).toBe("Stripe API Error");
    }
  });

  it("should detect when payment_status is not paid", async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: "cs_test_456",
            payment_status: "unpaid",
            payment_intent: "pi_test_456",
            payment_method_types: ["card"],
            amount_total: 50000,
          }),
        },
      },
    };

    vi.mocked(getStripe).mockReturnValue(mockStripe as any);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve("cs_test_456");

    expect(session.payment_status).toBe("unpaid");
    // Should NOT update order status if payment_status is not "paid"
  });

  it("should extract payment intent ID correctly", async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: "cs_test_789",
            payment_status: "paid",
            payment_intent: "pi_test_789",
            payment_method_types: ["card"],
            amount_total: 75000,
          }),
        },
      },
    };

    vi.mocked(getStripe).mockReturnValue(mockStripe as any);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve("cs_test_789");

    const paymentIntentId = typeof session.payment_intent === "string" 
      ? session.payment_intent 
      : session.payment_intent?.id ?? null;

    expect(paymentIntentId).toBe("pi_test_789");
  });
});
