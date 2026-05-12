# Asaas API Reference Notes

## Base URLs
- Sandbox: https://api-sandbox.asaas.com/v3
- Production: https://api.asaas.com/v3

## Authentication
- Header: `access_token: {API_KEY}`
- Header: `User-Agent: BusFolia/1.0.0`

## Create Customer
POST /customers
```json
{
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "email": "joao@example.com",
  "phone": "31999999999"
}
```

## Create Payment (Cobrança)
POST /payments
```json
{
  "customer": "cus_xxxx",
  "billingType": "PIX|CREDIT_CARD|BOLETO|UNDEFINED",
  "value": 60.00,
  "dueDate": "2026-06-05",
  "description": "BusFolia - Transporte PLRS 2026",
  "externalReference": "order_123"
}
```

### For Credit Card (separate endpoint)
POST /payments (with creditCard + creditCardHolderInfo objects)
OR use "Criar cobrança com cartão de crédito" endpoint

## Get PIX QR Code
GET /payments/{id}/pixQrCode
Response: { encodedImage: "base64...", payload: "copy-paste-code", expirationDate: "..." }

## Get Boleto
GET /payments/{id}/identificationField
Response: { identificationField: "linha digitável", nossoNumero: "..." }
Also: payment.bankSlipUrl for PDF download

## Webhook Events
- PAYMENT_CONFIRMED - Payment confirmed by Asaas
- PAYMENT_RECEIVED - Payment received (TRIGGER EMAIL + PDF)
- PAYMENT_OVERDUE - Payment overdue
- PAYMENT_DELETED - Payment cancelled
- PAYMENT_REFUNDED - Payment refunded

## Webhook Payload
```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_xxxx",
    "customer": "cus_xxxx",
    "value": 60.00,
    "billingType": "PIX",
    "status": "RECEIVED",
    "externalReference": "order_123",
    ...
  }
}
```

## Webhook Signature Verification
Header: `asaas-access-token` contains the webhook secret token
Compare with stored webhook secret

## Test Card
Number: 5162306219378829
Name: Any
Expiry: Any future date
CVV: Any 3 digits

## Payment Fees
- Credit Card: 2.99% + R$0.49
- PIX: FREE (R$0.00)
- Boleto: R$1.99
