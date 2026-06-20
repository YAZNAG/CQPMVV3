"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { z } from "zod";
import type { ActionResult } from "@/types";
import { sendEmail, buildStatusChangeEmail } from "@/lib/email/mailer";
import {
  levelSchema,
  filiereSchema,
  conditionSchema,
  pieceSchema,
  yearSchema,
  niveauScolaireSchema,
  inscriptionStatusUpdateSchema,
} from "@/lib/validations/inscription";

const idSchema = z.object({ id: z.string().cuid() });

function revalidateInscriptions() {
  revalidatePath("/admin/inscriptions");
}

// ─── Levels ──────────────────────────────────────────────────────────────────

export async function createLevel(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createLevel",
    resource: "admissions",
    permission: "write",
    schema: levelSchema,
    input,
    handler: async ({ session }, data) => {
      await prisma.inscriptionLevel.create({ data: data as typeof levelSchema._type });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionLevel", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updateLevel(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateLevel",
    resource: "admissions",
    permission: "write",
    schema: levelSchema.extend({ id: z.string().cuid() }),
    input,
    handler: async ({ session }, data) => {
      const { id, ...rest } = data as { id: string } & typeof levelSchema._type;
      await prisma.inscriptionLevel.update({ where: { id }, data: rest });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionLevel", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function deleteLevel(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteLevel",
    resource: "admissions",
    permission: "write",
    schema: idSchema,
    input: { id },
    handler: async ({ session }) => {
      const count = await prisma.inscriptionApplication.count({ where: { levelId: id, deletedAt: null } });
      if (count > 0) return { success: false, error: "Des candidatures sont liées à ce niveau." };
      await prisma.inscriptionLevel.update({ where: { id }, data: { deletedAt: new Date() } });
      await createAuditLog({ userId: session.user.id, action: "DELETE", entity: "InscriptionLevel", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

// ─── Filieres ─────────────────────────────────────────────────────────────────

export async function createFiliere(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createFiliere", resource: "admissions", permission: "write",
    schema: filiereSchema, input,
    handler: async ({ session }, data) => {
      await prisma.inscriptionFiliere.create({ data: data as typeof filiereSchema._type });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionFiliere", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updateFiliere(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateFiliere", resource: "admissions", permission: "write",
    schema: filiereSchema.extend({ id: z.string().cuid() }), input,
    handler: async ({ session }, data) => {
      const { id, ...rest } = data as { id: string } & typeof filiereSchema._type;
      await prisma.inscriptionFiliere.update({ where: { id }, data: rest });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionFiliere", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function deleteFiliere(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteFiliere", resource: "admissions", permission: "write",
    schema: idSchema, input: { id },
    handler: async ({ session }) => {
      const count = await prisma.inscriptionApplication.count({ where: { filiereId: id, deletedAt: null } });
      if (count > 0) return { success: false, error: "Des candidatures sont liées à cette filière." };
      await prisma.inscriptionFiliere.update({ where: { id }, data: { deletedAt: new Date() } });
      await createAuditLog({ userId: session.user.id, action: "DELETE", entity: "InscriptionFiliere", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

// ─── Conditions ──────────────────────────────────────────────────────────────

export async function createCondition(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createCondition", resource: "admissions", permission: "write",
    schema: conditionSchema, input,
    handler: async ({ session }, data) => {
      const d = data as typeof conditionSchema._type;
      await prisma.inscriptionCondition.create({
        data: { ...d, filiereId: d.filiereId || null, candidatProfile: d.candidatProfile || null },
      });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionCondition", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updateCondition(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateCondition", resource: "admissions", permission: "write",
    schema: conditionSchema.extend({ id: z.string().cuid() }), input,
    handler: async ({ session }, data) => {
      const { id, ...rest } = data as { id: string } & typeof conditionSchema._type;
      await prisma.inscriptionCondition.update({
        where: { id },
        data: { ...rest, filiereId: rest.filiereId || null, candidatProfile: rest.candidatProfile || null },
      });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionCondition", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function deleteCondition(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteCondition", resource: "admissions", permission: "write",
    schema: idSchema, input: { id },
    handler: async ({ session }) => {
      await prisma.inscriptionCondition.update({ where: { id }, data: { deletedAt: new Date() } });
      await createAuditLog({ userId: session.user.id, action: "DELETE", entity: "InscriptionCondition", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

export async function createPiece(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createPiece", resource: "admissions", permission: "write",
    schema: pieceSchema, input,
    handler: async ({ session }, data) => {
      const d = data as typeof pieceSchema._type;
      await prisma.inscriptionPiece.create({
        data: { ...d, filiereId: d.filiereId || null, candidatProfile: d.candidatProfile || null },
      });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionPiece", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updatePiece(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updatePiece", resource: "admissions", permission: "write",
    schema: pieceSchema.extend({ id: z.string().cuid() }), input,
    handler: async ({ session }, data) => {
      const { id, ...rest } = data as { id: string } & typeof pieceSchema._type;
      await prisma.inscriptionPiece.update({
        where: { id },
        data: { ...rest, filiereId: rest.filiereId || null, candidatProfile: rest.candidatProfile || null },
      });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionPiece", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function deletePiece(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deletePiece", resource: "admissions", permission: "write",
    schema: idSchema, input: { id },
    handler: async ({ session }) => {
      await prisma.inscriptionPiece.update({ where: { id }, data: { deletedAt: new Date() } });
      await createAuditLog({ userId: session.user.id, action: "DELETE", entity: "InscriptionPiece", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

// ─── Years ────────────────────────────────────────────────────────────────────

export async function createYear(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createYear", resource: "admissions", permission: "write",
    schema: yearSchema, input,
    handler: async ({ session }, data) => {
      const d = data as typeof yearSchema._type;
      await prisma.inscriptionYear.create({
        data: {
          year: d.year,
          isOpen: d.isOpen,
          openDate: d.openDate ? new Date(d.openDate) : null,
          closeDate: d.closeDate ? new Date(d.closeDate) : null,
        },
      });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionYear", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updateYear(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateYear", resource: "admissions", permission: "write",
    schema: yearSchema.extend({ id: z.string().cuid() }), input,
    handler: async ({ session }, data) => {
      const { id, ...d } = data as { id: string } & typeof yearSchema._type;
      await prisma.inscriptionYear.update({
        where: { id },
        data: {
          year: d.year,
          isOpen: d.isOpen,
          openDate: d.openDate ? new Date(d.openDate) : null,
          closeDate: d.closeDate ? new Date(d.closeDate) : null,
        },
      });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionYear", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

// ─── Application status ───────────────────────────────────────────────────────

export async function updateInscriptionStatus(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateInscriptionStatus", resource: "admissions", permission: "write",
    schema: inscriptionStatusUpdateSchema, input,
    handler: async ({ session }, data) => {
      const d = data as typeof inscriptionStatusUpdateSchema._type;
      const existing = await prisma.inscriptionApplication.findFirst({ where: { id: d.id, deletedAt: null } });
      if (!existing) return { success: false, error: "Dossier introuvable" };

      const updateData: Record<string, unknown> = { status: d.status, updatedAt: new Date() };
      if (d.status === "REJECTED") updateData.motifRefus = d.motifRefus || d.note || "";
      if (d.status === "ACCEPTED") {
        updateData.decisionDate = new Date();
        updateData.decisionAdminId = session.user.id;
      }
      if (d.note) updateData.adminNote = d.note;

      await prisma.inscriptionApplication.update({ where: { id: d.id }, data: updateData });
      await prisma.inscriptionStatusHistory.create({
        data: {
          applicationId: d.id,
          fromStatus: existing.status,
          toStatus: d.status,
          note: d.note || d.motifRefus,
          adminId: session.user.id,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "STATUS_CHANGE",
        entity: "InscriptionApplication",
        entityId: d.id,
        metadata: { from: existing.status, to: d.status },
      });

      // Notify candidate by email if they provided one
      if (existing.email) {
        const level = await prisma.inscriptionLevel.findUnique({ where: { id: existing.levelId }, select: { nameFr: true } });
        const filiere = await prisma.inscriptionFiliere.findUnique({ where: { id: existing.filiereId }, select: { nameFr: true } });
        const tpl = buildStatusChangeEmail({
          reference: existing.reference,
          nom: existing.nom,
          prenom: existing.prenom,
          status: d.status,
          note: d.note,
          motifRefus: d.status === "REJECTED" ? (d.motifRefus ?? d.note) : undefined,
          levelName: level?.nameFr,
          filiereName: filiere?.nameFr,
          applicationId: d.id,
        });
        if (tpl.html) {
          sendEmail({ ...tpl, to: existing.email, type: "INSCRIPTION_STATUS_CANDIDATE", applicationId: d.id }).catch(() => {});
        }
      }

      revalidateInscriptions();
      revalidatePath(`/admin/inscriptions/${d.id}`);
      return { success: true };
    },
  });
}

// ─── Niveaux scolaires ────────────────────────────────────────────────────────

export async function createNiveauScolaire(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "createNiveauScolaire", resource: "admissions", permission: "write",
    schema: niveauScolaireSchema, input,
    handler: async ({ session }, data) => {
      await prisma.inscriptionNiveauScolaire.create({ data: data as typeof niveauScolaireSchema._type });
      await createAuditLog({ userId: session.user.id, action: "CREATE", entity: "InscriptionNiveauScolaire", entityId: "new" });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function updateNiveauScolaire(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateNiveauScolaire", resource: "admissions", permission: "write",
    schema: niveauScolaireSchema.extend({ id: z.string().cuid() }), input,
    handler: async ({ session }, data) => {
      const { id, ...rest } = data as { id: string } & typeof niveauScolaireSchema._type;
      await prisma.inscriptionNiveauScolaire.update({ where: { id }, data: rest });
      await createAuditLog({ userId: session.user.id, action: "UPDATE", entity: "InscriptionNiveauScolaire", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}

export async function deleteNiveauScolaire(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteNiveauScolaire", resource: "admissions", permission: "write",
    schema: idSchema, input: { id },
    handler: async ({ session }) => {
      await prisma.inscriptionNiveauScolaire.update({ where: { id }, data: { deletedAt: new Date() } });
      await createAuditLog({ userId: session.user.id, action: "DELETE", entity: "InscriptionNiveauScolaire", entityId: id });
      revalidateInscriptions();
      return { success: true };
    },
  });
}
