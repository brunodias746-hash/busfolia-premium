-- Verificação ETAPA A - Produção
-- Confirmar que todas as colunas existem e dados foram migrados corretamente

-- 1. Verificar se coluna transportDates existe
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'orders' AND COLUMN_NAME IN ('transportDates', 'transportDate', 'purchaseType', 'status')
ORDER BY COLUMN_NAME;

-- 2. Verificar status enum values
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'status';

-- 3. Contar registros com transportDate preenchido (antigos)
SELECT COUNT(*) as old_transportDate_count FROM orders WHERE transportDate IS NOT NULL;

-- 4. Contar registros com transportDates preenchido (novos)
SELECT COUNT(*) as migrated_dates_count FROM orders WHERE transportDates IS NOT NULL;

-- 5. Verificar se os 2 pedidos foram migrados
SELECT id, purchaseType, status, transportDate, transportDates FROM orders LIMIT 5;

-- 6. Verificar integridade dos dados migrados
SELECT 
  id,
  purchaseType,
  status,
  transportDate,
  JSON_LENGTH(transportDates) as num_dates,
  transportDates
FROM orders 
WHERE transportDates IS NOT NULL
LIMIT 5;
