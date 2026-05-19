// src/services/billing.ts
import { db } from "../plugins/db.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";
// import { type CreateRentInvoiceInput } from "../schemas/billing.js"; // If using Zod

export function createRentInvoice({
  entityId,
  customerId,
  rentAmountPaise,
}: any) {
  // Replace 'any' with your Zod type if you added it

  // ❌ Notice there is no 'async' and no 'await' here
  return db.transaction((tx) => {
    // 1. Fetch Entity settings
    // 👉 Use .get() instead of destructuring an array
    const entity = tx
      .select()
      .from(schema.entities)
      .where(eq(schema.entities.id, entityId))
      .get();

    if (!entity) {
      throw new Error(`Entity ${entityId} not found`);
    }

    const settings = JSON.parse(entity.settings || "{}");
    const gatewayFee = settings.gatewayCharges || 0;
    const totalAmount = rentAmountPaise + gatewayFee;

    // 2. Create the Invoice Header
    // 👉 Use .get() to return the single inserted row
    const invoice = tx
      .insert(schema.invoices)
      .values({
        entityId,
        customerId,
        type: "TAX_INVOICE",
        status: "OPEN",
        totalAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning()
      .get();

    // 3. Create Line Items
    // 👉 Use .run() because we don't need to read the data back
    tx.insert(schema.invoiceItems)
      .values([
        {
          invoiceId: invoice.id,
          description: "Monthly Rent",
          amount: rentAmountPaise,
          type: "RENT",
        },
        {
          invoiceId: invoice.id,
          description: "Gateway Convenience Fee",
          amount: gatewayFee,
          type: "GATEWAY_FEE",
        },
      ])
      .run();

    // 4. Record in General Ledger (Double Entry)
    tx.insert(schema.glEntries)
      .values([
        {
          entityId,
          customerId,
          accountId: "assets:ar",
          debit: totalAmount,
          credit: 0,
          voucherType: "INVOICE",
          voucherId: invoice.id,
          description: `Invoice ${invoice.id} generated`,
        },
        {
          entityId,
          customerId,
          accountId: "revenue:rent",
          debit: 0,
          credit: rentAmountPaise,
          voucherType: "INVOICE",
          voucherId: invoice.id,
          description: "Rent Revenue Recognition",
        },
        {
          entityId,
          customerId,
          accountId: "revenue:gateway_reimbursement",
          debit: 0,
          credit: gatewayFee,
          voucherType: "INVOICE",
          voucherId: invoice.id,
          description: "Gateway Fee Recovery",
        },
      ])
      .run();

    return invoice;
  });
}
