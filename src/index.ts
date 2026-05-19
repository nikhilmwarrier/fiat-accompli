import app from "fastify";
import swagger from "./plugins/swagger.js";
import router from "./plugins/router.js";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const fastify = app.fastify({ logger: true });
const PORT = Number(process.env.PORT || 3000);

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(swagger);
fastify.register(router);

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
