import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { useSearch } from "wouter";
import { CheckCircle2, Loader2, Clock, User, MapPin, CreditCard } from "lucide-react";
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
      return 2000; // Poll every 2s while pending
    }}
  );

  if (!sessionId) {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-32 text-center">
          <p className="text-muted-foreground">Sessão inválida.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Voltar ao Início</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading || data?.status === "pending") {
    return (
      <PublicLayout>
        <div className="container max-w-lg py-32 text-center">
          <div className="glass-card rounded-2xl p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-black font-heading mb-2">Confirmando Pagamento...</h1>
            <p className="text-muted-foreground">Aguarde enquanto processamos seu pagamento. Isso pode levar alguns segundos.</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
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
        <div className="container max-w-lg py-32 text-center">
          <div className="glass-card rounded-2xl p-8">
            <p className="text-muted-foreground mb-4">Pedido não encontrado.</p>
            <Link href="/">
              <Button variant="outline">Voltar ao Início</Button>
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
      <div className="container max-w-lg py-16">
        <div className="glass-card rounded-2xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black font-heading mb-2">
            Pagamento <span className="gold-text">Confirmado!</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Seu pedido foi processado com sucesso. Confira os detalhes abaixo.
          </p>

          {order && (
            <div className="text-left space-y-4">
              <div className="bg-white/3 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pedido</span>
                  <span className="font-bold text-primary">{order.shortId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Evento</span>
                  <span className="font-medium">{order.eventName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{order.transportDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Passageiros</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/5 pt-2">
                  <span className="text-muted-foreground">Total Pago</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(order.totalAmountCents)}</span>
                </div>
              </div>

              {passengers.length > 0 && (
                <div className="bg-white/3 rounded-xl p-4">
                  <h3 className="text-sm font-bold mb-2">Passageiros</h3>
                  {passengers.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">{p.cpf}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Um e-mail de confirmação será enviado para <strong>{order.customerEmail}</strong>.
              </p>
            </div>
          )}

          <Link href="/">
            <Button className="gold-gradient text-black font-bold mt-6 w-full py-3 rounded-xl">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
