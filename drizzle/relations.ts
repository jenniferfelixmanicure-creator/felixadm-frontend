import { relations } from "drizzle-orm";
import { clients, products, sales, installments } from "./schema";

export const clientsRelations = relations(clients, ({ many }) => ({
  sales: many(sales),
}));

export const productsRelations = relations(products, ({ many }) => ({
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
  installments: many(installments),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  sale: one(sales, {
    fields: [installments.saleId],
    references: [sales.id],
  }),
}));
