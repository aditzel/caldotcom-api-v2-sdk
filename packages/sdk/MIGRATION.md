# Migration Guide

## Environment Variable Naming

### Why `CALDOTCOM_` prefix?

This SDK uses the `CALDOTCOM_` prefix for environment variables to avoid conflicts with:

1. **Existing Cal.com integrations** that use `CAL_COM_` or `CALCOM_`
2. **Other Cal.com SDKs** or custom implementations
3. **Legacy code** in projects migrating to this SDK

This allows you to:
- Run this SDK alongside other Cal.com integrations
- Gradually migrate from custom implementations
- Test the SDK without disrupting existing code

### Variable Mapping

If you're migrating from another Cal.com integration, here's the mapping:

| Other Integrations | This SDK |
|-------------------|----------|
| `CAL_COM_API_KEY` or `CALCOM_API_KEY` | `CALDOTCOM_API_KEY` |
| `CAL_COM_CLIENT_ID` or `CALCOM_CLIENT_ID` | `CALDOTCOM_CLIENT_ID` |
| `CAL_COM_SECRET_KEY` or `CALCOM_SECRET_KEY` | `CALDOTCOM_SECRET_KEY` |
| `CAL_COM_ACCESS_TOKEN` | `CALDOTCOM_ACCESS_TOKEN` |
| `CAL_COM_REFRESH_TOKEN` | `CALDOTCOM_REFRESH_TOKEN` |

### Quick Migration

#### Option 1: Rename Variables (Clean Migration)

Update your `.env` file:

```bash
# Old
CAL_COM_API_KEY=cal_live_xxxxx

# New
CALDOTCOM_API_KEY=cal_live_xxxxx
```

#### Option 2: Duplicate Variables (Side-by-Side)

Keep both while migrating:

```bash
# Existing integration
CAL_COM_API_KEY=cal_live_xxxxx

# New SDK
CALDOTCOM_API_KEY=cal_live_xxxxx
```

This allows you to:
- Test the new SDK without breaking existing code
- Gradually migrate endpoint by endpoint
- Roll back easily if needed

#### Option 3: Environment Variable Aliasing (Advanced)

If you want to share the same value:

```bash
# .env
CAL_COM_API_KEY=cal_live_xxxxx

# In your code (before importing SDK)
process.env.CALDOTCOM_API_KEY = process.env.CAL_COM_API_KEY;
```

Or create a wrapper:

```typescript
// config/cal-sdk.ts
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

// Use existing environment variable
export const createCalClient = () => {
  return new CalComClient({
    auth: {
      type: 'apiKey',
      apiKey: process.env.CAL_COM_API_KEY || process.env.CALDOTCOM_API_KEY!,
    },
  });
};
```

### Deployment Checklist

When deploying to production after migration:

- [ ] Update environment variables in your deployment platform (Vercel, Railway, etc.)
- [ ] Update CI/CD pipeline secrets
- [ ] Update documentation for your team
- [ ] Remove old environment variables after migration is complete
- [ ] Update any infrastructure-as-code (Terraform, CloudFormation, etc.)

### Platform-Specific Instructions

#### Vercel

```bash
# Remove old variables
vercel env rm CAL_COM_API_KEY production

# Add new variables
vercel env add CALDOTCOM_API_KEY production
# Enter your API key when prompted
```

#### Railway

```bash
railway variables set CALDOTCOM_API_KEY=cal_live_xxxxx
railway variables delete CAL_COM_API_KEY
```

#### Netlify

```bash
netlify env:set CALDOTCOM_API_KEY cal_live_xxxxx
netlify env:unset CAL_COM_API_KEY
```

#### Heroku

```bash
heroku config:set CALDOTCOM_API_KEY=cal_live_xxxxx
heroku config:unset CAL_COM_API_KEY
```

#### Docker / Docker Compose

Update your `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      # Old
      # - CAL_COM_API_KEY=${CAL_COM_API_KEY}
      
      # New
      - CALDOTCOM_API_KEY=${CALDOTCOM_API_KEY}
```

### Troubleshooting

**Error: "No Cal.com credentials found in environment variables"**

This means the SDK can't find `CALDOTCOM_API_KEY` or other required variables. Check that:

1. You're using the correct prefix (`CALDOTCOM_` not `CAL_COM_`)
2. The `.env` file exists and is in the right location
3. Environment variables are loaded (Bun does this automatically, Node.js might need `dotenv`)
4. Variable names don't have typos

**Still having issues?**

Run this diagnostic script:

```typescript
// check-env.ts
console.log('Environment Variable Check:');
console.log('CALDOTCOM_API_KEY:', process.env.CALDOTCOM_API_KEY ? '✓ Set' : '✗ Not set');
console.log('CALDOTCOM_CLIENT_ID:', process.env.CALDOTCOM_CLIENT_ID ? '✓ Set' : '✗ Not set');
console.log('CALDOTCOM_SECRET_KEY:', process.env.CALDOTCOM_SECRET_KEY ? '✓ Set' : '✗ Not set');

// Check for old variable names
if (process.env.CAL_COM_API_KEY) {
  console.log('\n⚠️  Found CAL_COM_API_KEY - did you mean CALDOTCOM_API_KEY?');
}
```

### Need Help?

If you're having trouble with the migration:

1. Check the [SECURITY.md](./SECURITY.md) for best practices
2. Review [examples/](./examples/) for working code
3. Open an issue on GitHub with your deployment platform details
