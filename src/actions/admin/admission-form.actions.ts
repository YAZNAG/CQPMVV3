"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { softDeleteRecord } from "@/lib/db/soft-delete";
import { idSchema } from "@/lib/validations/formation";
import {
  admissionFormFieldSchema,
  admissionFormFieldUpdateSchema,
  formationDocumentRequirementSchema,
  formationDocumentRequirementUpdateSchema,
} from "@/lib/validations/admission-form";
import {
  ensureUniqueAdmissionFieldKey,
  ensureUniqueFormationDocumentKey,
} from "@/services/admission-form.service";
import type { ActionResult } from "@/types";
import { z } from "zod";

function revalidateAdmission() {
  revalidatePath("/admin/admissions");
  revalidatePath("/fr/admission");
  revalidatePath("/ar/admission");
}

function normalizeOptional(value?: string | null) {
  const t = value?.trim();
  return t ? t : null;
}

export async function createAdmissionFormField(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createAdmissionFormField",
    resource: "admissions",
    permission: "write",
    schema: admissionFormFieldSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof admissionFormFieldSchema>;
      await ensureUniqueAdmissionFieldKey(d.key);
      const row = await prisma.admissionFormField.create({
        data: {
          key: d.key,
          type: d.type,
          labelFr: d.labelFr,
          labelAr: d.labelAr,
          placeholderFr: normalizeOptional(d.placeholderFr),
          placeholderAr: normalizeOptional(d.placeholderAr),
          helpTextFr: normalizeOptional(d.helpTextFr),
          helpTextAr: normalizeOptional(d.helpTextAr),
          options: d.options ?? undefined,
          defaultValue: normalizeOptional(d.defaultValue),
          isRequired: d.isRequired,
          width: d.width,
          order: d.order,
          isPublished: d.isPublished,
          buttonStyle: d.buttonStyle ?? null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "AdmissionFormField",
        entityId: row.id,
      });
      revalidateAdmission();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateAdmissionFormField(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateAdmissionFormField",
    resource: "admissions",
    permission: "write",
    schema: admissionFormFieldUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof admissionFormFieldUpdateSchema>;
      const existing = await prisma.admissionFormField.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Champ introuvable" };
      await ensureUniqueAdmissionFieldKey(d.key, d.id);
      const { id, ...rest } = d;
      await prisma.admissionFormField.update({
        where: { id },
        data: {
          key: rest.key,
          type: rest.type,
          labelFr: rest.labelFr,
          labelAr: rest.labelAr,
          placeholderFr: normalizeOptional(rest.placeholderFr),
          placeholderAr: normalizeOptional(rest.placeholderAr),
          helpTextFr: normalizeOptional(rest.helpTextFr),
          helpTextAr: normalizeOptional(rest.helpTextAr),
          options: rest.options ?? undefined,
          defaultValue: normalizeOptional(rest.defaultValue),
          isRequired: rest.isRequired,
          width: rest.width,
          order: rest.order,
          isPublished: rest.isPublished,
          buttonStyle: rest.buttonStyle ?? null,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "AdmissionFormField",
        entityId: id,
      });
      revalidateAdmission();
      return { success: true };
    },
  });
}

export async function deleteAdmissionFormField(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteAdmissionFormField",
    resource: "admissions",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      await softDeleteRecord("admissionFormField", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "AdmissionFormField",
        entityId: recordId,
      });
      revalidateAdmission();
      return { success: true };
    },
  });
}

export async function createFormationDocumentRequirement(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createFormationDocumentRequirement",
    resource: "admissions",
    permission: "write",
    schema: formationDocumentRequirementSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof formationDocumentRequirementSchema>;
      await ensureUniqueFormationDocumentKey(d.formationId, d.documentKey);
      const row = await prisma.formationDocumentRequirement.create({
        data: {
          formationId: d.formationId,
          documentKey: d.documentKey,
          labelFr: d.labelFr,
          labelAr: d.labelAr,
          hintFr: normalizeOptional(d.hintFr),
          hintAr: normalizeOptional(d.hintAr),
          acceptTypes: d.acceptTypes,
          maxSizeMb: d.maxSizeMb,
          order: d.order,
          isRequired: d.isRequired,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "FormationDocumentRequirement",
        entityId: row.id,
      });
      revalidateAdmission();
      return { success: true, data: { id: row.id } };
    },
  });
}

export async function updateFormationDocumentRequirement(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateFormationDocumentRequirement",
    resource: "admissions",
    permission: "write",
    schema: formationDocumentRequirementUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof formationDocumentRequirementUpdateSchema>;
      await ensureUniqueFormationDocumentKey(d.formationId, d.documentKey, d.id);
      const { id, ...rest } = d;
      await prisma.formationDocumentRequirement.update({
        where: { id },
        data: {
          formationId: rest.formationId,
          documentKey: rest.documentKey,
          labelFr: rest.labelFr,
          labelAr: rest.labelAr,
          hintFr: normalizeOptional(rest.hintFr),
          hintAr: normalizeOptional(rest.hintAr),
          acceptTypes: rest.acceptTypes,
          maxSizeMb: rest.maxSizeMb,
          order: rest.order,
          isRequired: rest.isRequired,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "FormationDocumentRequirement",
        entityId: id,
      });
      revalidateAdmission();
      return { success: true };
    },
  });
}

export async function deleteFormationDocumentRequirement(
  id: string
): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteFormationDocumentRequirement",
    resource: "admissions",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: recordId } = data as z.infer<typeof idSchema>;
      await softDeleteRecord("formationDocumentRequirement", recordId);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "FormationDocumentRequirement",
        entityId: recordId,
      });
      revalidateAdmission();
      return { success: true };
    },
  });
}
