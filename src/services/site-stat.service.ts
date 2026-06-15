import type { SiteStatIcon } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/types";

export type SiteStatRecord = {
  id: string;
  labelFr: string;
  labelAr: string;
  value: number;
  icon: SiteStatIcon;
  showPlus: boolean;
  order: number;
  isPublished: boolean;
};

export type PublicSiteStat = {
  id: string;
  label: string;
  value: number;
  icon: SiteStatIcon;
  showPlus: boolean;
};

export function toPublicSiteStats(items: SiteStatRecord[], locale: Locale): PublicSiteStat[] {
  return items.map((item) => ({
    id: item.id,
    label: locale === "ar" ? item.labelAr : item.labelFr,
    value: item.value,
    icon: item.icon,
    showPlus: item.showPlus,
  }));
}

export async function getPublishedSiteStats(): Promise<SiteStatRecord[]> {
  return prisma.siteStat.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function listAdminSiteStats(): Promise<SiteStatRecord[]> {
  return prisma.siteStat.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}
