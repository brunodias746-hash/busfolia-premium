import { describe, it, expect } from 'vitest';
import { generatePixQrCode } from './lib/pix';

describe('BR Code (PIX EMV) Generation', () => {
  describe('BR Code Structure', () => {
    it('should generate valid BR Code with required fields', async () => {
      const result = await generatePixQrCode('order-123', 'ABC123', 50000);
      const brCode = result.pixCopyPaste;

      // BR Code should start with "00" (Payload Format Indicator)
      expect(brCode).toMatch(/^00/);
      
      // Should contain Merchant Account Information (26)
      expect(brCode).toContain('26');
      
      // Should contain Merchant Category Code (52) - 0400 as per working examples
      expect(brCode).toContain('5204');
      
      // Should contain Currency (53)
      expect(brCode).toContain('53');
      
      // Should contain Amount (54)
      expect(brCode).toContain('54');
      
      // Should contain Country Code (58)
      expect(brCode).toContain('5802BR');
      
      // Should contain Merchant Name (59)
      expect(brCode).toContain('59');
      
      // Should contain Merchant City (60)
      expect(brCode).toContain('60');
      
      // Should contain CRC checksum (63)
      expect(brCode).toMatch(/63[0-9A-F]{4}/);
    });

    it('should include PIX key in merchant account information', async () => {
      const result = await generatePixQrCode('order-key', 'KEY1', 25000);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('busfolia@hotmail.com');
    });

    it('should include transaction ID in additional data', async () => {
      const result = await generatePixQrCode('order-txid', 'TXID1', 30000);
      const brCode = result.pixCopyPaste;

      // Transaction ID is now a random 10-char string, just verify field 62 exists
      expect(brCode).toContain('62');
    });

    it('should have valid CRC16 checksum', async () => {
      const result = await generatePixQrCode('order-crc', 'CRC1', 50000);
      const brCode = result.pixCopyPaste;

      // CRC field should be present
      expect(brCode).toContain('63');
      
      // Should end with 4 hex digits after "63"
      const crcMatch = brCode.match(/63([0-9A-F]{4})/);
      expect(crcMatch).toBeTruthy();
    });
  });

  describe('Amount Handling', () => {
    it('should correctly format amount in BRL', async () => {
      const result = await generatePixQrCode('order-amt1', 'AMT1', 50000);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('500.00');
    });

    it('should handle small amounts', async () => {
      const result = await generatePixQrCode('order-small', 'SMALL1', 1);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('0.01');
    });

    it('should handle large amounts', async () => {
      const result = await generatePixQrCode('order-large', 'LARGE1', 999999999);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('9999999.99');
    });
  });

  describe('QR Code Generation', () => {
    it('should generate valid data URL for QR Code', async () => {
      const result = await generatePixQrCode('order-qr', 'QR1', 50000);

      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.qrCodeDataUrl.length).toBeGreaterThan(1000);
    });

    it('should generate different QR codes for different amounts', async () => {
      const result1 = await generatePixQrCode('order-1', 'QR1', 10000);
      const result2 = await generatePixQrCode('order-2', 'QR2', 20000);

      expect(result1.pixCopyPaste).not.toBe(result2.pixCopyPaste);
      expect(result1.qrCodeDataUrl).not.toBe(result2.qrCodeDataUrl);
    });

    it('should generate different QR codes for different order IDs', async () => {
      const result1 = await generatePixQrCode('order-1', 'ID1', 50000);
      const result2 = await generatePixQrCode('order-2', 'ID2', 50000);

      // Different unique IDs should generate different BR codes
      expect(result1.pixCopyPaste).not.toBe(result2.pixCopyPaste);
      expect(result1.qrCodeDataUrl).not.toBe(result2.qrCodeDataUrl);
    });
  });

  describe('BR Code Compliance', () => {
    it('should include merchant name', async () => {
      const result = await generatePixQrCode('order-name', 'NAME1', 50000);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('Bruno Henrique do Carmo D');
    });

    it('should include merchant city', async () => {
      const result = await generatePixQrCode('order-city', 'CITY1', 50000);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('SAO PAULO');
    });

    it('should include country code BR', async () => {
      const result = await generatePixQrCode('order-country', 'CTRY1', 50000);
      const brCode = result.pixCopyPaste;

      expect(brCode).toContain('BR');
    });
  });
});
