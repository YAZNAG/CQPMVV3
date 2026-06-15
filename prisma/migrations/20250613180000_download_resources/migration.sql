-- CreateEnum
CREATE TYPE "DownloadResourceIcon" AS ENUM ('PDF', 'SUCCESS', 'FOLDER', 'RULES');

-- CreateEnum
CREATE TYPE "DownloadActionType" AS ENUM ('DOWNLOAD', 'VIEW');

-- CreateTable
CREATE TABLE "download_resources" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "infoLabelFr" VARCHAR(255),
    "infoLabelAr" VARCHAR(255),
    "excerptFr" TEXT,
    "excerptAr" TEXT,
    "contentFr" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "icon" "DownloadResourceIcon" NOT NULL DEFAULT 'PDF',
    "actionType" "DownloadActionType" NOT NULL DEFAULT 'DOWNLOAD',
    "fileUrl" VARCHAR(2048),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "download_resources_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "downloadsSectionTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "downloadsSectionTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "downloadsSectionSubtitleFr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "downloadsSectionSubtitleAr" VARCHAR(500);

-- CreateIndex
CREATE UNIQUE INDEX "download_resources_slug_key" ON "download_resources"("slug");

-- CreateIndex
CREATE INDEX "download_resources_isPublished_order_idx" ON "download_resources"("isPublished", "order");

-- CreateIndex
CREATE INDEX "download_resources_deletedAt_idx" ON "download_resources"("deletedAt");
