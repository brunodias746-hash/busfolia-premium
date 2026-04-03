import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { QrCode, Search, CheckCircle2, Clock, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkin() {
  const utils = trpc.useUtils();
  const { data: passengers, isLoading } = trpc.admin.passengers.list.useQuery();
  const [search, setSearch] = useState("");

  const checkIn = trpc.admin.passengers.checkIn.useMutation({
    onSuccess: () => {
      utils.admin.passengers.list.invalidate();
      toast.success("Check-in realizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = passengers?.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.cpf.includes(q);
  }) ?? [];

  const checkedIn = passengers?.filter((p) => p.checkInStatus === "checked_in").length ?? 0;
  const total = passengers?.length ?? 0;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-black font-heading flex items-center gap-2">
          <QrCode className="w-6 h-6 text-primary" /> Check-in
        </h2>
        <p className="text-muted-foreground text-sm">{checkedIn} de {total} passageiros confirmados</p>
        {total > 0 && (
          <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden max-w-sm">
            <div className="h-full gold-gradient rounded-full transition-all duration-500" style={{ width: `${(checkedIn / total) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Search - mobile optimized */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
          autoFocus
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isChecked = p.checkInStatus === "checked_in";
            return (
              <div
                key={p.id}
                className={`glass-card rounded-2xl p-4 flex items-center gap-4 transition-colors ${
                  isChecked ? "border-green-500/20 bg-green-500/5" : ""
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  isChecked ? "bg-green-500/20" : "bg-white/5"
                }`}>
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.cpf}</p>
                </div>
                {isChecked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 shrink-0"
                    onClick={() => checkIn.mutate({ id: p.id, status: "pending" })}
                    disabled={checkIn.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Feito
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="gold-gradient text-black font-bold shrink-0"
                    onClick={() => checkIn.mutate({ id: p.id, status: "checked_in" })}
                    disabled={checkIn.isPending}
                  >
                    {checkIn.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check-in"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? "Nenhum passageiro encontrado." : "Nenhum passageiro para check-in."}
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
