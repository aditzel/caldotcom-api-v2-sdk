# Project Constitution

This constitution defines the non-negotiable standards that govern all work on the Cal.com API v2 SDK. Every contributor agrees to obey these articles at all times. When conflicts arise, the constitution takes precedence over other docs.

## Article I – Code Quality
- All source code MUST follow the established TypeScript conventions: two-space indentation, trailing semicolons, strict typing, and type-only imports where required by lint rules.
- Introducing `any` types is prohibited unless unavoidable; any permitted usage MUST include an inline comment explaining the limitation and a plan to tighten the type in the future.
- Shared utilities and resources MUST remain tree-shakeable and avoid side effects during module initialization.

## Article II – Testing & Verification
- No task is complete until linting, building, and the full test suite all succeed without warnings or failures (`bun run lint`, `bun run build`, `bun test`). Document failures and obtain sign-off before merging if an exception is required.
- New or modified behavior MUST be covered by automated tests. Tests should mock network calls through the HTTP client layer and assert meaningful outcomes.
- When bugs are fixed, a regression test MUST be added to prevent recurrence.

## Article III – Documentation & Communication
- Public API changes MUST be reflected in `README.md`, and new resource clients MUST include usage examples.
- Significant architectural or workflow updates MUST reference this constitution in pull request summaries to confirm compliance.
- Commit messages MUST follow Conventional Commits and describe intent succinctly.

## Article IV – Security & Configuration
- Secrets SHALL NEVER be committed. All environment-sensitive values belong in `.env` files derived from `.env.example`.
- New configuration flags MUST default safely, be documented, and receive type-safe exposure through `CalComClientOptions`.
- External logging via `console` is discouraged; diagnostics MUST route through approved utilities to satisfy linting.

## Article V – Enforcement
- Reviewers MUST block changes that violate any article. Approvals should explicitly confirm adherence to lint, build, and test requirements.
- When an unavoidable exception is necessary, it MUST be documented in the relevant file and tracked with follow-up work.
- This constitution may only be amended via a dedicated pull request that updates this document and cross-references all affected guidelines.

Stay disciplined. The health of the project depends on relentless adherence to these rules.
