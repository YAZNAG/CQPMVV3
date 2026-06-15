import { prisma } from "@/lib/db";
import {
  isSiteSectionPublished,
  type SiteSectionKey,
} from "@/lib/site-section-publish";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "default" } });
  }
  return settings;
}

export async function getSiteSectionPublishedFlag(key: SiteSectionKey) {
  const settings = await getSiteSettings();
  return isSiteSectionPublished(settings, key);
}
