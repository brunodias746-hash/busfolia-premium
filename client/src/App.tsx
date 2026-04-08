import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Comprar from "./pages/Comprar";
import Sucesso from "./pages/Sucesso";
import Falha from "./pages/Falha";
import Duvidas from "./pages/Duvidas";
import Contato from "./pages/Contato";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { trackPageView } from "./utils/meta-pixel";

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEventos = lazy(() => import("./pages/admin/Eventos"));
const AdminPedidos = lazy(() => import("./pages/admin/Pedidos"));
const AdminPassageiros = lazy(() => import("./pages/admin/Passageiros"));
const AdminCheckin = lazy(() => import("./pages/admin/Checkin"));
const AdminFinanceiro = lazy(() => import("./pages/admin/Financeiro"));

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  useEffect(() => {
    trackPageView();
  }, [location]);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/comprar" component={Comprar} />
      <Route path="/sucesso" component={Sucesso} />
      <Route path="/falha" component={Falha} />
      <Route path="/duvidas" component={Duvidas} />
      <Route path="/contato" component={Contato} />

      {/* Admin routes */}
      <Route path="/admin">{() => <Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>}</Route>
      <Route path="/admin/dashboard">{() => <Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>}</Route>
      <Route path="/admin/eventos">{() => <Suspense fallback={<AdminFallback />}><AdminEventos /></Suspense>}</Route>
      <Route path="/admin/pedidos">{() => <Suspense fallback={<AdminFallback />}><AdminPedidos /></Suspense>}</Route>
      <Route path="/admin/passageiros">{() => <Suspense fallback={<AdminFallback />}><AdminPassageiros /></Suspense>}</Route>
      <Route path="/admin/checkin">{() => <Suspense fallback={<AdminFallback />}><AdminCheckin /></Suspense>}</Route>
      <Route path="/admin/financeiro">{() => <Suspense fallback={<AdminFallback />}><AdminFinanceiro /></Suspense>}</Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    // Track initial page view
    trackPageView();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
