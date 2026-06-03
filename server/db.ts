import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, leads, users, businessInquiries } from "../drizzle/schema";
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

// Lead capture helpers
export async function insertLead(email: string, source: string = "homepage"): Promise<{ success: boolean; duplicate: boolean }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert lead: database not available");
    return { success: false, duplicate: false };
  }
  try {
    await db.insert(leads).values({ email, source });
    return { success: true, duplicate: false };
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr?.code === "ER_DUP_ENTRY") {
      return { success: false, duplicate: true };
    }
    throw err;
  }
}

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(leads.createdAt);
}

// Business inquiry helpers
export async function insertBusinessInquiry(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  projectDescription: string;
  budget?: string;
  timeline?: string;
}): Promise<{ success: boolean; id?: number }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert business inquiry: database not available");
    return { success: false };
  }
  try {
    const result = await db.insert(businessInquiries).values(data);
    return { success: true, id: result[0].insertId as number };
  } catch (err) {
    console.error("[Database] Failed to insert business inquiry:", err);
    throw err;
  }
}

export async function getAllBusinessInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businessInquiries).orderBy(businessInquiries.createdAt);
}
