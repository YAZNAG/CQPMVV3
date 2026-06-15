-- Use OTHER as default for new application documents (separate migration after enum commit)
ALTER TABLE "application_documents" ALTER COLUMN "type" SET DEFAULT 'OTHER';
