# BusFolia Premium - Guia de Cupons com Stripe

## Visão Geral

O sistema de cupons foi integrado com o Stripe, permitindo gerenciar descontos diretamente no Stripe Dashboard sem precisar editar código.

---

## Como Criar um Cupom

### Via Stripe Dashboard

1. **Acesse o Stripe Dashboard:**
   - https://dashboard.stripe.com/
   - Vá para **Products** → **Coupons**

2. **Clique em "Create coupon"**

3. **Preencha os dados:**

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| **Coupon code** | DESCONTO15 | Código que o cliente usa (ex: DESCONTO15) |
| **Discount type** | Percentage | Percentual ou valor fixo |
| **Discount value** | 15 | 15% de desconto |
| **Duration** | Forever | Válido para sempre (ou escolha período) |
| **Max redemptions** | 100 | Limite de uso (opcional) |

4. **Clique em "Create coupon"**

---

## Exemplos de Cupons

### Exemplo 1: Desconto de 10%

```
Coupon code: DESCONTO10
Discount type: Percentage
Discount value: 10%
Duration: Forever
Max redemptions: Ilimitado
```

### Exemplo 2: Desconto de R$ 20,00

```
Coupon code: DESCONTO20REAIS
Discount type: Fixed amount
Discount value: R$ 20,00
Duration: Forever
Max redemptions: Ilimitado
```

### Exemplo 3: Black Friday (25% por 30 dias)

```
Coupon code: BLACKFRIDAY25
Discount type: Percentage
Discount value: 25%
Duration: Repeating (30 days)
Max redemptions: 500
```

### Exemplo 4: Primeira Compra (5% off)

```
Coupon code: PRIMEIRACOMPRA
Discount type: Percentage
Discount value: 5%
Duration: Forever
Max redemptions: 1000
```

---

## Como os Clientes Usam

### No Checkout

1. Cliente vai para `/comprar`
2. Preenche dados (nome, CPF, etc)
3. Chega em **Step 3 (Pagamento)**
4. Vê campo "Cupom de Desconto"
5. Digita o código (ex: `DESCONTO10`)
6. Clica em "Aplicar"
7. Se válido, desconto é aplicado
8. Clica em "Pagar com Stripe"
9. No Stripe Checkout, o desconto já está aplicado

---

## Fluxo Técnico

### 1. Frontend (Comprar.tsx)

```typescript
// Campo de cupom visível em Step 3
<input 
  type="text" 
  value={couponCode}
  onChange={(e) => setCouponCode(e.target.value)}
  placeholder="Ex: DESCONTO10"
/>
<button onClick={handleApplyCoupon}>Aplicar</button>
```

### 2. Backend (routers.ts)

```typescript
// Cupom é enviado para o Stripe
const session = await stripe.checkout.sessions.create({
  // ... outras opções
  discounts: [{ coupon: input.couponCode }],
  allow_promotion_codes: true,
});
```

### 3. Stripe Checkout

```
Subtotal: R$ 206,10
Desconto (DESCONTO10): -R$ 20,61
Total: R$ 185,49
```

---

## Gerenciar Cupons Existentes

### Ver Cupons Criados

1. Acesse Stripe Dashboard
2. Vá para **Products** → **Coupons**
3. Veja lista de todos os cupons
4. Clique em um cupom para ver detalhes

### Editar Cupom

⚠️ **Nota:** Stripe não permite editar cupons após criação. Você pode:
- Desativar um cupom (Archive)
- Criar um novo cupom com diferentes parâmetros

### Desativar Cupom

1. Vá para **Products** → **Coupons**
2. Clique no cupom
3. Clique em **Archive**
4. Confirme

---

## Monitoramento

### Ver Uso de Cupons

1. Acesse Stripe Dashboard
2. Vá para **Products** → **Coupons**
3. Veja coluna "Redeemed" (quantas vezes foi usado)
4. Clique no cupom para ver histórico

### Relatório de Vendas

1. Vá para **Payments**
2. Filtre por período
3. Veja descontos aplicados em cada transação

---

## Troubleshooting

### Cupom não funciona

**Possíveis causas:**
- Cupom não existe no Stripe
- Cupom foi arquivado (desativado)
- Limite de uso foi atingido
- Cupom expirou (se tiver data de validade)

**Solução:**
1. Verifique no Stripe Dashboard se cupom existe
2. Verifique se está ativo (não arquivado)
3. Verifique "Max redemptions"
4. Crie um novo cupom se necessário

### Desconto não aparece no Stripe Checkout

**Possíveis causas:**
- Cupom foi digitado errado
- Cupom não existe
- Frontend não está enviando cupom

**Solução:**
1. Verifique se cupom existe no Stripe
2. Verifique se código está correto (case-sensitive)
3. Verifique logs do navegador (F12 → Console)

---

## Boas Práticas

### Nomes de Cupons

- Use nomes descritivos: `DESCONTO10`, `BLACKFRIDAY`, `PRIMEIRACOMPRA`
- Evite espaços e caracteres especiais
- Use MAIÚSCULAS para fácil leitura
- Inclua o percentual no nome: `DESCONTO15` (15% off)

### Limites de Uso

- Para cupons permanentes: deixe "Max redemptions" vazio
- Para promoções limitadas: defina limite (ex: 100 usos)
- Para cupons de teste: defina limite baixo (ex: 5 usos)

### Datas de Validade

- Cupons permanentes: Duration = "Forever"
- Promoções sazonais: Duration = "Repeating" + período
- Black Friday: Duration = "Repeating" (30 days)

---

## Exemplos de Campanhas

### Campanha 1: Desconto Permanente

```
DESCONTO10 → 10% off (sempre ativo)
DESCONTO15 → 15% off (sempre ativo)
```

### Campanha 2: Primeira Compra

```
PRIMEIRACOMPRA → 5% off (limite: 500 usos)
```

### Campanha 3: Black Friday

```
BLACKFRIDAY25 → 25% off (30 dias, limite: 1000 usos)
```

### Campanha 4: Referência

```
AMIGO10 → 10% off (limite: ilimitado)
```

---

## Suporte

- **Stripe Docs:** https://stripe.com/docs/billing/coupons-and-discounts
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Manus Support:** https://help.manus.im

---

**Última atualização:** 2026-04-08  
**Versão:** 1.0.0
