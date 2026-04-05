import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { MessageCircle, Instagram, Mail, MapPin, Clock } from "lucide-react";

export default function Contato() {
  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      desc: "Atendimento rápido e direto",
      action: "Enviar Mensagem",
      href: SITE.whatsapp,
      highlight: true,
    },
    {
      icon: Instagram,
      title: "Instagram",
      desc: "@busfolia",
      action: "Seguir",
      href: SITE.instagram,
      highlight: false,
    },
    {
      icon: Mail,
      title: "E-mail",
      desc: SITE.email,
      action: "Enviar E-mail",
      href: `mailto:${SITE.email}`,
      highlight: false,
    },
  ];

  return (
    <PublicLayout>
      <div className="container max-w-3xl py-8 sm:py-16 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading mb-2 sm:mb-3">
            Entre em <span className="gold-text">Contato</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground">
            Estamos disponíveis para ajudar. Escolha o canal de sua preferência.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8">
          {channels.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 flex items-center gap-3 sm:gap-4 hover:border-primary/20 transition-colors min-h-[44px] ${
                ch.highlight ? "border-primary/20" : ""
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                ch.highlight ? "gold-gradient" : "bg-white/5"
              }`}>
                <ch.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${ch.highlight ? "text-black" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base">{ch.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{ch.desc}</p>
              </div>
              <Button
                variant={ch.highlight ? "default" : "outline"}
                size="sm"
                className={`shrink-0 text-xs sm:text-sm min-h-[40px] sm:min-h-[44px] ${ch.highlight ? "gold-gradient text-black font-bold" : "border-white/10"}`}
              >
                {ch.action}
              </Button>
            </a>
          ))}
        </div>

        <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Informações</h2>
          <div className="grid gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Belo Horizonte - MG</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Seg a Sex, 9h às 18h</span>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
