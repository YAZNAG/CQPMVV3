import { SITE_IMAGES } from "@/lib/site-images";

export const HERO_DEFAULT_SLIDE = {
  titleFr: "Former les professionnels maritimes de demain",
  titleAr: "تكوين مهنيي البحر في الغد",
  subtitleFr:
    "Qualification et Spécialisation par apprentissage — Filières Pêche maritime et Machine. Beni Ensar B.P 697.",
  subtitleAr:
    "بني نصر ص.ب 697 — مستوى التأهيل والتخصص عن طريق التدريب في شعبتي الصيد البحري والميكانيك.",
  imageUrl: SITE_IMAGES.hero,
  buttons: [
    {
      labelFr: "S'inscrire",
      labelAr: "التسجيل",
      href: "/admission",
      variant: "primary" as const,
      order: 0,
    },
    {
      labelFr: "Découvrir les formations",
      labelAr: "اكتشف التكوينات",
      href: "/formations",
      variant: "outline" as const,
      order: 1,
    },
    {
      labelFr: "Nous contacter",
      labelAr: "اتصل بنا",
      href: "/contact",
      variant: "outline" as const,
      order: 2,
    },
  ],
  order: 0,
  isPublished: true,
} as const;

export const HERO_DEFAULT_TEXT = {
  titleFr: HERO_DEFAULT_SLIDE.titleFr,
  titleAr: HERO_DEFAULT_SLIDE.titleAr,
  subtitleFr: HERO_DEFAULT_SLIDE.subtitleFr,
  subtitleAr: HERO_DEFAULT_SLIDE.subtitleAr,
  buttons: HERO_DEFAULT_SLIDE.buttons,
} as const;

export function heroFallbackTitle(locale: "fr" | "ar") {
  return locale === "ar" ? HERO_DEFAULT_SLIDE.titleAr : HERO_DEFAULT_SLIDE.titleFr;
}

export function heroFallbackSubtitle(locale: "fr" | "ar") {
  return locale === "ar" ? HERO_DEFAULT_SLIDE.subtitleAr : HERO_DEFAULT_SLIDE.subtitleFr;
}
