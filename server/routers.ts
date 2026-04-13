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
  deleteEvent,
  getBoardingPointsByEvent,
  getAllBoardingPointsByEvent,
  createBoardingPoint,
  updateBoardingPoint,
  createOrder,
  getOrderByStripeSession,
  getOrderById,
  updateOrderStatus,
  updateOrderStripeSession,
  deleteOrder,
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
  getOrderWithDetails,
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
  transportDatesCount: z.number().int().min(1).optional(), // For "multiple" purchase type
  purchaseType: z.enum(["single", "multiple", "all_days"]).default("single"),
  passengers: z.array(passengerSchema).min(1, "Adicione pelo menos 1 passageiro"),
  origin: z.string().url(),
  couponCode: z.string().optional(),
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
    list: publicProcedure.query(async () => {
      return getAllEvents();
    }),
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
    validateCoupon: publicProcedure
      .input(z.object({ couponCode: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const stripe = getStripe();
          
          // Try to retrieve the promotion code from Stripe
          const promotionCodes = await stripe.promotionCodes.list({
            code: input.couponCode.toUpperCase(),
            limit: 1,
          });
          
          if (promotionCodes.data.length === 0) {
            return { valid: false, error: "Código de cupom não encontrado" };
          }
          
          const promoCode = promotionCodes.data[0];
          
          // Check if promotion code is active
          if (!promoCode.active) {
            return { valid: false, error: "Código de cupom inativo" };
          }
          
          // Get the coupon ID (it's a string in the API)
          const couponId = (promoCode as any).coupon as string;
          if (typeof couponId !== 'string') {
            return { valid: false, error: "Cupom não encontrado" };
          }

          
          // Retrieve the full coupon object
          const coupon = await stripe.coupons.retrieve(couponId);
          
          // Check if coupon has expired
          if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
            return { valid: false, error: "Código de cupom expirado" };
          }
          
          // Calculate discount info
          let discountPercentage = 0;
          let discountAmountCents = 0;
          
          if (coupon.percent_off) {
            discountPercentage = coupon.percent_off;
          } else if (coupon.amount_off) {
            discountAmountCents = coupon.amount_off;
          }
          
          return {
            valid: true,
            couponId: coupon.id,
            promoCodeId: promoCode.id,
            discountPercentage,
            discountAmountCents,
            maxRedemptions: coupon.max_redemptions,
            timesRedeemed: coupon.times_redeemed,
          };
        } catch (err: any) {
          console.error("[Coupon Validation] Error:", err.message);
          return { valid: false, error: "Erro ao validar cupom" };
        }
      }),

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
      let unitPriceCents = event.priceCents;
      let feeCents = event.feeCents;
      let daysCount = 1; // Default for single day
      
      // For "multiple" (Múltiplos Dias), calculate price based on number of selected dates
      if (input.purchaseType === "multiple") {
        daysCount = input.transportDatesCount || 1;
        unitPriceCents = event.priceCents * daysCount; // R$ 60 × number of days
        feeCents = event.feeCents * daysCount; // R$ 6,10 × number of days
      }
      // For "all_days" (Passaporte), use fixed price of R$ 200,00
      else if (input.purchaseType === "all_days") {
        unitPriceCents = 20000; // R$ 200,00 in cents
        feeCents = 610; // R$ 6,10 fee for all_days (fixed, not multiplied)
      }
      
      const totalAmountCents = (unitPriceCents + feeCents) * qty;

      // 4. Create order in DB
      const { id: orderId, shortId } = await createOrder({
        eventId: input.eventId,
        customerName: input.customerName,
        customerCpf: input.customerCpf.replace(/\D/g, ""),
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone.replace(/\D/g, ""),
        boardingPointId: input.boardingPointId,
        transportDates: input.purchaseType === "all_days" ? JSON.stringify(["Todos os Dias"]) : JSON.stringify([input.transportDate]),
        purchaseType: input.purchaseType,
        quantity: qty,
        unitPriceCents,
        feeCents,
        totalAmountCents,
        status: "pending_checkout",
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
      
      // Build discounts array for Stripe - use promotion code ID if coupon provided
      const discounts: Array<{ promotion_code?: string }> = [];
      if (input.couponCode) {
        // Validate coupon and get promotion code ID
        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: input.couponCode.toUpperCase(),
            limit: 1,
          });
          
          if (promotionCodes.data.length > 0) {
            const promoCode = promotionCodes.data[0];
            if (promoCode.active) {
              discounts.push({ promotion_code: promoCode.id });
            }
          }
        } catch (err: any) {
          console.error("[Stripe] Error validating coupon:", err.message);
        }
      }
      
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
          coupon_code: input.couponCode || "",
        },
        customer_email: input.customerEmail,
        success_url: `${input.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/falha?session_id={CHECKOUT_SESSION_ID}`,
        payment_intent_data: {
          description: `BusFolia - ${event.name} - Pedido ${shortId}`,
        },
        // Only use discounts if a coupon is provided, otherwise allow promotion codes
        ...(discounts.length > 0 ? { discounts } : { allow_promotion_codes: true }),
      });

      // 7. Save stripe session ID to order
      await updateOrderStripeSession(orderId, session.id);

      return { checkoutUrl: session.url, sessionId: session.id, orderId, shortId };
    }),

    // Polling endpoint for success page
    status: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
         let order = await getOrderByStripeSession(input.sessionId);
        if (!order) return { status: "not_found" as const, order: null };;
        
        // If order is still pending_checkout, verify with Stripe and update if needed
        if (order.status === "pending_checkout") {
          try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(input.sessionId);
            
            // If payment was successful but not yet marked as paid, update it
            if (session.payment_status === "paid" && order.status === "pending_checkout") {
              console.log(`[Status Check] Session ${input.sessionId} shows paid, updating order ${order.shortId}`);
              
              // Update order status
              await updateOrderStatus(order.id, "paid");
              
              // Create payment record if not exists
              await createPayment({
                orderId: order.id,
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
                stripeSessionId: session.id,
                method: session.payment_method_types?.[0] ?? "card",
                amountReceivedCents: session.amount_total ?? order.totalAmountCents,
                status: "succeeded",
                processedAt: new Date(),
              });
              
              // Increment sold count
              await incrementEventSoldCount(order.eventId, order.quantity);
              
              // Send confirmation email
              const orderDetails = await getOrderWithDetails(order.id);
              if (orderDetails && orderDetails.boardingPoint) {
                const { sendEmail, generateOrderConfirmationEmail } = await import("./_core/email");
                const boardingPointLabel = `${orderDetails.boardingPoint.city} - ${orderDetails.boardingPoint.locationName}`;
                const transportDates = JSON.parse(orderDetails.transportDates || "[]") as string[];
                
                const emailHtml = generateOrderConfirmationEmail({
                  customerName: orderDetails.customerName,
                  customerEmail: orderDetails.customerEmail,
                  shortId: orderDetails.shortId,
                  boardingPoint: boardingPointLabel,
                  transportDates,
                  quantity: orderDetails.quantity,
                  totalAmountCents: orderDetails.totalAmountCents,
                  whatsappLink: "https://chat.whatsapp.com/KjaIneid0P9F6JScKsV7Po",
                });
                
                await sendEmail({
                  to: orderDetails.customerEmail,
                  subject: `Confirmação de Pedido - BusFolia ${orderDetails.shortId}`,
                  html: emailHtml,
                });
              }
              
              // CRITICAL: Re-fetch order from database to get updated status
              order = await getOrderByStripeSession(input.sessionId);
              console.log(`[Status Check] Order re-fetched after update: ${order?.shortId} status=${order?.status}`);
            }
          } catch (err: any) {
            console.error(`[Status Check] Error verifying session ${input.sessionId}:`, err.message);
            // Continue anyway, return current status
          }
        }
        
        if (!order) return { status: "not_found" as const, order: null };
        
        const passengers = await getPassengersByOrder(order.id);
        const event = await getEventById(order.eventId);
        const orderDetails = await getOrderWithDetails(order.id);
        const transportDates = order.transportDates ? JSON.parse(order.transportDates) as string[] : [];
        const boardingPointLabel = orderDetails?.boardingPoint ? `${orderDetails.boardingPoint.city} - ${orderDetails.boardingPoint.locationName}` : "";
        
        return {
          status: order.status,
          order: {
            shortId: order.shortId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            quantity: order.quantity,
            unitPriceCents: order.unitPriceCents,
            feeCents: order.feeCents,
            totalAmountCents: order.totalAmountCents,
            transportDate: transportDates[0] ?? "",
            transportDates: transportDates,
            eventName: event?.name ?? "",
            boardingPoint: boardingPointLabel,
            purchaseType: order.purchaseType,
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
      delete: adminProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input }) => {
          await deleteEvent(input.id);
          return { success: true };
        }),
      uploadBanner: adminProcedure
        .input(
          z.object({
            eventId: z.number().int().positive(),
            bannerBase64: z.string(),
            mimeType: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          const { storagePut } = await import("./storage");
          const sharp = await import("sharp");
          
          if (!input.mimeType.startsWith("image/")) {
            throw new Error("Only image files are allowed");
          }
          
          const buffer = Buffer.from(input.bannerBase64, "base64");
          const metadata = await sharp.default(buffer).metadata();
          
          if (metadata.width !== 1920 || metadata.height !== 780) {
            throw new Error(`Banner must be 1920x780px. Current: ${metadata.width}x${metadata.height}`);
          }
          
          const fileKey = `banners/event-${input.eventId}-${Date.now()}.jpg`;
          const { url } = await storagePut(fileKey, buffer, "image/jpeg");
          
          await updateEvent(input.eventId, { bannerUrl: url });
          
          return { success: true, url };
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
      delete: adminProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input }) => {
          await deleteOrder(input.id);
          return { success: true };
        }),
      exportCsv: adminProcedure
        .input(z.object({ eventId: z.number().optional() }).optional())
        .query(async ({ input }) => {
          const { getOrdersForExport } = await import("./db");
          return getOrdersForExport(input?.eventId);
        }),
      resendEmail: adminProcedure
        .input(z.object({ orderId: z.number().int().positive() }))
        .mutation(async ({ input }) => {
          const order = await getOrderById(input.orderId);
          if (!order) throw new Error("Pedido não encontrado");
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({ title: "Email de Confirmação Reenviado", content: `Pedido ${order.shortId} - ${order.customerName} (${order.customerEmail})` });
          return { success: true, message: "Email reenviado com sucesso" };
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
