import type { ChiffresInfraStyle, SiteStatIcon } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_CHIFFRES_PAGE } from "@/lib/chiffres-defaults";
import { getSiteSettings } from "@/services/site-settings.service";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type ChiffresHighlightRecord = {
  id: string;
  labelFr: string;
  labelAr: string;
  value: number;
  suffix: string | null;
  icon: SiteStatIcon;
  order: number;
  isPublished: boolean;
};

export type ChiffresGrowthBarRecord = {
  id: string;
  labelFr: string;
  labelAr: string;
  value: number;
  order: number;
};

export type ChiffresFormationItemRecord = {
  id: string;
  labelFr: string;
  labelAr: string;
  valueText: string;
  icon: SiteStatIcon;
  order: number;
  isPublished: boolean;
};

export type ChiffresInfrastructureItemRecord = {
  id: string;
  labelFr: string;
  labelAr: string;
  valueText: string;
  icon: SiteStatIcon;
  style: ChiffresInfraStyle;
  order: number;
  isPublished: boolean;
};

export type ChiffresPageSettings = {
  chiffresPageTitleFr: string;
  chiffresPageTitleAr: string;
  chiffresPageSubtitleFr: string;
  chiffresPageSubtitleAr: string;
  chiffresHeroBackgroundUrl: string | null;
  chiffresPublished: boolean;
  chiffresEvolutionTitleFr: string;
  chiffresEvolutionTitleAr: string;
  chiffresEvolutionSubtitleFr: string;
  chiffresEvolutionSubtitleAr: string;
  chiffresGrowthChartTitleFr: string;
  chiffresGrowthChartTitleAr: string;
  chiffresSuccessChartTitleFr: string;
  chiffresSuccessChartTitleAr: string;
  chiffresSuccessRateValue: number;
  chiffresSuccessRateLabelFr: string;
  chiffresSuccessRateLabelAr: string;
  chiffresCapacityTitleFr: string;
  chiffresCapacityTitleAr: string;
  chiffresFormationColumnTitleFr: string;
  chiffresFormationColumnTitleAr: string;
  chiffresInfrastructureColumnTitleFr: string;
  chiffresInfrastructureColumnTitleAr: string;
  chiffresCtaTitleFr: string;
  chiffresCtaTitleAr: string;
  chiffresCtaTextFr: string;
  chiffresCtaTextAr: string;
  chiffresCtaPrimaryLabelFr: string;
  chiffresCtaPrimaryLabelAr: string;
  chiffresCtaPrimaryHref: string;
  chiffresCtaSecondaryLabelFr: string;
  chiffresCtaSecondaryLabelAr: string;
  chiffresCtaSecondaryHref: string;
};

export type PublicChiffresHighlight = {
  id: string;
  label: string;
  displayValue: string;
  icon: SiteStatIcon;
};

export type PublicChiffresGrowthBar = {
  id: string;
  label: string;
  value: number;
};

export type PublicChiffresFormationItem = {
  id: string;
  label: string;
  valueText: string;
  icon: SiteStatIcon;
};

export type PublicChiffresInfrastructureItem = {
  id: string;
  label: string;
  valueText: string;
  icon: SiteStatIcon;
  style: ChiffresInfraStyle;
};

export type PublicChiffresPage = {
  isPublished: boolean;
  title: string;
  subtitle: string;
  heroBackgroundUrl: string | null;
  evolutionTitle: string;
  evolutionSubtitle: string;
  growthChartTitle: string;
  successChartTitle: string;
  successRateValue: number;
  successRateLabel: string;
  capacityTitle: string;
  formationColumnTitle: string;
  infrastructureColumnTitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  highlights: PublicChiffresHighlight[];
  growthBars: PublicChiffresGrowthBar[];
  formationItems: PublicChiffresFormationItem[];
  infrastructureItems: PublicChiffresInfrastructureItem[];
};

function formatHighlightValue(value: number, suffix: string | null) {
  if (suffix === "%") return `${value}%`;
  if (suffix === "+") return `${value.toLocaleString()}+`;
  if (suffix) return `${value.toLocaleString()}${suffix}`;
  return value.toLocaleString();
}

function resolvePageSettings(settings: Awaited<ReturnType<typeof getSiteSettings>>): ChiffresPageSettings {
  return {
    chiffresPageTitleFr:
      settings.chiffresPageTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresPageTitleFr,
    chiffresPageTitleAr:
      settings.chiffresPageTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresPageTitleAr,
    chiffresPageSubtitleFr:
      settings.chiffresPageSubtitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresPageSubtitleFr,
    chiffresPageSubtitleAr:
      settings.chiffresPageSubtitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresPageSubtitleAr,
    chiffresHeroBackgroundUrl:
      settings.chiffresHeroBackgroundUrl ?? DEFAULT_CHIFFRES_PAGE.chiffresHeroBackgroundUrl,
    chiffresPublished: settings.chiffresPublished ?? true,
    chiffresEvolutionTitleFr:
      settings.chiffresEvolutionTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresEvolutionTitleFr,
    chiffresEvolutionTitleAr:
      settings.chiffresEvolutionTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresEvolutionTitleAr,
    chiffresEvolutionSubtitleFr:
      settings.chiffresEvolutionSubtitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresEvolutionSubtitleFr,
    chiffresEvolutionSubtitleAr:
      settings.chiffresEvolutionSubtitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresEvolutionSubtitleAr,
    chiffresGrowthChartTitleFr:
      settings.chiffresGrowthChartTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresGrowthChartTitleFr,
    chiffresGrowthChartTitleAr:
      settings.chiffresGrowthChartTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresGrowthChartTitleAr,
    chiffresSuccessChartTitleFr:
      settings.chiffresSuccessChartTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresSuccessChartTitleFr,
    chiffresSuccessChartTitleAr:
      settings.chiffresSuccessChartTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresSuccessChartTitleAr,
    chiffresSuccessRateValue:
      settings.chiffresSuccessRateValue ?? DEFAULT_CHIFFRES_PAGE.chiffresSuccessRateValue,
    chiffresSuccessRateLabelFr:
      settings.chiffresSuccessRateLabelFr ?? DEFAULT_CHIFFRES_PAGE.chiffresSuccessRateLabelFr,
    chiffresSuccessRateLabelAr:
      settings.chiffresSuccessRateLabelAr ?? DEFAULT_CHIFFRES_PAGE.chiffresSuccessRateLabelAr,
    chiffresCapacityTitleFr:
      settings.chiffresCapacityTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresCapacityTitleFr,
    chiffresCapacityTitleAr:
      settings.chiffresCapacityTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresCapacityTitleAr,
    chiffresFormationColumnTitleFr:
      settings.chiffresFormationColumnTitleFr ??
      DEFAULT_CHIFFRES_PAGE.chiffresFormationColumnTitleFr,
    chiffresFormationColumnTitleAr:
      settings.chiffresFormationColumnTitleAr ??
      DEFAULT_CHIFFRES_PAGE.chiffresFormationColumnTitleAr,
    chiffresInfrastructureColumnTitleFr:
      settings.chiffresInfrastructureColumnTitleFr ??
      DEFAULT_CHIFFRES_PAGE.chiffresInfrastructureColumnTitleFr,
    chiffresInfrastructureColumnTitleAr:
      settings.chiffresInfrastructureColumnTitleAr ??
      DEFAULT_CHIFFRES_PAGE.chiffresInfrastructureColumnTitleAr,
    chiffresCtaTitleFr: settings.chiffresCtaTitleFr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaTitleFr,
    chiffresCtaTitleAr: settings.chiffresCtaTitleAr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaTitleAr,
    chiffresCtaTextFr: settings.chiffresCtaTextFr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaTextFr,
    chiffresCtaTextAr: settings.chiffresCtaTextAr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaTextAr,
    chiffresCtaPrimaryLabelFr:
      settings.chiffresCtaPrimaryLabelFr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaPrimaryLabelFr,
    chiffresCtaPrimaryLabelAr:
      settings.chiffresCtaPrimaryLabelAr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaPrimaryLabelAr,
    chiffresCtaPrimaryHref:
      settings.chiffresCtaPrimaryHref ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaPrimaryHref,
    chiffresCtaSecondaryLabelFr:
      settings.chiffresCtaSecondaryLabelFr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaSecondaryLabelFr,
    chiffresCtaSecondaryLabelAr:
      settings.chiffresCtaSecondaryLabelAr ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaSecondaryLabelAr,
    chiffresCtaSecondaryHref:
      settings.chiffresCtaSecondaryHref ?? DEFAULT_CHIFFRES_PAGE.chiffresCtaSecondaryHref,
  };
}

export async function getChiffresPageSettings(): Promise<ChiffresPageSettings> {
  const settings = await getSiteSettings();
  return resolvePageSettings(settings);
}

export async function listAdminChiffresHighlights(): Promise<ChiffresHighlightRecord[]> {
  return prisma.chiffresHighlight.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function listAdminChiffresGrowthBars(): Promise<ChiffresGrowthBarRecord[]> {
  return prisma.chiffresGrowthBar.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function listAdminChiffresFormationItems(): Promise<ChiffresFormationItemRecord[]> {
  return prisma.chiffresFormationItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function listAdminChiffresInfrastructureItems(): Promise<
  ChiffresInfrastructureItemRecord[]
> {
  return prisma.chiffresInfrastructureItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function buildPublicChiffresPage(locale: Locale): Promise<PublicChiffresPage> {
  const [settings, highlights, growthBars, formationItems, infrastructureItems] =
    await Promise.all([
      getChiffresPageSettings(),
      prisma.chiffresHighlight.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy: [{ order: "asc" }, { labelFr: "asc" }],
      }),
      prisma.chiffresGrowthBar.findMany({
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { labelFr: "asc" }],
      }),
      prisma.chiffresFormationItem.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy: [{ order: "asc" }, { labelFr: "asc" }],
      }),
      prisma.chiffresInfrastructureItem.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy: [{ order: "asc" }, { labelFr: "asc" }],
      }),
    ]);

  const isAr = locale === "ar";
  const isPublished = settings.chiffresPublished !== false;

  return {
    isPublished,
    title: isAr ? settings.chiffresPageTitleAr : settings.chiffresPageTitleFr,
    subtitle: isAr ? settings.chiffresPageSubtitleAr : settings.chiffresPageSubtitleFr,
    heroBackgroundUrl: settings.chiffresHeroBackgroundUrl,
    evolutionTitle: isAr
      ? settings.chiffresEvolutionTitleAr
      : settings.chiffresEvolutionTitleFr,
    evolutionSubtitle: isAr
      ? settings.chiffresEvolutionSubtitleAr
      : settings.chiffresEvolutionSubtitleFr,
    growthChartTitle: isAr
      ? settings.chiffresGrowthChartTitleAr
      : settings.chiffresGrowthChartTitleFr,
    successChartTitle: isAr
      ? settings.chiffresSuccessChartTitleAr
      : settings.chiffresSuccessChartTitleFr,
    successRateValue: settings.chiffresSuccessRateValue,
    successRateLabel: isAr
      ? settings.chiffresSuccessRateLabelAr
      : settings.chiffresSuccessRateLabelFr,
    capacityTitle: isAr ? settings.chiffresCapacityTitleAr : settings.chiffresCapacityTitleFr,
    formationColumnTitle: isAr
      ? settings.chiffresFormationColumnTitleAr
      : settings.chiffresFormationColumnTitleFr,
    infrastructureColumnTitle: isAr
      ? settings.chiffresInfrastructureColumnTitleAr
      : settings.chiffresInfrastructureColumnTitleFr,
    ctaTitle: isAr ? settings.chiffresCtaTitleAr : settings.chiffresCtaTitleFr,
    ctaText: isAr ? settings.chiffresCtaTextAr : settings.chiffresCtaTextFr,
    ctaPrimaryLabel: isAr
      ? settings.chiffresCtaPrimaryLabelAr
      : settings.chiffresCtaPrimaryLabelFr,
    ctaPrimaryHref: settings.chiffresCtaPrimaryHref,
    ctaSecondaryLabel: isAr
      ? settings.chiffresCtaSecondaryLabelAr
      : settings.chiffresCtaSecondaryLabelFr,
    ctaSecondaryHref: settings.chiffresCtaSecondaryHref,
    highlights: isPublished
      ? highlights.map((item) => ({
          id: item.id,
          label: getLocalized(locale, item.labelFr, item.labelAr),
          displayValue: formatHighlightValue(item.value, item.suffix),
          icon: item.icon,
        }))
      : [],
    growthBars: isPublished
      ? growthBars.map((item) => ({
          id: item.id,
          label: getLocalized(locale, item.labelFr, item.labelAr),
          value: item.value,
        }))
      : [],
    formationItems: isPublished
      ? formationItems.map((item) => ({
          id: item.id,
          label: getLocalized(locale, item.labelFr, item.labelAr),
          valueText: item.valueText,
          icon: item.icon,
        }))
      : [],
    infrastructureItems: isPublished
      ? infrastructureItems.map((item) => ({
          id: item.id,
          label: getLocalized(locale, item.labelFr, item.labelAr),
          valueText: item.valueText,
          icon: item.icon,
          style: item.style,
        }))
      : [],
  };
}
