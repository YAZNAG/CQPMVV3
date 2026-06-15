import type { Metadata } from "next";
import type { Locale } from "@/types";
import type { SiteSettings } from "@prisma/client";
import {
  LOCALE_OG,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  TWITTER_HANDLE,
} from "./config";
import { alternateLanguages, localeUrl, resolveOgImage } from "./urls";

export type BuildMetadataOptions = {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  author?: string | null;
  noIndex?: boolean;
};

export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  image,
  keywords = [],
  type,
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = localeUrl(locale, path);
  const siteName = SITE_NAME[locale];
  const ogImage = resolveOgImage(image);
  const isArticle =
    type === "article" || (path.startsWith("/news/") && path.length > 6);
  const mergedKeywords = [...SEO_KEYWORDS[locale], ...keywords];

  const openGraph: Metadata["openGraph"] = {
    title,
    description,
    url,
    siteName,
    locale: LOCALE_OG[locale],
    alternateLocale: locale === "fr" ? [LOCALE_OG.ar] : [LOCALE_OG.fr],
    type: isArticle ? "article" : "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${title} — ${siteName}`,
      },
    ],
  };

  if (isArticle && openGraph && typeof openGraph === "object") {
    Object.assign(openGraph, {
      ...(publishedTime ? { publishedTime: publishedTime.toISOString() } : {}),
      ...(modifiedTime ? { modifiedTime: modifiedTime.toISOString() } : {}),
      ...(author ? { authors: [author] } : {}),
    });
  }

  return {
    title,
    description,
    keywords: mergedKeywords,
    authors: [{ name: siteName, url: localeUrl(locale) }],
    creator: siteName,
    publisher: siteName,
    category: "education",
    alternates: {
      canonical: url,
      languages: alternateLanguages(path),
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      ...(TWITTER_HANDLE ? { site: TWITTER_HANDLE, creator: TWITTER_HANDLE } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function buildRootMetadata(settings?: SiteSettings): Metadata {
  const verification: Metadata["verification"] = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.GOOGLE_SITE_VERIFICATION;
  }
  if (process.env.BING_SITE_VERIFICATION) {
    verification.other = {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION,
    };
  }

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
      default: `${settings?.siteNameFr ?? "CQPM Nador"} | ${SITE_TAGLINE.fr}`,
      template: `%s | ${settings?.siteNameFr ?? "CQPM Nador"}`,
    },
    description:
      settings?.taglineFr ??
      "Centre de Qualification Professionnelle Maritime de Nador — Former les professionnels de la mer de demain.",
    applicationName: "CQPM Nador",
    referrer: "origin-when-cross-origin",
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: settings?.logoUrl
        ? [{ url: settings.logoUrl }]
        : [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: settings?.logoUrl
        ? [{ url: settings.logoUrl }]
        : [{ url: "/favicon.svg" }],
    },
    manifest: "/manifest.webmanifest",
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildPageMetadata(
  locale: Locale,
  meta: { title: string; description: string; keywords?: string[] },
  path: string
): Metadata {
  return buildMetadata({
    locale,
    title: meta.title,
    description: meta.description,
    path,
    keywords: meta.keywords,
  });
}
