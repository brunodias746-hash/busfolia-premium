import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Printer } from "lucide-react";

export function ListaPage() {
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>("all");
  const [searchName, setSearchName] = useState<string>("");

  // Fetch all passengers
  const { data: passengers = [], isLoading } = trpc.admin.passengers.list.useQuery();

  // Get unique dates and boarding points
  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    passengers.forEach((p: any) => {
      if (p.travelDate) dates.add(p.travelDate);
    });
    return Array.from(dates).sort();
  }, [passengers]);

  const uniqueBoardingPoints = useMemo(() => {
    const points = new Set<string>();
    passengers.forEach((p: any) => {
      if (p.boardingPoint) points.add(p.boardingPoint);
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

  const handleExportPDF = async () => {
    // Simple PDF export - can be enhanced
    const doc = `
BUSFOLIA - LISTA DE PASSAGEIROS
${selectedDate ? `Data: ${selectedDate}` : ""}
${selectedBoardingPoint ? `Ponto: ${selectedBoardingPoint}` : ""}

${filteredPassengers
  .map(
    (p: any, i: number) => `
${i + 1}. ${p.name}
   Embarque: ${p.boardingPoint}
   Data: ${p.travelDate}
`
  )
  .join("")}
    `;

    const blob = new Blob([doc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lista-passageiros.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lista de Passageiros</h1>
        <p className="text-muted-foreground mt-2">Visualize e imprima a lista de passageiros para embarque</p>
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
            <Button onClick={() => { setSearchName(""); setSelectedDate("all"); setSelectedBoardingPoint("all"); }} variant="outline" className="w-full">
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
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* List */}
      <Card className="p-6 bg-card border-border">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Carregando...</div>
        ) : filteredPassengers.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum passageiro encontrado</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Total: {filteredPassengers.length} passageiro(s)
            </div>

            <div className="space-y-2">
              {filteredPassengers.map((passenger: any, index: number) => (
                <div key={passenger.id} className="flex items-start gap-4 p-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{passenger.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <div>📍 {passenger.boardingPoint}</div>
                      <div>📅 {passenger.travelDate}</div>
                    </div>
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
          body {
            background: white;
          }
          .no-print {
            display: none;
          }
          .print-only {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
