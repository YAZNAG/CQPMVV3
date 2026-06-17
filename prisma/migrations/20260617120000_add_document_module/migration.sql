-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "nameFr" VARCHAR(255) NOT NULL,
    "nameAr" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255),
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "categoryId" TEXT,
    "fileUrl" VARCHAR(2048) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMPTZ(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_slug_key" ON "document_categories"("slug");

-- CreateIndex
CREATE INDEX "document_categories_isActive_sortOrder_idx" ON "document_categories"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "document_categories_deletedAt_idx" ON "document_categories"("deletedAt");

-- CreateIndex
CREATE INDEX "documents_status_publishedAt_idx" ON "documents"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "documents_categoryId_idx" ON "documents"("categoryId");

-- CreateIndex
CREATE INDEX "documents_deletedAt_idx" ON "documents"("deletedAt");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
