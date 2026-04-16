import { describe, it, expect } from 'vitest';
import { generatePixQrCode, isPixExpired } from './lib/pix';

describe('PIX Payment System', () => {
  describe('generatePixQrCode', () => {
    it('should generate valid PIX QR code with all required fields', async () => {
      const result = await generatePixQrCode('order-123', 'ABC123', 50000); // R$ 500.00
      
      expect(result).toHaveProperty('qrCodeDataUrl');
      expect(result).toHaveProperty('pixCopyPaste');
      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.pixCopyPaste).toBeTruthy();
      expect(result.pixCopyPaste.length).toBeGreaterThan(100);
    });

    it('should generate different QR codes for different amounts', async () => {
      const result1 = await generatePixQrCode('order-1', 'ABC1', 10000);
      const result2 = await generatePixQrCode('order-2', 'ABC2', 20000);
      
      expect(result1.pixCopyPaste).not.toBe(result2.pixCopyPaste);
    });

    it('should generate different QR codes for different order IDs', async () => {
      const result1 = await generatePixQrCode('order-1', 'ABC1', 50000);
      const result2 = await generatePixQrCode('order-2', 'ABC2', 50000);
      
      expect(result1.pixCopyPaste).not.toBe(result2.pixCopyPaste);
    });

    it('should handle minimum amount (R$ 0.01)', async () => {
      const result = await generatePixQrCode('order-min', 'MIN1', 1);
      
      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.pixCopyPaste).toBeTruthy();
    });

    it('should handle large amounts', async () => {
      const result = await generatePixQrCode('order-large', 'LARGE1', 999999999); // R$ 9,999,999.99
      
      expect(result.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.pixCopyPaste).toBeTruthy();
    });
  });

  describe('isPixExpired', () => {
    it('should return false for recent dates', () => {
      const now = new Date();
      const isExpired = isPixExpired(now);
      
      expect(isExpired).toBe(false);
    });

    it('should return false for dates less than 5 minutes old', () => {
      const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);
      const isExpired = isPixExpired(fourMinutesAgo);
      
      expect(isExpired).toBe(false);
    });

    it('should return true for dates more than 5 minutes old', () => {
      const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
      const isExpired = isPixExpired(sixMinutesAgo);
      
      expect(isExpired).toBe(true);
    });

    it('should return false for dates exactly 5 minutes old', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isExpired = isPixExpired(fiveMinutesAgo);
      
      expect(isExpired).toBe(false);
    });

    it('should return true for dates more than 5 minutes old', () => {
      const fiveMinutesOneSecondAgo = new Date(Date.now() - (5 * 60 + 1) * 1000);
      const isExpired = isPixExpired(fiveMinutesOneSecondAgo);
      
      expect(isExpired).toBe(true);
    });
  });

  describe('PIX Code Format', () => {
    it('should generate EMV-compliant PIX code', async () => {
      const result = await generatePixQrCode('order-emv', 'EMV1', 50000);
      const pixCode = result.pixCopyPaste;
      
      // EMV PIX codes start with "000201"
      expect(pixCode).toMatch(/^000201/);
    });

    it('should include merchant account field (26)', async () => {
      const result = await generatePixQrCode('order-merchant', 'MERCH1', 50000);
      const pixCode = result.pixCopyPaste;
      
      // Field 26 contains merchant account info
      expect(pixCode).toContain('26');
    });

    it('should include amount field (54)', async () => {
      const result = await generatePixQrCode('order-amount', 'AMT1', 50000);
      const pixCode = result.pixCopyPaste;
      
      // Field 54 contains the amount
      expect(pixCode).toContain('54');
    });

    it('should include CRC checksum (63)', async () => {
      const result = await generatePixQrCode('order-crc', 'CRC1', 50000);
      const pixCode = result.pixCopyPaste;
      
      // Field 63 contains CRC16 checksum
      expect(pixCode).toMatch(/63[0-9A-F]{4}/);
    });
  });
});
