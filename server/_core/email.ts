
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  shortId: string;
  boardingPoint: string;
  transportDates: string[];
  quantity: number;
  totalAmountCents: number;
  whatsappLink: string;
  purchaseType?: 'single' | 'multiple' | 'all_days';
  passengerNames?: string[]; // Nomes dos passageiros
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!ENV.resendApiKey) {
    console.error("[Email] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.resendApiKey}`,
      },
      body: JSON.stringify({
        from: "contato@busfolia.com.br",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Resend API error:", error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log("[Email] Email sent successfully:", data.id);
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error("[Email] Error sending email:", error.message);
    return { success: false, error: error.message };
  }
}

// Format dates in Portuguese (e.g., "05, 06, 12 e 13 de Junho de 2026")
function formatDatesInPortuguese(dates: string[]): string {
  if (dates.length === 0) return "";
  
  const monthNames: { [key: string]: string } = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };
  
  const parsedDates = dates.map(d => {
    if (!d) return null;
    
    let day: number, month: string, year: string;
    
    // Try to parse different date formats
    if (d.includes('-')) {
      // ISO format: "2026-06-05" or "2026-06-05T00:00:00Z"
      const parts = d.split('-');
      if (parts.length >= 3) {
        year = parts[0];
        month = monthNames[parts[1]];
        day = parseInt(parts[2]);
      } else {
        return null;
      }
    } else if (d.includes('/')) {
      // Brazilian format: "05/06/2026"
      const parts = d.split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0]);
        month = monthNames[parts[1].padStart(2, '0')];
        year = parts[2];
      } else {
        return null;
      }
    } else if (d.includes(' ')) {
      // Already formatted: "05 Junho 2026" or similar
      const parts = d.split(' ');
      if (parts.length >= 2) {
        day = parseInt(parts[0]);
        month = parts[1]; // Assume already in Portuguese
        year = parts[2] || new Date().getFullYear().toString();
      } else {
        return null;
      }
    } else {
      return null;
    }
    
    return { day, month, year };
  }).filter(Boolean) as Array<{ day: number; month: string; year: string }>;

  if (parsedDates.length === 0) return "";
  
  // Group by month/year
  const grouped: { [key: string]: number[] } = {};
  parsedDates.forEach(({ day, month, year }) => {
    const key = `${month} de ${year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(day);
  });

  // Format output
  return Object.entries(grouped)
    .map(([monthYear, days]) => {
      const dayStr = days.length === 1 
        ? `${days[0]}` 
        : days.slice(0, -1).join(', ') + ` e ${days[days.length - 1]}`;
      return `${dayStr} de ${monthYear}`;
    })
    .join(', ');
}

function getPurchaseTypeName(type?: string): string {
  switch (type) {
    case 'single': return 'Dia Único';
    case 'multiple': return 'Múltiplos Dias';
    case 'all_days': return 'Passaporte 4 Dias';
    default: return 'Ingresso';
  }
}

import { ENV } from './env';

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const formattedDates = formatDatesInPortuguese(data.transportDates);
  const purchaseTypeName = getPurchaseTypeName(data.purchaseType);
  const totalBRL = (data.totalAmountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Pagamento - BusFolia</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #D4AF37;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 5px 0;
    }
    .header p {
      font-size: 13px;
      color: #e8e8e8;
      margin: 0;
    }
    .status-badge {
      display: inline-block;
      background-color: #4caf50;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 15px;
      color: #333;
    }
    .greeting strong {
      font-weight: 600;
    }
    .intro-text {
      font-size: 14px;
      color: #666;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .details-section {
      margin-bottom: 25px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e8e8e8;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
    }
    .detail-value {
      color: #333;
      text-align: right;
      font-weight: 500;
    }
    .passengers-section {
      background-color: #fffef0;
      border: 2px solid #D4AF37;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .passengers-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .passenger-item {
      padding: 6px 0;
      font-size: 13px;
      color: #555;
    }
    .passenger-item strong {
      font-weight: 600;
    }
    .total-section {
      background-color: #f9f9f9;
      border-top: 2px solid #D4AF37;
      border-bottom: 2px solid #D4AF37;
      padding: 20px 0;
      margin: 25px 0;
      text-align: center;
    }
    .total-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 5px;
    }
    .total-value {
      font-size: 32px;
      font-weight: 700;
      color: #D4AF37;
    }
    .whatsapp-section {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .whatsapp-icon {
      font-size: 20px;
      margin-bottom: 8px;
    }
    .whatsapp-title {
      font-weight: 600;
      color: #2e7d32;
      margin: 0;
      font-size: 14px;
    }
    .whatsapp-subtitle {
      font-size: 12px;
      color: #558b2f;
      margin: 5px 0 10px 0;
    }
    .whatsapp-button {
      display: inline-block;
      background-color: #25d366;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
    }
    .warning-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
      color: #856404;
    }
    .warning-box strong {
      font-weight: 600;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e8e8e8;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>BusFolia</h1>
      <p>Transporte Premium para Eventos</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Status Badge -->
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="status-badge">✓ PAGAMENTO CONFIRMADO</span>
      </div>

      <!-- Greeting -->
      <div class="greeting">
        Olá <strong>${data.customerName}</strong>,
      </div>

      <!-- Intro Text -->
      <div class="intro-text">
        Seu pagamento foi aprovado com sucesso! Sua passagem está confirmada. Abaixo estão os detalhes da sua compra:
      </div>

      <!-- Details Section -->
      <div class="details-section">
        <div class="detail-row">
          <span class="detail-label">Número do Pedido</span>
          <span class="detail-value"><strong>${data.shortId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nome</span>
          <span class="detail-value">${data.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${data.customerEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ponto de Embarque</span>
          <span class="detail-value">${data.boardingPoint}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data(s) da Viagem</span>
          <span class="detail-value">• ${formattedDates}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quantidade de Passageiros</span>
          <span class="detail-value">${data.quantity}</span>
        </div>
      </div>

      <!-- Passengers Section -->
      ${data.passengerNames && data.passengerNames.length > 0 ? `
      <div class="passengers-section">
        <div class="passengers-title">Passageiros:</div>
        ${data.passengerNames.map((name, idx) => `
          <div class="passenger-item"><strong>${idx + 1}.</strong> ${name}</div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Total Section -->
      <div class="total-section">
        <div class="total-label">Valor Total</div>
        <div class="total-value">${totalBRL}</div>
      </div>

      <!-- Valid Ticket Notice -->
      <div style="background-color: #e8f5e9; border: 1px solid #4caf50; border-radius: 4px; padding: 12px; text-align: center; color: #2e7d32; font-size: 13px; margin-bottom: 20px;">
        ✓ Ingresso Válido - Apresente este documento no embarque
      </div>

      <!-- WhatsApp Section -->
      <div class="whatsapp-section">
        <div class="whatsapp-icon">📱</div>
        <p class="whatsapp-title">Junte-se ao nosso grupo no WhatsApp</p>
        <p class="whatsapp-subtitle">Receba atualizações, confirmações de horário e suporte direto</p>
        <a href="${data.whatsappLink}" class="whatsapp-button">Entrar no Grupo WhatsApp</a>
      </div>

      <!-- Warning Box -->
      <div class="warning-box">
        <strong>⚠️ Importante:</strong> Guarde este email como comprovante. Você precisará apresentar a confirmação no ponto de embarque.
      </div>

      <!-- Contact Info -->
      <p style="color: #666; font-size: 13px; margin-top: 20px; text-align: center;">
        Qualquer dúvida, entre em contato conosco via WhatsApp ou envie um email para <strong>contato@busfolia.com.br</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2026 BusFolia Premium - Transporte para Eventos</p>
      <p>Viaje com conforto, segurança e qualidade!</p>
      <p style="margin-top: 10px; color: #bbb;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
  `;
}
