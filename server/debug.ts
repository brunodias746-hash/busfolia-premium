import { router, publicProcedure } from "./_core/trpc";

export const debugRouter = router({
  env: publicProcedure.query(async () => {
    return {
      asaas_env: process.env.ASAAS_ENVIRONMENT,
      has_api_key_prod: !!process.env.ASAAS_API_KEY_PRODUCTION,
      has_api_key_sandbox: !!process.env.ASAAS_API_KEY_SANDBOX,
      has_webhook_secret_prod: !!process.env.ASAAS_WEBHOOK_SECRET_PRODUCTION,
      has_webhook_secret_sandbox: !!process.env.ASAAS_WEBHOOK_SECRET_SANDBOX,
      deployment_id: process.env.DEPLOYMENT_ID || "NOT_SET",
      hostname: process.env.HOSTNAME || "NOT_SET",
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }),
});
