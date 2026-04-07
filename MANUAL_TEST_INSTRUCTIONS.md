# BusFolia Premium - Manual Payment Flow Test Instructions

## Checkpoint Version
`manus-webdev://385e2cd7`

## Overview
This document provides step-by-step instructions for testing the complete payment flow with the new fallback verification system.

---

## STEP 1: Configure Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter:
   - **Endpoint URL:** `https://busfolia.com.br/api/webhooks/stripe`
   - **Events to send:** Select **`checkout.session.completed`** only
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_`)
6. Save this value for reference

---

## STEP 2: Complete Payment Test

### Open the checkout page
- URL: https://busfolia.com.br/comprar

### Fill out the form with test data:
- **Nome Completo:** João Silva (must be 2+ words)
- **CPF:** 123.456.789-09 (any valid format)
- **Email:** your-email@example.com (use YOUR real email to receive confirmation)
- **Telefone:** (31) 99999-9999
- **Cidade:** BH (Belo Horizonte)
- **Ponto de Embarque:** Select any available point
- **Data(s):** Select at least one date
- **Quantidade:** 1 passageiro

### Complete the checkout flow:
- Click **"Continuar"** through all steps
- Click **"Finalizar Compra"** (this opens Stripe payment modal)

### In Stripe Payment Modal:
- **Card Number:** `4242 4242 4242 4242` (test card)
- **Expiry:** Any future date (e.g., 12/26)
- **CVC:** `123` (any 3 digits)
- **Name:** João Silva
- Click **"Pay"** / **"Pagar"**

---

## STEP 3: Verify Success Page

After clicking "Pay", you should see:

### ✅ Page redirects to: `https://busfolia.com.br/sucesso`

### ✅ Success page displays:
- Order ID (e.g., "BF-XXXXX")
- Your name
- Email
- Number of passengers
- Boarding point
- Selected dates
- Total amount paid
- **"Entrar no Grupo WhatsApp"** button

### ✅ Loading screen ("Confirmando Pagamento...") should disappear within 5 seconds
- This means the fallback verification worked!

---

## STEP 4: Check Email Confirmation

Check your email inbox (the one you entered in the form):

### ✅ Email should arrive within 1-2 minutes with:
- Subject: `Confirmação de Pedido - BusFolia BF-XXXXX`
- Order ID
- Your name
- Boarding point
- Selected dates
- Number of passengers
- Total amount paid
- WhatsApp group link

---

## STEP 5: Verify Admin Panel

Go to: https://busfolia.com.br/admin/pedidos

### ✅ Your order should appear with:
- Status: **`paid`** (NOT "pending_checkout")
- Order ID matching the success page
- Your name
- Email
- Correct number of passengers
- Correct boarding point
- Correct dates

---

## Verification Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Webhook configured in Stripe | ⬜ | URL: https://busfolia.com.br/api/webhooks/stripe |
| Payment form filled correctly | ⬜ | All required fields completed |
| Stripe payment modal appears | ⬜ | Card 4242 4242 4242 4242 accepted |
| Success page loads | ⬜ | No "Confirmando Pagamento..." stuck screen |
| Success page shows order details | ⬜ | All data correct |
| Confirmation email received | ⬜ | Within 1-2 minutes |
| Email contains all order data | ⬜ | Name, dates, point, passengers, total |
| Admin shows order with status "paid" | ⬜ | Not "pending_checkout" |
| Admin shows correct passenger count | ⬜ | Matches form submission |

---

## Troubleshooting

### If success page is still stuck on "Confirmando Pagamento...":
1. Wait 10 seconds (fallback verification takes ~5-10 seconds)
2. Refresh the page (F5)
3. Check browser console for errors (F12 → Console tab)

### If email doesn't arrive:
1. Check spam/junk folder
2. Wait 5 minutes (Resend API may be slow)
3. Check the email address you entered in the form

### If admin shows status "pending_checkout":
1. This means fallback verification didn't work
2. Check if webhook is properly configured in Stripe
3. Refresh admin page (F5)

---

## Report Results

Once you complete all steps, please provide:
1. ✅ All checks passed (or any that failed)
2. Any issues encountered
3. Screenshots if needed

Then I will proceed to the next phase of implementation.
