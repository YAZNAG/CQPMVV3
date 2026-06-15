# Admission Management System

## Public (`/[locale]/admission`)

- **Register tab**: Online form with CIN, diploma (PDF), and photo uploads via UploadThing.
- **Track tab**: Status lookup by CIN (also at `/[locale]/status` → redirects to `?tab=track`).

## Admin (`/admin/admissions`)

- List with filters (status, search) and stats.
- Detail page `/admin/admissions/[id]` with documents and review panel.
- Actions: Accept, Reject, Waiting List, Return to Pending.
- Optional internal note (included in applicant email when enabled).

## Email (Resend)

Configure in `.env`:

```env
RESEND_API_KEY=
FROM_EMAIL=noreply@cqpm-nador.ma
CONTACT_EMAIL=contact@cqpm-nador.ma
```

| Event | Recipient |
|-------|-----------|
| New application | Applicant + `CONTACT_EMAIL` |
| Status change | Applicant (if checkbox enabled) |

Emails are skipped silently if `RESEND_API_KEY` is missing (dev-friendly).

## Permissions

- `admissions:read` — list and view
- `admissions:write` — review and change status

Roles: `SUPER_ADMIN`, `ADMIN` (full); `EDITOR` per RBAC matrix.
