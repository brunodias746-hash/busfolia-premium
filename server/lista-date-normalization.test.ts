import { describe, it, expect } from "vitest";

// Copy of the normalizeDateFormat function for testing
function normalizeDateFormat(dateStr: string): string | null {
  if (!dateStr || dateStr === "N/A" || dateStr === "NaN/NaN/NaN") return null;
  
  // Already in correct format
  if (dateStr.match(/^\d{2} de junho de 2026$/)) {
    return dateStr;
  }
  
  // Parse "05/06/2026" format
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateStr.split('/');
    if (month === '06' && year === '2026') {
      return `${day} de junho de 2026`;
    }
    return null;
  }
  
  // Parse "2026-06-05" format (ISO) - convert to "05 de junho de 2026"
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    if (month === '06' && year === '2026') {
      return `${day} de junho de 2026`;
    }
    return null;
  }
  
  // Parse "05 Junho" or "05 junho" - normalize to "05 de junho de 2026"
  if (dateStr.match(/^\d{2}\s+[Jj]unho$/)) {
    const day = dateStr.split(/\s+/)[0];
    return `${day} de junho de 2026`;
  }
  
  // Parse "06 de Junho de 2026" - normalize to lowercase "junho"
  if (dateStr.match(/^\d{2}\s+de\s+[Jj]unho\s+de\s+\d{4}$/)) {
    return dateStr.replace(/Junho/, 'junho');
  }
  
  return null;
}

describe("Lista de Embarque - Date Normalization", () => {
  it("should handle ISO format (2026-06-05)", () => {
    expect(normalizeDateFormat("2026-06-05")).toBe("05 de junho de 2026");
  });

  it("should handle ISO format (2026-06-06)", () => {
    expect(normalizeDateFormat("2026-06-06")).toBe("06 de junho de 2026");
  });

  it("should handle ISO format (2026-06-12)", () => {
    expect(normalizeDateFormat("2026-06-12")).toBe("12 de junho de 2026");
  });

  it("should handle Brazilian format (05/06/2026)", () => {
    expect(normalizeDateFormat("05/06/2026")).toBe("05 de junho de 2026");
  });

  it("should handle Portuguese format (05 junho)", () => {
    expect(normalizeDateFormat("05 junho")).toBe("05 de junho de 2026");
  });

  it("should handle Portuguese format (05 Junho)", () => {
    expect(normalizeDateFormat("05 Junho")).toBe("05 de junho de 2026");
  });

  it("should handle full Portuguese format (05 de junho de 2026)", () => {
    expect(normalizeDateFormat("05 de junho de 2026")).toBe("05 de junho de 2026");
  });

  it("should handle full Portuguese format with capital J (05 de Junho de 2026)", () => {
    expect(normalizeDateFormat("05 de Junho de 2026")).toBe("05 de junho de 2026");
  });

  it("should reject N/A", () => {
    expect(normalizeDateFormat("N/A")).toBeNull();
  });

  it("should reject empty string", () => {
    expect(normalizeDateFormat("")).toBeNull();
  });

  it("should reject non-June dates (ISO)", () => {
    expect(normalizeDateFormat("2026-05-05")).toBeNull();
  });

  it("should reject non-June dates (Brazilian)", () => {
    expect(normalizeDateFormat("05/05/2026")).toBeNull();
  });

  it("should reject invalid dates", () => {
    expect(normalizeDateFormat("invalid date")).toBeNull();
  });

  it("should handle all June dates from 05-13", () => {
    for (let day = 5; day <= 13; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const isoDate = `2026-06-${dayStr}`;
      const result = normalizeDateFormat(isoDate);
      expect(result).toBe(`${dayStr} de junho de 2026`);
    }
  });

  it("should filter out N/A in dropdown", () => {
    const dates = [
      "2026-06-05",
      "N/A",
      "2026-06-06",
      "",
      "2026-06-12",
    ];
    
    const normalized = dates
      .map(d => normalizeDateFormat(d))
      .filter((d): d is string => d !== null);
    
    expect(normalized).toHaveLength(3);
    expect(normalized).toContain("05 de junho de 2026");
    expect(normalized).toContain("06 de junho de 2026");
    expect(normalized).toContain("12 de junho de 2026");
  });
});
