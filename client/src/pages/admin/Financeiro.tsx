import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Download,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function Financeiro() {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const eventId = selectedEvent === "all" ? undefined : parseInt(selectedEvent);

  const { data: events } = trpc.admin.events.list.useQuery();
  const { data, isLoading } = trpc.admin.financial.summary.useQuery(
    eventId ? { eventId } : undefined
  );

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ["Evento", "Receita Bruta", "Taxas", "Receita Líquida", "Pedidos", "Passageiros"];
    const rows = data.byEvent.map((e) => [
      e.eventName,
      (e.totalRevenue / 100).toFixed(2),
      (e.totalFees / 100).toFixed(2),
      ((e.totalRevenue - e.totalFees) / 100).toFixed(2),
      e.orderCount.toString(),
      e.passengerCount.toString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading">Financeiro</h1>
          <p className="text-muted-foreground text-sm">Receitas, taxas e resumo por evento</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
              <SelectValue placeholder="Filtrar por evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os eventos</SelectItem>
              {events?.map((ev) => (
                <SelectItem key={ev.id} value={ev.id.toString()}>
                  {ev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!data || data.byEvent.length === 0}
            className="border-white/10"
          >
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Bruta"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          icon={<DollarSign className="w-5 h-5" />}
          accent
        />
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(data?.netRevenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          title="Total de Pedidos"
          value={(data?.totalOrders ?? 0).toString()}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <MetricCard
          title="Total de Passageiros"
          value={(data?.totalPassengers ?? 0).toString()}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Revenue by Event */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Receita por Evento</h2>
        {data && data.byEvent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-2">Evento</th>
                  <th className="text-right py-3 px-2">Receita Bruta</th>
                  <th className="text-right py-3 px-2">Taxas</th>
                  <th className="text-right py-3 px-2">Receita Líquida</th>
                  <th className="text-right py-3 px-2">Pedidos</th>
                  <th className="text-right py-3 px-2">Passageiros</th>
                </tr>
              </thead>
              <tbody>
                {data.byEvent.map((ev) => (
                  <tr key={ev.eventId} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-3 px-2 font-medium">{ev.eventName}</td>
                    <td className="py-3 px-2 text-right text-primary font-bold">
                      {formatCurrency(ev.totalRevenue)}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {formatCurrency(ev.totalFees)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold">
                      {formatCurrency(ev.totalRevenue - ev.totalFees)}
                    </td>
                    <td className="py-3 px-2 text-right">{ev.orderCount}</td>
                    <td className="py-3 px-2 text-right">{ev.passengerCount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/30 font-bold">
                  <td className="py-3 px-2">Total</td>
                  <td className="py-3 px-2 text-right text-primary">
                    {formatCurrency(data.totalRevenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatCurrency(data.totalFees)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {formatCurrency(data.netRevenue)}
                  </td>
                  <td className="py-3 px-2 text-right">{data.totalOrders}</td>
                  <td className="py-3 px-2 text-right">{data.totalPassengers}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma receita registrada ainda.</p>
            <p className="text-xs mt-1">As receitas aparecem aqui após pagamentos confirmados.</p>
          </div>
        )}
      </div>

      {/* Recent Paid Orders */}
      {data && data.recentOrders.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Últimos Pagamentos Confirmados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-2">Pedido</th>
                  <th className="text-left py-3 px-2">Cliente</th>
                  <th className="text-right py-3 px-2">Qtd</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="text-right py-3 px-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-3 px-2 font-mono text-primary">{o.shortId}</td>
                    <td className="py-3 px-2">{o.customerName}</td>
                    <td className="py-3 px-2 text-right">{o.quantity}</td>
                    <td className="py-3 px-2 text-right font-bold">
                      {formatCurrency(o.totalAmountCents)}
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

function MetricCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg ${accent ? "gold-gradient text-black" : "bg-white/5"}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-black ${accent ? "gold-text" : ""}`}>{value}</p>
    </div>
  );
}
