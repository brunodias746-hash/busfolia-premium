import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ───

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@busfolia.com.br",
    name: "Admin BusFolia",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@test.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── CPF Validation Tests ───

describe("CPF Validation", () => {
  it("rejects CPF with all same digits", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "111.111.111-11",
        customerEmail: "test@test.com",
        customerPhone: "31999999999",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [{ name: "Test", cpf: "111.111.111-11", boardingPointId: 1 }],
        origin: "https://busfolia.com.br",
      })
    ).rejects.toThrow();
  });

  it("rejects CPF with wrong length", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "123456",
        customerEmail: "test@test.com",
        customerPhone: "31999999999",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [{ name: "Test", cpf: "123456", boardingPointId: 1 }],
        origin: "https://busfolia.com.br",
      })
    ).rejects.toThrow();
  });
});

// ─── Input Validation Tests ───

describe("Checkout Input Validation", () => {
  it("rejects empty passenger list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "529.982.247-25",
        customerEmail: "test@test.com",
        customerPhone: "31999999999",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [],
        origin: "https://busfolia.com.br",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "529.982.247-25",
        customerEmail: "not-an-email",
        customerPhone: "31999999999",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [{ name: "Test", cpf: "529.982.247-25", boardingPointId: 1 }],
        origin: "https://busfolia.com.br",
      })
    ).rejects.toThrow();
  });

  it("rejects short phone number", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "529.982.247-25",
        customerEmail: "test@test.com",
        customerPhone: "123",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [{ name: "Test", cpf: "529.982.247-25", boardingPointId: 1 }],
        origin: "https://busfolia.com.br",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid origin URL", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        eventId: 1,
        customerName: "Test User",
        customerCpf: "529.982.247-25",
        customerEmail: "test@test.com",
        customerPhone: "31999999999",
        boardingPointId: 1,
        transportDate: "05/06/2026",
        passengers: [{ name: "Test", cpf: "529.982.247-25", boardingPointId: 1 }],
        origin: "not-a-url",
      })
    ).rejects.toThrow();
  });
});

// ─── Admin Access Control Tests ───

describe("Admin Access Control", () => {
  it("blocks unauthenticated users from admin dashboard", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("blocks regular users from admin dashboard", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("blocks unauthenticated users from admin events list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.events.list()).rejects.toThrow();
  });

  it("blocks regular users from admin events list", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.events.list()).rejects.toThrow();
  });

  it("blocks unauthenticated users from admin orders list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.orders.list()).rejects.toThrow();
  });

  it("blocks regular users from admin orders list", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.orders.list()).rejects.toThrow();
  });

  it("blocks unauthenticated users from admin passengers list", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.passengers.list()).rejects.toThrow();
  });

  it("blocks regular users from admin passengers list", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.passengers.list()).rejects.toThrow();
  });

  it("blocks unauthenticated users from creating events", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.admin.events.create({
        name: "Test Event",
        eventDate: "01/01/2027",
        priceCents: 15000,
      })
    ).rejects.toThrow();
  });

  it("blocks regular users from creating events", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.events.create({
        name: "Test Event",
        eventDate: "01/01/2027",
        priceCents: 15000,
      })
    ).rejects.toThrow();
  });

  it("blocks unauthenticated users from check-in", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.admin.passengers.checkIn({ id: 1, status: "checked_in" })
    ).rejects.toThrow();
  });

  it("blocks regular users from check-in", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.admin.passengers.checkIn({ id: 1, status: "checked_in" })
    ).rejects.toThrow();
  });
});

// ─── Public Routes Tests ───

describe("Public Routes", () => {
  it("allows unauthenticated access to active events", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Should not throw - public route
    const result = await caller.events.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows unauthenticated access to event by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Should not throw even if event doesn't exist
    const result = await caller.events.byId({ id: 999999 });
    expect(result === null || result === undefined || typeof result === "object").toBe(true);
  });

  it("allows unauthenticated access to boarding points", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.events.boardingPoints({ eventId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows unauthenticated access to checkout status", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.checkout.status({ sessionId: "nonexistent" });
    expect(result.status).toBe("not_found");
  });

  it("auth.me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Event Validation Tests ───

describe("Admin Event Validation", () => {
  it("rejects event creation with empty name", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.events.create({
        name: "",
        eventDate: "01/01/2027",
        priceCents: 15000,
      })
    ).rejects.toThrow();
  });

  it("rejects event creation with negative price", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.events.create({
        name: "Test Event",
        eventDate: "01/01/2027",
        priceCents: -100,
      })
    ).rejects.toThrow();
  });

  it("rejects event creation with zero price", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.admin.events.create({
        name: "Test Event",
        eventDate: "01/01/2027",
        priceCents: 0,
      })
    ).rejects.toThrow();
  });
});
