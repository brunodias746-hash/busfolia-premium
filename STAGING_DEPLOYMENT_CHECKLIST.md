# BusFolia Premium - Staging Deployment Checklist

## Pre-Deployment Checklist

### Code Quality
- [ ] Todos os testes passam: `pnpm test`
- [ ] Sem erros de TypeScript: `pnpm type-check`
- [ ] Linting OK: `pnpm lint`
- [ ] Sem console.log ou debug code
- [ ] Commits bem descritos

### Testing
- [ ] Testado localmente em `http://localhost:3000`
- [ ] Testado em mobile (responsivo)
- [ ] Testado pagamento com Stripe (cartão 4242 4242 4242 4242)
- [ ] Testado fluxo completo de checkout
- [ ] Testado email de confirmação
- [ ] Testado cupom de desconto
- [ ] Testado logo com scroll animation

### Documentation
- [ ] README atualizado (se necessário)
- [ ] Mudanças documentadas em CHANGELOG.md
- [ ] Variáveis de ambiente documentadas

### Performance
- [ ] Build size OK: `pnpm build`
- [ ] Sem memory leaks
- [ ] Sem N+1 queries
- [ ] Imagens otimizadas

### Security
- [ ] Sem hardcoded secrets
- [ ] Sem SQL injection vulnerabilities
- [ ] CSRF protection ativo
- [ ] XSS protection ativo
- [ ] Stripe webhook signature verificado

---

## Deployment Steps

### 1. Criar Pull Request (GitHub)

```bash
# Criar PR: feature/branch-name → staging
# Descrever mudanças
# Aguardar revisão
```

### 2. Merge em Staging

```bash
git checkout staging
git merge feature/branch-name
git push user_github staging
```

### 3. Criar Checkpoint

```bash
# Via Manus UI ou CLI
webdev_save_checkpoint --description "Staging: [descrição da feature]"
```

### 4. Deploy para Staging

```bash
# Via Manus Management UI
# Clicar em "Publish" para fazer deploy
```

### 5. Verificar Deployment

- [ ] Staging está acessível: `staging.busfolia.com.br`
- [ ] Sem erros 500
- [ ] Banco de dados conectado
- [ ] Stripe webhook funcionando
- [ ] Email funcionando

---

## Post-Deployment Testing

### Funcionalidade
- [ ] Homepage carrega corretamente
- [ ] Marquee funcionando
- [ ] Logo com scroll animation
- [ ] Hero carousel funcionando
- [ ] Seções carregam corretamente

### Checkout Flow
- [ ] Step 1: Preços base SEM taxa
- [ ] Step 2: Formulário valida corretamente
- [ ] Step 3: Taxa visível + cupom funciona
- [ ] Pagamento com Stripe OK
- [ ] Success page com dados reais
- [ ] Email recebido

### Performance
- [ ] Página carrega em < 3s
- [ ] Sem console errors
- [ ] Sem memory leaks

### Responsividade
- [ ] Desktop (1920px, 1440px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Rollback Plan

Se algo der errado em staging:

```bash
# Voltar para checkpoint anterior
webdev_rollback_checkpoint --version-id <version_id>

# Ou fazer revert no git
git revert <commit-hash>
git push user_github staging
```

---

## Promoting to Production

Quando staging está estável e pronto para produção:

### 1. Final Testing
- [ ] Todos os testes passam
- [ ] Nenhum bug crítico
- [ ] Performance OK
- [ ] Stripe webhook funcionando

### 2. Create Production PR
```bash
# PR: staging → main
git checkout main
git merge staging
git push user_github main
```

### 3. Deploy to Production
```bash
# Via Manus UI
# Clicar em "Publish" para fazer deploy para produção
```

### 4. Post-Production Verification
- [ ] Produção está acessível: `busfolia.com.br`
- [ ] Stripe em modo LIVE
- [ ] Todos os testes passam
- [ ] Sem erros críticos

---

## Monitoring

### Logs
```bash
# Ver logs em tempo real
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log
```

### Alerts
- [ ] Configurar alertas de erro
- [ ] Monitorar performance
- [ ] Monitorar taxa de erro de pagamento

---

## Rollback em Produção

Se algo der errado em produção:

```bash
# Voltar para checkpoint anterior
webdev_rollback_checkpoint --version-id <version_id>

# Ou fazer revert
git revert <commit-hash>
git push user_github main
```

---

## Contacts & Escalation

- **Developer**: Bruno Dias
- **Stripe Support**: https://support.stripe.com
- **Manus Support**: https://help.manus.im

---

## Changelog

### v1.0.0 (2026-04-08)
- ✅ Logo com scroll animation
- ✅ Tax visibility (apenas em Step 3)
- ✅ Cupom de desconto
- ✅ Success page com dados reais
- ✅ Email automático
- ✅ Webhook Stripe corrigido

---

**Última atualização:** 2026-04-08
**Versão:** 1.0.0
