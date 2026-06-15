-- AlterTable
ALTER TABLE "formations" ADD COLUMN "showOnHome" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "formations" ADD COLUMN "homeOrder" INTEGER NOT NULL DEFAULT 0;

-- Index
CREATE INDEX "formations_showOnHome_homeOrder_idx" ON "formations"("showOnHome", "homeOrder");

-- Migrate existing home showcase cards to formation flags
UPDATE "formations" AS f
SET
  "showOnHome" = true,
  "homeOrder" = s."order"
FROM "home_formation_showcases" AS s
WHERE
  s."deletedAt" IS NULL
  AND s."isPublished" = true
  AND s."href" IS NOT NULL
  AND f."deletedAt" IS NULL
  AND f."slug" = (
    substring(s."href" from '/formations/([^/?#]+)')
  );
