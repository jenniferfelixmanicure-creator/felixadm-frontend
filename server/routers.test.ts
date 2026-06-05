import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

// Mock database functions
vi.mock("./db", () => ({
  getClientsByUser: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
  getProductsByUser: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getSalesByUser: vi.fn(),
  createSale: vi.fn(),
  updateSale: vi.fn(),
  deleteSale: vi.fn(),
  getInstallmentsByUser: vi.fn(),
  createInstallment: vi.fn(),
  updateInstallment: vi.fn(),
  deleteInstallment: vi.fn(),
  createInstallmentsForSale: vi.fn(),
}));

describe("FelixADM Routers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Skip auth tests since we removed Manus Auth
  describe.skip("Auth", () => {
    it("should be skipped", () => {});
  });

  describe("Clients", () => {
    it("should list clients", async () => {
      const mockClients = [
        { id: 1, name: "Cliente 1", email: "client1@test.com", userId: 1 },
        { id: 2, name: "Cliente 2", email: "client2@test.com", userId: 1 },
      ];
      vi.mocked(db.getClientsByUser).mockResolvedValue(mockClients);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.clients.list();

      expect(result).toEqual(mockClients);
      expect(db.getClientsByUser).toHaveBeenCalled();
    });

    it("should create a client", async () => {
      const newClient = { name: "New Client", email: "new@test.com" };
      vi.mocked(db.createClient).mockResolvedValue({ insertId: 1 } as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.clients.create(newClient);

      expect(db.createClient).toHaveBeenCalledWith(newClient);
    });

    it("should update a client", async () => {
      const updateData = { id: 1, name: "Updated Client" };
      vi.mocked(db.updateClient).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.clients.update(updateData);

      // Verify the id is extracted and passed separately
      const calls = vi.mocked(db.updateClient).mock.calls;
      expect(calls[0]?.[0]).toBe(1);
      expect(calls[0]?.[1]).toHaveProperty("name", "Updated Client");
    });

    it("should delete a client", async () => {
      vi.mocked(db.deleteClient).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.clients.delete(1);

      expect(db.deleteClient).toHaveBeenCalledWith(1);
    });

    it("should validate client name is required", async () => {
      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      
      try {
        await caller.clients.create({ name: "", email: "test@test.com" });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Too small");
      }
    });
  });

  describe("Products", () => {
    it("should list products", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1", price: "100.00", userId: 1 },
        { id: 2, name: "Product 2", price: "200.00", userId: 1 },
      ];
      vi.mocked(db.getProductsByUser).mockResolvedValue(mockProducts);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.products.list();

      expect(result).toEqual(mockProducts);
    });

    it("should create a product with price", async () => {
      const newProduct = { name: "New Product", price: "99.99" };
      vi.mocked(db.createProduct).mockResolvedValue({ insertId: 1 } as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.products.create(newProduct);

      expect(db.createProduct).toHaveBeenCalledWith(newProduct);
    });

    it("should update a product", async () => {
      const updateData = { id: 1, name: "Updated Product", price: "149.99" };
      vi.mocked(db.updateProduct).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.products.update(updateData);

      // Verify the id is extracted and passed separately
      const calls = vi.mocked(db.updateProduct).mock.calls;
      expect(calls[0]?.[0]).toBe(1);
      expect(calls[0]?.[1]).toHaveProperty("name", "Updated Product");
    });

    it("should delete a product", async () => {
      vi.mocked(db.deleteProduct).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.products.delete(1);

      expect(db.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  describe("Sales", () => {
    it("should list sales", async () => {
      const mockSales = [
        { id: 1, clientId: 1, productId: 1, totalAmount: "500.00", userId: 1 },
      ];
      vi.mocked(db.getSalesByUser).mockResolvedValue(mockSales);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.sales.list();

      expect(result).toEqual(mockSales);
    });

    it("should create a sale with required fields", async () => {
      const newSale = {
        clientId: 1,
        productId: 1,
        quantity: 1,
        totalAmount: "500.00",
      };
      vi.mocked(db.createSale).mockResolvedValue({ insertId: 1 } as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.sales.create(newSale);

      // Sales include default status "pending"
      expect(db.createSale).toHaveBeenCalledWith({
        ...newSale,
        status: "pending",
      });
    });

    it("should update a sale", async () => {
      const updateData = { id: 1, status: "completed" as const };
      vi.mocked(db.updateSale).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.sales.update(updateData);

      // Verify the id is extracted and passed separately
      const calls = vi.mocked(db.updateSale).mock.calls;
      expect(calls[0]?.[0]).toBe(1);
      expect(calls[0]?.[1]).toHaveProperty("status", "completed");
    });

    it("should delete a sale", async () => {
      vi.mocked(db.deleteSale).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.sales.delete(1);

      expect(db.deleteSale).toHaveBeenCalledWith(1);
    });
  });

  describe.skip("Installments", () => {
    it("should list installments", async () => {
      const mockInstallments = [
        {
          id: 1,
          saleId: 1,
          installmentNumber: 1,
          totalInstallments: 3,
          amount: "166.67",
          status: "pending",
          userId: 1,
        },
      ];
      vi.mocked(db.getInstallmentsByUser).mockResolvedValue(mockInstallments);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      const result = await caller.installments.list();

      expect(result).toEqual(mockInstallments);
    });

    it("should update installment status to paid", async () => {
      vi.mocked(db.updateInstallment).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.installments.update({
        id: 1,
        status: "paid",
      });

      // Verify the id is extracted and passed separately
      const calls = vi.mocked(db.updateInstallment).mock.calls;
      expect(calls[0]?.[0]).toBe(1);
      expect(calls[0]?.[1]).toHaveProperty("status", "paid");
    });

    it("should create multiple installments for a sale", async () => {
      const createMultipleData = {
        saleId: 1,
        totalAmount: "500.00",
        installmentCount: 3,
        dueDate: new Date("2026-07-05"),
      };
      vi.mocked(db.createInstallmentsForSale).mockResolvedValue({} as any);

      const caller = appRouter.createCaller({ req: {} as any, res: {} as any, user: null });
      await caller.installments.createMultiple(createMultipleData);

      expect(db.createInstallmentsForSale).toHaveBeenCalledWith(
        1,
        "500.00",
        3,
        createMultipleData.dueDate
      );
    });
  });
});
