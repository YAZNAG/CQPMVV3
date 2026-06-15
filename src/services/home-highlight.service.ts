import type { HomeHighlightIcon } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveNavHref } from "@/services/navigation.service";
import type { Locale } from "@/types";

export type HomeHighlightRecord = {
  id: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  backgroundColor: string;
  imageUrl: string | null;
  icon: HomeHighlightIcon;
  href: string | null;
  order: number;
  isPublished: boolean;
};

export type PublicHomeHighlight = {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  imageUrl: string | null;
  icon: HomeHighlightIcon;
  href: string | null;
};

export function toPublicHomeHighlights(
  items: HomeHighlightRecord[],
  locale: Locale
): PublicHomeHighlight[] {
  return items.map((item) => ({
    id: item.id,
    title: locale === "ar" ? item.titleAr : item.titleFr,
    subtitle: locale === "ar" ? item.subtitleAr : item.subtitleFr,
    backgroundColor: item.backgroundColor,
    imageUrl: item.imageUrl,
    icon: item.icon,
    href: item.href ? resolveNavHref(locale, item.href) : null,
  }));
}

export async function getPublishedHomeHighlights(): Promise<HomeHighlightRecord[]> {
  return prisma.homeHighlight.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
}

export async function listAdminHomeHighlights(): Promise<HomeHighlightRecord[]> {
  return prisma.homeHighlight.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
}
