import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Users, Loader2, Download, CheckCircle2, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

export default function Passageiros() {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [search, setSearch] = useState("");
  const eventId = selectedEvent === "all" ? undefined : parseInt(selectedEvent);

  const { data: events } = trpc.admin.events.list.useQuery();
  const { data: passengers, isLoading } = trpc.admin.passengers.list.useQuery(
    eventId ? { eventId } : undefined
  );
  const { data: exportData } = trpc.admin.passengers.exportCsv.useQuery(
    eventId ? { eventId } : undefined
  );

  const filtered = useMemo(() => {
    if (!passengers) return [];
    if (!search) return passengers;
    const q = search.toLowerCase();
    return passengers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cpf.includes(q)
    );
  }, [passengers, search]);

  function exportCSV() {
    if (!exportData || exportData.length === 0) return;
    const headers = ["Nome", "CPF", "Evento", "Pedido", "Status Pedido", "Ponto de Embarque", "Data Transporte", "Check-in"];
    const rows = exportData.map((p) => [
      `"${p.name}"`,
      p.cpf,
      `"${p.eventName}"`,
      p.orderShortId,
      p.orderStatus,
      `"${p.boardingPoint}"`,
      p.transportDate,
      p.checkInStatus === "checked_in" ? "Sim" : "Nao",
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passageiros_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const checkedIn = filtered.filter((p) => p.checkInStatus === "checked_in").length;
  const total = filtered.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black font-heading">Passageiros</h2>
            <p className="text-muted-foreground text-sm">
              {total} passageiros · {checkedIn} check-ins realizados
            </p>
          </div>
          <Button
            onClick={exportCSV}
            variant="outline"
            className="border-white/10"
            disabled={!exportData || exportData.length === 0}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10">
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
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Nome</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">CPF</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Pedido</th>
                    <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Check-in</th>
                    <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.cpf}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">#{p.orderId}</td>
                      <td className="px-4 py-3 text-center">
                        {p.checkInStatus === "checked_in" ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3" /> Feito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                        {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "Nenhum passageiro encontrado para esta busca." : "Nenhum passageiro cadastrado."}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
