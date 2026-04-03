import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getActiveEvents,
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  getBoardingPointsByEvent,
  getAllBoardingPointsByEvent,
  createBoardingPoint,
  updateBoardingPoint,
  createOrder,
  getOrderByStripeSession,
  getOrderById,
  updateOrderStatus,
  updateOrderStripeSession,
  getAllOrders,
  createPassengers,
  getPassengersByOrder,
  getAllPassengers,
  updatePassengerCheckIn,
  createPayment,
  getDashboardMetrics,
  incrementEventSoldCount,
  getFinancialData,
  getPassengersForExport,
} from "./db";
import { getStripe } from "./lib/stripe";

// ─── Validation helpers ───
function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned.charAt(10));
}

const passengerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().refine(validateCPF, "CPF inválido"),
  boardingPointId: z.number().int().positive(),
});

const checkoutSchema = z.object({
  eventId: z.number().int().positive(),
  customerName: z.string().min(3),
  customerCpf: z.string().refine(validateCPF, "CPF inválido"),
  customerEmail: z.string().email("E-mail inválido"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  boardingPointId: z.number().int().positive(),
  transportDate: z.string().min(1),
  passengers: z.array(passengerSchema).min(1, "Adicione pelo menos 1 passageiro"),
  origin: z.string().url(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public: Events ───
  events: router({
    active: publicProcedure.query(async () => {
      return getActiveEvents();
    }),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getEventById(input.id);
    }),
    boardingPoints: publicProcedure.input(z.object({ eventId: z.number() })).query(async ({ input }) => {
      return getBoardingPointsByEvent(input.eventId);
    }),
  }),

  // ─── Public: Checkout ───
  checkout: router({
    createSession: publicProcedure.input(checkoutSchema).mutation(async ({ input }) => {
      // 1. Validate event exists and is active
      const event = await getEventById(input.eventId);
      if (!event) throw new Error("Evento não encontrado");
      if (event.status !== "active") throw new Error("Evento não está disponível para compra");

      // 2. Check capacity
      const qty = input.passengers.length;
      if (event.soldCount + qty > event.capacity) {
        throw new Error(`Apenas ${event.capacity - event.soldCount} vagas restantes`);
      }

      // 3. Calculate total
      const unitPriceCents = event.priceCents;
      const feeCents = event.feeCents;
      const totalAmountCents = (unitPriceCents + feeCents) * qty;

      // 4. Create order in DB
      const { id: orderId, shortId } = await createOrder({
        eventId: input.eventId,
        customerName: input.customerName,
        customerCpf: input.customerCpf.replace(/\D/g, ""),
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone.replace(/\D/g, ""),
        boardingPointId: input.boardingPointId,
        transportDate: input.transportDate,
        quantity: qty,
        unitPriceCents,
        feeCents,
        totalAmountCents,
        status: "pending",
      });

      // 5. Create passengers
      await createPassengers(
        input.passengers.map((p) => ({
          orderId,
          name: p.name,
          cpf: p.cpf.replace(/\D/g, ""),
          boardingPointId: p.boardingPointId,
        }))
      );

      // 6. Create Stripe Checkout Session
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: `${event.name} - Passagem`,
                description: `${qty} passageiro(s) | Pedido ${shortId}`,
              },
              unit_amount: unitPriceCents + feeCents,
            },
            quantity: qty,
          },
        ],
        metadata: {
          order_id: orderId.toString(),
          short_id: shortId,
          event_id: input.eventId.toString(),
          quantity: qty.toString(),
        },
        customer_email: input.customerEmail,
        success_url: `${input.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/falha?session_id={CHECKOUT_SESSION_ID}`,
      });

      // 7. Save stripe session ID to order
      await updateOrderStripeSession(orderId, session.id);

      return { checkoutUrl: session.url, sessionId: session.id, orderId, shortId };
    }),

    // Polling endpoint for success page
    status: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByStripeSession(input.sessionId);
        if (!order) return { status: "not_found" as const, order: null };
        const passengers = await getPassengersByOrder(order.id);
        const event = await getEventById(order.eventId);
        return {
          status: order.status,
          order: {
            shortId: order.shortId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            quantity: order.quantity,
            totalAmountCents: order.totalAmountCents,
            transportDate: order.transportDate,
            eventName: event?.name ?? "",
          },
          passengers: passengers.map((p) => ({ name: p.name, cpf: p.cpf })),
        };
      }),
  }),

  // ─── Admin: Dashboard ───
  admin: router({
    dashboard: adminProcedure.query(async () => {
      return getDashboardMetrics();
    }),

    // Events CRUD
    events: router({
      list: adminProcedure.query(async () => {
        return getAllEvents();
      }),
      create: adminProcedure
        .input(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            eventDate: z.string().min(1),
            priceCents: z.number().int().positive(),
            feeCents: z.number().int().min(0).default(0),
            packagePriceCents: z.number().int().positive().optional(),
            packageLabel: z.string().optional(),
            capacity: z.number().int().positive().default(200),
            groupLink: z.string().optional(),
            status: z.enum(["draft", "active", "sold_out", "finished"]).default("active"),
          })
        )
        .mutation(async ({ input }) => {
          const id = await createEvent(input);
          return { id };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            eventDate: z.string().optional(),
            priceCents: z.number().int().positive().optional(),
            feeCents: z.number().int().min(0).optional(),
            packagePriceCents: z.number().int().positive().optional().nullable(),
            packageLabel: z.string().optional().nullable(),
            capacity: z.number().int().positive().optional(),
            groupLink: z.string().optional().nullable(),
            status: z.enum(["draft", "active", "sold_out", "finished"]).optional(),
          })
        )
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await updateEvent(id, data);
          return { success: true };
        }),
    }),

    // Boarding Points
    boardingPoints: router({
      list: adminProcedure.input(z.object({ eventId: z.number() })).query(async ({ input }) => {
        return getAllBoardingPointsByEvent(input.eventId);
      }),
      create: adminProcedure
        .input(
          z.object({
            eventId: z.number().int().positive(),
            city: z.string().min(1),
            locationName: z.string().min(1),
            meetingTime: z.string().optional(),
            departureTime: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const id = await createBoardingPoint(input);
          return { id };
        }),
      update: adminProcedure
        .input(
          z.object({
            id: z.number().int().positive(),
            city: z.string().optional(),
            locationName: z.string().optional(),
            meetingTime: z.string().optional(),
            departureTime: z.string().optional(),
            isActive: z.boolean().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await updateBoardingPoint(id, data);
          return { success: true };
        }),
    }),

    // Orders
    orders: router({
      list: adminProcedure
        .input(z.object({ eventId: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return getAllOrders(input?.eventId);
        }),
      byId: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) return null;
        const passengers = await getPassengersByOrder(order.id);
        const event = await getEventById(order.eventId);
        return { ...order, passengers, eventName: event?.name };
      }),
    }),

    // Passengers
    passengers: router({
      list: adminProcedure
        .input(z.object({ eventId: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return getAllPassengers(input?.eventId);
        }),
      checkIn: adminProcedure
        .input(z.object({ id: z.number(), status: z.enum(["pending", "checked_in"]) }))
        .mutation(async ({ input }) => {
          await updatePassengerCheckIn(input.id, input.status);
          return { success: true };
        }),
      exportCsv: adminProcedure
        .input(z.object({ eventId: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return getPassengersForExport(input?.eventId);
        }),
    }),

    // Financial
    financial: router({
      summary: adminProcedure
        .input(z.object({ eventId: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return getFinancialData(input?.eventId);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
