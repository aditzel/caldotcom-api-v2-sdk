# @aditzel/caldotcom-api-v2-sdk

TypeScript SDK for the Cal.com v2 API. Built with Bun, strict TypeScript, and ships ESM + CJS + types.

## Install

```bash
# Bun
bun add @aditzel/caldotcom-api-v2-sdk

# npm
npm install @aditzel/caldotcom-api-v2-sdk

# pnpm
pnpm add @aditzel/caldotcom-api-v2-sdk
```

## Usage

### ESM

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({ apiKey: process.env.CAL_API_KEY! });
// await client.someMethod();
```

### CommonJS

```javascript
const { CalComClient } = require('@aditzel/caldotcom-api-v2-sdk');
const client = new CalComClient({ apiKey: process.env.CAL_API_KEY });
```

## Development

### Build

```bash
fish -c 'source ~/.config/fish/config.fish; bun run build'
```

### Test

```bash
fish -c 'source ~/.config/fish/config.fish; bun run test'
```

### Lint

```bash
bun run lint
```

### Format

```bash
bun run format
```

### Watch (dev build)

```bash
fish -c 'source ~/.config/fish/config.fish; bun run dev'
```

### Output

- ESM: `dist/index.mjs` (also mirrored as `dist/index.js` for "main")
- CJS: `dist/index.cjs`
- Types: `dist/index.d.ts`

## License

MIT
