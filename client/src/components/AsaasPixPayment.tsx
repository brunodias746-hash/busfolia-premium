import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, Loader2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { PixTimer } from "@/components/PixTimer";

interface AsaasPixPaymentProps {
  orderId: number;
  shortId: string;
  totalAmountCents: number;
  pixQrCodeBase64: string;
  pixCopyPaste: string;
  onBack: () => void;
}

export function AsaasPixPayment({
  orderId,
  shortId,
  totalAmountCents,
  pixQrCodeBase64,
  pixCopyPaste,
  onBack,
}: AsaasPixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [createdAt] = useState(() => new Date());

  // Poll for payment status
  const { data: statusData } = trpc.checkout.checkAsaasStatus.useQuery(
    { orderId },
    { refetchInterval: 3000, enabled: true }
  );

  // Redirect when paid
  useEffect(() => {
    if (statusData?.status === "paid") {
      window.location.href = `/sucesso?order_id=${orderId}`;
    }
  }, [statusData?.status, orderId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = pixCopyPaste;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-center">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Aguardando pagamento PIX</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Pague com PIX</h2>
        <p className="text-sm text-muted-foreground">Pedido {shortId}</p>
      </div>

      {/* Amount */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
        <p className="text-3xl font-black text-primary">{formatCurrency(totalAmountCents)}</p>
      </div>

      {/* Timer */}
      <PixTimer createdAt={createdAt} expirationMinutes={30} />

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-6 inline-block">
        <img
          src={`data:image/png;base64,${pixQrCodeBase64}`}
          alt="QR Code PIX"
          className="w-56 h-56 mx-auto"
        />
      </div>

      {/* Copy & Paste */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Ou copie o código PIX:</p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs break-all text-muted-foreground max-h-20 overflow-y-auto">
          {pixCopyPaste}
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          className={`w-full ${copied ? "border-green-500 text-green-400" : "border-primary text-primary"}`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" /> Copiar código PIX
            </>
          )}
        </Button>
      </div>

      {/* Status indicator */}
      {statusData?.status === "processing" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          <p className="text-sm text-yellow-200">Pagamento detectado! Processando confirmação...</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2">
        <p className="text-sm font-semibold">Como pagar:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escaneie o QR Code ou cole o código PIX</li>
          <li>Confirme o pagamento</li>
          <li>Aguarde a confirmação automática nesta tela</li>
        </ol>
      </div>

      {/* Back button */}
      <Button variant="outline" onClick={onBack} className="w-full border-white/10 hover:bg-white/5">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
    </div>
  );
}
