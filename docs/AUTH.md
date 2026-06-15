# Authentication — CQPM Nador

## Stack

- **Auth.js / NextAuth v5** with JWT sessions
- **Credentials** provider (email + password)
- **bcrypt** password hashing (12 rounds)
- **RBAC** via `UserRole` enum

## Environment

```env
AUTH_SECRET=   # openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

## File structure

```
src/lib/auth/
  auth.config.ts    # Edge-safe config (middleware)
  auth-instance.ts  # NextAuth init + credentials provider
  credentials.ts  # Authorize logic + rate limit + audit
  guards.ts         # requireAuth, requirePermission
  rbac.ts           # Permission matrix
  password.ts       # hash / verify
  constants.ts      # Session TTL, paths
src/actions/auth.actions.ts  # loginAction, logoutAction
src/middleware.ts            # JWT session gate for /admin
```

## Flow

1. User submits login → `loginAction` (rate limit) → `signIn("credentials")`
2. `authorize` validates email/password, checks `isActive` + `deletedAt`
3. JWT issued (8h max, refresh every 1h)
4. Middleware `authorized` callback blocks `/admin/*` without session
5. Pages use `requirePermission(resource, "read")` for RBAC
6. Server Actions use `assertPermission(resource, "write")`

## Default accounts (after seed)

| Role | Email |
|------|-------|
| SUPER_ADMIN | admin@cqpm-nador.ma |
| ADMIN | administration@cqpm-nador.ma |
| EDITOR | redaction@cqpm-nador.ma |

Password (dev): `Admin@CQPM2025!`

## Security controls

- Generic error messages (no user enumeration)
- Login rate limit: 5 attempts / 15 min per IP
- HTTP-only session cookies (Auth.js defaults)
- `trustHost: true` for production proxies
- Audit logs on login success/failure and logout
- Soft-deleted users cannot authenticate
