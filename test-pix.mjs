import QRCode from 'qrcode';

async function testPixGeneration() {
  try {
    console.log('Testing PIX QR code generation...');
    
    // Test data
    const pixKey = 'busfolia@hotmail.com';
    const merchantName = 'Bruno Henrique do Carmo D';
    const city = 'SAO PAULO';
    const amount = '100.00';
    
    // Generate simple BR Code
    const brCode = `00020126580014br.gov.bcb.brcode01051.0.0520876051.0053047576005201480014br.gov.bcb.dict0136busfolia@hotmail.com52040000530398654061100.005802BR5913BRUNO HENRIQUE6009SAO PAULO62410503***63041D3D`;
    
    console.log('BR Code:', brCode);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(brCode, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    console.log('✅ QR Code generated successfully');
    console.log('Data URL length:', qrCodeDataUrl.length);
    console.log('Data URL prefix:', qrCodeDataUrl.substring(0, 50));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPixGeneration();
