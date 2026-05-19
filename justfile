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

