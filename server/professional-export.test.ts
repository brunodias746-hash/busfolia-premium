import { describe, it, expect } from "vitest";
import { generateProfessionalExport } from "./_core/professional-export";
import type { ExportInput, EnrichedPassenger, EnrichedOrder, FinancialData, DashboardMetrics } from "./_core/professional-export";
import ExcelJS from "exceljs";

// ─── Mock Data matching the new enriched types ───

const mockPassengers: EnrichedPassenger[] = [
  {
    id: 1,
    name: "João Silva",
    cpf: "123.456.789-00",
    eventName: "Pedro Leopoldo Rodeio Show 2026",
    orderShortId: "BF-001",
    orderStatus: "paid",
    boardingPoint: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
    transportDate: "05 de Junho de 2026",
    checkInStatus: "pending",
  },
  {
    id: 2,
    name: "Maria Santos",
    cpf: "987.654.321-00",
    eventName: "Pedro Leopoldo Rodeio Show 2026",
    orderShortId: "BF-001",
    orderStatus: "paid",
    boardingPoint: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
    transportDate: "05 de Junho de 2026",
    checkInStatus: "checked_in",
  },
  {
    id: 3,
    name: "Pedro Costa",
    cpf: "456.789.123-00",
    eventName: "Pedro Leopoldo Rodeio Show 2026",
    orderShortId: "BF-002",
    orderStatus: "paid",
    boardingPoint: "BETIM - PARTAGE SHOPPING BETIM",
    transportDate: "06 de Junho de 2026",
    checkInStatus: "pending",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    cpf: "111.222.333-44",
    eventName: "Pedro Leopoldo Rodeio Show 2026",
    orderShortId: "BF-003",
    orderStatus: "paid",
    boardingPoint: "CONTAGEM - PRAÇA DA CEMIG",
    transportDate: "2026-06-07",
    checkInStatus: "pending",
  },
];

const mockOrders: EnrichedOrder[] = [
  {
    pedido: "BF-001",
    nomeCompleto: "João Silva",
    cpf: "123.456.789-00",
    telefone: "(31) 99999-9999",
    email: "joao@example.com",
    pontoEmbarque: "BELO HORIZONTE - PRAÇA DA ESTAÇÃO",
    datasTransporte: "05 de Junho de 2026",
    quantidadePassageiros: 2,
    valorTotal: "120.00",
    status: "Pago",
    dataCompra: "01/05/2026",
  },
  {
    pedido: "BF-002",
    nomeCompleto: "Pedro Costa",
    cpf: "456.789.123-00",
    telefone: "(31) 77777-7777",
    email: "pedro@example.com",
    pontoEmbarque: "BETIM - PARTAGE SHOPPING BETIM",
    datasTransporte: "06 de Junho de 2026",
    quantidadePassageiros: 1,
    valorTotal: "60.00",
    status: "Pago",
    dataCompra: "02/05/2026",
  },
  {
    pedido: "BF-003",
    nomeCompleto: "Ana Oliveira",
    cpf: "111.222.333-44",
    telefone: "(31) 66666-6666",
    email: "ana@example.com",
    pontoEmbarque: "CONTAGEM - PRAÇA DA CEMIG",
    datasTransporte: "07 de Junho de 2026",
    quantidadePassageiros: 1,
    valorTotal: "60.00",
    status: "Pago",
    dataCompra: "03/05/2026",
  },
];

const mockFinancialData: FinancialData = {
  totalRevenue: 24000, // R$240.00 in cents
  totalFees: 2400,     // R$24.00 in cents
  netRevenue: 21600,   // R$216.00 in cents
  totalOrders: 3,
  totalPassengers: 4,
  byEvent: [
    {
      eventId: 1,
      eventName: "Pedro Leopoldo Rodeio Show 2026",
      totalRevenue: 24000,
      totalFees: 2400,
      orderCount: 3,
      passengerCount: 4,
    },
  ],
};

const mockDashboardMetrics: DashboardMetrics = {
  totalPassengers: 6,
  paidPassengers: 4,
  pendingPassengers: 1,
  canceledPassengers: 1,
  boardingPointCounts: {
    "BELO HORIZONTE - PRAÇA DA ESTAÇÃO": 2,
    "BETIM - PARTAGE SHOPPING BETIM": 1,
    "CONTAGEM - PRAÇA DA CEMIG": 1,
  },
};

const mockInput: ExportInput = {
  passengers: mockPassengers,
  orders: mockOrders,
  financialData: mockFinancialData,
  dashboardMetrics: mockDashboardMetrics,
};

// ─── Helper to parse workbook from buffer ───
async function parseWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("Professional Export - Buffer Generation", () => {
  it("should generate a valid Excel buffer", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    expect(buffer).toBeDefined();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should produce a valid XLSX file (PK magic bytes)", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const hexStart = buffer.toString("hex", 0, 4);
    expect(hexStart).toBe("504b0304"); // ZIP/XLSX magic bytes
  });

  it("should handle empty passengers", async () => {
    const buffer = await generateProfessionalExport({
      ...mockInput,
      passengers: [],
    });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle empty orders", async () => {
    const buffer = await generateProfessionalExport({
      ...mockInput,
      orders: [],
    });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });
});

describe("Professional Export - Sheet Structure", () => {
  it("should create exactly 3 sheets", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    expect(wb.worksheets.length).toBe(3);
  });

  it("should have correct sheet names", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const names = wb.worksheets.map(s => s.name);
    expect(names).toContain("📊 Dashboard");
    expect(names).toContain("👥 Passageiros");
    expect(names).toContain("💰 Financeiro");
  });
});

describe("Professional Export - Dashboard Sheet", () => {
  it("should have correct main header", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("A1").value).toBe("BUSFOLIA - RELATÓRIO DE PASSAGEIROS");
  });

  it("should have subtitle", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("A2").value).toBe("Transporte Premium para Eventos");
  });

  it("should display correct total passengers metric", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("A5").value).toBe(6); // totalPassengers from metrics
  });

  it("should display correct paid passengers metric", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("C5").value).toBe(4); // paidPassengers
  });

  it("should display correct pending passengers metric", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("E5").value).toBe(1); // pendingPassengers
  });

  it("should display correct canceled passengers metric", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("G5").value).toBe(1); // canceledPassengers
  });

  it("should have conversion rate banner", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    const convValue = sheet.getCell("A7").value as string;
    expect(convValue).toContain("Taxa de Conversão");
    expect(convValue).toContain("66.7%"); // 4/6 = 66.7%
  });

  it("should have boarding points section header", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("A9").value).toBe("PASSAGEIROS POR PONTO DE EMBARQUE");
  });

  it("should list boarding points with counts", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    // Row 10 is headers, row 11+ is data
    // First BP should be "BELO HORIZONTE - PRAÇA DA ESTAÇÃO" with count 2 (sorted by count desc)
    expect(sheet.getRow(11).getCell(1).value).toBe("BELO HORIZONTE - PRAÇA DA ESTAÇÃO");
    expect(sheet.getRow(11).getCell(2).value).toBe(2);
  });
});

describe("Professional Export - Passageiros Sheet", () => {
  it("should have correct title header", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getCell("A1").value).toBe("BUSFOLIA - LISTA DE PASSAGEIROS");
  });

  it("should have correct column headers in row 3", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    const row3 = sheet.getRow(3);
    expect(row3.getCell(1).value).toBe("#");
    expect(row3.getCell(2).value).toBe("Nome");
    expect(row3.getCell(3).value).toBe("CPF");
    expect(row3.getCell(4).value).toBe("Evento");
    expect(row3.getCell(5).value).toBe("Pedido");
    expect(row3.getCell(6).value).toBe("Status");
    expect(row3.getCell(7).value).toBe("Ponto de Embarque");
    expect(row3.getCell(8).value).toBe("Data Viagem");
    expect(row3.getCell(9).value).toBe("Ingresso");
  });

  it("should have frozen panes at row 3", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.views[0]?.ySplit).toBe(3);
  });

  it("should have AutoFilter on row 3", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.autoFilter).toBeDefined();
  });

  it("should populate passenger data starting at row 4", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    // First passenger
    expect(sheet.getRow(4).getCell(1).value).toBe(1);
    expect(sheet.getRow(4).getCell(2).value).toBe("João Silva");
    expect(sheet.getRow(4).getCell(3).value).toBe("123.456.789-00");
    expect(sheet.getRow(4).getCell(4).value).toBe("Pedro Leopoldo Rodeio Show 2026");
    expect(sheet.getRow(4).getCell(5).value).toBe("BF-001");
    expect(sheet.getRow(4).getCell(6).value).toBe("Pago");
    expect(sheet.getRow(4).getCell(7).value).toBe("BELO HORIZONTE - PRAÇA DA ESTAÇÃO");
  });

  it("should format Portuguese dates correctly (05 de Junho de 2026 → 05/06/2026)", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("05/06/2026");
  });

  it("should format ISO dates correctly (2026-06-07 → 07/06/2026)", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    // 4th passenger has ISO date
    expect(sheet.getRow(7).getCell(8).value).toBe("07/06/2026");
  });

  it("should show status as 'Pago' for paid orders", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(6).value).toBe("Pago");
  });

  it("should show check-in status correctly", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(9).value).toBe("Pendente"); // pending
    expect(sheet.getRow(5).getCell(9).value).toBe("✓ Check-in"); // checked_in
  });

  it("should have correct number of data rows", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    // 4 passengers → rows 4-7
    expect(sheet.getRow(7).getCell(2).value).toBe("Ana Oliveira");
  });
});

describe("Professional Export - Financeiro Sheet", () => {
  it("should have correct title header", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    expect(sheet.getCell("A1").value).toBe("RELATÓRIO FINANCEIRO");
  });

  it("should have RESUMO FINANCEIRO section header", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    expect(sheet.getCell("A3").value).toBe("RESUMO FINANCEIRO");
  });

  it("should have correct column headers in row 4", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    const row4 = sheet.getRow(4);
    expect(row4.getCell(1).value).toBe("Categoria");
    expect(row4.getCell(2).value).toBe("Quantidade");
    expect(row4.getCell(3).value).toBe("Valor Bruto (R$)");
    expect(row4.getCell(4).value).toBe("Taxa Stripe (R$)");
    expect(row4.getCell(5).value).toBe("Valor Líquido (R$)");
  });

  it("should have event data with correct revenue values", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    // Row 5: first event
    expect(sheet.getRow(5).getCell(1).value).toBe("Pedro Leopoldo Rodeio Show 2026");
    expect(sheet.getRow(5).getCell(2).value).toBe(4); // passengerCount
    expect(sheet.getRow(5).getCell(3).value).toBe(240); // 24000 cents → R$240
    expect(sheet.getRow(5).getCell(4).value).toBe(24);  // 2400 cents → R$24
    expect(sheet.getRow(5).getCell(5).value).toBe(216); // net = 240 - 24
  });

  it("should have TOTAL CONFIRMADO row", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    // Total row is after all events (1 event → row 6)
    expect(sheet.getRow(6).getCell(1).value).toBe("TOTAL CONFIRMADO");
    expect(sheet.getRow(6).getCell(2).value).toBe(4); // totalPassengers
    expect(sheet.getRow(6).getCell(3).value).toBe(240); // totalRevenue in reais
    expect(sheet.getRow(6).getCell(4).value).toBe(24);  // totalFees in reais
    expect(sheet.getRow(6).getCell(5).value).toBe(216); // netRevenue in reais
  });
});

describe("Professional Export - Date Parsing", () => {
  it("should parse '05 de Junho de 2026' correctly", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        transportDate: "05 de Junho de 2026",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("05/06/2026");
  });

  it("should parse '12 Julho 2026' correctly", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        transportDate: "12 Julho 2026",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("12/07/2026");
  });

  it("should pass through DD/MM/YYYY format unchanged", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        transportDate: "05/06/2026",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("05/06/2026");
  });

  it("should parse ISO date format correctly", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        transportDate: "2026-06-05",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("05/06/2026");
  });

  it("should handle empty transport date gracefully", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        transportDate: "",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(8).value).toBe("");
  });
});

describe("Professional Export - Styling", () => {
  it("should use Arial font throughout", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    expect(sheet.getCell("A1").font?.name).toBe("Arial");
  });

  it("should use black background for main headers", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("📊 Dashboard")!;
    const fill = sheet.getCell("A1").fill as ExcelJS.FillPattern;
    expect(fill?.fgColor?.argb).toBe("FF1A1A1A");
  });

  it("should use gold for Passageiros column headers", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    const fill = sheet.getRow(3).getCell(1).fill as ExcelJS.FillPattern;
    expect(fill?.fgColor?.argb).toBe("FFD4AF37");
  });

  it("should use green for TOTAL row in Financeiro", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("💰 Financeiro")!;
    // Total row is row 6 (after 1 event)
    const fill = sheet.getRow(6).getCell(1).fill as ExcelJS.FillPattern;
    expect(fill?.fgColor?.argb).toBe("FF10B981");
  });

  it("should color-code paid status cells green", async () => {
    const buffer = await generateProfessionalExport(mockInput);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    const fill = sheet.getRow(4).getCell(6).fill as ExcelJS.FillPattern;
    expect(fill?.fgColor?.argb).toBe("FF10B981");
  });
});

describe("Professional Export - Special Characters", () => {
  it("should handle accented characters in names", async () => {
    const input: ExportInput = {
      ...mockInput,
      passengers: [{
        ...mockPassengers[0],
        name: "José da Silva Açúcar",
      }],
    };
    const buffer = await generateProfessionalExport(input);
    const wb = await parseWorkbook(buffer);
    const sheet = wb.getWorksheet("👥 Passageiros")!;
    expect(sheet.getRow(4).getCell(2).value).toBe("José da Silva Açúcar");
  });
});
