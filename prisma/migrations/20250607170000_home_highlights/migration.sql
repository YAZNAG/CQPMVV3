-- CreateEnum
CREATE TYPE "HomeHighlightIcon" AS ENUM ('ANCHOR', 'SHIP', 'USER', 'BUILDING', 'AWARD');

-- CreateTable
CREATE TABLE "home_highlights" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "subtitleFr" VARCHAR(255) NOT NULL,
    "subtitleAr" VARCHAR(255) NOT NULL,
    "backgroundColor" VARCHAR(32) NOT NULL DEFAULT '#2563eb',
    "imageUrl" VARCHAR(2048),
    "icon" "HomeHighlightIcon" NOT NULL DEFAULT 'ANCHOR',
    "href" VARCHAR(512),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "home_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_highlights_isPublished_order_idx" ON "home_highlights"("isPublished", "order");

-- CreateIndex
CREATE INDEX "home_highlights_deletedAt_idx" ON "home_highlights"("deletedAt");
