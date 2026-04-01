import { count, desc, eq, gte, lte, or, sum } from "drizzle-orm";
import { like } from "drizzle-orm/sql";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertRegistration, registrations, users } from "../drizzle/schema";
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

export async function createRegistration(data: InsertRegistration) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(registrations).values(data);
  return result;
}

export async function getRegistrations(filters?: {
  status?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let query = db.select().from(registrations) as any;

  if (filters?.status) {
    query = query.where(eq(registrations.status, filters.status as any));
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      or(
        like(registrations.fullName, searchTerm),
        like(registrations.phoneNumber, searchTerm),
        like(registrations.address, searchTerm)
      )
    );
  }

  if (filters?.startDate) {
    query = query.where(gte(registrations.createdAt, filters.startDate));
  }

  if (filters?.endDate) {
    query = query.where(lte(registrations.createdAt, filters.endDate));
  }

  return query.orderBy(desc(registrations.createdAt));
}

export async function getRegistrationById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
  return result[0];
}

export async function updateRegistration(id: number, data: Partial<InsertRegistration>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.update(registrations).set(data).where(eq(registrations.id, id));
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db.delete(registrations).where(eq(registrations.id, id));
}

export async function getRegistrationStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select({
    totalCount: count(),
    totalRams: sum(registrations.ramCount),
    status: registrations.status,
  }).from(registrations).groupBy(registrations.status);
  return result;
}
