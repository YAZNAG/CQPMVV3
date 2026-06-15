import { prisma } from "@/lib/db";
import { SITE_IMAGES } from "@/lib/site-images";
import { parseVideoSource } from "@/lib/video";
import { resolveNavHref } from "@/services/navigation.service";
import { getSiteSettings } from "@/services/site-settings.service";
import type { Locale } from "@/types";

export type HomeEngagementItemRecord = {
  id: string;
  keywordFr: string;
  keywordAr: string;
  descriptionFr: string;
  descriptionAr: string;
  order: number;
  isPublished: boolean;
};

export type HomeEventRecord = {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  eventDate: Date | null;
  imageUrl: string | null;
  href: string | null;
  order: number;
  isPublished: boolean;
};

export type PublicHomeEngagementItem = {
  id: string;
  keyword: string;
  description: string;
};

export type PublicHomeEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: Date | null;
  imageUrl: string | null;
  href: string | null;
};

export type PublicHomeEngagementSection = {
  eventsTitle: string;
  eventsEmptyMessage: string;
  engagementTitle: string;
  backgroundUrl: string;
  mediaUrl: string | null;
  mediaThumbnailUrl: string | null;
  video: ReturnType<typeof parseVideoSource>;
  contactBanner: {
    title: string;
    subtitle: string;
    phone: string;
    href: string;
    backgroundUrl: string | null;
  };
  engagementItems: PublicHomeEngagementItem[];
  events: PublicHomeEvent[];
};

const DEFAULT_SECTION = {
  homeEventsTitleFr: "Événements et Activités",
  homeEventsTitleAr: "الفعاليات والأنشطة",
  homeEventsEmptyFr: "Aucun événement ou activité pour le moment.",
  homeEventsEmptyAr: "لا توجد فعاليات أو أنشطة حالياً.",
  homeEngagementTitleFr: "Notre engagement en action",
  homeEngagementTitleAr: "التزامنا في الميدان",
  homeEngagementBackgroundUrl: SITE_IMAGES.formationFallback,
  homeContactBannerTitleFr: "Pour toutes vos questions et opinions",
  homeContactBannerTitleAr: "لجميع أسئلتكم وآرائكم",
  homeContactBannerSubtitleFr: "Contactez-nous",
  homeContactBannerSubtitleAr: "تواصلوا معنا",
  homeContactBannerPhone: "+212 536 32 00 00",
  homeContactBannerHref: "/contact",
} as const;

export async function listAdminHomeEngagementItems(): Promise<HomeEngagementItemRecord[]> {
  return prisma.homeEngagementItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { keywordFr: "asc" }],
  });
}

export async function listAdminHomeEvents(): Promise<HomeEventRecord[]> {
  return prisma.homeEvent.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { eventDate: "desc" }],
  });
}

export async function getPublishedHomeEngagementItems(): Promise<HomeEngagementItemRecord[]> {
  return prisma.homeEngagementItem.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { keywordFr: "asc" }],
  });
}

export async function getPublishedHomeEvents(): Promise<HomeEventRecord[]> {
  return prisma.homeEvent.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { eventDate: "desc" }],
  });
}

export async function buildPublicHomeEngagementSection(
  locale: Locale
): Promise<PublicHomeEngagementSection> {
  const [settings, engagementItems, events] = await Promise.all([
    getSiteSettings(),
    getPublishedHomeEngagementItems(),
    getPublishedHomeEvents(),
  ]);

  const isAr = locale === "ar";

  return {
    eventsTitle: isAr
      ? settings.homeEventsTitleAr ?? DEFAULT_SECTION.homeEventsTitleAr
      : settings.homeEventsTitleFr ?? DEFAULT_SECTION.homeEventsTitleFr,
    eventsEmptyMessage: isAr
      ? settings.homeEventsEmptyAr ?? DEFAULT_SECTION.homeEventsEmptyAr
      : settings.homeEventsEmptyFr ?? DEFAULT_SECTION.homeEventsEmptyFr,
    engagementTitle: isAr
      ? settings.homeEngagementTitleAr ?? DEFAULT_SECTION.homeEngagementTitleAr
      : settings.homeEngagementTitleFr ?? DEFAULT_SECTION.homeEngagementTitleFr,
    backgroundUrl:
      settings.homeEngagementBackgroundUrl ??
      DEFAULT_SECTION.homeEngagementBackgroundUrl,
    mediaUrl: settings.homeEngagementMediaUrl ?? null,
    mediaThumbnailUrl: settings.homeEngagementMediaThumbnailUrl ?? null,
    video: parseVideoSource(settings.homeEngagementMediaUrl),
    contactBanner: {
      title: isAr
        ? settings.homeContactBannerTitleAr ?? DEFAULT_SECTION.homeContactBannerTitleAr
        : settings.homeContactBannerTitleFr ?? DEFAULT_SECTION.homeContactBannerTitleFr,
      subtitle: isAr
        ? settings.homeContactBannerSubtitleAr ??
          DEFAULT_SECTION.homeContactBannerSubtitleAr
        : settings.homeContactBannerSubtitleFr ??
          DEFAULT_SECTION.homeContactBannerSubtitleFr,
      phone:
        settings.homeContactBannerPhone ??
        settings.phone ??
        DEFAULT_SECTION.homeContactBannerPhone,
      href: resolveNavHref(
        locale,
        settings.homeContactBannerHref ?? DEFAULT_SECTION.homeContactBannerHref
      ),
      backgroundUrl: settings.homeContactBannerBackgroundUrl ?? null,
    },
    engagementItems: engagementItems.map((item) => ({
      id: item.id,
      keyword: isAr ? item.keywordAr : item.keywordFr,
      description: isAr ? item.descriptionAr : item.descriptionFr,
    })),
    events: events.map((event) => ({
      id: event.id,
      title: isAr ? event.titleAr : event.titleFr,
      description: isAr ? event.descriptionAr : event.descriptionFr,
      eventDate: event.eventDate,
      imageUrl: event.imageUrl,
      href: event.href ? resolveNavHref(locale, event.href) : null,
    })),
  };
}
