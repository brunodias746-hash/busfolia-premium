/**
 * Professional HTML Email Template for BusFolia Order Confirmation
 * Responsive design optimized for Gmail, Outlook, Yahoo, Apple Mail
 */

export interface EmailTemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  boardingPoint: string;
  travelDates: string[];
  passengers: number;
  totalValue: number;
  whatsappGroupUrl?: string;
  ticketUrl?: string;
  pdfAttached?: boolean;
}

export function generateOrderConfirmationEmailHTML(data: EmailTemplateData): string {
  const {
    orderNumber,
    customerName,
    customerEmail,
    boardingPoint,
    travelDates,
    passengers,
    totalValue,
    whatsappGroupUrl = "https://chat.whatsapp.com/",
    ticketUrl = "https://busfolia.com.br/ingresso/",
    pdfAttached = true,
  } = data;

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalValue / 100);

  const travelDatesFormatted = travelDates.join(" • ");

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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Header */
    .email-header {
      background: linear-gradient(135deg, #D4AF37 0%, #E8C547 100%);
      padding: 40px 24px;
      text-align: center;
      border-bottom: 4px solid #1a1a1a;
    }
    
    .email-header-logo {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    
    .email-header-tagline {
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 500;
      opacity: 0.8;
    }
    
    /* Success Banner */
    .success-banner {
      background-color: #10B981;
      color: #ffffff;
      padding: 24px;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    
    .success-banner-icon {
      font-size: 32px;
      margin-right: 12px;
      vertical-align: middle;
    }
    
    /* Content */
    .email-content {
      padding: 40px 24px;
    }
    
    .content-section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 8px;
    }
    
    /* Order Details Cards */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .detail-card {
      background-color: #f9f9f9;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .detail-card-label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .detail-card-value {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      word-break: break-word;
    }
    
    .detail-card-full {
      grid-column: 1 / -1;
    }
    
    .detail-card-large {
      font-size: 24px;
      color: #D4AF37;
    }
    
    /* Info Box */
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #D4AF37;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    
    .info-box-title {
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .info-box-text {
      font-size: 14px;
      color: #666666;
      line-height: 1.6;
    }
    
    /* Buttons */
    .button-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 32px 0;
    }
    
    .button {
      display: inline-block;
      padding: 14px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .button-primary {
      background-color: #D4AF37;
      color: #1a1a1a;
      grid-column: 1 / -1;
    }
    
    .button-primary:hover {
      background-color: #E8C547;
      text-decoration: none;
    }
    
    .button-secondary {
      background-color: #f0f0f0;
      color: #1a1a1a;
      border: 2px solid #D4AF37;
    }
    
    .button-secondary:hover {
      background-color: #e8e8e8;
      text-decoration: none;
    }
    
    /* PDF Attachment Notice */
    .pdf-notice {
      background-color: #e8f5e9;
      border: 1px solid #10B981;
      border-radius: 6px;
      padding: 16px;
      margin: 24px 0;
      text-align: center;
      font-size: 14px;
      color: #1a1a1a;
    }
    
    .pdf-notice-icon {
      font-size: 20px;
      margin-right: 8px;
    }
    
    /* Footer */
    .email-footer {
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
      border-top: 4px solid #D4AF37;
    }
    
    .footer-section {
      margin-bottom: 16px;
    }
    
    .footer-title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer-contact {
      font-size: 13px;
      line-height: 1.8;
      color: #cccccc;
    }
    
    .footer-contact a {
      color: #D4AF37;
      text-decoration: none;
    }
    
    .footer-contact a:hover {
      text-decoration: underline;
    }
    
    .footer-divider {
      height: 1px;
      background-color: #333333;
      margin: 16px 0;
    }
    
    .footer-copyright {
      font-size: 12px;
      color: #999999;
      margin-top: 16px;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
      .email-header {
        padding: 24px 16px;
      }
      
      .email-content {
        padding: 24px 16px;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-card-full {
        grid-column: 1;
      }
      
      .button-group {
        grid-template-columns: 1fr;
      }
      
      .button-primary {
        grid-column: 1;
      }
      
      .email-footer {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="email-header-logo">🚌 BUSFOLIA</div>
      <div class="email-header-tagline">Transporte Premium para Eventos</div>
    </div>
    
    <!-- Success Banner -->
    <div class="success-banner">
      <span class="success-banner-icon">✓</span>
      <span>PAGAMENTO CONFIRMADO</span>
    </div>
    
    <!-- Content -->
    <div class="email-content">
      <!-- Greeting -->
      <p style="font-size: 16px; margin-bottom: 24px; color: #1a1a1a;">
        Olá <strong>${customerName}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #666666; margin-bottom: 24px; line-height: 1.8;">
        Sua compra foi confirmada com sucesso! Seu ingresso está pronto e anexado em PDF neste email. 
        Guarde este email como comprovante - você precisará apresentá-lo no ponto de embarque.
      </p>
      
      <!-- Order Number -->
      <div class="content-section">
        <div class="detail-card detail-card-full" style="text-align: center; background: linear-gradient(135deg, #D4AF37 0%, #E8C547 100%); color: #1a1a1a; padding: 24px;">
          <div class="detail-card-label" style="color: #1a1a1a;">Número do Pedido</div>
          <div class="detail-card-value detail-card-large">${orderNumber}</div>
        </div>
      </div>
      
      <!-- Order Details -->
      <div class="content-section">
        <div class="section-title">Detalhes da Viagem</div>
        
        <div class="details-grid">
          <div class="detail-card">
            <div class="detail-card-label">Ponto de Embarque</div>
            <div class="detail-card-value" style="font-size: 14px;">📍 ${boardingPoint}</div>
          </div>
          
          <div class="detail-card">
            <div class="detail-card-label">Passageiros</div>
            <div class="detail-card-value">${passengers}</div>
          </div>
          
          <div class="detail-card detail-card-full">
            <div class="detail-card-label">Data(s) da Viagem</div>
            <div class="detail-card-value" style="font-size: 14px;">• ${travelDatesFormatted}</div>
          </div>
          
          <div class="detail-card detail-card-full" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff;">
            <div class="detail-card-label" style="color: #ffffff;">Valor Total</div>
            <div class="detail-card-value detail-card-large" style="color: #ffffff;">${formattedValue}</div>
          </div>
        </div>
      </div>
      
      <!-- PDF Attachment Notice -->
      ${
        pdfAttached
          ? `
      <div class="pdf-notice">
        <span class="pdf-notice-icon">📎</span>
        <strong>Seu ingresso está anexado em PDF</strong>
      </div>
      `
          : ""
      }
      
      <!-- Action Buttons -->
      <div class="button-group">
        <a href="${ticketUrl}" class="button button-primary">Ver Meu Ingresso</a>
        <a href="${whatsappGroupUrl}" class="button button-secondary">Entrar no WhatsApp</a>
      </div>
      
      <!-- Important Notice -->
      <div class="info-box">
        <div class="info-box-title">⚠️ Importante</div>
        <div class="info-box-text">
          Guarde este email como comprovante. Você precisará apresentar a confirmação ou o ingresso no ponto de embarque.
          Em caso de dúvidas, entre em contato conosco pelo WhatsApp.
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <div class="footer-section">
        <div class="footer-title">Informações de Contato</div>
        <div class="footer-contact">
          📱 WhatsApp: <a href="https://wa.me/5531900908399">(31) 9 0090-8399</a><br>
          📧 Email: <a href="mailto:contato@busfolia.com.br">contato@busfolia.com.br</a><br>
          📲 Instagram: <a href="https://instagram.com/busfolia">@busfolia</a>
        </div>
      </div>
      
      <div class="footer-divider"></div>
      
      <div class="footer-copyright">
        © 2026 BusFolia - Transporte Premium para Eventos. Todos os direitos reservados.<br>
        <a href="#" style="color: #999999; text-decoration: none;">Cancelar inscrição</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
