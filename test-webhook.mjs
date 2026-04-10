import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");

// Create a test event
const testEvent = {
  type: "checkout.session.completed",
  id: "evt_test_12345",
  data: {
    object: {
      id: "cs_test_12345",
      payment_status: "paid",
      amount_total: 20610,
      payment_method_types: ["card"],
    },
  },
};

// Convert to JSON string
const payload = JSON.stringify(testEvent);

// Create a fake signature (for test events, Stripe doesn't validate strictly)
const signature = "t=1234567890,v1=test_signature";

try {
  const response = await fetch("http://localhost:3001/api/stripe/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const result = await response.json();
  console.log("✅ Webhook Response:");
  console.log(JSON.stringify(result, null, 2));
  
  if (result.verified) {
    console.log("\n✅ SUCCESS: Webhook returned valid JSON with verified: true");
  } else {
    console.log("\n❌ FAILED: Webhook did not verify");
  }
} catch (error) {
  console.error("❌ Error testing webhook:", error.message);
}
