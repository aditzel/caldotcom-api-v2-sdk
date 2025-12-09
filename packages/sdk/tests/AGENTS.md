# Testing Guide (`tests/`)

## Package Identity
- **Purpose**: Test suite for SDK resources and logic.
- **Tech**: `bun:test` (Jest-compatible syntax).

## Setup & Run
```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Run specific test file
bun test tests/resources/bookings.test.ts
```

## Patterns & Conventions

### Structure
- **Mirror**: Test structure mirrors `src/` (e.g., `src/resources/me.ts` -> `tests/me.test.ts`).
- **Naming**: `*.test.ts`.

### Mocking Strategy
- We manually mock `globalThis.fetch` in `beforeEach` to simulate API responses.
- **Do not** make real network calls.

### Code Examples

#### ✅ DO: Mocking Fetch
Reference `tests/me.test.ts` for the complete pattern:
```typescript
beforeEach(() => {
  globalThis.fetch = ((input, init) => {
    // Check URL/Method
    if (input.toString().endsWith('/some-endpoint')) {
      return Promise.resolve(new Response(JSON.stringify({
        status: 'success',
        data: { id: 1 }
      })));
    }
    // Default 404
    return Promise.resolve(new Response(null, { status: 404 }));
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch; // Restore
});
```

#### ✅ DO: Testing Resources
```typescript
describe('MyResource', () => {
  it('should get data', async () => {
    const data = await client.myResource.get(1);
    expect(data.id).toBe(1);
  });
});
```

## Touch Points
- **Example Test**: `tests/me.test.ts` (Best reference for mocking).
- **Client Init**: Initialize `CalComClient` with dummy keys in `beforeEach`.

## JIT Index Hints
- Find tests for a specific resource: `find tests -name "*resourceName*"`
- Find mock implementations: `rg "globalThis.fetch =" tests`

## Pre-PR Checks
```bash
bun test
```
