import { getDb } from "./db";
import { manualPassengers, boardingPoints } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

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

  const result = await db.insert(manualPassengers).values({
    eventId: data.eventId,
    name: data.name,
    travelDate: data.travelDate,
    boardingPointId: data.boardingPointId,
    referenceOrderId: data.referenceOrderId,
    createdBy: data.createdBy,
  });

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
