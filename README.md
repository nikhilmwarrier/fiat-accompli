# Fastify API Server Template

A minimal Fastify API server template with dynamic route registration for building RESTful APIs with TypeScript.

## Architecture

- **Framework**: [Fastify](https://www.fastify.io/) - A fast and low-overhead web framework
- **Language**: TypeScript with strict type checking
- **Routing**: Dynamic route registration from the `src/routes/` directory
- **Documentation**: Built-in Swagger/OpenAPI support via `@fastify/swagger`

### Project Structure

```
src/
├── index.ts       # Application entry point
├── router.ts      # Dynamic route loader
└── routes/        # API route definitions
    ├── main.ts    # Root route (/)
    └── items/     # Nested routes (/items)
        └── main.ts
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.24.0+ (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

Watch TypeScript and run with auto-reload:

```bash
just dev
```

Or manually:

```bash
pnpm exec tsc --watch
```

### Production Build

Compile and run:

```bash
just build
just run
```

Or all at once:

```bash
just
```

## API Server

The server runs on `http://localhost:3000` by default.

### Adding Routes

Create files in `src/routes/`:
- `src/routes/main.ts` → `/`
- `src/routes/items/main.ts` → `/items`
- `src/routes/items/detail.ts` → `/items/detail`

Each route file should export a default Fastify plugin.

## License

MIT
