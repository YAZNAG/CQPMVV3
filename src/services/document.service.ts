import { prisma } from "@/lib/db";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type PublicDocumentCategory = {
  id: string;
  slug: string;
  name: string;
};

export type PublicDocument = {
  id: string;
  titleFr: string;
  titleAr: string | null;
  title: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  publishedAt: Date | null;
};

function toPublicDocument(
  doc: {
    id: string;
    titleFr: string;
    titleAr: string | null;
    descriptionFr: string | null;
    descriptionAr: string | null;
    categoryId: string | null;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    downloadCount: number;
    publishedAt: Date | null;
    category: { nameFr: string; nameAr: string; slug: string } | null;
  },
  locale: Locale
): PublicDocument {
  return {
    id: doc.id,
    titleFr: doc.titleFr,
    titleAr: doc.titleAr,
    title: getLocalized(locale, doc.titleFr, doc.titleAr || doc.titleFr),
    descriptionFr: doc.descriptionFr,
    descriptionAr: doc.descriptionAr,
    description: getLocalized(
      locale,
      doc.descriptionFr || "",
      doc.descriptionAr || doc.descriptionFr || ""
    ) || null,
    categoryId: doc.categoryId,
    categoryName: doc.category
      ? getLocalized(locale, doc.category.nameFr, doc.category.nameAr)
      : null,
    categorySlug: doc.category?.slug ?? null,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    downloadCount: doc.downloadCount,
    publishedAt: doc.publishedAt,
  };
}

const documentSelect = {
  id: true,
  titleFr: true,
  titleAr: true,
  descriptionFr: true,
  descriptionAr: true,
  categoryId: true,
  fileUrl: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  downloadCount: true,
  publishedAt: true,
  category: {
    select: { nameFr: true, nameAr: true, slug: true },
  },
} as const;

export async function getLatestPublishedDocuments(
  locale: Locale,
  limit = 4
): Promise<PublicDocument[]> {
  const docs = await prisma.document.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: documentSelect,
  });
  return docs.map((d) => toPublicDocument(d, locale));
}

export async function getAllPublishedDocuments(locale: Locale): Promise<PublicDocument[]> {
  const docs = await prisma.document.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: documentSelect,
  });
  return docs.map((d) => toPublicDocument(d, locale));
}

export async function getPublishedDocumentCategories(
  locale: Locale
): Promise<PublicDocumentCategory[]> {
  const cats = await prisma.documentCategory.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, nameFr: true, nameAr: true },
  });
  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: getLocalized(locale, c.nameFr, c.nameAr),
  }));
}

export async function incrementDocumentDownloadCount(id: string): Promise<void> {
  await prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
}
