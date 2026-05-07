/**
 * Centralized Date Formatting Utility
 * Ensures consistent date formatting across the entire application
 * 
 * Standard Format: "05 de junho de 2026" (Portuguese, lowercase)
 * Fallback Year: 2026 (for dates without year)
 */

/**
 * Portuguese month names mapping
 */
const PORTUGUESE_MONTHS: { [key: string]: number } = {
  'janeiro': 0,
  'fevereiro': 1,
  'março': 2,
  'abril': 3,
  'maio': 4,
  'junho': 5,
  'julho': 6,
  'agosto': 7,
  'setembro': 8,
  'outubro': 9,
  'novembro': 10,
  'dezembro': 11,
};

const PORTUGUESE_MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/**
 * Validates if a year is reasonable (between 2020 and 2030)
 * @param year - Year to validate
 * @returns true if year is valid
 */
function isValidYear(year: number): boolean {
  return year >= 2020 && year <= 2030;
}

/**
 * Parses a date string in various formats
 * Supports: ISO (2026-06-05), Brazilian (05/06/2026), Portuguese (05 Junho 2026)
 * @param dateStr - Date string to parse
 * @returns Date object or null if parsing fails
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format: 2026-06-05
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime()) && isValidYear(date.getFullYear())) {
      return date;
    }
  }

  // Try Brazilian format: 05/06/2026
  const brazilianMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brazilianMatch) {
    const [, day, month, year] = brazilianMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime()) && isValidYear(date.getFullYear())) {
      return date;
    }
  }

  // Try Portuguese format: 05 Junho 2026 or 05 de Junho de 2026
  const portugueseMatch = dateStr.toLowerCase().match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})?/);
  if (portugueseMatch) {
    const [, dayStr, monthStr, yearStr] = portugueseMatch;
    const day = parseInt(dayStr);
    const month = PORTUGUESE_MONTHS[monthStr];
    const year = yearStr ? parseInt(yearStr) : 2026;

    if (month !== undefined && !isNaN(day) && isValidYear(year)) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try native Date parsing as fallback
  const date = new Date(dateStr);
  if (!isNaN(date.getTime()) && isValidYear(date.getFullYear())) {
    return date;
  }

  return null;
}

/**
 * Formats a date to Portuguese format: "05 de junho de 2026"
 * @param date - Date object, ISO string, or Portuguese date string
 * @returns Formatted date string or original input if parsing fails
 */
export function formatDatePortuguese(date: Date | string | null | undefined): string {
  if (!date) return '';

  let dateObj: Date | null = null;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = parseDate(date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return typeof date === 'string' ? date : '';
  }

  const day = dateObj.getDate();
  const month = PORTUGUESE_MONTH_NAMES[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} de ${month} de ${year}`;
}

/**
 * Formats a date to Brazilian format: "05/06/2026"
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export function formatDateBrazilian(date: Date | string | null | undefined): string {
  if (!date) return '';

  let dateObj: Date | null = null;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = parseDate(date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date to ISO format: "2026-06-05"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) return '';

  let dateObj: Date | null = null;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = parseDate(date);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${year}-${month}-${day}`;
}

/**
 * Formats multiple dates to Portuguese format
 * @param dates - Array of date strings or Date objects
 * @returns Comma-separated formatted dates
 */
export function formatDatesPortuguese(dates: (Date | string)[]): string {
  if (!Array.isArray(dates) || dates.length === 0) return '';

  return dates
    .map((date) => formatDatePortuguese(date))
    .filter((date) => date !== '')
    .join(', ');
}

/**
 * Validates if a date string is in correct format and year is valid
 * @param dateStr - Date string to validate
 * @returns true if date is valid
 */
export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;

  const dateObj = parseDate(dateStr);
  if (!dateObj || isNaN(dateObj.getTime())) {
    return false;
  }

  return isValidYear(dateObj.getFullYear());
}

/**
 * Gets the year from a date string
 * @param dateStr - Date string
 * @returns Year as number or null if parsing fails
 */
export function getYearFromDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;

  const dateObj = parseDate(dateStr);
  if (!dateObj || isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj.getFullYear();
}

/**
 * Compares two dates (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined
): number {
  const d1 = date1 instanceof Date ? date1 : parseDate(date1 as string);
  const d2 = date2 instanceof Date ? date2 : parseDate(date2 as string);

  if (!d1 || !d2) return 0;

  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();

  return t1 < t2 ? -1 : t1 > t2 ? 1 : 0;
}

/**
 * Checks if a date is in the year 2026
 * @param dateStr - Date string
 * @returns true if year is 2026
 */
export function isYear2026(dateStr: string | null | undefined): boolean {
  const year = getYearFromDate(dateStr);
  return year === 2026;
}

/**
 * Checks if a date has an invalid year (like 2001)
 * @param dateStr - Date string
 * @returns true if year is invalid
 */
export function hasInvalidYear(dateStr: string | null | undefined): boolean {
  const year = getYearFromDate(dateStr);
  return year !== null && !isValidYear(year);
}
