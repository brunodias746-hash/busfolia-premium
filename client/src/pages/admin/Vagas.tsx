import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Edit2, Check, X } from "lucide-react";

export default function VagasAdmin() {
  const { data: allSeats, isLoading, refetch } = trpc.seats.getAllAvailability.useQuery(
    { eventId: 1 },
    { enabled: true }
  );
  
  const updateMutation = trpc.seats.updateSeats.useMutation({
    onSuccess: () => {
      toast.success("Vagas atualizadas com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error?.message || 'Erro desconhecido'}`);
    },
  });

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  const handleEdit = (date: string, currentTotal: number) => {
    setEditingDate(date);
    setEditValues({ ...editValues, [date]: currentTotal });
  };

  const handleSave = (date: string) => {
    const newTotal = editValues[date];
    if (newTotal === undefined || newTotal < 0) {
      toast.error("Valor inválido");
      return;
    }
    
    updateMutation.mutate(
      { eventId: 1, travelDate: date, totalSeats: newTotal },
      {
        onSuccess: () => {
          setEditingDate(null);
          setEditValues({});
        },
        onError: () => {
          // Error is handled in the mutation's onError
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingDate(null);
    setEditValues({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Vagas</h1>
        <p className="text-muted-foreground mt-2">
          Edite o total de vagas para cada data. As vagas disponíveis são calculadas automaticamente: Total - Passageiros Pagos
        </p>
      </div>

      <div className="grid gap-4">
        {allSeats?.map((seat) => {
          const isEditing = editingDate === seat.travelDate;
          const displayDate = new Date(seat.travelDate + "T00:00:00").toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <Card key={seat.travelDate}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{displayDate}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Vagas</p>
                    {isEditing ? (
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          min="0"
                          value={editValues[seat.travelDate] || 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [seat.travelDate]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSave(seat.travelDate)}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-2xl font-bold">{seat.totalSeats}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(seat.travelDate, seat.totalSeats)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Passageiros Pagos</p>
                    <p className="text-2xl font-bold mt-2">{seat.totalSeats - seat.availableSeats}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
                    <p className={`text-2xl font-bold mt-2 ${
                      seat.availableSeats === 0 ? "text-red-500" :
                      seat.availableSeats < 10 ? "text-yellow-500" :
                      "text-green-500"
                    }`}>
                      {seat.availableSeats}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!allSeats || allSeats.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhuma data configurada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
