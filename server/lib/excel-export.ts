import ExcelJS from "exceljs";

export interface PassengerData {
  id: number;
  name: string;
  cpf: string;
  eventName: string;
  orderId: string;
  status: "Pago" | "Pendente" | "Cancelado";
  boardingPoint: string;
  travelDate: string;
  ticketStatus: "Enviado" | "Pendente";
}

export interface FinancialData {
  eventName: string;
  quantity: number;
  grossValue: number;
  stripeFee: number;
  netValue: number;
}

export async function generatePassengerExcel(
  passengers: PassengerData[],
  financialData: FinancialData[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Calculate dashboard stats
  const totalPassengers = passengers.length;
  const paidPassengers = passengers.filter((p) => p.status === "Pago").length;
  const pendingPassengers = passengers.filter(
    (p) => p.status === "Pendente"
  ).length;
  const cancelledPassengers = passengers.filter(
    (p) => p.status === "Cancelado"
  ).length;

  // ===== SHEET 1: DASHBOARD =====
  const dashboardSheet = workbook.addWorksheet("📊 Dashboard");

  // Title
  dashboardSheet.mergeCells("A1:H1");
  const titleCell = dashboardSheet.getCell("A1");
  titleCell.value = "BUSFOLIA - RELATÓRIO DE PASSAGEIROS";
  titleCell.font = { bold: true, size: 14, color: { argb: "FFD4AF37" } };
  (titleCell.alignment as any) = { horizontal: "left", vertical: "middle" };

  // Subtitle
  dashboardSheet.mergeCells("A2:H2");
  const subtitleCell = dashboardSheet.getCell("A2");
  subtitleCell.value = "Transporte Premium para Eventos";
  subtitleCell.font = { size: 11, color: { argb: "FF999999" } };
  (subtitleCell.alignment as any) = { horizontal: "left", vertical: "middle" };

  // Empty row
  dashboardSheet.getRow(3).height = 10;

  // Dashboard headers
  const dashboardHeaders = ["Total Passageiros", "", "Pagos", "", "Aguardando", "", "Cancelados", ""];
  dashboardSheet.getRow(4).values = dashboardHeaders;
  dashboardSheet.getRow(4).font = { bold: true, size: 11 };
  dashboardSheet.getRow(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEEEEE" } };

  // Dashboard data
  dashboardSheet.getRow(5).values = [
    totalPassengers,
    "",
    paidPassengers,
    "",
    pendingPassengers,
    "",
    cancelledPassengers,
    "",
  ];
  dashboardSheet.getRow(5).font = { bold: true, size: 12 };

  // Set column widths
  dashboardSheet.columns = [
    { width: 18 },
    { width: 2 },
    { width: 12 },
    { width: 2 },
    { width: 15 },
    { width: 2 },
    { width: 15 },
    { width: 2 },
  ];

  // ===== SHEET 2: PASSAGEIROS =====
  const passengerSheet = workbook.addWorksheet("👥 Passageiros");

  // Title
  passengerSheet.mergeCells("A1:I1");
  const passengerTitleCell = passengerSheet.getCell("A1");
  passengerTitleCell.value = "BUSFOLIA - LISTA DE PASSAGEIROS";
  passengerTitleCell.font = { bold: true, size: 14, color: { argb: "FFD4AF37" } };
  (passengerTitleCell.alignment as any) = { horizontal: "left", vertical: "middle" };

  // Empty row
  passengerSheet.getRow(2).height = 10;

  // Headers
  const passengerHeaders = [
    "#",
    "Nome",
    "CPF",
    "Evento",
    "Pedido",
    "Status",
    "Ponto de Embarque",
    "Data Viagem",
    "Ingresso",
  ];
  passengerSheet.getRow(3).values = passengerHeaders;
  passengerSheet.getRow(3).font = { bold: true, size: 11 };
  passengerSheet.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEEEEE" } };

  // Add passenger data
  passengers.forEach((passenger, index) => {
    const row = passengerSheet.getRow(4 + index);
    row.values = [
      index + 1,
      passenger.name,
      passenger.cpf,
      passenger.eventName,
      passenger.orderId,
      passenger.status,
      passenger.boardingPoint,
      passenger.travelDate,
      passenger.ticketStatus,
    ];
    (row.alignment as any) = { vertical: "middle" };
  });

  // Set column widths
  passengerSheet.columns = [
    { width: 5 },
    { width: 25 },
    { width: 15 },
    { width: 30 },
    { width: 12 },
    { width: 12 },
    { width: 30 },
    { width: 15 },
    { width: 12 },
  ];

  // ===== SHEET 3: FINANCEIRO =====
  const financialSheet = workbook.addWorksheet("💰 Financeiro");

  // Title
  financialSheet.mergeCells("A1:E1");
  const financialTitleCell = financialSheet.getCell("A1");
  financialTitleCell.value = "RELATÓRIO FINANCEIRO";
  financialTitleCell.font = { bold: true, size: 14, color: { argb: "FFD4AF37" } };
  (financialTitleCell.alignment as any) = { horizontal: "left", vertical: "middle" };

  // Empty row
  financialSheet.getRow(2).height = 10;

  // Section title
  financialSheet.mergeCells("A3:E3");
  const sectionCell = financialSheet.getCell("A3");
  sectionCell.value = "RESUMO FINANCEIRO";
  sectionCell.font = { bold: true, size: 12 };

  // Financial headers
  const financialHeaders = [
    "Categoria",
    "Quantidade",
    "Valor Bruto (R$)",
    "Taxa Stripe (R$)",
    "Valor Líquido (R$)",
  ];
  financialSheet.getRow(4).values = financialHeaders;
  financialSheet.getRow(4).font = { bold: true, size: 11 };
  financialSheet.getRow(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEEEEE" } };

  // Add financial data
  financialData.forEach((data, index) => {
    const row = financialSheet.getRow(5 + index);
    row.values = [
      data.eventName,
      data.quantity,
      data.grossValue.toFixed(2),
      data.stripeFee.toFixed(2),
      data.netValue.toFixed(2),
    ];
    (row.alignment as any) = { vertical: "middle" };
  });

  // Set column widths
  financialSheet.columns = [
    { width: 35 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
}
