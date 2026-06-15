import { prisma } from "@/lib/db";

type SoftDeleteModel =
  | "formationCategory"
  | "formation"
  | "newsCategory"
  | "newsArticle"
  | "galleryAlbum"
  | "galleryItem"
  | "testimonial"
  | "partner"
  | "navigationItem"
  | "heroSlide"
  | "homeHighlight"
  | "homeFormationShowcase"
  | "homeEngagementItem"
  | "homeEvent"
  | "downloadResource"
  | "orgChartNode"
  | "chiffresHighlight"
  | "chiffresGrowthBar"
  | "chiffresFormationItem"
  | "chiffresInfrastructureItem"
  | "user"
  | "application"
  | "contactMessage"
  | "contactFormField"
  | "admissionFormField"
  | "formationDocumentRequirement"
  | "siteStat"
  | "siteSocialLink"
  | "sitePage";

export async function archiveSlug(
  model: Extract<
    SoftDeleteModel,
    "formation" | "formationCategory" | "newsCategory" | "newsArticle" | "galleryAlbum" | "sitePage"
  >,
  id: string,
  slug: string
) {
  const archived = `${slug}__archived__${id}`;
  const now = new Date();

  switch (model) {
    case "formationCategory":
      await prisma.formationCategory.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
    case "formation":
      await prisma.formation.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
    case "newsCategory":
      await prisma.newsCategory.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
    case "newsArticle":
      await prisma.newsArticle.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
    case "galleryAlbum":
      await prisma.galleryAlbum.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
    case "sitePage":
      await prisma.sitePage.update({
        where: { id },
        data: { slug: archived, deletedAt: now },
      });
      break;
  }
}

export async function archiveUserEmail(id: string, email: string) {
  await prisma.user.update({
    where: { id },
    data: {
      email: `${email}__archived__${id}`,
      deletedAt: new Date(),
      isActive: false,
    },
  });
}

export async function softDeleteRecord(
  model: SoftDeleteModel,
  id: string,
  opts?: { slug?: string; email?: string }
) {
  const now = new Date();

  switch (model) {
    case "formationCategory":
    case "formation":
    case "newsCategory":
    case "newsArticle":
    case "galleryAlbum":
    case "sitePage":
      if (opts?.slug) {
        await archiveSlug(model, id, opts.slug);
        return;
      }
      break;
    case "user":
      if (opts?.email) {
        await archiveUserEmail(id, opts.email);
        return;
      }
      break;
    default:
      break;
  }

  const tables: Record<
    Exclude<
      SoftDeleteModel,
      | "formationCategory"
      | "formation"
      | "newsCategory"
      | "newsArticle"
      | "galleryAlbum"
      | "sitePage"
      | "user"
    >,
    () => Promise<unknown>
  > = {
    galleryItem: () => prisma.galleryItem.update({ where: { id }, data: { deletedAt: now } }),
    testimonial: () => prisma.testimonial.update({ where: { id }, data: { deletedAt: now } }),
    partner: () => prisma.partner.update({ where: { id }, data: { deletedAt: now } }),
    navigationItem: () =>
      prisma.navigationItem.update({ where: { id }, data: { deletedAt: now } }),
    heroSlide: () => prisma.heroSlide.update({ where: { id }, data: { deletedAt: now } }),
    homeHighlight: () =>
      prisma.homeHighlight.update({ where: { id }, data: { deletedAt: now } }),
    homeFormationShowcase: () =>
      prisma.homeFormationShowcase.update({ where: { id }, data: { deletedAt: now } }),
    homeEngagementItem: () =>
      prisma.homeEngagementItem.update({ where: { id }, data: { deletedAt: now } }),
    homeEvent: () => prisma.homeEvent.update({ where: { id }, data: { deletedAt: now } }),
    downloadResource: () =>
      prisma.downloadResource.update({ where: { id }, data: { deletedAt: now } }),
    orgChartNode: () =>
      prisma.orgChartNode.update({ where: { id }, data: { deletedAt: now } }),
    chiffresHighlight: () =>
      prisma.chiffresHighlight.update({ where: { id }, data: { deletedAt: now } }),
    chiffresGrowthBar: () =>
      prisma.chiffresGrowthBar.update({ where: { id }, data: { deletedAt: now } }),
    chiffresFormationItem: () =>
      prisma.chiffresFormationItem.update({ where: { id }, data: { deletedAt: now } }),
    chiffresInfrastructureItem: () =>
      prisma.chiffresInfrastructureItem.update({ where: { id }, data: { deletedAt: now } }),
    application: () => prisma.application.update({ where: { id }, data: { deletedAt: now } }),
    contactMessage: () => prisma.contactMessage.update({ where: { id }, data: { deletedAt: now } }),
    contactFormField: () =>
      prisma.contactFormField.update({ where: { id }, data: { deletedAt: now } }),
    admissionFormField: () =>
      prisma.admissionFormField.update({ where: { id }, data: { deletedAt: now } }),
    formationDocumentRequirement: () =>
      prisma.formationDocumentRequirement.update({ where: { id }, data: { deletedAt: now } }),
    siteStat: () => prisma.siteStat.update({ where: { id }, data: { deletedAt: now } }),
    siteSocialLink: () =>
      prisma.siteSocialLink.update({ where: { id }, data: { deletedAt: now } }),
  };

  if (model in tables) {
    await tables[model as keyof typeof tables]();
  }
}
