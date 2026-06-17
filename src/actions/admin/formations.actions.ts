"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { runAdminAction } from "@/lib/api/action-handler";
import { archiveSlug } from "@/lib/db/soft-delete";
import { revalidatePublicLocales } from "@/lib/api/revalidate";
import {
  formationCategorySchema,
  formationSchema,
  idSchema,
} from "@/lib/validations/formation";
import {
  ensureUniqueCategorySlug,
  ensureUniqueFormationSlug,
} from "@/services/formation-admin.service";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { z } from "zod";

const categoryUpdateSchema = formationCategorySchema.extend({ id: z.string().cuid() });
const formationUpdateSchema = formationSchema.extend({ id: z.string().cuid() });

function revalidateFormations(slug?: string) {
  revalidatePath("/admin/formations");
  revalidatePublicLocales("/formations", slug);
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function createFormationCategory(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  return runAdminAction({
    name: "createFormationCategory",
    resource: "formations",
    permission: "write",
    schema: formationCategorySchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof formationCategorySchema>;
      const slug = await ensureUniqueCategorySlug(d.slug ?? slugify(d.nameFr));
      const category = await prisma.formationCategory.create({
        data: {
          slug,
          nameFr: d.nameFr,
          nameAr: d.nameAr,
          descriptionFr: d.descriptionFr ?? null,
          descriptionAr: d.descriptionAr ?? null,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "FormationCategory",
        entityId: category.id,
      });
      revalidateFormations();
      return { success: true, data: { id: category.id } };
    },
  });
}

export async function updateFormationCategory(
  input: unknown
): Promise<ActionResult> {
  return runAdminAction({
    name: "updateFormationCategory",
    resource: "formations",
    permission: "write",
    schema: categoryUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof categoryUpdateSchema>;
      const existing = await prisma.formationCategory.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Catégorie introuvable" };

      const slug = await ensureUniqueCategorySlug(
        d.slug ?? slugify(d.nameFr),
        d.id
      );
      await prisma.formationCategory.update({
        where: { id: d.id },
        data: {
          slug,
          nameFr: d.nameFr,
          nameAr: d.nameAr,
          descriptionFr: d.descriptionFr ?? null,
          descriptionAr: d.descriptionAr ?? null,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "FormationCategory",
        entityId: d.id,
      });
      revalidateFormations();
      return { success: true };
    },
  });
}

export async function deleteFormationCategory(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteFormationCategory",
    resource: "formations",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: categoryId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.formationCategory.findFirst({
        where: { id: categoryId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Catégorie introuvable" };

      const count = await prisma.formation.count({
        where: { categoryId, deletedAt: null },
      });
      if (count > 0) {
        return {
          success: false,
          error: "Supprimez ou déplacez les formations de cette catégorie d'abord.",
        };
      }

      await archiveSlug("formationCategory", categoryId, existing.slug);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "FormationCategory",
        entityId: categoryId,
      });
      revalidateFormations();
      return { success: true };
    },
  });
}

export async function createFormation(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAdminAction({
    name: "createFormation",
    resource: "formations",
    permission: "write",
    schema: formationSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof formationSchema>;
      const category = await prisma.formationCategory.findFirst({
        where: { id: d.categoryId, deletedAt: null },
      });
      if (!category) return { success: false, error: "Catégorie invalide" };

      const slug = await ensureUniqueFormationSlug(d.slug ?? slugify(d.titleFr));
      const formation = await prisma.formation.create({
        data: {
          slug,
          categoryId: d.categoryId,
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          descriptionFr: d.descriptionFr,
          descriptionAr: d.descriptionAr,
          objectivesFr: d.objectivesFr,
          objectivesAr: d.objectivesAr,
          durationFr: d.durationFr,
          durationAr: d.durationAr,
          requirementsFr: d.requirementsFr,
          requirementsAr: d.requirementsAr,
          imageUrl: d.imageUrl ?? null,
          order: d.order,
          isPublished: d.isPublished,
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "CREATE",
        entity: "Formation",
        entityId: formation.id,
      });
      revalidateFormations(formation.slug);
      return { success: true, data: { id: formation.id, slug: formation.slug } };
    },
  });
}

export async function updateFormation(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateFormation",
    resource: "formations",
    permission: "write",
    schema: formationUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof formationUpdateSchema>;
      const existing = await prisma.formation.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Formation introuvable" };

      const slug = await ensureUniqueFormationSlug(d.slug ?? slugify(d.titleFr), d.id);
      await prisma.formation.update({
        where: { id: d.id },
        data: {
          slug,
          categoryId: d.categoryId,
          titleFr: d.titleFr,
          titleAr: d.titleAr,
          descriptionFr: d.descriptionFr,
          descriptionAr: d.descriptionAr,
          objectivesFr: d.objectivesFr,
          objectivesAr: d.objectivesAr,
          durationFr: d.durationFr,
          durationAr: d.durationAr,
          requirementsFr: d.requirementsFr,
          requirementsAr: d.requirementsAr,
          imageUrl: d.imageUrl ?? null,
          order: d.order,
          isPublished: d.isPublished,
          ...( !d.isPublished ? { showOnHome: false } : {} ),
        },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Formation",
        entityId: d.id,
      });
      revalidateFormations(slug);
      return { success: true };
    },
  });
}

export async function deleteFormation(id: string): Promise<ActionResult> {
  return runAdminAction({
    name: "deleteFormation",
    resource: "formations",
    permission: "write",
    input: { id },
    schema: idSchema,
    handler: async ({ session }, data) => {
      const { id: formationId } = data as z.infer<typeof idSchema>;
      const existing = await prisma.formation.findFirst({
        where: { id: formationId, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Formation introuvable" };

      const apps = await prisma.application.count({
        where: { formationId, deletedAt: null },
      });
      if (apps > 0) {
        return {
          success: false,
          error: "Des candidatures sont liées à cette formation.",
        };
      }

      await archiveSlug("formation", formationId, existing.slug);
      await createAuditLog({
        userId: session.user.id,
        action: "DELETE",
        entity: "Formation",
        entityId: formationId,
      });
      revalidateFormations(existing.slug);
      return { success: true };
    },
  });
}

const requirementsUpdateSchema = z.object({
  id: z.string().cuid(),
  requirementsFr: z.string(),
  requirementsAr: z.string(),
});

export async function updateFormationRequirements(input: unknown): Promise<ActionResult> {
  return runAdminAction({
    name: "updateFormationRequirements",
    resource: "formations",
    permission: "write",
    schema: requirementsUpdateSchema,
    input,
    handler: async ({ session }, data) => {
      const d = data as z.infer<typeof requirementsUpdateSchema>;
      const existing = await prisma.formation.findFirst({
        where: { id: d.id, deletedAt: null },
      });
      if (!existing) return { success: false, error: "Formation introuvable" };
      await prisma.formation.update({
        where: { id: d.id },
        data: { requirementsFr: d.requirementsFr, requirementsAr: d.requirementsAr },
      });
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "Formation",
        entityId: d.id,
      });
      revalidateFormations(existing.slug);
      return { success: true };
    },
  });
}
