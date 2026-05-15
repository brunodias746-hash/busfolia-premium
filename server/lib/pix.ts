/**
 * PIX Manual - QR Code Fixo
 * Sempre gera QR Code apontando para busfolia@hotmail.com
 */
import QRCode from "qrcode";

// Código PIX fixo
const PIX_CODE_FIXO = "00020126420014BR.GOV.BCB.PIX0120busfolia@hotmail.com5204000053039865802BR5925Bruno Henrique do Carmo D6009SAO PAULO62140510ZG3eezByLq6304F518";

/**
 * Gera QR Code do PIX fixo
 */
export async function generatePixQrCode(
  orderId: number,
  shortId: string,
  amountCents: number
): Promise<{ qrCodeDataUrl: string; pixCopyPaste: string }> {
  try {
    console.log(`[PIX FIXO] Gerando QR Code para pedido ${shortId} - Valor: R$ ${(amountCents / 100).toFixed(2)}`);
    
    const qrCodeDataUrl = await QRCode.toDataURL(PIX_CODE_FIXO, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    console.log(`[PIX FIXO] QR Code gerado com sucesso`);

    return {
      qrCodeDataUrl,
      pixCopyPaste: PIX_CODE_FIXO,
    };
  } catch (error) {
    console.error("[PIX FIXO] Erro ao gerar QR Code:", error);
    throw new Error("Erro ao gerar QR Code PIX");
  }
}

export function isValidPixCode(pixCode: string): boolean {
  return pixCode.startsWith("00020126") && pixCode.length > 50;
}
