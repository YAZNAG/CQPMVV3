-- Home engagement items
CREATE TABLE "home_engagement_items" (
    "id" TEXT NOT NULL,
    "keywordFr" VARCHAR(120) NOT NULL,
    "keywordAr" VARCHAR(120) NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "home_engagement_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "home_engagement_items_isPublished_order_idx" ON "home_engagement_items"("isPublished", "order");
CREATE INDEX "home_engagement_items_deletedAt_idx" ON "home_engagement_items"("deletedAt");

-- Home events
CREATE TABLE "home_events" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "eventDate" TIMESTAMPTZ(3),
    "imageUrl" VARCHAR(2048),
    "href" VARCHAR(512),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "home_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "home_events_isPublished_order_idx" ON "home_events"("isPublished", "order");
CREATE INDEX "home_events_deletedAt_idx" ON "home_events"("deletedAt");

-- Site settings — home engagement section
ALTER TABLE "site_settings" ADD COLUMN "homeEventsTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeEventsTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeEventsEmptyFr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "homeEventsEmptyAr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "homeEngagementTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeEngagementTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeEngagementBackgroundUrl" VARCHAR(2048);
ALTER TABLE "site_settings" ADD COLUMN "homeEngagementMediaUrl" VARCHAR(2048);
ALTER TABLE "site_settings" ADD COLUMN "homeEngagementMediaThumbnailUrl" VARCHAR(2048);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerSubtitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerSubtitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerPhone" VARCHAR(40);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerHref" VARCHAR(512);
ALTER TABLE "site_settings" ADD COLUMN "homeContactBannerBackgroundUrl" VARCHAR(2048);
