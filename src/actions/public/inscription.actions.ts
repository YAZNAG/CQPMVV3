"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { inscriptionApplicationSchema } from "@/lib/validations/inscription";
import { generateReference } from "@/services/inscription.service";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

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
