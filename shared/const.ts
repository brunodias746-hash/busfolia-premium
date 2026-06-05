export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Event dates for PLRS 2026 (Pedro Leopoldo Rodeio Show)
export const PLRS_2026_EVENT_DATES = [
  "05 de junho de 2026",
  "06 de junho de 2026",
  "12 de junho de 2026",
  "13 de junho de 2026",
];

// Sold-out dates (no new purchases allowed)
export const SOLD_OUT_DATES = [
  "05 de junho de 2026", // June 5th - buses are full
];

// Helper function to check if a date is sold out
export function isSoldOutDate(dateStr: string): boolean {
  return SOLD_OUT_DATES.some(soldOutDate => 
    dateStr.toLowerCase().includes('05') && dateStr.toLowerCase().includes('junho')
  );
}
