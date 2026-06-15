# CQPM Nador

**Centre de Qualification Professionnelle Maritime de Nador**

Production-ready web platform built with Next.js 15, TypeScript, Prisma, PostgreSQL, and NextAuth.

## Features

- Bilingual public site (French / Arabic) with RTL support
- Online admission with document uploads (UploadThing)
- Application status tracking by CIN
- News CMS with search and pagination
- Gallery, testimonials, partners
- Admin dashboard with RBAC (SUPER_ADMIN, ADMIN, EDITOR)
- SEO: metadata, Open Graph, sitemap, robots.txt
- Security: rate limiting, validation, audit logs

## Quick Start

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production setup.

## Default Admin

- Email: `admin@cqpm-nador.ma`
- Password: `Admin@CQPM2025!` (change after first login)

## Tech Stack

Next.js 15 • TypeScript • Tailwind CSS • shadcn/ui • Prisma • PostgreSQL • NextAuth • Zod • Framer Motion • UploadThing • Zustand
