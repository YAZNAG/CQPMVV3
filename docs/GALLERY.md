# Gallery Management System

## Admin (`/admin/gallery`)

| Route | Description |
|-------|-------------|
| `/admin/gallery` | Album grid — search, published/draft filter, pagination |
| `/admin/gallery/new` | Create album |
| `/admin/gallery/[id]/edit` | Album settings + media manager |

### Media manager

- **Photos:** UploadThing `galleryImage` (up to 10 images, 12 MB each) → `MediaFile` + `GalleryItem` (PHOTO)
- **Videos:** External URL (YouTube, Vimeo, embed) → `GalleryItem` (VIDEO)
- Reorder (↑↓), delete, filter tabs (all / photos / videos)
- First uploaded photo auto-sets album cover if empty

## Public

- `/[locale]/gallery` — album listing with `?q=` search, `?type=photo|video` filter, `?page=`
- `/[locale]/gallery/[slug]` — album detail with media filter tabs + photo lightbox

## SEO

- Unique slugs per album: `/fr/gallery/mon-album`, `/ar/gallery/mon-album`
- Open Graph uses cover image when set

## Permissions

`gallery:read` / `gallery:write` — `EDITOR`, `ADMIN`, `SUPER_ADMIN`
