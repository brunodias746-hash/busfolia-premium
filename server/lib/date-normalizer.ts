/**
 * Robust date normalization utility
 * Handles multiple date formats and fixes invalid years (2001 -> 2026)
 */

const MONTH_MAP: { [key: string]: string } = {
  'janeiro': '01', 'january': '01', 'jan': '01',
  'fevereiro': '02', 'february': '02', 'feb': '02',
  'março': '03', 'march': '03', 'mar': '03',
  'abril': '04', 'april': '04', 'apr': '04',
  'maio': '05', 'may': '05',
  'junho': '06', 'june': '06', 'jun': '06',
  'julho': '07', 'july': '07', 'jul': '07',
  'agosto': '08', 'august': '08', 'aug': '08',
  'setembro': '09', 'september': '09', 'sep': '09',
  'outubro': '10', 'october': '10', 'oct': '10',
  'novembro': '11', 'november': '11', 'nov': '11',
  'dezembro': '12', 'december': '12', 'dec': '12',
};

/**
 * Normalize a date string to ISO format (YYYY-MM-DD)
 * Handles: ISO (2026-06-05), Brazilian (05/06/2026), Portuguese text (05 de junho de 2026)
 * Fixes invalid years: 2001 -> 2026
 */
export function normalizeDateString(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  dateStr = dateStr.trim();
  
  // ISO format: 2026-06-05 or 2026-06-05T00:00:00Z
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0], 10);
    const month = parts[1];
    const day = parts[2].substring(0, 2);
    
    // Fix invalid year
    if (year < 2020 || year > 2030) {
      year = 2026;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Brazilian format: 05/06/2026
  if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const parts = dateStr.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parseInt(parts[2], 10);
    
    // Fix invalid year
    if (year < 2020 || year > 2030) {
      year = 2026;
    }
    
    return `${year}-${month}-${day}`;
  }
  
  // Portuguese text format: 05 de junho de 2026 or 5 de junho de 2026
  if (dateStr.match(/^\d{1,2}\s+de\s+\w+\s+de\s+\d{4}/i)) {
    const parts = dateStr.split(/\s+de\s+/i);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const monthStr = parts[1].toLowerCase();
      let year = parseInt(parts[2], 10);
      
      const month = MONTH_MAP[monthStr];
      if (!month) return null;
      
      // Fix invalid year
      if (year < 2020 || year > 2030) {
        year = 2026;
      }
      
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

/**
 * Normalize an array of date strings
 */
export function normalizeDateArray(dates: string[] | string): string[] {
  let dateArray: string[] = [];
  
  if (typeof dates === 'string') {
    try {
      dateArray = JSON.parse(dates);
    } catch {
      dateArray = [dates];
    }
  } else if (Array.isArray(dates)) {
    dateArray = dates;
  }
  
  return dateArray
    .map(d => normalizeDateString(d))
    .filter((d): d is string => d !== null);
}

/**
 * Format normalized date to Portuguese text
 * Input: 2026-06-05
 * Output: 05 de junho de 2026
 */
export function formatDateToPortuguese(isoDate: string): string {
  try {
    const date = new Date(isoDate + 'T00:00:00Z');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    
    return `${parseInt(day)} de ${month} de ${year}`;
  } catch {
    return isoDate;
  }
}
