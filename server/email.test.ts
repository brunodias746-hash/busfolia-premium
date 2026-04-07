import { describe, it, expect } from "vitest";
import { generateOrderConfirmationEmail } from "./_core/email";

describe("Email Generation", () => {
  it("should generate valid HTML email with order details", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      shortId: "BF-ABC123",
      boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
      transportDates: ["05 de Junho de 2026", "06 de Junho de 2026"],
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
    expect(emailHtml).toContain("05 de Junho de 2026");
    expect(emailHtml).toContain("06 de Junho de 2026");
    expect(emailHtml).toContain("2"); // quantity
    expect(emailHtml).toContain("132,10"); // formatted price
    
    // Verify WhatsApp link
    expect(emailHtml).toContain("https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po");
    
    // Verify important sections
    expect(emailHtml).toContain("PAGAMENTO CONFIRMADO");
    expect(emailHtml).toContain("BusFolia");
    expect(emailHtml).toContain("Transporte Premium para Eventos");
  });

  it("should format currency correctly", () => {
    const emailHtml = generateOrderConfirmationEmail({
      customerName: "Test User",
      customerEmail: "test@example.com",
      shortId: "BF-TEST",
      boardingPoint: "Test Point",
      transportDates: ["Test Date"],
      quantity: 1,
      totalAmountCents: 6000, // R$ 60,00
      whatsappLink: "https://chat.whatsapp.com/test",
    });

    expect(emailHtml).toContain("Total Pago:");
    expect(emailHtml).toContain("60,00");
  });

  it("should handle multiple dates correctly", () => {
    const dates = ["01 de Junho", "02 de Junho", "03 de Junho"];
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

    // All dates should be joined with comma
    expect(emailHtml).toContain("01 de Junho, 02 de Junho, 03 de Junho");
    expect(emailHtml).toContain("180,00"); // R$ 180,00
  });
});
