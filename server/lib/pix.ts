import QRCode from 'qrcode';

/**
 * PIX Payment Configuration
 */
export const PIX_CONFIG = {
  KEY: 'busfolia@hotmail.com',
  MERCHANT_NAME: 'BusFolia',
  CITY: 'Belo Horizonte',
  EXPIRATION_MINUTES: 5,
};

/**
 * Generate PIX QR Code for a specific order
 * Uses EMV standard for PIX
 */
export async function generatePixQrCode(
  orderId: number,
  shortId: string,
  amountCents: number
): Promise<{ qrCodeDataUrl: string; pixCopyPaste: string }> {
  try {
    // Amount in BRL (convert from cents)
    const amountBRL = (amountCents / 100).toFixed(2);

    // Generate PIX copy-paste code (EMV standard)
    // Format: 00020126580014br.gov.bcb.brcode01051.0.0 + additional fields
    const pixCopyPaste = generatePixEmvCode(
      PIX_CONFIG.KEY,
      PIX_CONFIG.MERCHANT_NAME,
      PIX_CONFIG.CITY,
      amountBRL,
      shortId
    );

    // Generate QR Code from the EMV code
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
 * Generate PIX EMV code (copy-paste version)
 * Based on BC (Banco Central) standard
 */
function generatePixEmvCode(
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

  // Build the EMV structure
  let emv = '';

  // Payload Format Indicator (00)
  emv += tlv('00', '01');

  // Point of Initiation Method (01) - 12 = Static QR Code
  emv += tlv('01', '12');

  // Merchant Account Information (26)
  let merchantInfo = '';
  merchantInfo += tlv('00', '0br.gov.bcb.brcode'); // GUI
  merchantInfo += tlv('01', '01'); // Version
  merchantInfo += tlv('02', pixKey); // PIX Key (email)
  emv += tlv('26', merchantInfo);

  // Merchant Category Code (52) - 5411 = Passenger Transport
  emv += tlv('52', '5411');

  // Transaction Currency (53) - 986 = BRL
  emv += tlv('53', '986');

  // Transaction Amount (54) - only if fixed amount
  if (amount && amount !== '0.00') {
    emv += tlv('54', amount);
  }

  // Country Code (58) - BR
  emv += tlv('58', 'BR');

  // Merchant Name (59)
  emv += tlv('59', merchantName.substring(0, 25));

  // Merchant City (60)
  emv += tlv('60', city.substring(0, 15));

  // Additional Data Field Template (62)
  let additionalData = '';
  additionalData += tlv('05', txId.substring(0, 25)); // Reference Label (Transaction ID)
  emv += tlv('62', additionalData);

  // CRC16 checksum (63)
  const crc = calculateCrc16(emv + '6304');
  emv += `6304${crc}`;

  return emv;
}

/**
 * Calculate CRC16 checksum for PIX EMV code
 */
function calculateCrc16(data: string): string {
  let crc = 0xffff;
  const poly = 0x1021;

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;

    for (let j = 0; j < 8; j++) {
      crc <<= 1;
      if (crc & 0x10000) {
        crc ^= poly;
      }
      crc &= 0xffff;
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
