import { adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getPassengersForExport,
  getOrdersForExport,
  getFinancialData,
  getAllOrders,
  getAllPassengers,
  getBoardingPointById,
  getEventById,
  getPassengersByOrder,
} from "../db";
import type { ExportInput, DashboardMetrics } from "../_core/professional-export";

/**
 * Build dashboard metrics from all orders (not just paid) to show full picture
 */
async function buildDashboardMetrics(eventId?: number): Promise<DashboardMetrics> {
  // We need ALL orders (not just paid) for dashboard metrics
  const { getDb } = await import("../db");
  const { orders, passengers } = await import("../../drizzle/schema");
  const { eq, and, inArray, desc } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) {
    return { totalPassengers: 0, paidPassengers: 0, pendingPassengers: 0, canceledPassengers: 0, boardingPointCounts: {} };
  }

  // Get all orders (all statuses) for the event
  let allOrders;
  if (eventId) {
    allOrders = await db.select().from(orders).where(eq(orders.eventId, eventId));
  } else {
    allOrders = await db.select().from(orders);
  }

  // Count passengers by order status
  let totalPassengers = 0;
  let paidPassengers = 0;
  let pendingPassengers = 0;
  let canceledPassengers = 0;

  for (const order of allOrders) {
    const qty = order.quantity;
    totalPassengers += qty;
    if (order.status === "paid") {
      paidPassengers += qty;
    } else if (order.status === "pending" || order.status === "pending_checkout") {
      pendingPassengers += qty;
    } else if (order.status === "canceled" || order.status === "failed") {
      canceledPassengers += qty;
    }
  }

  // Get boarding point distribution (from paid orders only for meaningful data)
  const paidOrders = allOrders.filter(o => o.status === "paid");
  const boardingPointCounts: Record<string, number> = {};

  for (const order of paidOrders) {
    const orderPassengers = await getPassengersByOrder(order.id);
    for (const p of orderPassengers) {
      if (p.boardingPointId) {
        const bp = await getBoardingPointById(p.boardingPointId);
        const bpName = bp ? `${bp.city} - ${bp.locationName}` : "Não informado";
        boardingPointCounts[bpName] = (boardingPointCounts[bpName] || 0) + 1;
      }
    }
  }

  return {
    totalPassengers,
    paidPassengers,
    pendingPassengers,
    canceledPassengers,
    boardingPointCounts,
  };
}

export const exportsRouter = router({
  generatePedidos: adminProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");

      const eventId = input?.eventId;
      const [passengers, orders, financialData, dashboardMetrics] = await Promise.all([
        getPassengersForExport(eventId),
        getOrdersForExport(eventId),
        getFinancialData(eventId),
        buildDashboardMetrics(eventId),
      ]);

      const buffer = await generateProfessionalExport({
        passengers,
        orders,
        financialData,
        dashboardMetrics,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `busfolia-pedidos-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  generatePassageiros: adminProcedure
    .input(z.object({ eventId: z.number().optional(), paidOnly: z.boolean().default(true) }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");

      const eventId = input?.eventId;
      // getPassengersForExport already joins on paid orders
      const [passengers, orders, financialData, dashboardMetrics] = await Promise.all([
        getPassengersForExport(eventId),
        getOrdersForExport(eventId),
        getFinancialData(eventId),
        buildDashboardMetrics(eventId),
      ]);

      const buffer = await generateProfessionalExport({
        passengers,
        orders,
        financialData,
        dashboardMetrics,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `busfolia-passageiros-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  generateFinanceiro: adminProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");

      const eventId = input?.eventId;
      const [passengers, orders, financialData, dashboardMetrics] = await Promise.all([
        getPassengersForExport(eventId),
        getOrdersForExport(eventId),
        getFinancialData(eventId),
        buildDashboardMetrics(eventId),
      ]);

      const buffer = await generateProfessionalExport({
        passengers,
        orders,
        financialData,
        dashboardMetrics,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `busfolia-financeiro-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),
});
