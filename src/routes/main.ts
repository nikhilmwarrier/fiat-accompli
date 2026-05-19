import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function handleRoot(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get("/", async (request, reply) => {
    return "Hello there!";
  });
}
