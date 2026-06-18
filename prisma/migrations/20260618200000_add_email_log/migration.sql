-- CreateEnum
CREATE TYPE "EmailLogType" AS ENUM ('INSCRIPTION_SUBMITTED_ADMIN', 'INSCRIPTION_SUBMITTED_CANDIDATE', 'INSCRIPTION_STATUS_CANDIDATE', 'CONTACT_ADMIN', 'CONTACT_ACK', 'RECLAMATION_ADMIN', 'RECLAMATION_ACK');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "type" "EmailLogType" NOT NULL,
    "status" "EmailLogStatus" NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "errorMessage" TEXT,
    "applicationId" TEXT,
    "reclamationId" TEXT,
    "contactMessageId" TEXT,
    "sentAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_type_sentAt_idx" ON "email_logs"("type", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "email_logs_status_sentAt_idx" ON "email_logs"("status", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "email_logs_applicationId_idx" ON "email_logs"("applicationId");

-- CreateIndex
CREATE INDEX "email_logs_reclamationId_idx" ON "email_logs"("reclamationId");
