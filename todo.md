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
- [ ] Campo nome: validar nome + sobrenome (mínimo 2 palavras)
- [ ] Revisar validação em todos os cenários
- [ ] Testar com dados inválidos
- [ ] Testar com dados válidos

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
- [ ] Corrigir tela de sucesso (atualmente vazia/inválida)
- [ ] Mostrar resumo real da compra
- [ ] Exibir dados da passagem
- [ ] Exibir ponto de embarque
- [ ] Exibir datas selecionadas
- [ ] Exibir quantidade de passageiros
- [ ] Botão para entrar no grupo WhatsApp

## FASE 8: EMAIL AUTOMÁTICO
- [ ] Implementar envio de email após pagamento aprovado
- [ ] Incluir dados da passagem
- [ ] Incluir dias selecionados
- [ ] Incluir ponto de embarque
- [ ] Incluir quantidade de passageiros
- [ ] Incluir link do grupo
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
