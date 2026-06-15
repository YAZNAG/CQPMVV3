-- CreateEnum
CREATE TYPE "ContactFieldType" AS ENUM ('TEXT', 'EMAIL', 'TEL', 'NUMBER', 'TEXTAREA', 'DATE', 'SELECT', 'RADIO', 'CHECKBOX', 'CHECKBOX_GROUP', 'HEADING', 'PARAGRAPH', 'DIVIDER', 'SUBMIT_BUTTON');

-- CreateTable
CREATE TABLE "contact_form_fields" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "type" "ContactFieldType" NOT NULL,
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

    CONSTRAINT "contact_form_fields_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN "formData" JSONB;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "contactHoursFr" VARCHAR(255),
ADD COLUMN "contactHoursAr" VARCHAR(255),
ADD COLUMN "contactIntroFr" VARCHAR(500),
ADD COLUMN "contactIntroAr" VARCHAR(500),
ADD COLUMN "contactMapUrl" VARCHAR(2048);

-- CreateIndex
CREATE INDEX "contact_form_fields_isPublished_order_idx" ON "contact_form_fields"("isPublished", "order");

-- CreateIndex
CREATE INDEX "contact_form_fields_key_idx" ON "contact_form_fields"("key");

-- CreateIndex
CREATE INDEX "contact_form_fields_deletedAt_idx" ON "contact_form_fields"("deletedAt");
