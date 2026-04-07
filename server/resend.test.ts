import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Resend API Key Validation", () => {
  it("should have RESEND_API_KEY configured", () => {
    expect(ENV.resendApiKey).toBeDefined();
    expect(ENV.resendApiKey).toBeTruthy();
    expect(ENV.resendApiKey).toMatch(/^re_/);
  });

  it("should validate Resend API key format", async () => {
    const apiKey = ENV.resendApiKey;
    
    // Test if the API key is valid by making a simple request to Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Resend returns 200 for valid key, 401 for invalid
    expect([200, 400]).toContain(response.status);
  });
});
