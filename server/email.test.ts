import { describe, it, expect } from "vitest";
import { generateOrderConfirmationEmail } from "./_core/email";

describe("Email Generation", () => {
  it("should generate valid HTML email with order details", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      shortId: "BF-ABC123",
      boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
      transportDates: ["2026-06-05", "2026-06-06"],
      quantity: 2,
      totalAmountCents: 13210,
      whatsappLink: "https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po",
    });

    // Verify HTML structure
    expect(emailHtml).toContain("<!DOCTYPE html>");
    expect(emailHtml).toContain("</html>");
    
    // Verify order details are included
    expect(emailHtml).toContain("João Silva");
    expect(emailHtml).toContain("BF-ABC123");
    expect(emailHtml).toContain("BETIM - PARTAGE SHOPPING BETIM");
    expect(emailHtml).toContain("Junho");
    expect(emailHtml).toContain("2026");
    expect(emailHtml).toContain("2"); // quantity
    expect(emailHtml).toContain("132,10"); // formatted price
    
    // Verify WhatsApp link
    expect(emailHtml).toContain("https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po");
    
    // Verify important sections
    expect(emailHtml).toContain("PAGAMENTO CONFIRMADO");
    expect(emailHtml).toContain("BusFolia");
    expect(emailHtml).toContain("Transporte Premium para Eventos");
    
    // Verify no NaN or undefined
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });

  it("should format currency correctly", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test User",
      customerEmail: "test@example.com",
      shortId: "BF-TEST",
      boardingPoint: "Test Point",
      transportDates: ["2026-06-05"],
      quantity: 1,
      totalAmountCents: 6000, // R$ 60,00
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    expect(emailHtml).toContain("Total Pago:");
    expect(emailHtml).toContain("60,00");
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });

  it("should handle multiple dates correctly", () => {
    const dates = ["2026-06-01", "2026-06-02", "2026-06-03"];
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-TEST",
      boardingPoint: "Test",
      transportDates: dates,
      quantity: 1,
      totalAmountCents: 18000,
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    // All dates should be formatted in Portuguese
    expect(emailHtml).toContain("Junho");
    expect(emailHtml).toContain("2026");
    expect(emailHtml).toContain("180,00"); // R$ 180,00
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });
});

describe("Email Generation - ISO Date Format", () => {
  it("should handle ISO date format (2026-06-05) correctly", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      shortId: "BF-ISO123",
      boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
      transportDates: ["2026-06-05", "2026-06-06"],
      quantity: 2,
      totalAmountCents: 13210,
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    // Verify HTML structure
    expect(emailHtml).toContain("<!DOCTYPE html>");
    
    // Verify order details are included
    expect(emailHtml).toContain("João Silva");
    expect(emailHtml).toContain("BF-ISO123");
    
    // Verify dates are formatted in Portuguese
    expect(emailHtml).toContain("Junho");
    expect(emailHtml).toContain("2026");
    
    // Should not contain "NaN" or "undefined"
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });

  it("should handle multiple ISO dates from same month", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-MULTI",
      boardingPoint: "Test",
      transportDates: ["2026-06-05", "2026-06-06", "2026-06-12", "2026-06-13"],
      quantity: 4,
      totalAmountCents: 52840,
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    // Should format as "05, 06, 12 e 13 de Junho de 2026"
    expect(emailHtml).toContain("Junho");
    expect(emailHtml).toContain("2026");
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });

  it("should handle ISO dates from multiple months", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-MONTHS",
      boardingPoint: "Test",
      transportDates: ["2026-06-30", "2026-07-01", "2026-07-02"],
      quantity: 3,
      totalAmountCents: 39630,
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    // Should contain both months
    expect(emailHtml).toContain("Junho");
    expect(emailHtml).toContain("Julho");
    expect(emailHtml).toContain("2026");
    expect(emailHtml).not.toContain("NaN");
    expect(emailHtml).not.toContain("undefined");
  });

  it("should handle purchase type in email", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-TYPE",
      boardingPoint: "Test",
      transportDates: ["2026-06-05"],
      quantity: 1,
      totalAmountCents: 13210,
      whatsappLink: "https://chat.whatsapp.com/test",
      purchaseType: "single",
    });

    // Should contain purchase type
    expect(emailHtml).toContain("Dia Único");
  });

  it("should handle all_days purchase type", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-ALLDAYS",
      boardingPoint: "Test",
      transportDates: ["2026-06-05", "2026-06-06", "2026-06-07"],
      quantity: 1,
      totalAmountCents: 39630,
      whatsappLink: "https://chat.whatsapp.com/test",
      purchaseType: "all_days",
    });

    // Should contain purchase type
    expect(emailHtml).toContain("Passaporte — Todos os Dias");
  });

  it("should handle multiple purchase type", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test",
      customerEmail: "test@example.com",
      shortId: "BF-MULTIPLE",
      boardingPoint: "Test",
      transportDates: ["2026-06-05", "2026-06-06"],
      quantity: 1,
      totalAmountCents: 26420,
      whatsappLink: "https://chat.whatsapp.com/test",
      purchaseType: "multiple",
    });

    // Should contain purchase type
    expect(emailHtml).toContain("Múltiplos Dias");
  });
});
