-- CreateEnum
CREATE TYPE "ReclamationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReclamationType" AS ENUM ('ADMINISTRATIVE', 'PEDAGOGICAL', 'INFRASTRUCTURE', 'OTHER');

-- CreateTable
CREATE TABLE "reclamations" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "cin" VARCHAR(32) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "type" "ReclamationType" NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "attachmentUrl" VARCHAR(2048),
    "status" "ReclamationStatus" NOT NULL DEFAULT 'PENDING',
    "responseNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "reclamations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reclamations_reference_key" ON "reclamations"("reference");

-- CreateIndex
CREATE INDEX "reclamations_reference_idx" ON "reclamations"("reference");

-- CreateIndex
CREATE INDEX "reclamations_email_reference_idx" ON "reclamations"("email", "reference");

-- CreateIndex
CREATE INDEX "reclamations_status_createdAt_idx" ON "reclamations"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "reclamations_deletedAt_idx" ON "reclamations"("deletedAt");
