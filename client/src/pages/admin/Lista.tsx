import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ListaPage() {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>("all");
  const [searchName, setSearchName] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all passengers
  const { data: passengers = [], isLoading } = trpc.admin.passengers.list.useQuery();
  const exportMutation = trpc.exports.generatePassageiros.useMutation();

  // Get unique dates and boarding points from data
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    passengers.forEach((p: any) => {
      if (p.travelDate && p.travelDate !== "N/A" && p.travelDate !== "") {
        dates.add(p.travelDate);
      }
    });
    return Array.from(dates).sort();
  }, [passengers]);

  const uniqueBoardingPoints = useMemo(() => {
    const points = new Set<string>();
    passengers.forEach((p: any) => {
      if (p.boardingPoint && p.boardingPoint !== "N/A" && p.boardingPoint !== "") {
        points.add(p.boardingPoint);
      }
    });
    return Array.from(points).sort();
  }, [passengers]);

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p: any) => {
      const matchDate = selectedDate === "all" || p.travelDate === selectedDate;
      const matchPoint = selectedBoardingPoint === "all" || p.boardingPoint === selectedBoardingPoint;
      const matchName = !searchName || p.name.toLowerCase().includes(searchName.toLowerCase());
      return matchDate && matchPoint && matchName;
    });
  }, [passengers, selectedDate, selectedBoardingPoint, searchName]);

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
        <div>
          <h1 className="text-2xl font-black font-heading">Lista de Embarque</h1>
          <p className="text-muted-foreground text-sm">Lista simplificada para conferência no embarque</p>
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
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2 bg-primary hover:bg-primary/90">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2 border-white/10" disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar Excel
          </Button>
        </div>

        {/* List Table */}
        <Card className="p-6 bg-card border-border">
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
                <div className="col-span-4">Nome</div>
                <div className="col-span-4">Ponto de Embarque</div>
                <div className="col-span-3">Data da Viagem</div>
              </div>

              {/* Table rows */}
              <div className="space-y-1">
                {filteredPassengers.map((passenger: any, index: number) => (
                  <div key={passenger.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="col-span-1 font-mono text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="col-span-4 font-semibold text-foreground">
                      {passenger.name}
                    </div>
                    <div className="col-span-4 text-sm text-muted-foreground">
                      📍 {passenger.boardingPoint || "N/A"}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      📅 {passenger.travelDate || "N/A"}
                    </div>
                  </div>
                ))}
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
