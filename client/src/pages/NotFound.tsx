import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="container max-w-lg py-32 text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-8xl font-black font-heading gold-text mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            A página que você procura não existe ou foi movida.
          </p>
          <Link href="/">
            <Button className="gold-gradient text-black font-bold px-6 py-3 rounded-xl">
              <Home className="w-4 h-4 mr-2" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
