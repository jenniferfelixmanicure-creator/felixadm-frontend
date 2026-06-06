import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { checkOverdueInstallments, sendDailySalesSummary, sendUpcomingDueNotification } from "./notifications";

export const appRouter = router({
  system: systemRouter,

  // ============ NOTIFICATIONS ============
  notifications: router({
    checkOverdue: publicProcedure.query(async () => {
      const result = await checkOverdueInstallments();
      return { success: true, count: result?.length || 0 };
    }),

    sendDailySummary: publicProcedure.query(async () => {
      const result = await sendDailySalesSummary();
      return { success: true, count: result?.length || 0 };
    }),

    sendUpcomingDue: publicProcedure.query(async () => {
      const result = await sendUpcomingDueNotification();
      return { success: true, count: result?.length || 0 };
    }),
  }),

  // ============ CLIENTS ============
  clients: router({
    list: publicProcedure.query(() => db.getClientsByUser()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getClientById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createClient(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteClient(input)),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: publicProcedure.query(() => db.getProductsByUser()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getProductById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().or(z.number()),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
      }))
      .mutation(({ input }) => db.createProduct(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().or(z.number()).optional(),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteProduct(input)),
    uploadPhoto: publicProcedure
      .input(z.object({
        productId: z.number(),
        base64: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, 'base64');
        const { url, key } = await storagePut(`products/${input.filename}`, buffer, 'image/jpeg');
        await db.updateProduct(input.productId, { photoUrl: url, photoKey: key });
        return { url, key };
      }),
  }),

  // ============ SALES ============
  sales: router({
    list: publicProcedure.query(() => db.getSalesByUser()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getSaleById(input)),
    create: publicProcedure
      .input(z.object({
        clientId: z.number(),
        productId: z.number(),
        quantity: z.number().default(1),
        totalAmount: z.string().or(z.number()),
        status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createSale(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        productId: z.number().optional(),
        quantity: z.number().optional(),
        totalAmount: z.string().or(z.number()).optional(),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateSale(id, data);
      }),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteSale(input)),
  }),

  // ============ INSTALLMENTS ============
  installments: router({
    list: publicProcedure.query(() => db.getInstallmentsByUser()),
    getBySale: publicProcedure.input(z.number()).query(({ input }) => db.getInstallmentsBySale(input)),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getInstallmentById(input)),
    create: publicProcedure
      .input(z.object({
        saleId: z.number(),
        installmentNumber: z.number(),
        totalInstallments: z.number(),
        amount: z.string().or(z.number()),
        dueDate: z.date(),
        status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createInstallment(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'paid', 'overdue']).optional(),
        paidDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateInstallment(id, data);
      }),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteInstallment(input)),
    createMultiple: publicProcedure
      .input(z.object({
        saleId: z.number(),
        totalAmount: z.string().or(z.number()),
        installmentCount: z.number(),
        dueDate: z.date(),
      }))
      .mutation(({ input }) => db.createInstallmentsForSale(
        input.saleId,
        input.totalAmount,
        input.installmentCount,
        input.dueDate
      )),
  }),
});

export type AppRouter = typeof appRouter;
