import type { Locale } from "@/types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = {
  fr: "CQPM Nador",
  ar: "مركز التأهيل المهني البحري الناظور",
} as const satisfies Record<Locale, string>;

export const SITE_TAGLINE = {
  fr: "Former les professionnels de la mer de demain",
  ar: "تكوين مهنيي البحر في الغد",
} as const satisfies Record<Locale, string>;

export const LOCALE_OG: Record<Locale, string> = {
  fr: "fr_FR",
  ar: "ar_MA",
};

export const ORG_DEFAULTS = {
  legalName: "Centre de Qualification Professionnelle Maritime de Nador",
  email: "contact@cqpm-nador.ma",
  phone: "+212 5 36 60 87 28",
  address: {
    streetAddress: "Bni Nsser, B.P 697",
    addressLocality: "Nador",
    addressRegion: "Oriental",
    postalCode: "62000",
    addressCountry: "MA",
  },
  geo: {
    latitude: 35.168,
    longitude: -2.927,
  },
  foundingDate: "1999",
} as const;

export const DEFAULT_OG_IMAGE_PATH = "/og";

export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE;

export const SEO_KEYWORDS: Record<Locale, string[]> = {
  fr: [
    "CQPM Nador",
    "formation maritime",
    "pêche Maroc",
    "qualification professionnelle",
    "centre formation Nador",
    "métiers de la mer",
  ],
  ar: [
    "مركز التأهيل المهني البحري",
    "الناظور",
    "تكوين بحري",
    "الصيد البحري",
    "المغرب",
  ],
};
