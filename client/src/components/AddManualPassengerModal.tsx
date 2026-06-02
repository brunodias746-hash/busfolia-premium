import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BoardingPointOption {
  id: number;
  name: string;
}

interface AddManualPassengerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  availableDates: string[];
  availableBoardingPoints: BoardingPointOption[];
  onPassengerAdded: () => void;
}

export function AddManualPassengerModal({
  open,
  onOpenChange,
  eventId,
  availableDates,
  availableBoardingPoints,
  onPassengerAdded,
}: AddManualPassengerModalProps) {
  const [name, setName] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [boardingPointId, setBoardingPointId] = useState<string>("");
  const [referenceOrderId, setReferenceOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addMutation = trpc.admin.passengers.manualPassengers.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do passageiro é obrigatório");
      return;
    }

    if (!travelDate) {
      toast.error("Data da viagem é obrigatória");
      return;
    }

    if (!boardingPointId) {
      toast.error("Ponto de embarque é obrigatório");
      return;
    }

    setIsLoading(true);
    try {
      await addMutation.mutateAsync({
        eventId,
        name: name.trim(),
        travelDate,
        boardingPointId: parseInt(boardingPointId, 10),
        referenceOrderId: referenceOrderId.trim() || null,
        createdBy: 1, // Will be overridden by ctx.user.id on server
      });

      toast.success("Passageiro adicionado com sucesso!");
      setName("");
      setTravelDate("");
      setBoardingPointId("");
      setReferenceOrderId("");
      onOpenChange(false);
      onPassengerAdded();
    } catch (error) {
      console.error("Error adding passenger:", error);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Passageiro Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Nome do Passageiro *
            </label>
            <Input
              placeholder="Digite o nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-background border-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Data da Viagem *
            </label>
            <Select value={travelDate} onValueChange={setTravelDate} disabled={isLoading}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione a data" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Ponto de Embarque *
            </label>
            <Select value={boardingPointId} onValueChange={setBoardingPointId} disabled={isLoading}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione o ponto" />
              </SelectTrigger>
              <SelectContent>
                {availableBoardingPoints.map((point) => (
                  <SelectItem key={point.id} value={point.id.toString()}>
                    {point.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Referência de Pedido (opcional)
            </label>
            <Input
              placeholder="Ex: BF-XXXXX"
              value={referenceOrderId}
              onChange={(e) => setReferenceOrderId(e.target.value)}
              disabled={isLoading}
              className="bg-background border-border"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Adicionando..." : "Adicionar Passageiro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
