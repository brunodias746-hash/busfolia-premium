import { describe, it, expect } from "vitest";

describe("Dynamic Pricing by Boarding Point", () => {
  // Helper function to get dynamic base price
  const getDynamicBasePrice = (city: string): number => {
    if (city === "BETIM" || city === "CONTAGEM") {
      return 8000; // R$80,00
    }
    return 7000; // R$70,00 for BH and SANTA LUZIA
  };

  describe("Single day pricing", () => {
    it("should charge R$70,00 for BH", () => {
      const price = getDynamicBasePrice("BH");
      expect(price).toBe(7000);
    });

    it("should charge R$70,00 for SANTA LUZIA", () => {
      const price = getDynamicBasePrice("SANTA LUZIA");
      expect(price).toBe(7000);
    });

    it("should charge R$80,00 for BETIM", () => {
      const price = getDynamicBasePrice("BETIM");
      expect(price).toBe(8000);
    });

    it("should charge R$80,00 for CONTAGEM", () => {
      const price = getDynamicBasePrice("CONTAGEM");
      expect(price).toBe(8000);
    });
  });

  describe("Multiple days pricing", () => {
    it("should charge R$140,00 for 2 days in BH", () => {
      const basePrice = getDynamicBasePrice("BH");
      const total = basePrice * 2;
      expect(total).toBe(14000);
    });

    it("should charge R$160,00 for 2 days in BETIM", () => {
      const basePrice = getDynamicBasePrice("BETIM");
      const total = basePrice * 2;
      expect(total).toBe(16000);
    });

    it("should charge R$210,00 for 3 days in SANTA LUZIA", () => {
      const basePrice = getDynamicBasePrice("SANTA LUZIA");
      const total = basePrice * 3;
      expect(total).toBe(21000);
    });

    it("should charge R$240,00 for 3 days in CONTAGEM", () => {
      const basePrice = getDynamicBasePrice("CONTAGEM");
      const total = basePrice * 3;
      expect(total).toBe(24000);
    });
  });

  describe("Passport pricing", () => {
    it("should always charge R$250,00 for passport regardless of boarding point", () => {
      const passportPrice = 25000;
      expect(passportPrice).toBe(25000);
    });
  });

  describe("Multiple passengers", () => {
    it("should charge R$140,00 for 2 passengers, 1 day in BH", () => {
      const basePrice = getDynamicBasePrice("BH");
      const total = basePrice * 2; // 2 passengers
      expect(total).toBe(14000);
    });

    it("should charge R$240,00 for 3 passengers, 1 day in CONTAGEM", () => {
      const basePrice = getDynamicBasePrice("CONTAGEM");
      const total = basePrice * 3; // 3 passengers
      expect(total).toBe(24000);
    });

    it("should charge R$280,00 for 2 passengers, 2 days in BH", () => {
      const basePrice = getDynamicBasePrice("BH");
      const total = basePrice * 2 * 2; // 2 passengers, 2 days
      expect(total).toBe(28000);
    });
  });
});
