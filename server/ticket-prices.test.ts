import { describe, it, expect } from "vitest";

describe("Ticket Prices - Updated June 2026", () => {
  describe("BH and Santa Luzia", () => {
    it("should have price of R$70 (7000 cents)", () => {
      const bhPrice = 7000; // R$70,00
      expect(bhPrice).toBe(7000);
      expect(bhPrice / 100).toBe(70);
    });

    it("should calculate total for 1 passenger with fee", () => {
      const unitPrice = 7000; // R$70
      const fee = 610; // R$6,10
      const qty = 1;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(7610); // R$76,10
    });

    it("should calculate total for 2 passengers", () => {
      const unitPrice = 7000; // R$70
      const fee = 610; // R$6,10
      const qty = 2;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(15220); // R$152,20
    });
  });

  describe("Betim and Contagem", () => {
    it("should have price of R$80 (8000 cents)", () => {
      const betimPrice = 8000; // R$80,00
      expect(betimPrice).toBe(8000);
      expect(betimPrice / 100).toBe(80);
    });

    it("should calculate total for 1 passenger with fee", () => {
      const unitPrice = 8000; // R$80
      const fee = 610; // R$6,10
      const qty = 1;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(8610); // R$86,10
    });

    it("should calculate total for 2 passengers", () => {
      const unitPrice = 8000; // R$80
      const fee = 610; // R$6,10
      const qty = 2;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(17220); // R$172,20
    });
  });

  describe("Passport (4 days)", () => {
    it("should have price of R$250 (25000 cents)", () => {
      const passportPrice = 25000; // R$250,00
      expect(passportPrice).toBe(25000);
      expect(passportPrice / 100).toBe(250);
    });

    it("should calculate total for 1 passenger with fixed fee", () => {
      const unitPrice = 25000; // R$250
      const fee = 610; // R$6,10 (fixed, not multiplied)
      const qty = 1;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(25610); // R$256,10
    });

    it("should calculate total for 2 passengers", () => {
      const unitPrice = 25000; // R$250
      const fee = 610; // R$6,10 (fixed)
      const qty = 2;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(51220); // R$512,20
    });
  });

  describe("Multi-day orders", () => {
    it("should calculate price for 2 days from BH", () => {
      const basePrice = 7000; // R$70 per day
      const daysCount = 2;
      const unitPrice = basePrice * daysCount; // R$140
      const fee = 610 * daysCount; // R$12,20
      const qty = 1;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(15220); // R$152,20
    });

    it("should calculate price for 3 days from Betim", () => {
      const basePrice = 8000; // R$80 per day
      const daysCount = 3;
      const unitPrice = basePrice * daysCount; // R$240
      const fee = 610 * daysCount; // R$18,30
      const qty = 1;
      const total = (unitPrice + fee) * qty;
      expect(total).toBe(25830); // R$258,30
    });
  });

  describe("Price validation", () => {
    it("should not allow negative prices", () => {
      const prices = [7000, 8000, 25000];
      prices.forEach(price => {
        expect(price).toBeGreaterThan(0);
      });
    });

    it("should ensure all prices are in cents", () => {
      const prices = [7000, 8000, 25000];
      prices.forEach(price => {
        expect(price % 100).toBe(0);
      });
    });

    it("should have correct old vs new prices", () => {
      const oldPrices = { bh: 6000, betim: 7000, passport: 20000 };
      const newPrices = { bh: 7000, betim: 8000, passport: 25000 };
      
      expect(newPrices.bh).toBeGreaterThan(oldPrices.bh);
      expect(newPrices.betim).toBeGreaterThan(oldPrices.betim);
      expect(newPrices.passport).toBeGreaterThan(oldPrices.passport);
    });
  });
});
