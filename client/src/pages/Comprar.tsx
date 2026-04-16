'use client';
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { trpcClient } from "@/lib/trpcClient";
import { formatCurrency, formatCPF, formatPhone } from "@/lib/constants";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, ShieldCheck, User, MapPin, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/PublicLayout";
import { trackInitiateCheckout } from "@/utils/meta-pixel";

// Valida CPF usando algoritmo oficial
function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, remainder;
  // First digit validation
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  // Second digit validation
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

export default function Comprar() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: "" });
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; discountPercentage: number; discountAmountCents: number } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'pix'>('stripe');
  const [pixData, setPixData] = useState<{ orderId: number; shortId: string; qrCodeDataUrl: string; pixCopyPaste: string; totalAmountCents: number } | null>(null);
  const [pixOrderId, setPixOrderId] = useState<number | null>(null);

  // Carregar dados salvos do localStorage ao montar o componente
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

  // Salvar dados no localStorage sempre que o formulário muda
  useEffect(() => {
    localStorage.setItem('busfolia_checkout_form', JSON.stringify(form));
  }, [form]);

  // Track InitiateCheckout when page loads
  useEffect(() => {
    trackInitiateCheckout();
  }, []);

  const { data: events } = trpc.events.active.useQuery();
  const event = events?.[0]; // Use first active event
  const eventId = useMemo(() => event?.id ?? 0, [event]);

  const { data: boardingPoints } = trpc.events.boardingPoints.useQuery(
    { eventId },
    { enabled: eventId > 0 }
  );

  const createSession = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar sessão de pagamento");
    },
  });

  const createPixOrder = trpc.checkout.createPixOrder.useMutation({
    onSuccess: (data) => {
      setPixData(data);
      setPixOrderId(data.orderId);
      setStep(3);
      toast.success("Codigo PIX gerado com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar pedido PIX");
    },
  });

  const checkPixStatus = trpc.checkout.checkPixStatus.useQuery(
    { orderId: pixOrderId ?? 0 },
    { enabled: pixOrderId !== null && step === 3, refetchInterval: 2000 }
  );

  const confirmPixPayment = trpc.checkout.confirmPixPayment.useMutation({
    onSuccess: () => {
      toast.success("Pagamento confirmado! Redirecionando...");
      setTimeout(() => {
        if (pixOrderId) {
          window.location.href = `/sucesso?order_id=${pixOrderId}`;
        }
      }, 1500);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao confirmar pagamento");
    },
  });

  // Auto-confirm PIX payment when status changes to paid
  useEffect(() => {
    if (checkPixStatus.data?.status === "paid" && pixOrderId && !confirmPixPayment.isPending) {
      confirmPixPayment.mutate({ orderId: pixOrderId });
    }
  }, [checkPixStatus.data?.status, pixOrderId, confirmPixPayment.isPending, confirmPixPayment]);

  const dates = useMemo(() => {
    if (!event?.eventDate) return [];
    // Parse dates like "05, 06, 12 e 13 | Junho | 2026"
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
    // Validate customer name: must have at least 2 words (name + surname)
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
      // Validate passenger name: must have at least 2 words (name + surname)
      const passengerNameParts = p.name.trim().split(/\s+/).filter(part => part.length > 0);
      if (passengerNameParts.length < 2) e[`passenger_${i}_name`] = "Nome completo obrigatório (nome + sobrenome)";
      const cpfClean = p.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) e[`passenger_${i}_cpf`] = "CPF inválido (11 dígitos)";
      else if (!validateCPF(cpfClean)) e[`passenger_${i}_cpf`] = "CPF inválido";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Controlled component handlers com useCallback
  const handleTransportDateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, transportDate: value }));
    // Clear error immediately when user selects
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
    // Clear error immediately when user selects
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

  function handleSubmit() {
    if (!event) return;
    const passengersWithBP = form.passengers.map((p) => ({
      ...p,
      boardingPointId: p.boardingPointId || form.boardingPointId,
    }));
    createSession.mutate({
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
      couponCode: appliedCoupon ? couponCode : undefined,
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

  // Get dynamic base price based on boarding point city
  const getDynamicBasePrice = (): number => {
    const boardingPoint = boardingPoints?.find(bp => bp.id === form.boardingPointId);
    if (!boardingPoint) return event?.priceCents || 0;
    
    // BETIM or CONTAGEM → R$70,00 (7000 cents)
    if (boardingPoint.city === 'BETIM' || boardingPoint.city === 'CONTAGEM') {
      return 7000;
    }
    // BH (Belo Horizonte) or SANTA LUZIA → R$60,00 (6000 cents)
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
      baseCents = 20000; // R$200 fixed price
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
      baseCents = 20000; // R$200 fixed price
    }
    return baseCents;
  };
  
  // Calculate Step 0 total (ticket only, no passengers multiplier)
  const calculateStep0Total = (): number => {
    if (!event) return 0;
    const dynamicBasePrice = getDynamicBasePrice();
    let baseCents = 0;
    if (form.purchaseType === 'single') {
      baseCents = dynamicBasePrice;
    } else if (form.purchaseType === 'multiple') {
      baseCents = dynamicBasePrice * form.transportDates.length;
    } else if (form.purchaseType === 'all_days') {
      baseCents = 20000; // R$200 fixed price
    }
    return baseCents;
  };
  
  const calculateTax = (): number => {
    if (!event) return 0;
    let daysMultiplier = 1;
    if (form.purchaseType === 'multiple') {
      daysMultiplier = form.transportDates.length || 1;
    } else if (form.purchaseType === 'all_days') {
      daysMultiplier = 1; // all_days has fixed fee of 6.10
    }
    return event.feeCents * daysMultiplier * form.passengers.length;
  };
  
  const totalCents = calculateTotal();
  const basePriceCents = calculateBasePrice();
  const taxCents = calculateTax();
  
  // Calculate discount
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
              <h2 className="text-lg sm:text-xl font-bold mb-4">Escolha sua passagem</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Dia Único */}
                <button
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'single' }))}
                  className={`relative border-2 rounded-2xl p-6 transition-all ${
                    form.purchaseType === 'single'
                      ? "border-primary bg-primary/5"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  {form.purchaseType === 'single' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full gold-gradient flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-bold mb-1">Dia Único</h3>
                    <p className="text-sm text-muted-foreground mb-3">Escolha 1 dia do evento</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(getDynamicBasePrice())}</p>
                    <p className="text-xs text-muted-foreground mt-1">/dia</p>
                  </div>
                </button>

                {/* Múltiplos Dias */}
                <button
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'multiple', transportDates: [] }))}
                  className={`relative border-2 rounded-2xl p-6 transition-all ${
                    form.purchaseType === 'multiple'
                      ? "border-primary bg-primary/5"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  {form.purchaseType === 'multiple' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full gold-gradient flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-bold mb-1">Múltiplos Dias</h3>
                    <p className="text-sm text-muted-foreground mb-3">Escolha 2 ou mais dias</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(getDynamicBasePrice() * 2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">/2 dias</p>
                  </div>
                </button>

                {/* Passaporte - Todos os Dias */}
                <button
                  onClick={() => setForm(f => ({ ...f, purchaseType: 'all_days' }))}
                  className={`relative border-2 rounded-2xl p-6 transition-all ${
                    form.purchaseType === 'all_days'
                      ? "border-primary bg-primary/5"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  {form.purchaseType === 'all_days' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full gold-gradient flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-black text-xs font-bold px-2.5 py-1 rounded-full">MAIS POPULAR</span>
                  </div>
                  <div className="text-left mt-6">
                    <h3 className="text-lg font-bold mb-1">Passaporte — Todos os Dias</h3>
                    <p className="text-sm text-muted-foreground mb-3">05, 06, 12 e 13 de Junho • Melhor valor!</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(20000)}</p>
                    <p className="text-xs text-muted-foreground mt-1">/4 dias</p>
                  </div>
                </button>
              </div>

              {/* Date Selection Grid */}
              {form.purchaseType === 'single' && (
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">SELECIONE 1 DATA</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setForm(prev => ({ ...prev, transportDate: d }));
                          if (errors.transportDate) {
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated.transportDate;
                              return updated;
                            });
                          }
                        }}
                        className={`border-2 rounded-xl p-3 text-center transition-all ${
                          form.transportDate === d
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        <div className="text-sm font-bold">{d.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">{d.split(" ")[2]}</div>
                      </button>
                    ))}
                  </div>
                  {errors.transportDate && <p className="text-xs text-red-400 mt-2">{errors.transportDate}</p>}
                </div>
              )}

              {form.purchaseType === 'multiple' && (
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-3 block">SELECIONE 2 OU MAIS DATAS</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setForm(prev => {
                            const isSelected = prev.transportDates.includes(d);
                            return {
                              ...prev,
                              transportDates: isSelected
                                ? prev.transportDates.filter(date => date !== d)
                                : [...prev.transportDates, d]
                            };
                          });
                          if (errors.transportDates) {
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated.transportDates;
                              return updated;
                            });
                          }
                        }}
                        className={`border-2 rounded-xl p-3 text-center transition-all ${
                          form.transportDates.includes(d)
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        <div className="text-sm font-bold">{d.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">{d.split(" ")[2]}</div>
                      </button>
                    ))}
                  </div>
                  {errors.transportDates && <p className="text-xs text-red-400 mt-2">{errors.transportDates}</p>}
                  {form.transportDates.length > 0 && (
                    <p className="text-xs text-primary mt-2">Selecionadas {form.transportDates.length} datas</p>
                  )}
                </div>
              )}

              {form.purchaseType === 'all_days' && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                  <p className="text-sm text-foreground">✓ Passaporte válido para <span className="font-bold">todos os 4 dias do evento</span></p>
                  <p className="text-xs text-muted-foreground mt-2">05, 06, 12 e 13 de Junho de 2026</p>
                </div>
              )}

              {/* Total and Continue */}
              <div className="mt-6 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculateStep0Total())}</span>
                </div>
                <Button onClick={handleNext} className="w-full gold-gradient text-black font-bold py-3 rounded-xl">
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Personal Data & Boarding */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">Seus dados</h2>
              <p className="text-sm text-muted-foreground mb-6">Informações para o ingresso e confirmação</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Nome completo *</label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerName && <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">E-mail *</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerEmail && <p className="text-xs text-red-400 mt-1">{errors.customerEmail}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="(31) 99999-9999"
                    value={form.customerPhone}
                    onChange={(e) => setForm((f) => ({ ...f, customerPhone: formatPhone(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerPhone && <p className="text-xs text-red-400 mt-1">{errors.customerPhone}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">CPF *</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.customerCpf}
                    onChange={(e) => setForm((f) => ({ ...f, customerCpf: formatCPF(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.customerCpf && <p className="text-xs text-red-400 mt-1">{errors.customerCpf}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Ponto de embarque *</label>
                  <select
                    value={form.boardingPointId}
                    onChange={handleBoardingPointChange}
                    className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={0}>Selecione um ponto</option>
                    {boardingPoints && boardingPoints.length > 0 ? (
                      boardingPoints.map((bp) => (
                        <option key={bp.id} value={bp.id}>
                          {bp.city} - {bp.locationName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Carregando pontos...</option>
                    )}
                  </select>
                  {errors.boardingPointId && <p className="text-xs text-red-400 mt-1">{errors.boardingPointId}</p>}
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Passageiros ({form.passengers.length})</h3>
                <Button variant="outline" size="sm" onClick={addPassenger} className="border-primary/30 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {form.passengers.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Passageiro {i + 1}</h4>
                      {form.passengers.length > 1 && (
                        <button
                          onClick={() => removePassenger(i)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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

        {/* STEP 2: Summary & Payment */}
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

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold mb-3">Escolha o metodo de pagamento:</p>
                
                <div 
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'stripe' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'stripe' ? 'border-primary' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'stripe' && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold">Cartao de Credito (Stripe)</p>
                      <p className="text-xs text-muted-foreground">Seguro e rapido</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'pix' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'pix' ? 'border-primary' : 'border-white/30'
                    }`}>
                      {paymentMethod === 'pix' && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold">PIX</p>
                      <p className="text-xs text-muted-foreground">Instantaneo - Valido por 5 minutos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-100">
                  {paymentMethod === 'stripe' ? 'Pagamento seguro via Stripe' : 'PIX instantaneo - Nenhuma taxa adicional'}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                {paymentMethod === 'stripe' ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={createSession.isPending}
                    className="flex-1 gold-gradient text-black font-bold"
                  >
                    {createSession.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" /> Pagar com Stripe
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (!event) return;
                      const passengersWithBP = form.passengers.map((p) => ({
                        ...p,
                        boardingPointId: p.boardingPointId || form.boardingPointId,
                      }));
                      createPixOrder.mutate({
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
                        couponCode: appliedCoupon ? couponCode : undefined,
                      });
                    }}
                    disabled={createPixOrder.isPending}
                    className="flex-1 gold-gradient text-black font-bold"
                  >
                    {createPixOrder.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" /> Gerar QR Code PIX
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PIX Payment */}
        {step === 3 && pixData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-2">Escaneie o codigo PIX</h2>
              <p className="text-sm text-muted-foreground mb-6">Abra seu app bancario e escaneie o QR Code abaixo</p>

              {/* QR Code Display */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 flex flex-col items-center">
                <img 
                  src={pixData.qrCodeDataUrl} 
                  alt="PIX QR Code" 
                  className="w-64 h-64 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-4">Codigo PIX valido por 5 minutos</p>
              </div>

              {/* Copy PIX Code */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Ou copie o codigo PIX:</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={pixData.pixCopyPaste}
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm font-mono text-muted-foreground"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.pixCopyPaste);
                      toast.success("Codigo copiado!");
                    }}
                    className="gold-gradient text-black font-bold"
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PEDIDO</p>
                  <p className="font-bold text-lg">#{pixData.shortId}</p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">VALOR</p>
                  <p className="font-bold text-2xl text-primary">{formatCurrency(pixData.totalAmountCents)}</p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">STATUS</p>
                  {checkPixStatus.isLoading && <p className="text-sm">Aguardando pagamento...</p>}
                  {checkPixStatus.data?.status === "pending" && <p className="text-sm text-yellow-400">Aguardando pagamento...</p>}
                  {checkPixStatus.data?.status === "paid" && <p className="text-sm text-green-400">Pagamento confirmado!</p>}
                  {checkPixStatus.data?.status === "expired" && <p className="text-sm text-red-400">Codigo expirado</p>}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-100">
                  <strong>Como funciona:</strong><br/>
                  1. Abra seu app bancario<br/>
                  2. Selecione a opcao PIX<br/>
                  3. Escaneie o QR Code ou copie o codigo<br/>
                  4. Confirme o pagamento<br/>
                  5. Voce recebera a confirmacao automaticamente
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep(2);
                    setPixData(null);
                    setPixOrderId(null);
                  }} 
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button
                  disabled={true}
                  className="flex-1 bg-white/10 text-muted-foreground cursor-not-allowed"
                >
                  Aguardando pagamento...
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );

}
