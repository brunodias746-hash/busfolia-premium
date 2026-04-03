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
      <div className="container max-w-3xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black font-heading mb-3">
            Entre em <span className="gold-text">Contato</span>
          </h1>
          <p className="text-muted-foreground">
            Estamos disponíveis para ajudar. Escolha o canal de sua preferência.
          </p>
        </div>

        <div className="grid gap-4">
          {channels.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-primary/20 transition-colors ${
                ch.highlight ? "border-primary/20" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                ch.highlight ? "gold-gradient" : "bg-white/5"
              }`}>
                <ch.icon className={`w-6 h-6 ${ch.highlight ? "text-black" : "text-primary"}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{ch.title}</h3>
                <p className="text-sm text-muted-foreground">{ch.desc}</p>
              </div>
              <Button
                variant={ch.highlight ? "default" : "outline"}
                size="sm"
                className={ch.highlight ? "gold-gradient text-black font-bold" : "border-white/10"}
              >
                {ch.action}
              </Button>
            </a>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 mt-8">
          <h2 className="font-bold text-lg mb-4">Informações</h2>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Belo Horizonte - MG</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Atendimento: Seg a Sex, 9h às 18h</span>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
