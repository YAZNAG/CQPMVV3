-- CreateEnum
CREATE TYPE "SiteStatIcon" AS ENUM ('USERS', 'GRADUATION_CAP', 'CALENDAR', 'HANDSHAKE', 'AWARD', 'SHIP', 'ANCHOR', 'BUILDING', 'STAR');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'OTHER');

-- CreateTable
CREATE TABLE "site_stats" (
    "id" TEXT NOT NULL,
    "labelFr" VARCHAR(120) NOT NULL,
    "labelAr" VARCHAR(120) NOT NULL,
    "value" INTEGER NOT NULL,
    "icon" "SiteStatIcon" NOT NULL DEFAULT 'USERS',
    "showPlus" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "site_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_social_links" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'OTHER',
    "labelFr" VARCHAR(80),
    "labelAr" VARCHAR(80),
    "url" VARCHAR(2048) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "site_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_stats_isPublished_order_idx" ON "site_stats"("isPublished", "order");

-- CreateIndex
CREATE INDEX "site_stats_deletedAt_idx" ON "site_stats"("deletedAt");

-- CreateIndex
CREATE INDEX "site_social_links_isPublished_order_idx" ON "site_social_links"("isPublished", "order");

-- CreateIndex
CREATE INDEX "site_social_links_deletedAt_idx" ON "site_social_links"("deletedAt");

-- Migrate existing stats from SiteSettings
INSERT INTO "site_stats" ("id", "labelFr", "labelAr", "value", "icon", "showPlus", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'stat_students',
    'Stagiaires formés',
    'متدربون مؤهلون',
    s."statsStudents",
    'USERS'::"SiteStatIcon",
    true,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default'
ON CONFLICT DO NOTHING;

INSERT INTO "site_stats" ("id", "labelFr", "labelAr", "value", "icon", "showPlus", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'stat_formations',
    'Formations',
    'تكوينات',
    s."statsFormations",
    'GRADUATION_CAP'::"SiteStatIcon",
    true,
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default'
ON CONFLICT DO NOTHING;

INSERT INTO "site_stats" ("id", "labelFr", "labelAr", "value", "icon", "showPlus", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'stat_years',
    'Années d''expérience',
    'سنوات الخبرة',
    s."statsYears",
    'CALENDAR'::"SiteStatIcon",
    true,
    2,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default'
ON CONFLICT DO NOTHING;

INSERT INTO "site_stats" ("id", "labelFr", "labelAr", "value", "icon", "showPlus", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'stat_partners',
    'Partenaires',
    'شركاء',
    s."statsPartners",
    'HANDSHAKE'::"SiteStatIcon",
    true,
    3,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default'
ON CONFLICT DO NOTHING;

-- Migrate social links from SiteSettings
INSERT INTO "site_social_links" ("id", "platform", "url", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'social_facebook',
    'FACEBOOK'::"SocialPlatform",
    s."facebookUrl",
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default' AND s."facebookUrl" IS NOT NULL AND s."facebookUrl" <> ''
ON CONFLICT DO NOTHING;

INSERT INTO "site_social_links" ("id", "platform", "url", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'social_linkedin',
    'LINKEDIN'::"SocialPlatform",
    s."linkedinUrl",
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default' AND s."linkedinUrl" IS NOT NULL AND s."linkedinUrl" <> ''
ON CONFLICT DO NOTHING;

INSERT INTO "site_social_links" ("id", "platform", "url", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'social_twitter',
    'TWITTER'::"SocialPlatform",
    s."twitterUrl",
    2,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default' AND s."twitterUrl" IS NOT NULL AND s."twitterUrl" <> ''
ON CONFLICT DO NOTHING;

INSERT INTO "site_social_links" ("id", "platform", "url", "order", "isPublished", "createdAt", "updatedAt")
SELECT
    'social_youtube',
    'YOUTUBE'::"SocialPlatform",
    s."youtubeUrl",
    3,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "site_settings" s
WHERE s."id" = 'default' AND s."youtubeUrl" IS NOT NULL AND s."youtubeUrl" <> ''
ON CONFLICT DO NOTHING;
