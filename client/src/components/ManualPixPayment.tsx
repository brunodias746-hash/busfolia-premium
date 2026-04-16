import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ManualPixPaymentProps {
  amount: number; // in BRL
  pixCode: string; // The exact PIX Copia e Cola code
  boardingPoint: string;
  onBack: () => void;
}

export function ManualPixPayment({
  amount,
  pixCode,
  boardingPoint,
  onBack,
}: ManualPixPaymentProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate QR Code from PIX code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(pixCode, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [pixCode]);

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá! Envio o comprovante de pagamento PIX da minha compra de passagens. Ponto de embarque: ${boardingPoint}. Valor: R$ ${amount.toFixed(2)}`
    );
    window.open(`https://wa.me/5531990908399?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Pagamento via PIX</h2>
        <p className="text-white/70">Escaneie o código QR ou copie e cole o código abaixo</p>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 text-center">
        <p className="text-white/70 text-sm mb-1">Valor a pagar</p>
        <p className="text-4xl font-bold text-yellow-400">R$ {amount.toFixed(2)}</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        {qrCodeDataUrl ? (
          <div className="bg-white p-4 rounded-lg">
            <img src={qrCodeDataUrl} alt="PIX QR Code" className="w-80 h-80" />
          </div>
        ) : (
          <div className="w-80 h-80 bg-white/10 rounded-lg flex items-center justify-center">
            <p className="text-white/50">Gerando QR Code...</p>
          </div>
        )}
      </div>

      {/* PIX Copy-Paste Code */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white/70">Código PIX (Copia e Cola)</p>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between gap-2">
          <code className="text-xs text-white/60 break-all flex-1 font-mono">{pixCode}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyPixCode}
            className="flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" /> Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-red-400">⚠️ Importante</p>
        <p className="text-sm text-white/80">
          Pague o valor exato mostrado acima. Depois envie o comprovante imediatamente no WhatsApp
          informando seu nome completo, ponto de embarque e data(s) da viagem.
        </p>
        <p className="text-xs text-white/60 mt-2">
          Após receber o comprovante, o administrador criará seu pedido e enviará a passagem por
          email.
        </p>
      </div>

      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsAppClick}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Enviar Comprovante no WhatsApp
      </Button>

      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="w-full border-white/10 hover:bg-white/5"
      >
        Voltar
      </Button>
    </div>
  );
}
