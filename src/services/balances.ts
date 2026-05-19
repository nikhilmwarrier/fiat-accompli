// src/services/balances.ts
import { db } from "../plugins/db.js";
import * as schema from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export function getCustomerBalance(entityId: string, customerId: string) {
  // We use sql`` helper to perform the aggregation in the database
  // better-sqlite3 will execute this synchronously
  const result = db
    .select({
      totalDebits: sql<number>`SUM(${schema.glEntries.debit})`,
      totalCredits: sql<number>`SUM(${schema.glEntries.credit})`,
    })
    .from(schema.glEntries)
    .where(
      and(
        eq(schema.glEntries.entityId, entityId),
        eq(schema.glEntries.customerId, customerId),
        eq(schema.glEntries.accountId, "assets:ar"),
      ),
    )
    .get();

  const debits = result?.totalDebits || 0;
  const credits = result?.totalCredits || 0;

  return {
    outstandingPaise: debits - credits,
    outstandingFormatted: (debits - credits) / 100,
  };
}
