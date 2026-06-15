import { getFormationNavChildren } from "@/lib/formation-default-content";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { PublicNavItem } from "@/services/navigation.service";
import type { Locale } from "@/types";

export function buildHeaderNavItems(locale: Locale, dict: Dictionary): PublicNavItem[] {
  return [
    { id: "home", href: `/${locale}`, label: dict.nav.home, exact: true },
    {
      id: "center",
      href: `/${locale}/pages/presentation`,
      label: dict.nav.center,
      children: [
        {
          id: "center-presentation",
          href: `/${locale}/pages/presentation`,
          label: dict.pages.about.presentation,
        },
        {
          id: "center-director",
          href: `/${locale}/pages/mot-du-directeur`,
          label: locale === "ar" ? "كلمة المدير" : "Le mot du directeur",
        },
        {
          id: "center-organigramme",
          href: `/${locale}/pages/organigramme`,
          label: locale === "ar" ? "الهيكل التنظيمي" : "Organigramme",
        },
        {
          id: "center-chiffres",
          href: `/${locale}/pages/nador-en-chiffres`,
          label: locale === "ar" ? "الناظور بالأرقام" : "Nador en Chiffres",
        },
      ],
    },
    {
      id: "formations",
      href: `/${locale}/formations`,
      label: dict.nav.formations,
      children: getFormationNavChildren(locale),
    },
    {
      id: "news-agenda",
      href: `/${locale}/news`,
      label: dict.nav.newsAgenda,
      children: [
        {
          id: "news-articles",
          href: `/${locale}/news`,
          label: dict.pages.news.subNav.news,
        },
        {
          id: "news-events",
          href: `/${locale}/events`,
          label: dict.pages.news.subNav.agenda,
        },
        {
          id: "news-communiques",
          href: `/${locale}/telechargements`,
          label: dict.pages.news.subNav.communiques,
        },
      ],
    },
    {
      id: "mediatheque",
      href: `/${locale}/gallery/photos`,
      label: dict.nav.mediatheque,
      dropdownOnly: true,
      children: [
        {
          id: "mediatheque-photos",
          href: `/${locale}/gallery/photos`,
          label: dict.nav.photos,
        },
        {
          id: "mediatheque-videos",
          href: `/${locale}/gallery/videos`,
          label: dict.nav.videos,
        },
      ],
    },
    {
      id: "contact",
      href: `/${locale}/contact`,
      label: dict.nav.contact,
      dropdownOnly: true,
      children: [
        {
          id: "contact-page",
          href: `/${locale}/contact`,
          label: dict.nav.contact,
        },
        {
          id: "contact-reclamation",
          href: `/${locale}/contact/reclamation`,
          label: dict.pages.contact.subNav.reclamation,
        },
      ],
    },
  ];
}
