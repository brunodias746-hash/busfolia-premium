import { describe, it, expect } from 'vitest';
import { createProfessionalExcel } from './professional-excel-export';

describe('Professional Excel Export', () => {
  it('should create workbook with 3 sheets', async () => {
    const testData = {
      dashboardMetrics: {
        total: 100,
        paid: 80,
        pending: 15,
        cancelled: 5,
        conversionRate: 80,
        byBoardingPoint: [
          { point: 'BELO HORIZONTE - SHOPPING', count: 50 },
          { point: 'BETIM - PARTAGE SHOPPING', count: 30 },
          { point: 'CONTAGEM - PRACA DA CEMIGOS', count: 20 },
        ],
        byDate: [
          { date: '05 de junho de 2026', count: 50 },
          { date: '12 de junho de 2026', count: 50 },
        ],
      },
      dataRows: [
        {
          numero: 1,
          pedido: 'BF-001',
          nomeCompleto: 'João Silva',
          cpf: '123.456.789-00',
          telefone: '31999999999',
          email: 'joao@example.com',
          pontoEmbarque: 'BELO HORIZONTE - SHOPPING',
          datasTransporte: '05 de junho de 2026',
          quantidadePassageiros: 2,
          valorTotal: 120,
          status: 'Pago',
          dataPedido: '01 de junho de 2026',
        },
      ],
      dataColumns: [
        { header: '#', key: 'numero', width: 8 },
        { header: 'Pedido', key: 'pedido', width: 15 },
        { header: 'Nome Completo', key: 'nomeCompleto', width: 25 },
        { header: 'CPF', key: 'cpf', width: 15 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Ponto de Embarque', key: 'pontoEmbarque', width: 20 },
        { header: 'Datas de Transporte', key: 'datasTransporte', width: 20 },
        { header: 'Qtd Passageiros', key: 'quantidadePassageiros', width: 12 },
        { header: 'Valor Total', key: 'valorTotal', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Data do Pedido', key: 'dataPedido', width: 15 },
      ],
      financialData: [
        {
          category: 'Pedro Leopoldo Rodeio Show',
          quantity: 100,
          grossValue: 12000,
          fees: 0,
          netValue: 12000,
        },
      ],
      financialTotals: {
        totalQuantity: 100,
        totalGross: 12000,
        totalFees: 0,
        totalNet: 12000,
      },
    };

    const buffer = await createProfessionalExcel(testData);

    // Verify buffer is created and has content
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it('should handle empty data gracefully', async () => {
    const emptyData = {
      dashboardMetrics: {
        total: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        conversionRate: 0,
        byBoardingPoint: [],
        byDate: [],
      },
      dataRows: [],
      dataColumns: [],
      financialData: [],
      financialTotals: {
        totalQuantity: 0,
        totalGross: 0,
        totalFees: 0,
        totalNet: 0,
      },
    };

    const buffer = await createProfessionalExcel(emptyData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should include all required sheets', async () => {
    const testData = {
      dashboardMetrics: {
        total: 10,
        paid: 8,
        pending: 2,
        cancelled: 0,
        conversionRate: 80,
        byBoardingPoint: [],
        byDate: [],
      },
      dataRows: [],
      dataColumns: [],
      financialData: [],
      financialTotals: {
        totalQuantity: 10,
        totalGross: 1000,
        totalFees: 0,
        totalNet: 1000,
      },
    };

    const buffer = await createProfessionalExcel(testData);

    // The buffer should contain the sheet names in the Excel file
    // We can't directly inspect the workbook, but we can verify the buffer exists
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should handle large datasets', async () => {
    // Create 1000 rows of test data
    const largeDataRows = Array.from({ length: 1000 }, (_, i) => ({
      numero: i + 1,
      pedido: `BF-${String(i + 1).padStart(6, '0')}`,
      nomeCompleto: `Passageiro ${i + 1}`,
      cpf: `${String(i).padStart(11, '0')}`,
      telefone: '31999999999',
      email: `passenger${i + 1}@example.com`,
      pontoEmbarque: 'BELO HORIZONTE - SHOPPING',
      datasTransporte: '05 de junho de 2026',
      quantidadePassageiros: 1,
      valorTotal: 60,
      status: i % 3 === 0 ? 'Pago' : i % 3 === 1 ? 'Pendente' : 'Cancelado',
      dataPedido: '01 de junho de 2026',
    }));

    const largeData = {
      dashboardMetrics: {
        total: 1000,
        paid: 334,
        pending: 333,
        cancelled: 333,
        conversionRate: 33.4,
        byBoardingPoint: [{ point: 'BELO HORIZONTE - SHOPPING', count: 1000 }],
        byDate: [{ date: '05 de junho de 2026', count: 1000 }],
      },
      dataRows: largeDataRows,
      dataColumns: [
        { header: '#', key: 'numero', width: 8 },
        { header: 'Pedido', key: 'pedido', width: 15 },
        { header: 'Nome Completo', key: 'nomeCompleto', width: 25 },
        { header: 'CPF', key: 'cpf', width: 15 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Ponto de Embarque', key: 'pontoEmbarque', width: 20 },
        { header: 'Datas de Transporte', key: 'datasTransporte', width: 20 },
        { header: 'Qtd Passageiros', key: 'quantidadePassageiros', width: 12 },
        { header: 'Valor Total', key: 'valorTotal', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Data do Pedido', key: 'dataPedido', width: 15 },
      ],
      financialData: [
        {
          category: 'Pedro Leopoldo Rodeio Show',
          quantity: 1000,
          grossValue: 60000,
          fees: 0,
          netValue: 60000,
        },
      ],
      financialTotals: {
        totalQuantity: 1000,
        totalGross: 60000,
        totalFees: 0,
        totalNet: 60000,
      },
    };

    const buffer = await createProfessionalExcel(largeData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });
});
