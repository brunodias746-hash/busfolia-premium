import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPromoCode() {
  try {
    // Check if BUS15 already exists
    console.log('Checking if BUS15 already exists...');
    const existing = await stripe.promotionCodes.list({
      code: 'BUS15',
      limit: 1,
    });
    
    if (existing.data.length > 0) {
      console.log(`✓ BUS15 already exists: ${existing.data[0].id}`);
      return;
    }
    
    // First, create a coupon with 15% discount
    console.log('Creating coupon with 15% discount...');
    const coupon = await stripe.coupons.create({
      percent_off: 15,
      duration: 'repeating',
      duration_in_months: 12,
    });
    console.log(`✓ Coupon created: ${coupon.id}`);
    
    // Then create a promotion code for this coupon
    console.log('Creating promotion code BUS15...');
    const promoCode = await stripe.promotionCodes.create({
      code: 'BUS15',
      coupon: coupon.id,
    });
    console.log(`✓ Promotion code created: ${promoCode.id}`);
    console.log(`✓ Code: ${promoCode.code}`);
    console.log(`✓ Active: ${promoCode.active}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createPromoCode();
