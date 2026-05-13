import fetch from 'node-fetch';

async function testCheckout() {
  try {
    console.log('Testing PIX checkout API...');
    
    const response = await fetch('http://localhost:3000/api/trpc/checkout.createAsaasCheckout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          eventId: 1,
          ticketType: 'single_day',
          dates: ['05 de Junho de 2026'],
          boardingPointId: 1,
          customerName: 'Test User',
          customerCpf: '12345678901',
          customerEmail: 'test@example.com',
          customerPhone: '11999999999',
          passengers: [
            {
              name: 'Test Passenger',
              cpf: '98765432100'
            }
          ],
          paymentMethod: 'pix'
        }
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCheckout();
