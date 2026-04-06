import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { ShoppingCart, Loader2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Pago", cls: "bg-green-500/20 text-green-400" },
    pending: { label: "Pendente", cls: "bg-yellow-500/20 text-yellow-400" },
    canceled: { label: "Cancelado", cls: "bg-red-500/20 text-red-400" },
    refunded: { label: "Reembolsado", cls: "bg-blue-500/20 text-blue-400" },
  };
  const s = map[status] ?? { label: status, cls: "bg-white/10 text-muted-foreground" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

export default function Pedidos() {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [detailId, setDetailId] = useState<number | null>(null);

  function exportCSV() {
    if (!orders) return;
    const headers = ["Pedido", "Cliente", "CPF", "E-mail", "Telefone", "Qtd", "Total", "Status", "Data"];
    const rows = orders.map((o) => [
      o.shortId, o.customerName, o.customerCpf, o.customerEmail, o.customerPhone,
      o.quantity, (o.totalAmountCents / 100).toFixed(2), o.status,
      new Date(o.createdAt).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pedidos.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black font-heading">Pedidos</h2>
          <p className="text-muted-foreground text-sm">{orders?.length ?? 0} pedidos no total</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-white/10" disabled={!orders?.length}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">E-mail</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Qtd</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono text-primary text-xs">{order.shortId}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{order.customerEmail}</td>
                    <td className="px-4 py-3 text-center">{order.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.totalAmountCents)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => setDetailId(detailId === order.id ? null : order.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum pedido ainda.</p>
        </div>
      )}

      {detailId && <OrderDetail orderId={detailId} onClose={() => setDetailId(null)} />}
    </AdminLayout>
  );
}

function OrderDetail({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const { data: order, isLoading } = trpc.admin.orders.byId.useQuery({ id: orderId });

  if (isLoading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Pedido {order.shortId}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Evento</span><span>{order.eventName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{order.customerName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{order.customerCpf}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">E-mail</span><span>{order.customerEmail}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{order.customerPhone}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{order.transportDates ? JSON.parse(order.transportDates)[0] : "N/A"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">{formatCurrency(order.totalAmountCents)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={order.status} /></div>
        </div>
        {order.passengers && order.passengers.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-4">
            <h4 className="text-sm font-bold mb-2">Passageiros</h4>
            {order.passengers.map((p: any) => (
              <div key={p.id} className="flex justify-between text-sm py-1">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.cpf}</span>
              </div>
            ))}
          </div>
        )}
        <Button onClick={onClose} variant="outline" className="w-full mt-4 border-white/10">Fechar</Button>
      </div>
    </div>
  );
}
