# Reference Model Analysis

## Sheets Structure
1. **📊 Dashboard** - Metrics + Boarding Points Table
2. **👥 Passageiros** - Full passenger list with 9 columns
3. **💰 Financeiro** - Financial summary with formulas

## Dashboard Sheet
- Row 1: "BUSFOLIA - RELATÓRIO DE PASSAGEIROS" (bg: #1A1A1A, font: Arial/24/bold/white)
- Row 2: "Transporte Premium para Eventos" (bg: #1A1A1A, font: Arial/12/white)
- Row 3: Empty
- Row 4: Metric cards (merged cells):
  - A4: "Total Passageiros" (bg: #1A1A1A, font: Arial/10/white) → A5: "80" (bg: #1A1A1A, font: Arial/36/bold/white)
  - C4: "Pagos" (bg: #10B981, font: Arial/10/white) → C5: "31" (bg: #10B981, font: Arial/36/bold/white)
  - E4: "Aguardando" (bg: #FCD34D, font: Arial/10/#1A1A1A) → E5: "45" (bg: #FCD34D, font: Arial/36/bold/#1A1A1A)
  - G4: "Cancelados" (bg: #EF4444, font: Arial/10/white) → G5: "4" (bg: #EF4444, font: Arial/36/bold/white)
- Row 7: "Taxa de Conversão" (bg: #D4AF37, font: Arial/14/bold/white) → "38.8%" (bg: #D4AF37, font: Arial/14/bold/white)
- Row 9: "PASSAGEIROS POR PONTO DE EMBARQUE" (bg: #B8941F, font: Arial/12/bold/white)
- Row 10: Headers: "Ponto de Embarque" | "Quantidade" | "%" (bg: #1A1A1A, font: Arial/11/bold/white)
- Rows 11+: Data rows with zebra striping (#F5F5F5 alternating)
- Chart: Pie chart for boarding point distribution

## Passageiros Sheet
- Row 1: "BUSFOLIA - LISTA DE PASSAGEIROS" (bg: #1A1A1A, font: Arial/16/bold/white) - merged A1:I1
- Row 2: Empty
- Row 3: Headers (bg: #D4AF37, font: Arial/11/bold/white):
  - A: # | B: Nome | C: CPF | D: Evento | E: Pedido | F: Status | G: Ponto de Embarque | H: Data Viagem | I: Ingresso
- Frozen panes: A4 (freeze row 3)
- AutoFilter: A3:I3
- Data rows: Zebra striping (#F5F5F5 alternating)
- Status colors:
  - "Pago" → bg: #10B981, font: bold/white
  - "Aguardando Pagamento" → bg: #FCD34D, font: bold/#1A1A1A
  - "Cancelado" → bg: #EF4444, font: bold/white

## Financeiro Sheet
- Row 1: "RELATÓRIO FINANCEIRO" (bg: #1A1A1A, font: Arial/18/bold/white) - merged A1:F1
- Row 3: "RESUMO FINANCEIRO" (bg: #B8941F, font: Arial/14/bold/white) - merged A3:F3
- Row 4: Headers (bg: #1A1A1A, font: Arial/11/bold/white):
  - A: Categoria | B: Quantidade | C: Valor Bruto (R$) | D: Taxa Stripe (R$) | E: Valor Líquido (R$)
- Rows 5-7: Data with formulas (=B5*60, =C5*0.1, =C5-D5)
- Row 8: "TOTAL CONFIRMADO" (bg: #10B981, font: Arial/12/bold/white) with formulas

## Color Palette
- Gold: #D4AF37
- Dark Gold: #B8941F
- Black: #1A1A1A
- Green: #10B981
- Yellow: #FCD34D
- Red: #EF4444
- Light Gray: #F5F5F5
- White: #FFFFFF
