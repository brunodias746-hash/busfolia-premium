import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface AddManualPassengerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  travelDate: string;
  boardingPoints: Array<{ id: number; locationName: string; city: string }>;
  onSuccess: () => void;
}

export function AddManualPassengerModal({
  open,
  onOpenChange,
  eventId,
  travelDate,
  boardingPoints,
  onSuccess,
}: AddManualPassengerModalProps) {
  const [name, setName] = useState("");
  const [boardingPointId, setBoardingPointId] = useState<string>("");
  const [referenceOrderId, setReferenceOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.admin.manualPassengers.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do passageiro é obrigatório");
      return;
    }

    if (!boardingPointId) {
      toast.error("Ponto de embarque é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      await createMutation.mutateAsync({
        eventId,
        name: name.trim(),
        travelDate,
        boardingPointId: parseInt(boardingPointId),
        referenceOrderId: referenceOrderId.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success("Passageiro adicionado à lista de embarque");
      
      // Reset form
      setName("");
      setBoardingPointId("");
      setReferenceOrderId("");
      setNotes("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Falha ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Passageiro Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Passageiro *</label>
            <Input
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Travel Date (Display only) */}
          <div>
            <label className="block text-sm font-medium mb-1">Data da Viagem</label>
            <div className="px-3 py-2 border border-border rounded-md bg-muted text-sm">
              {new Date(travelDate + "T00:00:00Z").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Boarding Point */}
          <div>
            <label className="block text-sm font-medium mb-1">Ponto de Embarque *</label>
            <Select value={boardingPointId} onValueChange={setBoardingPointId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ponto" />
              </SelectTrigger>
              <SelectContent>
                {boardingPoints.map((point) => (
                  <SelectItem key={point.id} value={point.id.toString()}>
                    {point.locationName} - {point.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Order ID */}
          <div>
            <label className="block text-sm font-medium mb-1">Pedido (Opcional)</label>
            <Input
              placeholder="Ex: BF-XXXXX"
              value={referenceOrderId}
              onChange={(e) => setReferenceOrderId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Observações (Opcional)</label>
            <Textarea
              placeholder="Ex: Comp, última hora, etc."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar Passageiro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
