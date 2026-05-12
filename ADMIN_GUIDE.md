# 📊 BusFolia Admin Guide

**Last Updated:** May 12, 2026  
**Version:** 1.0  

---

## Quick Start

### Admin Panel URL
```
https://busfolia.com.br/admin
```

### Login
1. Go to https://busfolia.com.br/admin
2. Click "Login with Manus"
3. Use your Manus account email and password
4. You'll be redirected to the admin dashboard

---

## Dashboard Overview

### Main Metrics (Top of Page)
- **Total Orders:** Total number of orders received
- **Total Revenue:** Sum of all payments received
- **Payment Success Rate:** Percentage of successful payments
- **Email Delivery Rate:** Percentage of emails delivered

### Recent Orders (Center)
- Last 10 orders displayed
- Shows: Order ID, Customer Name, Date, Amount, Status
- Click any order to see full details

### Quick Actions (Right Sidebar)
- Export to Excel
- View all orders
- View all customers
- View system logs

---

## Orders Management

### View All Orders
1. Click "Pedidos" in left menu
2. See list of all orders
3. Orders show:
   - Order ID
   - Customer name
   - Passenger name
   - Date of travel
   - Boarding point
   - Amount paid
   - Payment method
   - Order status (Pago, Pendente, Cancelado)
   - Date of purchase

### Filter Orders
1. Go to Pedidos
2. Use filters at top:
   - **Status:** Pago / Pendente / Cancelado
   - **Date Range:** Select start and end date
   - **Payment Method:** PIX / Cartão / Boleto
3. Click "Filtrar" to apply

### Search Orders
1. Go to Pedidos
2. Use search box at top
3. Search by:
   - Order ID
   - Customer email
   - Customer phone
   - Passenger name

### View Order Details
1. Go to Pedidos
2. Click on any order
3. See full order information:
   - **Buyer Information**
     - Name
     - CPF
     - Email
     - Phone
     - Boarding point
   - **Passenger Information**
     - Name
     - CPF
   - **Payment Information**
     - Amount
     - Payment method
     - Asaas payment ID
     - Payment status
     - Payment date
   - **Order Information**
     - Order ID
     - Order date
     - Travel date(s)
     - Ticket type

### Export Order
1. Go to Pedidos
2. Click on any order
3. Click "Download Comprovante" button
4. File will download as PDF

---

## Customer Management

### View All Customers
1. Click "Clientes" in left menu
2. See list of all customers
3. Customers show:
   - Name
   - Email
   - Phone
   - Number of orders
   - Total spent
   - Last order date

### Search Customers
1. Go to Clientes
2. Use search box
3. Search by:
   - Name
   - Email
   - Phone

### View Customer Details
1. Go to Clientes
2. Click on any customer
3. See:
   - Customer information
   - All orders from this customer
   - Total spent
   - Contact information

---

## Data Export

### Export to Excel
1. Click "Exportar" in left menu
2. Choose export type:
   - **Dashboard:** Metrics and summary
   - **Passageiros:** All passengers with details
   - **Financeiro:** Financial summary
3. Click "Exportar"
4. File will download as .xlsx

### Export Features
- Professional formatting
- Color-coded status
- Zebra striping for readability
- Frozen headers
- AutoFilter enabled
- Charts and visualizations
- Currency formatting (R$)

---

## Event Management

### View Events
1. Click "Eventos" in left menu
2. See list of all events
3. Events show:
   - Event name
   - Event date
   - Total orders
   - Total revenue
   - Status

### Create Event
1. Click "Eventos"
2. Click "Novo Evento"
3. Fill in:
   - Event name
   - Event dates
   - Boarding points
   - Prices
   - Banner image
4. Click "Criar"

### Edit Event
1. Go to Eventos
2. Click on any event
3. Click "Editar"
4. Update information
5. Click "Salvar"

### Upload Banner
1. Go to Eventos
2. Click on event
3. Click "Upload Banner"
4. Select image (recommended: 1920x780px)
5. Image will appear on homepage

---

## Monitoring & Logs

### View System Logs
1. Click "Logs" in left menu
2. See recent system events
3. Filter by:
   - **Level:** Info / Warning / Error / Critical
   - **Date Range:** Select dates
   - **Source:** Payment / Email / Webhook / Database

### View Error Logs
1. Go to Logs
2. Filter by Level = "Error"
3. See all errors with:
   - Timestamp
   - Error message
   - Stack trace
   - Affected component

### View Payment Logs
1. Go to Logs
2. Filter by Source = "Payment"
3. See all payment events:
   - Payment created
   - Payment confirmed
   - Payment failed
   - Webhook received

### View Email Logs
1. Go to Logs
2. Filter by Source = "Email"
3. See all email events:
   - Email sent
   - Email delivered
   - Email bounced
   - Email opened

---

## Key Metrics Explained

### Payment Success Rate
- **Definition:** Percentage of payment attempts that succeeded
- **Target:** > 95%
- **If Below Target:** Check Asaas dashboard for payment issues

### Email Delivery Rate
- **Definition:** Percentage of emails that were delivered
- **Target:** > 99%
- **If Below Target:** Check email logs for bounced emails

### Webhook Success Rate
- **Definition:** Percentage of webhook events processed successfully
- **Target:** > 99%
- **If Below Target:** Check webhook logs for failed events

### Average Order Value
- **Definition:** Total revenue / Total orders
- **Helps:** Understand customer spending patterns

### Conversion Rate
- **Definition:** Orders completed / Checkout sessions started
- **Target:** > 70%
- **If Below Target:** Check for form validation issues

---

## Troubleshooting

### No Orders Appearing
1. Check if event is active
2. Check if checkout page is accessible
3. Check if payment gateway is configured
4. Check error logs for issues

### Emails Not Sending
1. Check email logs
2. Verify email addresses are valid
3. Check if email template is configured
4. Verify Resend API key is active

### Payments Not Processing
1. Check Asaas dashboard
2. Verify webhook endpoint is accessible
3. Check webhook logs for errors
4. Verify payment method is enabled

### Webhook Events Not Received
1. Check webhook URL is correct
2. Verify webhook secret is correct
3. Check firewall/security settings
4. Contact Asaas support if issue persists

---

## Regular Maintenance

### Daily Tasks
- [ ] Check dashboard metrics
- [ ] Review new orders
- [ ] Check error logs
- [ ] Verify payment success rate

### Weekly Tasks
- [ ] Export data for backup
- [ ] Review customer feedback
- [ ] Check payment method distribution
- [ ] Verify email delivery rate

### Monthly Tasks
- [ ] Analyze sales trends
- [ ] Review customer testimonials
- [ ] Plan marketing campaigns
- [ ] Update event information

---

## Security Best Practices

### Protect Your Account
- ✅ Use strong password
- ✅ Enable two-factor authentication (if available)
- ✅ Don't share login credentials
- ✅ Log out when finished

### Protect Customer Data
- ✅ Don't share customer information
- ✅ Don't export data unnecessarily
- ✅ Secure exported files
- ✅ Delete old exports

### Secure Payment Information
- ✅ Never store card numbers
- ✅ Never share payment IDs
- ✅ Use HTTPS always
- ✅ Report suspicious activity

---

## Support & Help

### Getting Help
1. Check this guide first
2. Check FAQ section in admin panel
3. Contact Manus support: https://help.manus.im
4. For urgent issues, call support number

### Reporting Issues
1. Go to Admin Dashboard
2. Click "Support"
3. Describe the issue
4. Include screenshots if possible
5. Submit

### Response Times
- **Non-Critical:** 4-8 hours
- **Critical (Payment Down):** < 1 hour
- **Emergency:** Immediate

---

## Frequently Asked Questions

### Q: How do I add a new event?
**A:** Click "Eventos" → "Novo Evento" → Fill in details → "Criar"

### Q: How do I view customer information?
**A:** Click "Clientes" → Search for customer → Click to view details

### Q: How do I export data?
**A:** Click "Exportar" → Choose export type → "Exportar"

### Q: How do I check if payments are processing?
**A:** Click "Logs" → Filter by "Payment" → View recent events

### Q: What should I do if an order fails?
**A:** Check error logs, verify payment method, contact customer

### Q: How do I update event information?
**A:** Click "Eventos" → Click event → "Editar" → Update → "Salvar"

### Q: How do I upload a banner image?
**A:** Click "Eventos" → Click event → "Upload Banner" → Select image

### Q: What's the recommended banner size?
**A:** 1920x780 pixels (16:9 aspect ratio)

### Q: How do I filter orders by date?
**A:** Click "Pedidos" → Use date range filter at top → "Filtrar"

### Q: How do I search for a specific order?
**A:** Click "Pedidos" → Use search box → Enter order ID or email

---

## Contact Information

### Manus Support
- **Website:** https://help.manus.im
- **Email:** support@manus.im
- **Response Time:** 4-8 hours

### Asaas Support (Payment Issues)
- **Website:** https://www.asaas.com/support
- **Email:** suporte@asaas.com
- **Phone:** +55 31 3030-5000

### Emergency Support
- **Critical Issues:** Contact Manus support immediately
- **Available:** 24/7 for critical issues
- **Response Time:** < 1 hour

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 12, 2026 | Initial release |

---

**Last Updated:** May 12, 2026  
**Next Review:** June 12, 2026

