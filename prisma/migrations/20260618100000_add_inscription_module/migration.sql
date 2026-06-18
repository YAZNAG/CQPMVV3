-- Inscription Module Migration

CREATE TYPE "InscriptionStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'INCOMPLETE', 'ACCEPTED', 'REJECTED');
CREATE TYPE "CandidatProfile" AS ENUM ('COLLEGIEN', 'PROFESSIONNEL', 'APPRENTISSAGE');

CREATE TABLE "inscription_levels" (
    "id" TEXT NOT NULL,
    "nameFr" VARCHAR(200) NOT NULL,
    "nameAr" VARCHAR(200) NOT NULL,
    "descriptionFr" TEXT,
    "descriptionAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscription_filieres" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "nameFr" VARCHAR(200) NOT NULL,
    "nameAr" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_filieres_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscription_conditions" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "filiereId" TEXT,
    "candidatProfile" "CandidatProfile",
    "textFr" TEXT NOT NULL,
    "textAr" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_conditions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscription_pieces" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "filiereId" TEXT,
    "candidatProfile" "CandidatProfile",
    "nameFr" VARCHAR(300) NOT NULL,
    "nameAr" VARCHAR(300) NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "maxSizeMb" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_pieces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscription_years" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "openDate" TIMESTAMPTZ(3),
    "closeDate" TIMESTAMPTZ(3),
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "inscription_years_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inscription_years_year_key" ON "inscription_years"("year");

CREATE TABLE "inscription_applications" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(30) NOT NULL,
    "yearId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "candidatProfile" "CandidatProfile" NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "cin" VARCHAR(20) NOT NULL,
    "dateNaissance" DATE NOT NULL,
    "telephone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(200),
    "adresse" VARCHAR(500) NOT NULL,
    "ville" VARCHAR(100) NOT NULL,
    "niveauScolaire" VARCHAR(200),
    "experienceMois" INTEGER,
    "status" "InscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "motifRefus" TEXT,
    "decisionDate" TIMESTAMPTZ(3),
    "decisionAdminId" TEXT,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inscription_applications_reference_key" ON "inscription_applications"("reference");

CREATE TABLE "inscription_documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "originalName" VARCHAR(300) NOT NULL,
    "storedName" VARCHAR(300) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),
    CONSTRAINT "inscription_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inscription_status_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "InscriptionStatus",
    "toStatus" "InscriptionStatus" NOT NULL,
    "note" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inscription_status_history_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "inscription_levels_isActive_order_idx" ON "inscription_levels"("isActive", "order");
CREATE INDEX "inscription_levels_deletedAt_idx" ON "inscription_levels"("deletedAt");
CREATE INDEX "inscription_filieres_levelId_isActive_idx" ON "inscription_filieres"("levelId", "isActive");
CREATE INDEX "inscription_filieres_deletedAt_idx" ON "inscription_filieres"("deletedAt");
CREATE INDEX "inscription_conditions_levelId_filiereId_idx" ON "inscription_conditions"("levelId", "filiereId");
CREATE INDEX "inscription_conditions_deletedAt_idx" ON "inscription_conditions"("deletedAt");
CREATE INDEX "inscription_pieces_levelId_filiereId_idx" ON "inscription_pieces"("levelId", "filiereId");
CREATE INDEX "inscription_pieces_deletedAt_idx" ON "inscription_pieces"("deletedAt");
CREATE INDEX "inscription_applications_reference_idx" ON "inscription_applications"("reference");
CREATE INDEX "inscription_applications_cin_idx" ON "inscription_applications"("cin");
CREATE INDEX "inscription_applications_status_submittedAt_idx" ON "inscription_applications"("status", "submittedAt" DESC);
CREATE INDEX "inscription_applications_levelId_filiereId_idx" ON "inscription_applications"("levelId", "filiereId");
CREATE INDEX "inscription_applications_yearId_idx" ON "inscription_applications"("yearId");
CREATE INDEX "inscription_applications_deletedAt_idx" ON "inscription_applications"("deletedAt");
CREATE INDEX "inscription_documents_applicationId_idx" ON "inscription_documents"("applicationId");
CREATE INDEX "inscription_documents_pieceId_idx" ON "inscription_documents"("pieceId");
CREATE INDEX "inscription_status_history_applicationId_createdAt_idx" ON "inscription_status_history"("applicationId", "createdAt" DESC);

-- Foreign Keys
ALTER TABLE "inscription_filieres" ADD CONSTRAINT "inscription_filieres_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "inscription_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_conditions" ADD CONSTRAINT "inscription_conditions_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "inscription_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_conditions" ADD CONSTRAINT "inscription_conditions_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "inscription_filieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inscription_pieces" ADD CONSTRAINT "inscription_pieces_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "inscription_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_pieces" ADD CONSTRAINT "inscription_pieces_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "inscription_filieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inscription_applications" ADD CONSTRAINT "inscription_applications_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "inscription_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_applications" ADD CONSTRAINT "inscription_applications_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "inscription_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_applications" ADD CONSTRAINT "inscription_applications_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "inscription_filieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_documents" ADD CONSTRAINT "inscription_documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "inscription_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inscription_documents" ADD CONSTRAINT "inscription_documents_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "inscription_pieces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscription_status_history" ADD CONSTRAINT "inscription_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "inscription_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed data: Levels, Filieres, Conditions, Pieces, Year
DO $$
DECLARE
  level1_id TEXT := gen_random_uuid();
  level2_id TEXT := gen_random_uuid();
  fil1_id TEXT := gen_random_uuid();
  fil2_id TEXT := gen_random_uuid();
  fil3_id TEXT := gen_random_uuid();
  fil4_id TEXT := gen_random_uuid();
  year_id TEXT := gen_random_uuid();
BEGIN

-- Levels
INSERT INTO "inscription_levels" ("id","nameFr","nameAr","descriptionFr","descriptionAr","isActive","order","updatedAt") VALUES
  (level1_id, 'Qualification', 'تأهيل', 'Formation de niveau qualification maritime', 'تكوين على مستوى التأهيل البحري', true, 1, NOW()),
  (level2_id, 'Spécialisation par Apprentissage', 'التخصص بالتمرس', 'Formation par apprentissage maritime', 'تكوين بالتمرس البحري', true, 2, NOW());

-- Filieres
INSERT INTO "inscription_filieres" ("id","levelId","nameFr","nameAr","isActive","order","updatedAt") VALUES
  (fil1_id, level1_id, 'Pêche maritime', 'الصيد البحري', true, 1, NOW()),
  (fil2_id, level1_id, 'Machine', 'الميكانيكا', true, 2, NOW()),
  (fil3_id, level2_id, 'Pêche maritime', 'الصيد البحري', true, 1, NOW()),
  (fil4_id, level2_id, 'Machine', 'الميكانيكا', true, 2, NOW());

-- Conditions - Level 1 / Collegien
INSERT INTO "inscription_conditions" ("id","levelId","filiereId","candidatProfile","textFr","textAr","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Avoir accompli la 9ème année de l''enseignement secondaire collégial', 'إتمام السنة التاسعة من التعليم الثانوي الإعدادي', true, 1, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Être âgé de 18 à 30 ans au 31 décembre de l''année du concours', 'أن يكون عمره بين 18 و30 سنة في 31 ديسمبر من سنة المباراة', true, 2, NOW());

-- Conditions - Level 1 / Professionnel
INSERT INTO "inscription_conditions" ("id","levelId","filiereId","candidatProfile","textFr","textAr","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Être titulaire du diplôme de spécialisation professionnelle maritime', 'حامل دبلوم التخصص المهني البحري', true, 1, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Justifier d''au moins 12 mois de navigation maritime à bord de navires de pêche', 'إثبات ما لا يقل عن 12 شهرًا من الإبحار على متن سفن الصيد', true, 2, NOW());

-- Conditions - Level 2
INSERT INTO "inscription_conditions" ("id","levelId","filiereId","candidatProfile","textFr","textAr","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Avoir un âge minimum de 18 ans', 'أن يكون عمره 18 سنة على الأقل', true, 1, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Justifier d''un niveau scolaire de 6ème année primaire ou d''un certificat d''alphabétisation fonctionnelle homologué', 'إثبات مستوى السنة السادسة ابتدائي أو شهادة محو الأمية الوظيفية المعتمدة', true, 2, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Disposer d''une aptitude médicale délivrée par la médecine maritime', 'التوفر على اللياقة الطبية الصادرة عن طب البحر', true, 3, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Justifier d''un minimum de 18 mois d''embarquement', 'إثبات ما لا يقل عن 18 شهرًا من الإبحار', true, 4, NOW());

-- Pieces - Level 1 / Collegien
INSERT INTO "inscription_pieces" ("id","levelId","filiereId","candidatProfile","nameFr","nameAr","isRequired","maxSizeMb","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Demande manuscrite adressée à la direction du centre', 'طلب يدوي موجه لمدير المركز', true, 5, true, 1, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Copie de la Carte Nationale d''Identité', 'نسخة من بطاقة التعريف الوطنية', true, 5, true, 2, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Certificat de scolarité MASSAR ou visé par la délégation provinciale', 'شهادة مدرسية من مسار أو مؤشرة من النيابة الإقليمية', true, 5, true, 3, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Deux enveloppes timbrées portant le nom et l''adresse du candidat', 'ظرفان مطبوعان يحملان اسم وعنوان المرشح', true, 5, true, 4, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'COLLEGIEN', 'Deux photos récentes', 'صورتان فوتوغرافيتان حديثتان', true, 5, true, 5, NOW());

-- Pieces - Level 1 / Professionnel
INSERT INTO "inscription_pieces" ("id","levelId","filiereId","candidatProfile","nameFr","nameAr","isRequired","maxSizeMb","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Demande manuscrite adressée à la direction du centre', 'طلب يدوي موجه لمدير المركز', true, 5, true, 1, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Copie de la Carte Nationale d''Identité', 'نسخة من بطاقة التعريف الوطنية', true, 5, true, 2, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Copie du diplôme de spécialisation professionnelle maritime certifiée conforme', 'نسخة مطابقة لدبلوم التخصص المهني البحري', true, 5, true, 3, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Relevé de navigation récent de moins de trois mois', 'كشف الإبحار الحديث بأقل من ثلاثة أشهر', true, 5, true, 4, NOW()),
  (gen_random_uuid(), level1_id, NULL, 'PROFESSIONNEL', 'Deux photos récentes', 'صورتان فوتوغرافيتان حديثتان', true, 5, true, 5, NOW());

-- Pieces - Level 2
INSERT INTO "inscription_pieces" ("id","levelId","filiereId","candidatProfile","nameFr","nameAr","isRequired","maxSizeMb","isActive","order","updatedAt") VALUES
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Demande manuscrite précisant nom, adresse, téléphone, email et filière choisie', 'طلب يدوي يذكر الاسم والعنوان والهاتف والبريد الإلكتروني والتخصص المختار', true, 5, true, 1, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Copie de la Carte Nationale d''Identité', 'نسخة من بطاقة التعريف الوطنية', true, 5, true, 2, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Deux photos d''identité récentes', 'صورتان للهوية حديثتان', true, 5, true, 3, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Relevé de navigation actualisé de moins de trois mois', 'كشف الإبحار المحين بأقل من ثلاثة أشهر', true, 5, true, 4, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Copie du certificat scolaire ou d''alphabétisation fonctionnelle', 'نسخة من الشهادة المدرسية أو شهادة محو الأمية الوظيفية', true, 5, true, 5, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Contrat de formation signé et visé par la délégation des pêches maritimes', 'عقد التكوين موقع ومؤشر من نيابة الصيد البحري', true, 5, true, 6, NOW()),
  (gen_random_uuid(), level2_id, NULL, 'APPRENTISSAGE', 'Certificat médical délivré par un médecin de la médecine des gens de mer', 'شهادة طبية صادرة عن طبيب طب البحارة', true, 5, true, 7, NOW());

-- Current year
INSERT INTO "inscription_years" ("id","year","isOpen","updatedAt") VALUES
  (year_id, EXTRACT(YEAR FROM NOW())::INTEGER, true, NOW());

END $$;
