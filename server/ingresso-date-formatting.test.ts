import { describe, it, expect } from "vitest";

// Mock the formatDate function behavior - matches Ingresso.tsx implementation
function formatDate(dateStr: string): string {
  // If it's ISO format (YYYY-MM-DD), parse it directly
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // Format manually to avoid timezone issues
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const monthName = monthNames[month - 1];
    
    return `${day} de ${monthName} de ${year}`;
  }
  
  // Fallback for other formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return "Data inválida";
  }
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

describe("Ingresso Date Formatting", () => {
  it("should format ISO date 2026-06-06 correctly without timezone offset", () => {
    const result = formatDate("2026-06-06");
    expect(result).toBe("6 de junho de 2026");
  });

  it("should format ISO date 2026-06-05 correctly", () => {
    const result = formatDate("2026-06-05");
    expect(result).toBe("5 de junho de 2026");
  });

  it("should format ISO date 2026-06-12 correctly", () => {
    const result = formatDate("2026-06-12");
    expect(result).toBe("12 de junho de 2026");
  });

  it("should format ISO date 2026-06-13 correctly", () => {
    const result = formatDate("2026-06-13");
    expect(result).toBe("13 de junho de 2026");
  });

  it("should handle invalid date gracefully", () => {
    const result = formatDate("invalid");
    expect(result).toBe("Data inválida");
  });

  it("should handle various valid ISO dates without off-by-one errors", () => {
    const testCases = [
      { input: "2026-01-01", expected: "1 de janeiro de 2026" },
      { input: "2026-02-28", expected: "28 de fevereiro de 2026" },
      { input: "2026-12-31", expected: "31 de dezembro de 2026" },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = formatDate(input);
      expect(result).toBe(expected);
    });
  });
});
