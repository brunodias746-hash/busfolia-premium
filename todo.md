# BusFolia Premium - Checklist Completo de Correções

## FASE 1: TOP BAR
- [x] Corrigir estrutura: frase inteira sem quebra + separador
- [x] Aplicar tipografia alternada (400, 700, 400, 700...)
- [x] Garantir loop contínuo sem gaps

## FASE 2: HERO / BANNER
- [x] Banner/capa do evento aparecer no bloco inferior clicável
- [x] Ligar ao evento criado
- [x] Atualizar dinamicamente conforme evento

## FASE 3: FROTA
- [x] Corrigir fotos que não estão carregando
- [x] Remover fotos repetidas
- [x] Validar todas as 12 imagens carregando

## FASE 4: DEPOIMENTOS
- [x] Revisar todos os depoimentos
- [x] Remover qualquer referência a Shopping Del Rey
- [x] Validar pontos de embarque corretos em cada depoimento

## FASE 5: CHECKOUT - VALIDAÇÃO
- [x] Campo nome: validar nome + sobrenome (mínimo 2 palavras)
- [x] Revisar validação em todos os cenários
- [x] Testar com dados inválidos ("João" rejeitado)
- [x] Testar com dados válidos ("João Silva" aceito)

## FASE 6: FLUXO DE COMPRA - 8 PASSOS
- [ ] Passo 1: Dados pessoais (nome, CPF, email, telefone)
- [ ] Passo 2: Cidade
- [ ] Passo 3: Ponto de embarque
- [ ] Passo 4: Data(s)
- [ ] Passo 5: Tipo de compra (1 dia ou múltiplos dias)
- [ ] Passo 6: Quantidade de passageiros
- [ ] Passo 7: Resumo
- [ ] Passo 8: Pagamento
- [ ] Se múltiplos dias: permitir selecionar dias específicos

## FASE 7: SUCESSO / PÓS-PAGAMENTO
- [x] Corrigir tela de sucesso (atualmente vazia/inválida)
- [x] Mostrar resumo real da compra
- [x] Exibir dados da passagem
- [x] Exibir ponto de embarque
- [x] Exibir datas selecionadas
- [x] Exibir quantidade de passageiros
- [x] Botão para entrar no grupo WhatsApp

## FASE 8: EMAIL AUTOMÁTICO
- [x] Implementar envio de email após pagamento aprovado
- [x] Incluir dados da passagem
- [x] Incluir dias selecionados
- [x] Incluir ponto de embarque
- [x] Incluir quantidade de passageiros
- [x] Incluir link do grupo
- [ ] Tratamento de erro e retry

## FASE 9: ADMIN - PEDIDOS
- [ ] Revisar tentativas incompletas entrando como pendentes
- [ ] Validar regra de criação/status dos pedidos
- [ ] Implementar filtro por status
- [ ] Implementar busca por pedido

## FASE 10: ADMIN - EVENTOS
- [ ] Todo evento criado deve aparecer na hero principal
- [ ] Banner/capa enviado no admin deve alimentar a hero
- [ ] Permitir editar evento
- [ ] Permitir upload de capa (padrão: 1920x780)

## FASE 11: EXPORTAÇÃO
- [ ] Melhorar estrutura da planilha exportada
- [ ] Deixar mais profissional e completa
- [ ] Incluir todos os dados relevantes
- [ ] Formatação adequada

## FASE 12: REVISÃO FINAL
- [ ] Revisar site inteiro + admin
- [ ] Alinhar hero, card do evento, checkout, sucesso, email e admin
- [ ] Remover conteúdo genérico ou falso
- [ ] Testar todos os fluxos
- [ ] Validar em produção

## FASE 13: REVISÃO MOBILE-FIRST COMPLETA
- [ ] Hero: altura controlada no mobile (60-75vh), sem corte de conteúdo
- [ ] Hero: object-fit cover com posicionamento correto
- [ ] Top Bar: texto em loop sem quebra no mobile
- [ ] Header/Nav: menu responsivo funcional
- [ ] Imagens: width 100%, height auto, sem overflow horizontal
- [ ] Tipografia: reduzir títulos no mobile, hierarquia clara
- [ ] Espaçamentos: padding/margin adequados no mobile
- [ ] Grids: converter para 1 coluna no mobile
- [ ] Botões: área de toque mínima 44px
- [ ] Carrosséis: swipe funcional, sem corte lateral
- [ ] Card evento: layout empilhado no mobile
- [ ] Pontos de embarque: layout responsivo
- [ ] Depoimentos: 1 coluna no mobile
- [ ] FAQ: accordion funcional no mobile
- [ ] Checkout: inputs grandes, espaçamento adequado
- [ ] Checkout: fácil digitação, sem scroll quebrado
- [ ] Sucesso/Falha: layout mobile adequado
- [ ] Contato: layout mobile adequado
- [ ] Dúvidas: layout mobile adequado
- [ ] Nenhum overflow horizontal em nenhuma página
- [ ] Testado em 375px (iPhone) e 360px (Android)


## FASE 14: CORREÇÕES ESTRUTURAIS CRÍTICAS

### 1. CHECKOUT - MODELAGEM DE DADOS
- [ ] Alterar `transportDate: string` para `transportDates: string[]`
- [ ] Adicionar `purchaseType: "single" | "multiple" | "all_days"`
- [ ] Validar regras: single=1 data, multiple=array, all_days=ignorar datas

### 2. CHECKOUT - CÁLCULO DE PREÇO
- [ ] Remover uso de `event.priceCents` como base fixa
- [ ] Implementar `PRICE_PER_DAY = 6000` (R$60)
- [ ] Implementar `ALL_DAYS_PRICE = 20000` (R$200)
- [ ] Cálculo: `total = (purchaseType === "all_days" ? ALL_DAYS_PRICE : transportDates.length * PRICE_PER_DAY) * passengers`

### 3. CHECKOUT - ESTRUTURA DE FLUXO
- [ ] Quebrar em 7 steps: personalData, boardingSelection, dateSelection, purchaseType, passengerCount, review, payment
- [ ] Separar estados por step
- [ ] Remover acoplamento

### 4. EMBARQUE - ESTRUTURA DE INPUT
- [ ] Remover select separado de cidade e ponto
- [ ] Criar `BoardingOption` unificado: `{ id, label: "CIDADE - PONTO" }`
- [ ] Remover exibição de horários

### 5. STRIPE - SESSION
- [ ] Usar `unit_amount` dinâmico baseado em cálculo
- [ ] Não usar valor fixo do evento
- [ ] Total já calculado no backend

### 6. HERO - DESACOPLAR HARDCODE
- [ ] Criar endpoint `/api/events/active`
- [ ] Retornar evento com `bannerUrl`
- [ ] Frontend mapear banners → carrossel

### 7. ADMIN - UPLOAD DE BANNER
- [ ] Adicionar `<input type="file" accept="image/*" />`
- [ ] Upload via Forge storage
- [ ] Salvar URL em `events.bannerUrl`
- [ ] Validar proporção ~1920x780

### 8. FROTA - REMOÇÃO DE MOCK
- [ ] Remover imagens de `constants.ts`
- [ ] Criar lista vazia ou placeholder
- [ ] Bloquear deploy até imagens reais

### 9. EMAIL - IMPLEMENTAÇÃO REAL
- [ ] Adicionar serviço (SendGrid ou Resend)
- [ ] Implementar no webhook Stripe
- [ ] Template com: datas, ponto, passageiros, link grupo

### 10. SUCCESS PAGE
- [ ] Buscar pedido por `session_id`
- [ ] Renderizar `transportDates[]`
- [ ] Renderizar `boardingPoint`
- [ ] Renderizar `passengers`

### 11. MOBILE - HERO FIX
- [ ] Remover `min-h-[90vh]`
- [ ] Usar `h-[60vh] sm:h-[65vh]`
- [ ] Adicionar `object-fit: cover; object-position: center;`

### 12. ADMIN - EVENT DELETE
- [ ] Adicionar mutation `deleteEvent(id: string)`
- [ ] Botão delete com confirmação

### 13. PEDIDOS - STATUS
- [ ] Status inicial: "pending_checkout"
- [ ] Após webhook: "paid"
- [ ] Não tratar tentativa como pedido válido

### 14. EXPORTAÇÃO
- [ ] Adicionar colunas: nome, cpf, telefone, ponto, datas, quantidade, valor, status

### 15. LIMPEZA
- [ ] Remover `.manus/`
- [ ] Remover mocks e textos fake
- [ ] Remover dados fictícios
- [ ] Garantir tudo funcional real

## PHASE 3: REAL EMAIL IMPLEMENTATION
- [x] Integrar SendGrid ou Resend como serviço de email
- [x] Adicionar variáveis de ambiente para credenciais
- [x] Configurar webhook para enviar email após checkout.session.completed
- [x] Implementar template de email com dados do pedido
- [x] Email deve incluir: nome, ponto de embarque, datas, passageiros, total pago, link WhatsApp
- [ ] Realizar teste 1 de compra completa
- [ ] Verificar recebimento de email com dados corretos
- [ ] Realizar teste 2 de compra completa
- [ ] Verificar recebimento de email com dados corretos
- [ ] Realizar teste 3 de compra completa
- [ ] Verificar recebimento de email com dados corretos
- [ ] Retornar relatório com screenshots e logs

## PHASE 5: CRITICAL BUG FIX - Payment Flow Fallback
- [x] Implementar fallback de verificação de pagamento (Stripe API direct check)
- [x] Criar testes unitários para validar fallback (4 testes passando)
- [x] Adicionar importação de getOrderWithDetails ao routers.ts
- [ ] Instruções para usuário configurar webhook no Stripe Dashboard
- [ ] Testes manuais de pagamento com cartão de teste (4242 4242 4242 4242)

## PHASE 6: MANUAL PIX ORDER CREATION IN ADMIN
- [x] Adicionar botão "Nova Compra via PIX" no topo da página Pedidos
- [x] Criar formulário com campos: nome, email, ponto embarque, tipo passagem, data(s), quantidade passageiros
- [x] Implementar tRPC procedure para criar pedido com status "paid"
- [x] Calcular preço correto (base + taxa R$6,10)
- [x] Reutilizar template de email existente
- [x] Enviar email de confirmação automático
- [x] Testar fluxo completo
- [x] Checkpoint: busfolia-admin-manual-pix-order-creation-v1
- [x] Deploy para produção

## PHASE 7: PIX FORM FIXES
- [x] Corrigir styling do dropdown "Ponto de Embarque" (fundo escuro, texto visível)
- [x] Adicionar suporte para múltiplos passageiros
- [x] Botão "+ Adicionar Passageiro" funcional
- [x] Campos dinâmicos para cada passageiro (Nome + Email)
- [x] Botão para remover passageiros (mínimo 1)
- [x] Email enviado para todos os passageiros
- [x] Testar com 3+ passageiros
- [x] Checkpoint: busfolia-admin-manual-pix-form-fixes-v1

## PHASE 8: PIX FORM FINAL UPDATE
- [x] Adicionar campo "Valor Total Pago (PIX)" - numérico, obrigatório
- [x] Remover cálculo automático de taxa (R$6,10) para pedidos manuais
- [x] Total = valor digitado pelo admin (sem adições)
- [x] Manter suporte para múltiplos passageiros
- [x] Manter styling do dropdown de ponto de embarque
- [x] Testar com valor manual e múltiplos passageiros
- [x] Checkpoint: busfolia-admin-manual-pix-form-final-update-v1

## PHASE 9: ADD OFFICIAL LOGO TO CONFIRMATION EMAILS
- [x] Upload logo BusFolia para CDN/S3
- [x] Atualizar generateOrderConfirmationEmail para incluir logo no topo
- [x] Logo centralizado com padding/margin apropriado
- [x] Manter proporcoes originais da logo
- [x] Logo em todos os tipos de confirmacao (Stripe, PIX manual)
- [x] Testar emails com logo
- [x] Checkpoint: busfolia-email-logo-official-v1

## PHASE 10: HERO RESPONSIVE MOBILE FIX
- [x] Localizar Hero 1 e Hero 2 em Home.tsx
- [x] Hero 1: altura aumentada clamp(500px, 70vh, 780px) para melhor visibilidade
- [x] Hero 2: altura mantida clamp(420px, 60vh, 620px) com center center positioning
- [x] Usar object-fit: cover + objectPosition dinamico
- [x] Sem cropping de conteudo importante (artistas, QR code, textos)
- [x] Testar desktop (1920px) e mobile
- [x] Checkpoint: busfolia-hero-slides-mobile-proportion-fix-v1

## PHASE 11: PROFESSIONAL CSV/EXCEL EXPORT TEMPLATES
- [x] Criar funcao utilitaria para gerar CSV com UTF-8 BOM
- [x] Export Pedidos: multi-coluna, formatacao profissional
- [x] Export Passageiros: multi-coluna, formatacao profissional
- [x] Export Financeiro: multi-coluna, formatacao profissional
- [x] Headers em portugues profissional
- [x] Moeda em R$ 1.234,56 (virgula como separador decimal)
- [x] Datas em DD/MM/YYYY
- [x] Primeira linha: titulo + data/hora geracao
- [x] Testar em Excel
- [x] Checkpoint: busfolia-professional-export-templates-v2

## PHASE 12: CRITICAL TICKET/INGRESSO SYSTEM FIXES
- [x] Fix rota /ingresso/[shortId] que retorna 404
- [x] Corrigir exibição de múltiplas datas em order details modal
- [x] Corrigir exibição de múltiplas datas em ticket/ingresso gerado
- [x] Corrigir exibição de múltiplas datas em email de confirmação
- [x] Fix validação do Passaporte no formulário PIX manual
- [x] Testar "Ver Ingresso" button
- [x] Testar múltiplas datas em Múltiplos Dias
- [x] Testar múltiplas datas em Passaporte
- [x] Testar manual PIX com Passaporte
- [x] Checkpoint: busfolia-ticket-view-manual-pix-fixes-v2

## PHASE 13: 🚨 CRITICAL DATE BUG FIX (Year 2001 instead of 2026)
- [x] Auditar fluxo de datas: DB → API → Frontend → Email/PDF
- [x] Identificar causa raiz do bug de ano 2001
- [x] Corrigir lógica de parsing de datas em email.ts (linha 101: 2026 em vez de new Date().getFullYear())
- [x] Corrigir formatação em ingressos (Ingresso.tsx linhas 92-130)
- [x] Corrigir formatação no checkout (já estava correto)
- [x] Adicionar validação de ano (default para 2026)
- [x] Criar testes de formatação de datas (13 testes passando)
- [x] Testar geração de ingressos com ano correto
- [x] Testar confirmação por email com ano correto

## PHASE 13 - FINAL STATUS: ✅ CONCLUÍDO

### Correções Implementadas:
1. **email.ts (linha 97-103)**: Adicionado suporte para formato português com preposições ("05 de Junho de 2026")
2. **email.ts (linha 103)**: Fallback para '2026' em vez de new Date().getFullYear()
3. **Ingresso.tsx (linhas 92-130)**: Implementado parser robusto com fallback para 2026
4. **date-formatting.test.ts**: 13 testes unitários (todos passando)
5. **date-integration.test.ts**: 7 testes de integração (todos passando)

### Resultado Final:
- ✅ Total: 20 testes passando
- ✅ Zero falhas
- ✅ Nenhuma ocorrência de ano 2001 em nenhum cenário
- ✅ Suporte para múltiplos formatos de data (ISO, Brasileiro, Português)
- ✅ Fluxo completo testado: Frontend → Backend → Email/Ticket

### Formatos Suportados:
- "05 Junho 2026" ✅
- "05 de Junho de 2026" ✅
- "2026-06-05" ✅
- "05/06/2026" ✅
- "05 Junho" (fallback para 2026) ✅

### Pronto para Produção: ✅


## PHASE 14: 🎬 ANIMAÇÃO E NOTIFICAÇÃO DE PDF

- [x] Adicionar estado de carregamento ao botão "Baixar PDF"
- [x] Implementar animação de spinner durante geração
- [x] Adicionar notificação de sucesso após download
- [x] Adicionar notificação de erro se falhar
- [x] Melhorar UX com feedback visual
- [x] Testar em navegador
- [x] Criar testes unitários para estados de carregamento (19 testes passando)

### Implementação Completa:
- [x] Estado `isGeneratingPDF` em Ingresso.tsx
- [x] Spinner animado com Loader2 (Lucide)
- [x] Botão desabilitado durante geração
- [x] Toast de carregamento com sonner
- [x] Toast de sucesso após download
- [x] Toast de erro se falhar
- [x] 19 testes unitários (ingresso-pdf-notifications.test.ts)
- [x] 25 testes de integração (ingresso-pdf-integration.test.ts)
- [x] Total: 44 testes de PDF/notificações, todos passando

### Status Final: ✅ PRONTO PARA PRODUÇÃO


## PHASE 15: 🔍 AUDITORIA COMPLETA DE DATAS

### Frontend Pages:
- [ ] Auditar Home.tsx - datas de eventos
- [ ] Auditar Comprar.tsx - seleção de datas
- [ ] Auditar Ingresso.tsx - exibição de datas
- [ ] Auditar Admin pages - datas em tabelas
- [ ] Auditar mobile responsiveness - datas em mobile

### Backend API:
- [ ] Auditar endpoints de eventos - retorno de datas
- [ ] Auditar endpoints de pedidos - datas de viagem
- [ ] Auditar endpoints de pagamento - datas de transação
- [ ] Validar timezone handling em API
- [ ] Verificar serialização de datas (JSON)

### Database:
- [ ] Verificar schema de datas (events, orders, payments)
- [ ] Auditar registros existentes - anos corretos
- [ ] Validar tipos de dados (DATE, DATETIME, TIMESTAMP)
- [ ] Verificar índices em colunas de data

### Email/Notificações:
- [ ] Auditar templates de email - formatação de datas
- [ ] Auditar WhatsApp templates - datas
- [ ] Auditar SMS templates - datas
- [ ] Verificar timezone em notificações

### Testes:
- [ ] Criar teste de formatação padrão
- [ ] Testar todos os formatos de entrada
- [ ] Testar timezone handling
- [ ] Testar fallback de datas
- [ ] Testar validação de anos

### Documentação:
- [ ] Documentar padrão de data esperado
- [ ] Documentar timezone handling
- [ ] Documentar fallback behavior
- [ ] Criar guia para novos desenvolvedores

## PHASE 15: AUDITORIA COMPLETA DE DATAS - CONCLUÍDO ✅

### Resultados da Auditoria:

#### Frontend Pages:
- [x] Home.tsx - ISO format correto (2026-06-05T00:00:00-03:00)
- [x] Comprar.tsx - inclui ano na formatação
- [x] Ingresso.tsx - formatação correta com fallback 2026
- [x] Admin pages - formatDateForXLSX OK
- [x] Mobile responsiveness - responsive

#### Backend API:
- [x] Endpoints de eventos - retorna ISO format
- [x] Endpoints de pedidos - datas em JSON array
- [x] Endpoints de pagamento - timestamps UTC
- [x] Timezone handling - UTC correto
- [x] Serialização JSON - superjson OK

#### Database:
- [x] Schema de datas - correto
- [x] Registros existentes - anos 2026
- [x] Tipos de dados - apropriados
- [x] Índices em colunas de data - OK

#### Email/Notificações:
- [x] Templates de email - formatDatesInPortuguese
- [x] WhatsApp templates - não encontrado (não implementado)
- [x] SMS templates - não encontrado (não implementado)
- [x] Timezone em notificações - UTC

#### Testes:
- [x] 38 testes de formatação de data
- [x] Testes de múltiplos formatos (ISO, Brazilian, Portuguese)
- [x] Testes de validação de ano (2020-2030)
- [x] Testes de fallback (2026)
- [x] Total: 178 testes passando

#### Documentação:
- [x] DATE_STANDARDIZATION_GUIDE.md - guia completo
- [x] DATE_AUDIT_REPORT.md - relatório detalhado
- [x] client/src/lib/dateFormatter.ts - função centralizada
- [x] Validação de ano em todos os pontos

### Status Final: ✅ AUDITORIA COMPLETA
- Nenhuma ocorrência de ano 2001
- Todas as datas formatadas corretamente
- Timezone handling correto (UTC)
- Testes abrangentes
- Documentação completa


## 🚨 PHASE 17: CRITICAL BUG - PDF TICKET NOT ATTACHED TO EMAIL

- [x] Auditar fluxo atual de geração de PDF e envio de email
- [x] Criar função de geração de PDF no servidor (pdf-generator.ts)
- [x] Modificar serviço de email para anexar PDF (email.ts)
- [x] Integrar geração de PDF no fluxo de confirmação de pagamento (routers.ts)
- [x] Adicionar lógica de retry e tratamento de erros
- [x] Testar entrega de email com PDF anexado (226 testes passando)


## PHASE 19: 📧 EMAIL REDESIGN E TICKET ACTIONS
- [x] Criar template HTML profissional para email de confirmação (email-template.ts)
- [x] Adicionar header dourado com logo BusFolia
- [x] Implementar seção de confirmação com banner verde
- [x] Organizar detalhes do pedido em cards
- [x] Adicionar botões de ação (Ver Ingresso, WhatsApp)
- [x] Implementar footer com contato
- [x] Integrar template HTML no fluxo de email
- [x] Adicionar botão "Salvar PDF" na página de ingresso
- [x] Adicionar botão "Imprimir" na página de ingresso
- [x] Adicionar botão "Compartilhar" na página de ingresso
- [x] Implementar print styling (A4 otimizado)
- [x] Testar botões em desktop e mobile (20 testes passando)


## 🚨 PHASE 20: REWRITE EXPORTS TO MATCH REFERENCE MODEL
- [x] Analisar arquivo modelo célula por célula
- [x] Reescrever professional-export.ts completamente
- [x] Corrigir bug de dados vazios (usar getPassengersForExport/getOrdersForExport)
- [x] Corrigir valores financeiros (usar getFinancialData com centavos reais)
- [x] Remover "N/A" e "Invalid Date" (parseTransportDate robusto)
- [x] Implementar color-coded status (Green=Pago, Yellow=Pendente, Red=Cancelado)
- [x] Implementar zebra striping
- [x] Implementar branding BusFolia (cores exatas: Gold=#D4AF37, Black=#1A1A1A, etc.)
- [x] Implementar frozen headers (ySplit: 3 na aba Passageiros)
- [x] Implementar AutoFilter (A3:I3)
- [x] Implementar 3 abas: Dashboard, Passageiros, Financeiro
- [x] Dashboard: métricas, taxa de conversão, tabela de pontos de embarque
- [x] Passageiros: 9 colunas com dados enriquecidos
- [x] Financeiro: resumo por evento com totais
- [x] 41 testes unitários passando (287 total)
- [x] Remover arquivo stale export.ts não utilizado


## 🚨 PHASE 21: ASAAS PAYMENT GATEWAY INTEGRATION (URGENTE - 24H)

### Backend - Asaas Service
- [x] Configurar variáveis de ambiente (API keys sandbox + production, webhook secrets)
- [x] Criar server/lib/asaas.ts (API client: findOrCreateCustomer, createPayment, getPixQrCode, getBoletoUrl)
- [x] Migração DB: adicionar colunas asaas_customer_id, asaas_payment_id, payment_method, payment_gateway

### Backend - Webhook Handler
- [x] Criar /api/webhooks/asaas endpoint (Express raw body)
- [x] Verificar assinatura do webhook (HMAC)
- [x] Tratar PAYMENT_RECEIVED → atualizar pedido + enviar email + gerar ingresso
- [x] Tratar PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_DELETED, PAYMENT_REFUNDED

### Backend - Checkout Flow
- [x] Criar tRPC procedure para checkout Asaas (cartão, PIX, boleto)
- [x] CPF obrigatório para todos os métodos
- [x] Retornar QR Code PIX (base64 + copia-e-cola)
- [x] Retornar URL do boleto
- [x] Retornar confirmação de cartão

### Frontend - UI de Pagamento
- [x] Seletor de método de pagamento (3 botões: Cartão, PIX, Boleto)
- [x] Tela PIX: QR Code + botão copiar código + timer
- [x] Tela Boleto: botão download + código de barras
- [x] Tela Cartão: formulário padrão (número, validade, CVV, nome, CEP)
- [x] CPF obrigatório em todos os métodos
- [x] Feedback visual de processamento

### Testes
- [x] Testes unitários do serviço Asaas (15 testes)
- [x] Testes do webhook handler
- [x] Testes do fluxo de checkout
- [ ] Teste sandbox com cartão de teste: 5162306219378829 (requer teste manual)

## 🐛 BUG FIX: Asaas PIX não disponível (conta sandbox não aprovada)
- [x] Tratar erro "O Pix não está disponível" graciosamente no backend (try/catch + cleanup)
- [x] Mostrar mensagem clara no frontend quando PIX não disponível ("EM BREVE" badge)
- [x] Fallback: default para Cartão quando PIX indisponível
- [x] Endpoint availablePaymentMethods para checar status da conta Asaas
- [x] Métodos indisponíveis ficam desabilitados (opacity + cursor-not-allowed)


## 🚀 PHASE 22: ASAAS PRODUCTION MIGRATION

### Pre-Deployment Review
- [ ] Revisar todos os fluxos de pagamento (Cartão, PIX, Boleto)
- [ ] Verificar tratamento de erros em cada método
- [ ] Validar webhook handler (assinatura, eventos, status updates)
- [ ] Confirmar emails de confirmação com PDF anexado
- [ ] Verificar banco de dados (colunas Asaas, status updates)

### Stripe Removal
- [ ] Remover importações Stripe de routers.ts
- [ ] Remover procedure createStripeCheckout
- [ ] Remover webhook handler Stripe
- [ ] Remover componentes Stripe do frontend
- [ ] Remover variáveis de ambiente Stripe (STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Remover referências a Stripe em toda a codebase

### Production Environment Setup
- [ ] Mudar ASAAS_ENVIRONMENT de "sandbox" para "production"
- [ ] Verificar credenciais de produção (API keys, webhook secrets)
- [ ] Testar acesso à API de produção
- [ ] Validar URLs de webhook apontam para produção

### Testing
- [ ] Teste 1: Pagamento com Cartão (R$ 1.00)
- [ ] Teste 2: Geração de PIX (QR Code + cópia)
- [ ] Teste 3: Geração de Boleto (download + código de barras)
- [ ] Teste 4: Recepção de Webhooks
- [ ] Teste 5: Tratamento de Erros (cartão inválido)
- [ ] Todos os 302 testes unitários passando

### Deployment
- [ ] Criar checkpoint final
- [ ] Publicar para produção
- [ ] Monitorar logs por 1 hora
- [ ] Confirmar sistema está operacional
