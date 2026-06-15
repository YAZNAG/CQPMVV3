import { prisma } from "@/lib/db";

export type FormationCategoryAdmin = {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  order: number;
  isPublished: boolean;
  formationCount: number;
};

export async function listAdminFormationCategories(): Promise<FormationCategoryAdmin[]> {
  const rows = await prisma.formationCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { formations: { where: { deletedAt: null } } } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameFr: c.nameFr,
    nameAr: c.nameAr,
    descriptionFr: c.descriptionFr,
    descriptionAr: c.descriptionAr,
    order: c.order,
    isPublished: c.isPublished,
    formationCount: c._count.formations,
  }));
}

export async function getAdminFormationById(id: string) {
  return prisma.formation.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function ensureUniqueCategorySlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 0;
  while (true) {
    const existing = await prisma.formationCategory.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function ensureUniqueFormationSlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 0;
  while (true) {
    const existing = await prisma.formation.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
