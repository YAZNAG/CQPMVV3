# CQPM Nador — Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- UploadThing account
- Resend account (optional, for contact emails)
- Domain + SSL (production)

## 1. Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | Production URL (e.g. `https://cqpm-nador.ma`) |
| `UPLOADTHING_TOKEN` | From UploadThing dashboard |
| `RESEND_API_KEY` | For contact form emails |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |

## 2. Install & Database

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

See [prisma/SEED_AND_MIGRATE.md](./prisma/SEED_AND_MIGRATE.md) for migration order and seed details.

## 3. Development

```bash
npm run dev
```

- Public site: `http://localhost:3000/fr` or `/ar`
- Admin: `http://localhost:3000/admin/login`
- Default admin (after seed): `admin@cqpm-nador.ma` / `Admin@CQPM2025!`

**Change the admin password immediately in production.**

## 4. Production Build

```bash
npm run build
npm run start
```

## 5. Vercel Deployment

1. Import repository to Vercel
2. Set all environment variables
3. Add PostgreSQL (Vercel Postgres, Neon, or Supabase)
4. Build command: `prisma generate && next build`
5. Run migrations via CI or `npx prisma migrate deploy`

## 6. Docker (optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

## 7. Security Checklist

- [ ] Rotate `AUTH_SECRET` and admin password
- [ ] Enable HTTPS only
- [ ] Restrict admin routes via firewall/IP if needed
- [ ] Configure UploadThing file limits
- [ ] Set up database backups
- [ ] Review RBAC roles for each user

## 8. Folder Structure

```
src/
├── app/              # Routes (public [locale], admin, api)
├── components/       # UI + layout
├── features/         # Feature-specific components
├── services/         # Data access layer
├── actions/          # Server actions
├── lib/              # Auth, i18n, security, utils
├── hooks/
├── store/
└── types/
prisma/
├── schema.prisma
└── seed.ts
```

## 9. Post-Deploy

1. Upload logo and hero image via Admin → Paramètres
2. Configure Google Maps embed URL
3. Submit sitemap to Google Search Console: `/sitemap.xml`
4. Test admission flow end-to-end
5. Test FR/AR language switcher
