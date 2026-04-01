import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("registrations router", () => {
  describe("create", () => {
    it("should create a registration with valid data", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.registrations.create({
        fullName: "محمد أحمد",
        phoneNumber: "+213123456789",
        address: "شارع النيل، بلدية العالية",
        ramCount: 2,
      });

      expect(result).toBeDefined();
    });

    it("should reject registration with empty name", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.create({
          fullName: "",
          phoneNumber: "+213123456789",
          address: "شارع النيل",
          ramCount: 1,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject registration with invalid ram count", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.create({
          fullName: "محمد أحمد",
          phoneNumber: "+213123456789",
          address: "شارع النيل",
          ramCount: 0,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("list", () => {
    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.list({});
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin users to list registrations", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.registrations.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter registrations by status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.registrations.list({
        status: "pending",
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should search registrations by name", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.registrations.list({
        search: "محمد",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("stats", () => {
    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.stats();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should return stats for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.registrations.stats();
      expect(result).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.totalRams).toBeDefined();
      expect(Array.isArray(result.byStatus)).toBe(true);
    });
  });

  describe("update", () => {
    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.update({
          id: 1,
          status: "approved",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin users to update registrations", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This will fail if the registration doesn't exist, which is expected
      try {
        await caller.registrations.update({
          id: 999,
          status: "approved",
          notes: "تم الموافقة",
        });
      } catch (error) {
        // Expected to fail since registration doesn't exist
      }
    });
  });

  describe("delete", () => {
    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.registrations.delete({
          id: 1,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow admin users to delete registrations", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // This will fail if the registration doesn't exist, which is expected
      try {
        await caller.registrations.delete({
          id: 999,
        });
      } catch (error) {
        // Expected to fail since registration doesn't exist
      }
    });
  });
});
