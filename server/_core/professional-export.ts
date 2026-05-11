import ExcelJS from "exceljs";

// Brand colors
const COLORS = {
  GOLD: "FFD4AF37",
  DARK_GOLD: "FFB8941F",
  BLACK: "FF1A1A1A",
  WHITE: "FFFFFFFF",
  LIGHT_GRAY: "FFF5F5F5",
  SUCCESS: "FF10B981",
  WARNING: "FFFCD34D",
  DANGER: "FFEF4444",
  LIGHT_BG: "FFFAFAFA",
};

interface ExportData {
  orders: any[];
  passengers: any[];
  eventName: string;
  eventDate: string;
}

export async function generateProfessionalExport(
  data: ExportData
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Create sheets
  createDashboardSheet(workbook, data);
  createPassengersSheet(workbook, data);
  createFinancialSheet(workbook, data);
  createBoardingPointSheet(workbook, data);
  createEventDateSheet(workbook, data);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
}

function createDashboardSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = workbook.addWorksheet("Dashboard");

  // Set column widths
  sheet.columns = [
    { width: 3 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ];

  // Header with branding
  const headerRow = sheet.addRow([]);
  headerRow.height = 40;
  const headerCell = sheet.getCell("B2");
  headerCell.value = "BUSFOLIA - RELATÓRIO PROFISSIONAL";
  headerCell.font = {
    name: "Arial",
    size: 24,
    bold: true,
    color: { argb: COLORS.GOLD },
  };
  (headerCell.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.BLACK },
  };

  // Generation timestamp
  const timestampRow = sheet.addRow([]);
  const timestampCell = sheet.getCell("B3");
  timestampCell.value = `Gerado em: ${new Date().toLocaleString("pt-BR")}`;
  timestampCell.font = { name: "Arial", size: 10, italic: true };

  // Metrics cards
  sheet.addRow([]);
  const metricsRow = 5;

  // Total Passengers
  const totalPassengers = data.passengers.length;
  createMetricCard(sheet, "B5", "Total de Passageiros", totalPassengers, COLORS.BLACK);

  // Confirmed Payments
  const confirmedPayments = data.orders.filter(
    (o) => o.paymentStatus === "paid"
  ).length;
  createMetricCard(
    sheet,
    "C5",
    "Pagamentos Confirmados",
    confirmedPayments,
    COLORS.SUCCESS
  );

  // Pending Payments
  const pendingPayments = data.orders.filter(
    (o) => o.paymentStatus === "pending"
  ).length;
  createMetricCard(
    sheet,
    "D5",
    "Aguardando Pagamento",
    pendingPayments,
    COLORS.WARNING
  );

  // Canceled
  const canceled = data.orders.filter((o) => o.paymentStatus === "canceled")
    .length;
  createMetricCard(sheet, "E5", "Cancelados", canceled, COLORS.DANGER);

  // Summary statistics
  sheet.addRow([]);
  const statsRow = sheet.addRow([
    "",
    "Conversão",
    `${((confirmedPayments / data.orders.length) * 100).toFixed(1)}%`,
  ]);
  statsRow.getCell(2).font = { bold: true };
  statsRow.getCell(3).font = { bold: true, color: { argb: COLORS.GOLD } };

  // Passengers by boarding point table
  sheet.addRow([]);
  const boardingPointHeader = sheet.addRow([
    "",
    "Ponto de Embarque",
    "Quantidade",
    "Percentual",
  ]);
  boardingPointHeader.font = {
    bold: true,
    color: { argb: COLORS.WHITE },
  };
  (boardingPointHeader.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.DARK_GOLD },
  };
  boardingPointHeader.border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // Group passengers by boarding point
  const boardingPointGroups = groupBy(data.passengers, "boardingPoint");
  Object.entries(boardingPointGroups).forEach(([point, passengers]) => {
    const row = sheet.addRow([
      "",
      point,
      (passengers as any[]).length,
      `${(((passengers as any[]).length / data.passengers.length) * 100).toFixed(1)}%`,
    ]);
    row.getCell(3).numFmt = "0";
  });
}

function createPassengersSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = workbook.addWorksheet("Passageiros");

  // Set column widths
  sheet.columns = [
    { width: 5 },
    { width: 20 },
    { width: 15 },
    { width: 20 },
    { width: 15 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
  ];

  // Header row
  const headerRow = sheet.addRow([
    "#",
    "Nome Completo",
    "CPF",
    "Email",
    "Telefone",
    "Ponto de Embarque",
    "Status",
    "Data de Viagem",
  ]);

  headerRow.font = {
    bold: true,
    color: { argb: COLORS.WHITE },
    size: 11,
  };
  (headerRow.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.DARK_GOLD },
  };
  headerRow.border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // Freeze header row
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  // Add data rows with formatting
  data.passengers.forEach((passenger, index) => {
    const row = sheet.addRow([
      index + 1,
      passenger.name || "",
      passenger.cpf || "",
      passenger.email || "",
      passenger.phone || "",
      passenger.boardingPoint || "",
      getStatusLabel(passenger.paymentStatus),
      formatDate(passenger.travelDate),
    ]);

    // Zebra striping
    if (index % 2 === 0) {
  (row.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.LIGHT_BG },
  };
    }

    // Status color coding
    const statusCell = row.getCell(7);
    if (passenger.paymentStatus === "paid") {
      (statusCell.fill as any) = {
        type: "solid",
        fgColor: { argb: COLORS.SUCCESS },
      };
    } else if (passenger.paymentStatus === "pending") {
      (statusCell.fill as any) = {
        type: "solid",
        fgColor: { argb: COLORS.WARNING },
      };
    } else if (passenger.paymentStatus === "canceled") {
      (statusCell.fill as any) = {
        type: "solid",
        fgColor: { argb: COLORS.DANGER },
      };
    }

    // Borders
    row.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Auto filter
  if (sheet.autoFilter) {
    (sheet.autoFilter as any).from = "A1";
    (sheet.autoFilter as any).to = `H${data.passengers.length + 1}`;
  }
}

function createFinancialSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = workbook.addWorksheet("Financeiro");

  sheet.columns = [
    { width: 3 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
  ];

  // Header
  const headerRow = sheet.addRow([]);
  headerRow.height = 30;
  const headerCell = sheet.getCell("B1");
  headerCell.value = "RELATÓRIO FINANCEIRO";
  headerCell.font = {
    name: "Arial",
    size: 18,
    bold: true,
    color: { argb: COLORS.GOLD },
  };

  sheet.addRow([]);

  // Revenue by status
  const revenueHeader = sheet.addRow([
    "",
    "Status",
    "Quantidade",
    "Valor Total",
  ]);
  revenueHeader.font = { bold: true, color: { argb: COLORS.WHITE } };
  (revenueHeader.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.DARK_GOLD },
  };

  // Calculate totals by status
  const statuses = ["paid", "pending", "canceled"];
  statuses.forEach((status) => {
    const orders = data.orders.filter((o) => o.paymentStatus === status);
    const total = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);

    const row = sheet.addRow([
      "",
      getStatusLabel(status),
      orders.length,
      formatCurrency(total),
    ]);

    if (status === "paid") {
      (row.fill as any) = { type: "solid", fgColor: { argb: COLORS.SUCCESS } };
    } else if (status === "pending") {
      (row.fill as any) = { type: "solid", fgColor: { argb: COLORS.WARNING } };
    } else {
      (row.fill as any) = { type: "solid", fgColor: { argb: COLORS.DANGER } };
    }
  });

  // Summary
  sheet.addRow([]);
  const totalRevenue = data.orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const stripeFee = totalRevenue * 0.1;
  const netRevenue = totalRevenue - stripeFee;

  const summaryRows = [
    ["", "Receita Bruta", "", formatCurrency(totalRevenue)],
    ["", "Taxa Stripe (10%)", "", formatCurrency(stripeFee)],
    ["", "Receita Líquida", "", formatCurrency(netRevenue)],
  ];

  summaryRows.forEach((rowData, index) => {
    const row = sheet.addRow(rowData);
    if (index === 2) {
      row.font = { bold: true, color: { argb: COLORS.WHITE } };
      (row.fill as any) = { type: "solid", fgColor: { argb: COLORS.SUCCESS } };
    }
  });
}

function createBoardingPointSheet(
  workbook: ExcelJS.Workbook,
  data: ExportData
) {
  const sheet = workbook.addWorksheet("Por Ponto de Embarque");

  sheet.columns = [
    { width: 3 },
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  // Header
  const headerRow = sheet.addRow([
    "",
    "Ponto de Embarque",
    "Passageiros",
    "Percentual",
    "Indicador",
  ]);
  headerRow.font = { bold: true, color: { argb: COLORS.WHITE } };
  (headerRow.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.DARK_GOLD },
  };

  // Group by boarding point
  const boardingPointGroups = groupBy(data.passengers, "boardingPoint");
  const maxPassengers = Math.max(
    ...Object.values(boardingPointGroups).map((g) => (g as any[]).length)
  );

  Object.entries(boardingPointGroups).forEach(([point, passengers]) => {
    const count = (passengers as any[]).length;
    const percentage = ((count / data.passengers.length) * 100).toFixed(1);
    const utilization = (count / maxPassengers) * 100;

    const row = sheet.addRow([
      "",
      point,
      count,
      `${percentage}%`,
      getUtilizationIndicator(utilization),
    ]);

    // Color code utilization
    const indicatorCell = row.getCell(5);
    if (utilization >= 80) {
      (indicatorCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.SUCCESS } };
    } else if (utilization >= 50) {
      (indicatorCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.WARNING } };
    } else {
      (indicatorCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.DANGER } };
    }
  });
}

function createEventDateSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const sheet = workbook.addWorksheet("Por Data de Viagem");

  sheet.columns = [
    { width: 3 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  // Header
  const headerRow = sheet.addRow([
    "",
    "Data de Viagem",
    "Passageiros",
    "Percentual",
    "Capacidade",
  ]);
  headerRow.font = { bold: true, color: { argb: COLORS.WHITE } };
  (headerRow.fill as any) = {
    type: "solid",
    fgColor: { argb: COLORS.DARK_GOLD },
  };

  // Group by travel date
  const dateGroups = groupBy(data.passengers, "travelDate");
  Object.entries(dateGroups)
    .sort()
    .forEach(([date, passengers]) => {
      const count = (passengers as any[]).length;
      const percentage = ((count / data.passengers.length) * 100).toFixed(1);

      const row = sheet.addRow([
        "",
        formatDate(date),
        count,
        `${percentage}%`,
        `${count}/50`, // Assuming 50 seat capacity
      ]);

      // Capacity indicator
      const capacityCell = row.getCell(5);
      if (count >= 40) {
        (capacityCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.SUCCESS } };
      } else if (count >= 25) {
        (capacityCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.WARNING } };
      }
    });
}

// Helper functions
function createMetricCard(
  sheet: ExcelJS.Worksheet,
  cell: string,
  label: string,
  value: number,
  bgColor: string
) {
  const labelCell = sheet.getCell(cell);
  labelCell.value = label;
  labelCell.font = {
    bold: true,
    size: 10,
    color: { argb: COLORS.WHITE },
  };
  (labelCell.fill as any) = { type: "solid", fgColor: { argb: bgColor } };
  (labelCell.alignment as any) = { horizontal: "center", vertical: "center" };

  const valueCell = sheet.getCell(`${String.fromCharCode(cell.charCodeAt(0))}6`);
  valueCell.value = value;
  valueCell.font = {
    bold: true,
    size: 16,
    color: { argb: COLORS.GOLD },
  };
  (valueCell.fill as any) = { type: "solid", fgColor: { argb: COLORS.BLACK } };
  (valueCell.alignment as any) = { horizontal: "center", vertical: "center" };
}

function groupBy(arr: any[], key: string): Record<string, any[]> {
  return arr.reduce(
    (result, item) => {
      const groupKey = item[key] || "N/A";
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, any[]>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: "🟢 Pago",
    pending: "🟡 Aguardando Pagamento",
    canceled: "🔴 Cancelado",
    pending_checkout: "🟡 Aguardando Pagamento",
  };
  return labels[status] || status;
}

function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getUtilizationIndicator(percentage: number): string {
  if (percentage >= 80) return "🟢 Alto";
  if (percentage >= 50) return "🟡 Médio";
  return "🔴 Baixo";
}
