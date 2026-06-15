import type { Locale } from "@/types";
import { locales } from "@/lib/i18n/config";
import { SITE_URL } from "./config";

export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localePath(locale: Locale, path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${suffix}`;
}

export function localeUrl(locale: Locale, path = ""): string {
  return absoluteUrl(localePath(locale, path));
}

export function alternateLanguages(path = ""): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localeUrl("fr", path),
  };
  for (const locale of locales) {
    languages[locale] = localeUrl(locale, path);
  }
  return languages;
}

export function resolveOgImage(image?: string | null): string {
  if (!image) return absoluteUrl("/og");
  if (image.startsWith("http")) return image;
  return absoluteUrl(image);
}
