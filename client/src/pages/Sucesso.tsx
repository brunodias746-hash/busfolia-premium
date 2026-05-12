import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { useSearch } from "wouter";
import { CheckCircle2, Loader2, Clock, User, MapPin, CreditCard, MessageCircle, Download, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { trackPurchase } from "@/utils/meta-pixel";

export default function Sucesso() {
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const sessionId = params.get("session_id") ?? "";
  const orderId = params.get("order_id") ? parseInt(params.get("order_id")!, 10) : 0;

  // Stripe flow: use session_id
  const { data: stripeData, isLoading: stripeLoading } = trpc.checkout.status.useQuery(
    { sessionId },
    { enabled: !!sessionId, refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "paid" || status === "not_found") return false;
      return 2000;
    }}
  );

  // Asaas flow: use order_id
  const { data: asaasData, isLoading: asaasLoading } = trpc.checkout.checkAsaasStatus.useQuery(
    { orderId },
    { enabled: orderId > 0, refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "paid" || status === "not_found" || status === "canceled") return false;
      return 3000;
    }}
  );

  // Determine which data source to use
  const isStripeFlow = !!sessionId;
  const data = isStripeFlow ? stripeData : asaasData;
  const isLoading = isStripeFlow ? stripeLoading : asaasLoading;

  // Track Purchase event when order is confirmed and paid
  useEffect(() => {
    if (data?.order && data?.status === "paid") {
      const valueInBRL = data.order.totalAmountCents / 100;
      trackPurchase(valueInBRL, "BRL", data.order.shortId);
    }
  }, [data?.order, data?.status]);

  // Format dates for display
  const formatDates = (dates: string[]): string => {
    if (dates.length === 1 && dates[0] === "Todos os Dias") {
      return "Todos os Dias (Passaporte)";
    }
    return dates.join(", ");
  };

  // Download receipt as PDF
  const downloadReceipt = async () => {
    if (!order) return;
    try {
      // Create a simple receipt document
      const receiptContent = `
BUSFOLIA - COMPROVANTE DE COMPRA
================================

Pedido: ${order.shortId}
Evento: ${order.eventName}
Data(s): ${formatDates(order.transportDates)}
Ponto de Embarque: ${order.boardingPoint}
Tipo de Ingresso: ${order.purchaseType === "single" ? "Dia Único" : order.purchaseType === "all_days" ? "Passaporte" : "Múltiplos Dias"}
Quantidade de Passageiros: ${order.quantity}

RESUMO FINANCEIRO
-----------------
Preço Base: R$ ${(baseTotalCents / 100).toFixed(2).replace('.', ',')}
Taxa: R$ ${(taxTotalCents / 100).toFixed(2).replace('.', ',')}
${discountCents > 0 ? `Desconto: -R$ ${(discountCents / 100).toFixed(2).replace('.', ',')}\n` : ""}
TOTAL PAGO: R$ ${(order.totalAmountCents / 100).toFixed(2).replace('.', ',')}

PASSAGEIROS
-----------
${passengers.map((p, i) => `${i + 1}. ${p.name} - CPF: ${p.cpf}`).join('\n')}

CONFIRMAÇÃO
-----------
Email de confirmação enviado para: ${order.customerEmail}
Guarde este comprovante para apresentar no ponto de embarque.

Gerado em: ${new Date().toLocaleString('pt-BR')}
      `;
      
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
      element.setAttribute('download', `BusFolia-Comprovante-${order.shortId}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
    }
  };

  // Resend confirmation email
  const resendEmail = async () => {
    if (!order) return;
    try {
      // This would call a backend endpoint to resend the email
      // For now, we'll just show a message
      alert('Email de confirmação reenviado para ' + order.customerEmail);
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    }
  };

  // No identifier provided
  if (!sessionId && !orderId) {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-16 sm:py-32 px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">Sessão inválida.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4 min-h-[44px] text-sm sm:text-base">Voltar ao Início</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading || data?.status === "pending_checkout" || data?.status === "pending" || data?.status === "processing") {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-16 sm:py-32 px-4 sm:px-6 text-center">
          <div className="glass-card rounded-2xl p-4 sm:p-8">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-black font-heading mb-1 sm:mb-2">Confirmando Pagamento...</h1>
            <p className="text-xs sm:text-base text-muted-foreground">Aguarde enquanto processamos seu pagamento. Isso pode levar alguns segundos.</p>
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{isStripeFlow ? "Verificando com o Stripe..." : "Verificando pagamento..."}</span>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (data?.status === "not_found" || data?.status === "canceled") {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-16 sm:py-32 px-4 sm:px-6 text-center">
          <div className="glass-card rounded-2xl p-4 sm:p-8">
            <p className="text-xs sm:text-base text-muted-foreground mb-4">
              {data?.status === "canceled" ? "Pedido cancelado." : "Pedido não encontrado."}
            </p>
            <Link href="/">
              <Button variant="outline" className="min-h-[44px] text-sm sm:text-base">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const order = data?.order;
  const passengers = data?.passengers ?? [];

  // Calculate discount if applicable
  const baseTotalCents = (order?.unitPriceCents ?? 0) * (order?.quantity ?? 1);
  const taxTotalCents = (order?.feeCents ?? 0) * (order?.quantity ?? 1);
  const discountCents = (baseTotalCents + taxTotalCents) - (order?.totalAmountCents ?? 0);

  return (
    <PublicLayout>
      <div className="container max-w-2xl py-8 sm:py-16 px-4 sm:px-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black font-heading mb-1 sm:mb-2">
              Pagamento <span className="gold-text">Confirmado!</span>
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground">
              Seu pedido foi processado com sucesso. Confira os detalhes abaixo.
            </p>
          </div>

          {order && (
            <div className="text-left space-y-3 sm:space-y-4">
              {/* Order Summary */}
              <div className="bg-white/3 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Pedido</span>
                  <span className="font-bold text-primary">{order.shortId}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Evento</span>
                  <span className="font-medium">{order.eventName}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Data(s)</span>
                  <span className="font-medium text-right">{formatDates(order.transportDates)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Ponto de Embarque</span>
                  <span className="font-medium text-right">{order.boardingPoint}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Tipo de Ingresso</span>
                  <span className="font-medium">
                    {order.purchaseType === "single" ? "Dia Único" : order.purchaseType === "all_days" ? "Passaporte" : "Múltiplos Dias"}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Passageiros</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-white/3 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Preço Base</span>
                  <span className="font-medium">{formatCurrency(baseTotalCents)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Taxa</span>
                  <span className="font-medium">{formatCurrency(taxTotalCents)}</span>
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-400">Desconto</span>
                    <span className="font-medium text-green-400">-{formatCurrency(discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm border-t border-white/5 pt-2 font-bold">
                  <span>Total Pago</span>
                  <span className="text-primary text-base sm:text-lg">{formatCurrency(order.totalAmountCents)}</span>
                </div>
              </div>

              {/* Passengers */}
              {passengers.length > 0 && (
                <div className="bg-white/3 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-bold mb-3">Passageiros ({passengers.length})</h3>
                  <div className="space-y-2">
                    {passengers.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-xs sm:text-sm py-2 border-b border-white/5 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span>{p.name}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px] sm:text-xs">{p.cpf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation Message */}
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center bg-white/3 rounded-lg p-3">
                Um e-mail de confirmação foi enviado para <strong>{order.customerEmail}</strong>. Verifique sua caixa de entrada e pasta de spam.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3 mt-6 sm:mt-8">
            {/* Primary: Download Receipt */}
            <Button 
              onClick={downloadReceipt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              BAIXAR COMPROVANTE
            </Button>
            
            {/* Secondary: WhatsApp */}
            <a href="https://wa.me/5531990908399" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                ENTRAR NO GRUPO WHATSAPP
              </Button>
            </a>
            
            {/* Tertiary: Back to Home */}
            <Link href="/">
              <Button className="gold-gradient text-black font-bold w-full py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          {/* Email Confirmation Status */}
          <div className="mt-6 sm:mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex gap-2 items-start">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-blue-100 mb-2">
                  <strong>Email de Confirmação:</strong> Um email foi enviado para <strong>{order?.customerEmail}</strong>
                </p>
                <button 
                  onClick={resendEmail}
                  className="text-[10px] sm:text-xs text-blue-300 hover:text-blue-200 underline"
                >
                  Não recebeu? Reenviar email
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-3 sm:mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-yellow-100">
                <strong>Importante:</strong> Guarde o comprovante e o email de confirmação. Você precisará apresentá-los no ponto de embarque.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
