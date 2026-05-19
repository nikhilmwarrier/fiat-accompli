// scripts/test-invoice.ts
import { createRentInvoice } from "./billing.js";
import { db } from "../plugins/db.js";
import { customers } from "../db/schema.js";
import { eq } from "drizzle-orm";

async function run() {
  // Find our seeded tenant
  const [tenant] = await db
    .select()
    .from(customers)
    .where(eq(customers.externalId, "tenant_id_44"));

  console.log(`📑 Generating invoice for ${tenant.name}...`);

  const invoice = await createRentInvoice({
    entityId: "LANDLORD_001",
    customerId: tenant.id,
    rentAmountPaise: 1500000, // ₹15,000
  });

  console.log(`✅ Invoice Created: ${invoice.id}`);
  console.log(`💰 Total Amount: ₹${invoice.totalAmount / 100}`);
}

run().catch(console.error);
