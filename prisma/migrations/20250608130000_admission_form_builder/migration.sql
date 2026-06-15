-- AlterEnum (must not use OTHER in same transaction)
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'OTHER';

-- AlterTable
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "formData" JSONB;

-- AlterTable
ALTER TABLE "application_documents" ADD COLUMN IF NOT EXISTS "documentKey" VARCHAR(80) NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS "labelFr" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "labelAr" VARCHAR(255);

-- DropIndex
DROP INDEX IF EXISTS "application_documents_applicationId_type_key";

-- Backfill document keys from legacy types
UPDATE "application_documents" SET "documentKey" = LOWER("type"::text) WHERE "documentKey" = 'other';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "application_documents_applicationId_documentKey_key" ON "application_documents"("applicationId", "documentKey");

-- CreateEnum
CREATE TYPE "AdmissionFieldType" AS ENUM ('TEXT', 'EMAIL', 'TEL', 'NUMBER', 'TEXTAREA', 'DATE', 'SELECT', 'RADIO', 'CHECKBOX', 'CHECKBOX_GROUP', 'GENDER_SELECT', 'FORMATION_SELECT', 'HEADING', 'PARAGRAPH', 'DIVIDER', 'SUBMIT_BUTTON');

-- CreateTable
CREATE TABLE IF NOT EXISTS "formation_document_requirements" (
    "id" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "documentKey" VARCHAR(80) NOT NULL,
    "labelFr" VARCHAR(255) NOT NULL,
    "labelAr" VARCHAR(255) NOT NULL,
    "hintFr" VARCHAR(500),
    "hintAr" VARCHAR(500),
    "acceptTypes" VARCHAR(32) NOT NULL DEFAULT 'pdf',
    "maxSizeMb" INTEGER NOT NULL DEFAULT 8,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "formation_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "admission_form_fields" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "type" "AdmissionFieldType" NOT NULL,
    "labelFr" VARCHAR(255) NOT NULL,
    "labelAr" VARCHAR(255) NOT NULL,
    "placeholderFr" VARCHAR(255),
    "placeholderAr" VARCHAR(255),
    "helpTextFr" VARCHAR(500),
    "helpTextAr" VARCHAR(500),
    "options" JSONB,
    "defaultValue" VARCHAR(500),
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "width" VARCHAR(16) NOT NULL DEFAULT 'full',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "buttonStyle" VARCHAR(32),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "admission_form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "formation_document_requirements_formationId_documentKey_key" ON "formation_document_requirements"("formationId", "documentKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "formation_document_requirements_formationId_order_idx" ON "formation_document_requirements"("formationId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "formation_document_requirements_deletedAt_idx" ON "formation_document_requirements"("deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admission_form_fields_isPublished_order_idx" ON "admission_form_fields"("isPublished", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admission_form_fields_key_idx" ON "admission_form_fields"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admission_form_fields_deletedAt_idx" ON "admission_form_fields"("deletedAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "formation_document_requirements" ADD CONSTRAINT "formation_document_requirements_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
