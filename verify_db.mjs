import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
});

try {
  console.log('=== VERIFICAÇÃO ETAPA A - PRODUÇÃO ===\n');

  // 1. Verificar colunas
  console.log('1. Colunas da tabela orders:');
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'orders' AND COLUMN_NAME IN ('transportDates', 'transportDate', 'purchaseType', 'status')
    ORDER BY COLUMN_NAME
  `);
  console.table(columns);

  // 2. Verificar enum status
  console.log('\n2. Valores do enum status:');
  const [statusEnum] = await connection.execute(`
    SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'status'
  `);
  console.table(statusEnum);

  // 3. Contar antigos
  console.log('\n3. Registros com transportDate (antigos):');
  const [oldCount] = await connection.execute(`
    SELECT COUNT(*) as count FROM orders WHERE transportDate IS NOT NULL
  `);
  console.table(oldCount);

  // 4. Contar novos
  console.log('\n4. Registros com transportDates (novos):');
  const [newCount] = await connection.execute(`
    SELECT COUNT(*) as count FROM orders WHERE transportDates IS NOT NULL
  `);
  console.table(newCount);

  // 5. Amostra de dados
  console.log('\n5. Amostra de pedidos (últimos 5):');
  const [orders] = await connection.execute(`
    SELECT id, purchaseType, status, transportDate, transportDates FROM orders ORDER BY id DESC LIMIT 5
  `);
  console.table(orders);

  // 6. Integridade dos dados migrados
  console.log('\n6. Integridade dos dados migrados:');
  const [integrity] = await connection.execute(`
    SELECT 
      id,
      purchaseType,
      status,
      transportDate,
      JSON_LENGTH(transportDates) as num_dates,
      transportDates
    FROM orders 
    WHERE transportDates IS NOT NULL
    LIMIT 5
  `);
  console.table(integrity);

  console.log('\n✅ Verificação concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro:', error.message);
} finally {
  await connection.end();
}
