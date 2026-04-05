# BusFolia Premium - TODO

## Fase 1: Infraestrutura e Design System
- [x] Design system premium dark mode (#0A0A0A + dourado #D4AF37) em index.css
- [x] Configurar ThemeProvider para dark mode
- [x] Schema do banco: events, boarding_points, orders, passengers, payments
- [x] Executar migrações SQL
- [x] Instalar Stripe SDK (stripe)

## Fase 2: Backend (tRPC + Stripe)
- [x] DB helpers: events, boarding_points, orders, passengers, payments
- [x] tRPC routers: events (público), checkout, orders, admin
- [x] Rota POST /api/checkout/session (cria Stripe Checkout Session)
- [x] Rota POST /api/webhooks/stripe (raw body, valida assinatura)
- [x] Rota GET /api/orders/status/:sessionId (polling para página de sucesso)
- [x] Admin procedures: CRUD eventos, CRUD pontos de embarque
- [x] Admin procedures: listar pedidos, listar passageiros, check-in
- [x] Admin procedures: dashboard métricas, financeiro
- [x] Exportação CSV de passageiros (backend endpoint)

## Fase 3: Frontend Público
- [x] Layout público com Header e Footer premium
- [x] Home: Hero com headline forte e CTA
- [x] Home: Faixa de benefícios rápidos (4 ícones)
- [x] Home: Seção Frota/Experiência
- [x] Home: Seção "Por que escolher a BusFolia"
- [x] Home: Card de Oferta/Evento com urgência visual
- [x] Home: Seção "Como Funciona" (4 passos)
- [x] Home: Seção "Sobre a BusFolia"
- [x] Home: Depoimentos (prova social)
- [x] Home: FAQ resumido (accordion)
- [x] Home: CTA final com urgência
- [x] Home: Contador regressivo real para o evento
- [x] Página /comprar: formulário multi-etapas (dados pessoais, embarque, resumo)
- [x] Página /comprar: validação CPF, e-mail, máscaras de campo
- [x] Página /comprar: barra de progresso visual
- [x] Página /comprar: integração com /api/checkout/session
- [x] Página /sucesso: polling de status via session_id, exibe dados reais do pedido
- [x] Página /falha: mensagem de erro e botão "Tentar Novamente"
- [x] Página /duvidas: FAQ completo com accordion premium
- [x] Página /contato: WhatsApp, Instagram, formulário

## Fase 4: Painel Administrativo
- [x] Layout admin com sidebar (DashboardLayout)
- [x] Dashboard: métricas (faturamento, pedidos, passageiros, conversão)
- [x] Eventos: CRUD completo com pontos de embarque vinculados
- [x] Pedidos: listagem com filtros, busca, detalhes
- [x] Passageiros: listagem com filtros, exportação CSV
- [x] Check-in: interface mobile-first com busca e confirmação
- [x] Financeiro: receita total, por evento, filtros por período

## Fase 5: Validação e Entrega
- [x] Testes vitest para rotas críticas (checkout, webhook, auth)
- [x] Validar fluxo completo de compra
- [x] Implementar exportação CSV real no admin Passageiros
- [x] Criar tela Financeiro dedicada com filtros por período
- [x] Adicionar testes webhook Stripe (assinatura válida/inválida)
- [x] Checkpoint final e entrega

## Fase 6: Atualização UI/UX Frontend
- [x] TopAnnouncementBar animada (marquee) com texto PLRS 2026 em loop infinito
- [x] Hero Section reconstruída com imagem de evento, overlay escuro, novo copy e CTA
- [x] FleetCarousel em 2 colunas com animação contínua (estrutura pronta, aguardando imagens reais)
- [x] Ajustes de identidade global: contraste, hierarquia tipográfica, espaçamento 8pt

## Fase 7: Refinamentos visuais e de linguagem
- [x] Top bar: tipografia refinada com contraste de peso (fino + bold), separador ✦, frase exata
- [x] Frota: reescrever texto com linguagem jovem, atual e aspiracional (menos corporativa)
- [x] Hero: imagem real do evento rodeio integrada (PHIL9031 oficial)
- [x] Frota: 12 fotos reais da Viacao TG integradas no carrossel


## Fase 8: Checklist Final de Execução (NOVO)

### TOP BAR (BARRA VERMELHA)
- [x] Corrigir espaçamento de "PARA O"
- [x] Implementar tipografia alternada (font-weight 400 e 700)
- [x] Garantir loop contínuo sem quebra
- [x] Animação fluida com separador ✦

### HERO PRINCIPAL
- [x] Manter layout atual
- [x] Converter hero em carrossel
- [x] Adicionar capa do evento (1920x780)
- [x] Manter texto em MAIÚSCULO com legibilidade

### CARD EVENTO
- [ ] Remover "0 de 200 vendidos"

### FROTA
- [x] Corrigir imagens quebradas (removidas 2 imagens que falhavam)
- [x] Remover promessas falsas (ar condicionado, wi-fi)
- [x] Usar linguagem mais jovem

### DEPOIMENTOS
- [x] Remover referência a Shopping Del Rey
- [x] Alinhar com pontos reais

### PONTOS DE EMBARQUE
- [ ] Atualizar em TODO o site:
  - [ ] BETIM: PARTAGE SHOPPING BETIM
  - [ ] CONTAGEM: PRAÇA DA CEMIG
  - [ ] BELO HORIZONTE: PRAÇA DA ESTAÇÃO, MINAS SHOPPING, SHOPPING ESTAÇÃO
  - [ ] SANTA LUZIA: SORVETERIA 4 ESTAÇÃO
- [ ] Não exibir horários nessa seção
- [ ] Refletir no checkout também

### CONTATO / GRUPO
- [ ] Atualizar WhatsApp: (31) 9 7354-0425
- [ ] Adicionar link do grupo: https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po
- [ ] Adicionar botão "ENTRAR NO GRUPO"

### CHECKOUT
- [ ] Corrigir erro CPF inválido
- [ ] CPF solicitado apenas 1 vez
- [ ] Nome: aceitar nome + sobrenome
- [ ] Implementar fluxo correto:
  1. [ ] Dados pessoais
  2. [ ] Cidade
  3. [ ] Ponto de embarque
  4. [ ] Datas
  5. [ ] Tipo de compra
  6. [ ] Passageiros
  7. [ ] Resumo
  8. [ ] Pagamento

### REGRAS DE COMPRA
- [ ] 1 dia = R$ 60,00
- [ ] Múltiplos dias: cliente escolhe dias específicos
- [ ] Cálculo: R$ 60,00 x quantidade de dias
- [ ] Passaporte (TODOS OS DIAS): R$ 200,00

### SUCESSO / EMAIL
- [ ] Tela de sucesso com resumo real
- [ ] Email automático com:
  - [ ] Dados da passagem
  - [ ] Link do grupo

### ADMIN / PEDIDOS
- [ ] Revisar pedidos pendentes sem pagamento
- [ ] Validar regra correta de criação/status

### ADMIN / EVENTOS
- [ ] Permitir editar evento
- [ ] Permitir upload de capa/banner (padrão: 1920x780)
- [ ] Capa vai para hero
- [ ] Hero aceita carrossel

### EXPORTAÇÃO
- [ ] Manter exportação
- [ ] Melhorar planilha
- [ ] Deixar mais profissional e completa

### VALIDAÇÃO FINAL
- [ ] Revisar site inteiro + admin
- [ ] Alinhar todos os dados
- [ ] Garantir consistência
- [ ] Todos os botões funcionando
- [ ] Nenhum fluxo fake
- [ ] Checkout funcionando real
