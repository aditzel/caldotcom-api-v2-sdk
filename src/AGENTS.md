# Source Code Guide (`src/`)

## Package Identity
- **Purpose**: Core logic for `@aditzel/caldotcom-api-v2-sdk`.
- **Tech**: TypeScript (ESM only output).

## Setup & Run
```bash
# Watch mode for development
bun run dev

# Check types
bun run typecheck
```

## Patterns & Conventions

### File Organization
- **Resources**: `src/resources/<name>.ts` (e.g., `bookings.ts`).
- **Types**: `src/types/<name>.ts` (match resource name).
- **Lib**: `src/lib/` (shared utilities, HTTP client).

### Coding Standards
- **Classes**: Use class-based resources injected with `HttpClient`.
- **Async**: All network calls return `Promise<T>`.
- **Errors**: Throw specific errors from `src/lib/errors.ts`.
- **Docs**: Use JSDoc with `@see` linking to official API docs.

### Code Examples

#### ✅ DO: Resource Class Pattern
Copy this pattern for new API resources:
```typescript:src/resources/example.ts
import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse } from '../types/common.js';

export class ExampleResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Description of method
   * @see https://cal.com/docs/api-reference/v2/...
   */
  async get(id: number): Promise<ExampleType> {
    const response = await this.http.get<ApiResponse<ExampleType>>(`/example/${id}`);
    return response.data;
  }
}
```

#### ✅ DO: HTTP Client Usage
Always use the `http` property for requests:
```typescript
// GET
this.http.get<Response>('/path', { query: 'param' });
// POST
this.http.post<Response>('/path', { data: 'value' });
```

#### ❌ DON'T: Hardcoded Fetch
Never use `fetch` directly in resources.
```typescript
// BAD
const res = await fetch('https://api.cal.com/...');
```

## Touch Points
- **HTTP Client**: `src/lib/http-client.ts` (Handles auth, base URL).
- **Error Definitions**: `src/lib/errors.ts`.
- **Main Entrypoint**: `src/index.ts` (Exports Client and Resources).

## JIT Index Hints
- Find a Resource: `rg "export class .*Resource" src/resources`
- Find HTTP Methods: `rg "async (get|post|put|delete|patch)" src/lib/http-client.ts`
- Find Types: `rg "export type" src/types`

## Pre-PR Checks
```bash
bun run typecheck && bun run lint
```
