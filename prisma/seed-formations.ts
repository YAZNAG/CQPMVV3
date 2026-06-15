import { PrismaClient } from "@prisma/client";
import { FORMATION_IMAGES_BY_SLUG, SITE_IMAGES } from "../src/lib/site-images";
import {
  ALLOWED_FORMATION_SLUGS,
  FORMATION_CATEGORIES,
  FORMATIONS,
  REMOVED_FORMATION_SLUGS,
} from "../src/lib/formation-default-content";

type UpsertFormationCategory = (data: {
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  order: number;
}) => Promise<{ id: string }>;

type UpsertFormation = (
  slug: string,
  data: Record<string, unknown>
) => Promise<unknown>;

export async function seedFormationCategoriesAndFormations(
  prisma: PrismaClient,
  upsertFormationCategory: UpsertFormationCategory,
  upsertFormation: UpsertFormation
) {
  console.log("→ Formation categories & sample formations");

  await prisma.formation.updateMany({
    where: { slug: { in: [...REMOVED_FORMATION_SLUGS] } },
    data: { isPublished: false, showOnHome: false, deletedAt: new Date() },
  });
  await prisma.formation.updateMany({
    where: {
      deletedAt: null,
      slug: { notIn: [...ALLOWED_FORMATION_SLUGS] },
    },
    data: { isPublished: false, showOnHome: false, deletedAt: new Date() },
  });
  await prisma.formationCategory.updateMany({
    where: { slug: "formation-continue" },
    data: { isPublished: false, deletedAt: new Date() },
  });
  await prisma.formation.updateMany({
    where: { deletedAt: null },
    data: { showOnHome: false },
  });

  const categoryOrder = ["qualification", "specialisation"] as const;

  for (const [catIndex, slug] of categoryOrder.entries()) {
    const cat = FORMATION_CATEGORIES[slug];
    const category = await upsertFormationCategory({
      slug: cat.slug,
      nameFr: cat.nameFr,
      nameAr: cat.nameAr,
      descriptionFr: cat.descriptionFr,
      descriptionAr: cat.descriptionAr,
      order: catIndex,
    });

    console.log(`  ✓ Category: ${cat.nameFr}`);

    const formations = FORMATIONS.filter((f) => f.category === slug);
    for (const formation of formations) {
      await upsertFormation(formation.slug, {
        categoryId: category.id,
        titleFr: formation.titleFr,
        titleAr: formation.titleAr,
        descriptionFr: formation.descriptionFr,
        descriptionAr: formation.descriptionAr,
        objectivesFr: formation.objectivesFr,
        objectivesAr: formation.objectivesAr,
        durationFr: formation.durationFr,
        durationAr: formation.durationAr,
        requirementsFr: formation.requirementsFr,
        requirementsAr: formation.requirementsAr,
        order: formation.order,
        isPublished: true,
        showOnHome: true,
        homeOrder: formation.order + catIndex * 2,
        imageUrl:
          FORMATION_IMAGES_BY_SLUG[formation.slug] ??
          SITE_IMAGES.formationFallback,
      });
      console.log(`    ✓ Formation: ${formation.titleFr}`);
    }
  }
}
