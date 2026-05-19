// src/routes/billing.ts
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createRentInvoiceSchema } from "../../schemas/billing.js";
import { createRentInvoice } from "../../services/billing.js";
import z from "zod";

const billingRoutes: FastifyPluginAsync = async (server) => {
  // Tell this specific Fastify instance to use Zod for its types
  const app = server.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/v1/invoices/rent",
    {
      schema: {
        description: "Generate a new rent invoice for a tenant",
        body: createRentInvoiceSchema,
        response: {
          201: z.object({
            success: z.boolean(),
            invoiceId: z.string(),
            totalAmountPaise: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      // Because of the Zod schema, `request.body` is fully typed here!
      // If a negative number is sent, Fastify throws a 400 Bad Request BEFORE hitting this code.
      const { entityId, customerId, rentAmountPaise } = request.body;

      try {
        const invoice = await createRentInvoice({
          entityId,
          customerId,
          rentAmountPaise,
        });

        return reply.status(201).send({
          success: true,
          invoiceId: invoice.id,
          totalAmountPaise: invoice.totalAmount,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to generate invoice" });
      }
    },
  );
};

export default billingRoutes;
