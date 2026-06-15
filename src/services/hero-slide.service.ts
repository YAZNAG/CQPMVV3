import { prisma } from "@/lib/db";
import { resolveNavHref } from "@/services/navigation.service";
import type { HeroSlideButtonInput } from "@/lib/validations/hero-slide";
import type { Locale } from "@/types";

export type HeroSlideRecord = {
  id: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  imageUrl: string;
  buttons: HeroSlideButtonInput[];
  order: number;
  isPublished: boolean;
};

export type PublicHeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttons: Array<{
    label: string;
    href: string;
    variant: "primary" | "outline";
  }>;
};

function parseButtons(value: unknown): HeroSlideButtonInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is HeroSlideButtonInput => typeof item === "object" && item !== null)
    .map((item) => item as HeroSlideButtonInput)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function toRecord(row: {
  id: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  imageUrl: string;
  buttons: unknown;
  order: number;
  isPublished: boolean;
}): HeroSlideRecord {
  return {
    ...row,
    buttons: parseButtons(row.buttons),
  };
}

export function toPublicHeroSlides(
  slides: HeroSlideRecord[],
  locale: Locale
): PublicHeroSlide[] {
  return slides.map((slide) => ({
    id: slide.id,
    title: locale === "ar" ? slide.titleAr : slide.titleFr,
    subtitle: locale === "ar" ? slide.subtitleAr : slide.subtitleFr,
    imageUrl: slide.imageUrl,
    buttons: slide.buttons.map((button) => ({
      label: locale === "ar" ? button.labelAr : button.labelFr,
      href: resolveNavHref(locale, button.href),
      variant: button.variant,
    })),
  }));
}

export async function getPublishedHeroSlides(): Promise<HeroSlideRecord[]> {
  const rows = await prisma.heroSlide.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
  return rows.map(toRecord);
}

export async function listAdminHeroSlides(): Promise<HeroSlideRecord[]> {
  const rows = await prisma.heroSlide.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
  return rows.map(toRecord);
}
