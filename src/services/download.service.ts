import type { DownloadActionType, DownloadResourceIcon } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/services/site-settings.service";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type DownloadResourceRecord = {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  infoLabelFr: string | null;
  infoLabelAr: string | null;
  excerptFr: string | null;
  excerptAr: string | null;
  contentFr: string;
  contentAr: string;
  icon: DownloadResourceIcon;
  actionType: DownloadActionType;
  fileUrl: string | null;
  order: number;
  isPublished: boolean;
  updatedAt: Date;
};

export type PublicDownloadResource = {
  id: string;
  slug: string;
  title: string;
  infoLabel: string | null;
  excerpt: string | null;
  content: string;
  icon: DownloadResourceIcon;
  actionType: DownloadActionType;
  fileUrl: string | null;
  updatedAt: Date;
};

export type PublicDownloadsSection = {
  title: string;
  subtitle: string;
  isPublished: boolean;
  items: PublicDownloadResource[];
};

const DEFAULT_SECTION = {
  downloadsSectionTitleFr: "Espace Téléchargement",
  downloadsSectionTitleAr: "فضاء التحميل",
  downloadsSectionSubtitleFr:
    "Accédez aux avis officiels, résultats des concours et documents d'inscription.",
  downloadsSectionSubtitleAr:
    "اطلعوا على الإعلانات الرسمية ونتائج المباريات ووثائق التسجيل.",
} as const;

export function downloadResourceHref(slug: string) {
  return `/telechargements/${slug}`;
}

function mapPublic(row: DownloadResourceRecord, locale: Locale): PublicDownloadResource {
  return {
    id: row.id,
    slug: row.slug,
    title: getLocalized(locale, row.titleFr, row.titleAr),
    infoLabel: getLocalized(locale, row.infoLabelFr ?? "", row.infoLabelAr ?? "") || null,
    excerpt: getLocalized(locale, row.excerptFr ?? "", row.excerptAr ?? "") || null,
    content: getLocalized(locale, row.contentFr, row.contentAr),
    icon: row.icon,
    actionType: row.actionType,
    fileUrl: row.fileUrl,
    updatedAt: row.updatedAt,
  };
}

export async function listAdminDownloadResources(): Promise<DownloadResourceRecord[]> {
  return prisma.downloadResource.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
}

export async function getPublishedDownloadResources(): Promise<DownloadResourceRecord[]> {
  return prisma.downloadResource.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
}

export async function getDownloadResourceBySlug(
  slug: string,
  locale: Locale
): Promise<PublicDownloadResource | null> {
  const row = await prisma.downloadResource.findFirst({
    where: { slug, deletedAt: null, isPublished: true },
  });
  if (!row) return null;
  return mapPublic(row, locale);
}

export async function getDownloadResourceBySlugForMetadata(slug: string, locale: Locale) {
  const row = await prisma.downloadResource.findFirst({
    where: { slug, deletedAt: null, isPublished: true },
  });
  if (!row) return null;
  return {
    title: getLocalized(locale, row.titleFr, row.titleAr),
    excerpt:
      getLocalized(locale, row.excerptFr ?? "", row.excerptAr ?? "") ||
      getLocalized(locale, row.infoLabelFr ?? "", row.infoLabelAr ?? "") ||
      null,
    updatedAt: row.updatedAt,
  };
}

export async function buildPublicDownloadsSection(locale: Locale): Promise<PublicDownloadsSection> {
  const [settings, items] = await Promise.all([
    getSiteSettings(),
    getPublishedDownloadResources(),
  ]);

  const isAr = locale === "ar";
  const sectionPublished = settings?.downloadsSectionPublished ?? true;

  return {
    title: isAr
      ? settings?.downloadsSectionTitleAr ?? DEFAULT_SECTION.downloadsSectionTitleAr
      : settings?.downloadsSectionTitleFr ?? DEFAULT_SECTION.downloadsSectionTitleFr,
    subtitle: isAr
      ? settings?.downloadsSectionSubtitleAr ?? DEFAULT_SECTION.downloadsSectionSubtitleAr
      : settings?.downloadsSectionSubtitleFr ?? DEFAULT_SECTION.downloadsSectionSubtitleFr,
    isPublished: sectionPublished,
    items: sectionPublished ? items.map((item) => mapPublic(item, locale)) : [],
  };
}

export async function getDownloadsSectionSettings() {
  const settings = await getSiteSettings();
  return {
    downloadsSectionTitleFr:
      settings?.downloadsSectionTitleFr ?? DEFAULT_SECTION.downloadsSectionTitleFr,
    downloadsSectionTitleAr:
      settings?.downloadsSectionTitleAr ?? DEFAULT_SECTION.downloadsSectionTitleAr,
    downloadsSectionSubtitleFr:
      settings?.downloadsSectionSubtitleFr ?? DEFAULT_SECTION.downloadsSectionSubtitleFr,
    downloadsSectionSubtitleAr:
      settings?.downloadsSectionSubtitleAr ?? DEFAULT_SECTION.downloadsSectionSubtitleAr,
    downloadsSectionPublished: settings?.downloadsSectionPublished ?? true,
  };
}
