// src/db/schema.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// 1. SYSTEM CONFIGURATION & ACTORS
// ============================================================================

// Entities: The "Creditors" or "Owners" of the ledger logic.
// e.g., id: 'SYSTEM' (Your SaaS) or 'LANDLORD_123'
export const entities = sqliteTable("billing_entities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'INTERNAL' (SaaS) or 'EXTERNAL' (Landlord)
  settings: text("settings"), // JSON: { lateFeePercent: 5, allowsPartial: true }
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Chart of Accounts: Defines the financial buckets available in the system
export const accounts = sqliteTable("billing_accounts", {
  id: text("id").primaryKey(), // e.g., 'asset:bank', 'liability:wallet', 'revenue:saas'
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'CONTRA'
  description: text("description"),
});

// Customers: The "Debtors" - Mapping your SaaS host-app entities to the billing engine
// Landlords act as customers to the 'SYSTEM' entity. Tenants act as customers to 'LANDLORD' entities.
export const customers = sqliteTable("billing_customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  externalId: text("external_id").unique().notNull(), // Your Next.js Tenant/Landlord ID
  name: text("name").notNull(),
  linkedEntityId: text("linked_entity_id").references(() => entities.id), // Link if Customer is also an Entity (eg: Landlord is an Entity (collects rent) but also a customer (pays for saas))
  currency: text("currency").default("inr"),
  pan: text("pan"),
  gstin: text("gstin"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// ============================================================================
// 2. DOCUMENT LAYER (INVOICES & OBLIGATIONS)
// ============================================================================

// Invoices: The official Demand for Payment or Reversal Document
export const invoices = sqliteTable(
  "billing_invoices",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    type: text("type").notNull().default("TAX_INVOICE"), // 'TAX_INVOICE' or 'CREDIT_NOTE'
    status: text("status").notNull().default("DRAFT"), // 'DRAFT', 'OPEN', 'PAID', 'VOID'
    totalAmount: integer("total_amount").notNull().default(0), // ALWAYS POSITIVE (Paise)
    dueDate: integer("due_date", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => ({
    entityCustIdx: index("inv_entity_cust_idx").on(
      table.entityId,
      table.customerId,
    ),
  }),
);

// Line Items: The individual obligations.
// Note: Discounts are recorded as positive amounts with type 'PROMO_DISCOUNT'.
export const invoiceItems = sqliteTable("billing_invoice_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id),
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // ALWAYS POSITIVE. No negatives allowed.
  type: text("type").notNull(), // 'RENT', 'SaaS_FEE', 'LATE_FEE', 'PROMO_DISCOUNT'
  taxRate: integer("tax_rate").default(1800), // e.g., 1800 for 18.00% (store as integer basis points if possible, or use real)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// ============================================================================
// 3. FINANCIAL LAYER (THE LEDGER)
// ============================================================================

// General Ledger Entries: Strict Double-Entry Bookkeeping
// EVERY row here must have a corresponding balancing row(s) with the same voucherId.
export const glEntries = sqliteTable(
  "billing_gl_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id), // Who owns this money?
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    customerId: text("customer_id").references(() => customers.id),

    // Strict Polarity: Only positive integers (Paise) are allowed here.
    debit: integer("debit").notNull().default(0),
    credit: integer("credit").notNull().default(0),

    voucherType: text("voucher_type").notNull(), // 'INVOICE', 'PAYMENT', 'CREDIT_NOTE', 'ADJUSTMENT'
    voucherId: text("voucher_id").notNull(), // e.g., Links to invoices.id or a payment ID
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => ({
    // Crucial for fast balance calculations (SUM(debit) - SUM(credit)) for a specific user and bucket
    balanceIdx: index("balance_idx").on(
      table.entityId,
      table.customerId,
      table.accountId,
    ),
    voucherIdx: index("voucher_idx").on(table.voucherId),
  }),
);

// ============================================================================
// 4. INTEGRITY & SYNCHRONIZATION LAYER
// ============================================================================

// The Audit Log (The Hash Chain)
export const auditLogs = sqliteTable("billing_audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  hash: text("hash").notNull(), // SHA256 of payload + prevHash
  prevHash: text("prev_hash"), // Null for the genesis block
  payload: text("payload").notNull(), // JSON string of the state change
  actorId: text("actor_id").notNull(), // Who triggered this? (e.g., 'system', 'user_123')
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// The Outbox (Events for your Next.js host app)
export const billingEvents = sqliteTable("billing_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  type: text("type").notNull(), // e.g., 'PAYMENT.SUCCEEDED', 'INVOICE.CREATED'
  payload: text("payload").notNull(), // JSON representation of the event
  status: text("status").notNull().default("PENDING"), // 'PENDING', 'DISPATCHED', 'FAILED'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
