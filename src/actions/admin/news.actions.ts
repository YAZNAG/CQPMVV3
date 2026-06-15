"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { parseInput } from "@/lib/api/parse-input";
import { newsArticleSchema, newsCategorySchema } from "@/lib/validations/news";
import {
  ensureUniqueArticleSlug,
  ensureUniqueCategorySlug,
} from "@/services/news-admin.service";
import type { ActionResult } from "@/types";

function resolveSlug(slug: unknown, fallback: string): string {
  return typeof slug === "string" && slug.length > 0 ? slug : slugify(fallback);
}

function resolveCategoryId(categoryId: unknown): string | null {
  return typeof categoryId === "string" && categoryId.length > 0 ? categoryId : null;
}

function revalidateNewsPaths(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/admin/news/categories");
  revalidatePath("/fr/news");
  revalidatePath("/ar/news");
  if (slug) {
    revalidatePath(`/fr/news/${slug}`);
    revalidatePath(`/ar/news/${slug}`);
  }
}

// --- Categories ---

export async function createNewsCategory(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await assertPermission("news", "write");
  const parsed = parseInput(newsCategorySchema, input);
  if (!parsed.ok) return parsed.result;

  const baseSlug = resolveSlug(parsed.data.slug, parsed.data.nameFr);
  const slug = await ensureUniqueCategorySlug(baseSlug);

  const category = await prisma.newsCategory.create({
    data: {
      slug,
      nameFr: parsed.data.nameFr,
      nameAr: parsed.data.nameAr,
      order: parsed.data.order,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "NewsCategory",
    entityId: category.id,
  });

  revalidateNewsPaths();
  return { success: true, data: { id: category.id } };
}

export async function updateNewsCategory(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await assertPermission("news", "write");
  const parsed = parseInput(newsCategorySchema, input);
  if (!parsed.ok) return parsed.result;

  const existing = await prisma.newsCategory.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { success: false, error: "Catégorie introuvable" };

  const baseSlug = resolveSlug(parsed.data.slug, parsed.data.nameFr);
  const slug =
    baseSlug === existing.slug
      ? existing.slug
      : await ensureUniqueCategorySlug(baseSlug, id);

  await prisma.newsCategory.update({
    where: { id },
    data: {
      slug,
      nameFr: parsed.data.nameFr,
      nameAr: parsed.data.nameAr,
      order: parsed.data.order,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "NewsCategory",
    entityId: id,
  });

  revalidateNewsPaths();
  return { success: true };
}

export async function deleteNewsCategory(id: string): Promise<ActionResult> {
  const session = await assertPermission("news", "write");

  const count = await prisma.newsArticle.count({
    where: { categoryId: id, deletedAt: null },
  });
  if (count > 0) {
    return {
      success: false,
      error: "Impossible de supprimer : des articles utilisent cette catégorie.",
    };
  }

  await prisma.newsCategory.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entity: "NewsCategory",
    entityId: id,
  });

  revalidateNewsPaths();
  return { success: true };
}

// --- Articles ---

export async function createNewsArticle(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await assertPermission("news", "write");
  const parsed = parseInput(newsArticleSchema, input);
  if (!parsed.ok) return parsed.result;

  const data = parsed.data;
  const baseSlug = resolveSlug(data.slug, data.titleFr);
  const slug = await ensureUniqueArticleSlug(baseSlug);

  const publishedAt =
    data.isPublished && !data.publishedAt ? new Date() : data.publishedAt ?? null;

  const article = await prisma.newsArticle.create({
    data: {
      slug,
      categoryId: resolveCategoryId(data.categoryId),
      authorId: session.user.id,
      titleFr: data.titleFr,
      titleAr: data.titleAr,
      excerptFr: data.excerptFr,
      excerptAr: data.excerptAr,
      contentFr: data.contentFr,
      contentAr: data.contentAr,
      coverImageUrl: data.coverImageUrl ?? null,
      isFeatured: data.isFeatured,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? publishedAt : null,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "NewsArticle",
    entityId: article.id,
    metadata: { slug: article.slug },
  });

  revalidateNewsPaths(article.slug);
  return { success: true, data: { id: article.id, slug: article.slug } };
}

export async function updateNewsArticle(
  id: string,
  input: unknown
): Promise<ActionResult<{ slug: string }>> {
  const session = await assertPermission("news", "write");
  const parsed = parseInput(newsArticleSchema, input);
  if (!parsed.ok) return parsed.result;

  const existing = await prisma.newsArticle.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { success: false, error: "Article introuvable" };

  const data = parsed.data;
  const baseSlug = resolveSlug(data.slug, data.titleFr);
  const slug =
    baseSlug === existing.slug
      ? existing.slug
      : await ensureUniqueArticleSlug(baseSlug, id);

  let publishedAt = data.publishedAt ?? existing.publishedAt;
  if (data.isPublished && !publishedAt) publishedAt = new Date();
  if (!data.isPublished) publishedAt = null;

  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      slug,
      categoryId: resolveCategoryId(data.categoryId),
      titleFr: data.titleFr,
      titleAr: data.titleAr,
      excerptFr: data.excerptFr,
      excerptAr: data.excerptAr,
      contentFr: data.contentFr,
      contentAr: data.contentAr,
      coverImageUrl: data.coverImageUrl ?? null,
      isFeatured: data.isFeatured,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "NewsArticle",
    entityId: id,
    metadata: { slug: article.slug },
  });

  revalidateNewsPaths(article.slug);
  if (existing.slug !== article.slug) revalidateNewsPaths(existing.slug);
  return { success: true, data: { slug: article.slug } };
}

export async function deleteNewsArticle(id: string): Promise<ActionResult> {
  const session = await assertPermission("news", "write");

  const existing = await prisma.newsArticle.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { success: false, error: "Article introuvable" };

  await prisma.newsArticle.update({
    where: { id },
    data: { deletedAt: new Date(), isPublished: false, isFeatured: false },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entity: "NewsArticle",
    entityId: id,
  });

  revalidateNewsPaths(existing.slug);
  return { success: true };
}

export async function toggleArticleFeatured(
  id: string,
  isFeatured: boolean
): Promise<ActionResult> {
  const session = await assertPermission("news", "write");

  await prisma.newsArticle.update({
    where: { id, deletedAt: null },
    data: { isFeatured },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "NewsArticle",
    entityId: id,
    metadata: { isFeatured },
  });

  revalidateNewsPaths();
  return { success: true };
}
