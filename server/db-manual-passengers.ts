import { drizzle } from "drizzle-orm/mysql2";
import { manualPassengers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";

export async function createManualPassenger(input: {
  eventId: number;
  name: string;
  travelDate: string; // ISO format: YYYY-MM-DD
  boardingPointId: number;
  referenceOrderId?: string;
  notes?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const result = await db.insert(manualPassengers).values({
    eventId: input.eventId,
    name: input.name,
    travelDate: input.travelDate,
    boardingPointId: input.boardingPointId,
    referenceOrderId: input.referenceOrderId || null,
    notes: input.notes || null,
    createdBy: input.createdBy,
  });

  return result;
}

export async function getManualPassengersByEventAndDate(eventId: number, travelDate: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(manualPassengers)
    .where(and(eq(manualPassengers.eventId, eventId), eq(manualPassengers.travelDate, travelDate)));
}

export async function getManualPassengersByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(manualPassengers).where(eq(manualPassengers.eventId, eventId));
}

export async function deleteManualPassenger(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  await db.delete(manualPassengers).where(eq(manualPassengers.id, id));
}

export async function getManualPassengerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(manualPassengers).where(eq(manualPassengers.id, id)).limit(1);
  return result[0];
}
