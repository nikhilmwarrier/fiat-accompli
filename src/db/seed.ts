// src/db/seed.ts
import { db } from "../plugins/db.js";
import * as schema from "./schema.js";

async function seed() {
  console.log("🌱 Seeding Billing Engine...");

  // 1. Create Entities
  // We'll capture the Landlord Entity specifically to link it later
  const [systemEntity, landlordEntity] = await db
    .insert(schema.entities)
    .values([
      {
        id: "SYSTEM",
        name: "Fiat Accompli SaaS",
        type: "INTERNAL",
        settings: JSON.stringify({ taxId: "GSTIN12345" }),
      },
      {
        id: "LANDLORD_001",
        name: "McLord Properties",
        type: "EXTERNAL",
        settings: JSON.stringify({ lateFeePercent: 5, gatewayCharges: 35400 }),
      },
    ])
    .returning();

  // 2. Create Global Chart of Accounts
  await db.insert(schema.accounts).values([
    { id: "assets:bank", name: "Bank Account", type: "ASSET" },
    { id: "assets:ar", name: "Accounts Receivable", type: "ASSET" },
    { id: "assets:clearing", name: "Gateway Clearing", type: "ASSET" },
    { id: "liabilities:wallet", name: "Customer Wallet", type: "LIABILITY" },
    { id: "revenue:saas", name: "SaaS Subscriptions", type: "REVENUE" },
    { id: "revenue:rent", name: "Rental Income", type: "REVENUE" },
    {
      id: "revenue:gateway_reimbursement",
      name: "Gateway Fee Recovery",
      type: "REVENUE",
    },
    { id: "expenses:gateway", name: "Payment Gateway Fees", type: "EXPENSE" },
  ]);

  // 3. Create Customers

  // Landlord is a customer of SYSTEM AND is linked to their own Entity
  const [landlord] = await db
    .insert(schema.customers)
    .values([
      {
        externalId: "host_id_99",
        name: "Land McLord",
        gstin: "27AAAAA0000A1Z5",
        linkedEntityId: landlordEntity.id, // THE BRIDGE
      },
    ])
    .returning();

  // Tenant is a customer of the Landlord
  // Note: linkedEntityId is NULL for tenants because they don't own a sub-ledger
  const [tenant] = await db
    .insert(schema.customers)
    .values([
      {
        externalId: "tenant_id_44",
        name: "Kappa Rentoid",
        linkedEntityId: null,
      },
    ])
    .returning();

  console.log("✅ Seed complete.");
  console.log(`System Entity: ${systemEntity.id}`);
  console.log(
    `Landlord: ${landlord.name} (ID: ${landlord.id}) -> Linked to Entity: ${landlord.linkedEntityId}`,
  );
  console.log(`Tenant: ${tenant.name} (ID: ${tenant.id})`);
}

seed().catch(console.error);
