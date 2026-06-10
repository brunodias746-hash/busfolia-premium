import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { ShoppingCart, Loader2, Eye, Download, Trash2, Mail, Ticket, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Pago", cls: "bg-green-500/20 text-green-400" },
    pending: { label: "Pendente (PIX)", cls: "bg-yellow-500/20 text-yellow-400" },
    pending_checkout: { label: "Aguardando Pagamento", cls: "bg-blue-500/20 text-blue-400" },
    canceled: { label: "Cancelado", cls: "bg-red-500/20 text-red-400" },
    failed: { label: "Falha", cls: "bg-red-500/20 text-red-400" },
    refunded: { label: "Reembolsado", cls: "bg-blue-500/20 text-blue-400" },
  };
  const s = map[status] ?? { label: status, cls: "bg-white/10 text-muted-foreground" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

function PaymentMethodBadge({ order }: { order: any }) {
  // Determine payment method: if has stripeSessionId, it's card; otherwise PIX Manual
  const isCard = !!order.stripeSessionId;
  const method = isCard ? 'card' : 'pix_manual';
  
  const map: Record<string, { label: string; cls: string }> = {
    card: { label: "Cartão", cls: "bg-blue-500/20 text-blue-400" },
    pix_manual: { label: "PIX Manual", cls: "bg-green-500/20 text-green-400" },
  };
  const m = map[method];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.cls}`}>{m.label}</span>;
}

export default function Pedidos() {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showPixForm, setShowPixForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const deleteOrderMutation = trpc.admin.orders.delete.useMutation();
  const resendEmailMutation = trpc.admin.orders.resendEmail.useMutation();
  const exportMutation = trpc.exports.generatePedidos.useMutation();
  const utils = trpc.useUtils();

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.shortId.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.customerPhone.includes(query)
      );
    }
    
    return result;
  }, [orders, statusFilter, searchQuery]);

  // Get status counts
  const statusCounts = useMemo(() => {
    if (!orders) return {};
    const counts: Record<string, number> = {};
    orders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const handleDelete = async (orderId: number) => {
    try {
      await deleteOrderMutation.mutateAsync({ id: orderId });
      await utils.admin.orders.list.invalidate();
      await utils.admin.dashboard.invalidate();
      setDeleteConfirm(null);
      toast.success("Pedido deletado com sucesso");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Erro ao deletar pedido");
    }
  };

  const handleResendEmail = async (orderId: number) => {
    try {
      await resendEmailMutation.mutateAsync({ orderId });
      toast.success("Email reenviado com sucesso!");
    } catch (err) {
      toast.error("Falha ao reenviar email");
    }
  };

  async function exportXLSX() {
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync({});
      if (result.success && result.data) {
        // Convert base64 to blob and download
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Excel exportado com sucesso!');
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black font-heading">Pedidos</h2>
          <p className="text-muted-foreground text-sm">{filteredOrders?.length ?? 0} de {orders?.length ?? 0} pedidos</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
          <Button onClick={() => setShowPixForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nova Compra via PIX
          </Button>
          <Button onClick={exportXLSX} variant="outline" className="border-white/10 w-full sm:w-auto" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todos os status ({orders?.length ?? 0})</option>
            <option value="paid">Pagos ({statusCounts['paid'] ?? 0})</option>
            <option value="pending">Pendentes PIX ({statusCounts['pending'] ?? 0})</option>
            <option value="pending_checkout">Aguardando Pagamento ({statusCounts['pending_checkout'] ?? 0})</option>
            <option value="canceled">Cancelados ({statusCounts['canceled'] ?? 0})</option>
            <option value="failed">Falhas ({statusCounts['failed'] ?? 0})</option>
            <option value="refunded">Reembolsados ({statusCounts['refunded'] ?? 0})</option>
          </select>
        </div>

        {/* Status Summary */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full">✓ Pagos: {statusCounts['paid'] ?? 0}</div>
          <div className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full">⏳ Pendentes: {statusCounts['pending'] ?? 0}</div>
          <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">⏱ Aguardando: {statusCounts['pending_checkout'] ?? 0}</div>
          <div className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full">✗ Cancelados: {statusCounts['canceled'] ?? 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Pedido</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Cliente</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">E-mail</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Qtd</th>
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Total</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Pagamento</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-primary text-xs">{order.shortId}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base">{order.customerName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground hidden md:table-cell text-xs">{order.customerEmail}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-base">{order.quantity}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-base">{formatCurrency(order.totalAmountCents)}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell"><PaymentMethodBadge order={order} /></td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center flex gap-1 justify-center flex-wrap">
                      <Button size="sm" variant="ghost" onClick={() => setDetailId(detailId === order.id ? null : order.id)} title="Ver Detalhes">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300" title="Ver Ingresso" onClick={() => window.open(`/ingresso/${order.shortId}`, '_blank')}>
                        <Ticket className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300" title="Reenviar Email" onClick={() => handleResendEmail(order.id)} disabled={resendEmailMutation.isPending}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setDeleteConfirm(order.id)}>
                        <Trash2 className="w-4 h-4" />
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
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" ? "Nenhum pedido encontrado com esses filtros." : "Nenhum pedido ainda."}
          </p>
        </div>
      )}

      {detailId && <OrderDetail orderId={detailId} onClose={() => setDetailId(null)} />}

      {showPixForm && <PixOrderForm onClose={() => setShowPixForm(false)} onSuccess={() => { setShowPixForm(false); utils.admin.orders.list.invalidate(); utils.admin.dashboard.invalidate(); }} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Deletar Pedido?</h3>
            <p className="text-muted-foreground text-sm mb-6">Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-white/10" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteConfirm)} disabled={deleteOrderMutation.isPending}>
                {deleteOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Deletar
              </Button>
            </div>
          </div>
        </div>
      )}
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


interface Passenger {
  id: string;
  name: string;
  email: string;
}

function PixOrderForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: events } = trpc.events.list.useQuery();
  const [eventId, setEventId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [boardingPointId, setBoardingPointId] = useState<number | null>(null);
  const [purchaseType, setPurchaseType] = useState<"single" | "multiple" | "all_days">("single");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([{ id: "1", name: "", email: "" }]);
  const [totalAmountPaid, setTotalAmountPaid] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: boardingPoints } = trpc.events.boardingPoints.useQuery(
    { eventId: eventId ?? 0 },
    { enabled: !!eventId }
  );

  const createPixOrderMutation = trpc.admin.orders.createPixOrder.useMutation();

  const addPassenger = () => {
    const newId = String(Math.max(...passengers.map(p => Number(p.id)), 0) + 1);
    setPassengers([...passengers, { id: newId, name: "", email: "" }]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: "name" | "email", value: string) => {
    setPassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields - dates not required for Passaporte (all_days)
    const requiresDates = purchaseType !== "all_days";
    const hasDates = selectedDates.length > 0;
    
    if (!eventId || !customerName || !customerEmail || !boardingPointId || !totalAmountPaid || (requiresDates && !hasDates)) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    
    // For Passaporte, use a default date if none selected
    const datesForSubmit = purchaseType === "all_days" && selectedDates.length === 0 
      ? [new Date().toISOString().split('T')[0]] 
      : selectedDates;

    if (passengers.some(p => !p.name || !p.email)) {
      setError("Preencha nome e email de todos os passageiros");
      return;
    }

    const amountValue = parseFloat(totalAmountPaid);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Valor total inválido");
      return;
    }

    try {
      await createPixOrderMutation.mutateAsync({
        eventId,
        customerName,
        customerEmail,
        boardingPointId,
        purchaseType,
        transportDates: datesForSubmit,
        quantity: passengers.length,
        passengers: passengers.map(p => ({ name: p.name, email: p.email })),
        totalAmountPaid: Math.round(amountValue * 100),
      });
      setSuccess("Pedido PIX criado com sucesso!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao criar pedido");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Nova Compra via PIX</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Evento *</label>
              <select
                value={eventId ?? ""}
                onChange={(e) => setEventId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Selecione um evento</option>
                {events?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Ponto de Embarque *</label>
              <select
                value={boardingPointId ?? ""}
                onChange={(e) => setBoardingPointId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">Selecione um ponto</option>
                {boardingPoints?.map(bp => <option key={bp.id} value={bp.id}>{bp.city} - {bp.locationName}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Nome do Cliente *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Compra *</label>
              <select
                value={purchaseType}
                onChange={(e) => setPurchaseType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="single">Dia Único</option>
                <option value="multiple">Múltiplos Dias</option>
                <option value="all_days">Passaporte (Todos os Dias)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Valor Total (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={totalAmountPaid}
                onChange={(e) => setTotalAmountPaid(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="font-medium mb-3">Passageiros</h4>
            <div className="space-y-3">
              {passengers.map((p, idx) => (
                <div key={p.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={p.name}
                    onChange={(e) => updatePassenger(p.id, "name", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={p.email}
                    onChange={(e) => updatePassenger(p.id, "email", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(p.id)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={addPassenger}
              variant="outline"
              className="w-full mt-3 border-white/10"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Passageiro
            </Button>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 border-white/10" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gold-gradient text-black font-bold" disabled={createPixOrderMutation.isPending}>
              {createPixOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Pedido
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
