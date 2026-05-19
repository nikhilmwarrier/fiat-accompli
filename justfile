OUT_DIR     := "dist"
ENTRY_POINT := "index.js"
TARGET      := OUT_DIR / ENTRY_POINT

# Build and run the project
default: build run

# Compile TypeScript
build:
    pnpm exec tsc

# Run the compiled JavaScript
run:
    node {{ TARGET }}

# Development mode: Watch TypeScript and auto-restart Node concurrently
dev:
    pnpm exec tsc --watch 

# Generate migration files
gen:
    pnpm exec drizzle-kit generate

# Push schema to sqlite.db
push:
    pnpm exec drizzle-kit push

# Open the GUI to see your ledger
studio:
    pnpm exec drizzle-kit studio
