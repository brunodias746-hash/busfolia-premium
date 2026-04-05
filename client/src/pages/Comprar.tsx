import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatCPF, formatPhone } from "@/lib/constants";
import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, ShieldCheck, User, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";

// Valida CPF usando algoritmo oficial
function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.substring(10, 11));
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
  passengers: PassengerData[];
}

const INITIAL_FORM: FormData = {
  customerName: "",
  customerCpf: "",
  customerEmail: "",
  customerPhone: "",
  boardingPointId: 0,
  transportDate: "",
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
    if (form.customerName.trim().length < 5) e.customerName = "Nome completo obrigatório (nome + sobrenome)";
    const cpfClean = form.customerCpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) e.customerCpf = "CPF inválido (11 dígitos)";
    else if (!validateCPF(cpfClean)) e.customerCpf = "CPF inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) e.customerEmail = "E-mail inválido";
    const phoneClean = form.customerPhone.replace(/\D/g, "");
    if (phoneClean.length < 10) e.customerPhone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.boardingPointId) e.boardingPointId = "Selecione um ponto de embarque";
    if (!form.transportDate) e.transportDate = "Selecione uma data";
    form.passengers.forEach((p, i) => {
      if (p.name.trim().length < 3) e[`passenger_${i}_name`] = "Nome obrigatório";
      const cpfClean = p.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) e[`passenger_${i}_cpf`] = "CPF inválido (11 dígitos)";
      else if (!validateCPF(cpfClean)) e[`passenger_${i}_cpf`] = "CPF inválido";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

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
      passengers: passengersWithBP,
      origin: window.location.origin,
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

  const totalCents = event ? (event.priceCents + event.feeCents) * form.passengers.length : 0;
  const selectedBP = boardingPoints?.find((bp) => bp.id === form.boardingPointId);

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
      <div className="container max-w-2xl py-12">
        <h1 className="text-3xl font-black font-heading text-center mb-2">
          Comprar <span className="gold-text">Passagem</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">{event.name}</p>

        <StepIndicator current={step} steps={["Dados Pessoais", "Embarque", "Resumo"]} />

        {/* Step 0: Personal Data */}
        {step === 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Dados Pessoais</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Nome Completo</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Seu nome completo"
              />
              {errors.customerName && <p className="text-xs text-red-400 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">CPF</label>
              <input
                type="text"
                value={form.customerCpf}
                onChange={(e) => setForm((f) => ({ ...f, customerCpf: formatCPF(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.customerCpf && <p className="text-xs text-red-400 mt-1">{errors.customerCpf}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">E-mail</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="seu@email.com"
              />
              {errors.customerEmail && <p className="text-xs text-red-400 mt-1">{errors.customerEmail}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: formatPhone(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="(31) 99999-9999"
                maxLength={15}
              />
              {errors.customerPhone && <p className="text-xs text-red-400 mt-1">{errors.customerPhone}</p>}
            </div>

            <Button onClick={handleNext} className="w-full gold-gradient text-black font-bold py-3 rounded-xl">
              PRÓXIMO <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 1: Boarding & Passengers */}
        {step === 1 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Embarque e Passageiros</h2>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Data da Viagem</label>
              <select
                value={form.transportDate}
                onChange={(e) => setForm((f) => ({ ...f, transportDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="" className="bg-background">Selecione a data</option>
                {dates.map((d) => (
                  <option key={d} value={d} className="bg-background">{d}</option>
                ))}
              </select>
              {errors.transportDate && <p className="text-xs text-red-400 mt-1">{errors.transportDate}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Ponto de Embarque</label>
              <select
                value={form.boardingPointId}
                onChange={(e) => setForm((f) => ({ ...f, boardingPointId: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={0} className="bg-background">Selecione o ponto</option>
                {boardingPoints?.map((bp) => (
                  <option key={bp.id} value={bp.id} className="bg-background">
                    {bp.city} - {bp.locationName} (Saída: {bp.departureTime})
                  </option>
                ))}
              </select>
              {errors.boardingPointId && <p className="text-xs text-red-400 mt-1">{errors.boardingPointId}</p>}
            </div>

            <div className="border-t border-white/5 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Passageiros ({form.passengers.length})</h3>
                <Button variant="outline" size="sm" onClick={addPassenger} className="border-primary/30 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>

              {form.passengers.map((p, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-4 mb-3 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary">Passageiro {i + 1}</span>
                    {form.passengers.length > 1 && (
                      <button onClick={() => removePassenger(i)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => updatePassenger(i, "name", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Nome completo do passageiro"
                      />
                      {errors[`passenger_${i}_name`] && <p className="text-xs text-red-400 mt-1">{errors[`passenger_${i}_name`]}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={p.cpf}
                        onChange={(e) => updatePassenger(i, "cpf", formatCPF(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="CPF do passageiro"
                        maxLength={14}
                      />
                      {errors[`passenger_${i}_cpf`] && <p className="text-xs text-red-400 mt-1">{errors[`passenger_${i}_cpf`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="border-white/10 flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleNext} className="gold-gradient text-black font-bold flex-1">
                PRÓXIMO <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Resumo do Pedido</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Evento</span>
                <span className="font-medium">{event.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">{form.transportDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Embarque</span>
                <span className="font-medium">{selectedBP ? `${selectedBP.city} - ${selectedBP.locationName}` : "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comprador</span>
                <span className="font-medium">{form.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">E-mail</span>
                <span className="font-medium">{form.customerEmail}</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h3 className="font-bold text-sm mb-3">Passageiros ({form.passengers.length})</h3>
              {form.passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="text-muted-foreground">{p.cpf}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{form.passengers.length}x Passagem</span>
                <span>{formatCurrency(event.priceCents * form.passengers.length)}</span>
              </div>
              {event.feeCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{form.passengers.length}x Taxa</span>
                  <span>{formatCurrency(event.feeCents * form.passengers.length)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalCents)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/3 rounded-xl p-3">
              <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
              <span>Pagamento seguro processado pelo Stripe. Seus dados estão protegidos.</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createSession.isPending}
                className="gold-gradient text-black font-bold flex-1"
              >
                {createSession.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                ) : (
                  <>PAGAR {formatCurrency(totalCents)} <CreditCard className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
