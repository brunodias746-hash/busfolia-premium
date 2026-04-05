import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { XCircle, ArrowRight, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function Falha() {
  return (
    <PublicLayout>
      <div className="container max-w-lg py-8 sm:py-32 px-4 sm:px-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6 md:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <h1 className="text-xl sm:text-3xl font-black font-heading mb-1 sm:mb-2">
            Pagamento <span className="text-red-400">Cancelado</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-6">
            O pagamento não foi concluído. Nenhuma cobrança foi realizada. Você pode tentar novamente a qualquer momento.
          </p>

          <div className="space-y-2 sm:space-y-3">
            <Link href="/comprar">
              <Button className="gold-gradient text-black font-bold w-full py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base">
                Tentar Novamente <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-white/10 py-3 sm:py-4 rounded-lg sm:rounded-xl min-h-[44px] text-sm sm:text-base">
                <MessageCircle className="w-4 h-4 mr-2" /> Falar com Suporte
              </Button>
            </a>
            <Link href="/">
              <Button variant="ghost" className="w-full text-muted-foreground py-3 sm:py-4 min-h-[44px] text-sm sm:text-base">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
