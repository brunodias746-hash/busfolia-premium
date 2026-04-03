import { Link, useLocation } from "wouter";
import { SITE } from "@/lib/constants";
import { Bus, Menu, X, Instagram, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";

function Header() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Início" },
    { href: "/comprar", label: "Comprar Passagem" },
    { href: "/duvidas", label: "Dúvidas" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Bus className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold font-heading gold-text">BusFolia</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
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
          className="md:hidden text-foreground/70"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 pb-4" style={{ background: "rgba(10,10,10,0.95)" }}>
          <nav className="container flex flex-col gap-3 pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 transition-colors ${
                  location === link.href ? "text-primary" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/comprar"
              onClick={() => setMobileOpen(false)}
              className="gold-gradient text-black font-bold text-sm px-5 py-3 rounded-lg text-center mt-2"
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
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-heading gold-text">BusFolia</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transporte premium para os maiores eventos de Minas Gerais. Segurança, conforto e pontualidade garantidos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Navegação</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Início</Link>
              <Link href="/comprar" className="text-sm text-muted-foreground hover:text-primary transition-colors">Comprar Passagem</Link>
              <Link href="/duvidas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dúvidas</Link>
              <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contato</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Contato</h4>
            <div className="flex flex-col gap-3">
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" /> @busfolia
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" /> {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BusFolia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
