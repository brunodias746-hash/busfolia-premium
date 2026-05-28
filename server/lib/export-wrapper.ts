/**
 * Export wrapper that converts data to professional 3-tab Excel format
 */

import { createProfessionalExcel, ExportData } from './professional-excel-export';

export interface OrderExportRow {
  pedido: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  pontoEmbarque: string;
  datasTransporte: string;
  quantidadePassageiros: number;
  valorTotal: number;
  status: string;
  dataPedido: string;
}

export interface PassengerExportRow {
  numero: number;
  nome: string;
  cpf: string;
  evento: string;
  pedido: string;
  status: string;
  pontoEmbarque: string;
  dataViagem: string;
  ingresso: string;
}

export interface FinancialExportRow {
  categoria: string;
  quantidade: number;
  valorBruto: number;
  taxa: number;
  valorLiquido: number;
}

/**
 * Convert order export data to professional Excel format
 */
export async function exportOrdersAsProfessional(
  orders: OrderExportRow[],
  financialSummary: FinancialExportRow[]
): Promise<Buffer> {
  // Calculate dashboard metrics
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === 'Pago').length;
  const pendingOrders = orders.filter(o => o.status === 'Pendente' || o.status === 'Aguardando Pagamento').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelado').length;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

  // Group by boarding point
  const byBoardingPoint: { [key: string]: number } = {};
  orders.forEach(o => {
    byBoardingPoint[o.pontoEmbarque] = (byBoardingPoint[o.pontoEmbarque] || 0) + 1;
  });

  // Group by date
  const byDate: { [key: string]: number } = {};
  orders.forEach(o => {
    const dates = o.datasTransporte.split(',').map(d => d.trim());
    dates.forEach(d => {
      byDate[d] = (byDate[d] || 0) + 1;
    });
  });

  // Calculate financial totals
  const totalQuantity = financialSummary.reduce((sum, row) => sum + row.quantidade, 0);
  const totalGross = financialSummary.reduce((sum, row) => sum + row.valorBruto, 0);
  const totalFees = financialSummary.reduce((sum, row) => sum + row.taxa, 0);
  const totalNet = financialSummary.reduce((sum, row) => sum + row.valorLiquido, 0);

  const exportData: ExportData = {
    dashboardMetrics: {
      total: totalOrders,
      paid: paidOrders,
      pending: pendingOrders,
      cancelled: cancelledOrders,
      conversionRate,
      byBoardingPoint: Object.entries(byBoardingPoint).map(([point, count]) => ({ point, count })),
      byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })),
    },
    dataRows: orders.map((o, idx) => ({
      numero: idx + 1,
      pedido: o.pedido,
      nomeCompleto: o.nomeCompleto,
      cpf: o.cpf,
      telefone: o.telefone,
      email: o.email,
      pontoEmbarque: o.pontoEmbarque,
      datasTransporte: o.datasTransporte,
      quantidadePassageiros: o.quantidadePassageiros,
      valorTotal: o.valorTotal,
      status: o.status,
      dataPedido: o.dataPedido,
    })),
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
    financialData: financialSummary.map(row => ({
      category: row.categoria,
      quantity: row.quantidade,
      grossValue: row.valorBruto,
      fees: row.taxa,
      netValue: row.valorLiquido,
    })),
    financialTotals: {
      totalQuantity,
      totalGross,
      totalFees,
      totalNet,
    },
  };

  return createProfessionalExcel(exportData);
}

/**
 * Convert passenger export data to professional Excel format
 */
export async function exportPassengersAsProfessional(
  passengers: PassengerExportRow[],
  financialSummary: FinancialExportRow[]
): Promise<Buffer> {
  // Calculate dashboard metrics
  const totalPassengers = passengers.length;
  const paidPassengers = passengers.filter(p => p.status === 'Pago').length;
  const pendingPassengers = passengers.filter(p => p.status === 'Pendente' || p.status === 'Aguardando Pagamento').length;
  const cancelledPassengers = passengers.filter(p => p.status === 'Cancelado').length;
  const conversionRate = totalPassengers > 0 ? (paidPassengers / totalPassengers) * 100 : 0;

  // Group by boarding point
  const byBoardingPoint: { [key: string]: number } = {};
  passengers.forEach(p => {
    byBoardingPoint[p.pontoEmbarque] = (byBoardingPoint[p.pontoEmbarque] || 0) + 1;
  });

  // Group by date
  const byDate: { [key: string]: number } = {};
  passengers.forEach(p => {
    byDate[p.dataViagem] = (byDate[p.dataViagem] || 0) + 1;
  });

  // Calculate financial totals
  const totalQuantity = financialSummary.reduce((sum, row) => sum + row.quantidade, 0);
  const totalGross = financialSummary.reduce((sum, row) => sum + row.valorBruto, 0);
  const totalFees = financialSummary.reduce((sum, row) => sum + row.taxa, 0);
  const totalNet = financialSummary.reduce((sum, row) => sum + row.valorLiquido, 0);

  const exportData: ExportData = {
    dashboardMetrics: {
      total: totalPassengers,
      paid: paidPassengers,
      pending: pendingPassengers,
      cancelled: cancelledPassengers,
      conversionRate,
      byBoardingPoint: Object.entries(byBoardingPoint).map(([point, count]) => ({ point, count })),
      byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })),
    },
    dataRows: passengers,
    dataColumns: [
      { header: '#', key: 'numero', width: 8 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Evento', key: 'evento', width: 25 },
      { header: 'Pedido', key: 'pedido', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Ponto de Embarque', key: 'pontoEmbarque', width: 20 },
      { header: 'Data da Viagem', key: 'dataViagem', width: 15 },
      { header: 'Ingresso', key: 'ingresso', width: 12 },
    ],
    financialData: financialSummary.map(row => ({
      category: row.categoria,
      quantity: row.quantidade,
      grossValue: row.valorBruto,
      fees: row.taxa,
      netValue: row.valorLiquido,
    })),
    financialTotals: {
      totalQuantity,
      totalGross,
      totalFees,
      totalNet,
    },
  };

  return createProfessionalExcel(exportData);
}

/**
 * Convert financial data to professional Excel format
 */
export async function exportFinancialAsProfessional(
  financialData: FinancialExportRow[]
): Promise<Buffer> {
  // Calculate totals
  const totalQuantity = financialData.reduce((sum, row) => sum + row.quantidade, 0);
  const totalGross = financialData.reduce((sum, row) => sum + row.valorBruto, 0);
  const totalFees = financialData.reduce((sum, row) => sum + row.taxa, 0);
  const totalNet = financialData.reduce((sum, row) => sum + row.valorLiquido, 0);

  const exportData: ExportData = {
    dashboardMetrics: {
      total: totalQuantity,
      paid: totalQuantity, // All are paid in financial view
      pending: 0,
      cancelled: 0,
      conversionRate: 100,
      byBoardingPoint: [],
      byDate: [],
    },
    dataRows: financialData.map((row, idx) => ({
      numero: idx + 1,
      ...row,
    })),
    dataColumns: [
      { header: '#', key: 'numero', width: 8 },
      { header: 'Categoria', key: 'categoria', width: 30 },
      { header: 'Quantidade', key: 'quantidade', width: 12 },
      { header: 'Valor Bruto', key: 'valorBruto', width: 15 },
      { header: 'Taxa', key: 'taxa', width: 15 },
      { header: 'Valor Líquido', key: 'valorLiquido', width: 15 },
    ],
    financialData: financialData.map(row => ({
      category: row.categoria,
      quantity: row.quantidade,
      grossValue: row.valorBruto,
      fees: row.taxa,
      netValue: row.valorLiquido,
    })),
    financialTotals: {
      totalQuantity,
      totalGross,
      totalFees,
      totalNet,
    },
  };

  return createProfessionalExcel(exportData);
}
