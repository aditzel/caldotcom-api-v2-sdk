# Security Best Practices

## Overview

This document outlines security best practices when using the Cal.com v2 SDK.

## API Key Management

### ✅ DO

1. **Use Environment Variables**
   ```typescript
   const client = new CalComClient({
     auth: {
       type: 'apiKey',
       apiKey: process.env.CALDOTCOM_API_KEY!,
     },
   });
   ```

2. **Use .env Files for Development**
   - Copy `.env.example` to `.env`
   - Add `.env` to `.gitignore` (already done in this project)
   - Never commit `.env` files to version control

3. **Use Secret Management for Production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Cloud Secret Manager
   - Railway/Vercel/Netlify Environment Variables

4. **Rotate Keys Regularly**
   - Generate new API keys periodically
   - Revoke old keys after rotation
   - Use different keys for different environments

5. **Use Least Privilege**
   - Only grant necessary permissions
   - Use separate keys for different services/applications

### ❌ DON'T

1. **Never Hardcode Credentials**
   ```typescript
   // ❌ BAD - Never do this!
   const client = new CalComClient({
     auth: {
       type: 'apiKey',
       apiKey: 'cal_live_xxxxx',
     },
   });
   ```

2. **Never Commit Secrets to Git**
   - Check `.gitignore` includes `.env` and `.env.*`
   - Scan commit history for accidentally committed secrets
   - Use tools like `git-secrets` or `truffleHog`

3. **Never Log Credentials**
   ```typescript
   // ❌ BAD
   console.log('API Key:', process.env.CALDOTCOM_API_KEY);
   
   // ✅ GOOD
   console.log('API Key:', process.env.CALDOTCOM_API_KEY ? '[SET]' : '[NOT SET]');
   ```

4. **Never Share Keys in Public Channels**
   - Don't paste keys in Slack, Discord, email
   - Don't include keys in screenshots or videos
   - Don't store keys in public documentation

5. **Never Use Production Keys in Development**
   - Use test mode keys (`cal_` prefix) for development
   - Use live mode keys (`cal_live_` prefix) only in production

## Environment Variables

### Naming Convention

This SDK uses the `CALDOTCOM_` prefix (note: no underscore between CALDOT and COM) to avoid conflicts with existing Cal.com integrations that may use `CAL_COM_` or `CALCOM_` prefixes:

```bash
CALDOTCOM_API_KEY=cal_live_xxxxx
CALDOTCOM_CLIENT_ID=xxxxx
CALDOTCOM_SECRET_KEY=xxxxx
CALDOTCOM_ACCESS_TOKEN=xxxxx
CALDOTCOM_REFRESH_TOKEN=xxxxx
```

### Loading Environment Variables

#### Node.js

```bash
# Install dotenv
npm install dotenv

# Load in your app
node -r dotenv/config your-app.js
```

```typescript
import 'dotenv/config';
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: process.env.CALDOTCOM_API_KEY!,
  },
});
```

#### Bun

Bun 1.3.4+ loads `.env` files automatically - no additional setup needed!

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: process.env.CALDOTCOM_API_KEY!,
  },
});
```

#### Deno

```bash
# Run with environment variables
deno run --allow-env --allow-net your-app.ts
```

## Managed User Tokens

### Token Storage

For platform customers managing user tokens:

```typescript
// ✅ GOOD: Store in secure database
interface User {
  id: string;
  email: string;
  calAccessToken: string;  // Encrypt this!
  calRefreshToken: string; // Encrypt this!
  calTokenExpiry: Date;
}

// ❌ BAD: Never store in localStorage/sessionStorage
// ❌ BAD: Never store in cookies without encryption
// ❌ BAD: Never store in plain text
```

### Token Encryption

Always encrypt tokens at rest:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Example encryption (use a proper encryption library in production)
function encryptToken(token: string, key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptToken(encryptedToken: string, key: Buffer): string {
  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex!, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted!, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### Token Refresh

Implement automatic token refresh:

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

async function getClientForUser(userId: string): Promise<CalComClient> {
  const user = await database.users.findById(userId);
  
  // Check if token needs refresh (expires in < 5 minutes)
  const needsRefresh = user.calTokenExpiry < new Date(Date.now() + 5 * 60 * 1000);
  
  if (needsRefresh) {
    // Refresh token using OAuth client
    const platformClient = new CalComClient({
      auth: {
        type: 'oauthClient',
        clientId: process.env.CALDOTCOM_CLIENT_ID!,
        secretKey: process.env.CALDOTCOM_SECRET_KEY!,
      },
    });
    
    // Implement token refresh logic
    // Update user record with new tokens
  }
  
  return new CalComClient({
    auth: {
      type: 'managedUser',
      accessToken: user.calAccessToken,
      refreshToken: user.calRefreshToken,
    },
  });
}
```

## Production Checklist

- [ ] All API keys stored in environment variables
- [ ] `.env` file not committed to version control
- [ ] Different keys for development and production
- [ ] Keys rotated regularly (every 90 days recommended)
- [ ] Managed user tokens encrypted at rest
- [ ] Token refresh implemented
- [ ] Error logs don't expose credentials
- [ ] HTTPS used for all API calls (default in SDK)
- [ ] Rate limiting implemented in application
- [ ] Monitoring and alerting configured

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com instead of creating a public GitHub issue.

## Additional Resources

- [Cal.com Security Documentation](https://cal.com/docs/security)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
