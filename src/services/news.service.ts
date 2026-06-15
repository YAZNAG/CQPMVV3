import { prisma } from "@/lib/db";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

const publishedWhere = {
  isPublished: true,
  deletedAt: null,
} as const;

export async function getPublishedCategories(locale: Locale) {
  const categories = await prisma.newsCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: publishedWhere },
        },
      },
    },
  });

  return categories
    .filter((c) => c._count.articles > 0)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: getLocalized(locale, c.nameFr, c.nameAr),
      articleCount: c._count.articles,
    }));
}

export async function getFeaturedArticles(locale: Locale, limit = 3) {
  const articles = await prisma.newsArticle.findMany({
    where: { ...publishedWhere, isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: true },
  });
  return mapArticles(articles, locale);
}

/** Latest published articles for the home page (featured first, then by date). */
export async function getHomePageArticles(locale: Locale, limit = 3) {
  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where: publishedWhere,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      include: { category: true },
    }),
    prisma.newsArticle.count({ where: publishedWhere }),
  ]);

  return {
    articles: mapArticles(articles, locale),
    total,
    hasMore: total > limit,
  };
}

export async function getPublishedArticles({
  locale,
  page = 1,
  pageSize = 9,
  search,
  categorySlug,
  excludeFeatured = false,
}: {
  locale: Locale;
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  excludeFeatured?: boolean;
}) {
  const where = {
    ...publishedWhere,
    ...(excludeFeatured ? { isFeatured: false } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search, mode: "insensitive" as const } },
            { titleAr: { contains: search, mode: "insensitive" as const } },
            { excerptFr: { contains: search, mode: "insensitive" as const } },
            { excerptAr: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug, deletedAt: null } } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return {
    data: mapArticles(articles, locale),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function fetchPublishedArticleBySlug(slug: string) {
  return prisma.newsArticle.findFirst({
    where: { slug, ...publishedWhere },
    include: { category: true, author: true },
  });
}

/** For metadata generation — does not increment view count */
export async function getArticleBySlugForMetadata(slug: string, locale: Locale) {
  const article = await fetchPublishedArticleBySlug(slug);
  if (!article) return null;
  const [mapped] = mapArticles([article], locale);
  return {
    ...mapped,
    authorName: article.author?.name ?? null,
    updatedAt: article.updatedAt,
  };
}

export async function getArticleBySlug(slug: string, locale: Locale) {
  const article = await fetchPublishedArticleBySlug(slug);
  if (!article) return null;

  await prisma.newsArticle.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  const [mapped] = mapArticles([article], locale);
  return {
    ...mapped,
    authorName: article.author?.name ?? null,
    views: article.views + 1,
  };
}

export async function getRelatedArticles(slug: string, locale: Locale, limit = 3) {
  const current = await fetchPublishedArticleBySlug(slug);
  if (!current) return [];

  const articles = await prisma.newsArticle.findMany({
    where: {
      ...publishedWhere,
      slug: { not: slug },
      ...(current.categoryId ? { categoryId: current.categoryId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { category: true },
  });

  if (articles.length < limit) {
    const extra = await prisma.newsArticle.findMany({
      where: {
        ...publishedWhere,
        slug: { notIn: [slug, ...articles.map((a) => a.slug)] },
      },
      orderBy: { publishedAt: "desc" },
      take: limit - articles.length,
      include: { category: true },
    });
    articles.push(...extra);
  }

  return mapArticles(articles, locale);
}

type ArticleWithCategory = Awaited<
  ReturnType<
    typeof prisma.newsArticle.findMany<{
      include: { category: true };
    }>
  >
>[number];

function mapArticles(articles: ArticleWithCategory[], locale: Locale) {
  return articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: getLocalized(locale, a.titleFr, a.titleAr),
    excerpt: getLocalized(locale, a.excerptFr, a.excerptAr),
    content: getLocalized(locale, a.contentFr, a.contentAr),
    coverImageUrl: a.coverImageUrl,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    category: a.category
      ? getLocalized(locale, a.category.nameFr, a.category.nameAr)
      : null,
    categorySlug: a.category?.slug ?? null,
    isFeatured: a.isFeatured,
  }));
}
