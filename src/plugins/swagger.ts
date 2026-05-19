import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifySwagger from "@fastify/swagger";

export default async function swagger(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  const host = process.env.SWAGGER_HOST || "localhost:3000";
  const schemes = (process.env.SWAGGER_SCHEMES || "http").split(",");

  fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Fastify API Server",
        description: "A production-ready Fastify API server template",
        version: "1.0.0",
      },
      host,
      schemes,
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  });
}
