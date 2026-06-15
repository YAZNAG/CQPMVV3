-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "subtitleFr" TEXT NOT NULL,
    "subtitleAr" TEXT NOT NULL,
    "imageUrl" VARCHAR(2048) NOT NULL,
    "buttons" JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_isPublished_order_idx" ON "hero_slides"("isPublished", "order");

-- CreateIndex
CREATE INDEX "hero_slides_deletedAt_idx" ON "hero_slides"("deletedAt");
