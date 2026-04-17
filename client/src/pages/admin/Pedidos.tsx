import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { downloadXLSX, formatCurrencyForXLSX, formatDateForXLSX } from "@/lib/xlsxExport";
import { ShoppingCart, Loader2, Eye, Download, Trash2, Mail, Ticket, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "Pago", cls: "bg-green-500/20 text-green-400" },
    pending: { label: "Pendente", cls: "bg-yellow-500/20 text-yellow-400" },
    pending_checkout: { label: "Aguardando Pagamento", cls: "bg-blue-500/20 text-blue-400" },
    canceled: { label: "Cancelado", cls: "bg-red-500/20 text-red-400" },
    failed: { label: "Falha", cls: "bg-red-500/20 text-red-400" },
    refunded: { label: "Reembolsado", cls: "bg-blue-500/20 text-blue-400" },
  };
  const s = map[status] ?? { label: status, cls: "bg-white/10 text-muted-foreground" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

export default function Pedidos() {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const { data: exportData } = trpc.admin.orders.exportCsv.useQuery();
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showPixForm, setShowPixForm] = useState(false);
  const deleteOrderMutation = trpc.admin.orders.delete.useMutation();
  const resendEmailMutation = trpc.admin.orders.resendEmail.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (orderId: number) => {
    try {
      await deleteOrderMutation.mutateAsync({ id: orderId });
      await utils.admin.orders.list.invalidate();
      await utils.admin.dashboard.invalidate();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleResendEmail = async (orderId: number) => {
    try {
      await resendEmailMutation.mutateAsync({ orderId });
      alert("Email reenviado com sucesso!");
    } catch (err) {
      alert("Falha ao reenviar email");
    }
  };

  function exportXLSX() {
    if (!exportData || exportData.length === 0) return;
    
    const headers = [
      "Pedido",
      "Nome Completo",
      "CPF",
      "Telefone",
      "Email",
      "Ponto de Embarque",
      "Datas de Transporte",
      "Quantidade de Passageiros",
      "Valor Total (R$)",
      "Status",
      "Data da Compra"
    ];
    
    const rows = exportData.map((o: any) => [
      o.pedido || '',
      o.nomeCompleto || '',
      o.cpf || '',
      o.telefone || '',
      o.email || '',
      o.pontoEmbarque || '',
      o.datasTransporte || '',
      o.quantidadePassageiros || '',
      o.valorTotal ? formatCurrencyForXLSX(parseInt(o.valorTotal.replace(/[^0-9]/g, '')) || 0) : 'R$ 0,00',
      o.status || '',
      o.dataCompra ? formatDateForXLSX(o.dataCompra) : '',
    ]);
    
    // Calculate total
    const totalValue = exportData.reduce((sum: number, o: any) => {
      const val = parseInt(o.valorTotal?.replace(/[^0-9]/g, '') || '0');
      return sum + val;
    }, 0);
    
    const totals = [
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      exportData.length,
      formatCurrencyForXLSX(totalValue),
      '',
      ''
    ];
    
    downloadXLSX({
      title: 'Relatório de Pedidos',
      filename: `pedidos-${new Date().toISOString().split('T')[0]}.xlsx`,
      headers,
      rows,
      totals,
      columnWidths: [12, 20, 15, 15, 25, 25, 20, 18, 18, 15, 15]
    });
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black font-heading">Pedidos</h2>
          <p className="text-muted-foreground text-sm">{orders?.length ?? 0} pedidos pagos</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
          <Button onClick={() => setShowPixForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nova Compra via PIX
          </Button>
          <Button onClick={exportXLSX} variant="outline" className="border-white/10 w-full sm:w-auto" disabled={!exportData?.length}>
            <Download className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders && orders.length > 0 ? (
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
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-center px-2 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-primary text-xs">{order.shortId}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-base">{order.customerName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground hidden md:table-cell text-xs">{order.customerEmail}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-base">{order.quantity}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-base">{formatCurrency(order.totalAmountCents)}</td>
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
          <p className="text-muted-foreground">Nenhum pedido pago ainda.</p>
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
      setError("Valor total deve ser um número positivo");
      return;
    }

    try {
      const result = await createPixOrderMutation.mutateAsync({
        eventId,
        customerName,
        customerEmail,
        boardingPointId,
        purchaseType,
        transportDates: datesForSubmit,
        quantity: passengers.length,
        passengers: passengers.map(p => ({ name: p.name, email: p.email })),
        totalAmountPaid: Math.round(amountValue * 100), // Convert to cents
      });

      setSuccess(`Pedido criado com sucesso! Número: ${result.shortId}`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao criar pedido");
    }
  };

  const availableDates = ["05 Junho", "06 Junho", "12 Junho", "13 Junho"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Nova Compra via PIX</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200 text-sm">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 text-green-200 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Evento *</label>
            <select
              value={eventId ?? ""}
              onChange={(e) => { setEventId(Number(e.target.value)); setBoardingPointId(null); }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione um evento</option>
              {events?.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="João Silva"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="joao@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ponto de Embarque *</label>
            <select
              value={boardingPointId ?? ""}
              onChange={(e) => setBoardingPointId(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              style={{
                backgroundImage: `url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
              required
              disabled={!eventId}
            >
              <option value="" className="bg-slate-900 text-white">Selecione um ponto</option>
              {boardingPoints?.map((bp) => (
                <option key={bp.id} value={bp.id} className="bg-slate-900 text-white">{bp.city} - {bp.locationName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Passagem *</label>
            <div className="grid grid-cols-3 gap-2">
              {["single", "multiple", "all_days"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setPurchaseType(type as any); setSelectedDates([]); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    purchaseType === type
                      ? "bg-primary text-black"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {type === "single" ? "Dia Único" : type === "multiple" ? "Múltiplos" : "Passaporte"}
                </button>
              ))}
            </div>
          </div>

          {purchaseType !== "all_days" && (
            <div>
              <label className="block text-sm font-medium mb-2">Data(s) da Viagem *</label>
              <div className="grid grid-cols-2 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      if (purchaseType === "single") {
                        setSelectedDates([date]);
                      } else {
                        setSelectedDates((prev) =>
                          prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
                        );
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDates.includes(date)
                        ? "bg-primary text-black"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Valor Total Pago (PIX) *</label>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">R$</span>
              <input
                type="number"
                value={totalAmountPaid}
                onChange={(e) => setTotalAmountPaid(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Passageiros *</label>
              <button
                type="button"
                onClick={addPassenger}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
              >
                + Adicionar Passageiro
              </button>
            </div>
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-3">
              {passengers.map((passenger, idx) => (
                <div key={passenger.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground block mb-1">Nome {idx === 0 ? "(Comprador)" : ""}</label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(passenger.id, "name", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground block mb-1">E-mail</label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => updatePassenger(passenger.id, "email", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(passenger.id)}
                      className="text-red-400 hover:text-red-300 transition-colors px-2 py-1.5"
                      title="Remover passageiro"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 border-white/10" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={createPixOrderMutation.isPending}>
              {createPixOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...
                </>
              ) : (
                `Criar Pedido e Enviar Email (${passengers.length} passageiro${passengers.length > 1 ? "s" : ""})`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
