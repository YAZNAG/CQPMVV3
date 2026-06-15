import type { PermissionResource } from "@/lib/auth/rbac";

export const SITE_SECTION_KEYS = [
  "hero",
  "highlights",
  "events",
  "director",
  "engagement",
  "formations",
  "partners",
  "stats",
  "news",
  "gallery",
  "downloads",
  "orgChart",
  "chiffres",
] as const;

export type SiteSectionKey = (typeof SITE_SECTION_KEYS)[number];

export type SiteSectionPublishField =
  | "heroSectionPublished"
  | "homeHighlightsSectionPublished"
  | "homeEventsSectionPublished"
  | "directorMessagePublished"
  | "homeEngagementSectionPublished"
  | "homeFormationsSectionPublished"
  | "partnersSectionPublished"
  | "homeStatsSectionPublished"
  | "newsSectionPublished"
  | "gallerySectionPublished"
  | "downloadsSectionPublished"
  | "orgChartPublished"
  | "chiffresPublished";

type SiteSectionConfig = {
  field: SiteSectionPublishField;
  resource: PermissionResource;
  revalidatePaths: string[];
};

export const SITE_SECTION_CONFIG: Record<SiteSectionKey, SiteSectionConfig> = {
  hero: {
    field: "heroSectionPublished",
    resource: "hero",
    revalidatePaths: ["/fr", "/ar", "/admin/hero"],
  },
  highlights: {
    field: "homeHighlightsSectionPublished",
    resource: "hero",
    revalidatePaths: ["/fr", "/ar", "/admin/highlights"],
  },
  events: {
    field: "homeEventsSectionPublished",
    resource: "hero",
    revalidatePaths: ["/fr", "/ar", "/fr/events", "/ar/events", "/admin/events"],
  },
  director: {
    field: "directorMessagePublished",
    resource: "hero",
    revalidatePaths: [
      "/fr",
      "/ar",
      "/fr/pages/mot-du-directeur",
      "/ar/pages/mot-du-directeur",
      "/fr/pages/presentation",
      "/admin/director",
    ],
  },
  engagement: {
    field: "homeEngagementSectionPublished",
    resource: "hero",
    revalidatePaths: ["/fr", "/ar", "/admin/home-engagement"],
  },
  formations: {
    field: "homeFormationsSectionPublished",
    resource: "formations",
    revalidatePaths: ["/fr", "/ar", "/admin/home-formations"],
  },
  partners: {
    field: "partnersSectionPublished",
    resource: "formations",
    revalidatePaths: ["/fr", "/ar", "/fr/pages/presentation", "/admin/partners"],
  },
  stats: {
    field: "homeStatsSectionPublished",
    resource: "settings",
    revalidatePaths: ["/fr", "/ar", "/fr/pages/presentation", "/admin/settings"],
  },
  news: {
    field: "newsSectionPublished",
    resource: "news",
    revalidatePaths: ["/fr", "/ar", "/fr/news", "/ar/news", "/admin/news"],
  },
  gallery: {
    field: "gallerySectionPublished",
    resource: "gallery",
    revalidatePaths: ["/fr", "/ar", "/fr/gallery", "/ar/gallery", "/fr/gallery/photos", "/ar/gallery/photos", "/fr/gallery/videos", "/ar/gallery/videos", "/admin/gallery"],
  },
  downloads: {
    field: "downloadsSectionPublished",
    resource: "pages",
    revalidatePaths: [
      "/fr",
      "/ar",
      "/fr/pages/presentation",
      "/fr/telechargements",
      "/admin/downloads",
    ],
  },
  orgChart: {
    field: "orgChartPublished",
    resource: "pages",
    revalidatePaths: [
      "/fr/pages/organigramme",
      "/ar/pages/organigramme",
      "/admin/organigramme",
    ],
  },
  chiffres: {
    field: "chiffresPublished",
    resource: "pages",
    revalidatePaths: [
      "/fr/pages/nador-en-chiffres",
      "/ar/pages/nador-en-chiffres",
      "/admin/chiffres",
    ],
  },
};

export function isSiteSectionPublished(
  settings: Partial<Record<SiteSectionPublishField, boolean>> | null | undefined,
  key: SiteSectionKey
): boolean {
  const field = SITE_SECTION_CONFIG[key].field;
  return settings?.[field] !== false;
}
