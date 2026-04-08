import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Edit, Loader2, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Eventos() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.admin.events.list.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showBP, setShowBP] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteEvent = trpc.admin.events.delete.useMutation({
    onSuccess: () => { utils.admin.events.list.invalidate(); toast.success("Evento deletado!"); setDeletingId(null); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black font-heading">Eventos</h2>
          <p className="text-muted-foreground text-sm">Gerencie seus eventos</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gold-gradient text-black font-bold w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Evento
        </Button>
      </div>

      {showCreate && <EventForm onClose={() => setShowCreate(false)} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id}>
              <div className="glass-card rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold">{ev.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ev.status === "active" ? "bg-green-500/20 text-green-400" :
                        ev.status === "draft" ? "bg-yellow-500/20 text-yellow-400" :
                        ev.status === "sold_out" ? "bg-red-500/20 text-red-400" :
                        "bg-white/10 text-muted-foreground"
                      }`}>
                        {ev.status === "active" ? "Ativo" : ev.status === "draft" ? "Rascunho" : ev.status === "sold_out" ? "Esgotado" : "Finalizado"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{ev.description}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ev.eventDate}</span>
                      <span className="hidden sm:inline">Preço: {formatCurrency(ev.priceCents)}</span>
                      <span className="hidden sm:inline">Taxa: {formatCurrency(ev.feeCents)}</span>
                      <span>Vendidos: {ev.soldCount}/{ev.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden max-w-xs">
                      <div className="h-full gold-gradient rounded-full" style={{ width: `${Math.min((ev.soldCount / ev.capacity) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="border-white/10" onClick={() => setShowBP(showBP === ev.id ? null : ev.id)}>
                      <MapPin className="w-4 h-4 mr-1" /> Embarques
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/10" onClick={() => setEditingId(editingId === ev.id ? null : ev.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10" onClick={() => setDeletingId(ev.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {editingId === ev.id && <EventForm event={ev} onClose={() => setEditingId(null)} />}
              </div>
              {showBP === ev.id && <BoardingPointsPanel eventId={ev.id} />}
              {deletingId === ev.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="glass-card rounded-2xl p-6 max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-2">Deletar Evento?</h3>
                    <p className="text-sm text-muted-foreground mb-4">Tem certeza que deseja deletar <strong>{ev.name}</strong>? Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="border-white/10" onClick={() => setDeletingId(null)}>Cancelar</Button>
                      <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" disabled={deleteEvent.isPending} onClick={() => deleteEvent.mutate({ id: ev.id })}>
                        {deleteEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deletar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
        </div>
      )}
    </AdminLayout>
  );
}

function EventForm({ event, onClose }: { event?: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const isEdit = !!event;
  const [form, setForm] = useState({
    name: event?.name ?? "",
    description: event?.description ?? "",
    eventDate: event?.eventDate ?? "",
    priceCents: event?.priceCents ? event.priceCents / 100 : 0,
    feeCents: event?.feeCents ? event.feeCents / 100 : 0,
    capacity: event?.capacity ?? 200,
    groupLink: event?.groupLink ?? "",
    status: event?.status ?? "active",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(event?.bannerUrl ?? null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const create = trpc.admin.events.create.useMutation({
    onSuccess: () => { utils.admin.events.list.invalidate(); toast.success("Evento criado!"); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.admin.events.update.useMutation({
    onSuccess: () => { utils.admin.events.list.invalidate(); toast.success("Evento atualizado!"); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const uploadBanner = trpc.admin.events.uploadBanner.useMutation({
    onSuccess: (data) => { setBannerPreview(data.url); toast.success("Banner enviado!"); },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      eventDate: form.eventDate,
      priceCents: Math.round(form.priceCents * 100),
      feeCents: Math.round(form.feeCents * 100),
      capacity: form.capacity,
      groupLink: form.groupLink || undefined,
      status: form.status as any,
    };
    if (isEdit) update.mutate({ id: event.id, ...data });
    else create.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-white/3 rounded-xl border border-white/5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do evento" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input value={form.eventDate} onChange={(e) => setForm(f => ({ ...f, eventDate: e.target.value }))} placeholder="Data (ex: 05, 06 | Junho | 2026)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input type="number" step="0.01" value={form.priceCents} onChange={(e) => setForm(f => ({ ...f, priceCents: Number(e.target.value) }))} placeholder="Preço (R$)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input type="number" step="0.01" value={form.feeCents} onChange={(e) => setForm(f => ({ ...f, feeCents: Number(e.target.value) }))} placeholder="Taxa (R$)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="number" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} placeholder="Capacidade" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="draft" className="bg-background">Rascunho</option>
          <option value="active" className="bg-background">Ativo</option>
          <option value="sold_out" className="bg-background">Esgotado</option>
          <option value="finished" className="bg-background">Finalizado</option>
        </select>
      </div>
      <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" rows={2} />
      <input value={form.groupLink} onChange={(e) => setForm(f => ({ ...f, groupLink: e.target.value }))} placeholder="Link do grupo WhatsApp (opcional)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
      {isEdit && (
        <div className="space-y-2">
          <label className="block text-xs font-medium">Banner (1920x780px)</label>
          {bannerPreview && <img src={bannerPreview} alt="Preview" className="w-full h-auto rounded-lg max-h-32 object-cover" />}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setBannerFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setBannerPreview(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
          {bannerFile && (
            <Button
              type="button"
              size="sm"
              className="gold-gradient text-black font-bold w-full"
              disabled={uploadingBanner}
              onClick={async () => {
                setUploadingBanner(true);
                const reader = new FileReader();
                reader.onload = async (ev) => {
                  const base64 = (ev.target?.result as string).split(',')[1];
                  await uploadBanner.mutateAsync({
                    eventId: event.id,
                    bannerBase64: base64,
                    mimeType: bannerFile.type,
                  });
                  setBannerFile(null);
                  setUploadingBanner(false);
                };
                reader.readAsDataURL(bannerFile);
              }}
            >
              {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Banner"}
            </Button>
          )}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="border-white/10">Cancelar</Button>
        <Button type="submit" size="sm" className="gold-gradient text-black font-bold" disabled={create.isPending || update.isPending}>
          {(create.isPending || update.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}

function BoardingPointsPanel({ eventId }: { eventId: number }) {
  const utils = trpc.useUtils();
  const { data: bps, isLoading } = trpc.admin.boardingPoints.list.useQuery({ eventId });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ city: "", locationName: "", meetingTime: "", departureTime: "" });

  const create = trpc.admin.boardingPoints.create.useMutation({
    onSuccess: () => { utils.admin.boardingPoints.list.invalidate(); toast.success("Ponto criado!"); setShowAdd(false); setForm({ city: "", locationName: "", meetingTime: "", departureTime: "" }); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="ml-4 mt-2 glass-card rounded-xl p-4 border-l-2 border-primary/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Pontos de Embarque</h4>
        <Button size="sm" variant="outline" className="border-primary/30 text-primary text-xs" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </Button>
      </div>
      {showAdd && (
        <form onSubmit={(e) => { e.preventDefault(); create.mutate({ eventId, ...form }); }} className="grid grid-cols-2 gap-2 mb-3 p-3 bg-white/3 rounded-lg">
          <input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Cidade" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs" required />
          <input value={form.locationName} onChange={(e) => setForm(f => ({ ...f, locationName: e.target.value }))} placeholder="Local" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs" required />
          <input value={form.meetingTime} onChange={(e) => setForm(f => ({ ...f, meetingTime: e.target.value }))} placeholder="Horário encontro" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs" />
          <input value={form.departureTime} onChange={(e) => setForm(f => ({ ...f, departureTime: e.target.value }))} placeholder="Horário saída" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs" />
          <div className="col-span-2 flex justify-end">
            <Button type="submit" size="sm" className="gold-gradient text-black font-bold text-xs" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </form>
      )}
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : bps && bps.length > 0 ? (
        <div className="space-y-2">
          {bps.map((bp) => (
            <div key={bp.id} className="flex items-center justify-between py-2 px-3 bg-white/3 rounded-lg text-xs">
              <div>
                <span className="font-medium">{bp.city}</span> - {bp.locationName}
              </div>
              <div className="text-muted-foreground">
                {bp.meetingTime && `Encontro: ${bp.meetingTime}`} {bp.departureTime && `| Saída: ${bp.departureTime}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhum ponto cadastrado.</p>
      )}
    </div>
  );
}
