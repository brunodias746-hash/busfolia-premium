import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { IMAGES, formatCurrency } from "@/lib/constants";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Shield, Clock, MapPin, Users, Star, ChevronRight,
  Headphones,
  MessageCircle, ArrowRight, Zap, Heart
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date("2026-06-05T00:00:00-03:00");
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const units = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
      {units.map((u) => (
        <div key={u.label} className="glass-card rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 text-center">
          <div className="text-lg sm:text-2xl md:text-3xl font-bold font-heading text-primary leading-none">{String(u.value).padStart(2, "0")}</div>
          <div className="text-[9px] sm:text-xs md:text-sm uppercase tracking-wider text-muted-foreground mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: events } = trpc.events.list.useQuery();
  
  const bannerSlides = (events || [])
    .filter(e => e.bannerUrl)
    .map(e => ({
      type: "banner" as const,
      image: e.bannerUrl!,
      title: e.name,
    }));
  
  const contentSlide = {
    type: "content" as const,
    image: IMAGES.heroRodeo,
    title: "O transporte oficial para o Pedro Leopoldo Rodeio Show 2026",
  };
  
  const slides = bannerSlides.length > 0 ? [...bannerSlides, contentSlide] : [contentSlide];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full min-h-[45vh] sm:min-h-[55vh] md:min-h-[65vh] flex items-center">
      {/* Carrossel de imagens */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image || ""}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            {slide.type === "banner" && (
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            )}
            {slide.type === "content" && (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4))",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo do Hero */}
      <div className={`container relative z-10 py-8 sm:py-12 md:py-20 transition-opacity duration-1000 ${
        currentSlideData.type === "content" ? "opacity-100" : "opacity-0"
      }`}>
        <div className="max-w-[600px]">
          {/* H1 sempre visível para SEO */}
          <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading leading-[1.1] mb-4 sm:mb-6">
            Garanta seu transporte oficial para o{" "}
            <span className="gold-text">Pedro Leopoldo Rodeio Show 2026</span>
          </h1>

          {currentSlideData.type === "content" && (
            <>
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-3 py-1 sm:px-4 sm:py-1.5 mb-4 sm:mb-6">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[10px] sm:text-xs font-medium text-primary">Transporte Oficial</span>
              </div>

              <p className="text-base sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-5 sm:mb-8 max-w-lg">
                Ida e volta garantida, com conforto, segurança e pontos de embarque estratégicos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10">
                <Link href="/comprar">
                  <Button size="lg" className="gold-gradient text-black font-bold text-sm sm:text-base px-5 sm:px-8 py-4 sm:py-5 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto min-h-[44px]">
                    GARANTA SUA VAGA AGORA <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
                <a href="https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-white/10 text-foreground/80 px-5 sm:px-8 py-4 sm:py-5 rounded-xl hover:bg-white/5 w-full sm:w-auto min-h-[44px]">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Entrar no Grupo
                  </Button>
                </a>
              </div>

              <div className="mb-2 sm:mb-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2">Próximo evento começa em:</p>
                <CountdownTimer />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide
                ? "bg-primary w-8"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function BenefitsBar() {
  const benefits = [
    { icon: Shield, label: "100% Seguro" },
    { icon: Clock, label: "Ida e Volta" },
    { icon: MapPin, label: "5+ Pontos" },
    { icon: Users, label: "200+ Passageiros" },
  ];
  return (
    <section className="border-y border-white/5 bg-[#080808]">
      <div className="container py-4 sm:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-center gap-2 sm:gap-3 justify-center">
              <b.icon className="w-5 h-5 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="text-sm sm:text-sm font-medium text-foreground/80">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventsSection() {
  const { data: events, isLoading } = trpc.events.active.useQuery();
  if (isLoading) return (
    <section className="py-12 sm:py-20"><div className="container"><div className="animate-pulse space-y-4"><div className="h-8 bg-white/5 rounded w-64 mx-auto" /><div className="h-64 bg-white/5 rounded-2xl" /></div></div></section>
  );
  if (!events || events.length === 0) return null;
  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black font-heading mb-3 sm:mb-3">TRANSPORTE OFICIAL PARA <span className="gold-text">PLRS 2026</span></h2>
          <p className="text-base sm:text-base text-muted-foreground mb-2">Garanta seu transporte seguro e confortável para os melhores eventos de MG</p>
          <p className="text-base sm:text-sm text-muted-foreground/70">Pedro Leopoldo Rodeio Show 2026 — Transporte oficial com ida e volta garantida, conforto e pontos estratégicos.</p>
        </div>
        <div className="grid gap-4 sm:gap-6">
          {events.map((event) => {
            const spotsLeft = event.capacity - event.soldCount;
            const urgency = spotsLeft < 30;
            return (
              <div key={event.id} className="glass-card rounded-2xl overflow-hidden relative">
                {urgency && <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30 z-10">ÚLTIMAS VAGAS</div>}
                {event.bannerUrl && (
                  <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] bg-black/20">
                    <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-2xl md:text-3xl font-black font-heading mb-2 sm:mb-2">{event.name}</h3>
                      <p className="text-base text-muted-foreground mb-4 sm:mb-4">{event.description}</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-sm">
                        <span className="flex items-center gap-1.5 text-foreground/70"><Clock className="w-4 h-4 sm:w-4 sm:h-4 text-primary" /> {event.eventDate}</span>
                        <span className="flex items-center gap-1.5 text-foreground/70"><Users className="w-4 h-4 sm:w-4 sm:h-4 text-primary" /> {spotsLeft} vagas</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch sm:items-center md:items-end gap-3">
                      <div className="text-center md:text-right">
                        <span className="text-sm sm:text-sm text-muted-foreground">A partir de</span>
                        <div className="text-3xl sm:text-3xl font-black font-heading text-primary">{formatCurrency(event.priceCents)}</div>
                        {event.feeCents > 0 && <span className="text-xs sm:text-xs text-muted-foreground">+ {formatCurrency(event.feeCents)} taxa</span>}
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Link href="/comprar">
                          <Button className="gold-gradient text-black font-bold text-base sm:text-base px-5 sm:px-8 py-4 sm:py-4 rounded-xl hover:opacity-90 w-full min-h-[44px] sm:min-h-[48px]">COMPRAR AGORA <ChevronRight className="w-5 h-5 ml-1" /></Button>
                        </Link>
                        {event.groupLink && (
                          <a href={event.groupLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full font-bold text-base sm:text-base px-5 sm:px-8 py-4 sm:py-4 rounded-xl min-h-[44px] sm:min-h-[48px]">ENTRAR NO GRUPO</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Escolha o Evento", desc: "Selecione o evento e a data desejada." },
    { num: "02", title: "Preencha seus Dados", desc: "Informe dados pessoais e ponto de embarque." },
    { num: "03", title: "Pague com Segurança", desc: "Pagamento via cartão com Stripe seguro." },
    { num: "04", title: "Embarque e Curta", desc: "Receba confirmação e embarque no horário." },
  ];
  return (
    <section id="como-funciona" className="py-12 sm:py-20 bg-[#080808]">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black font-heading mb-3 sm:mb-3">Como <span className="gold-text">Funciona</span></h2>
          <p className="text-lg sm:text-base text-muted-foreground">Processo simples em 4 passos</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {steps.map((step) => (
            <div key={step.num} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 text-center relative group hover:border-primary/20 transition-colors">
              <div className="text-5xl sm:text-4xl font-black font-heading text-primary/20 mb-3 sm:mb-3">{step.num}</div>
              <h3 className="font-bold text-lg sm:text-lg mb-2 sm:mb-2">{step.title}</h3>
              <p className="text-base sm:text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FleetSection() {
  const fleetImages = [
    { src: IMAGES.fleetBus1, label: "Ônibus em Movimento", category: "Exterior" },
    { src: IMAGES.fleetBus2, label: "Frota Premium", category: "Frota" },
    { src: IMAGES.fleetBus3, label: "Embarque Confortável", category: "Embarque" },
    { src: IMAGES.fleetBus4, label: "Portas Automáticas", category: "Conforto" },
    { src: IMAGES.fleetBus5, label: "Interior Espaçoso", category: "Interior" },
    { src: IMAGES.fleetBus6, label: "Viagem Segura", category: "Segurança" },
    { src: IMAGES.fleetBus7, label: "Poltronas Reclináveis", category: "Interior" },
    { src: IMAGES.fleetBus8, label: "Iluminação Premium", category: "Conforto" },
    { src: IMAGES.fleetBus9, label: "Entretenimento a Bordo", category: "Interior" },
    { src: IMAGES.fleetBus10, label: "Ônibus Noturno", category: "Exterior" },
    { src: IMAGES.fleetBus11, label: "Paisagem Interna", category: "Interior" },
    { src: IMAGES.fleetBus12, label: "Pôr do Sol em Movimento", category: "Exterior" },
  ];

  const col1 = [...fleetImages.slice(0, 6), ...fleetImages.slice(0, 6)];
  const col2 = [...fleetImages.slice(6, 12), ...fleetImages.slice(6, 12)];

  const features = [
    { icon: Headphones, label: "Entretenimento" },
    { icon: Shield, label: "Seguro Total" },
    { icon: Heart, label: "Conforto Premium" },
    { icon: Clock, label: "Pontualidade" },
  ];

  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading mb-3 sm:mb-3">A experiência começa <span className="gold-text">no embarque</span></h2>
          <p className="text-base sm:text-base text-muted-foreground">Conforto, estrutura e clima premium desde o primeiro momento</p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Fleet Carousel */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 h-[280px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-xl sm:rounded-2xl w-full">
            <div className="overflow-hidden">
              <div className="animate-scroll-up">
                {col1.map((img, i) => (
                  <div key={`col1-${i}`} className="relative mb-2 sm:mb-3 rounded-lg sm:rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                      <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-primary/80 font-semibold">{img.category}</span>
                      <p className="text-[10px] sm:text-xs font-medium text-white">{img.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="animate-scroll-down">
                {col2.map((img, i) => (
                  <div key={`col2-${i}`} className="relative mb-2 sm:mb-3 rounded-lg sm:rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                      <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-primary/80 font-semibold">{img.category}</span>
                      <p className="text-[10px] sm:text-xs font-medium text-white">{img.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col justify-center w-full">
            <p className="text-base sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              Esquece aquele transporte básico. Aqui o rolê já começa no ônibus: poltronas reclináveis confortáveis, clima premium que já te coloca no mood do evento, e uma estrutura pensada pra você curtir a viagem. Ida e volta com qualidade de verdade.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 sm:gap-3 glass-card rounded-lg sm:rounded-xl p-3 sm:p-3">
                  <f.icon className="w-5 h-5 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="text-sm sm:text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-4 sm:p-4 flex items-center gap-3 w-fit">
              <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full gold-gradient flex items-center justify-center">
                <Star className="w-5 h-5 sm:w-5 sm:h-5 text-black" />
              </div>
              <div>
                <div className="text-base sm:text-sm font-bold">4.9/5.0</div>
                <div className="text-sm sm:text-xs text-muted-foreground">+500 avaliações</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const reasons = [
    { icon: Shield, title: "Segurança Garantida", desc: "Motoristas profissionais, veículos revisados e seguro completo para todos os passageiros." },
    { icon: Clock, title: "Pontualidade", desc: "Horários rigorosos de saída e retorno. Nunca perca o início do evento." },
    { icon: Heart, title: "Experiência Premium", desc: "Conforto de primeira classe com poltronas reclináveis e amenidades a bordo." },
    { icon: MessageCircle, title: "Suporte 24h", desc: "Equipe disponível via WhatsApp para qualquer dúvida antes, durante e após a viagem." },
  ];
  return (
    <section className="py-12 sm:py-20 bg-[#080808]">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-heading mb-2 sm:mb-3">Por que escolher a <span className="gold-text">BusFolia</span>?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {reasons.map((r) => (
            <div key={r.title} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gold-gradient flex items-center justify-center shrink-0"><r.icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" /></div>
              <div><h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1">{r.title}</h3><p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{r.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Lucas M.", text: "Melhor experiência de transporte para evento! Ônibus impecável e pontual.", rating: 5 },
    { name: "Ana C.", text: "Super organizado. Embarquei na Praça da Estação e foi tudo perfeito. Recomendo!", rating: 5 },
    { name: "Pedro H.", text: "Já é a terceira vez que uso a BusFolia. Nunca me decepcionou. Conforto nota 10.", rating: 5 },
  ];
  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-heading mb-2 sm:mb-3">O que dizem nossos <span className="gold-text">passageiros</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />)}</div>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-3 sm:mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gold-gradient flex items-center justify-center text-[10px] sm:text-xs font-bold text-black">{t.name.charAt(0)}</div>
                <span className="text-xs sm:text-sm font-medium">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "O transporte inclui ida e volta?", a: "Sim! Todas as passagens incluem ida e volta garantida." },
    { q: "Posso escolher o ponto de embarque?", a: "Sim, temos diversos pontos de embarque em BH e região metropolitana." },
    { q: "Como funciona o pagamento?", a: "O pagamento é feito online via cartão de crédito, com processamento seguro pelo Stripe." },
    { q: "Posso cancelar minha passagem?", a: "Consulte nossa política de cancelamento entrando em contato pelo WhatsApp." },
  ];
  return (
    <section className="py-12 sm:py-20 bg-[#080808]">
      <div className="container max-w-3xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading mb-2 sm:mb-3">Perguntas <span className="gold-text">Frequentes</span></h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-lg sm:rounded-xl border-none px-4 sm:px-6">
              <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline hover:text-primary py-3 sm:py-4">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-xs sm:text-base text-muted-foreground pb-3 sm:pb-4">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 gold-gradient opacity-5" />
      <div className="container relative z-10 text-center px-6">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading mb-3 sm:mb-4">Não fique de fora.<br /><span className="gold-text">Garanta sua vaga agora.</span></h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto">Vagas limitadas. Compre sua passagem com segurança e viaje com conforto.</p>
        <Link href="/comprar">
          <Button size="lg" className="gold-gradient text-black font-bold text-sm sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl hover:opacity-90 min-h-[44px]">COMPRAR PASSAGEM <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /></Button>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <HeroSection />
      <BenefitsBar />
      <EventsSection />
      <HowItWorksSection />
      <FleetSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </PublicLayout>
  );
}
