-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WAITING_LIST');

-- CreateEnum
CREATE TYPE "ApplicationGender" AS ENUM ('M', 'F', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CIN', 'DIPLOMA', 'PHOTO');

-- CreateEnum
CREATE TYPE "GalleryItemType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'RESTORE');

-- CreateEnum
CREATE TYPE "MediaFilePurpose" AS ENUM ('APPLICATION_DOCUMENT', 'GALLERY', 'NEWS_COVER', 'SITE_ASSET', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120),
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" VARCHAR(2048),
    "lastLoginAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(64) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(64),
    "scope" VARCHAR(255),
    "id_token" TEXT,
    "session_state" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" VARCHAR(512) NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "expires" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "formation_categories" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "nameFr" VARCHAR(255) NOT NULL,
    "nameAr" VARCHAR(255) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "formation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "objectivesFr" TEXT NOT NULL,
    "objectivesAr" TEXT NOT NULL,
    "durationFr" VARCHAR(120) NOT NULL,
    "durationAr" VARCHAR(120) NOT NULL,
    "requirementsFr" TEXT NOT NULL,
    "requirementsAr" TEXT NOT NULL,
    "imageUrl" VARCHAR(2048),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "referenceNumber" VARCHAR(32) NOT NULL,
    "lastName" VARCHAR(120) NOT NULL,
    "firstName" VARCHAR(120) NOT NULL,
    "cin" VARCHAR(20) NOT NULL,
    "birthDate" DATE NOT NULL,
    "gender" "ApplicationGender" NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "educationLevel" VARCHAR(120) NOT NULL,
    "formationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "statusNote" TEXT,
    "reviewedAt" TIMESTAMPTZ(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "mediaFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "application_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "nameFr" VARCHAR(255) NOT NULL,
    "nameAr" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "categoryId" TEXT,
    "authorId" TEXT,
    "titleFr" VARCHAR(500) NOT NULL,
    "titleAr" VARCHAR(500) NOT NULL,
    "excerptFr" TEXT NOT NULL,
    "excerptAr" TEXT NOT NULL,
    "contentFr" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "coverImageUrl" VARCHAR(2048),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_albums" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "coverImageUrl" VARCHAR(2048),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "gallery_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "type" "GalleryItemType" NOT NULL DEFAULT 'PHOTO',
    "titleFr" VARCHAR(255),
    "titleAr" VARCHAR(255),
    "mediaFileId" TEXT,
    "videoUrl" VARCHAR(2048),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "key" VARCHAR(512),
    "name" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(127) NOT NULL,
    "size" INTEGER NOT NULL,
    "purpose" "MediaFilePurpose" NOT NULL DEFAULT 'OTHER',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "nameFr" VARCHAR(120) NOT NULL,
    "nameAr" VARCHAR(120) NOT NULL,
    "roleFr" VARCHAR(120),
    "roleAr" VARCHAR(120),
    "contentFr" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "imageUrl" VARCHAR(2048),
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logoUrl" VARCHAR(2048) NOT NULL,
    "websiteUrl" VARCHAR(2048),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'default',
    "siteNameFr" VARCHAR(255) NOT NULL DEFAULT 'CQPM Nador',
    "siteNameAr" VARCHAR(255) NOT NULL DEFAULT 'مركز التأهيل المهني البحري الناظور',
    "taglineFr" VARCHAR(500) NOT NULL DEFAULT 'Former les professionnels de la mer de demain',
    "taglineAr" VARCHAR(500) NOT NULL DEFAULT 'تكوين مهنيي البحر في الغد',
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "addressFr" VARCHAR(500),
    "addressAr" VARCHAR(500),
    "aboutHistoryFr" TEXT,
    "aboutHistoryAr" TEXT,
    "aboutPresentationFr" TEXT,
    "aboutPresentationAr" TEXT,
    "missionFr" TEXT,
    "missionAr" TEXT,
    "visionFr" TEXT,
    "visionAr" TEXT,
    "valuesFr" TEXT,
    "valuesAr" TEXT,
    "statsStudents" INTEGER NOT NULL DEFAULT 2500,
    "statsFormations" INTEGER NOT NULL DEFAULT 15,
    "statsYears" INTEGER NOT NULL DEFAULT 25,
    "statsPartners" INTEGER NOT NULL DEFAULT 12,
    "facebookUrl" VARCHAR(2048),
    "twitterUrl" VARCHAR(2048),
    "linkedinUrl" VARCHAR(2048),
    "youtubeUrl" VARCHAR(2048),
    "heroImageUrl" VARCHAR(2048),
    "logoUrl" VARCHAR(2048),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" VARCHAR(64) NOT NULL,
    "entityId" VARCHAR(32),
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expires_idx" ON "sessions"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "formation_categories_slug_idx" ON "formation_categories"("slug");

-- CreateIndex
CREATE INDEX "formation_categories_isPublished_order_idx" ON "formation_categories"("isPublished", "order");

-- CreateIndex
CREATE INDEX "formation_categories_deletedAt_idx" ON "formation_categories"("deletedAt");

-- CreateIndex
CREATE INDEX "formations_slug_idx" ON "formations"("slug");

-- CreateIndex
CREATE INDEX "formations_categoryId_isPublished_order_idx" ON "formations"("categoryId", "isPublished", "order");

-- CreateIndex
CREATE INDEX "formations_deletedAt_idx" ON "formations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "applications_referenceNumber_key" ON "applications"("referenceNumber");

-- CreateIndex
CREATE INDEX "applications_cin_formationId_idx" ON "applications"("cin", "formationId");

-- CreateIndex
CREATE INDEX "applications_cin_idx" ON "applications"("cin");

-- CreateIndex
CREATE INDEX "applications_status_createdAt_idx" ON "applications"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "applications_formationId_status_idx" ON "applications"("formationId", "status");

-- CreateIndex
CREATE INDEX "applications_reviewedById_idx" ON "applications"("reviewedById");

-- CreateIndex
CREATE INDEX "applications_deletedAt_idx" ON "applications"("deletedAt");

-- CreateIndex
CREATE INDEX "application_documents_mediaFileId_idx" ON "application_documents"("mediaFileId");

-- CreateIndex
CREATE UNIQUE INDEX "application_documents_applicationId_type_key" ON "application_documents"("applicationId", "type");

-- CreateIndex
CREATE INDEX "news_categories_slug_idx" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_order_idx" ON "news_categories"("order");

-- CreateIndex
CREATE INDEX "news_categories_deletedAt_idx" ON "news_categories"("deletedAt");

-- CreateIndex
CREATE INDEX "news_articles_slug_idx" ON "news_articles"("slug");

-- CreateIndex
CREATE INDEX "news_articles_isPublished_publishedAt_idx" ON "news_articles"("isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "news_articles_isFeatured_isPublished_idx" ON "news_articles"("isFeatured", "isPublished");

-- CreateIndex
CREATE INDEX "news_articles_categoryId_idx" ON "news_articles"("categoryId");

-- CreateIndex
CREATE INDEX "news_articles_authorId_idx" ON "news_articles"("authorId");

-- CreateIndex
CREATE INDEX "news_articles_deletedAt_idx" ON "news_articles"("deletedAt");

-- CreateIndex
CREATE INDEX "gallery_albums_slug_idx" ON "gallery_albums"("slug");

-- CreateIndex
CREATE INDEX "gallery_albums_isPublished_order_idx" ON "gallery_albums"("isPublished", "order");

-- CreateIndex
CREATE INDEX "gallery_albums_deletedAt_idx" ON "gallery_albums"("deletedAt");

-- CreateIndex
CREATE INDEX "gallery_items_albumId_order_idx" ON "gallery_items"("albumId", "order");

-- CreateIndex
CREATE INDEX "gallery_items_type_idx" ON "gallery_items"("type");

-- CreateIndex
CREATE INDEX "gallery_items_deletedAt_idx" ON "gallery_items"("deletedAt");

-- CreateIndex
CREATE INDEX "media_files_key_idx" ON "media_files"("key");

-- CreateIndex
CREATE INDEX "media_files_purpose_idx" ON "media_files"("purpose");

-- CreateIndex
CREATE INDEX "media_files_uploadedById_idx" ON "media_files"("uploadedById");

-- CreateIndex
CREATE INDEX "media_files_deletedAt_idx" ON "media_files"("deletedAt");

-- CreateIndex
CREATE INDEX "contact_messages_isRead_createdAt_idx" ON "contact_messages"("isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");

-- CreateIndex
CREATE INDEX "contact_messages_deletedAt_idx" ON "contact_messages"("deletedAt");

-- CreateIndex
CREATE INDEX "testimonials_isPublished_order_idx" ON "testimonials"("isPublished", "order");

-- CreateIndex
CREATE INDEX "testimonials_deletedAt_idx" ON "testimonials"("deletedAt");

-- CreateIndex
CREATE INDEX "partners_isPublished_order_idx" ON "partners"("isPublished", "order");

-- CreateIndex
CREATE INDEX "partners_deletedAt_idx" ON "partners"("deletedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "formation_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_documents" ADD CONSTRAINT "application_documents_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "gallery_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
