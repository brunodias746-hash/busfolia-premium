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
