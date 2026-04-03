import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { XCircle, ArrowRight, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function Falha() {
  return (
    <PublicLayout>
      <div className="container max-w-lg py-32">
        <div className="glass-card rounded-2xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-black font-heading mb-2">
            Pagamento <span className="text-red-400">Cancelado</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            O pagamento não foi concluído. Nenhuma cobrança foi realizada. Você pode tentar novamente a qualquer momento.
          </p>

          <div className="space-y-3">
            <Link href="/comprar">
              <Button className="gold-gradient text-black font-bold w-full py-3 rounded-xl">
                Tentar Novamente <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-white/10 py-3 rounded-xl mt-2">
                <MessageCircle className="w-4 h-4 mr-2" /> Falar com Suporte
              </Button>
            </a>
            <Link href="/">
              <Button variant="ghost" className="w-full text-muted-foreground mt-1">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
