/**
 * Test backend equivalent du parcours /fr/inscription (sans navigateur).
 * Reproduit exactement la logique de submitInscriptionApplication + saveInscriptionDocument
 * + génération du reçu + emails, pour valider la chaîne complète.
 *
 * Usage: npx tsx scripts/test-final-inscription.ts
 */
import { prisma } from "@/lib/db";
import { writeCandidatFile } from "@/lib/storage/candidat-storage";
import { sendEmail, buildAdminInscriptionEmail, buildCandidateConfirmationEmail } from "@/lib/email/mailer";

async function main() {
  const year = await prisma.inscriptionYear.findFirst({ where: { isOpen: true } });
  if (!year) throw new Error("Aucune année ouverte");

  const level = await prisma.inscriptionLevel.findFirst({ where: { nameFr: "Qualification" } });
  const filiere = await prisma.inscriptionFiliere.findFirst({ where: { nameFr: "Pêche maritime", levelId: level?.id } });
  if (!level || !filiere) throw new Error("Niveau/filière introuvable");

  const cin = "TESTFINAL2026";
  const existing = await prisma.inscriptionApplication.findFirst({ where: { cin, yearId: year.id, deletedAt: null } });
  if (existing) {
    console.log(`Un dossier existe déjà pour ce CIN: ${existing.reference} (id: ${existing.id})`);
    process.exit(0);
  }

  const appCount = await prisma.inscriptionApplication.count({ where: { yearId: year.id } });
  const reference = `CQPM-${year.year}-${String(appCount + 1).padStart(6, "0")}`;

  const app = await prisma.$transaction(async (tx) => {
    const created = await tx.inscriptionApplication.create({
      data: {
        reference,
        yearId: year.id,
        levelId: level.id,
        filiereId: filiere.id,
        candidatProfile: "COLLEGIEN",
        nom: "TEST",
        prenom: "FINAL",
        cin,
        dateNaissance: new Date("2000-01-01"),
        telephone: "0600000000",
        email: "optizaworks@gmail.com",
        adresse: "Adresse de test",
        ville: "Nador",
      },
    });
    await tx.inscriptionStatusHistory.create({
      data: { applicationId: created.id, fromStatus: null, toStatus: "PENDING", note: "Dossier déposé en ligne (test final)" },
    });
    return created;
  });

  console.log(`Dossier créé: ${reference} (id: ${app.id}), statut: ${app.status}`);

  // Simule l'upload d'une pièce (PDF factice) — mêmes opérations que /api/inscriptions/upload
  const piece = await prisma.inscriptionPiece.findFirst({ where: { levelId: level.id, isActive: true } });
  if (piece) {
    const fakePdf = Buffer.from("%PDF-1.4\n%Test final CQPM\n", "utf-8");
    const storedName = `test-final-${Date.now()}.pdf`;
    await writeCandidatFile(reference, storedName, fakePdf);
    await prisma.inscriptionDocument.create({
      data: {
        applicationId: app.id,
        pieceId: piece.id,
        originalName: "piece-test.pdf",
        storedName,
        mimeType: "application/pdf",
        sizeBytes: fakePdf.length,
      },
    });
    console.log(`Pièce stockée dans storage/candidats/${reference}/${storedName}`);
  } else {
    console.log("Aucune pièce active configurée pour ce niveau — étape ignorée");
  }

  // Emails (admin + candidat) — mêmes templates que le formulaire réel
  const adminEmail = process.env.ADMIN_INSCRIPTIONS_EMAIL ?? process.env.ADMIN_EMAIL ?? "inscriptions@cqpm-nador.ma";
  const emailData = {
    reference,
    nom: app.nom,
    prenom: app.prenom,
    cin: app.cin,
    telephone: app.telephone,
    email: app.email,
    levelName: level.nameFr,
    filiereName: filiere.nameFr,
    candidatProfile: app.candidatProfile,
    submittedAt: app.submittedAt,
    applicationId: app.id,
  };

  const adminTpl = buildAdminInscriptionEmail(emailData);
  const adminResult = await sendEmail({ ...adminTpl, to: adminEmail, type: "INSCRIPTION_SUBMITTED_ADMIN", applicationId: app.id });
  console.log(`Email admin (${adminEmail}):`, adminResult);

  const candidateTpl = buildCandidateConfirmationEmail(emailData);
  const candidateResult = await sendEmail({ ...candidateTpl, to: app.email!, type: "INSCRIPTION_SUBMITTED_CANDIDATE", applicationId: app.id });
  console.log(`Email candidat (${app.email}):`, candidateResult);

  // Vérifications finales
  const dashboardCheck = await prisma.inscriptionApplication.findFirst({
    where: { id: app.id, deletedAt: null },
    include: { documents: true, level: true, filiere: true },
  });
  console.log("\n=== VERIFICATION ===");
  console.log("Visible dans inscription_applications:", !!dashboardCheck);
  console.log("Statut:", dashboardCheck?.status);
  console.log("Documents liés:", dashboardCheck?.documents.length);
  console.log("Niveau/Filière:", dashboardCheck?.level.nameFr, "/", dashboardCheck?.filiere.nameFr);

  const oldTableCheck = await prisma.application.count({ where: { cin } });
  console.log("Présence dans l'ancienne table 'applications' (doit être 0):", oldTableCheck);

  console.log("\nCode dossier final:", reference);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
