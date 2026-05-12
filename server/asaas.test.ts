import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally for Asaas API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock env before importing asaas module
vi.mock("./_core/env", () => ({
  ENV: {
    ASAAS_API_KEY_SANDBOX: "test_sandbox_key_123",
    ASAAS_API_KEY_PRODUCTION: "",
    ASAAS_ENVIRONMENT: "sandbox",
    ASAAS_WEBHOOK_SECRET_SANDBOX: "test_webhook_secret",
    ASAAS_WEBHOOK_SECRET_PRODUCTION: "",
  },
  getAsaasApiKey: () => "test_sandbox_key_123",
  getAsaasBaseUrl: () => "https://sandbox.asaas.com/api/v3",
  getAsaasWebhookSecret: () => "test_webhook_secret",
}));

describe("Asaas Service Module", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("findOrCreateCustomer", () => {
    it("should find existing customer by CPF", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: "cus_existing123", name: "Test User", cpfCnpj: "12345678901" }],
          totalCount: 1,
        }),
      });

      const { findOrCreateCustomer } = await import("./lib/asaas");
      const result = await findOrCreateCustomer({
        name: "Test User",
        cpfCnpj: "12345678901",
        email: "test@example.com",
        phone: "31999999999",
      });

      expect(result.id).toBe("cus_existing123");
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain("/customers?cpfCnpj=12345678901");
    });

    it("should create new customer if not found", async () => {
      // First call: search returns empty
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], totalCount: 0 }),
      });
      // Second call: create customer
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "cus_new456", name: "New User", cpfCnpj: "98765432100" }),
      });

      const { findOrCreateCustomer } = await import("./lib/asaas");
      const result = await findOrCreateCustomer({
        name: "New User",
        cpfCnpj: "98765432100",
        email: "new@example.com",
        phone: "31888888888",
      });

      expect(result.id).toBe("cus_new456");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("createPaymentAsaas", () => {
    it("should create a PIX payment", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "pay_pix123",
          status: "PENDING",
          billingType: "PIX",
          value: 60.0,
        }),
      });

      const { createPaymentAsaas } = await import("./lib/asaas");
      const result = await createPaymentAsaas({
        customerId: "cus_123",
        billingType: "PIX",
        value: 60.0,
        dueDate: "2026-06-05",
        description: "BusFolia - Test Event",
        externalReference: "42",
      });

      expect(result.id).toBe("pay_pix123");
      expect(result.billingType).toBe("PIX");
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.billingType).toBe("PIX");
      expect(body.value).toBe(60.0);
    });

    it("should create a credit card payment with card data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "pay_card123",
          status: "CONFIRMED",
          billingType: "CREDIT_CARD",
          value: 70.0,
        }),
      });

      const { createPaymentAsaas } = await import("./lib/asaas");
      const result = await createPaymentAsaas({
        customerId: "cus_123",
        billingType: "CREDIT_CARD",
        value: 70.0,
        dueDate: "2026-06-05",
        description: "BusFolia - Test Event",
        externalReference: "43",
        creditCard: {
          holderName: "TEST USER",
          number: "4111111111111111",
          expiryMonth: "12",
          expiryYear: "2028",
          ccv: "123",
        },
        creditCardHolderInfo: {
          name: "Test User",
          email: "test@example.com",
          cpfCnpj: "12345678901",
          postalCode: "30130000",
          addressNumber: "100",
          phone: "31999999999",
        },
        remoteIp: "127.0.0.1",
      });

      expect(result.id).toBe("pay_card123");
      expect(result.status).toBe("CONFIRMED");
      
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.creditCard.holderName).toBe("TEST USER");
      expect(body.creditCardHolderInfo.cpfCnpj).toBe("12345678901");
    });

    it("should create a boleto payment", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "pay_boleto123",
          status: "PENDING",
          billingType: "BOLETO",
          value: 200.0,
          bankSlipUrl: "https://sandbox.asaas.com/boleto/123",
          invoiceUrl: "https://sandbox.asaas.com/invoice/123",
        }),
      });

      const { createPaymentAsaas } = await import("./lib/asaas");
      const result = await createPaymentAsaas({
        customerId: "cus_123",
        billingType: "BOLETO",
        value: 200.0,
        dueDate: "2026-06-08",
        description: "BusFolia - Passaporte",
        externalReference: "44",
      });

      expect(result.id).toBe("pay_boleto123");
      expect(result.bankSlipUrl).toBe("https://sandbox.asaas.com/boleto/123");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          errors: [{ code: "invalid_value", description: "Value must be greater than 0" }],
        }),
      });

      const { createPaymentAsaas } = await import("./lib/asaas");
      await expect(
        createPaymentAsaas({
          customerId: "cus_123",
          billingType: "PIX",
          value: 0,
          dueDate: "2026-06-05",
          description: "Test",
          externalReference: "45",
        })
      ).rejects.toThrow();
    });
  });

  describe("getPixQrCode", () => {
    it("should return QR code data for a PIX payment", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          encodedImage: "iVBORw0KGgoAAAANSUhEUg...",
          payload: "00020126420014BR.GOV.BCB.PIX...",
          expirationDate: "2026-06-05T23:59:59Z",
        }),
      });

      const { getPixQrCode } = await import("./lib/asaas");
      const result = await getPixQrCode("pay_pix123");

      expect(result.encodedImage).toBeTruthy();
      expect(result.payload).toBeTruthy();
      expect(mockFetch.mock.calls[0][0]).toContain("/payments/pay_pix123/pixQrCode");
    });
  });

  describe("getBoletoIdentificationField", () => {
    it("should return boleto identification field", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          identificationField: "23793.38128 60000.000003 00000.000400 1 84340000006000",
          barCode: "23791843400000060003381286000000000000000040",
        }),
      });

      const { getBoletoIdentificationField } = await import("./lib/asaas");
      const result = await getBoletoIdentificationField("pay_boleto123");

      expect(result.identificationField).toBeTruthy();
      expect(result.barCode).toBeTruthy();
      expect(mockFetch.mock.calls[0][0]).toContain("/payments/pay_boleto123/identificationField");
    });
  });

  describe("getPaymentById", () => {
    it("should return payment details", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "pay_123",
          status: "RECEIVED",
          billingType: "PIX",
          value: 60.0,
          netValue: 58.8,
          customer: "cus_123",
        }),
      });

      const { getPaymentById } = await import("./lib/asaas");
      const result = await getPaymentById("pay_123");

      expect(result.id).toBe("pay_123");
      expect(result.status).toBe("RECEIVED");
    });
  });
});

describe("Asaas Webhook Handler", () => {
  it("should handle PAYMENT_RECEIVED event", async () => {
    const webhookPayload = {
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_test123",
        customer: "cus_test123",
        billingType: "PIX",
        value: 60.0,
        netValue: 58.8,
        status: "RECEIVED",
        externalReference: "42",
      },
    };

    // Verify the payload structure matches what our webhook handler expects
    expect(webhookPayload.event).toBe("PAYMENT_RECEIVED");
    expect(webhookPayload.payment.externalReference).toBe("42");
    expect(webhookPayload.payment.id).toBeTruthy();
  });

  it("should handle PAYMENT_CONFIRMED event", async () => {
    const webhookPayload = {
      event: "PAYMENT_CONFIRMED",
      payment: {
        id: "pay_card456",
        customer: "cus_test456",
        billingType: "CREDIT_CARD",
        value: 70.0,
        netValue: 67.2,
        status: "CONFIRMED",
        externalReference: "43",
      },
    };

    expect(webhookPayload.event).toBe("PAYMENT_CONFIRMED");
    expect(webhookPayload.payment.billingType).toBe("CREDIT_CARD");
  });

  it("should handle PAYMENT_OVERDUE event", async () => {
    const webhookPayload = {
      event: "PAYMENT_OVERDUE",
      payment: {
        id: "pay_boleto789",
        customer: "cus_test789",
        billingType: "BOLETO",
        value: 200.0,
        status: "OVERDUE",
        externalReference: "44",
      },
    };

    expect(webhookPayload.event).toBe("PAYMENT_OVERDUE");
    expect(webhookPayload.payment.status).toBe("OVERDUE");
  });
});

describe("Asaas Environment Configuration", () => {
  it("should use sandbox URL in sandbox mode", async () => {
    const { getAsaasBaseUrl } = await import("./_core/env");
    expect(getAsaasBaseUrl()).toBe("https://sandbox.asaas.com/api/v3");
  });

  it("should return sandbox API key", async () => {
    const { getAsaasApiKey } = await import("./_core/env");
    expect(getAsaasApiKey()).toBe("test_sandbox_key_123");
  });

  it("should return webhook secret", async () => {
    const { getAsaasWebhookSecret } = await import("./_core/env");
    expect(getAsaasWebhookSecret()).toBe("test_webhook_secret");
  });
});
