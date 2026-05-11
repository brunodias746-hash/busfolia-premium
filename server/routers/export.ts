import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { generateProfessionalExport } from "../_core/professional-export";
import { getAllOrders, getAllPassengers } from "../db";

export const exportRouter = router({
  // Generate professional Excel export
  generateProfessionalExcel: protectedProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        paymentStatus: z.enum(["all", "paid", "pending", "canceled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch orders and passengers
        let orders = await getAllOrders();
        let passengers = await getAllPassengers();

        // Filter by event if provided
        if (input.eventId) {
          orders = orders.filter((o: any) => o.eventId === input.eventId);
          passengers = passengers.filter((p: any) => p.eventId === input.eventId);
        }

        // Filter by date range if provided
        if (input.startDate && input.endDate) {
          const start = new Date(input.startDate);
          const end = new Date(input.endDate);
          orders = orders.filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= start && orderDate <= end;
          });
        }

        // Filter by payment status
        if (input.paymentStatus && input.paymentStatus !== "all") {
          orders = orders.filter((o: any) => o.paymentStatus === input.paymentStatus);
          passengers = passengers.filter((p: any) => {
            const order = orders.find((o: any) => o.id === p.orderId);
            return !!order;
          });
        }

        // Get event name
        const event = (orders[0] as any)?.event;
        const eventName = event?.name || "Relatório de Exportação";
        const eventDate = event?.eventDate || new Date().toLocaleDateString("pt-BR");

        // Generate Excel
        const buffer = await generateProfessionalExport({
          orders,
          passengers,
          eventName,
          eventDate,
        });

        // Return buffer as base64
        return {
          success: true,
          data: buffer.toString("base64"),
          filename: `busfolia-relatorio-${new Date().toISOString().split("T")[0]}.xlsx`,
        };
      } catch (error) {
        console.error("Export error:", error);
        return {
          success: false,
          error: "Erro ao gerar relatório. Tente novamente.",
        };
      }
    }),

  // Get export history
  getExportHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx }) => {
      // This would typically fetch from a database table tracking exports
      // For now, returning empty array
      return {
        exports: [],
        total: 0,
      };
    }),
});
