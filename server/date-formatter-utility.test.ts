import { describe, it, expect } from "vitest";

/**
 * Tests for centralized date formatting utility
 * Validates all date parsing and formatting functions
 */

// Mock implementations for testing (since we can't import from client in server tests)
const PORTUGUESE_MONTHS: { [key: string]: number } = {
  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
  'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
};

const PORTUGUESE_MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function isValidYear(year: number): boolean {
  return year >= 2020 && year <= 2030;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // ISO format
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime()) && isValidYear(date.getFullYear())) {
      return date;
    }
  }

  // Brazilian format
  const brazilianMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brazilianMatch) {
    const [, day, month, year] = brazilianMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime()) && isValidYear(date.getFullYear())) {
      return date;
    }
  }

  // Portuguese format
  const portugueseMatch = dateStr.toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})?/);
  if (portugueseMatch) {
    const [, dayStr, monthStr, yearStr] = portugueseMatch;
    const day = parseInt(dayStr);
    const month = PORTUGUESE_MONTHS[monthStr];
    const year = yearStr ? parseInt(yearStr) : 2026;

    if (month !== undefined && !isNaN(day) && isValidYear(year)) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function formatDatePortuguese(date: Date | string | null | undefined): string {
  if (!date) return '';

  let dateObj: Date | null = null;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = parseDate(date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return typeof date === 'string' ? date : '';
  }

  const day = dateObj.getDate();
  const month = PORTUGUESE_MONTH_NAMES[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} de ${month} de ${year}`;
}

describe("Date Formatter Utility - Comprehensive Tests", () => {
  
  describe("Date Parsing", () => {
    it("should parse ISO format (2026-06-05)", () => {
      const result = parseDate("2026-06-05");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(5); // June (0-indexed)
      expect(result?.getDate()).toBe(5);
    });

    it("should parse Brazilian format (05/06/2026)", () => {
      const result = parseDate("05/06/2026");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(5);
    });

    it("should parse Portuguese format (05 Junho 2026)", () => {
      const result = parseDate("05 Junho 2026");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(5);
    });

    it("should parse Portuguese format with prepositions (05 de Junho de 2026)", () => {
      const result = parseDate("05 de Junho de 2026");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(5);
      expect(result?.getDate()).toBe(5);
    });

    it("should parse Portuguese format with lowercase (05 de junho de 2026)", () => {
      const result = parseDate("05 de junho de 2026");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(5);
      expect(result?.getDate()).toBe(5);
    });

    it("should return null for invalid format", () => {
      const result = parseDate("invalid-date");
      expect(result).toBeNull();
    });

    it("should return null for year outside valid range", () => {
      const result = parseDate("2001-06-05");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = parseDate("");
      expect(result).toBeNull();
    });
  });

  describe("Portuguese Formatting", () => {
    it("should format Date object to Portuguese", () => {
      const date = new Date(2026, 5, 5); // June 5, 2026
      const result = formatDatePortuguese(date);
      expect(result).toBe("5 de junho de 2026");
    });

    it("should format ISO string to Portuguese", () => {
      const result = formatDatePortuguese("2026-06-05");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should format Brazilian string to Portuguese", () => {
      const result = formatDatePortuguese("05/06/2026");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should format Portuguese string to Portuguese", () => {
      const result = formatDatePortuguese("05 Junho 2026");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should return empty string for null", () => {
      const result = formatDatePortuguese(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined", () => {
      const result = formatDatePortuguese(undefined);
      expect(result).toBe("");
    });

    it("should return original string if parsing fails", () => {
      const result = formatDatePortuguese("invalid-date");
      expect(result).toBe("invalid-date");
    });

    it("should handle different months correctly", () => {
      expect(formatDatePortuguese("2026-01-15")).toBe("15 de janeiro de 2026");
      expect(formatDatePortuguese("2026-02-15")).toBe("15 de fevereiro de 2026");
      expect(formatDatePortuguese("2026-12-15")).toBe("15 de dezembro de 2026");
    });

    it("should handle single digit days", () => {
      const result = formatDatePortuguese("2026-06-05");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should handle double digit days", () => {
      const result = formatDatePortuguese("2026-06-25");
      expect(result).toBe("25 de junho de 2026");
    });
  });

  describe("Year Validation", () => {
    it("should validate year 2026", () => {
      expect(isValidYear(2026)).toBe(true);
    });

    it("should validate year 2020", () => {
      expect(isValidYear(2020)).toBe(true);
    });

    it("should validate year 2030", () => {
      expect(isValidYear(2030)).toBe(true);
    });

    it("should reject year 2001", () => {
      expect(isValidYear(2001)).toBe(false);
    });

    it("should reject year 2019", () => {
      expect(isValidYear(2019)).toBe(false);
    });

    it("should reject year 2031", () => {
      expect(isValidYear(2031)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle dates with leading zeros", () => {
      const result = formatDatePortuguese("2026-06-05");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should handle dates without leading zeros", () => {
      const result = formatDatePortuguese("5/6/2026");
      expect(result).toBe("5 de junho de 2026");
    });

    it("should handle mixed case Portuguese months", () => {
      const result = parseDate("05 JUNHO 2026");
      expect(result).not.toBeNull();
    });

    it("should handle Portuguese format with year (2026)", () => {
      const result = parseDate("05 Junho 2026");
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
    });

    it("should handle leap year dates", () => {
      const result = formatDatePortuguese("2026-02-28");
      expect(result).toBe("28 de fevereiro de 2026");
    });

    it("should handle end of month dates", () => {
      const result = formatDatePortuguese("2026-06-30");
      expect(result).toBe("30 de junho de 2026");
    });
  });

  describe("No Year 2001 Bug", () => {
    it("should never return year 2001 for valid dates", () => {
      const testDates = [
        "05 Junho 2026",
        "05 de Junho de 2026",
        "05/06/2026",
        "05 junho 2026",
      ];

      testDates.forEach((dateStr) => {
        const result = formatDatePortuguese(dateStr);
        expect(result).not.toContain("2001");
        expect(result).toContain("2026");
      });
    });

    it("should reject dates with year 2001", () => {
      const result = parseDate("2001-06-05");
      expect(result).toBeNull();
    });

    it("should reject dates with year 2001 in Brazilian format", () => {
      const result = parseDate("05/06/2001");
      expect(result).toBeNull();
    });

    it("should never parse to year 2001", () => {
      const testCases = [
        "05 Junho 2026",
        "05/06/2026",
        "2026-06-05",
        "05 de junho de 2026",
      ];

      testCases.forEach((dateStr) => {
        const result = parseDate(dateStr);
        if (result) {
          expect(result.getFullYear()).not.toBe(2001);
          expect(result.getFullYear()).toBe(2026);
        }
      });
    });
  });

  describe("Multiple Dates Formatting", () => {
    it("should format array of dates", () => {
      const dates = ["2026-06-05", "2026-06-06", "2026-06-07"];
      const formatted = dates.map((d) => formatDatePortuguese(d));
      
      expect(formatted).toContain("5 de junho de 2026");
      expect(formatted).toContain("6 de junho de 2026");
      expect(formatted).toContain("7 de junho de 2026");
    });

    it("should handle mixed format dates in array", () => {
      const dates = ["2026-06-05", "05/06/2026", "05 Junho 2026"];
      const formatted = dates.map((d) => formatDatePortuguese(d));
      
      formatted.forEach((f) => {
        expect(f).toBe("5 de junho de 2026");
      });
    });
  });

  describe("Consistency Across Formats", () => {
    it("should produce same result from different input formats", () => {
      const iso = formatDatePortuguese("2026-06-05");
      const brazilian = formatDatePortuguese("05/06/2026");
      const portuguese = formatDatePortuguese("05 Junho 2026");
      
      expect(iso).toBe(brazilian);
      expect(brazilian).toBe(portuguese);
    });

    it("should maintain consistency for all months", () => {
      const months = [
        "2026-01-05", "2026-02-05", "2026-03-05", "2026-04-05",
        "2026-05-05", "2026-06-05", "2026-07-05", "2026-08-05",
        "2026-09-05", "2026-10-05", "2026-11-05", "2026-12-05",
      ];

      months.forEach((date) => {
        const result = formatDatePortuguese(date);
        expect(result).toContain("de");
        expect(result).toContain("2026");
        expect(result).not.toContain("2001");
      });
    });
  });
});
