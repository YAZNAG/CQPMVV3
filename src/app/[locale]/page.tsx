import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata, getPageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildItemListSchema,
  buildWebPageSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/seo/urls";
import {
  aboutMissionsText,
  aboutPresentationParagraph1,
  aboutPresentationParagraph2,
} from "@/lib/about-default-content";
import { getSiteSettings } from "@/services/site-settings.service";
import { getHomePageArticles } from "@/services/news.service";
import { buildPublicHomeEngagementSection } from "@/services/home-engagement.service";
import { getPublishedPartners } from "@/services/partner.service";
import {
  getPublishedHeroSlides,
  toPublicHeroSlides,
} from "@/services/hero-slide.service";
import {
  getPublishedHomeHighlights,
  toPublicHomeHighlights,
} from "@/services/home-highlight.service";
import { getPublishedSiteStats, toPublicSiteStats } from "@/services/site-stat.service";
import {
  buildPublicHomeFormationsSection,
  getPublishedHomeFormationShowcases,
} from "@/services/home-formation-showcase.service";
import { HeroSection } from "@/features/home/hero-section";
import { HomeHighlightsBand } from "@/features/home/home-highlights-band";
import { AboutTabsSection } from "@/features/home/about-tabs-section";
import { DirectorMessageSection } from "@/features/home/director-message-section";
import { StatsSection } from "@/features/home/stats-section";
import { HomeFormationsSection } from "@/features/home/home-formations-section";
import { resolveDirectorPublicContent } from "@/lib/director-content";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";
import {
  heroFallbackSubtitle as heroFallbackSubtitleText,
  heroFallbackTitle as heroFallbackTitleText,
} from "@/lib/hero-default-content";
import { SITE_IMAGES } from "@/lib/site-images";
import { NewsEventsSplitSection } from "@/features/home/news-events-split-section";
import { DownloadsSection } from "@/features/downloads/downloads-section";
import { buildPublicDownloadsSection } from "@/services/download.service";
import { HomeEngagementSection } from "@/features/home/home-engagement-section";
import { HomePartnersSection } from "@/features/home/home-partners-section";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { HomeContactBanner } from "@/features/home/home-contact-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  const settings = await getSiteSettings();
  const meta = getPageMeta(locale, "home");
  return buildMetadata({
    locale,
    title: meta.title,
    description:
      locale === "ar"
        ? settings.taglineAr || meta.description
        : settings.taglineFr || meta.description,
    path: "",
    keywords: meta.keywords,
    image: settings.heroImageUrl,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, settings, homeNews, engagementSection, partners, heroSlides, homeHighlights, homeFormationShowcases, siteStats, downloadsSection] =
    await Promise.all([
      getDictionary(locale),
      getSiteSettings(),
      getHomePageArticles(locale, 3),
      buildPublicHomeEngagementSection(locale),
      getPublishedPartners(),
      getPublishedHeroSlides(),
      getPublishedHomeHighlights(),
      getPublishedHomeFormationShowcases(),
      getPublishedSiteStats(),
      buildPublicDownloadsSection(locale),
    ]);

  const heroSlideItems = toPublicHeroSlides(heroSlides, locale);
  const highlightItems = toPublicHomeHighlights(homeHighlights, locale);
  const heroFallbackTitle = heroFallbackTitleText(locale);
  const fallbackSubtitle = heroFallbackSubtitleText(locale);
  const historyText =
    getLocalized(locale, settings.aboutHistoryFr ?? "", settings.aboutHistoryAr ?? "") ||
    aboutPresentationParagraph1(locale);
  const presentationParagraph =
    getLocalized(locale, settings.aboutPresentationFr ?? "", settings.aboutPresentationAr ?? "") ||
    aboutPresentationParagraph2(locale);
  const aboutText = [historyText, presentationParagraph].filter(Boolean).join("\n\n");
  const missionText =
    getLocalized(locale, settings.missionFr ?? "", settings.missionAr ?? "") ||
    aboutMissionsText(locale);
  const aboutImageUrl = settings.aboutImageUrl || SITE_IMAGES.about;
  const directorContent = resolveDirectorPublicContent(settings, locale);
  const showDirectorMessage = directorContent.published;
  const showHero = isSiteSectionPublished(settings, "hero");
  const showHighlights = isSiteSectionPublished(settings, "highlights");
  const showStats = isSiteSectionPublished(settings, "stats");
  const showFormations = isSiteSectionPublished(settings, "formations");
  const showNews = isSiteSectionPublished(settings, "news");
  const showEvents = isSiteSectionPublished(settings, "events");
  const showPartners = isSiteSectionPublished(settings, "partners");
  const showEngagement = isSiteSectionPublished(settings, "engagement");
  const aboutTitleMain =
    locale === "ar"
      ? "مركز التأهيل المهني البحري"
      : "Centre de Qualification Professionnelle Maritime de";
  const aboutTitleAccent = locale === "ar" ? "الناظور" : "Nador";

  const formationsSection = buildPublicHomeFormationsSection(
    locale,
    settings,
    homeFormationShowcases,
    {
      title: dict.sections.formations,
      subtitle:
        locale === "ar"
          ? "تكوينات معتمدة في الصيد البحري والملاحة والسلامة"
          : "Parcours certifiés en pêche, navigation et sécurité maritime",
      ctaLabel: dict.common.viewAll,
      ctaHref: "/formations",
    }
  );

  const meta = getPageMeta(locale, "home");
  const pageSchema = jsonLdGraph(
    buildWebPageSchema({
      locale,
      name: meta.title,
      description: meta.description,
      path: "",
    }),
    ...(formationsSection.items.length > 0
      ? [
          buildItemListSchema(
            formationsSection.title,
            formationsSection.items
              .filter((item) => item.href)
              .map((item) => ({
                name: item.title,
                url: absoluteUrl(item.href!),
              }))
          ),
        ]
      : [])
  );

  return (
    <>
      <JsonLd data={pageSchema} />
      {showHero ? (
        <HeroSection
          locale={locale}
          dict={dict}
          slides={heroSlideItems}
          fallback={{
            title: heroFallbackTitle,
            subtitle: fallbackSubtitle,
            imageUrl: SITE_IMAGES.hero,
          }}
        />
      ) : null}

      {showHighlights ? (
        <HomeHighlightsBand items={highlightItems} locale={locale} />
      ) : null}

      <AboutTabsSection
        locale={locale}
        sectionLabel={dict.sections.about}
        titleMain={aboutTitleMain}
        titleAccent={aboutTitleAccent}
        tabPresentation={dict.pages.about.presentation}
        tabMission={dict.pages.about.mission}
        presentationContent={aboutText}
        missionContent={missionText}
        imageUrl={aboutImageUrl}
        imageAlt={
          locale === "ar"
            ? "تكوين مهني بحري — مركز CQPM الناظور"
            : "Formation maritime et pêche — CQPM Nador"
        }
      />

      {showDirectorMessage && (
        <DirectorMessageSection
          locale={locale}
          quote={directorContent.quote}
          name={directorContent.name}
          title={directorContent.title}
          photoUrl={directorContent.photoUrl}
        />
      )}

      {showStats ? (
        <StatsSection dict={dict} items={toPublicSiteStats(siteStats, locale)} locale={locale} />
      ) : null}

      {showFormations ? (
        <HomeFormationsSection
          locale={locale}
          section={formationsSection}
          cardCtaLabel={dict.common.readMore}
        />
      ) : null}

      {showNews || showEvents ? (
        <NewsEventsSplitSection
          locale={locale}
          articles={
            showNews
              ? homeNews.articles.map((article) => ({
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  excerpt: article.excerpt,
                  coverImageUrl: article.coverImageUrl,
                  publishedAt: article.publishedAt,
                  category: article.category,
                }))
              : []
          }
          events={showEvents ? engagementSection.events : []}
          eventsEmptyMessage={engagementSection.eventsEmptyMessage}
          newsTitle={dict.pages.news.title}
          eventsTitle={dict.pages.events.title}
          viewAllNewsLabel={dict.common.viewAllNews}
          readArticleLabel={dict.common.readArticle}
          viewAllEventsLabel={dict.common.viewAllEvents}
          newsLimit={2}
          eventsLimit={3}
        />
      ) : null}

      <DownloadsSection
        locale={locale}
        title={downloadsSection.title}
        subtitle={downloadsSection.subtitle}
        items={downloadsSection.items}
        downloadLabel={dict.common.download}
        viewLabel={dict.common.viewDocument}
        isPublished={downloadsSection.isPublished}
      />

      {showPartners && partners.length > 0 ? (
        <HomePartnersSection
          locale={locale}
          title={dict.sections.partnersMarquee}
          partners={partners.map((p) => ({
            id: p.id,
            name: p.name,
            logoUrl: p.logoUrl,
            websiteUrl: p.websiteUrl,
          }))}
        />
      ) : null}

      {showEngagement ? (
        <>
          <HomeEngagementSection
            locale={locale}
            title={engagementSection.engagementTitle}
            backgroundUrl={engagementSection.backgroundUrl}
            mediaThumbnailUrl={engagementSection.mediaThumbnailUrl}
            video={engagementSection.video}
            items={engagementSection.engagementItems}
          />

          <HomeContactBanner
            title={engagementSection.contactBanner.title}
            subtitle={engagementSection.contactBanner.subtitle}
            phone={engagementSection.contactBanner.phone}
            href={engagementSection.contactBanner.href}
            backgroundUrl={engagementSection.contactBanner.backgroundUrl}
            locale={locale}
          />
        </>
      ) : null}
    </>
  );
}
