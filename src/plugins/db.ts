import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema.js";
import { FastifyInstance } from "fastify";

export const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Define the type for the decorator
declare module "fastify" {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle<typeof schema>>;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // High-performance settings for SQLite
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");

  fastify.decorate("db", db);

  fastify.addHook("onClose", (instance, done) => {
    sqlite.close();
    done();
  });
});
