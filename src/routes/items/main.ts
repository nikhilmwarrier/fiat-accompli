import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default function items(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get("/", (req, res) => {
    res.send({
      ok: true,
      text: "Received GET request!",
      items: [1, 2, 3, 4, 5],
    });
  });

  fastify.post("/", (req, res) => {
    res.send({
      ok: true,
      text: "Received POST request!",
      items: [5, 4, 3, 2, 1],
    });
  });
}
