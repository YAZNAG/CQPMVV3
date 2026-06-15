-- CreateTable
CREATE TABLE "home_formation_showcases" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "badgeFr" VARCHAR(120),
    "badgeAr" VARCHAR(120),
    "durationFr" VARCHAR(120),
    "durationAr" VARCHAR(120),
    "imageUrl" VARCHAR(2048),
    "icon" "HomeHighlightIcon" NOT NULL DEFAULT 'AWARD',
    "href" VARCHAR(512),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "home_formation_showcases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_formation_showcases_isPublished_order_idx" ON "home_formation_showcases"("isPublished", "order");

-- CreateIndex
CREATE INDEX "home_formation_showcases_deletedAt_idx" ON "home_formation_showcases"("deletedAt");

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsSubtitleFr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsSubtitleAr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsCtaLabelFr" VARCHAR(120);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsCtaLabelAr" VARCHAR(120);
ALTER TABLE "site_settings" ADD COLUMN "homeFormationsCtaHref" VARCHAR(512);
