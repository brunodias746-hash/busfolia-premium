export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  // Asaas Payment Gateway
  asaasEnvironment: (process.env.ASAAS_ENVIRONMENT ?? "sandbox") as "sandbox" | "production",
  asaasApiKeySandbox: process.env.ASAAS_API_KEY_SANDBOX ?? "",
  asaasApiKeyProduction: process.env.ASAAS_API_KEY_PRODUCTION ?? "",
  asaasWebhookSecretSandbox: process.env.ASAAS_WEBHOOK_SECRET_SANDBOX ?? "",
  asaasWebhookSecretProduction: process.env.ASAAS_WEBHOOK_SECRET_PRODUCTION ?? "",
};

// Asaas helpers
export function getAsaasApiKey(): string {
  return ENV.asaasEnvironment === "production"
    ? ENV.asaasApiKeyProduction
    : ENV.asaasApiKeySandbox;
}

export function getAsaasWebhookSecret(): string {
  return ENV.asaasEnvironment === "production"
    ? ENV.asaasWebhookSecretProduction
    : ENV.asaasWebhookSecretSandbox;
}

export function getAsaasBaseUrl(): string {
  return ENV.asaasEnvironment === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";
}
