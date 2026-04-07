import crypto from 'crypto';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_URL = 'https://busfolia.com.br/api/webhooks/stripe';

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('ERROR: STRIPE_WEBHOOK_SECRET not set');
  process.exit(1);
}

console.log('\n=== TESTE 2: MÚLTIPLOS DIAS ===\n');

// TESTE 2: Múltiplos dias (3 dias x R$ 6,00 = R$ 18,00 + taxa)
const event = {
  id: 'evt_1234567891',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_a1KMN72X_multiple',
      object: 'checkout.session',
      payment_intent: 'pi_1234567891',
      payment_method_types: ['card'],
      amount_total: 2118,
      client_reference_id: '30002',
      customer_email: 'maria.silva.teste@gmail.com',
    }
  }
};

const payload = JSON.stringify(event);
const timestamp = Math.floor(Date.now() / 1000);
const signedContent = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
  .update(signedContent)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('Testing webhook with real signature...');
console.log('URL:', WEBHOOK_URL);
console.log('Session ID:', event.data.object.id);
console.log('Amount:', event.data.object.amount_total, 'centavos (R$', (event.data.object.amount_total / 100).toFixed(2), ')');

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
  },
  body: payload,
};

console.log('\nSending request to:', WEBHOOK_URL);

fetch(WEBHOOK_URL, options)
  .then(res => {
    console.log('\nResponse status:', res.status);
    return res.text();
  })
  .then(data => {
    console.log('Response:', data);
    console.log('\n✅ TESTE 2 ENVIADO COM SUCESSO');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
