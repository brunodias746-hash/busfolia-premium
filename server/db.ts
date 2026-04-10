import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, events, boardingPoints, orders, passengers, payments } from "../drizzle/schema";
import type { InsertEvent, InsertBoardingPoint, InsertOrder, InsertPassenger, InsertPayment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Events ───
export async function getActiveEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.status, "active"));
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.createdAt));
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(events).values(data);
  return result[0].insertId;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Check if event has orders
  const eventOrders = await db.select().from(orders).where(eq(orders.eventId, id)).limit(1);
  if (eventOrders.length > 0) {
    throw new Error("Não é possível deletar um evento com pedidos associados");
  }
  await db.delete(events).where(eq(events.id, id));
}

// ─── Boarding Points ───
export async function getBoardingPointsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boardingPoints).where(and(eq(boardingPoints.eventId, eventId), eq(boardingPoints.isActive, true)));
}

export async function getAllBoardingPointsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boardingPoints).where(eq(boardingPoints.eventId, eventId));
}

export async function getBoardingPointById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(boardingPoints).where(eq(boardingPoints.id, id)).limit(1);
  return result[0];
}

export async function createBoardingPoint(data: InsertBoardingPoint) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(boardingPoints).values(data);
  return result[0].insertId;
}

export async function updateBoardingPoint(id: number, data: Partial<InsertBoardingPoint>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(boardingPoints).set(data).where(eq(boardingPoints.id, id));
}

// ─── Orders ───
function generateShortId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "BF-";
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export async function createOrder(data: Omit<InsertOrder, "shortId">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const shortId = generateShortId();
  const result = await db.insert(orders).values({ ...data, shortId });
  return { id: result[0].insertId, shortId };
}

export async function getOrderByStripeSession(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId)).limit(1);
  return result[0];
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderWithDetails(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order.length) return undefined;
  
  const boardingPoint = await db.select().from(boardingPoints).where(eq(boardingPoints.id, order[0].boardingPointId)).limit(1);
  
  return {
    ...order[0],
    boardingPoint: boardingPoint[0],
  };
}

export async function updateOrderStatus(id: number, status: "pending" | "pending_checkout" | "paid" | "failed" | "canceled") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderStripeSession(id: number, stripeSessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ stripeSessionId }).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  // Delete passengers first (foreign key constraint)
  await db.delete(passengers).where(eq(passengers.orderId, id));
  
  // Delete payments
  await db.delete(payments).where(eq(payments.orderId, id));
  
  // Delete order
  await db.delete(orders).where(eq(orders.id, id));
}

export async function getAllOrders(eventId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (eventId) {
    return db.select().from(orders).where(and(eq(orders.eventId, eventId), eq(orders.status, "paid"))).orderBy(desc(orders.createdAt));
  }
  return db.select().from(orders).where(eq(orders.status, "paid")).orderBy(desc(orders.createdAt));
}

// ─── Passengers ───
export async function createPassengers(data: InsertPassenger[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (data.length === 0) return;
  await db.insert(passengers).values(data);
}

export async function getPassengersByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(passengers).where(eq(passengers.orderId, orderId));
}

export async function getAllPassengers(eventId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (eventId) {
    const orderIds = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.eventId, eventId), eq(orders.status, "paid")));
    if (orderIds.length === 0) return [];
    return db.select().from(passengers).where(inArray(passengers.orderId, orderIds.map(o => o.id)));
  }
  const paidOrderIds = await db.select({ id: orders.id }).from(orders).where(eq(orders.status, "paid"));
  if (paidOrderIds.length === 0) return [];
  return db.select().from(passengers).where(inArray(passengers.orderId, paidOrderIds.map(o => o.id)));
}

export async function updatePassengerCheckIn(id: number, status: "pending" | "checked_in") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(passengers).set({
    checkInStatus: status,
    checkInAt: status === "checked_in" ? new Date() : null,
  }).where(eq(passengers.id, id));
}

// ─── Payments ───
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function getPaymentByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  return result[0];
}

// ─── Dashboard Metrics ───
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, paidOrders: 0, pendingOrders: 0, totalPassengers: 0, totalEvents: 0 };

  const [revenueResult] = await db.select({
    total: sql<number>`COALESCE(SUM(totalAmountCents), 0)`,
  }).from(orders).where(eq(orders.status, "paid"));

  const [orderCounts] = await db.select({
    total: sql<number>`COUNT(*)`,
    paid: sql<number>`SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN status IN ('pending', 'pending_checkout') THEN 1 ELSE 0 END)`,
  }).from(orders);

  const [passengerCount] = await db.select({
    total: sql<number>`COUNT(*)`,
  }).from(passengers);

  const [eventCount] = await db.select({
    total: sql<number>`COUNT(*)`,
  }).from(events).where(eq(events.status, "active"));

  // Recent orders
  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);

  // Events summary - only active events
  const eventsSummary = await db.select().from(events).where(eq(events.status, "active")).orderBy(desc(events.createdAt));

  return {
    totalRevenueCents: Number(revenueResult?.total ?? 0),
    totalOrdersCount: Number(orderCounts?.total ?? 0),
    paidOrdersCount: Number(orderCounts?.paid ?? 0),
    pendingOrdersCount: Number(orderCounts?.pending ?? 0),
    totalPassengers: Number(passengerCount?.total ?? 0),
    activeEventsCount: Number(eventCount?.total ?? 0),
    recentOrders,
    eventsSummary,
  };
}

export async function incrementEventSoldCount(eventId: number, qty: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set({
    soldCount: sql`soldCount + ${qty}`,
  }).where(eq(events.id, eventId));
}


// ─── Financial Data ───
export async function getFinancialData(eventId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Get all paid orders, optionally filtered by event
  const condition = eventId
    ? and(eq(orders.status, "paid"), eq(orders.eventId, eventId))
    : eq(orders.status, "paid");

  const paidOrders = await db.select().from(orders).where(condition).orderBy(desc(orders.createdAt));

  // Aggregate by event
  const eventMap = new Map<number, { eventId: number; eventName: string; totalRevenue: number; totalFees: number; orderCount: number; passengerCount: number }>();

  for (const order of paidOrders) {
    const existing = eventMap.get(order.eventId);
    if (existing) {
      existing.totalRevenue += order.totalAmountCents;
      existing.totalFees += order.feeCents * order.quantity;
      existing.orderCount += 1;
      existing.passengerCount += order.quantity;
    } else {
      const event = await getEventById(order.eventId);
      eventMap.set(order.eventId, {
        eventId: order.eventId,
        eventName: event?.name ?? "Evento desconhecido",
        totalRevenue: order.totalAmountCents,
        totalFees: order.feeCents * order.quantity,
        orderCount: 1,
        passengerCount: order.quantity,
      });
    }
  }

  const byEvent = Array.from(eventMap.values());
  const totalRevenue = byEvent.reduce((sum, e) => sum + e.totalRevenue, 0);
  const totalFees = byEvent.reduce((sum, e) => sum + e.totalFees, 0);
  const totalOrders = byEvent.reduce((sum, e) => sum + e.orderCount, 0);
  const totalPassengers = byEvent.reduce((sum, e) => sum + e.passengerCount, 0);

  return {
    totalRevenue,
    totalFees,
    netRevenue: totalRevenue - totalFees,
    totalOrders,
    totalPassengers,
    byEvent,
    recentOrders: paidOrders.slice(0, 20).map((o) => ({
      id: o.id,
      shortId: o.shortId,
      customerName: o.customerName,
      quantity: o.quantity,
      totalAmountCents: o.totalAmountCents,
      createdAt: o.createdAt,
    })),
  };
}

// ─── Passengers Export ───
export async function getPassengersForExport(eventId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Passengers don't have eventId directly - join through orders
  const baseQuery = db
    .select({ passenger: passengers, order: orders })
    .from(passengers)
    .innerJoin(orders, eq(passengers.orderId, orders.id));

  const allRows = eventId
    ? await baseQuery.where(eq(orders.eventId, eventId)).orderBy(passengers.name)
    : await baseQuery.orderBy(passengers.name);

  // Enrich with event and boarding point data
  const enriched = [];
  for (const row of allRows) {
    const p = row.passenger;
    const order = row.order;
    const event = await getEventById(order.eventId);
    const bp = p.boardingPointId ? await getBoardingPointById(p.boardingPointId) : null;
    enriched.push({
      id: p.id,
      name: p.name,
      cpf: p.cpf,
      eventName: event?.name ?? "",
      orderShortId: order.shortId,
      orderStatus: order.status,
      boardingPoint: bp ? `${bp.city} - ${bp.locationName}` : "",
      transportDate: order.transportDates ? JSON.parse(order.transportDates)[0] : "",
      checkInStatus: p.checkInStatus,
    });
  }
  return enriched;
}

// ─── Export Functions ───
export async function getOrdersForExport(eventId?: number) {
  const db = await getDb();
  if (!db) return [];

  const allRows = eventId
    ? await db.select({ order: orders }).from(orders).where(and(eq(orders.status, "paid"), eq(orders.eventId, eventId))).orderBy(desc(orders.createdAt))
    : await db.select({ order: orders }).from(orders).where(eq(orders.status, "paid")).orderBy(desc(orders.createdAt));

  // Enrich with passenger data
  const enriched = [];
  for (const row of allRows) {
    const order = row.order;
    const passengers = await getPassengersByOrder(order.id);
    const event = await getEventById(order.eventId);
    const bp = passengers[0]?.boardingPointId ? await getBoardingPointById(passengers[0].boardingPointId) : null;
    
    enriched.push({
      pedido: order.shortId,
      nomeCompleto: order.customerName,
      cpf: order.customerCpf,
      telefone: order.customerPhone,
      email: order.customerEmail,
      pontoEmbarque: bp ? `${bp.city} - ${bp.locationName}` : "N/A",
      datasTransporte: order.transportDates ? JSON.parse(order.transportDates).join(", ") : "N/A",
      quantidadePassageiros: order.quantity,
      valorTotal: (order.totalAmountCents / 100).toFixed(2),
      status: "Pago",
      dataCompra: new Date(order.createdAt).toLocaleDateString("pt-BR"),
    });
  }
  return enriched;
}
