/**
 * Manual PIX Payment Configuration
 * Using exact working PIX codes provided by user
 */

export interface ManualPixData {
  amount: number; // in BRL
  pixCode: string; // The exact PIX Copia e Cola code
  description: string; // Display description
}

/**
 * Get manual PIX payment data based on amount
 * Uses exact working PIX codes provided by user
 */
export function getManualPixData(amountBRL: number): ManualPixData {
  // Round to nearest 10 cents to match the provided codes
  const roundedAmount = Math.round(amountBRL * 10) / 10;

  // Map amounts to exact working PIX codes
  const pixCodes: Record<number, string> = {
    60.0: '00020126420014BR.GOV.BCB.PIX0120busfolia@hotmail.com520400005303986540560.005802BR5925Bruno Henrique do Carmo D6009SAO PAULO62140510eNMid5GzMz630452F0',
    70.0: '00020126420014BR.GOV.BCB.PIX0120busfolia@hotmail.com520400005303986540570.005802BR5925Bruno Henrique do Carmo D6009SAO PAULO62140510HSq7zElPGL6304703F',
    200.0: '00020126420014BR.GOV.BCB.PIX0120busfolia@hotmail.com5204000053039865406200.005802BR5925Bruno Henrique do Carmo D6009SAO PAULO62140510c6l8sYydLG63045FBE',
  };

  const pixCode = pixCodes[roundedAmount];
  if (!pixCode) {
    throw new Error(`Valor PIX não suportado: R$ ${amountBRL.toFixed(2)}`);
  }

  return {
    amount: roundedAmount,
    pixCode,
    description: `Pagamento de R$ ${roundedAmount.toFixed(2)}`,
  };
}

/**
 * Calculate PIX amount based on boarding point and purchase type
 */
export function calculatePixAmount(
  boardingPoint: string,
  purchaseType: 'single_day' | 'multiple_days' | 'passport',
  numberOfDays: number = 1,
  numberOfPassengers: number = 1
): number {
  // Determine base price per day based on boarding point
  let pricePerDay = 0;
  const boardingPointLower = boardingPoint.toLowerCase();

  if (boardingPointLower.includes('belo') || boardingPointLower.includes('santa')) {
    pricePerDay = 60;
  } else if (boardingPointLower.includes('betim') || boardingPointLower.includes('contagem')) {
    pricePerDay = 70;
  } else {
    // Default to 60 if not recognized
    pricePerDay = 60;
  }

  // Calculate total based on purchase type
  if (purchaseType === 'passport') {
    return 200; // Fixed price for passport
  } else if (purchaseType === 'single_day') {
    return pricePerDay * numberOfPassengers;
  } else if (purchaseType === 'multiple_days') {
    return pricePerDay * numberOfDays * numberOfPassengers;
  }

  return pricePerDay;
}

/**
 * WhatsApp contact information
 */
export const WHATSAPP_CONTACT = {
  number: '5531990908399',
  url: 'https://wa.me/5531990908399',
  message: 'Olá! Envio o comprovante de pagamento PIX da minha compra de passagens.',
};
