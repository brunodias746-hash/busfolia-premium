import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface SimpleManualPixPaymentProps {
  amount: number; // in BRL
  boardingPoint: string;
  onBack: () => void;
}

function generateBRCode(pixKey: string, amount: number): string {
  // Format amount with 2 decimal places
  const amountStr = amount.toFixed(2).replace(".", "");

  // Build the BR Code according to EMV standard
  // 00: Payload Format Indicator
  const payload00 = "00020126420014"; // Static header

  // 01: Point of Initiation Method (12 = static)
  const payload01 = "12";

  // 26: Merchant Account Information (PIX)
  const merchantInfo = `00${pixKey.length.toString().padStart(2, "0")}${pixKey}`;
  const payload26 = `26${merchantInfo.length.toString().padStart(2, "0")}${merchantInfo}`;

  // 52: Merchant Category Code
  const payload52 = "5204000053039865";

  // 53: Transaction Currency (986 = BRL)
  const payload53 = "5303986";

  // 54: Transaction Amount
  const payload54 = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`;

  // 58: Country Code (BR)
  const payload58 = "5802BR";

  // 59: Merchant Name
  const merchantName = "Bruno Henrique do Carmo D";
  const payload59 = `59${merchantName.length.toString().padStart(2, "0")}${merchantName}`;

  // 60: Merchant City
  const merchantCity = "SAO PAULO";
  const payload60 = `60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}`;

  // 62: Additional Data Field Template (unique ID)
  const uniqueId = Math.random()
    .toString(36)
    .substring(2, 12)
    .toUpperCase()
    .padEnd(10, "0");
  const payload62 = `6210${uniqueId}`;

  // Combine all payloads
  const brCode =
    payload00 +
    payload01 +
    payload26 +
    payload52 +
    payload53 +
    payload54 +
    payload58 +
    payload59 +
    payload60 +
    payload62;

  // Calculate CRC16-CCITT checksum
  const crc = calculateCRC16(brCode + "6304");

  return brCode + "6304" + crc;
}

function calculateCRC16(data: string): string {
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;

    for (let j = 0; j < 8; j++) {
      crc = crc << 1;
      if (crc & 0x10000) {
        crc = (crc ^ 0x1021) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function SimpleManualPixPayment({
  amount,
  boardingPoint,
  onBack,
}: SimpleManualPixPaymentProps) {
  const pixKey = "busfolia@hotmail.com";
  const whatsappLink = "https://wa.me/5531990908399";
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Generate QR Code when amount changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const brCode = generateBRCode(pixKey, amount);
        const dataUrl = await QRCode.toDataURL(brCode, {
          errorCorrectionLevel: "H",
          type: "image/png",
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error("Erro ao gerar QR Code:", error);
      }
    };
    generateQR();
  }, [amount]);

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

      {/* QR Code Display */}
      {qrCodeDataUrl && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Escaneie o QR Code
          </p>
          <img
            src={qrCodeDataUrl}
            alt="PIX QR Code"
            className="w-80 h-80 rounded-lg shadow-lg"
          />
          <p className="text-xs text-muted-foreground mt-4">
            Válido para o valor acima
          </p>
        </div>
      )}

      {/* PIX Key Display */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Ou copie a chave PIX:
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
        <p className="text-sm font-semibold text-blue-100">📋 Como proceder:</p>
        <ol className="text-sm text-blue-100 space-y-2 list-decimal list-inside">
          <li>Abra seu app bancário</li>
          <li>Selecione PIX</li>
          <li>Escaneie o QR Code acima ou cole a chave PIX</li>
          <li>Confirme o pagamento de {formatCurrency(amount)}</li>
          <li>Envie o comprovante no WhatsApp</li>
        </ol>
      </div>

      {/* Important Message */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-sm text-red-100">
          <strong>⚠️ Importante:</strong>
          <br />
          Pague o valor exato mostrado acima. Depois envie o comprovante
          imediatamente no WhatsApp informando:
        </p>
        <ul className="text-sm text-red-100 mt-2 space-y-1 list-disc list-inside">
          <li>Nome completo</li>
          <li>
            Ponto de embarque: <strong>{boardingPoint}</strong>
          </li>
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
