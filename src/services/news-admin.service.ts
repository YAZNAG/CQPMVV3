import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const active = { deletedAt: null } as const;

export async function listAdminCategories() {
  return prisma.newsCategory.findMany({
    where: active,
    orderBy: { order: "asc" },
    include: {
      _count: { select: { articles: { where: active } } },
    },
  });
}

export async function getAdminCategoryById(id: string) {
  return prisma.newsCategory.findFirst({
    where: { id, ...active },
  });
}

export async function listAdminArticles({
  page = 1,
  pageSize = 15,
  search,
  categoryId,
  status,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  status?: "all" | "published" | "draft" | "featured";
}) {
  const where: Prisma.NewsArticleWhereInput = {
    ...active,
    ...(categoryId ? { categoryId } : {}),
    ...(status === "published" ? { isPublished: true } : {}),
    ...(status === "draft" ? { isPublished: false } : {}),
    ...(status === "featured" ? { isFeatured: true } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        author: { select: { name: true, email: true } },
      },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminArticleById(id: string) {
  return prisma.newsArticle.findFirst({
    where: { id, ...active },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function ensureUniqueCategorySlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let n = 1;
  while (true) {
    const existing = await prisma.newsCategory.findFirst({
      where: {
        slug: candidate,
        ...active,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

export async function ensureUniqueArticleSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let n = 1;
  while (true) {
    const existing = await prisma.newsArticle.findFirst({
      where: {
        slug: candidate,
        ...active,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

export async function getNewsStats() {
  const [total, published, draft, featured, categories] = await Promise.all([
    prisma.newsArticle.count({ where: active }),
    prisma.newsArticle.count({ where: { ...active, isPublished: true } }),
    prisma.newsArticle.count({ where: { ...active, isPublished: false } }),
    prisma.newsArticle.count({ where: { ...active, isFeatured: true, isPublished: true } }),
    prisma.newsCategory.count({ where: active }),
  ]);
  return { total, published, draft, featured, categories };
}
