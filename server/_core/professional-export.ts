import ExcelJS from "exceljs";

// ─── Brand Colors (ARGB format for ExcelJS) ───
const COLORS = {
  GOLD: "FFD4AF37",
  DARK_GOLD: "FFB8941F",
  BLACK: "FF1A1A1A",
  WHITE: "FFFFFFFF",
  LIGHT_GRAY: "FFF5F5F5",
  GREEN: "FF10B981",
  YELLOW: "FFFCD34D",
  RED: "FFEF4444",
};

// ─── Types ───
export interface EnrichedPassenger {
  id: number;
  name: string;
  cpf: string;
  eventName: string;
  orderShortId: string;
  orderStatus: string;
  boardingPoint: string;
  transportDate: string;
  checkInStatus: string;
}

export interface EnrichedOrder {
  pedido: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  pontoEmbarque: string;
  datasTransporte: string;
  quantidadePassageiros: number;
  valorTotal: string;
  status: string;
  dataCompra: string;
}

export interface FinancialData {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  totalOrders: number;
  totalPassengers: number;
  byEvent: Array<{
    eventId: number;
    eventName: string;
    totalRevenue: number;
    totalFees: number;
    orderCount: number;
    passengerCount: number;
  }>;
}

export interface DashboardMetrics {
  totalPassengers: number;
  paidPassengers: number;
  pendingPassengers: number;
  canceledPassengers: number;
  boardingPointCounts: Record<string, number>;
}

export interface ExportInput {
  passengers: EnrichedPassenger[];
  orders: EnrichedOrder[];
  financialData: FinancialData;
  dashboardMetrics: DashboardMetrics;
}

// ─── Portuguese Month Map (for date parsing) ───
const MONTH_MAP: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3,
  maio: 4, junho: 5, julho: 6, agosto: 7,
  setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
};

/**
 * Parse transport date strings (stored as JSON in DB) into DD/MM/YYYY format.
 * Handles: "05 de Junho de 2026", "05 Junho 2026", "2026-06-05", "05/06/2026"
 */
function parseTransportDate(dateStr: string): string {
  if (!dateStr || dateStr === "N/A" || dateStr === "") return "";

  // Already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  // ISO format: 2026-06-05
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Portuguese format: "05 de Junho de 2026" or "05 Junho 2026"
  const cleaned = dateStr.replace(/\bde\b/gi, "").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(" ");
  if (parts.length >= 2) {
    const day = parts[0].padStart(2, "0");
    const monthName = parts[1].toLowerCase();
    const month = MONTH_MAP[monthName];
    const year = parts[2] || "2026";

    if (month !== undefined) {
      return `${day}/${String(month + 1).padStart(2, "0")}/${year}`;
    }
  }

  // Fallback: try native Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    if (year >= 2020 && year <= 2030) {
      return d.toLocaleDateString("pt-BR");
    }
  }

  return dateStr;
}

/**
 * Get status label in Portuguese
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case "paid": return "Pago";
    case "pending":
    case "pending_checkout": return "Aguardando Pagamento";
    case "canceled":
    case "failed": return "Cancelado";
    default: return status;
  }
}

/**
 * Format cents to BRL currency string
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// ─── Shared Style Helpers ───
function setFill(cell: ExcelJS.Cell, argb: string) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function setBorder(row: ExcelJS.Row, colCount: number) {
  for (let i = 1; i <= colCount; i++) {
    row.getCell(i).border = {
      top: { style: "thin", color: { argb: "FFE0E0E0" } },
      bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
      left: { style: "thin", color: { argb: "FFE0E0E0" } },
      right: { style: "thin", color: { argb: "FFE0E0E0" } },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════

export async function generateProfessionalExport(input: ExportInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BusFolia Premium";
  workbook.created = new Date();

  createDashboardSheet(workbook, input);
  createPassengersSheet(workbook, input);
  createFinancialSheet(workbook, input);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
}

// ═══════════════════════════════════════════════════════════════════
// SHEET 1: 📊 DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function createDashboardSheet(workbook: ExcelJS.Workbook, input: ExportInput) {
  const sheet = workbook.addWorksheet("📊 Dashboard");
  const { dashboardMetrics, passengers } = input;

  // Column widths (A-H)
  sheet.columns = [
    { width: 25 }, { width: 25 }, { width: 25 }, { width: 25 },
    { width: 25 }, { width: 25 }, { width: 25 }, { width: 25 },
  ];

  // ─── Row 1: Main Header ───
  sheet.mergeCells("A1:H1");
  const headerCell = sheet.getCell("A1");
  headerCell.value = "BUSFOLIA - RELATÓRIO DE PASSAGEIROS";
  headerCell.font = { name: "Arial", size: 24, bold: true, color: { argb: COLORS.WHITE } };
  headerCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(headerCell, COLORS.BLACK);
  sheet.getRow(1).height = 45;

  // ─── Row 2: Subtitle ───
  sheet.mergeCells("A2:H2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = "Transporte Premium para Eventos";
  subtitleCell.font = { name: "Arial", size: 12, color: { argb: COLORS.WHITE } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(subtitleCell, COLORS.BLACK);
  sheet.getRow(2).height = 25;

  // ─── Row 3: Empty spacer ───
  sheet.getRow(3).height = 10;

  // ─── Row 4-5: Metric Cards ───
  // Card 1: Total Passageiros (Black)
  const totalP = dashboardMetrics.totalPassengers;
  sheet.getCell("A4").value = "Total Passageiros";
  sheet.getCell("A4").font = { name: "Arial", size: 10, color: { argb: COLORS.WHITE } };
  sheet.getCell("A4").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("A4"), COLORS.BLACK);
  sheet.mergeCells("A4:B4");

  sheet.getCell("A5").value = totalP;
  sheet.getCell("A5").font = { name: "Arial", size: 36, bold: true, color: { argb: COLORS.WHITE } };
  sheet.getCell("A5").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("A5"), COLORS.BLACK);
  sheet.mergeCells("A5:B5");

  // Card 2: Pagos (Green)
  const paidP = dashboardMetrics.paidPassengers;
  sheet.getCell("C4").value = "Pagos";
  sheet.getCell("C4").font = { name: "Arial", size: 10, color: { argb: COLORS.WHITE } };
  sheet.getCell("C4").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("C4"), COLORS.GREEN);
  sheet.mergeCells("C4:D4");

  sheet.getCell("C5").value = paidP;
  sheet.getCell("C5").font = { name: "Arial", size: 36, bold: true, color: { argb: COLORS.WHITE } };
  sheet.getCell("C5").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("C5"), COLORS.GREEN);
  sheet.mergeCells("C5:D5");

  // Card 3: Aguardando (Yellow)
  const pendingP = dashboardMetrics.pendingPassengers;
  sheet.getCell("E4").value = "Aguardando";
  sheet.getCell("E4").font = { name: "Arial", size: 10, color: { argb: COLORS.BLACK } };
  sheet.getCell("E4").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("E4"), COLORS.YELLOW);
  sheet.mergeCells("E4:F4");

  sheet.getCell("E5").value = pendingP;
  sheet.getCell("E5").font = { name: "Arial", size: 36, bold: true, color: { argb: COLORS.BLACK } };
  sheet.getCell("E5").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("E5"), COLORS.YELLOW);
  sheet.mergeCells("E5:F5");

  // Card 4: Cancelados (Red)
  const canceledP = dashboardMetrics.canceledPassengers;
  sheet.getCell("G4").value = "Cancelados";
  sheet.getCell("G4").font = { name: "Arial", size: 10, color: { argb: COLORS.WHITE } };
  sheet.getCell("G4").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("G4"), COLORS.RED);
  sheet.mergeCells("G4:H4");

  sheet.getCell("G5").value = canceledP;
  sheet.getCell("G5").font = { name: "Arial", size: 36, bold: true, color: { argb: COLORS.WHITE } };
  sheet.getCell("G5").alignment = { horizontal: "center", vertical: "middle" };
  setFill(sheet.getCell("G5"), COLORS.RED);
  sheet.mergeCells("G5:H5");

  sheet.getRow(4).height = 25;
  sheet.getRow(5).height = 50;

  // ─── Row 6: Empty spacer ───
  sheet.getRow(6).height = 10;

  // ─── Row 7: Conversion Rate Banner ───
  const conversionRate = totalP > 0 ? ((paidP / totalP) * 100).toFixed(1) : "0.0";
  sheet.mergeCells("A7:H7");
  const convCell = sheet.getCell("A7");
  convCell.value = `Taxa de Conversão: ${conversionRate}%`;
  convCell.font = { name: "Arial", size: 14, bold: true, color: { argb: COLORS.WHITE } };
  convCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(convCell, COLORS.GOLD);
  sheet.getRow(7).height = 35;

  // ─── Row 8: Empty spacer ───
  sheet.getRow(8).height = 10;

  // ─── Row 9: Boarding Points Section Header ───
  sheet.mergeCells("A9:H9");
  const bpHeaderCell = sheet.getCell("A9");
  bpHeaderCell.value = "PASSAGEIROS POR PONTO DE EMBARQUE";
  bpHeaderCell.font = { name: "Arial", size: 12, bold: true, color: { argb: COLORS.WHITE } };
  bpHeaderCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(bpHeaderCell, COLORS.DARK_GOLD);
  sheet.getRow(9).height = 30;

  // ─── Row 10: Table Headers ───
  const tableHeaders = ["Ponto de Embarque", "Quantidade", "%"];
  const headerRow = sheet.getRow(10);
  headerRow.getCell(1).value = tableHeaders[0];
  headerRow.getCell(2).value = tableHeaders[1];
  headerRow.getCell(3).value = tableHeaders[2];
  for (let i = 1; i <= 3; i++) {
    const cell = headerRow.getCell(i);
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLORS.WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    setFill(cell, COLORS.BLACK);
  }
  headerRow.height = 25;

  // ─── Rows 11+: Boarding Point Data ───
  const bpCounts = dashboardMetrics.boardingPointCounts;
  const sortedBPs = Object.entries(bpCounts).sort((a, b) => b[1] - a[1]);
  let rowIdx = 11;
  sortedBPs.forEach(([point, count], idx) => {
    const pct = totalP > 0 ? ((count / totalP) * 100).toFixed(1) : "0.0";
    const row = sheet.getRow(rowIdx);
    row.getCell(1).value = point || "Não informado";
    row.getCell(1).font = { name: "Arial", size: 11 };
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).value = count;
    row.getCell(2).font = { name: "Arial", size: 11, bold: true };
    row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(3).value = `${pct}%`;
    row.getCell(3).font = { name: "Arial", size: 11 };
    row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

    // Zebra striping
    if (idx % 2 === 0) {
      for (let i = 1; i <= 3; i++) {
        setFill(row.getCell(i), COLORS.LIGHT_GRAY);
      }
    }
    setBorder(row, 3);
    row.height = 22;
    rowIdx++;
  });
}

// ═══════════════════════════════════════════════════════════════════
// SHEET 2: 👥 PASSAGEIROS
// ═══════════════════════════════════════════════════════════════════

function createPassengersSheet(workbook: ExcelJS.Workbook, input: ExportInput) {
  const sheet = workbook.addWorksheet("👥 Passageiros");
  const { passengers } = input;

  // Column widths: # | Nome | CPF | Evento | Pedido | Status | Ponto de Embarque | Data Viagem | Ingresso
  sheet.columns = [
    { width: 6 },   // A: #
    { width: 30 },  // B: Nome
    { width: 16 },  // C: CPF
    { width: 30 },  // D: Evento
    { width: 12 },  // E: Pedido
    { width: 22 },  // F: Status
    { width: 35 },  // G: Ponto de Embarque
    { width: 16 },  // H: Data Viagem
    { width: 14 },  // I: Ingresso
  ];

  // ─── Row 1: Title Header ───
  sheet.mergeCells("A1:I1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "BUSFOLIA - LISTA DE PASSAGEIROS";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: COLORS.WHITE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(titleCell, COLORS.BLACK);
  sheet.getRow(1).height = 35;

  // ─── Row 2: Empty spacer ───
  sheet.getRow(2).height = 8;

  // ─── Row 3: Column Headers (Gold) ───
  const headers = ["#", "Nome", "CPF", "Evento", "Pedido", "Status", "Ponto de Embarque", "Data Viagem", "Ingresso"];
  const headerRow = sheet.getRow(3);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLORS.WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    setFill(cell, COLORS.GOLD);
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.DARK_GOLD } },
      bottom: { style: "thin", color: { argb: COLORS.DARK_GOLD } },
      left: { style: "thin", color: { argb: COLORS.DARK_GOLD } },
      right: { style: "thin", color: { argb: COLORS.DARK_GOLD } },
    };
  });
  headerRow.height = 28;

  // Freeze panes at A4 (freeze row 3)
  sheet.views = [{ state: "frozen", ySplit: 3, xSplit: 0 }];

  // AutoFilter on row 3
  sheet.autoFilter = { from: "A3", to: "I3" };

  // ─── Data Rows ───
  // Only include paid passengers (already filtered by getPassengersForExport which joins on paid orders)
  passengers.forEach((p, idx) => {
    const rowNum = idx + 4; // Start at row 4
    const row = sheet.getRow(rowNum);

    const statusLabel = getStatusLabel(p.orderStatus);
    const travelDate = parseTransportDate(p.transportDate);
    const checkInLabel = p.checkInStatus === "checked_in" ? "✓ Check-in" : "Pendente";

    row.getCell(1).value = idx + 1;
    row.getCell(2).value = p.name;
    row.getCell(3).value = p.cpf;
    row.getCell(4).value = p.eventName;
    row.getCell(5).value = p.orderShortId;
    row.getCell(6).value = statusLabel;
    row.getCell(7).value = p.boardingPoint;
    row.getCell(8).value = travelDate;
    row.getCell(9).value = checkInLabel;

    // Font for all cells
    for (let i = 1; i <= 9; i++) {
      row.getCell(i).font = { name: "Arial", size: 10 };
      row.getCell(i).alignment = { horizontal: i === 1 ? "center" : "left", vertical: "middle" };
    }
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(9).alignment = { horizontal: "center", vertical: "middle" };

    // Zebra striping
    if (idx % 2 === 0) {
      for (let i = 1; i <= 9; i++) {
        setFill(row.getCell(i), COLORS.LIGHT_GRAY);
      }
    }

    // Status color coding
    const statusCell = row.getCell(6);
    if (p.orderStatus === "paid") {
      setFill(statusCell, COLORS.GREEN);
      statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: COLORS.WHITE } };
    } else if (p.orderStatus === "pending" || p.orderStatus === "pending_checkout") {
      setFill(statusCell, COLORS.YELLOW);
      statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: COLORS.BLACK } };
    } else if (p.orderStatus === "canceled" || p.orderStatus === "failed") {
      setFill(statusCell, COLORS.RED);
      statusCell.font = { name: "Arial", size: 10, bold: true, color: { argb: COLORS.WHITE } };
    }

    // Borders
    setBorder(row, 9);
    row.height = 22;
  });
}

// ═══════════════════════════════════════════════════════════════════
// SHEET 3: 💰 FINANCEIRO
// ═══════════════════════════════════════════════════════════════════

function createFinancialSheet(workbook: ExcelJS.Workbook, input: ExportInput) {
  const sheet = workbook.addWorksheet("💰 Financeiro");
  const { financialData } = input;

  // Column widths: A-F
  sheet.columns = [
    { width: 30 }, // A: Categoria / Evento
    { width: 18 }, // B: Quantidade
    { width: 22 }, // C: Valor Bruto (R$)
    { width: 22 }, // D: Taxa Stripe (R$)
    { width: 22 }, // E: Valor Líquido (R$)
    { width: 5 },  // F: spacer
  ];

  // ─── Row 1: Title Header ───
  sheet.mergeCells("A1:E1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "RELATÓRIO FINANCEIRO";
  titleCell.font = { name: "Arial", size: 18, bold: true, color: { argb: COLORS.WHITE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(titleCell, COLORS.BLACK);
  sheet.getRow(1).height = 40;

  // ─── Row 2: Empty spacer ───
  sheet.getRow(2).height = 10;

  // ─── Row 3: Section Header ───
  sheet.mergeCells("A3:E3");
  const sectionCell = sheet.getCell("A3");
  sectionCell.value = "RESUMO FINANCEIRO";
  sectionCell.font = { name: "Arial", size: 14, bold: true, color: { argb: COLORS.WHITE } };
  sectionCell.alignment = { horizontal: "center", vertical: "middle" };
  setFill(sectionCell, COLORS.DARK_GOLD);
  sheet.getRow(3).height = 32;

  // ─── Row 4: Column Headers ───
  const headers = ["Categoria", "Quantidade", "Valor Bruto (R$)", "Taxa Stripe (R$)", "Valor Líquido (R$)"];
  const headerRow = sheet.getRow(4);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLORS.WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    setFill(cell, COLORS.BLACK);
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
  headerRow.height = 28;

  // ─── Rows 5+: Event Data ───
  let dataRowIdx = 5;
  financialData.byEvent.forEach((evt, idx) => {
    const row = sheet.getRow(dataRowIdx);
    row.getCell(1).value = evt.eventName;
    row.getCell(2).value = evt.passengerCount;
    row.getCell(3).value = evt.totalRevenue / 100; // Convert cents to reais
    row.getCell(4).value = evt.totalFees / 100;
    row.getCell(5).value = (evt.totalRevenue - evt.totalFees) / 100;

    // Formatting
    for (let i = 1; i <= 5; i++) {
      const cell = row.getCell(i);
      cell.font = { name: "Arial", size: 11 };
      cell.alignment = { horizontal: i === 1 ? "left" : "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
    }

    // Number format for currency columns
    row.getCell(3).numFmt = "#,##0.00";
    row.getCell(4).numFmt = "#,##0.00";
    row.getCell(5).numFmt = "#,##0.00";

    // Zebra striping
    if (idx % 2 === 0) {
      for (let i = 1; i <= 5; i++) {
        setFill(row.getCell(i), COLORS.LIGHT_GRAY);
      }
    }

    row.height = 24;
    dataRowIdx++;
  });

  // ─── TOTAL Row (Green) ───
  const totalRow = sheet.getRow(dataRowIdx);
  totalRow.getCell(1).value = "TOTAL CONFIRMADO";
  totalRow.getCell(2).value = financialData.totalPassengers;
  totalRow.getCell(3).value = financialData.totalRevenue / 100;
  totalRow.getCell(4).value = financialData.totalFees / 100;
  totalRow.getCell(5).value = financialData.netRevenue / 100;

  for (let i = 1; i <= 5; i++) {
    const cell = totalRow.getCell(i);
    cell.font = { name: "Arial", size: 12, bold: true, color: { argb: COLORS.WHITE } };
    cell.alignment = { horizontal: i === 1 ? "left" : "center", vertical: "middle" };
    setFill(cell, COLORS.GREEN);
    cell.border = {
      top: { style: "medium" },
      bottom: { style: "medium" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  }
  totalRow.getCell(3).numFmt = "#,##0.00";
  totalRow.getCell(4).numFmt = "#,##0.00";
  totalRow.getCell(5).numFmt = "#,##0.00";
  totalRow.height = 30;

  // ─── Summary Section Below ───
  const summaryStartRow = dataRowIdx + 2;

  // Receita Bruta
  const grossRow = sheet.getRow(summaryStartRow);
  grossRow.getCell(1).value = "Receita Bruta Total";
  grossRow.getCell(1).font = { name: "Arial", size: 11, bold: true };
  grossRow.getCell(2).value = formatCurrency(financialData.totalRevenue);
  grossRow.getCell(2).font = { name: "Arial", size: 11 };

  // Taxa
  const feeRow = sheet.getRow(summaryStartRow + 1);
  feeRow.getCell(1).value = "Total Taxas";
  feeRow.getCell(1).font = { name: "Arial", size: 11, bold: true };
  feeRow.getCell(2).value = formatCurrency(financialData.totalFees);
  feeRow.getCell(2).font = { name: "Arial", size: 11, color: { argb: COLORS.RED } };

  // Líquido
  const netRow = sheet.getRow(summaryStartRow + 2);
  netRow.getCell(1).value = "Receita Líquida";
  netRow.getCell(1).font = { name: "Arial", size: 12, bold: true };
  netRow.getCell(2).value = formatCurrency(financialData.netRevenue);
  netRow.getCell(2).font = { name: "Arial", size: 12, bold: true, color: { argb: COLORS.GREEN } };

  // Generation timestamp
  const tsRow = sheet.getRow(summaryStartRow + 4);
  tsRow.getCell(1).value = `Gerado em: ${new Date().toLocaleString("pt-BR")}`;
  tsRow.getCell(1).font = { name: "Arial", size: 9, italic: true, color: { argb: "FF999999" } };
}
