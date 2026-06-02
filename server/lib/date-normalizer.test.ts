import { describe, it, expect } from "vitest";
import { normalizeDateString, formatDateToPortuguese } from "./date-normalizer";

describe("Date Normalizer", () => {
  describe("normalizeDateString", () => {
    it("should normalize ISO format dates", () => {
      const result = normalizeDateString("2026-06-05");
      expect(result).toBe("2026-06-05");
    });

    it("should normalize Brazilian format dates", () => {
      const result = normalizeDateString("05/06/2026");
      expect(result).toBe("2026-06-05");
    });

    it("should normalize full Portuguese format dates", () => {
      const result = normalizeDateString("05 de junho de 2026");
      expect(result).toBe("2026-06-05");
    });

    it("should normalize short Portuguese format dates (without year)", () => {
      const result = normalizeDateString("12 Junho");
      expect(result).toBe("2026-06-12");
    });

    it("should normalize short Portuguese format dates (lowercase)", () => {
      const result = normalizeDateString("12 junho");
      expect(result).toBe("2026-06-12");
    });

    it("should handle single-digit days", () => {
      const result = normalizeDateString("5 junho");
      expect(result).toBe("2026-06-05");
    });

    it("should reject dates with invalid year (2001)", () => {
      const result = normalizeDateString("05/06/2001");
      expect(result).toBe("2026-06-05"); // Should normalize to 2026
    });

    it("should reject dates with invalid year (too far in future)", () => {
      const result = normalizeDateString("05/06/2050");
      expect(result).toBe("2026-06-05"); // Should normalize to 2026
    });

    it("should return null for invalid date strings", () => {
      const result = normalizeDateString("invalid");
      expect(result).toBeNull();
    });

    it("should return null for empty strings", () => {
      const result = normalizeDateString("");
      expect(result).toBeNull();
    });
  });

  describe("formatDateToPortuguese", () => {
    it("should format ISO date to Portuguese text", () => {
      const result = formatDateToPortuguese("2026-06-05");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should format Brazilian date to Portuguese text", () => {
      const result = formatDateToPortuguese("05/06/2026");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should handle short Portuguese format", () => {
      const result = formatDateToPortuguese("12 Junho");
      expect(result).toBe("12 de junho de 2026");
    });

    it("should return null for invalid dates", () => {
      const result = formatDateToPortuguese("invalid");
      expect(result).toBeNull();
    });

    it("should normalize year 2001 to 2026", () => {
      const result = formatDateToPortuguese("05/06/2001");
      expect(result).toBe("5 de junho de 2026");
    });
  });

  describe("Edge cases", () => {
    it("should handle dates with extra whitespace", () => {
      const result = normalizeDateString("  05  de  junho  de  2026  ");
      expect(result).toBe("2026-06-05");
    });

    it("should handle mixed case Portuguese month names", () => {
      const result = normalizeDateString("05 De Junho De 2026");
      expect(result).toBe("2026-06-05");
    });

    it("should handle short Portuguese format with all valid months", () => {
      const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ];
      
      months.forEach((month, index) => {
        const monthNum = String(index + 1).padStart(2, "0");
        const result = normalizeDateString(`15 ${month}`);
        expect(result).toBe(`2026-${monthNum}-15`);
      });
    });
  });
});
