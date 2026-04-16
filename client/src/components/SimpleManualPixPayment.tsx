import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SimpleManualPixPaymentProps {
  amount: number; // in BRL
  boardingPoint: string;
  onBack: () => void;
}

export function SimpleManualPixPayment({
  amount,
  boardingPoint,
  onBack,
}: SimpleManualPixPaymentProps) {
  const pixKey = "busfolia@hotmail.com";
  const whatsappLink = "https://wa.me/5531990908399";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Pagar com PIX</h2>
        <p className="text-sm text-muted-foreground">
          Envie o pagamento para a chave PIX abaixo
        </p>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
          Valor a pagar
        </p>
        <p className="text-4xl font-bold text-amber-400">{formatCurrency(amount)}</p>
        <p className="text-xs text-muted-foreground mt-2">Sem taxa adicional</p>
      </div>

      {/* PIX Key Display */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Chave PIX
          </p>
          <p className="font-mono text-lg font-bold break-all">{pixKey}</p>
        </div>

        <Button
          onClick={handleCopyKey}
          className="w-full gold-gradient text-black font-bold h-12"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar Chave PIX
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-blue-100">
          📋 Como proceder:
        </p>
        <ol className="text-sm text-blue-100 space-y-2 list-decimal list-inside">
          <li>Abra seu app bancário</li>
          <li>Selecione PIX</li>
          <li>Cole a chave PIX ou digite: {pixKey}</li>
          <li>Confirme o pagamento de {formatCurrency(amount)}</li>
          <li>Envie o comprovante no WhatsApp</li>
        </ol>
      </div>

      {/* Important Message */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-sm text-red-100">
          <strong>⚠️ Importante:</strong><br />
          Pague o valor exato mostrado acima. Depois envie o comprovante
          imediatamente no WhatsApp informando:
        </p>
        <ul className="text-sm text-red-100 mt-2 space-y-1 list-disc list-inside">
          <li>Nome completo</li>
          <li>Ponto de embarque: <strong>{boardingPoint}</strong></li>
          <li>Data(s) da viagem</li>
        </ul>
      </div>

      {/* WhatsApp Button */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12">
          <MessageCircle className="w-5 h-5 mr-2" />
          Enviar Comprovante no WhatsApp
        </Button>
      </a>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="w-full border-white/10 hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
    </div>
  );
}
