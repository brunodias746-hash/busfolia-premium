import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testCoupon() {
  try {
    console.log('Searching for promotion code BUS15...');
    const promos = await stripe.promotionCodes.list({
      code: 'BUS15',
      limit: 10,
    });
    
    console.log('Found promotion codes:', promos.data.length);
    promos.data.forEach(p => {
      console.log(`- Code: ${p.code}, Active: ${p.active}, ID: ${p.id}`);
    });
    
    if (promos.data.length === 0) {
      console.log('\nNo promotion codes found. Listing all promotion codes:');
      const allPromos = await stripe.promotionCodes.list({ limit: 100 });
      allPromos.data.forEach(p => {
        console.log(`- Code: ${p.code}, Active: ${p.active}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCoupon();
