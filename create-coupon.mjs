import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCoupon() {
  try {
    const coupon = await stripe.coupons.create({
      id: 'BUS15',
      percent_off: 15,
      duration: 'repeating',
      duration_in_months: 12,
    });
    console.log('✅ Cupom criado com sucesso:', coupon);
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('ℹ️ Cupom BUS15 já existe');
      const existing = await stripe.coupons.retrieve('BUS15');
      console.log('Detalhes:', existing);
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

createCoupon();
