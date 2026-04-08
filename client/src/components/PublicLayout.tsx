import { Link, useLocation } from "wouter";
import { SITE } from "@/lib/constants";
import { Bus, Menu, X, Instagram, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";
import TopAnnouncementBar from "./TopAnnouncementBar";

function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Início" },
    { href: "/comprar", label: "Comprar" },
    { href: "/duvidas", label: "Dúvidas" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header
      className="fixed left-0 right-0 z-50 border-b border-white/5"
      style={{
        top: "36px",
        background: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="container flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Bus className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          <span className="text-lg sm:text-xl font-bold font-heading gold-text">BusFolia</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-foreground/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/comprar"
            className="gold-gradient text-black font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            GARANTA SUA VAGA
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground/70 p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 pb-4" style={{ background: "rgba(10,10,10,0.98)" }}>
          <nav className="container flex flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-3 px-2 rounded-lg transition-colors min-h-[44px] flex items-center ${
                  location === link.href ? "text-primary bg-primary/5" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/comprar"
              onClick={() => setMobileOpen(false)}
              className="gold-gradient text-black font-bold text-sm px-5 py-3 rounded-lg text-center mt-2 min-h-[44px] flex items-center justify-center"
            >
              GARANTA SUA VAGA
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505]">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-base sm:text-lg font-bold font-heading gold-text">BusFolia</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Transporte premium para os maiores eventos de Minas Gerais. Segurança, conforto e pontualidade garantidos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-3 sm:mb-4">Navegação</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">Início</Link>
              <Link href="/comprar" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">Comprar Passagem</Link>
              <Link href="/duvidas" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">Dúvidas</Link>
              <Link href="/contato" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">Contato</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-3 sm:mb-4">Contato</h4>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> WhatsApp
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> @busfolia
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BusFolia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <TopAnnouncementBar />
      <Header />
      {/* pt = 36px announcement bar + 56px header (mobile) */}
      <main className="flex-1 pt-[92px] sm:pt-[100px]">{children}</main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
