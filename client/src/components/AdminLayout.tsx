import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, ShoppingCart, Users, QrCode, DollarSign, LogOut, Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/passageiros", label: "Passageiros", icon: Users },
  { href: "/admin/checkin", label: "Check-in", icon: QrCode },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-black font-heading mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar o painel administrativo.</p>
          <Link href="/">
            <Button className="gold-gradient text-black font-bold">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#080808] border-r border-white/5 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
            <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/busfolia-logo-golden_5f41c73a.png" 
                alt="BusFolia Logo" 
                className="h-10 w-auto hover:scale-105 transition-transform duration-300 ease-in-out drop-shadow-[0_0_8px_rgba(217,119,6,0.3)] hover:drop-shadow-[0_0_12px_rgba(217,119,6,0.5)]"
              />
            </Link>
            <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href === "/admin/dashboard" && location === "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-black">
                {user?.name?.charAt(0) ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 flex items-center px-4 lg:px-6" style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)" }}>
          <button className="lg:hidden mr-4 text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold font-heading">Painel Administrativo</h1>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
