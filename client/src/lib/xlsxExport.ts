/**
 * Professional XLSX Export Utility
 * Generates Excel files with proper multi-column layout, formatting, and totals
 */

import * as XLSX from 'xlsx';

export interface XLSXExportOptions {
  title: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  totals?: (string | number)[];
  columnWidths?: number[];
}

/**
 * Format currency value for XLSX export (Brazilian format)
 * Input: cents (e.g., 6610 for R$ 66,10)
 * Output: "R$ 66,10"
 */
export function formatCurrencyForXLSX(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  return `R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

/**
 * Format date for XLSX export (DD/MM/YYYY)
 */
export function formatDateForXLSX(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime for XLSX export (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeForXLSX(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDateForXLSX(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Generate professional XLSX export with proper formatting
 * Structure:
 * - Row 1: Report title
 * - Row 2: Generation timestamp
 * - Row 3: Empty
 * - Row 4: Headers (bold, light gray background)
 * - Rows 5+: Data
 * - Last row: Totals (if provided)
 */
export function generateProfessionalXLSX(options: XLSXExportOptions): void {
  const { title, filename, headers, rows, totals, columnWidths } = options;
  
  // Build complete data array
  const data: (string | number)[][] = [];
  
  // Row 1: Title
  data.push([title]);
  
  // Row 2: Generation timestamp
  const now = new Date();
  const timestamp = formatDateTimeForXLSX(now);
  data.push([`Gerado em: ${timestamp}`]);
  
  // Row 3: Empty
  data.push([]);
  
  // Row 4: Headers
  data.push(headers);
  
  // Data rows
  rows.forEach(row => {
    data.push(row);
  });
  
  // Empty row before totals
  if (totals && totals.length > 0) {
    data.push([]);
    data.push(totals);
  }
  
  // Create workbook and worksheet from complete data array
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Apply formatting to headers row (row 4, index 3)
  const headerRowIndex = 3;
  headers.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIdx });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  });
  
  // Apply formatting to totals row (if exists)
  if (totals && totals.length > 0) {
    const totalsRowIndex = data.length - 1;
    totals.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: totalsRowIndex, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E8E8E8' } },
          alignment: { horizontal: 'right' }
        };
      }
    });
  }
  
  // Set column widths
  const defaultWidths = columnWidths || headers.map(() => 18);
  ws['!cols'] = defaultWidths.map(width => ({ wch: width }));
  
  // Set row heights
  ws['!rows'] = [
    { hpt: 24 }, // Title row
    { hpt: 18 }, // Timestamp row
    { hpt: 12 }, // Empty row
    { hpt: 24 }, // Headers row (bold)
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  
  // Write file
  XLSX.writeFile(wb, filename);
}

/**
 * Download XLSX file (wrapper for generateProfessionalXLSX)
 */
export function downloadXLSX(options: XLSXExportOptions): void {
  generateProfessionalXLSX(options);
}
