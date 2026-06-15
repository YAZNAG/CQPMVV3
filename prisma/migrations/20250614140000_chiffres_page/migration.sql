-- CreateEnum
CREATE TYPE "ChiffresInfraStyle" AS ENUM ('NAVY', 'GREY', 'OCEAN', 'LIGHT');

-- CreateTable
CREATE TABLE "chiffres_highlights" (
    "id" TEXT NOT NULL,
    "labelFr" VARCHAR(120) NOT NULL,
    "labelAr" VARCHAR(120) NOT NULL,
    "value" INTEGER NOT NULL,
    "suffix" VARCHAR(8),
    "icon" "SiteStatIcon" NOT NULL DEFAULT 'USERS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "chiffres_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chiffres_growth_bars" (
    "id" TEXT NOT NULL,
    "labelFr" VARCHAR(80) NOT NULL,
    "labelAr" VARCHAR(80) NOT NULL,
    "value" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "chiffres_growth_bars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chiffres_formation_items" (
    "id" TEXT NOT NULL,
    "labelFr" VARCHAR(120) NOT NULL,
    "labelAr" VARCHAR(120) NOT NULL,
    "valueText" VARCHAR(32) NOT NULL,
    "icon" "SiteStatIcon" NOT NULL DEFAULT 'BUILDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "chiffres_formation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chiffres_infrastructure_items" (
    "id" TEXT NOT NULL,
    "labelFr" VARCHAR(120) NOT NULL,
    "labelAr" VARCHAR(120) NOT NULL,
    "valueText" VARCHAR(32) NOT NULL,
    "icon" "SiteStatIcon" NOT NULL DEFAULT 'BUILDING',
    "style" "ChiffresInfraStyle" NOT NULL DEFAULT 'GREY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "chiffres_infrastructure_items_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "chiffresPageTitleFr" VARCHAR(255),
ADD COLUMN "chiffresPageTitleAr" VARCHAR(255),
ADD COLUMN "chiffresPageSubtitleFr" VARCHAR(500),
ADD COLUMN "chiffresPageSubtitleAr" VARCHAR(500),
ADD COLUMN "chiffresHeroBackgroundUrl" VARCHAR(2048),
ADD COLUMN "chiffresPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "chiffresEvolutionTitleFr" VARCHAR(255),
ADD COLUMN "chiffresEvolutionTitleAr" VARCHAR(255),
ADD COLUMN "chiffresEvolutionSubtitleFr" VARCHAR(500),
ADD COLUMN "chiffresEvolutionSubtitleAr" VARCHAR(500),
ADD COLUMN "chiffresGrowthChartTitleFr" VARCHAR(255),
ADD COLUMN "chiffresGrowthChartTitleAr" VARCHAR(255),
ADD COLUMN "chiffresSuccessChartTitleFr" VARCHAR(255),
ADD COLUMN "chiffresSuccessChartTitleAr" VARCHAR(255),
ADD COLUMN "chiffresSuccessRateValue" INTEGER NOT NULL DEFAULT 92,
ADD COLUMN "chiffresSuccessRateLabelFr" VARCHAR(120),
ADD COLUMN "chiffresSuccessRateLabelAr" VARCHAR(120),
ADD COLUMN "chiffresCapacityTitleFr" VARCHAR(255),
ADD COLUMN "chiffresCapacityTitleAr" VARCHAR(255),
ADD COLUMN "chiffresFormationColumnTitleFr" VARCHAR(120),
ADD COLUMN "chiffresFormationColumnTitleAr" VARCHAR(120),
ADD COLUMN "chiffresInfrastructureColumnTitleFr" VARCHAR(120),
ADD COLUMN "chiffresInfrastructureColumnTitleAr" VARCHAR(120),
ADD COLUMN "chiffresCtaTitleFr" VARCHAR(255),
ADD COLUMN "chiffresCtaTitleAr" VARCHAR(255),
ADD COLUMN "chiffresCtaTextFr" VARCHAR(500),
ADD COLUMN "chiffresCtaTextAr" VARCHAR(500),
ADD COLUMN "chiffresCtaPrimaryLabelFr" VARCHAR(120),
ADD COLUMN "chiffresCtaPrimaryLabelAr" VARCHAR(120),
ADD COLUMN "chiffresCtaPrimaryHref" VARCHAR(512),
ADD COLUMN "chiffresCtaSecondaryLabelFr" VARCHAR(120),
ADD COLUMN "chiffresCtaSecondaryLabelAr" VARCHAR(120),
ADD COLUMN "chiffresCtaSecondaryHref" VARCHAR(512);

-- CreateIndex
CREATE INDEX "chiffres_highlights_isPublished_order_idx" ON "chiffres_highlights"("isPublished", "order");
CREATE INDEX "chiffres_highlights_deletedAt_idx" ON "chiffres_highlights"("deletedAt");
CREATE INDEX "chiffres_growth_bars_order_idx" ON "chiffres_growth_bars"("order");
CREATE INDEX "chiffres_growth_bars_deletedAt_idx" ON "chiffres_growth_bars"("deletedAt");
CREATE INDEX "chiffres_formation_items_isPublished_order_idx" ON "chiffres_formation_items"("isPublished", "order");
CREATE INDEX "chiffres_formation_items_deletedAt_idx" ON "chiffres_formation_items"("deletedAt");
CREATE INDEX "chiffres_infrastructure_items_isPublished_order_idx" ON "chiffres_infrastructure_items"("isPublished", "order");
CREATE INDEX "chiffres_infrastructure_items_deletedAt_idx" ON "chiffres_infrastructure_items"("deletedAt");
