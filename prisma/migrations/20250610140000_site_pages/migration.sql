-- CreateTable
CREATE TABLE "site_pages" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "excerptFr" TEXT,
    "excerptAr" TEXT,
    "contentFr" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "coverImageUrl" VARCHAR(2048),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_pages_slug_idx" ON "site_pages"("slug");

-- CreateIndex
CREATE INDEX "site_pages_isPublished_order_idx" ON "site_pages"("isPublished", "order");

-- CreateIndex
CREATE INDEX "site_pages_deletedAt_idx" ON "site_pages"("deletedAt");

-- Partial unique slug among active rows
CREATE UNIQUE INDEX "site_pages_slug_active_key" ON "site_pages"("slug") WHERE "deletedAt" IS NULL;
