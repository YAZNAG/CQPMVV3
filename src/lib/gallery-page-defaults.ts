import { SITE_IMAGES } from "@/lib/site-images";

export const GALLERY_PAGE_DEFAULTS = {
  photos: {
    titleFr: "Photos",
    titleAr: "الصور",
    subtitleFr: "Découvrez le CQPM Nador en images.",
    subtitleAr: "اكتشف مركز التأهيل المهني البحري بالناظور في صور.",
    heroBackgroundUrl: SITE_IMAGES.about,
  },
  videos: {
    titleFr: "Vidéos",
    titleAr: "الفيديوهات",
    subtitleFr: "Découvrez le CQPM Nador à travers nos vidéos.",
    subtitleAr: "اكتشف مركز التأهيل المهني البحري بالناظور عبر فيديوهاتنا.",
    heroBackgroundUrl: null as string | null,
  },
} as const;

export type GalleryPageHeroKey = keyof typeof GALLERY_PAGE_DEFAULTS;

export type GalleryPageHeroSettings = {
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  heroBackgroundUrl: string | null;
};
