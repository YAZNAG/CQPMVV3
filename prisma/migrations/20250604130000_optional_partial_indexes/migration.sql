-- Partial unique indexes for soft-delete aware uniqueness (PostgreSQL 15+)
-- Safe to run multiple times (IF NOT EXISTS)

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_active_unique"
  ON "users" ("email")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "formation_categories_slug_active_unique"
  ON "formation_categories" ("slug")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "formations_slug_active_unique"
  ON "formations" ("slug")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "applications_cin_formation_active_unique"
  ON "applications" ("cin", "formationId")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "news_categories_slug_active_unique"
  ON "news_categories" ("slug")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "news_articles_slug_active_unique"
  ON "news_articles" ("slug")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "gallery_albums_slug_active_unique"
  ON "gallery_albums" ("slug")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "media_files_key_active_unique"
  ON "media_files" ("key")
  WHERE "deletedAt" IS NULL AND "key" IS NOT NULL;
