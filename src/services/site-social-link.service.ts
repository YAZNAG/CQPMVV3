import type { SocialPlatform } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SiteSocialLinkRecord = {
  id: string;
  platform: SocialPlatform;
  labelFr: string | null;
  labelAr: string | null;
  url: string;
  order: number;
  isPublished: boolean;
};

export type PublicSocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  label: string | null;
};

export function toPublicSocialLinks(
  items: SiteSocialLinkRecord[],
  locale: "fr" | "ar"
): PublicSocialLink[] {
  return items.map((item) => ({
    id: item.id,
    platform: item.platform,
    url: item.url,
    label:
      locale === "ar"
        ? item.labelAr ?? item.labelFr
        : item.labelFr ?? item.labelAr,
  }));
}

export async function getPublishedSocialLinks(): Promise<SiteSocialLinkRecord[]> {
  return prisma.siteSocialLink.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { platform: "asc" }],
  });
}

export async function listAdminSocialLinks(): Promise<SiteSocialLinkRecord[]> {
  return prisma.siteSocialLink.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { platform: "asc" }],
  });
}
