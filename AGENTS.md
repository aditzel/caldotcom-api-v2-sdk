# Cal.com API v2 SDK - Agent Guide

## Project Snapshot
- **Type**: Single TypeScript Project (SDK)
- **Stack**: TypeScript, Bun (Runtime + Tooling)
- **Goal**: Type-safe SDK for Cal.com v2 API
- **Sub-Agents**:
  - Source Logic: [src/AGENTS.md](src/AGENTS.md)
  - Testing: [tests/AGENTS.md](tests/AGENTS.md)

## Root Setup Commands
```bash
# Install dependencies
bun install

# Build the SDK (ESM, CJS, Types)
bun run build

# Run all tests
bun test

# Lint & Format
bun run lint
bun run format
bun run typecheck
```

## Universal Conventions
- **Style**: Prettier + ESLint (Standard Config).
- **Language**: Strict TypeScript (no `any` unless absolutely necessary).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Imports**: Use `.js` extension for local imports (ESM requirement).
  - ✅ `import { Foo } from './foo.js';`
  - ❌ `import { Foo } from './foo';`

## Security & Secrets
- **Secrets**: Never commit keys. Use `.env` (template in `.env.example`).
- **Auth**: SDK handles API keys/OAuth; never log credentials.
- **Git**: Ensure `.env` is in `.gitignore`.

## JIT Index (Directory Map)
### Core Structure
- SDK Logic: `src/` → [see src/AGENTS.md](src/AGENTS.md)
- Tests: `tests/` → [see tests/AGENTS.md](tests/AGENTS.md)
- Scripts: `scripts/` → Build automation (`build.sh`)

### Quick Find Commands
- **Find Resource Class**: `rg "class .*Resource"`
- **Find Type Definition**: `rg "export (type|interface)" src/types`
- **Find Error Class**: `rg "class .*Error" src/lib/errors.ts`
- **Find Example Usage**: `ls examples/`

## Definition of Done
1.  Code compiles (`bun run build` passes).
2.  Types are valid (`bun run typecheck` passes).
3.  Linting passes (`bun run lint`).
4.  Tests pass (`bun test`).
5.  New resources have corresponding tests.
