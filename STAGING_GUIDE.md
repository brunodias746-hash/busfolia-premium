# BusFolia Premium - Staging Environment Guide

## Overview

O ambiente de **staging** é um clone de produção onde você pode testar novas funcionalidades, melhorias e correções sem afetar o site em produção (busfolia.com.br).

**Branches:**
- `main` → Produção (busfolia.com.br)
- `staging` → Testes/Staging (staging.busfolia.com.br)

---

## Setup do Ambiente de Staging

### 1. Clonar o Repositório (se necessário)

```bash
git clone https://github.com/brunodias746-hash/busfolia-premium.git
cd busfolia-premium
```

### 2. Criar/Atualizar Branch Staging

```bash
# Checkout na branch staging
git checkout staging

# Sincronizar com main (quando houver atualizações)
git merge main
git push user_github staging
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.staging.example .env.staging

# Editar com valores de staging
nano .env.staging
```

**Valores importantes para staging:**
- `STRIPE_SECRET_KEY`: Use **sk_test_** (test mode)
- `DATABASE_URL`: Aponte para banco de dados de staging
- `NODE_ENV`: staging
- `DEBUG`: true (para logs detalhados)

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Iniciar Dev Server de Staging

```bash
pnpm dev
```

O servidor estará disponível em: `http://localhost:3000`

---

## Workflow de Desenvolvimento em Staging

### 1. Criar Feature Branch

```bash
# A partir de staging
git checkout staging
git pull user_github staging

# Criar nova branch para feature
git checkout -b feature/nova-funcionalidade
```

### 2. Fazer Alterações

```bash
# Editar arquivos conforme necessário
# Testar localmente em http://localhost:3000
```

### 3. Commit e Push

```bash
git add .
git commit -m "feat: descrição da nova funcionalidade"
git push user_github feature/nova-funcionalidade
```

### 4. Criar Pull Request

- Abrir PR no GitHub: `feature/nova-funcionalidade` → `staging`
- Descrever mudanças e testar
- Merge após aprovação

### 5. Deploy para Staging

```bash
# Após merge em staging
git checkout staging
git pull user_github staging

# Fazer checkpoint
pnpm run checkpoint

# Deploy (via Manus UI ou CLI)
```

---

## Testando em Staging

### Pagamentos com Stripe (Test Mode)

Use cartão de teste: **4242 4242 4242 4242**

**Outros cartões de teste:**
- Visa: 4242 4242 4242 4242
- Mastercard: 5555 5555 5555 4444
- Amex: 378282246310005

Qualquer data futura e CVC (ex: 12/25, 123)

### Email em Staging

Emails de teste são capturados em modo sandbox. Verifique:
- Logs do servidor: `pnpm logs`
- Dashboard Resend (se configurado)

### Banco de Dados

Use banco de dados separado para staging:
- Produção: `busfolia_prod`
- Staging: `busfolia_staging`

---

## Sincronizando Staging com Main

Quando você quer trazer atualizações de produção para staging:

```bash
git checkout staging
git merge main
git push user_github staging
```

---

## Promovendo Staging para Produção

Quando a feature está pronta para produção:

```bash
# 1. Criar PR: staging → main
git checkout main
git pull user_github main
git merge staging
git push user_github main

# 2. Deploy para produção (via Manus UI)
```

---

## Troubleshooting

### Erro: "Branch staging não existe"

```bash
git fetch user_github
git checkout -b staging user_github/staging
```

### Erro: "Conflitos ao fazer merge"

```bash
# Ver conflitos
git status

# Resolver manualmente, depois:
git add .
git commit -m "resolve: conflitos de merge"
git push user_github feature/branch-name
```

### Stripe não funciona em staging

- Verifique se `STRIPE_SECRET_KEY` começa com `sk_test_`
- Verifique se `VITE_STRIPE_PUBLISHABLE_KEY` começa com `pk_test_`
- Reinicie o servidor: `pnpm dev`

### Email não é enviado

- Verifique `RESEND_API_KEY` em `.env.staging`
- Verifique logs: `pnpm logs | grep -i email`

---

## Ambiente de Staging vs Produção

| Aspecto | Staging | Produção |
|--------|---------|----------|
| Branch | `staging` | `main` |
| Domínio | staging.busfolia.com.br | busfolia.com.br |
| Stripe | Test Mode (sk_test_) | Live Mode (sk_live_) |
| Banco de Dados | busfolia_staging | busfolia_prod |
| Emails | Sandbox/Test | Real |
| Debug | Ativado | Desativado |
| Logs | Detalhados | Normais |

---

## Boas Práticas

1. **Sempre testar em staging antes de produção**
2. **Usar branches descritivas**: `feature/`, `fix/`, `hotfix/`
3. **Fazer commits pequenos e descritivos**
4. **Testar pagamentos com cartão de teste**
5. **Verificar logs antes de fazer deploy**
6. **Criar checkpoint antes de merge em main**
7. **Documentar mudanças significativas**

---

## Contato & Suporte

Para dúvidas sobre o ambiente de staging, consulte:
- Documentação: `/STAGING_GUIDE.md`
- Logs: `.manus-logs/`
- GitHub: https://github.com/brunodias746-hash/busfolia-premium
