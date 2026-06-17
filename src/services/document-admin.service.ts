import { prisma } from "@/lib/db";

export type DocumentCategoryAdminRow = {
  id: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  isActive: boolean;
  sortOrder: number;
  documentCount: number;
};

export type DocumentAdminRow = {
  id: string;
  titleFr: string;
  titleAr: string | null;
  descriptionFr: string | null;
  descriptionAr: string | null;
  categoryId: string | null;
  categoryNameFr: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  downloadCount: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function listAdminDocumentCategories(): Promise<DocumentCategoryAdminRow[]> {
  const cats = await prisma.documentCategory.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { documents: { where: { deletedAt: null } } } } },
  });
  return cats.map((c) => ({
    id: c.id,
    nameFr: c.nameFr,
    nameAr: c.nameAr,
    slug: c.slug,
    descriptionFr: c.descriptionFr,
    descriptionAr: c.descriptionAr,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    documentCount: c._count.documents,
  }));
}

export async function listAdminDocuments(opts?: {
  search?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: DocumentAdminRow[]; total: number }> {
  const { search, categoryId, status, page = 1, pageSize = 20 } = opts ?? {};
  const where = {
    deletedAt: null as null,
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search, mode: "insensitive" as const } },
            { titleAr: { contains: search, mode: "insensitive" as const } },
            { fileName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { nameFr: true } } },
    }),
    prisma.document.count({ where }),
  ]);

  return {
    rows: rows.map((d) => ({
      id: d.id,
      titleFr: d.titleFr,
      titleAr: d.titleAr,
      descriptionFr: d.descriptionFr,
      descriptionAr: d.descriptionAr,
      categoryId: d.categoryId,
      categoryNameFr: d.category?.nameFr ?? null,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      publishedAt: d.publishedAt,
      downloadCount: d.downloadCount,
      sortOrder: d.sortOrder,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
    total,
  };
}

export async function getAdminDocumentById(id: string): Promise<DocumentAdminRow | null> {
  const d = await prisma.document.findFirst({
    where: { id, deletedAt: null },
    include: { category: { select: { nameFr: true } } },
  });
  if (!d) return null;
  return {
    id: d.id,
    titleFr: d.titleFr,
    titleAr: d.titleAr,
    descriptionFr: d.descriptionFr,
    descriptionAr: d.descriptionAr,
    categoryId: d.categoryId,
    categoryNameFr: d.category?.nameFr ?? null,
    fileUrl: d.fileUrl,
    fileName: d.fileName,
    fileType: d.fileType,
    fileSize: d.fileSize,
    status: d.status,
    publishedAt: d.publishedAt,
    downloadCount: d.downloadCount,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function getAdminDocumentStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  totalDownloads: number;
}> {
  const [total, published, draft, agg] = await Promise.all([
    prisma.document.count({ where: { deletedAt: null } }),
    prisma.document.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.document.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.document.aggregate({ where: { deletedAt: null }, _sum: { downloadCount: true } }),
  ]);
  return { total, published, draft, totalDownloads: agg._sum.downloadCount ?? 0 };
}
