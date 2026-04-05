// CDN Image URLs
export const IMAGES = {
  heroRodeo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/PHIL9031-Aprimorado-NR-1024x683_75d9d13c.webp",
  eventBanner: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/banner-site-dias_5e4c81df.webp",
  // Real Viacao TG fleet images - 12 unique photos
  fleetBus1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-luxury-coach-bus-driving-on-highway-same-exact-bus-from-reference-image-no-design-changes-dynamic-motion-blur-background-sharp-focus-on-bus-golden-hour-lighting-cinematic-_0006_8f2c8d9b.webp",
  fleetBus2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-tourism-bus-advertisement-same-exact-bus-from-reference-image-preserve-original-design-preserve-company-identity-and-real-proportions-enhance-only-visual-quality-a_0012_d55a9fab.webp",
  fleetBus3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-tourism-bus-advertisement-same-exact-bus-from-reference-image-preserve-original-design-preserve-company-identity-and-real-proportions-enhance-only-visual-quality-a_0011_5aa088ed.webp",
  fleetBus4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-tourism-bus-advertisement-same-exact-bus-from-reference-image-preserve-original-design-preserve-company-identity-and-real-proportions-enhance-only-visual-quality-a_0013_5ef7d383.webp",
  fleetBus5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-cinematic-luxury-bus-scene-same-exact-bus-from-reference-image-preserve-all-original-design-colors-and-branding-enhance-lighting-and-environment-only-dramatic-sunset-sky-w_0002_a8dd8cee.webp",
  fleetBus6: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-luxury-coach-bus-driving-on-highway-same-exact-bus-from-reference-image-no-design-changes-dynamic-motion-blur-background-sharp-focus-on-bus-golden-hour-lighting-cinematic-_0005_bccd48e3.webp",
  fleetBus7: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-transport-company-bus-same-exact-bus-from-reference-image-no-changes-to-structure-or-branding-cinematic-commercial-lighting-ultra-polished-surface-reflections-dram_0009_b98a6296.webp",
  fleetBus8: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-transport-company-bus-same-exact-bus-from-reference-image-no-changes-to-structure-or-branding-cinematic-commercial-lighting-ultra-polished-surface-reflections-dram_0007_12f7fd41.webp",
  fleetBus9: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-cinematic-luxury-bus-scene-same-exact-bus-from-reference-image-preserve-all-original-design-colors-and-branding-enhance-lighting-and-environment-only-dramatic-sunset-sky-w_0001_545a203f.webp",
  fleetBus10: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-luxury-bus-at-night-same-exact-bus-from-reference-image-preserve-original-structure-and-identity-cinematic-night-lighting-neon-underglow-lights-subtly-added-beneath-the-bu_0010_0256a91e.webp",
  fleetBus11: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-premium-transport-company-bus-same-exact-bus-from-reference-image-no-changes-to-structure-or-branding-cinematic-commercial-lighting-ultra-polished-surface-reflections-dram_0008_7ebf5087.webp",
  fleetBus12: "https://d2xsxph8kpxj0f.cloudfront.net/310519663481702841/ci3rs2m5P7Zem9o9Dnh5ee/freepik_ultra-realistic-cinematic-luxury-bus-scene-same-exact-bus-from-reference-image-preserve-all-original-design-colors-and-branding-enhance-lighting-and-environment-only-dramatic-sunset-sky-w_0004_b44bea6c.webp",
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
