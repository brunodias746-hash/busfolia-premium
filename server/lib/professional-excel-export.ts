import ExcelJS from 'exceljs';

// Professional color palette (hex with FF prefix for Excel)
export const COLORS = {
  DARK: 'FF1A1A1A',
  GOLD: 'FFD4AF37',
  DARK_GOLD: 'FFB8941F',
  GREEN: 'FF10B981',
  YELLOW: 'FFFCD34D',
  RED: 'FFEF4444',
  LIGHT_GRAY: 'FFF5F5F5',
  WHITE: 'FFFFFFFF',
  GRAY_TEXT: 'FF999999',
};

export interface ExportData {
  dashboardMetrics: {
    total: number;
    paid: number;
    pending: number;
    cancelled: number;
    conversionRate: number;
    byBoardingPoint: Array<{ point: string; count: number }>;
    byDate: Array<{ date: string; count: number }>;
  };
  dataRows: Array<Record<string, any>>;
  dataColumns: Array<{ header: string; key: string; width?: number }>;
  financialData: Array<{
    category: string;
    quantity: number;
    grossValue: number;
    fees: number;
    netValue: number;
  }>;
  financialTotals: {
    totalQuantity: number;
    totalGross: number;
    totalFees: number;
    totalNet: number;
  };
}

/**
 * Create a professional 3-tab Excel workbook
 */
export async function createProfessionalExcel(data: ExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Create 3 sheets
  createDashboardSheet(workbook, data);
  createDataSheet(workbook, data);
  createFinancialSheet(workbook, data);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
}

function createDashboardSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const ws = workbook.addWorksheet('📊 Dashboard');
  let row = 1;

  // Title
  const titleCell = ws.getCell(row, 1);
  titleCell.value = 'BUSFOLIA - RELATÓRIO';
  titleCell.font = { bold: true, size: 24, color: { argb: COLORS.WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.mergeCells(row, 1, row, 5);
  ws.getRow(row).height = 35;
  row++;

  // Subtitle
  const subtitleCell = ws.getCell(row, 1);
  subtitleCell.value = 'Transporte Premium para Eventos';
  subtitleCell.font = { size: 12, color: { argb: COLORS.DARK } };
  ws.mergeCells(row, 1, row, 5);
  row += 2;

  // Status cards
  const metrics = data.dashboardMetrics;
  const cards = [
    { label: 'Total', value: metrics.total, color: COLORS.DARK },
    { label: 'Pagos', value: metrics.paid, color: COLORS.GREEN },
    { label: 'Aguardando', value: metrics.pending, color: COLORS.YELLOW },
    { label: 'Cancelados', value: metrics.cancelled, color: COLORS.RED },
  ];

  // Status row
  cards.forEach((card, idx) => {
    const cell = ws.getCell(row, idx + 1);
    cell.value = card.label;
    cell.font = { bold: true, size: 11, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: card.color } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getColumn(idx + 1).width = 18;
  });
  row++;

  // Numbers row
  cards.forEach((card, idx) => {
    const cell = ws.getCell(row, idx + 1);
    cell.value = card.value;
    cell.font = { bold: true, size: 36, color: { argb: COLORS.DARK } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ws.getRow(row).height = 50;
  row += 2;

  // Conversion rate
  const conversionCell = ws.getCell(row, 1);
  conversionCell.value = `Taxa de Conversão: ${metrics.conversionRate.toFixed(1)}%`;
  conversionCell.font = { bold: true, size: 14, color: { argb: COLORS.WHITE } };
  conversionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GOLD } };
  ws.mergeCells(row, 1, row, 5);
  row += 2;

  // Boarding points section
  const bpHeaderCell = ws.getCell(row, 1);
  bpHeaderCell.value = 'PASSAGEIROS POR PONTO DE EMBARQUE';
  bpHeaderCell.font = { bold: true, size: 12, color: { argb: COLORS.WHITE } };
  bpHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK_GOLD } };
  ws.mergeCells(row, 1, row, 5);
  row++;

  // Headers
  ['Ponto de Embarque', 'Quantidade'].forEach((header, idx) => {
    const cell = ws.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, size: 11, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
    cell.alignment = { horizontal: 'center' };
  });
  row++;

  // Data rows with alternating colors
  metrics.byBoardingPoint.forEach((item, idx) => {
    const bgColor = idx % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    [item.point, item.count].forEach((value, colIdx) => {
      const cell = ws.getCell(row, colIdx + 1);
      cell.value = value;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { horizontal: colIdx === 0 ? 'left' : 'center' };
    });
    row++;
  });

  // Set column widths
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 15;
}

function createDataSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const ws = workbook.addWorksheet('👥 Passageiros');
  let row = 1;

  // Title
  const titleCell = ws.getCell(row, 1);
  titleCell.value = 'PASSAGEIROS';
  titleCell.font = { bold: true, size: 16, color: { argb: COLORS.WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
  ws.mergeCells(row, 1, row, data.dataColumns.length);
  row += 2;

  // Headers
  data.dataColumns.forEach((col, idx) => {
    const cell = ws.getCell(row, idx + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 11, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GOLD } };
    cell.alignment = { horizontal: 'center', wrapText: true };
    ws.getColumn(idx + 1).width = col.width || 18;
  });
  row++;

  // Data rows with alternating colors
  data.dataRows.forEach((rowData, idx) => {
    const bgColor = idx % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    data.dataColumns.forEach((col, colIdx) => {
      const cell = ws.getCell(row, colIdx + 1);
      const value = rowData[col.key];
      cell.value = value;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.font = { size: 10 };
      cell.alignment = { horizontal: 'left', wrapText: true };

      // Color-code status column
      if (col.key === 'status' && value) {
        const statusValue = String(value).toLowerCase();
        if (statusValue.includes('pago')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GREEN } };
          cell.font = { bold: true, size: 10, color: { argb: COLORS.WHITE } };
        } else if (statusValue.includes('aguardando')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.YELLOW } };
          cell.font = { bold: true, size: 10, color: { argb: COLORS.DARK } };
        } else if (statusValue.includes('cancelado')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.RED } };
          cell.font = { bold: true, size: 10, color: { argb: COLORS.WHITE } };
        }
      }
    });
    row++;
  });
}

function createFinancialSheet(workbook: ExcelJS.Workbook, data: ExportData) {
  const ws = workbook.addWorksheet('💰 Financeiro');
  let row = 1;

  // Title
  const titleCell = ws.getCell(row, 1);
  titleCell.value = 'RELATÓRIO FINANCEIRO';
  titleCell.font = { bold: true, size: 18, color: { argb: COLORS.WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
  ws.mergeCells(row, 1, row, 5);
  row += 2;

  // Summary header
  const summaryCell = ws.getCell(row, 1);
  summaryCell.value = 'RESUMO FINANCEIRO';
  summaryCell.font = { bold: true, size: 14, color: { argb: COLORS.WHITE } };
  summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK_GOLD } };
  ws.mergeCells(row, 1, row, 5);
  row++;

  // Headers
  const headers = ['Categoria', 'Quantidade', 'Valor Bruto (R$)', 'Taxa Stripe (R$)', 'Valor Líquido (R$)'];
  headers.forEach((header, idx) => {
    const cell = ws.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, size: 11, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.DARK } };
    cell.alignment = { horizontal: 'center' };
  });
  row++;

  // Data rows
  data.financialData.forEach((item, idx) => {
    const bgColor = idx % 2 === 0 ? COLORS.LIGHT_GRAY : COLORS.WHITE;
    const values = [item.category, item.quantity, item.grossValue.toFixed(2), item.fees.toFixed(2), item.netValue.toFixed(2)];
    values.forEach((value, colIdx) => {
      const cell = ws.getCell(row, colIdx + 1);
      cell.value = value;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { horizontal: colIdx === 0 ? 'left' : 'right' };
    });
    row++;
  });

  // Total row
  const totalValues = [
    'TOTAL CONFIRMADO',
    data.financialTotals.totalQuantity,
    data.financialTotals.totalGross.toFixed(2),
    data.financialTotals.totalFees.toFixed(2),
    data.financialTotals.totalNet.toFixed(2),
  ];
  totalValues.forEach((value, colIdx) => {
    const cell = ws.getCell(row, colIdx + 1);
    cell.value = value;
    cell.font = { bold: true, size: 12, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GREEN } };
    cell.alignment = { horizontal: colIdx === 0 ? 'left' : 'right' };
  });
  row += 2;

  // Summary section
  const summaryRows = [
    ['Receita Bruta Total', `R$ ${data.financialTotals.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ['Total Taxas', `R$ ${data.financialTotals.totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ['Receita Líquida', `R$ ${data.financialTotals.totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
  ];

  summaryRows.forEach((item, idx) => {
    const labelCell = ws.getCell(row, 1);
    labelCell.value = item[0];
    labelCell.font = { bold: true, size: 11 };

    const valueCell = ws.getCell(row, 2);
    valueCell.value = item[1];
    valueCell.font = {
      bold: idx === 2,
      size: idx === 2 ? 12 : 11,
      color: { argb: idx === 1 ? COLORS.RED : idx === 2 ? COLORS.GREEN : undefined },
    };
    row++;
  });

  row++;

  // Timestamp
  const now = new Date();
  const timestamp = `Gerado em: ${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`;
  const tsCell = ws.getCell(row, 1);
  tsCell.value = timestamp;
  tsCell.font = { size: 9, color: { argb: COLORS.GRAY_TEXT } };

  // Set column widths
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 15;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 18;
}
