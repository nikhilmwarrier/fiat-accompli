// src/routes/balances.ts
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { getCustomerBalance } from "../../services/balances.js";

const balanceRoutes: FastifyPluginAsync = async (server) => {
  const app = server.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/:entityId/:customerId",
    {
      schema: {
        params: z.object({
          entityId: z.string(),
          customerId: z.string(),
        }),
        response: {
          200: z.object({
            entityId: z.string(),
            customerId: z.string(),
            balancePaise: z.number(),
            balanceFormatted: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { entityId, customerId } = request.params;

      const balance = getCustomerBalance(entityId, customerId);

      return {
        entityId,
        customerId,
        balancePaise: balance.outstandingPaise,
        balanceFormatted: balance.outstandingFormatted,
      };
    },
  );
};

export default balanceRoutes;
