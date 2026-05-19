// src/schemas/billing.ts
import { z } from "zod";

export const createRentInvoiceSchema = z.object({
  entityId: z.string().min(1, "Entity ID is required"),
  customerId: z.string().min(1, "Customer ID is required"),

  // FINTECH GUARDRAILS:
  // .int() prevents floating point math errors (e.g., 150.50 paise is invalid)
  // .positive() ensures it is > 0. This physically prevents negative line items.
  rentAmountPaise: z
    .number()
    .int("Amount must be a whole integer (paise)")
    .positive("Amount must be greater than zero"),
});

export type CreateRentInvoiceInput = z.infer<typeof createRentInvoiceSchema>;
