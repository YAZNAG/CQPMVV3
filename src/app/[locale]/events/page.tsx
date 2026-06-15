import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, getPageMeta } from "@/lib/seo";
import { buildPublicHomeEngagementSection } from "@/services/home-engagement.service";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { AgendaSitePage } from "@/features/news/agenda-site-page";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  return buildPageMetadata(locale, getPageMeta(locale, "events"), "/events");
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, section, settings] = await Promise.all([
    getDictionary(locale),
    buildPublicHomeEngagementSection(locale),
    getSiteSettings(),
  ]);

  const showEvents = isSiteSectionPublished(settings, "events");
  const pMeta = dict.pages;
  const defaultLocation =
    locale === "ar"
      ? settings.addressAr ?? "المركز بالناظور، بني نصار"
      : settings.addressFr ?? "CQPM Nador, Bni Nsser";

  return (
    <AgendaSitePage
      locale={locale}
      events={showEvents ? section.events : []}
      defaultLocation={defaultLocation}
      labels={{
        heroTitle: pMeta.events.title,
        heroSubtitle: pMeta.events.subtitle,
        subNav: pMeta.news.subNav,
        upcomingTitle: pMeta.events.upcoming,
        emptyMessage: showEvents
          ? pMeta.events.empty
          : locale === "ar"
            ? "قسم الفعاليات غير متاح حالياً."
            : "La section événements est actuellement masquée.",
        viewDetail: pMeta.events.viewDetail,
        calendarMonth: pMeta.events.calendarMonth,
        calendarWeek: pMeta.events.calendarWeek,
        calendarList: pMeta.events.calendarList,
        allCategories: pMeta.news.allCategories,
        weekdays: pMeta.events.weekdays,
      }}
    />
  );
}
