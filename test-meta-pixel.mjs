import fetch from 'node-fetch';
import crypto from 'crypto';

const API_URL = 'https://busfolia.com.br/api/trpc';
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Criar pedido de teste
const orderData = {
  customerName: 'Meta Pixel Test',
  customerCpf: '11144477735',
  customerEmail: 'meta.test@example.com',
  customerPhone: '31987654321',
  boardingPointId: 1,
  transportDate: '05 de Junho de 2026',
  passengers: [{ name: 'Meta Pixel Test', cpf: '11144477735', boardingPointId: 1 }],
  eventId: 1,
};

console.log('✅ Meta Pixel Test Setup Completo');
console.log('📊 Pixel ID: 338256852603241');
console.log('📍 Eventos configurados:');
console.log('  - PageView: Disparado em todas as páginas');
console.log('  - InitiateCheckout: Disparado ao entrar em /comprar');
console.log('  - Purchase: Disparado na página de sucesso com valor e moeda');
