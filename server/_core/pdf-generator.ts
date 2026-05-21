import { PDFDocument, PDFPage, rgb, degrees } from "pdf-lib";
// Format currency helper
function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

interface TicketPDFData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  boardingPoint: string;
  transportDates: string[];
  quantity: number;
  totalAmountCents: number;
  generatedAt: string;
  passengerNames?: string[]; // Nomes dos passageiros
}

/**
 * Generate a PDF ticket for an order
 * Returns Buffer containing the PDF data
 */
export async function generateTicketPDF(data: TicketPDFData): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size (8.5" x 11")
    
    const { width, height } = page.getSize();
    const margin = 40;
    let yPosition = height - margin;

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, fontSize: number = 12, color = rgb(0, 0, 0), bold = false) => {
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color,
        font: bold ? undefined : undefined, // Use default font
      });
    };

    // Helper function to draw a line
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color = rgb(0, 0, 0)) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        color,
        thickness: 1,
      });
    };

    // Header - BusFolia branding
    const headerColor = rgb(1, 0.67, 0.2); // Golden yellow
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: headerColor,
    });

    drawText("BusFolia", margin, height - 50, 28, rgb(1, 1, 1), true);
    drawText("Transporte Premium para Eventos", margin, height - 75, 12, rgb(1, 1, 1));

    // Payment status badge
    drawText("[OK] PAGAMENTO CONFIRMADO", width - 200, height - 50, 12, rgb(0.2, 0.7, 0.2), true);

    yPosition = height - 120;

    // Order number
    drawText("Número do Pedido", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    drawText(data.orderNumber, margin, yPosition, 18, rgb(0, 0, 0), true);
    yPosition -= 30;

    // Customer details
    drawText("Nome", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    drawText("Email", width / 2 + margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    drawText(data.customerName, margin, yPosition, 12, rgb(0, 0, 0));
    drawText(data.customerEmail, width / 2 + margin, yPosition, 12, rgb(0, 0, 0));
    yPosition -= 30;

    // Boarding point
    drawText("Ponto de Embarque", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    drawText(data.boardingPoint, margin, yPosition, 12, rgb(0, 0, 0), true);
    yPosition -= 30;

    // Travel dates
    drawText("Data(s) da Viagem", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    data.transportDates.forEach((date) => {
      drawText(`• ${date}`, margin + 10, yPosition, 11, rgb(0, 0, 0));
      yPosition -= 18;
    });
    yPosition -= 10;

    // Quantity
    drawText("Quantidade de Passageiros", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    drawText(data.quantity.toString(), margin, yPosition, 12, rgb(0, 0, 0));
    yPosition -= 30;

    // Passenger names
    if (data.passengerNames && data.passengerNames.length > 0) {
      drawText("Passageiros", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
      yPosition -= 20;
      data.passengerNames.forEach((name, index) => {
        drawText(`${index + 1}. ${name}`, margin + 10, yPosition, 11, rgb(0, 0, 0));
        yPosition -= 18;
      });
      yPosition -= 10;
    }

    // Divider line
    drawLine(margin, yPosition, width - margin, yPosition, rgb(0.8, 0.8, 0.8));
    yPosition -= 20;

    // Total value
    drawText("Valor Total", margin, yPosition, 10, rgb(0.5, 0.5, 0.5));
    drawText(formatCurrency(data.totalAmountCents), width - margin - 100, yPosition, 10, rgb(0.5, 0.5, 0.5));
    yPosition -= 20;
    drawText(formatCurrency(data.totalAmountCents), margin, yPosition, 18, rgb(1, 0.67, 0.2), true);
    yPosition -= 30;

    // Divider line
    drawLine(margin, yPosition, width - margin, yPosition, rgb(0.8, 0.8, 0.8));
    yPosition -= 20;

    // Ticket validity notice
    const noticeBox = {
      x: margin,
      y: yPosition - 40,
      width: width - 2 * margin,
      height: 40,
      color: rgb(0.9, 1, 0.9),
    };
    page.drawRectangle(noticeBox);
    drawText("[OK] Ingresso Valido - Apresente este documento no embarque", margin + 10, yPosition - 20, 11, rgb(0.2, 0.6, 0.2), true);

    yPosition -= 60;

    // Footer
    drawText(`Gerado em: ${data.generatedAt}`, margin, 30, 9, rgb(0.6, 0.6, 0.6));
    drawText("Para dúvidas, entre em contato pelo WhatsApp: (31) 9 9090-8399", margin, 15, 9, rgb(0.6, 0.6, 0.6));

    // Save and return as buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error: any) {
    console.error("[PDF Generator] Error generating PDF:", error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Generate a PDF filename for an order
 */
export function generatePDFFilename(orderNumber: string): string {
  return `ingresso-busfolia-${orderNumber}.pdf`;
}
