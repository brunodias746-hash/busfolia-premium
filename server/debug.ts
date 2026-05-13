import { router, publicProcedure } from "./_core/trpc";

export const debugRouter = router({
  env: publicProcedure.query(async () => {
    // Detailed diagnostic logging for environment variable propagation
    const prodKey = process.env.ASAAS_API_KEY_PRODUCTION;
    const sandboxKey = process.env.ASAAS_API_KEY_SANDBOX;
    
    return {
      asaas_env: process.env.ASAAS_ENVIRONMENT,
      has_api_key_prod: !!prodKey,
      has_api_key_sandbox: !!sandboxKey,
      has_webhook_secret_prod: !!process.env.ASAAS_WEBHOOK_SECRET_PRODUCTION,
      has_webhook_secret_sandbox: !!process.env.ASAAS_WEBHOOK_SECRET_SANDBOX,
      deployment_id: process.env.DEPLOYMENT_ID || "NOT_SET",
      hostname: process.env.HOSTNAME || "NOT_SET",
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      // Detailed diagnostics for debugging
      api_key_prod_prefix: prodKey ? prodKey.substring(0, 15) : "NOT_SET",
      api_key_sandbox_prefix: sandboxKey ? sandboxKey.substring(0, 15) : "NOT_SET",
      api_key_prod_length: prodKey ? prodKey.length : 0,
      api_key_sandbox_length: sandboxKey ? sandboxKey.length : 0,
      api_key_prod_starts_with_dollar: prodKey ? prodKey.startsWith("$") : false,
      api_key_sandbox_starts_with_dollar: sandboxKey ? sandboxKey.startsWith("$") : false,
      all_asaas_env_vars: Object.keys(process.env)
        .filter(k => k.includes("ASAAS"))
        .map(k => ({ key: k, exists: !!process.env[k], length: process.env[k]?.length || 0 })),
    };
  }),
});
