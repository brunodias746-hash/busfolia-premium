import { describe, it, expect } from "vitest";

/**
 * Integration test for the complete date flow:
 * Frontend → Backend → Email/Ticket
 * 
 * This test simulates the actual data flow from checkout to email/ticket generation
 */
describe("Date Flow Integration - Complete Pipeline", () => {
  
  // Simulate the email formatting function (from email.ts)
  function formatDatesInPortuguese(dates: string[]): string {
    if (dates.length === 0) return "";
    
    const monthNames: { [key: string]: string } = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    
    const parsedDates = dates.map(d => {
      if (!d) return null;
      
      let day: number, month: string, year: string;
      
      if (d.includes('-')) {
        const parts = d.split('-');
        if (parts.length >= 3) {
          year = parts[0];
          month = monthNames[parts[1]];
          day = parseInt(parts[2]);
        } else {
          return null;
        }
      } else if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) {
          day = parseInt(parts[0]);
          month = monthNames[parts[1].padStart(2, '0')];
          year = parts[2];
        } else {
          return null;
        }
      } else if (d.includes(' ')) {
        // Handle Portuguese format: "05 Junho 2026" or "05 de Junho de 2026"
        const cleaned = d.replace(/ de /g, ' ');
        const parts = cleaned.split(' ').filter(p => p.length > 0);
        if (parts.length >= 2) {
          day = parseInt(parts[0]);
          month = parts[1];
          year = parts[2] || '2026'; // CRITICAL FIX: Default to 2026
        } else {
          return null;
        }
      } else {
        return null;
      }
      
      if (isNaN(day) || !month || !year) return null;
      return { day, month, year };
    }).filter(d => d !== null) as { day: number; month: string; year: string }[];
    
    if (parsedDates.length === 0) return "";
    
    const grouped: { [key: string]: { day: number; month: string; year: string }[] } = {};
    parsedDates.forEach(d => {
      const key = `${d.month} de ${d.year}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    
    const formatted = Object.entries(grouped).map(([monthYear, days]) => {
      const dayNumbers = days.map(d => d.day).sort((a, b) => a - b);
      return `${dayNumbers.join(', ')} de ${monthYear}`;
    });
    
    if (formatted.length === 1) return formatted[0];
    return formatted.slice(0, -1).join(', ') + ' e ' + formatted[formatted.length - 1];
  }

  // Simulate the ticket formatting function (from Ingresso.tsx)
  function formatDateForTicket(dateStr: string): string {
    let dateToFormat = dateStr;
    if (dateStr && !dateStr.includes('2026') && !dateStr.includes('202') && !/\d{4}/.test(dateStr)) {
      dateToFormat = `${dateStr} 2026`;
    }
    
    const date = new Date(dateToFormat);
    
    if (isNaN(date.getTime())) {
      const monthNames: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
        'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
        'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };
      const parts = dateToFormat.toLowerCase().split(' ');
      if (parts.length >= 2) {
        const day = parseInt(parts[0]);
        const month = monthNames[parts[1]];
        const year = parts[2] ? parseInt(parts[2]) : 2026;
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        }
      }
      return dateStr;
    }
    
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  it("should handle complete flow: frontend date → backend storage → email formatting", () => {
    // Step 1: Frontend sends date with year
    const frontendDate = "05 de Junho de 2026";
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify([frontendDate]);
    
    // Step 3: Email formatting retrieves and formats
    const parsedDates = JSON.parse(backendStorage) as string[];
    const emailFormatted = formatDatesInPortuguese(parsedDates);
    
    // Verify: Email should show 2026, not 2001
    expect(emailFormatted).toContain("2026");
    expect(emailFormatted).not.toContain("2001");
    expect(emailFormatted).toContain("Junho");
  });

  it("should handle complete flow: frontend date → backend storage → ticket formatting", () => {
    // Step 1: Frontend sends date with year
    const frontendDate = "05 de Junho de 2026";
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify([frontendDate]);
    
    // Step 3: Ticket formatting retrieves and formats
    const parsedDates = JSON.parse(backendStorage) as string[];
    const ticketFormatted = formatDateForTicket(parsedDates[0]);
    
    // Verify: Ticket should show 2026, not 2001
    expect(ticketFormatted).toContain("2026");
    expect(ticketFormatted).not.toContain("2001");
    // Note: toLocaleDateString returns uppercase month in Portuguese
    expect(ticketFormatted.toLowerCase()).toContain("junho");
  });

  it("should handle multiple dates across the complete flow", () => {
    // Step 1: Frontend sends multiple dates with year
    const frontendDates = ["05 de Junho de 2026", "06 de Junho de 2026", "12 de Junho de 2026", "13 de Junho de 2026"];
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify(frontendDates);
    
    // Step 3: Email formatting
    const parsedDates = JSON.parse(backendStorage) as string[];
    const emailFormatted = formatDatesInPortuguese(parsedDates);
    
    // Verify: Email should show all dates with 2026
    expect(emailFormatted).toContain("2026");
    expect(emailFormatted).not.toContain("2001");
    expect(emailFormatted).toContain("Junho");
    
    // Step 4: Each date should also format correctly for ticket
    parsedDates.forEach(date => {
      const ticketFormatted = formatDateForTicket(date);
      expect(ticketFormatted).toContain("2026");
      expect(ticketFormatted).not.toContain("2001");
    });
  });

  it("should handle ISO format dates (YYYY-MM-DD) in the complete flow", () => {
    // Step 1: Frontend sends ISO format dates
    const frontendDates = ["2026-06-05", "2026-06-06"];
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify(frontendDates);
    
    // Step 3: Email formatting
    const parsedDates = JSON.parse(backendStorage) as string[];
    const emailFormatted = formatDatesInPortuguese(parsedDates);
    
    // Verify: Email should show 2026
    expect(emailFormatted).toContain("2026");
    expect(emailFormatted).not.toContain("2001");
  });

  it("should handle Brazilian format dates (DD/MM/YYYY) in the complete flow", () => {
    // Step 1: Frontend sends Brazilian format dates
    const frontendDates = ["05/06/2026", "06/06/2026"];
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify(frontendDates);
    
    // Step 3: Email formatting
    const parsedDates = JSON.parse(backendStorage) as string[];
    const emailFormatted = formatDatesInPortuguese(parsedDates);
    
    // Verify: Email should show 2026
    expect(emailFormatted).toContain("2026");
    expect(emailFormatted).not.toContain("2001");
  });

  it("should handle 'Todos os Dias' special case in email", () => {
    // Step 1: Frontend sends special case for all days
    const frontendDates = ["Todos os Dias"];
    
    // Step 2: Backend stores as JSON array
    const backendStorage = JSON.stringify(frontendDates);
    
    // Step 3: Email formatting should handle gracefully
    const parsedDates = JSON.parse(backendStorage) as string[];
    const emailFormatted = formatDatesInPortuguese(parsedDates);
    
    // Verify: Should return empty or handle without error
    expect(emailFormatted).toBeDefined();
  });

  it("should never produce year 2001 in any scenario", () => {
    const testCases = [
      ["05 Junho"],
      ["05 de Junho"],
      ["05 de Junho de 2026"],
      ["2026-06-05"],
      ["05/06/2026"],
      ["05 Junho", "06 Junho", "12 Junho", "13 Junho"],
    ];

    testCases.forEach(dates => {
      // Email formatting
      const emailResult = formatDatesInPortuguese(dates);
      expect(emailResult).not.toContain("2001", `Email formatting failed for: ${JSON.stringify(dates)}`);
      
      // Ticket formatting for each date
      dates.forEach(date => {
        const ticketResult = formatDateForTicket(date);
        expect(ticketResult).not.toContain("2001", `Ticket formatting failed for: ${date}`);
      });
    });
  });
});
