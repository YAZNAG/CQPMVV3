import type { SiteSettings } from "@prisma/client";
import {
  GALLERY_PAGE_DEFAULTS,
  type GalleryPageHeroKey,
  type GalleryPageHeroSettings,
} from "@/lib/gallery-page-defaults";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export function resolveGalleryPageHeroSettings(
  settings: SiteSettings,
  page: GalleryPageHeroKey
): GalleryPageHeroSettings {
  const defaults = GALLERY_PAGE_DEFAULTS[page];

  if (page === "photos") {
    return {
      titleFr: settings.galleryPhotosTitleFr ?? defaults.titleFr,
      titleAr: settings.galleryPhotosTitleAr ?? defaults.titleAr,
      subtitleFr: settings.galleryPhotosSubtitleFr ?? defaults.subtitleFr,
      subtitleAr: settings.galleryPhotosSubtitleAr ?? defaults.subtitleAr,
      heroBackgroundUrl:
        settings.galleryPhotosHeroBackgroundUrl ?? defaults.heroBackgroundUrl,
    };
  }

  return {
    titleFr: settings.galleryVideosTitleFr ?? defaults.titleFr,
    titleAr: settings.galleryVideosTitleAr ?? defaults.titleAr,
    subtitleFr: settings.galleryVideosSubtitleFr ?? defaults.subtitleFr,
    subtitleAr: settings.galleryVideosSubtitleAr ?? defaults.subtitleAr,
    heroBackgroundUrl:
      settings.galleryVideosHeroBackgroundUrl ?? defaults.heroBackgroundUrl,
  };
}

export function resolveGalleryPageHeroLabels(
  settings: SiteSettings,
  locale: Locale,
  page: GalleryPageHeroKey
) {
  const hero = resolveGalleryPageHeroSettings(settings, page);
  return {
    title: locale === "ar" ? hero.titleAr : hero.titleFr,
    titleAr: hero.titleAr,
    subtitle: getLocalized(locale, hero.subtitleFr, hero.subtitleAr),
    heroBackgroundUrl: hero.heroBackgroundUrl,
  };
}
