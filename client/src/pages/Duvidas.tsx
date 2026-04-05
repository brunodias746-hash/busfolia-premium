import PublicLayout from "@/components/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "Compra e Pagamento",
    items: [
      { q: "Como compro minha passagem?", a: "Acesse a página de compra, preencha seus dados pessoais, escolha o ponto de embarque e a data, adicione os passageiros e finalize o pagamento com cartão de crédito via Stripe." },
      { q: "Quais formas de pagamento são aceitas?", a: "Aceitamos cartão de crédito (Visa, Mastercard, Elo, American Express) processado de forma segura pelo Stripe." },
      { q: "Posso comprar para mais de uma pessoa?", a: "Sim! No formulário de compra você pode adicionar múltiplos passageiros. Cada passageiro precisa ter nome e CPF informados." },
      { q: "Recebo confirmação do pagamento?", a: "Sim, após a confirmação do pagamento você será redirecionado para uma página de sucesso com todos os detalhes do pedido." },
    ],
  },
  {
    category: "Viagem e Embarque",
    items: [
      { q: "O transporte inclui ida e volta?", a: "Sim! Todas as passagens incluem ida e volta garantida." },
      { q: "Posso escolher o ponto de embarque?", a: "Sim, temos diversos pontos de embarque em BH e região metropolitana. Você escolhe o mais conveniente durante a compra." },
      { q: "Qual o horário de saída?", a: "O horário varia conforme o ponto de embarque. Cada ponto tem horário de encontro e saída definidos, que são exibidos durante a compra." },
      { q: "Preciso levar documento?", a: "Sim, leve um documento com foto (RG ou CNH) para identificação no embarque." },
    ],
  },
  {
    category: "Cancelamento e Suporte",
    items: [
      { q: "Posso cancelar minha passagem?", a: "Consulte nossa política de cancelamento entrando em contato pelo WhatsApp. O prazo e condições variam conforme a proximidade do evento." },
      { q: "E se o evento for cancelado?", a: "Em caso de cancelamento do evento, todos os passageiros serão reembolsados integralmente." },
      { q: "Como entro em contato com o suporte?", a: "Você pode nos contatar pelo WhatsApp, Instagram ou e-mail. Acesse a página de Contato para mais informações." },
    ],
  },
];

export default function Duvidas() {
  return (
    <PublicLayout>
      <div className="container max-w-3xl py-8 sm:py-16 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4">
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium text-primary">Central de Ajuda</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading mb-2 sm:mb-3">
            Perguntas <span className="gold-text">Frequentes</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground">Encontre respostas para as dúvidas mais comuns</p>
        </div>

        {faqs.map((section) => (
          <div key={section.category} className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-primary">{section.category}</h2>
            <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
              {section.items.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`${section.category}-${i}`}
                  className="glass-card rounded-lg sm:rounded-xl border-none px-3 sm:px-6"
                >
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-medium hover:no-underline hover:text-primary py-3 sm:py-4 min-h-[44px]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[10px] sm:text-sm text-muted-foreground pb-3 sm:pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
