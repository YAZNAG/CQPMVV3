import type { HomeHighlightIcon } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveNavHref } from "@/services/navigation.service";
import type { Locale } from "@/types";

export type HomeFormationShowcaseRecord = {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  badgeFr: string | null;
  badgeAr: string | null;
  durationFr: string | null;
  durationAr: string | null;
  imageUrl: string | null;
  icon: HomeHighlightIcon;
  href: string | null;
  order: number;
  isPublished: boolean;
};

export type AdminHomeFormationItem = {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  durationFr: string;
  categoryNameFr: string;
  categoryNameAr: string;
  isPublished: boolean;
  showOnHome: boolean;
  homeOrder: number;
  isVisibleOnHome: boolean;
};

export type PublicHomeFormationShowcase = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  duration: string | null;
  imageUrl: string | null;
  icon: HomeHighlightIcon;
  href: string | null;
};

export type PublicHomeFormationsSection = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  items: PublicHomeFormationShowcase[];
};

const CATEGORY_ICONS: Record<string, HomeHighlightIcon> = {
  qualification: "ANCHOR",
  specialisation: "SHIP",
  "formation-continue": "AWARD",
};

function iconForCategory(categorySlug: string): HomeHighlightIcon {
  return CATEGORY_ICONS[categorySlug] ?? "AWARD";
}

function isFormationVisibleOnHome(
  formation: { isPublished: boolean; showOnHome: boolean },
  category: { isPublished: boolean }
): boolean {
  return formation.showOnHome && formation.isPublished && category.isPublished;
}

function formationToShowcaseRecord(
  formation: {
    id: string;
    slug: string;
    titleFr: string;
    titleAr: string;
    descriptionFr: string;
    descriptionAr: string;
    durationFr: string;
    durationAr: string;
    imageUrl: string | null;
    homeOrder: number;
    isPublished: boolean;
    category: { slug: string; nameFr: string; nameAr: string; isPublished: boolean };
  }
): HomeFormationShowcaseRecord {
  return {
    id: formation.id,
    titleFr: formation.titleFr,
    titleAr: formation.titleAr,
    descriptionFr: formation.descriptionFr,
    descriptionAr: formation.descriptionAr,
    badgeFr: formation.category.nameFr,
    badgeAr: formation.category.nameAr,
    durationFr: formation.durationFr,
    durationAr: formation.durationAr,
    imageUrl: formation.imageUrl,
    icon: iconForCategory(formation.category.slug),
    href: `/formations/${formation.slug}`,
    order: formation.homeOrder,
    isPublished: formation.isPublished,
  };
}

export function toPublicHomeFormationShowcases(
  items: HomeFormationShowcaseRecord[],
  locale: Locale
): PublicHomeFormationShowcase[] {
  return items.map((item) => ({
    id: item.id,
    title: locale === "ar" ? item.titleAr : item.titleFr,
    description: locale === "ar" ? item.descriptionAr : item.descriptionFr,
    badge: locale === "ar" ? item.badgeAr : item.badgeFr,
    duration: locale === "ar" ? item.durationAr : item.durationFr,
    imageUrl: item.imageUrl,
    icon: item.icon,
    href: item.href ? resolveNavHref(locale, item.href) : null,
  }));
}

export async function getPublishedHomeFormationShowcases(): Promise<
  HomeFormationShowcaseRecord[]
> {
  const formations = await prisma.formation.findMany({
    where: {
      deletedAt: null,
      showOnHome: true,
      isPublished: true,
      category: { deletedAt: null, isPublished: true },
    },
    orderBy: [{ homeOrder: "asc" }, { order: "asc" }, { titleFr: "asc" }],
    include: {
      category: {
        select: { slug: true, nameFr: true, nameAr: true, isPublished: true },
      },
    },
  });

  return formations.map(formationToShowcaseRecord);
}

export async function listAdminHomeFormations(): Promise<AdminHomeFormationItem[]> {
  const categories = await prisma.formationCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      formations: {
        where: { deletedAt: null },
        orderBy: [{ homeOrder: "asc" }, { order: "asc" }, { titleFr: "asc" }],
      },
    },
  });

  return categories.flatMap((category) =>
    category.formations.map((formation) => ({
      id: formation.id,
      slug: formation.slug,
      titleFr: formation.titleFr,
      titleAr: formation.titleAr,
      durationFr: formation.durationFr,
      categoryNameFr: category.nameFr,
      categoryNameAr: category.nameAr,
      isPublished: formation.isPublished,
      showOnHome: formation.showOnHome,
      homeOrder: formation.homeOrder,
      isVisibleOnHome: isFormationVisibleOnHome(formation, category),
    }))
  );
}

export async function getNextFormationHomeOrder(): Promise<number> {
  const max = await prisma.formation.aggregate({
    where: { deletedAt: null, showOnHome: true },
    _max: { homeOrder: true },
  });
  return (max._max.homeOrder ?? -1) + 1;
}

export function buildPublicHomeFormationsSection(
  locale: Locale,
  settings: {
    homeFormationsTitleFr: string | null;
    homeFormationsTitleAr: string | null;
    homeFormationsSubtitleFr: string | null;
    homeFormationsSubtitleAr: string | null;
    homeFormationsCtaLabelFr: string | null;
    homeFormationsCtaLabelAr: string | null;
    homeFormationsCtaHref: string | null;
  },
  items: HomeFormationShowcaseRecord[],
  fallbacks: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  }
): PublicHomeFormationsSection {
  const isAr = locale === "ar";
  return {
    title: isAr
      ? settings.homeFormationsTitleAr || fallbacks.title
      : settings.homeFormationsTitleFr || fallbacks.title,
    subtitle: isAr
      ? settings.homeFormationsSubtitleAr || fallbacks.subtitle
      : settings.homeFormationsSubtitleFr || fallbacks.subtitle,
    ctaLabel: isAr
      ? settings.homeFormationsCtaLabelAr || fallbacks.ctaLabel
      : settings.homeFormationsCtaLabelFr || fallbacks.ctaLabel,
    ctaHref: resolveNavHref(
      locale,
      settings.homeFormationsCtaHref || fallbacks.ctaHref
    ),
    items: toPublicHomeFormationShowcases(items, locale),
  };
}
