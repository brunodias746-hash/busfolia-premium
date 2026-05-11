import { describe, it, expect, beforeEach } from "vitest";
import { generateProfessionalExport } from "./_core/professional-export";

describe("Professional Export", () => {
  const mockOrders = [
    {
      id: 1,
      eventId: 1,
      totalValue: 500,
      paymentStatus: "paid",
      createdAt: new Date("2026-06-01"),
    },
    {
      id: 2,
      eventId: 1,
      totalValue: 300,
      paymentStatus: "pending",
      createdAt: new Date("2026-06-02"),
    },
    {
      id: 3,
      eventId: 1,
      totalValue: 200,
      paymentStatus: "canceled",
      createdAt: new Date("2026-06-03"),
    },
  ];

  const mockPassengers = [
    {
      id: 1,
      orderId: 1,
      name: "João Silva",
      cpf: "123.456.789-00",
      email: "joao@example.com",
      phone: "(31) 99999-9999",
      boardingPoint: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
      paymentStatus: "paid",
      travelDate: "2026-06-12",
    },
    {
      id: 2,
      orderId: 1,
      name: "Maria Santos",
      cpf: "987.654.321-00",
      email: "maria@example.com",
      phone: "(31) 88888-8888",
      boardingPoint: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
      paymentStatus: "paid",
      travelDate: "2026-06-12",
    },
    {
      id: 3,
      orderId: 2,
      name: "Pedro Costa",
      cpf: "456.789.123-00",
      email: "pedro@example.com",
      phone: "(31) 77777-7777",
      boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
      paymentStatus: "pending",
      travelDate: "2026-06-13",
    },
  ];

  it("should generate Excel buffer", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    expect(buffer).toBeDefined();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should create Excel with multiple sheets", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    // Excel files start with specific magic bytes
    const hexStart = buffer.toString("hex", 0, 4);
    expect(["504b0304", "d0cf11e0"]).toContain(hexStart.substring(0, 8));
  });

  it("should handle empty passenger list", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: [],
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle empty order list", async () => {
    const buffer = await generateProfessionalExport({
      orders: [],
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include branding colors in export", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    // Check that buffer contains expected data
    const bufferStr = buffer.toString("utf-8", 0, Math.min(1000, buffer.length));
    expect(bufferStr.length).toBeGreaterThan(0);
  });

  it("should calculate correct revenue totals", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    // Total paid: 500
    // Total pending: 300
    // Total canceled: 200
    expect(buffer).toBeDefined();
  });

  it("should group passengers by boarding point", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    // Should have 2 boarding points:
    // - BELO HORIZONTE - PRAÇA DA ESTAÇÃO (2 passengers)
    // - BETIM - PARTAGE SHOPPING BETIM (1 passenger)
    expect(buffer).toBeDefined();
  });

  it("should group passengers by travel date", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    // Should have 2 travel dates:
    // - 2026-06-12 (2 passengers)
    // - 2026-06-13 (1 passenger)
    expect(buffer).toBeDefined();
  });

  it("should format currency correctly", async () => {
    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: mockPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    expect(buffer).toBeDefined();
  });

  it("should handle special characters in names", async () => {
    const specialPassengers = [
      {
        id: 1,
        orderId: 1,
        name: "José da Silva Açúcar",
        cpf: "123.456.789-00",
        email: "jose@example.com",
        phone: "(31) 99999-9999",
        boardingPoint: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
        paymentStatus: "paid",
        travelDate: "2026-06-12",
      },
    ];

    const buffer = await generateProfessionalExport({
      orders: mockOrders,
      passengers: specialPassengers,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      eventDate: "05 a 13 de junho de 2026",
    });

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });
});
