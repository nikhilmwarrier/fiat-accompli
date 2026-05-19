import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function router(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Dynamically points to either src/routes or dist/routes depending on execution context
  const routesDir = path.join(__dirname, "..", "routes");

  if (!fs.existsSync(routesDir)) {
    fastify.log.warn(`Routes directory not found at: ${routesDir}`);
    return;
  }

  async function addRoute(dir: string, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await addRoute(fullPath, path.join(prefix, entry.name));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) &&
        !entry.name.endsWith(".map") // Ignore source maps
      ) {
        // Dynamically import the route module
        const routeModule = await import(`file://${fullPath}`);

        // Strip extension (.ts or .js) for prefix calculations
        const nameWithoutExt = entry.name.replace(/\.[jt]s$/, "");

        let routePrefix: string;
        if (nameWithoutExt === "main") {
          routePrefix = prefix === "" ? "/" : `/${prefix.replace(/\\/g, "/")}`;
        } else {
          routePrefix = `/${path.join(prefix, nameWithoutExt).replace(/\\/g, "/")}`;
        }

        fastify.register(routeModule.default || routeModule, {
          prefix: routePrefix,
        });
      }
    }
  }

  await addRoute(routesDir);
}
