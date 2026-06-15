# Migrations & Seed — CQPM Nador

## Migration order

Prisma applies migrations **in chronological folder name order**:

| Order | Migration | Purpose |
|-------|-----------|---------|
| **1** | `20250604120000_init` | Creates schema, enums, tables, FKs, standard indexes |
| **2** | `20250604130000_optional_partial_indexes` | Partial unique indexes for soft-delete (active rows only) |

### Why this order?

1. **`init` must run first** — PostgreSQL requires enums and base tables before foreign keys and secondary indexes. This migration creates:
   - All `ENUM` types (`UserRole`, `ApplicationStatus`, etc.)
   - Tables in dependency order: `users` → content tables → junction tables
   - Standard B-tree indexes and `UNIQUE` constraints defined in Prisma

2. **`optional_partial_indexes` runs second** — Partial indexes reference columns (`deletedAt`, `slug`, etc.) that only exist after `init`. They add **filtered uniqueness** so active records stay unique while soft-deleted rows can coexist.

> Do not reorder folders. Prisma tracks applied migrations in `_prisma_migrations`.

### Optional manual SQL

`prisma/migrations/optional-partial-indexes.sql` duplicates migration #2 for manual `psql` runs. Prefer the versioned migration folder in CI/CD.

---

## Commands

```bash
# 1. Configure database
cp .env.example .env
# Set DATABASE_URL=postgresql://...

# 2. Apply all migrations
npx prisma migrate deploy
# Development (interactive):
# npx prisma migrate dev

# 3. Generate client
npx prisma generate

# 4. Seed
npm run db:seed
# or: npx prisma db seed
```

---

## What the seed creates

| Data | Details |
|------|---------|
| **Roles** | `UserRole` enum (not a table): SUPER_ADMIN, ADMIN, EDITOR |
| **Staff users** | 3 accounts (one per role), same dev password |
| **Site settings** | Singleton `id: default` with FR/AR content, stats, contact |
| **Formation categories** | Qualification, Spécialisation, Formation Continue |
| **Formations** | 7 sample programs across categories |
| **Demo extras** | 1 news article, 2 testimonials, 2 partners |

### Default credentials (development only)

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@cqpm-nador.ma | `Admin@CQPM2025!` |
| ADMIN | administration@cqpm-nador.ma | `Admin@CQPM2025!` |
| EDITOR | redaction@cqpm-nador.ma | `Admin@CQPM2025!` |

---

## Idempotency

The seed uses **upsert / find-first** patterns so it can be re-run safely:

- Users matched by `email` (active rows)
- Categories and formations matched by `slug` + `deletedAt: null`
- Site settings upserted by `id: default`

Re-running updates existing seed data without duplicating rows.
