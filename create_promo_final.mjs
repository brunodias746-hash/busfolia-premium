import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPromoCode() {
  try {
    // Check if BUS15 promotion code already exists
    console.log('Checking if BUS15 promotion code already exists...');
    const existing = await stripe.promotionCodes.list({
      code: 'BUS15',
      limit: 1,
    });
    
    if (existing.data.length > 0) {
      console.log(`✓ BUS15 promotion code already exists: ${existing.data[0].id}`);
      console.log(`✓ Code: ${existing.data[0].code}`);
      console.log(`✓ Active: ${existing.data[0].active}`);
      return;
    }
    
    // Create promotion code for the existing BUS15 coupon
    console.log('Creating promotion code BUS15...');
    const promoCode = await stripe.promotionCodes.create({
      coupon: 'BUS15',  // Use the coupon ID
      code: 'BUS15',
    });
    
    console.log(`✓ Promotion code created: ${promoCode.id}`);
    console.log(`✓ Code: ${promoCode.code}`);
    console.log(`✓ Active: ${promoCode.active}`);
    console.log(`✓ Coupon: ${promoCode.coupon.id}`);
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.raw?.param) console.error('Parameter:', err.raw.param);
  }
}

createPromoCode();
