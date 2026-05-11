import { adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getAllOrders, getAllPassengers, getEventById } from "../db";

export const exportsRouter = router({
  generatePedidos: adminProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");
      let orders = await getAllOrders();

      if (input?.eventId) {
        orders = orders.filter((o: any) => o.eventId === input.eventId);
      }

      const passengers = await getAllPassengers();
      const eventName = "Relatório de Pedidos";
      const eventDate = new Date().toLocaleDateString("pt-BR");

      const buffer = await generateProfessionalExport({
        orders,
        passengers,
        eventName,
        eventDate,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `pedidos-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  generatePassageiros: adminProcedure
    .input(z.object({ eventId: z.number().optional(), paidOnly: z.boolean().default(true) }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");
      let orders = await getAllOrders();
      let passengers = await getAllPassengers();

      if (input?.eventId) {
        orders = orders.filter((o: any) => o.eventId === input.eventId);
      }

      // Filter for paid passengers only (business rule)
      if (input?.paidOnly !== false) {
        passengers = passengers.filter((p: any) => p.paymentStatus === "paid");
      }

      const eventName = "Relatório de Passageiros";
      const eventDate = new Date().toLocaleDateString("pt-BR");

      const buffer = await generateProfessionalExport({
        orders,
        passengers,
        eventName,
        eventDate,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `passageiros-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  generateFinanceiro: adminProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .mutation(async ({ input }) => {
      const { generateProfessionalExport } = await import("../_core/professional-export");
      let orders = await getAllOrders();

      if (input?.eventId) {
        orders = orders.filter((o: any) => o.eventId === input.eventId);
      }

      const passengers = await getAllPassengers();
      const eventName = "Relatório Financeiro";
      const eventDate = new Date().toLocaleDateString("pt-BR");

      const buffer = await generateProfessionalExport({
        orders,
        passengers,
        eventName,
        eventDate,
      });

      return {
        success: true,
        data: buffer.toString("base64"),
        filename: `financeiro-${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),
});
