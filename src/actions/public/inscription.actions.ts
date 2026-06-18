"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { inscriptionApplicationSchema } from "@/lib/validations/inscription";
import { generateReference } from "@/services/inscription.service";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";
import {
  sendEmail,
  buildAdminInscriptionEmail,
  buildCandidateConfirmationEmail,
} from "@/lib/email/mailer";

type SubmitResult = ActionResult & { reference?: string; applicationId?: string };

export async function submitInscriptionApplication(
  formData: z.infer<typeof inscriptionApplicationSchema>
): Promise<SubmitResult> {
  try {
    const parsed = inscriptionApplicationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: "Données invalides: " + parsed.error.issues[0]?.message };
    }
    const d = parsed.data;

    const year = await prisma.inscriptionYear.findFirst({ where: { isOpen: true } });
    if (!year) return { success: false, error: "Les inscriptions ne sont pas ouvertes actuellement." };

    const existingCin = await prisma.inscriptionApplication.findFirst({
      where: { cin: d.cin.toUpperCase(), yearId: year.id, deletedAt: null },
    });
    if (existingCin) {
      return {
        success: false,
        error: `Un dossier existe déjà pour ce CIN cette année. Référence: ${existingCin.reference}`,
      };
    }

    const reference = await generateReference(year.id);

    const app = await prisma.inscriptionApplication.create({
      data: {
        reference,
        yearId: year.id,
        levelId: d.levelId,
        filiereId: d.filiereId,
        candidatProfile: d.candidatProfile,
        nom: d.nom.trim().toUpperCase(),
        prenom: d.prenom.trim(),
        cin: d.cin.toUpperCase(),
        dateNaissance: new Date(d.dateNaissance),
        telephone: d.telephone,
        email: d.email || null,
        adresse: d.adresse,
        ville: d.ville,
        niveauScolaire: d.niveauScolaire || null,
        experienceMois: d.experienceMois || null,
      },
    });

    await prisma.inscriptionStatusHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: null,
        toStatus: "PENDING",
        note: "Dossier déposé en ligne",
      },
    });

    revalidatePath("/admin/inscriptions");

    // Send emails asynchronously (non-blocking)
    const level = await prisma.inscriptionLevel.findUnique({ where: { id: d.levelId }, select: { nameFr: true } });
    const filiere = await prisma.inscriptionFiliere.findUnique({ where: { id: d.filiereId }, select: { nameFr: true } });
    const emailData = {
      reference,
      nom: app.nom,
      prenom: app.prenom,
      cin: app.cin,
      telephone: app.telephone,
      email: app.email,
      levelName: level?.nameFr ?? d.levelId,
      filiereName: filiere?.nameFr ?? d.filiereId,
      candidatProfile: app.candidatProfile,
      submittedAt: app.submittedAt ?? new Date(),
      applicationId: app.id,
    };

    const adminEmail = process.env.ADMIN_INSCRIPTIONS_EMAIL ?? process.env.ADMIN_EMAIL ?? "inscriptions@cqpm-nador.ma";
    const adminTpl = buildAdminInscriptionEmail(emailData);
    sendEmail({ ...adminTpl, to: adminEmail, type: "INSCRIPTION_SUBMITTED_ADMIN", applicationId: app.id }).catch(() => {});

    if (app.email) {
      const candidateTpl = buildCandidateConfirmationEmail(emailData);
      sendEmail({ ...candidateTpl, to: app.email, type: "INSCRIPTION_SUBMITTED_CANDIDATE", applicationId: app.id }).catch(() => {});
    }

    return { success: true, reference, applicationId: app.id };
  } catch (err) {
    console.error("submitInscriptionApplication:", err);
    return { success: false, error: "Erreur lors de la soumission du dossier." };
  }
}

export async function saveInscriptionDocument(
  applicationId: string,
  pieceId: string,
  originalName: string,
  storedName: string,
  mimeType: string,
  sizeBytes: number
): Promise<ActionResult> {
  try {
    await prisma.inscriptionDocument.create({
      data: { applicationId, pieceId, originalName, storedName, mimeType, sizeBytes },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erreur lors de l'enregistrement du document." };
  }
}
