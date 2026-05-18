/**
 * PIX FIXO V3 - Versão definitiva (Force cache bypass)
 * Build: 2026-05-18-v3-CACHE-BYPASS-FORCE-REBUILD
 * 
 * Gera QR Code apontando para o PIX fixo busfolia@hotmail.com
 * Usa o código copia-e-cola PIX estático fornecido pelo cliente
 */
import QRCode from 'qrcode';

// CÓDIGO PIX FIXO ESTÁTICO - Aponta sempre para busfolia@hotmail.com
// Valor é digitado manualmente pelo cliente no app bancário
const PIX_CODE_FIXO_BUSFOLIA = "00020126420014BR.GOV.BCB.PIX0120busfolia@hotmail.com5204000053039865802BR5925Bruno Henrique do Carmo D6009SAO PAULO62140510ZG3eezByLq6304F518";

export const PIX_CONFIG = {
  KEY: 'busfolia@hotmail.com',
  MERCHANT_NAME: 'Bruno Henrique do Carmo D',
  CITY: 'SAO PAULO',
  COUNTRY_CODE: 'BR',
  MERCHANT_CATEGORY: '0400',
  CURRENCY: '986',
  EXPIRATION_MINUTES: 30,
};

/**
 * Gera QR Code do PIX FIXO
 * IMPORTANTE: O QR Code sempre aponta para busfolia@hotmail.com
 * O cliente DIGITA O VALOR MANUALMENTE no app bancário
 */
export async function generatePixQrCode(
  orderId: number,
  shortId: string,
  amountCents: number
): Promise<{ qrCodeDataUrl: string; pixCopyPaste: string }> {
  try {
    console.log(`[PIX FIXO V3] Gerando QR Code para pedido ${shortId} - Valor: R$ ${(amountCents / 100).toFixed(2)}`);
    
    const qrCodeDataUrl = await QRCode.toDataURL(PIX_CODE_FIXO_BUSFOLIA, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log(`[PIX FIXO V3] QR Code gerado com sucesso para busfolia@hotmail.com`);

    return {
      qrCodeDataUrl,
      pixCopyPaste: PIX_CODE_FIXO_BUSFOLIA,
    };
  } catch (error) {
    console.error('[PIX FIXO V3] Erro ao gerar QR Code:', error);
    throw new Error('Erro ao gerar código PIX');
  }
}

export function getPixExpirationTime(): Date {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + PIX_CONFIG.EXPIRATION_MINUTES);
  return expirationTime;
}

export function isPixExpired(createdAt: Date): boolean {
  const now = new Date();
  const expirationTime = new Date(createdAt);
  expirationTime.setMinutes(expirationTime.getMinutes() + PIX_CONFIG.EXPIRATION_MINUTES);
  return now > expirationTime;
}
