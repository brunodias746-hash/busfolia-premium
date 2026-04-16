import QRCode from 'qrcode';

/**
 * PIX Payment Configuration
 */
export const PIX_CONFIG = {
  KEY: 'busfolia@hotmail.com',
  MERCHANT_NAME: 'BusFolia',
  CITY: 'Belo Horizonte',
  COUNTRY_CODE: 'BR',
  MERCHANT_CATEGORY: '5411', // Passenger Transport
  CURRENCY: '986', // BRL
  EXPIRATION_MINUTES: 5,
};

/**
 * Generate PIX QR Code for a specific order
 * Uses correct EMV standard for PIX BR Code (Static with fixed amount)
 */
export async function generatePixQrCode(
  orderId: number,
  shortId: string,
  amountCents: number
): Promise<{ qrCodeDataUrl: string; pixCopyPaste: string }> {
  try {
    // Amount in BRL (convert from cents)
    const amountBRL = (amountCents / 100).toFixed(2);

    // Generate PIX copy-paste code (EMV BR Code standard - STATIC with fixed amount)
    const pixCopyPaste = generateBrCode(
      PIX_CONFIG.KEY,
      PIX_CONFIG.MERCHANT_NAME,
      PIX_CONFIG.CITY,
      amountBRL,
      shortId
    );

    // Generate QR Code from the BR Code
    const qrCodeDataUrl = await QRCode.toDataURL(pixCopyPaste, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      qrCodeDataUrl,
      pixCopyPaste,
    };
  } catch (error) {
    console.error('[PIX] Error generating QR code:', error);
    throw new Error('Erro ao gerar código PIX');
  }
}

/**
 * Generate BR Code (PIX EMV code) according to Banco Central specification
 * Uses STATIC QR Code format (01=12) with fixed amount
 * This is the correct format for immediate payment with specified amount
 * Reference: https://www.bcb.gov.br/content/dam/Microsites/Pix/Regulamentacao_Pix/Especificacao_QRCode.pdf
 */
function generateBrCode(
  pixKey: string,
  merchantName: string,
  city: string,
  amount: string,
  txId: string
): string {
  // Helper function to create TLV (Tag-Length-Value) format
  const tlv = (tag: string, value: string): string => {
    const length = value.length.toString().padStart(2, '0');
    return `${tag}${length}${value}`;
  };

  // Helper to create nested TLV
  const nestedTlv = (tag: string, fields: string): string => {
    const length = fields.length.toString().padStart(2, '0');
    return `${tag}${length}${fields}`;
  };

  let brCode = '';

  // 00 - Payload Format Indicator (mandatory, always "01")
  brCode += tlv('00', '01');

  // 01 - Point of Initiation Method (12 = Static QR Code with fixed amount)
  // This is the key fix: use 12 for static with amount, not 11 for dynamic
  brCode += tlv('01', '12');

  // 26 - Merchant Account Information (PIX Key)
  let merchantInfo = '';
  merchantInfo += tlv('00', '0br.gov.bcb.brcode'); // GUI (Global Unique Identifier)
  merchantInfo += tlv('01', '01'); // Version
  merchantInfo += tlv('02', pixKey); // PIX Key (email, CPF, phone, etc)
  brCode += nestedTlv('26', merchantInfo);

  // 52 - Merchant Category Code (5411 = Passenger Transport)
  brCode += tlv('52', PIX_CONFIG.MERCHANT_CATEGORY);

  // 53 - Transaction Currency (986 = BRL)
  brCode += tlv('53', PIX_CONFIG.CURRENCY);

  // 54 - Transaction Amount (MANDATORY for static QR code)
  if (amount && amount !== '0.00') {
    brCode += tlv('54', amount);
  }

  // 58 - Country Code (BR)
  brCode += tlv('58', PIX_CONFIG.COUNTRY_CODE);

  // 59 - Merchant Name (max 25 chars)
  brCode += tlv('59', merchantName.substring(0, 25));

  // 60 - Merchant City (max 15 chars)
  brCode += tlv('60', city.substring(0, 15));

  // 62 - Additional Data Field Template
  let additionalData = '';
  // 05 - Reference Label (Transaction ID, max 25 chars)
  additionalData += tlv('05', txId.substring(0, 25));
  brCode += nestedTlv('62', additionalData);

  // 63 - CRC16 checksum (mandatory, calculated over entire code including this field)
  // The CRC field itself is "6304" + 4-digit hex checksum
  const crc = calculateCrc16CCITT(brCode + '6304');
  brCode += `6304${crc}`;

  return brCode;
}

/**
 * Calculate CRC16-CCITT checksum for BR Code
 * This is the correct algorithm used by Banco Central
 * Using polynomial 0x1021 with initial value 0xFFFF
 */
function calculateCrc16CCITT(data: string): string {
  let crc = 0xffff;
  const poly = 0x1021;

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= (byte << 8);

    for (let j = 0; j < 8; j++) {
      crc = crc << 1;
      if (crc & 0x10000) {
        crc = (crc ^ poly) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generate PIX expiration time (5 minutes from now)
 */
export function getPixExpirationTime(): Date {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + PIX_CONFIG.EXPIRATION_MINUTES);
  return expirationTime;
}

/**
 * Check if PIX payment has expired
 */
export function isPixExpired(createdAt: Date): boolean {
  const now = new Date();
  const expirationTime = new Date(createdAt);
  expirationTime.setMinutes(expirationTime.getMinutes() + PIX_CONFIG.EXPIRATION_MINUTES);
  return now > expirationTime;
}
