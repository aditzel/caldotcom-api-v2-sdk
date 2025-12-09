# Repository Guidelines

> **Mandatory**: All work MUST comply with the [Project Constitution](./CONSTITUTION.md). A task is not complete until lint, build, and tests pass without errors.

## Project Structure & Module Organization
The TypeScript sources live in `src/`, with shared HTTP utilities under `src/lib/`, resource clients in `src/resources/`, and exported types in `src/types/`. Tests mirror the public surface in `tests/` and follow the `*.test.ts` naming pattern. Build artifacts are generated into `dist/`; never edit files there directly. Example usage scripts and credential helpers are in `examples/`, while reusable automation sits in `scripts/`.

## Build, Test, and Development Commands
- `bun install` installs dependencies (Bun20 1.3.4+ recommended).
- `bun run build` calls `scripts/build.sh` to produce ESM, CJS, and declaration bundles in `dist/`.
- `bun test` runs the Bun test runner; use `bun test --watch` while iterating.
- `bun run lint`, `bun run lint:fix`, and `bun run format` enforce ESLint and Prettier rules.
- `bun run typecheck` (or `bunx tsc -p tsconfig.json --noEmit`) verifies project-wide types.

## Coding Style & Naming Conventions
Follow strict TypeScript with ES modules. Use two-space indentation, trailing semicolons, and prefer type-only imports to satisfy `@typescript-eslint/consistent-type-imports`. Avoid `any`; if unavoidable, document why and consider narrowing the type later. Keep parameter names descriptive and resources named after API nouns (e.g., `BookingsResource`). External logging is discouraged because `no-console` warns by default—wrap diagnostics behind utilities if needed.

## Testing Guidelines
Tests use `bun:test`. Scope each describe block to a resource or helper and name files after the feature under test (e.g., `bookings.test.ts`). Keep assertions focused and mock network calls via the HTTP client layer. There is no enforced coverage threshold yet, but all new behavior should ship with meaningful tests and pass `bun test` locally before review.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat:`, `fix:`, `chore:`) as seen in the history. Keep messages in present tense and limit the summary to ~70 characters. Pull requests should summarize intent, list any follow-up work, and link issues or discussions when available. Include screenshots or logs when touching developer ergonomics. Confirm `bun run build`, `bun test`, and `bun run lint` succeed before requesting review.

## Security & Configuration Tips
Copy `.env.example` to `.env` for local secrets and never commit real keys. When adding new configuration flags, document their defaults in `README.md` and expose them through `CalComClientOptions` so downstream consumers receive type-safe access.
