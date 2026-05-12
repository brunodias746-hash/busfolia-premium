'use client';
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { trpcClient } from "@/lib/trpcClient";
import { formatCurrency, formatCPF, formatPhone } from "@/lib/constants";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, ShieldCheck, User, MapPin, CreditCard, Check, MessageCircle, QrCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/PublicLayout";
import { AsaasPixPayment } from "@/components/AsaasPixPayment";
import { AsaasBoletoPayment } from "@/components/AsaasBoletoPayment";
import { AsaasCardForm } from "@/components/AsaasCardForm";
import { trackInitiateCheckout } from "@/utils/meta-pixel";

// Valida CPF usando algoritmo oficial
function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, remainder;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
}

interface PassengerData {
  name: string;
  cpf: string;
  boardingPointId: number;
}

interface FormData {
  customerName: string;
  customerCpf: string;
  customerEmail: string;
  customerPhone: string;
  boardingPointId: number;
  transportDate: string;
  transportDates: string[];
  purchaseType: 'single' | 'multiple' | 'all_days';
  passengers: PassengerData[];
}

const INITIAL_FORM: FormData = {
  customerName: "",
  customerCpf: "",
  customerEmail: "",
  customerPhone: "",
  boardingPointId: 0,
  transportDate: "",
  transportDates: [],
  purchaseType: 'single',
  passengers: [{ name: "", cpf: "", boardingPointId: 0 }],
};

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            i <= current ? "gold-gradient text-black" : "bg-white/5 text-muted-foreground"
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:inline ${i <= current ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < steps.length - 1 && <div className={`w-8 h-px ${i < current ? "bg-primary" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

type PaymentMethod = 'pix' | 'card' | 'boleto';

// Asaas checkout response types
interface AsaasCheckoutResponse {
  orderId: number;
  shortId: string;
  totalAmountCents: number;
  paymentMethod: string;
  asaasPaymentId: string;
  asaasStatus: string;
  // PIX
  pixQrCodeBase64?: string;
  pixCopyPaste?: string;
  pixExpirationDate?: string;
  // Boleto
  boletoIdentificationField?: string;
  boletoBarCode?: string;
  boletoUrl?: string;
  invoiceUrl?: string;
  // Card
  cardApproved?: boolean;
}

export default function Comprar() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: "" });
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; discountPercentage: number; discountAmountCents: number } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [asaasCheckoutData, setAsaasCheckoutData] = useState<AsaasCheckoutResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query available payment methods from Asaas
  const { data: availableMethods } = trpc.checkout.availablePaymentMethods.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
  });
  const pixAvailable = availableMethods?.methods?.pix ?? false;
  const boletoAvailable = availableMethods?.methods?.boleto ?? false;
  const cardAvailable = availableMethods?.methods?.card ?? true;

  // Set default payment method based on availability
  useEffect(() => {
    if (pixAvailable) {
      setPaymentMethod('pix');
    } else if (cardAvailable) {
      setPaymentMethod('card');
    } else if (boletoAvailable) {
      setPaymentMethod('boleto');
    }
  }, [pixAvailable, cardAvailable, boletoAvailable]);

  // Load saved form from localStorage
  useEffect(() => {
    const savedForm = localStorage.getItem('busfolia_checkout_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }, []);

  // Save form to localStorage
  useEffect(() => {
    localStorage.setItem('busfolia_checkout_form', JSON.stringify(form));
  }, [form]);

  // Track InitiateCheckout
  useEffect(() => {
    trackInitiateCheckout();
  }, []);

  const { data: events } = trpc.events.active.useQuery();
  const event = events?.[0];
  const eventId = useMemo(() => event?.id ?? 0, [event]);

  const { data: boardingPoints } = trpc.events.boardingPoints.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );

  // Asaas checkout mutation
  const createAsaasCheckout = trpc.checkout.createAsaasCheckout.useMutation({
    onSuccess: (data) => {
      setAsaasCheckoutData(data as AsaasCheckoutResponse);
      setIsSubmitting(false);
      
      if (data.paymentMethod === 'card' && data.cardApproved) {
        // Card approved immediately - redirect to success
        toast.success("Pagamento aprovado! Redirecionando...");
        setTimeout(() => {
          window.location.href = `/sucesso?order_id=${data.orderId}`;
        }, 1500);
      } else if (data.paymentMethod === 'card' && !data.cardApproved) {
        toast.error("Cartão recusado. Tente outro método de pagamento.");
        setStep(2); // Back to payment selection
      } else {
        // PIX or Boleto - show step 3
        setStep(3);
        toast.success(data.paymentMethod === 'pix' ? "QR Code PIX gerado!" : "Boleto gerado!");
      }
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast.error(err.message || "Erro ao processar pagamento");
    },
  });

  const dates = useMemo(() => {
    if (!event?.eventDate) return [];
    const parts = event.eventDate.split("|").map((s: string) => s.trim());
    if (parts.length < 3) return [event.eventDate];
    const daysPart = parts[0];
    const month = parts[1];
    const year = parts[2];
    const days = daysPart.replace(" e ", ", ").split(",").map((d: string) => d.trim());
    return days.map((d: string) => `${d} de ${month} de ${year}`);
  }, [event]);

  function validateStep0(): boolean {
    const e: Record<string, string> = {};
    if (form.purchaseType === 'single' && !form.transportDate) e.transportDate = "Selecione uma data";
    if (form.purchaseType === 'multiple' && form.transportDates.length < 2) e.transportDates = "Selecione pelo menos 2 datas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    const nameParts = form.customerName.trim().split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length < 2) e.customerName = "Nome completo obrigatório (nome + sobrenome)";
    const cpfClean = form.customerCpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) e.customerCpf = "CPF inválido (11 dígitos)";
    else if (!validateCPF(cpfClean)) e.customerCpf = "CPF inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "E-mail inválido";
    const phoneClean = form.customerPhone.replace(/\D/g, "");
    if (phoneClean.length < 10) e.customerPhone = "Telefone inválido";
    if (form.boardingPointId === 0) e.boardingPointId = "Selecione um ponto de embarque";
    form.passengers.forEach((p, i) => {
      const passengerNameParts = p.name.trim().split(/\s+/).filter(part => part.length > 0);
      if (passengerNameParts.length < 2) e[`passenger_${i}_name`] = "Nome completo obrigatório (nome + sobrenome)";
      const cpfClean = p.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) e[`passenger_${i}_cpf`] = "CPF inválido (11 dígitos)";
      else if (!validateCPF(cpfClean)) e[`passenger_${i}_cpf`] = "CPF inválido";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleTransportDateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, transportDate: value }));
    if (value && errors.transportDate) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.transportDate;
        return updated;
      });
    }
  }, [errors.transportDate]);

  const handleBoardingPointChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setForm(prev => ({ ...prev, boardingPointId: value }));
    if (value !== 0 && errors.boardingPointId) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.boardingPointId;
        return updated;
      });
    }
  }, [errors.boardingPointId]);

  function handleNext() {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  }

  // Submit Asaas checkout (PIX or Boleto)
  function handleAsaasSubmit(cardData?: any) {
    if (!event) return;
    setIsSubmitting(true);
    
    const passengersWithBP = form.passengers.map((p) => ({
      ...p,
      boardingPointId: p.boardingPointId || form.boardingPointId,
    }));

    createAsaasCheckout.mutate({
      eventId: event.id,
      customerName: form.customerName,
      customerCpf: form.customerCpf,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      boardingPointId: form.boardingPointId,
      transportDate: form.transportDate,
      transportDatesCount: form.purchaseType === 'multiple' ? form.transportDates.length : undefined,
      purchaseType: form.purchaseType,
      passengers: passengersWithBP,
      origin: window.location.origin,
      paymentMethod,
      ...(cardData || {}),
    });
  }

  function addPassenger() {
    setForm((f) => ({
      ...f,
      passengers: [...f.passengers, { name: "", cpf: "", boardingPointId: form.boardingPointId }],
    }));
  }

  function removePassenger(index: number) {
    if (form.passengers.length <= 1) return;
    setForm((f) => ({ ...f, passengers: f.passengers.filter((_, i) => i !== index) }));
  }

  function updatePassenger(index: number, field: keyof PassengerData, value: string | number) {
    setForm((f) => ({
      ...f,
      passengers: f.passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  // Dynamic pricing
  const getDynamicBasePrice = (): number => {
    const boardingPoint = boardingPoints?.find(bp => bp.id === form.boardingPointId);
    if (!boardingPoint) return event?.priceCents || 0;
    if (boardingPoint.city === 'BETIM' || boardingPoint.city === 'CONTAGEM') {
      return 7000;
    }
    return 6000;
  };

  const calculateTotal = (): number => {
    if (!event) return 0;
    const dynamicBasePrice = getDynamicBasePrice();
    let baseCents = 0;
    if (form.purchaseType === 'single') {
      baseCents = dynamicBasePrice;
    } else if (form.purchaseType === 'multiple') {
      baseCents = dynamicBasePrice * form.transportDates.length;
    } else if (form.purchaseType === 'all_days') {
      baseCents = 20000;
    }
    return (baseCents + event.feeCents) * form.passengers.length;
  };
  
  const calculateBasePrice = (): number => {
    if (!event) return 0;
    const dynamicBasePrice = getDynamicBasePrice();
    let baseCents = 0;
    if (form.purchaseType === 'single') {
      baseCents = dynamicBasePrice;
    } else if (form.purchaseType === 'multiple') {
      baseCents = dynamicBasePrice * form.transportDates.length;
    } else if (form.purchaseType === 'all_days') {
      baseCents = 20000;
    }
    return baseCents;
  };
  
  const calculateStep0Total = (): number => {
    if (!event) return 0;
    const dynamicBasePrice = getDynamicBasePrice();
    let baseCents = 0;
    if (form.purchaseType === 'single') {
      baseCents = dynamicBasePrice;
    } else if (form.purchaseType === 'multiple') {
      baseCents = dynamicBasePrice * form.transportDates.length;
    } else if (form.purchaseType === 'all_days') {
      baseCents = 20000;
    }
    return baseCents;
  };
  
  const calculateTax = (): number => {
    if (!event) return 0;
    let daysMultiplier = 1;
    if (form.purchaseType === 'multiple') {
      daysMultiplier = form.transportDates.length || 1;
    } else if (form.purchaseType === 'all_days') {
      daysMultiplier = 1;
    }
    return event.feeCents * daysMultiplier * form.passengers.length;
  };
  
  const totalCents = calculateTotal();
  const basePriceCents = calculateBasePrice();
  const taxCents = calculateTax();
  
  let discountCents = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage > 0) {
      discountCents = Math.round((basePriceCents * appliedCoupon.discountPercentage) / 100);
    } else if (appliedCoupon.discountAmountCents > 0) {
      discountCents = appliedCoupon.discountAmountCents;
    }
  }
  
  const finalTotalCents = totalCents - discountCents;
  const selectedBP = boardingPoints?.find((bp) => bp.id === form.boardingPointId);
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Digite um código de cupom' });
      return;
    }
    setCouponValidating(true);
    try {
      const result = await trpcClient.checkout.validateCoupon.query({ couponCode: couponCode.toUpperCase() });
      
      if (result.valid) {
        setAppliedCoupon({
          couponId: result.couponId!,
          discountPercentage: result.discountPercentage || 0,
          discountAmountCents: result.discountAmountCents || 0,
        });
        setCouponMessage({ type: 'success', text: `Cupom "${couponCode}" aplicado com sucesso! Desconto: ${result.discountPercentage}%` });
      } else {
        setAppliedCoupon(null);
        setCouponMessage({ type: 'error', text: result.error || "Cupom inválido" });
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponMessage({ type: 'error', text: err?.message || "Erro ao validar cupom" });
    } finally {
      setCouponValidating(false);
    }
  };

  if (!event) {
    return (
      <PublicLayout>
        <div className="container py-32 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-3xl py-8 sm:py-12 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-center mb-1 sm:mb-2">
          Escolha sua passagem
        </h1>
        <p className="text-center text-xs sm:text-base text-muted-foreground mb-6 sm:mb-8">Pedro Leopoldo Rodeio Show 2026</p>

        <StepIndicator current={step} steps={["Datas", "Dados", "Pagamento"]} />

        {/* STEP 0: Ticket Selection */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">Selecione o tipo de ingresso</h2>
              
              {/* Purchase Type Selection */}
              <div className="grid gap-3 mb-6">
                {/* Single Day */}
                <div 
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'single', transportDates: [] }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.purchaseType === 'single' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Dia Único</p>
                      <p className="text-xs text-muted-foreground">Escolha 1 dia do evento</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(getDynamicBasePrice())}</p>
                  </div>
                </div>

                {/* Multiple Days */}
                <div 
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'multiple', transportDate: '' }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.purchaseType === 'multiple' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Múltiplos Dias</p>
                      <p className="text-xs text-muted-foreground">Escolha 2 ou mais dias</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(getDynamicBasePrice())}/dia</p>
                  </div>
                </div>

                {/* All Days (Passport) */}
                <div 
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'all_days', transportDate: 'Todos os Dias', transportDates: [] }))}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    form.purchaseType === 'all_days' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">MELHOR VALOR</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">Passaporte — Todos os Dias</p>
                      <p className="text-xs text-muted-foreground">Acesso a todos os 4 dias</p>
                    </div>
                    <p className="text-lg font-bold text-primary">R$ 200,00</p>
                  </div>
                </div>
              </div>

              {/* Date Selection for Single */}
              {form.purchaseType === 'single' && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Selecione a data:</label>
                  <select
                    value={form.transportDate}
                    onChange={handleTransportDateChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Escolha uma data</option>
                    {dates.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.transportDate && <p className="text-xs text-red-400 mt-1">{errors.transportDate}</p>}
                </div>
              )}

              {/* Date Selection for Multiple */}
              {form.purchaseType === 'multiple' && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Selecione as datas (mínimo 2):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {dates.map((d) => (
                      <div
                        key={d}
                        onClick={() => {
                          setForm(f => {
                            const isSelected = f.transportDates.includes(d);
                            const newDates = isSelected
                              ? f.transportDates.filter(td => td !== d)
                              : [...f.transportDates, d];
                            return { ...f, transportDates: newDates, transportDate: newDates[0] || '' };
                          });
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer text-center text-sm transition-all ${
                          form.transportDates.includes(d)
                            ? 'border-primary bg-primary/10 text-primary font-bold'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  {errors.transportDates && <p className="text-xs text-red-400 mt-1">{errors.transportDates}</p>}
                  {form.transportDates.length > 0 && (
                    <p className="text-sm text-primary mt-2 font-semibold">
                      {form.transportDates.length} dia(s) selecionado(s) — Total: {formatCurrency(calculateStep0Total())}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <Button onClick={handleNext} className="w-full gold-gradient text-black font-bold">
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 1: Customer & Passenger Data */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">Dados do comprador</h2>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={form.customerName}
                    onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerName && <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="CPF"
                    value={form.customerCpf}
                    onChange={(e) => setForm(f => ({ ...f, customerCpf: formatCPF(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerCpf && <p className="text-xs text-red-400 mt-1">{errors.customerCpf}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={form.customerEmail}
                    onChange={(e) => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerEmail && <p className="text-xs text-red-400 mt-1">{errors.customerEmail}</p>}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Telefone (WhatsApp)"
                    value={form.customerPhone}
                    onChange={(e) => setForm(f => ({ ...f, customerPhone: formatPhone(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerPhone && <p className="text-xs text-red-400 mt-1">{errors.customerPhone}</p>}
                </div>

                <div>
                  <select
                    value={form.boardingPointId}
                    onChange={handleBoardingPointChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={0}>Selecione o ponto de embarque</option>
                    {boardingPoints?.map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        {bp.city} - {bp.locationName}
                      </option>
                    ))}
                  </select>
                  {errors.boardingPointId && <p className="text-xs text-red-400 mt-1">{errors.boardingPointId}</p>}
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Passageiros ({form.passengers.length})</h3>
                <Button variant="outline" size="sm" onClick={addPassenger} className="border-primary text-primary text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {form.passengers.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-semibold">Passageiro {i + 1}</span>
                      {form.passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(i)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Nome completo do passageiro"
                      value={p.name}
                      onChange={(e) => updatePassenger(i, 'name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                    />
                    {errors[`passenger_${i}_name`] && <p className="text-xs text-red-400 mb-2">{errors[`passenger_${i}_name`]}</p>}

                    <input
                      type="text"
                      placeholder="CPF do passageiro"
                      value={p.cpf}
                      onChange={(e) => updatePassenger(i, 'cpf', formatCPF(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    {errors[`passenger_${i}_cpf`] && <p className="text-xs text-red-400 mt-1">{errors[`passenger_${i}_cpf`]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 border-white/10 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleNext} className="flex-1 gold-gradient text-black font-bold">
                Revisar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Summary & Payment Method Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">Confirme e pague</h2>
              <p className="text-sm text-muted-foreground mb-6">Revise seus dados antes de prosseguir</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">INGRESSO</p>
                  <p className="font-bold text-lg">
                    {form.purchaseType === 'all_days' ? 'Passaporte — Todos os Dias' : form.purchaseType === 'multiple' ? 'Múltiplos Dias' : 'Dia Único'}
                  </p>
                  {form.purchaseType === 'single' && <p className="text-sm text-muted-foreground">{form.transportDate}</p>}
                  {form.purchaseType === 'multiple' && <p className="text-sm text-muted-foreground">{form.transportDates.join(', ')}</p>}
                  {form.purchaseType === 'all_days' && <p className="text-sm text-muted-foreground">05, 06, 12 e 13 de Junho de 2026</p>}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PASSAGEIRO</p>
                  <p className="font-bold">{form.customerName}</p>
                  <p className="text-sm text-muted-foreground">{form.customerEmail}</p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">EMBARQUE</p>
                  <p className="font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {selectedBP?.city} - {selectedBP?.locationName}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Preço base:</span>
                    <span className="font-semibold">{formatCurrency(basePriceCents)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa:</span>
                    <span className="font-semibold">{formatCurrency(taxCents)}</span>
                  </div>
                  {appliedCoupon && discountCents > 0 && (
                    <div className="flex justify-between items-center text-green-400">
                      <span className="text-sm">Desconto ({appliedCoupon.discountPercentage > 0 ? appliedCoupon.discountPercentage + '%' : 'cupom'}):</span>
                      <span className="font-semibold">-{formatCurrency(discountCents)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(finalTotalCents)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">Cupom de desconto:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponValidating}
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    {couponValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
                {couponMessage.type && (
                  <p className={`text-xs mt-1 ${couponMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold mb-3">Escolha o método de pagamento:</p>
                
                {/* PIX */}
                <div 
                  onClick={() => pixAvailable && setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !pixAvailable 
                      ? 'border-white/5 opacity-40 cursor-not-allowed' 
                      : paymentMethod === 'pix' 
                        ? 'border-green-500 bg-green-500/10 cursor-pointer' 
                        : 'border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'border-green-500' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'pix' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <QrCode className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <p className="font-semibold">PIX</p>
                      <p className="text-xs text-muted-foreground">
                        {pixAvailable ? 'Pagamento instantâneo — Sem taxa adicional' : 'Indisponível no momento'}
                      </p>
                    </div>
                    {pixAvailable ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">RECOMENDADO</span>
                    ) : (
                      <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-full">EM BREVE</span>
                    )}
                  </div>
                </div>

                {/* Credit Card */}
                <div 
                  onClick={() => cardAvailable && setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !cardAvailable 
                      ? 'border-white/5 opacity-40 cursor-not-allowed' 
                      : paymentMethod === 'card' 
                        ? 'border-primary bg-primary/10 cursor-pointer' 
                        : 'border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'card' ? 'border-primary' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'card' && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Cartão de Crédito</p>
                      <p className="text-xs text-muted-foreground">Aprovação imediata</p>
                    </div>
                    {!pixAvailable && cardAvailable && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-bold ml-auto">RECOMENDADO</span>
                    )}
                  </div>
                </div>

                {/* Boleto */}
                <div 
                  onClick={() => boletoAvailable && setPaymentMethod('boleto')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !boletoAvailable 
                      ? 'border-white/5 opacity-40 cursor-not-allowed' 
                      : paymentMethod === 'boleto' 
                        ? 'border-orange-500 bg-orange-500/10 cursor-pointer' 
                        : 'border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'boleto' ? 'border-orange-500' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'boleto' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                    </div>
                    <FileText className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-semibold">Boleto Bancário</p>
                      <p className="text-xs text-muted-foreground">
                        {boletoAvailable ? 'Vencimento em 3 dias — Confirmação em até 3 dias úteis' : 'Indisponível no momento'}
                      </p>
                    </div>
                    {!boletoAvailable && (
                      <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-full ml-auto">EM BREVE</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-100">
                  {paymentMethod === 'pix' && 'Pagamento instantâneo via PIX. Confirmação automática em segundos.'}
                  {paymentMethod === 'card' && 'Pagamento seguro com cartão de crédito. Aprovação imediata.'}
                  {paymentMethod === 'boleto' && 'Boleto bancário com vencimento em 3 dias. Pague em qualquer banco ou lotérica.'}
                </p>
              </div>

              {/* Card form inline for card method */}
              {paymentMethod === 'card' ? (
                <AsaasCardForm
                  onSubmit={(cardData) => handleAsaasSubmit(cardData)}
                  isLoading={isSubmitting}
                  customerName={form.customerName}
                  customerEmail={form.customerEmail}
                  customerCpf={form.customerCpf}
                  customerPhone={form.customerPhone}
                  onBack={() => setStep(1)}
                />
              ) : (
                /* Navigation for PIX and Boleto */
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 hover:bg-white/5">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button
                    onClick={() => handleAsaasSubmit()}
                    disabled={isSubmitting}
                    className="flex-1 gold-gradient text-black font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                      </>
                    ) : paymentMethod === 'pix' ? (
                      <>
                        <QrCode className="w-4 h-4 mr-2" /> Gerar PIX
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" /> Gerar Boleto
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Payment (PIX QR Code or Boleto) */}
        {step === 3 && asaasCheckoutData && paymentMethod === 'pix' && asaasCheckoutData.pixQrCodeBase64 && (
          <AsaasPixPayment
            orderId={asaasCheckoutData.orderId}
            shortId={asaasCheckoutData.shortId}
            totalAmountCents={asaasCheckoutData.totalAmountCents}
            pixQrCodeBase64={asaasCheckoutData.pixQrCodeBase64}
            pixCopyPaste={asaasCheckoutData.pixCopyPaste || ""}
            onBack={() => setStep(2)}
          />
        )}

        {step === 3 && asaasCheckoutData && paymentMethod === 'boleto' && asaasCheckoutData.boletoIdentificationField && (
          <AsaasBoletoPayment
            orderId={asaasCheckoutData.orderId}
            shortId={asaasCheckoutData.shortId}
            totalAmountCents={asaasCheckoutData.totalAmountCents}
            boletoIdentificationField={asaasCheckoutData.boletoIdentificationField}
            boletoBarCode={asaasCheckoutData.boletoBarCode}
            boletoUrl={asaasCheckoutData.boletoUrl}
            invoiceUrl={asaasCheckoutData.invoiceUrl}
            onBack={() => setStep(2)}
          />
        )}

      </div>
    </PublicLayout>
  );
}
