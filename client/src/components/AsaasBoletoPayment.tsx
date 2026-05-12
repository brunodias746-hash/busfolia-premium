import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, ExternalLink, Loader2, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";

interface AsaasBoletoPaymentProps {
  orderId: number;
  shortId: string;
  totalAmountCents: number;
  boletoIdentificationField: string;
  boletoBarCode?: string;
  boletoUrl?: string;
  invoiceUrl?: string;
  onBack: () => void;
}

export function AsaasBoletoPayment({
  orderId,
  shortId,
  totalAmountCents,
  boletoIdentificationField,
  boletoBarCode,
  boletoUrl,
  invoiceUrl,
  onBack,
}: AsaasBoletoPaymentProps) {
  const [copied, setCopied] = useState(false);

  // Poll for payment status
  const { data: statusData } = trpc.checkout.checkAsaasStatus.useQuery(
    { orderId },
    { refetchInterval: 10000, enabled: true } // Poll every 10s for boleto (slower)
  );

  // Redirect when paid
  useEffect(() => {
    if (statusData?.status === "paid") {
      window.location.href = `/sucesso?order_id=${orderId}`;
    }
  }, [statusData?.status, orderId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boletoIdentificationField);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = boletoIdentificationField;
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
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-4">
          <FileText className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400 font-medium">Boleto gerado</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Pague com Boleto</h2>
        <p className="text-sm text-muted-foreground">Pedido {shortId}</p>
      </div>

      {/* Amount */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
        <p className="text-3xl font-black text-primary">{formatCurrency(totalAmountCents)}</p>
      </div>

      {/* Linha Digitável */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">Linha digitável:</p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs break-all text-muted-foreground font-mono">
          {boletoIdentificationField}
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
              <Copy className="w-4 h-4 mr-2" /> Copiar linha digitável
            </>
          )}
        </Button>
      </div>

      {/* Download/View Boleto */}
      <div className="flex gap-3">
        {boletoUrl && (
          <Button
            onClick={() => window.open(boletoUrl, "_blank")}
            className="flex-1 gold-gradient text-black font-bold"
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Baixar Boleto PDF
          </Button>
        )}
        {invoiceUrl && (
          <Button
            onClick={() => window.open(invoiceUrl, "_blank")}
            variant="outline"
            className="flex-1 border-primary text-primary"
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Ver Fatura
          </Button>
        )}
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
          <li>Copie a linha digitável ou baixe o boleto PDF</li>
          <li>Acesse o app do seu banco ou lotérica</li>
          <li>Pague o boleto antes do vencimento</li>
          <li>A confirmação pode levar até 3 dias úteis</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-left">
        <p className="text-xs text-yellow-200">
          <strong>Importante:</strong> O boleto tem vencimento em 3 dias. Após o pagamento, 
          a confirmação pode levar até 3 dias úteis para ser processada pelo banco.
        </p>
      </div>

      {/* Back button */}
      <Button variant="outline" onClick={onBack} className="w-full border-white/10 hover:bg-white/5">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
    </div>
  );
}
