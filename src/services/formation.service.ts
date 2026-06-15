import { prisma } from "@/lib/db";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export async function getPublishedFormations(locale: Locale) {
  const categories = await prisma.formationCategory.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      formations: {
        where: { isPublished: true, deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: getLocalized(locale, cat.nameFr, cat.nameAr),
    description: getLocalized(locale, cat.descriptionFr ?? "", cat.descriptionAr ?? ""),
    formations: cat.formations.map((f) => ({
      id: f.id,
      slug: f.slug,
      title: getLocalized(locale, f.titleFr, f.titleAr),
      description: getLocalized(locale, f.descriptionFr, f.descriptionAr),
      duration: getLocalized(locale, f.durationFr, f.durationAr),
      requirements: getLocalized(locale, f.requirementsFr, f.requirementsAr),
      imageUrl: f.imageUrl,
    })),
  }));
}

export async function getFormationBySlug(slug: string, locale: Locale) {
  const formation = await prisma.formation.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: { category: true },
  });
  if (!formation) return null;
  return {
    ...formation,
    title: getLocalized(locale, formation.titleFr, formation.titleAr),
    description: getLocalized(locale, formation.descriptionFr, formation.descriptionAr),
    objectives: getLocalized(locale, formation.objectivesFr, formation.objectivesAr),
    duration: getLocalized(locale, formation.durationFr, formation.durationAr),
    requirements: getLocalized(locale, formation.requirementsFr, formation.requirementsAr),
    categoryName: getLocalized(locale, formation.category.nameFr, formation.category.nameAr),
    categorySlug: formation.category.slug,
  };
}
