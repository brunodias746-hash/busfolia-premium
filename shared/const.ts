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
  "06 de junho de 2026", // June 6th - buses are full
];

// Helper function to check if a date is sold out
export function isSoldOutDate(dateStr: string): boolean {
  return SOLD_OUT_DATES.some(soldOutDate => 
    (dateStr.toLowerCase().includes('05') || dateStr.toLowerCase().includes('06')) && dateStr.toLowerCase().includes('junho')
  );
}

// Seat availability thresholds and indicators
export const SEAT_AVAILABILITY_THRESHOLDS = {
  GREEN: 20,      // >= 20 seats: green (plenty available)
  YELLOW: 10,     // 10-19 seats: yellow (limited)
  RED: 1,         // 1-9 seats: red (very limited)
  SOLD_OUT: 0,    // 0 seats: gray (sold out)
};

export function getSeatIndicator(availableSeats: number): {
  color: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
  icon: string;
} {
  if (availableSeats <= 0) {
    return { color: 'gray', label: 'ESGOTADO', icon: '🔒' };
  }
  if (availableSeats < SEAT_AVAILABILITY_THRESHOLDS.RED) {
    return { color: 'red', label: `Apenas ${availableSeats} vagas!`, icon: '🔴' };
  }
  if (availableSeats < SEAT_AVAILABILITY_THRESHOLDS.YELLOW) {
    return { color: 'yellow', label: `${availableSeats} vagas — últimas vagas!`, icon: '🟠' };
  }
  return { color: 'green', label: `${availableSeats} vagas`, icon: '🟢' };
}
