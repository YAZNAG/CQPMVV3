import type { SiteSettings } from "@prisma/client";
import type { Locale } from "@/types";
import {
  ORG_DEFAULTS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "./config";
import { localeUrl, resolveOgImage } from "./urls";

type JsonLd = Record<string, unknown>;

export function jsonLdGraph(...nodes: JsonLd[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((node) => ({
      ...node,
      "@context": "https://schema.org",
    })),
  };
}

export function buildOrganizationSchema(
  settings: SiteSettings,
  locale: Locale,
  socialUrls: string[] = []
): JsonLd {
  const name = locale === "ar" ? settings.siteNameAr : settings.siteNameFr;
  const sameAs =
    socialUrls.length > 0
      ? socialUrls
      : ([
          settings.facebookUrl,
          settings.linkedinUrl,
          settings.youtubeUrl,
          settings.twitterUrl,
        ].filter(Boolean) as string[]);

  return {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name,
    alternateName: [settings.siteNameFr, settings.siteNameAr],
    legalName: ORG_DEFAULTS.legalName,
    url: SITE_URL,
    logo: resolveOgImage(settings.logoUrl),
    image: resolveOgImage(settings.heroImageUrl ?? settings.logoUrl),
    description:
      locale === "ar" ? settings.taglineAr : settings.taglineFr,
    email: settings.email ?? ORG_DEFAULTS.email,
    telephone: settings.phone ?? ORG_DEFAULTS.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        (locale === "ar" ? settings.addressAr : settings.addressFr) ??
        ORG_DEFAULTS.address.streetAddress,
      addressLocality: ORG_DEFAULTS.address.addressLocality,
      addressRegion: ORG_DEFAULTS.address.addressRegion,
      postalCode: ORG_DEFAULTS.address.postalCode,
      addressCountry: ORG_DEFAULTS.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ORG_DEFAULTS.geo.latitude,
      longitude: ORG_DEFAULTS.geo.longitude,
    },
    foundingDate: ORG_DEFAULTS.foundingDate,
    areaServed: { "@type": "Country", name: "Morocco" },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteSchema(locale: Locale): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME[locale],
    url: SITE_URL,
    description: SITE_TAGLINE[locale],
    inLanguage: ["fr-MA", "ar-MA"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/{locale}/news?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function buildBreadcrumbSchema(
  locale: Locale,
  items: BreadcrumbItem[]
): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localeUrl(locale, item.path),
    })),
  };
}

export function buildCourseSchema({
  locale,
  name,
  description,
  slug,
  duration,
  imageUrl,
}: {
  locale: Locale;
  name: string;
  description: string;
  slug: string;
  duration?: string;
  imageUrl?: string | null;
}): JsonLd {
  return {
    "@type": "Course",
    name,
    description: description.slice(0, 500),
    url: localeUrl(locale, `/formations/${slug}`),
    provider: { "@id": `${SITE_URL}/#organization` },
    inLanguage: locale === "ar" ? "ar" : "fr",
    ...(duration ? { timeRequired: duration } : {}),
    ...(imageUrl ? { image: resolveOgImage(imageUrl) } : {}),
  };
}

export function buildNewsArticleSchema({
  locale,
  headline,
  description,
  slug,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  categoryName,
}: {
  locale: Locale;
  headline: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  datePublished?: Date | null;
  dateModified?: Date;
  authorName?: string | null;
  categoryName?: string | null;
}): JsonLd {
  return {
    "@type": "NewsArticle",
    headline,
    description: description.slice(0, 300),
    url: localeUrl(locale, `/news/${slug}`),
    mainEntityOfPage: localeUrl(locale, `/news/${slug}`),
    image: imageUrl ? [resolveOgImage(imageUrl)] : [resolveOgImage(null)],
    datePublished: datePublished?.toISOString(),
    dateModified: (dateModified ?? datePublished)?.toISOString(),
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: locale === "ar" ? "ar" : "fr",
    ...(categoryName ? { articleSection: categoryName } : {}),
  };
}

export function buildImageGallerySchema({
  locale,
  name,
  description,
  slug,
  imageUrl,
}: {
  locale: Locale;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
}): JsonLd {
  return {
    "@type": "ImageGallery",
    name,
    description: description.slice(0, 300),
    url: localeUrl(locale, `/gallery/${slug}`),
    ...(imageUrl ? { image: resolveOgImage(imageUrl) } : {}),
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

export function buildContactPageSchema(locale: Locale): JsonLd {
  return {
    "@type": "ContactPage",
    name: locale === "ar" ? "اتصل بنا" : "Contact",
    url: localeUrl(locale, "/contact"),
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}

export function buildAboutPageSchema(locale: Locale): JsonLd {
  return {
    "@type": "AboutPage",
    name: locale === "ar" ? "من نحن" : "À propos",
    url: `${localeUrl(locale)}#about`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}

export function buildWebPageSchema({
  locale,
  name,
  description,
  path,
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    "@type": "WebPage",
    name,
    description: description.slice(0, 300),
    url: localeUrl(locale, path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

/** ItemList for homepage featured content */
export function buildItemListSchema(
  name: string,
  items: { name: string; url: string }[]
): JsonLd {
  return {
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
