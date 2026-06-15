# News CMS

## Admin routes

| Route | Description |
|-------|-------------|
| `/admin/news` | Article list, search, status filters, pagination |
| `/admin/news/new` | Create article (TipTap FR/AR, cover upload) |
| `/admin/news/[id]/edit` | Edit / delete article |
| `/admin/news/categories` | Manage categories (bilingual names, SEO slugs) |

**Roles:** `EDITOR`, `ADMIN`, `SUPER_ADMIN` can write; all three can read.

## Public routes (SEO slugs)

- `/[locale]/news` — listing with search (`?q=`), category (`?category=slug`), pagination (`?page=`)
- `/[locale]/news/[slug]` — article detail, canonical URL, Open Graph, JSON-LD

## Features

- **Categories** — ordered, soft-deleted, slug-based filters
- **Articles** — bilingual title, excerpt, HTML content
- **Rich text** — TipTap (StarterKit, links, images via URL)
- **Featured** — `isFeatured` + hero block on news index (page 1)
- **Cover image** — UploadThing `adminMedia`
- **Publish** — draft vs published, optional `publishedAt`

## Slugs

Auto-generated from French title; editable. Uniqueness enforced among active (`deletedAt: null`) records.
