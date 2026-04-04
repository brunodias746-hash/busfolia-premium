// CDN Image URLs
export const IMAGES = {
  heroRodeo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/PHIL9031-Aprimorado-NR-1024x683_75d9d13c.webp",
  busExterior: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/bus-exterior_40362a91.jpeg",
  busInterior: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/bus-interior_ce0531f0.jpg",
  busFleet: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/bus-fleet_34461a69.jpg",
};

// Site configuration
export const SITE = {
  name: "BusFolia",
  tagline: "Transporte Premium para Eventos",
  whatsapp: "https://wa.me/5531999999999",
  instagram: "https://instagram.com/busfolia",
  email: "contato@busfolia.com.br",
};

// Format helpers
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
