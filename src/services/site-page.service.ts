import { prisma } from "@/lib/db";
import { getLocalized } from "@/types";
import type { Locale } from "@/types";

export type SitePageRecord = {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  excerptFr: string | null;
  excerptAr: string | null;
  contentFr: string;
  contentAr: string;
  coverImageUrl: string | null;
  isPublished: boolean;
  order: number;
  updatedAt: Date;
};

export type PublicSitePage = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  updatedAt: Date;
};

export type SitePageNavOption = {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  href: string;
};

export function sitePageHref(slug: string) {
  return `/pages/${slug}`;
}

export async function listAdminSitePages(): Promise<SitePageRecord[]> {
  return prisma.sitePage.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
}

export async function listPublishedSitePagesForNav(): Promise<SitePageNavOption[]> {
  const rows = await prisma.sitePage.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
    select: { id: true, slug: true, titleFr: true, titleAr: true },
  });

  return rows.map((row) => ({
    ...row,
    href: sitePageHref(row.slug),
  }));
}

export async function getSitePageBySlug(
  slug: string,
  locale: Locale
): Promise<PublicSitePage | null> {
  const row = await prisma.sitePage.findFirst({
    where: { slug, deletedAt: null, isPublished: true },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: getLocalized(locale, row.titleFr, row.titleAr),
    excerpt: getLocalized(locale, row.excerptFr ?? "", row.excerptAr ?? "") || null,
    content: getLocalized(locale, row.contentFr, row.contentAr),
    coverImageUrl: row.coverImageUrl,
    updatedAt: row.updatedAt,
  };
}

export async function getSitePageBySlugForMetadata(slug: string, locale: Locale) {
  return getSitePageBySlug(slug, locale);
}

export async function getAdminSitePageById(id: string): Promise<SitePageRecord | null> {
  return prisma.sitePage.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function ensureUniqueSitePageSlug(slug: string, excludeId?: string) {
  const existing = await prisma.sitePage.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (!existing) return slug;

  let suffix = 2;
  while (suffix < 100) {
    const candidate = `${slug}-${suffix}`;
    const clash = await prisma.sitePage.findFirst({
      where: {
        slug: candidate,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
    suffix += 1;
  }

  return `${slug}-${Date.now()}`;
}
