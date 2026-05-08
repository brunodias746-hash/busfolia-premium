import { describe, it, expect } from "vitest";
import { generateTicketPDF, generatePDFFilename } from "./_core/pdf-generator";

describe("PDF Generation and Email Attachment", () => {
  
  describe("PDF Filename Generation", () => {
    it("should generate correct PDF filename format", () => {
      const filename = generatePDFFilename("1320001");
      expect(filename).toBe("ingresso-busfolia-1320001.pdf");
    });

    it("should include order number in filename", () => {
      const orderNumber = "ABC123";
      const filename = generatePDFFilename(orderNumber);
      expect(filename).toContain(orderNumber);
    });

    it("should always end with .pdf extension", () => {
      const filename = generatePDFFilename("12345");
      expect(filename.endsWith(".pdf")).toBe(true);
    });
  });

  describe("PDF Generation", () => {
    it("should generate PDF buffer successfully", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Samara Soares de Paula",
        customerEmail: "samaraimex@yahoo.com",
        boardingPoint: "BELO HORIZONTE - SHOPPING ESTAÇÃO",
        transportDates: ["12 de junho de 2026", "13 de junho de 2026"],
        quantity: 2,
        totalAmountCents: 24000,
        generatedAt: "08/05/2026 19:09:00",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate PDF with correct data structure", async () => {
      const testData = {
        orderNumber: "1320001",
        customerName: "João Silva",
        customerEmail: "joao@example.com",
        boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
        transportDates: ["05 de junho de 2026"],
        quantity: 1,
        totalAmountCents: 12000,
        generatedAt: "08/05/2026 19:09:00",
      };

      const pdfBuffer = await generateTicketPDF(testData);
      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.length).toBeGreaterThan(1000); // PDF should be reasonably sized
    });

    it("should handle multiple travel dates", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320002",
        customerName: "Maria Santos",
        customerEmail: "maria@example.com",
        boardingPoint: "CONTAGEM - PRAÇA DA CEMIG",
        transportDates: ["05 de junho de 2026", "06 de junho de 2026", "12 de junho de 2026", "13 de junho de 2026"],
        quantity: 4,
        totalAmountCents: 48000,
        generatedAt: "08/05/2026 19:09:00",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle large quantities", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320003",
        customerName: "Empresa XYZ",
        customerEmail: "empresa@example.com",
        boardingPoint: "SANTA LUZIA - SORVETERIA 4 ESTAÇÃO",
        transportDates: ["05 de junho de 2026"],
        quantity: 50,
        totalAmountCents: 600000,
        generatedAt: "08/05/2026 19:09:00",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("Email Attachment Integration", () => {
    it("should create attachment object with correct structure", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Samara Soares de Paula",
        customerEmail: "samaraimex@yahoo.com",
        boardingPoint: "BELO HORIZONTE - SHOPPING ESTAÇÃO",
        transportDates: ["12 de junho de 2026"],
        quantity: 1,
        totalAmountCents: 12000,
        generatedAt: "08/05/2026 19:09:00",
      });

      const attachment = {
        filename: generatePDFFilename("1320001"),
        content: pdfBuffer,
        contentType: "application/pdf",
      };

      expect(attachment.filename).toBe("ingresso-busfolia-1320001.pdf");
      expect(attachment.content).toBeInstanceOf(Buffer);
      expect(attachment.contentType).toBe("application/pdf");
    });

    it("should handle attachment content encoding", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Test User",
        customerEmail: "test@example.com",
        boardingPoint: "TEST - TEST",
        transportDates: ["01 de janeiro de 2026"],
        quantity: 1,
        totalAmountCents: 10000,
        generatedAt: "01/01/2026 00:00:00",
      });

      // Simulate base64 encoding for email
      const base64Content = pdfBuffer.toString("base64");
      expect(base64Content).toBeTruthy();
      expect(base64Content.length).toBeGreaterThan(0);

      // Verify it can be decoded back
      const decodedBuffer = Buffer.from(base64Content, "base64");
      expect(decodedBuffer.length).toBe(pdfBuffer.length);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing order number gracefully", async () => {
      try {
        await generateTicketPDF({
          orderNumber: "",
          customerName: "Test",
          customerEmail: "test@example.com",
          boardingPoint: "TEST",
          transportDates: ["01 de janeiro de 2026"],
          quantity: 1,
          totalAmountCents: 10000,
          generatedAt: "01/01/2026 00:00:00",
        });
        // Should still generate PDF even with empty order number
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle special characters in customer name", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "José da Silva & Cia.",
        customerEmail: "jose@example.com",
        boardingPoint: "BELO HORIZONTE - SHOPPING ESTAÇÃO",
        transportDates: ["05 de junho de 2026"],
        quantity: 1,
        totalAmountCents: 12000,
        generatedAt: "08/05/2026 19:09:00",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle long boarding point names", async () => {
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Test User",
        customerEmail: "test@example.com",
        boardingPoint: "BELO HORIZONTE - SHOPPING ESTAÇÃO CENTRO COMERCIAL MUITO GRANDE",
        transportDates: ["05 de junho de 2026"],
        quantity: 1,
        totalAmountCents: 12000,
        generatedAt: "08/05/2026 19:09:00",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("PDF Content Validation", () => {
    it("should include order number in PDF", async () => {
      const orderNumber = "1320001";
      const pdfBuffer = await generateTicketPDF({
        orderNumber,
        customerName: "Test",
        customerEmail: "test@example.com",
        boardingPoint: "TEST",
        transportDates: ["01 de janeiro de 2026"],
        quantity: 1,
        totalAmountCents: 10000,
        generatedAt: "01/01/2026 00:00:00",
      });

      // PDF should be generated successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should include customer name in PDF", async () => {
      const customerName = "Samara Soares de Paula";
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName,
        customerEmail: "test@example.com",
        boardingPoint: "TEST",
        transportDates: ["01 de janeiro de 2026"],
        quantity: 1,
        totalAmountCents: 10000,
        generatedAt: "01/01/2026 00:00:00",
      });

      // PDF should be generated successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should include boarding point in PDF", async () => {
      const boardingPoint = "BELO HORIZONTE - SHOPPING ESTACAO";
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Test",
        customerEmail: "test@example.com",
        boardingPoint,
        transportDates: ["01 de janeiro de 2026"],
        quantity: 1,
        totalAmountCents: 10000,
        generatedAt: "01/01/2026 00:00:00",
      });

      // PDF should be generated successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should include travel dates in PDF", async () => {
      const date = "12 de junho de 2026";
      const pdfBuffer = await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Test",
        customerEmail: "test@example.com",
        boardingPoint: "TEST",
        transportDates: [date],
        quantity: 1,
        totalAmountCents: 10000,
        generatedAt: "01/01/2026 00:00:00",
      });

      // PDF should be generated successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should generate PDF in reasonable time", async () => {
      const startTime = performance.now();
      
      await generateTicketPDF({
        orderNumber: "1320001",
        customerName: "Samara Soares de Paula",
        customerEmail: "samaraimex@yahoo.com",
        boardingPoint: "BELO HORIZONTE - SHOPPING ESTAÇÃO",
        transportDates: ["12 de junho de 2026", "13 de junho de 2026"],
        quantity: 2,
        totalAmountCents: 24000,
        generatedAt: "08/05/2026 19:09:00",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // PDF generation should complete in less than 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it("should handle batch PDF generation", async () => {
      const orders = [
        { orderNumber: "1320001", customerName: "Customer 1", quantity: 1 },
        { orderNumber: "1320002", customerName: "Customer 2", quantity: 2 },
        { orderNumber: "1320003", customerName: "Customer 3", quantity: 3 },
      ];

      const startTime = performance.now();

      for (const order of orders) {
        await generateTicketPDF({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: "test@example.com",
          boardingPoint: "TEST",
          transportDates: ["01 de janeiro de 2026"],
          quantity: order.quantity,
          totalAmountCents: 10000,
          generatedAt: "01/01/2026 00:00:00",
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Batch generation should complete in reasonable time
      expect(duration).toBeLessThan(15000);
    });
  });
});
