import { getDb } from "./db";
import { manualPassengers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function createManualPassenger(data: {
  eventId: number;
  name: string;
  travelDate: string;
  boardingPointId: number;
  referenceOrderId: string | null;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use raw SQL to insert without the notes column to avoid default issues
  const result = await db.execute(
    sql`INSERT INTO manual_passengers (eventId, name, travelDate, boardingPointId, referenceOrderId, createdBy, createdAt) 
        VALUES (${data.eventId}, ${data.name}, ${data.travelDate}, ${data.boardingPointId}, ${data.referenceOrderId}, ${data.createdBy}, NOW())`
  );

  return result;
}

export async function getManualPassengersByEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(manualPassengers)
    .where(eq(manualPassengers.eventId, eventId));
}

export async function deleteManualPassenger(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(manualPassengers).where(eq(manualPassengers.id, id));
}
