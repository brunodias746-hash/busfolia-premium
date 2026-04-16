/**
 * Professional CSV Export Utility with UTF-8 BOM
 * Handles proper formatting for Brazilian locale (R$ currency, DD/MM/YYYY dates)
 */

export interface CSVExportOptions {
  title: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Format currency value for CSV export (Brazilian format)
 * Input: cents (e.g., 6610 for R$ 66,10)
 * Output: "R$ 66,10"
 */
export function formatCurrencyForCSV(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  return `R$ ${reais.toLocaleString('pt-BR')},${String(centavos).padStart(2, '0')}`;
}

/**
 * Format date for CSV export (DD/MM/YYYY)
 * Input: Date object or ISO string
 * Output: "10/04/2026"
 */
export function formatDateForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime for CSV export (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDateForCSV(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Escape CSV field value (handle quotes, commas, newlines)
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate professional CSV export with UTF-8 BOM
 * First row: Report title
 * Second row: Generation timestamp
 * Third row: (empty)
 * Fourth row: Headers
 * Remaining rows: Data
 */
export function generateProfessionalCSV(options: CSVExportOptions): string {
  const { title, headers, rows } = options;
  
  // Generate timestamp
  const now = new Date();
  const timestamp = formatDateTimeForCSV(now);
  
  // Build CSV content
  const csvRows: string[] = [];
  
  // Row 1: Report title
  csvRows.push(escapeCSVField(title));
  
  // Row 2: Generation date/time
  csvRows.push(`Gerado em: ${timestamp}`);
  
  // Row 3: Empty line for spacing
  csvRows.push('');
  
  // Row 4: Headers
  csvRows.push(headers.map(escapeCSVField).join(','));
  
  // Data rows
  for (const row of rows) {
    csvRows.push(row.map(escapeCSVField).join(','));
  }
  
  // Join all rows with newline
  const csv = csvRows.join('\n');
  
  // Add UTF-8 BOM for proper Excel encoding
  const bom = '\uFEFF';
  return bom + csv;
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
