import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { getPublishedGalleryMediaItems } from "@/services/gallery.service";
import { getSiteSettings } from "@/services/site-settings.service";
import { resolveGalleryPageHeroLabels } from "@/services/gallery-page.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { VideosSitePage } from "@/features/gallery/videos-site-page";
import type { Locale } from "@/types";

const PAGE_SIZE = 9;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};
  const dict = await getDictionary(locale);
  const g = dict.pages.gallery;
  return buildMetadata({
    locale,
    title: g.videosTitle,
    description: g.videosSubtitle,
    path: "/gallery/videos",
  });
}

export default async function GalleryVideosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: l } = await params;
  const { page: p } = await searchParams;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const page = Number(p) || 1;

  const [dict, settings] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
  ]);

  if (!isSiteSectionPublished(settings, "gallery")) {
    redirect(`/${locale}`);
  }

  const result = await getPublishedGalleryMediaItems(locale, {
    type: "VIDEO",
    pageSize: page * PAGE_SIZE,
  });

  const displayed = result.allItems.slice(0, page * PAGE_SIZE);
  const totalPages = Math.ceil(result.total / PAGE_SIZE) || 1;
  const g = dict.pages.gallery;
  const hero = resolveGalleryPageHeroLabels(settings, locale, "videos");

  return (
    <VideosSitePage
      locale={locale}
      items={displayed}
      page={page}
      totalPages={totalPages}
      total={result.total}
      labels={{
        title: hero.title,
        titleAr: hero.titleAr,
        subtitle: hero.subtitle,
        heroBackgroundUrl: hero.heroBackgroundUrl,
        subNav: g.subNav,
        newsSubNav: dict.pages.news.subNav,
        loadMore: g.loadMoreVideos,
        empty: g.emptyVideos,
        cta: g.cta,
      }}
    />
  );
}
