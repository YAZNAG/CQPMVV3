import type { Locale } from "@/types";

export const FORMATION_CATEGORY_UI: Record<
  string,
  {
    levelBadgeFr: string;
    levelBadgeAr: string;
    sectionTitleFr: string;
    sectionTitleAr: string;
  }
> = {
  qualification: {
    levelBadgeFr: "Qualification",
    levelBadgeAr: "التأهيل",
    sectionTitleFr: "Niveau Qualification",
    sectionTitleAr: "مستوى التأهيل",
  },
  specialisation: {
    levelBadgeFr: "Spécialisation",
    levelBadgeAr: "التخصص",
    sectionTitleFr: "Spécialisation par Apprentissage",
    sectionTitleAr: "التخصص عن طريق التدريب",
  },
};

export function getCategoryUi(slug: string, locale: Locale) {
  const config = FORMATION_CATEGORY_UI[slug] ?? {
    levelBadgeFr: "Formation",
    levelBadgeAr: "تكوين",
    sectionTitleFr: "Parcours",
    sectionTitleAr: "مسار",
  };
  return {
    levelBadge: locale === "ar" ? config.levelBadgeAr : config.levelBadgeFr,
    sectionTitle: locale === "ar" ? config.sectionTitleAr : config.sectionTitleFr,
  };
}

export function parseBulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[\s•\-–]+/, "").trim())
    .filter(Boolean);
}
