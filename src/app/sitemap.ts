import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { locales } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

const STATIC_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/formations", changeFrequency: "weekly", priority: 0.9 },
  { path: "/admission", changeFrequency: "monthly", priority: 0.85 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gallery/photos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gallery/videos", changeFrequency: "weekly", priority: 0.75 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.75 },
  { path: "/contact/reclamation", changeFrequency: "yearly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  let formations: { slug: string; updatedAt: Date }[] = [];
  let articles: { slug: string; updatedAt: Date; publishedAt: Date | null }[] = [];
  let albums: { slug: string; updatedAt: Date }[] = [];

  try {
    [formations, articles, albums] = await Promise.all([
      prisma.formation.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.newsArticle.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.galleryAlbum.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable at build time
  }

  for (const locale of locales) {
    for (const { path, changeFrequency, priority } of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
          ),
        },
      });
    }

    for (const f of formations) {
      entries.push({
        url: `${SITE_URL}/${locale}/formations/${f.slug}`,
        lastModified: f.updatedAt,
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/formations/${f.slug}`])
          ),
        },
      });
    }

    for (const a of articles) {
      entries.push({
        url: `${SITE_URL}/${locale}/news/${a.slug}`,
        lastModified: a.publishedAt ?? a.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/news/${a.slug}`])
          ),
        },
      });
    }

    for (const album of albums) {
      entries.push({
        url: `${SITE_URL}/${locale}/gallery/${album.slug}`,
        lastModified: album.updatedAt,
        changeFrequency: "monthly",
        priority: 0.65,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/gallery/${album.slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
