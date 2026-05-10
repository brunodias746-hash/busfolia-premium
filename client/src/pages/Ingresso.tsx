import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Download, Share2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function Ingresso() {
  const params = useParams();
  const [, navigate] = useLocation();
  const shortId = params.shortId as string;
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch order by shortId
  const { data: order, isLoading, error } = trpc.admin.orders.getByShortId.useQuery(
    { shortId },
    { enabled: !!shortId }
  );

  const handlePrint = () => {
    window.print();
  };



  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Show loading toast
      const loadingToastId = toast.loading("Gerando PDF do ingresso...");

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`ingresso-${shortId}.pdf`);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success("PDF baixado com sucesso!", {
        description: `Ingresso ${shortId} foi salvo em seus downloads`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Erro ao gerar PDF", {
        description: "Não foi possível gerar o PDF do ingresso. Tente novamente.",
        duration: 4000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/ingresso/${shortId}`;
    if (navigator.share) {
      await navigator.share({
        title: "Meu Ingresso BusFolia",
        text: "Veja meu ingresso para o evento",
        url,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Ingresso não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            Desculpe, não conseguimos encontrar este ingresso. Verifique o link e tente novamente.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  // Format dates for display
  // CRITICAL FIX: Handle dates without year (default to 2026)
  const formatDate = (dateStr: string) => {
    // If date string doesn't contain a year, append 2026
    let dateToFormat = dateStr;
    if (dateStr && !dateStr.includes('2026') && !dateStr.includes('202') && !/\d{4}/.test(dateStr)) {
      dateToFormat = `${dateStr} 2026`;
    }
    
    const date = new Date(dateToFormat);
    
    // Fallback: if date is still invalid, parse manually
    if (isNaN(date.getTime())) {
      // Try to parse "05 Junho 2026" format
      const monthNames: { [key: string]: number } = {
        'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
        'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
        'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
      };
      const parts = dateToFormat.toLowerCase().split(' ');
      if (parts.length >= 2) {
        const day = parseInt(parts[0]);
        const month = monthNames[parts[1]];
        const year = parts[2] ? parseInt(parts[2]) : 2026;
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        }
      }
      return dateStr; // Return original if all parsing fails
    }
    
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Parse transportDates if it's a JSON string
  const transportDates = Array.isArray(order.transportDates)
    ? order.transportDates
    : typeof order.transportDates === "string"
      ? JSON.parse(order.transportDates)
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Salvar PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              🖨️ Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Ticket */}
        <div
          ref={pdfRef}
          className="bg-white rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
            <div className="text-center mb-4">
              <h1 className="text-4xl font-bold">BusFolia</h1>
              <p className="text-sm text-white/80">Transporte Premium para Eventos</p>
            </div>
            <div className="border-t border-white/20 pt-4 mt-4">
              <p className="text-center text-lg font-semibold">
                ✓ PAGAMENTO CONFIRMADO
              </p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8 space-y-6">
            {/* Order Number */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Número do Pedido</p>
              <p className="text-2xl font-bold text-gray-900">{order.id}</p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nome</p>
                <p className="font-semibold text-gray-900">
                  {order.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">
                  {order.customerEmail}
                </p>
              </div>
            </div>

            {/* Boarding Point */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Ponto de Embarque</p>
              <p className="font-semibold text-gray-900">
                {order.boardingPointLabel}
              </p>
            </div>

            {/* Travel Dates */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Data(s) da Viagem</p>
              <div className="space-y-1">
                {transportDates.length > 0 ? (
                  transportDates.map((date: string, idx: number) => (
                    <p key={idx} className="font-semibold text-gray-900">
                      • {formatDate(date)}
                    </p>
                  ))
                ) : (
                  <p className="font-semibold text-gray-900">
                    {formatDate(order.transportDates as string)}
                  </p>
                )}
              </div>
            </div>

            {/* Passengers */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Quantidade de Passageiros</p>
              <p className="font-semibold text-gray-900">{order.quantity}</p>
            </div>

            {/* Price */}
            <div className="border-t-2 border-b-2 border-primary py-4">
              <p className="text-sm text-gray-600 mb-2">Valor Total</p>
              <p className="text-3xl font-bold text-primary">
                R$ {(order.totalAmountCents / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-center text-green-800 font-semibold">
                ✓ Ingresso Válido - Apresente este documento no embarque
              </p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Gerado em: {new Date().toLocaleString("pt-BR")}</p>
              <p className="mt-2">
                Para dúvidas, entre em contato pelo WhatsApp: (31) 9 9090-8399
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Dica:</strong> Salve este ingresso em PDF ou compartilhe o link
            para acessá-lo a qualquer momento.
          </p>
        </Card>
      </div>
    </div>
  );
}
