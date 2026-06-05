import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, products, sales, installments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CLIENTS ============
export async function getClientsByUser() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, 1));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(clients).values({
    ...data,
    userId: 1,
  });
}

export async function updateClient(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(clients).where(eq(clients.id, id));
}

// ============ PRODUCTS ============
export async function getProductsByUser() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, 1));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(products).values({
    ...data,
    userId: 1,
  });
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(products).where(eq(products.id, id));
}

// ============ SALES ============
export async function getSalesByUser() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).where(eq(sales.userId, 1));
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result[0];
}

export async function createSale(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(sales).values({
    ...data,
    userId: 1,
  });
}

export async function updateSale(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(sales).set(data).where(eq(sales.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(sales).where(eq(sales.id, id));
}

// ============ INSTALLMENTS ============
export async function getInstallmentsByUser() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installments).where(eq(installments.userId, 1));
}

export async function getInstallmentsBySale(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(installments).where(eq(installments.saleId, saleId));
}

export async function getInstallmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(installments).where(eq(installments.id, id)).limit(1);
  return result[0];
}

export async function createInstallment(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(installments).values({
    ...data,
    userId: 1,
  });
}

export async function updateInstallment(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(installments).set(data).where(eq(installments.id, id));
}

export async function deleteInstallment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(installments).where(eq(installments.id, id));
}

// ============ BATCH OPERATIONS ============
export async function createInstallmentsForSale(
  saleId: number,
  totalAmount: number | string,
  installmentCount: number,
  dueDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const total = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
  const installmentAmount = (total / installmentCount).toFixed(2);
  const installmentsList = [];

  for (let i = 1; i <= installmentCount; i++) {
    const newDueDate = new Date(dueDate);
    newDueDate.setMonth(newDueDate.getMonth() + (i - 1));

    installmentsList.push({
      saleId,
      installmentNumber: i,
      totalInstallments: installmentCount,
      amount: installmentAmount as any,
      dueDate: newDueDate,
      status: 'pending' as const,
      userId: 1,
    });
  }

  return db.insert(installments).values(installmentsList as any);
}
