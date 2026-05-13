/**
 * Asaas Payment Gateway Service
 * Handles PIX, Credit Card, and Boleto payments via Asaas API v3
 */
import { getAsaasApiKey, getAsaasBaseUrl } from "../_core/env";

// ─── Types ───

export type AsaasBillingType = "CREDIT_CARD" | "PIX" | "BOLETO" | "UNDEFINED";

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: AsaasBillingType;
  status: string;
  dueDate: string;
  description?: string;
  externalReference?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string; // base64 PNG
  payload: string; // copia-e-cola
  expirationDate: string;
}

export interface AsaasBoletoInfo {
  identificationField: string; // linha digitável
  nossoNumero: string;
  barCode: string;
}

export interface AsaasCreditCardInfo {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export interface CreatePaymentInput {
  customerId: string;
  billingType: AsaasBillingType;
  value: number; // in BRL (e.g., 60.00)
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference?: string;
  // Credit card specific
  creditCard?: AsaasCreditCardInfo;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  // Remote IP for credit card anti-fraud
  remoteIp?: string;
}

export interface CreateCustomerInput {
  name: string;
  cpfCnpj: string; // only digits
  email?: string;
  phone?: string;
}

// ─── API Client ───

async function asaasRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: any
): Promise<T> {
  const baseUrl = getAsaasBaseUrl();
  const apiKey = getAsaasApiKey();

  if (!apiKey) {
    // Production-safe diagnostic log
    console.error({
      error: "Asaas API key is not configured",
      hasAsaasKey: Boolean(apiKey),
      asaasKeyPrefix: apiKey?.slice(0, 11),
      asaasBaseUrl: baseUrl,
    });
    throw new Error("Asaas API key is not configured");
  }

  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "BusFolia/1.0.0",
    access_token: apiKey,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Asaas] API Error ${response.status}: ${errorBody}`);
    throw new Error(
      `Asaas API error (${response.status}): ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

// ─── Customer Methods ───

/**
 * Create a new customer in Asaas.
 * CPF must be digits only (11 chars).
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>("POST", "/customers", {
    name: input.name,
    cpfCnpj: input.cpfCnpj.replace(/\D/g, ""),
    email: input.email,
    phone: input.phone?.replace(/\D/g, ""),
  });
}

/**
 * Find existing customer by CPF.
 */
export async function findCustomerByCpf(
  cpf: string
): Promise<AsaasCustomer | null> {
  const cleanCpf = cpf.replace(/\D/g, "");
  const result = await asaasRequest<{ data: AsaasCustomer[]; totalCount: number }>(
    "GET",
    `/customers?cpfCnpj=${cleanCpf}`
  );
  return result.data.length > 0 ? result.data[0] : null;
}

/**
 * Find or create a customer by CPF.
 */
export async function findOrCreateCustomer(
  input: CreateCustomerInput
): Promise<AsaasCustomer> {
  const existing = await findCustomerByCpf(input.cpfCnpj);
  if (existing) {
    return existing;
  }
  return createCustomer(input);
}

// ─── Payment Methods ───

/**
 * Create a new payment (cobrança) in Asaas.
 * For PIX and Boleto, the payment is created and then you fetch the QR code or boleto info.
 * For Credit Card, pass creditCard and creditCardHolderInfo.
 */
export async function createPaymentAsaas(
  input: CreatePaymentInput
): Promise<AsaasPayment> {
  const payload: any = {
    customer: input.customerId,
    billingType: input.billingType,
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
  };

  // Credit card specific fields
  if (input.billingType === "CREDIT_CARD" && input.creditCard) {
    payload.creditCard = input.creditCard;
    payload.creditCardHolderInfo = input.creditCardHolderInfo;
    if (input.remoteIp) {
      payload.remoteIp = input.remoteIp;
    }
  }

  return asaasRequest<AsaasPayment>("POST", "/payments", payload);
}

/**
 * Get PIX QR Code for a payment.
 * Only works for payments with billingType = PIX.
 */
export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>("GET", `/payments/${paymentId}/pixQrCode`);
}

/**
 * Get Boleto identification field (linha digitável).
 * Only works for payments with billingType = BOLETO.
 */
export async function getBoletoIdentificationField(
  paymentId: string
): Promise<AsaasBoletoInfo> {
  return asaasRequest<AsaasBoletoInfo>(
    "GET",
    `/payments/${paymentId}/identificationField`
  );
}

/**
 * Get a single payment by ID.
 */
export async function getPaymentById(
  paymentId: string
): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>("GET", `/payments/${paymentId}`);
}

/**
 * Get payment status.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<{ status: string }> {
  return asaasRequest<{ status: string }>("GET", `/payments/${paymentId}/status`);
}
