import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2, Lock } from "lucide-react";
import { formatCPF } from "@/lib/constants";

interface AsaasCardFormProps {
  onSubmit: (cardData: {
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone: string;
    };
  }) => void;
  isLoading: boolean;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  onBack: () => void;
}

export function AsaasCardForm({
  onSubmit,
  isLoading,
  customerName,
  customerEmail,
  customerCpf,
  customerPhone,
  onBack,
}: AsaasCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState(customerName);
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [ccv, setCcv] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatPostalCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const cleanCardNumber = cardNumber.replace(/\D/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) e.cardNumber = "Número do cartão inválido";
    if (!holderName.trim()) e.holderName = "Nome do titular obrigatório";
    if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) e.expiryMonth = "Mês inválido";
    if (!expiryYear || expiryYear.length !== 4) e.expiryYear = "Ano inválido";
    if (!ccv || ccv.length < 3) e.ccv = "CVV inválido";
    if (postalCode.replace(/\D/g, "").length < 8) e.postalCode = "CEP inválido";
    if (!addressNumber.trim()) e.addressNumber = "Número obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      creditCard: {
        holderName,
        number: cardNumber.replace(/\D/g, ""),
        expiryMonth,
        expiryYear,
        ccv,
      },
      creditCardHolderInfo: {
        name: customerName,
        email: customerEmail,
        cpfCnpj: customerCpf.replace(/\D/g, ""),
        postalCode: postalCode.replace(/\D/g, ""),
        addressNumber,
        phone: customerPhone.replace(/\D/g, ""),
      },
    });
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold">Dados do Cartão</h3>
          <p className="text-xs text-muted-foreground">Preencha os dados do cartão de crédito</p>
        </div>
      </div>

      {/* Card Number */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Número do Cartão</label>
        <input
          type="text"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          className={inputClass}
          maxLength={19}
        />
        {errors.cardNumber && <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>}
      </div>

      {/* Holder Name */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Nome no Cartão</label>
        <input
          type="text"
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value.toUpperCase())}
          className={inputClass}
        />
        {errors.holderName && <p className="text-xs text-red-400 mt-1">{errors.holderName}</p>}
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Mês</label>
          <input
            type="text"
            placeholder="MM"
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
            className={inputClass}
            maxLength={2}
          />
          {errors.expiryMonth && <p className="text-xs text-red-400 mt-1">{errors.expiryMonth}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Ano</label>
          <input
            type="text"
            placeholder="AAAA"
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={inputClass}
            maxLength={4}
          />
          {errors.expiryYear && <p className="text-xs text-red-400 mt-1">{errors.expiryYear}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">CVV</label>
          <input
            type="text"
            placeholder="000"
            value={ccv}
            onChange={(e) => setCcv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={inputClass}
            maxLength={4}
          />
          {errors.ccv && <p className="text-xs text-red-400 mt-1">{errors.ccv}</p>}
        </div>
      </div>

      {/* Address info (required by Asaas for anti-fraud) */}
      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-muted-foreground mb-3">Endereço de cobrança (obrigatório)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">CEP</label>
            <input
              type="text"
              placeholder="00000-000"
              value={postalCode}
              onChange={(e) => setPostalCode(formatPostalCode(e.target.value))}
              className={inputClass}
              maxLength={9}
            />
            {errors.postalCode && <p className="text-xs text-red-400 mt-1">{errors.postalCode}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Número</label>
            <input
              type="text"
              placeholder="123"
              value={addressNumber}
              onChange={(e) => setAddressNumber(e.target.value)}
              className={inputClass}
            />
            {errors.addressNumber && <p className="text-xs text-red-400 mt-1">{errors.addressNumber}</p>}
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
        <Lock className="w-4 h-4 text-green-400 flex-shrink-0" />
        <p className="text-xs text-green-200">Pagamento seguro processado pela Asaas. Seus dados são criptografados.</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-white/10 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 gold-gradient text-black font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" /> Pagar com Cartão
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
