import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { useSearch } from "wouter";
import { CheckCircle2, Loader2, Clock, User, MapPin, CreditCard, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function Sucesso() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id") ?? "";

  const { data, isLoading, refetch } = trpc.checkout.status.useQuery(
    { sessionId },
    { enabled: !!sessionId, refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "paid" || status === "not_found") return false;
      return 2000;
    }}
  );

  if (!sessionId) {
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

  if (isLoading || data?.status === "pending") {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-16 sm:py-32 px-4 sm:px-6 text-center">
          <div className="glass-card rounded-2xl p-4 sm:p-8">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-black font-heading mb-1 sm:mb-2">Confirmando Pagamento...</h1>
            <p className="text-xs sm:text-base text-muted-foreground">Aguarde enquanto processamos seu pagamento. Isso pode levar alguns segundos.</p>
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Verificando com o Stripe...</span>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (data?.status === "not_found") {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-16 sm:py-32 px-4 sm:px-6 text-center">
          <div className="glass-card rounded-2xl p-4 sm:p-8">
            <p className="text-xs sm:text-base text-muted-foreground mb-4">Pedido não encontrado.</p>
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

  return (
    <PublicLayout>
      <div className="container max-w-lg py-8 sm:py-16 px-4 sm:px-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
          </div>
          <h1 className="text-xl sm:text-3xl font-black font-heading mb-1 sm:mb-2">
            Pagamento <span className="gold-text">Confirmado!</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Seu pedido foi processado com sucesso. Confira os detalhes abaixo.
          </p>

          {order && (
            <div className="text-left space-y-3 sm:space-y-4">
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
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{order.transportDate}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Passageiros</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm border-t border-white/5 pt-2">
                  <span className="text-muted-foreground">Total Pago</span>
                  <span className="font-bold text-primary text-base sm:text-lg">{formatCurrency(order.totalAmountCents)}</span>
                </div>
              </div>

              {passengers.length > 0 && (
                <div className="bg-white/3 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-bold mb-2">Passageiros</h3>
                  {passengers.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs sm:text-sm py-1">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs">{p.cpf}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                Um e-mail de confirmação será enviado para <strong>{order.customerEmail}</strong>.
              </p>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
            <a href="https://wa.me/5531973540425" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base">
                <MessageCircle className="w-4 h-4 mr-2" />
                ENTRAR NO GRUPO
              </Button>
            </a>
            <Link href="/">
              <Button className="gold-gradient text-black font-bold w-full py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
