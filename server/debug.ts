import { router, publicProcedure } from "./_core/trpc";

export const debugRouter = router({
  env: publicProcedure.query(async () => {
    // Simplified diagnostic logging for Asaas environment variables
    const apiKey = process.env.ASAAS_API_KEY;
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
    
    return {
      asaas_api_key_exists: !!apiKey,
      asaas_webhook_secret_exists: !!webhookSecret,
      api_key_prefix: apiKey ? apiKey.substring(0, 15) : "NOT_SET",
      api_key_length: apiKey ? apiKey.length : 0,
      webhook_secret_prefix: webhookSecret ? webhookSecret.substring(0, 15) : "NOT_SET",
      webhook_secret_length: webhookSecret ? webhookSecret.length : 0,
      deployment_id: process.env.DEPLOYMENT_ID || "NOT_SET",
      hostname: process.env.HOSTNAME || "NOT_SET",
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      all_asaas_env_vars: Object.keys(process.env)
        .filter(k => k.includes("ASAAS"))
        .map(k => ({ key: k, exists: !!process.env[k], length: process.env[k]?.length || 0 })),
    };
  }),
});
