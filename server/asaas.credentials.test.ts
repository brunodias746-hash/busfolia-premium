import { describe, it, expect } from "vitest";

describe("Asaas Credentials Validation", () => {
  it("should have ASAAS_API_KEY_PRODUCTION configured", () => {
    const apiKey = process.env.ASAAS_API_KEY_PRODUCTION;
    expect(apiKey).toBeDefined();
    expect(apiKey).toMatch(/^\$aact_prod_/);
  });

  it("should have ASAAS_WEBHOOK_SECRET_PRODUCTION configured", () => {
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET_PRODUCTION;
    expect(webhookSecret).toBeDefined();
    expect(webhookSecret).toMatch(/^whsec_/);
  });

  it("should have ASAAS_ENVIRONMENT set to production", () => {
    const environment = process.env.ASAAS_ENVIRONMENT;
    expect(environment).toBe("production");
  });

  it("should validate API key format", () => {
    const apiKey = process.env.ASAAS_API_KEY_PRODUCTION;
    // Asaas production keys start with $aact_prod_
    expect(apiKey).toMatch(/^\$aact_prod_[a-zA-Z0-9:$]+$/);
  });

  it("should validate webhook secret format", () => {
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET_PRODUCTION;
    // Asaas webhook secrets start with whsec_
    expect(webhookSecret).toMatch(/^whsec_[a-zA-Z0-9_-]+$/);
  });
});
