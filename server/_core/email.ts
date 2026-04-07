import { ENV } from "./env";

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
        from: "noreply@busfolia.com.br",
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

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const formattedDates = data.transportDates.join(", ");
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
  <title>Confirmação de Pedido - BusFolia</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
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
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #ffd700;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 14px;
      color: #e0e0e0;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #333;
    }
    .order-details {
      background-color: #f9f9f9;
      border-left: 4px solid #ffd700;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
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
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      margin-top: 10px;
      border-top: 2px solid #ffd700;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .whatsapp-section {
      background-color: #e8f5e9;
      border: 1px solid #4caf50;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .whatsapp-section p {
      margin: 0 0 10px 0;
      color: #2e7d32;
      font-weight: 600;
    }
    .whatsapp-button {
      display: inline-block;
      background-color: #25d366;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .whatsapp-button:hover {
      background-color: #1da851;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #ffd700;
      text-decoration: none;
    }
    .success-badge {
      display: inline-block;
      background-color: #4caf50;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚌 BusFolia</h1>
      <p>Transporte Premium para Eventos</p>
    </div>

    <div class="content">
      <div class="success-badge">✓ PAGAMENTO CONFIRMADO</div>
      
      <div class="greeting">
        <p>Olá <strong>${data.customerName}</strong>,</p>
        <p>Seu pagamento foi aprovado com sucesso! Sua passagem está confirmada. Abaixo estão os detalhes da sua compra:</p>
      </div>

      <div class="order-details">
        <div class="detail-row">
          <span class="detail-label">Número do Pedido:</span>
          <span class="detail-value"><strong>${data.shortId}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ponto de Embarque:</span>
          <span class="detail-value">${data.boardingPoint}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Data(s) da Viagem:</span>
          <span class="detail-value">${formattedDates}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quantidade de Passageiros:</span>
          <span class="detail-value">${data.quantity}</span>
        </div>
        <div class="total-row">
          <span>Total Pago:</span>
          <span>${totalBRL}</span>
        </div>
      </div>

      <div class="whatsapp-section">
        <p>📱 Junte-se ao nosso grupo no WhatsApp</p>
        <p style="font-size: 13px; margin: 5px 0 10px 0; color: #1976d2;">Receba atualizações, confirmações de horário e suporte direto</p>
        <a href="${data.whatsappLink}" class="whatsapp-button">Entrar no Grupo WhatsApp</a>
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>⚠️ Importante:</strong> Guarde este email como comprovante. Você precisará apresentar a confirmação no ponto de embarque.
        </p>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Qualquer dúvida, entre em contato conosco via WhatsApp ou envie um email para <strong>contato@busfolia.com.br</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">© 2026 BusFolia Premium - Transporte para Eventos</p>
      <p style="margin: 5px 0 0 0;">Viaje com conforto, segurança e qualidade!</p>
    </div>
  </div>
</body>
</html>
  `;
}
