-- Mot du directeur (section accueil, éditable depuis Paramètres)
ALTER TABLE "site_settings" ADD COLUMN "directorPhotoUrl" VARCHAR(2048);
ALTER TABLE "site_settings" ADD COLUMN "directorQuoteFr" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "directorQuoteAr" TEXT;
ALTER TABLE "site_settings" ADD COLUMN "directorNameFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "directorNameAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "directorTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "directorTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "directorMessagePublished" BOOLEAN NOT NULL DEFAULT true;
