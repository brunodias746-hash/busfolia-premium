import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { DollarSign, Users, ShoppingCart, Calendar, TrendingUp, Loader2 } from "lucide-react";

function MetricCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
          <Icon className="w-5 h-5 text-black" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-black font-heading">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading } = trpc.admin.dashboard.useQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-black font-heading">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={DollarSign}
          label="Receita Total"
          value={formatCurrency(metrics?.totalRevenueCents ?? 0)}
        />
        <MetricCard
          icon={ShoppingCart}
          label="Pedidos Pagos"
          value={String(metrics?.paidOrdersCount ?? 0)}
        />
        <MetricCard
          icon={Users}
          label="Passageiros"
          value={String(metrics?.totalPassengers ?? 0)}
        />
        <MetricCard
          icon={Calendar}
          label="Eventos Ativos"
          value={String(metrics?.activeEventsCount ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Recent Orders */}
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 text-primary" /> Pedidos Recentes
          </h3>
          {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.shortId} · {order.quantity} passageiro(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{formatCurrency(order.totalAmountCents)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "paid" ? "bg-green-500/20 text-green-400" :
                      order.status === "pending" || order.status === "pending_checkout" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {order.status === "paid" ? "Pago" : order.status === "pending" || order.status === "pending_checkout" ? "Pendente" : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum pedido ainda.</p>
          )}
        </div>

        {/* Events Summary */}
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-4 h-4 text-primary" /> Eventos
          </h3>
          {metrics?.eventsSummary && metrics.eventsSummary.length > 0 ? (
            <div className="space-y-3">
              {metrics.eventsSummary.map((ev: any) => (
                <div key={ev.id} className="py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{ev.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ev.status === "active" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"
                    }`}>
                      {ev.status === "active" ? "Ativo" : ev.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ev.soldCount}/{ev.capacity} vendidos</span>
                    <span>{formatCurrency(ev.priceCents)}/pessoa</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full gold-gradient rounded-full" style={{ width: `${Math.min((ev.soldCount / ev.capacity) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento cadastrado.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
