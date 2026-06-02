import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Color and icon mapping for boarding points
const boardingPointColors: Record<string, { bg: string; text: string; icon: string; color: string }> = {
  "BELO HORIZONTE - SHOPPING": { bg: "bg-blue-100", text: "text-blue-900", icon: "🔵", color: "#3B82F6" },
  "BETIM - PARTAGE SHOPPING": { bg: "bg-purple-100", text: "text-purple-900", icon: "🟣", color: "#A855F7" },
  "CONTAGEM - PRAÇA DA CEMIG": { bg: "bg-green-100", text: "text-green-900", icon: "🟢", color: "#22C55E" },
  "SANTA LUZIA - SORVETERIA 4 E": { bg: "bg-yellow-100", text: "text-yellow-900", icon: "🟡", color: "#EAB308" },
  "BELO HORIZONTE - MINAS SHC": { bg: "bg-red-100", text: "text-red-900", icon: "🔴", color: "#EF4444" },
  "BELO HORIZONTE - PRAÇA DA": { bg: "bg-orange-100", text: "text-orange-900", icon: "🟠", color: "#F97316" },
};

function getBoardingPointStyle(boardingPoint: string) {
  // Try exact match first
  if (boardingPointColors[boardingPoint]) {
    return boardingPointColors[boardingPoint];
  }
  
  // Try partial match
  for (const [key, style] of Object.entries(boardingPointColors)) {
    if (boardingPoint && boardingPoint.includes(key.split(' - ')[0])) {
      return style;
    }
  }
  
  // Default style
  return { bg: "bg-gray-100", text: "text-gray-900", icon: "📍", color: "#6B7280" };
}

// Normalize date to "DD de junho de 2026" format
function normalizeDateFormat(dateStr: string): string | null {
  if (!dateStr || dateStr === "N/A" || dateStr === "NaN/NaN/NaN") return null;
  
  // Already in correct format
  if (dateStr.match(/^\d{2} de junho de 2026$/)) {
    return dateStr;
  }
  
  // Parse "05/06/2026" format
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateStr.split('/');
    if (month === '06' && year === '2026') {
      return `${day} de junho de 2026`;
    }
    return null;
  }
  
  // Parse "2026-06-05" format (ISO) - convert to "05 de junho de 2026"
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateStr.split('-');
    if (month === '06' && year === '2026') {
      return `${day} de junho de 2026`;
    }
    return null;
  }
  
  // Parse "05 Junho" or "05 junho" - normalize to "05 de junho de 2026"
  if (dateStr.match(/^\d{2}\s+[Jj]unho$/)) {
    const day = dateStr.split(/\s+/)[0];
    return `${day} de junho de 2026`;
  }
  
  // Parse "06 de Junho de 2026" - normalize to lowercase "junho"
  if (dateStr.match(/^\d{2}\s+de\s+[Jj]unho\s+de\s+\d{4}$/)) {
    return dateStr.replace(/Junho/, 'junho');
  }
  
  return null;
}

export function ListaPage() {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>("all");
  const [searchName, setSearchName] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all passengers
  const { data: passengers = [], isLoading } = trpc.admin.passengers.list.useQuery();
  const exportMutation = trpc.exports.generatePassageiros.useMutation();

  // Filter to only PAID passengers (status is stored as "paid" in database)
  const paidPassengers = useMemo(() => {
    return passengers.filter((p: any) => p.status === "paid");
  }, [passengers]);

  // Get unique normalized dates from PAID passengers only
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    paidPassengers.forEach((p: any) => {
      const normalized = normalizeDateFormat(p.travelDate);
      if (normalized) {
        dates.add(normalized);
      }
    });
    // Sort by day number
    return Array.from(dates).sort((a, b) => {
      const dayA = parseInt(a.split(' ')[0]);
      const dayB = parseInt(b.split(' ')[0]);
      return dayA - dayB;
    });
  }, [paidPassengers]);

  const uniqueBoardingPoints = useMemo(() => {
    const points = new Set<string>();
    paidPassengers.forEach((p: any) => {
      if (p.boardingPoint && p.boardingPoint !== "N/A" && p.boardingPoint !== "") {
        points.add(p.boardingPoint);
      }
    });
    return Array.from(points).sort();
  }, [paidPassengers]);

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return paidPassengers.filter((p: any) => {
      const normalizedDate = normalizeDateFormat(p.travelDate);
      const matchDate = selectedDate === "all" || normalizedDate === selectedDate;
      const matchPoint = selectedBoardingPoint === "all" || p.boardingPoint === selectedBoardingPoint;
      const matchName = !searchName || p.name.toLowerCase().includes(searchName.toLowerCase());
      return matchDate && matchPoint && matchName;
    });
  }, [paidPassengers, selectedDate, selectedBoardingPoint, searchName]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync({});
      if (result.success && result.data) {
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
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-black font-heading">Lista de Embarque</h1>
          <p className="text-muted-foreground text-sm">Lista simplificada para conferência no embarque (apenas passageiros pagos)</p>
          <div className="flex items-center gap-4 pt-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg px-4 py-3 text-white font-bold text-lg">
              <span className="text-sm font-medium opacity-90">Total de Passageiros:</span>
              <div className="text-2xl font-black">{filteredPassengers.length}</div>
            </div>
            {filteredPassengers.length !== paidPassengers.length && (
              <div className="text-sm text-muted-foreground">
                (de {paidPassengers.length} pagos com filtros aplicados)
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Buscar por Nome</label>
              <Input
                placeholder="Digite o nome..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Data da Viagem</label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todas as datas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  {uniqueDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Ponto de Embarque</label>
              <Select value={selectedBoardingPoint} onValueChange={setSelectedBoardingPoint}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Todos os pontos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os pontos</SelectItem>
                  {uniqueBoardingPoints.map((point) => (
                    <SelectItem key={point} value={point}>
                      {point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => { setSearchName(""); setSelectedDate("all"); setSelectedBoardingPoint("all"); }} variant="outline" className="w-full border-white/10">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handlePrint} className="gap-2 bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 border-white/10" disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar Excel
          </Button>
          <Button className="gap-2 bg-green-600 hover:bg-green-700" disabled>
            ➕ Adicionar Passageiro (em breve)
          </Button>
        </div>

        {/* List Table */}
        <Card className="p-6 bg-card border-border overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPassengers.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Nenhum passageiro encontrado</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                Total: {filteredPassengers.length} passageiro(s)
              </div>

              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 rounded-lg text-sm font-semibold text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Nome</div>
                <div className="col-span-2">Pedido</div>
                <div className="col-span-3">Embarque</div>
                <div className="col-span-3">Data Viagem</div>
              </div>

              {/* Table rows */}
              <div className="space-y-1">
                {filteredPassengers.map((passenger: any, index: number) => {
                  const normalizedDate = normalizeDateFormat(passenger.travelDate);
                  return (
                    <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="col-span-1 font-mono text-sm text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="col-span-3 font-semibold text-foreground">
                        {passenger.name}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground font-mono">
                        {passenger.orderShortId || "N/A"}
                      </div>
                      <div className="col-span-3 text-sm">
                        {passenger.boardingPoint ? (
                          <div className={`inline-block px-3 py-1 rounded-full font-medium ${getBoardingPointStyle(passenger.boardingPoint).bg} ${getBoardingPointStyle(passenger.boardingPoint).text}`}>
                            {getBoardingPointStyle(passenger.boardingPoint).icon} {passenger.boardingPoint}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground">
                        📅 {normalizedDate || "N/A"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Print Stylesheet */}
        <style>{`
          @media print {
            body { background: white !important; color: black !important; }
            nav, header, .no-print, button { display: none !important; }
            .print-only { display: block !important; }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
