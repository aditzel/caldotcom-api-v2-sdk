#!/usr/bin/env bash
set -e

# Clean dist
rm -rf dist
mkdir -p dist

# Build ESM
bun build ./src/index.ts --format esm --outdir ./dist --entry-naming index.mjs --sourcemap

# Build CJS  
bun build ./src/index.ts --format cjs --outdir ./dist --entry-naming index.cjs --sourcemap

# Build types
bunx tsc -p tsconfig.build.json

# Copy index.mjs to index.js for main entry
cp dist/index.mjs dist/index.js

echo "✓ Build complete!"
