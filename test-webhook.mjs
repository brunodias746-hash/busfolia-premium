import crypto from 'crypto';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_URL = 'https://busfolia.com.br/api/webhooks/stripe';

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('ERROR: STRIPE_WEBHOOK_SECRET not set');
  process.exit(1);
}

// Create a valid webhook event payload
const event = {
  id: 'evt_1234567890',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_a1IMTkrPRtPlR1C7svKBjp94Y37jPMFbKPNCcPgLMwdSXRqdZZd2to8WFa',
      object: 'checkout.session',
      payment_intent: 'pi_1234567890',
      payment_method_types: ['card'],
      amount_total: 6610, // R$ 66,10 em centavos
      client_reference_id: '30003',
      customer_email: 'ana.paula.teste@gmail.com',
    }
  }
};

// Serialize the event
const payload = JSON.stringify(event);

// Create the signature
const timestamp = Math.floor(Date.now() / 1000);
const signedContent = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
  .update(signedContent)
  .digest('hex');

console.log('STRIPE_WEBHOOK_SECRET length:', STRIPE_WEBHOOK_SECRET.length);

const stripeSignature = `t=${timestamp},v1=${signature}`;

// Log for debugging
console.log('Payload:', payload);
console.log('Signed content:', signedContent.substring(0, 100) + '...');

console.log('Testing webhook with real signature...');
console.log('URL:', WEBHOOK_URL);
console.log('Timestamp:', timestamp);
console.log('Signature:', stripeSignature.substring(0, 50) + '...');

// Send the webhook
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
  },
  body: payload,
};

console.log('Sending request to:', WEBHOOK_URL);
console.log('Headers:', options.headers);

fetch(WEBHOOK_URL, options)
  .then(res => {
    console.log('Response status:', res.status);
    return res.text();
  })
  .then(data => {
    console.log('Response:', data);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
