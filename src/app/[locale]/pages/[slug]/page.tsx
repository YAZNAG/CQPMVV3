import { notFound } from "next/navigation";

import { isValidLocale } from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/get-dictionary";

import { buildMetadata } from "@/lib/seo";

import { JsonLd } from "@/components/seo/json-ld";

import { buildBreadcrumbSchema, jsonLdGraph } from "@/lib/seo/structured-data";

import { ABOUT_PAGE_SLUGS, isChiffresPageSlug, isDirectorPageSlug, isOrganigrammePageSlug, isPresentationPageSlug } from "@/lib/about-pages";

import { resolveDirectorPublicContent } from "@/lib/director-content";

import { resolvePresentationPublicContent } from "@/lib/presentation-content";

import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";

import { getSitePageBySlug, getSitePageBySlugForMetadata } from "@/services/site-page.service";

import { getPublishedSiteStats, toPublicSiteStats } from "@/services/site-stat.service";

import { getPublishedFormations } from "@/services/formation.service";

import { getPublishedPartners } from "@/services/partner.service";

import { getRecentGalleryPhotos } from "@/services/gallery.service";

import { getHomePageArticles } from "@/services/news.service";

import { buildPublicHomeEngagementSection } from "@/services/home-engagement.service";

import { buildPublicDownloadsSection } from "@/services/download.service";

import { buildPublicOrgChartPage } from "@/services/org-chart.service";

import { buildPublicChiffresPage } from "@/services/chiffres.service";

import { DirectorSitePage } from "@/features/about/director-site-page";

import { OrganigrammeSitePage } from "@/features/about/organigramme-site-page";

import { ChiffresSitePage } from "@/features/about/chiffres-site-page";

import { PresentationSitePage } from "@/features/about/presentation-site-page";

import { PageHero } from "@/components/public/page-hero";

import { Container } from "@/components/public/container";

import { SITE_IMAGES, UPLOAD_IMAGES, resolveFormationImage } from "@/lib/site-images";

import type { Locale } from "@/types";



export async function generateMetadata({

  params,

}: {

  params: Promise<{ locale: string; slug: string }>;

}) {

  const { locale: l, slug } = await params;

  const locale = l as Locale;

  if (!isValidLocale(l)) return {};



  if (isDirectorPageSlug(slug)) {

    const settings = await getSiteSettings();

    const content = resolveDirectorPublicContent(settings, locale);

    return buildMetadata({

      locale,

      title:

        locale === "ar" ? "كلمة المدير — CQPM Nador" : "Mot du Directeur — CQPM Nador",

      description: content.quote.slice(0, 160),

      path: `/pages/${slug}`,

      image: content.photoUrl ?? undefined,

    });

  }

  if (isOrganigrammePageSlug(slug)) {
    const orgChart = await buildPublicOrgChartPage(locale);
    return buildMetadata({
      locale,
      title: `${orgChart.title} — CQPM Nador`,
      description: orgChart.subtitle.slice(0, 160),
      path: `/pages/${slug}`,
    });
  }

  if (isChiffresPageSlug(slug)) {
    const chiffres = await buildPublicChiffresPage(locale);
    return buildMetadata({
      locale,
      title: `${chiffres.title} — CQPM Nador`,
      description: chiffres.subtitle.slice(0, 160),
      path: `/pages/${slug}`,
      image: chiffres.heroBackgroundUrl ?? undefined,
    });
  }



  const page = await getSitePageBySlugForMetadata(slug, locale);

  if (!page) return { title: "Page" };



  return buildMetadata({

    locale,

    title: page.title,

    description: page.excerpt ?? page.title,

    path: `/pages/${slug}`,

    image: page.coverImageUrl ?? undefined,

    type: "website",

    modifiedTime: page.updatedAt,

  });

}



export default async function SitePageView({

  params,

}: {

  params: Promise<{ locale: string; slug: string }>;

}) {

  const { locale: l, slug } = await params;

  if (!isValidLocale(l)) notFound();

  const locale = l as Locale;



  const dict = await getDictionary(locale);



  if (isDirectorPageSlug(slug)) {

    const settings = await getSiteSettings();

    const content = resolveDirectorPublicContent(settings, locale);

    const pageTitle = locale === "ar" ? "كلمة المدير" : "Mot du Directeur";

    const pageSubtitle = locale === "ar" ? "كلمة السيد المدير" : "Le mot du directeur";



    const schema = jsonLdGraph(

      buildBreadcrumbSchema(locale, [

        { name: dict.nav.home, path: "" },

        { name: locale === "ar" ? "المركز" : "Le Centre", path: `/pages/${ABOUT_PAGE_SLUGS.presentation}` },

        { name: pageTitle, path: `/pages/${slug}` },

      ])

    );



    return (

      <article>

        <JsonLd data={schema} />

        <DirectorSitePage

          locale={locale}

          content={content}

          pageTitle={pageTitle}

          pageSubtitle={pageSubtitle}

          heroImageUrl={settings.aboutImageUrl}

          breadcrumbs={[

            { label: dict.nav.home, href: `/${locale}` },

            {

              label: locale === "ar" ? "المركز" : "Le Centre",

              href: `/${locale}/pages/${ABOUT_PAGE_SLUGS.presentation}`,

            },

            { label: pageTitle, href: `/${locale}/pages/${slug}` },

          ]}

        />

      </article>

    );

  }

  if (isOrganigrammePageSlug(slug)) {
    const orgChart = await buildPublicOrgChartPage(locale);
    const pageTitle = orgChart.title;
    const schema = jsonLdGraph(
      buildBreadcrumbSchema(locale, [
        { name: dict.nav.home, path: "" },
        {
          name: locale === "ar" ? "المركز" : "Le Centre",
          path: `/pages/${ABOUT_PAGE_SLUGS.presentation}`,
        },
        { name: pageTitle, path: `/pages/${slug}` },
      ])
    );

    return (
      <article>
        <JsonLd data={schema} />
        <OrganigrammeSitePage
          locale={locale}
          title={pageTitle}
          subtitle={orgChart.isPublished ? orgChart.subtitle : ""}
          backgroundUrl={orgChart.backgroundUrl}
          roots={orgChart.roots}
          breadcrumbs={[
            { label: dict.nav.home, href: `/${locale}` },
            {
              label: locale === "ar" ? "المركز" : "Le Centre",
              href: `/${locale}/pages/${ABOUT_PAGE_SLUGS.presentation}`,
            },
            { label: pageTitle, href: `/${locale}/pages/${slug}` },
          ]}
        />
      </article>
    );
  }

  if (isChiffresPageSlug(slug)) {
    const chiffres = await buildPublicChiffresPage(locale);
    const pageTitle = chiffres.title;
    const schema = jsonLdGraph(
      buildBreadcrumbSchema(locale, [
        { name: dict.nav.home, path: "" },
        {
          name: locale === "ar" ? "المركز" : "Le Centre",
          path: `/pages/${ABOUT_PAGE_SLUGS.presentation}`,
        },
        { name: pageTitle, path: `/pages/${slug}` },
      ])
    );

    if (!chiffres.isPublished) {
      notFound();
    }

    return (
      <article>
        <JsonLd data={schema} />
        <ChiffresSitePage
          locale={locale}
          page={chiffres}
          breadcrumbs={[
            { label: dict.nav.home, href: `/${locale}` },
            {
              label: locale === "ar" ? "المركز" : "Le Centre",
              href: `/${locale}/pages/${ABOUT_PAGE_SLUGS.presentation}`,
            },
            { label: pageTitle, href: `/${locale}/pages/${slug}` },
          ]}
        />
      </article>
    );
  }



  if (isPresentationPageSlug(slug)) {

    const [settings, siteStats, categories, partners, galleryPhotos, page, homeNews, engagementSection, downloadsSection] = await Promise.all([

      getSiteSettings(),

      getPublishedSiteStats(),

      getPublishedFormations(locale),

      getPublishedPartners(),

      getRecentGalleryPhotos(locale, 5),

      getSitePageBySlug(slug, locale),

      getHomePageArticles(locale, 3),

      buildPublicHomeEngagementSection(locale),

      buildPublicDownloadsSection(locale),

    ]);



    const content = resolvePresentationPublicContent(settings, locale);

    const stats = isSiteSectionPublished(settings, "stats")
      ? toPublicSiteStats(siteStats, locale)
      : [];



    const domains = categories.slice(0, 3).map((cat) => {

      const firstFormation = cat.formations[0];

      const imageUrl = firstFormation

        ? resolveFormationImage(firstFormation.imageUrl, firstFormation.slug)

        : SITE_IMAGES.formationFallback;



      return {

        title: cat.name,

        description:

          cat.description ||

          (firstFormation?.description ?? "") ||

          (locale === "ar" ? "مسارات تكوين معتمدة." : "Parcours de formation certifiés."),

        imageUrl,

        href: firstFormation

          ? `/${locale}/formations/${firstFormation.slug}`

          : `/${locale}/formations`,

      };

    });



    const photos =
      isSiteSectionPublished(settings, "gallery") &&
      galleryPhotos.length > 0
        ? galleryPhotos
        : isSiteSectionPublished(settings, "gallery")
          ? UPLOAD_IMAGES.gallery.slice(0, 5).map((url, index) => ({
              id: `fallback-${index}`,
              imageUrl: url,
              alt: locale === "ar" ? "حياة المركز" : "Vie au Centre — CQPM Nador",
            }))
          : [];



    const pageTitle = page?.title ?? content.heroTitle;

    const schema = jsonLdGraph(

      buildBreadcrumbSchema(locale, [

        { name: dict.nav.home, path: "" },

        { name: pageTitle, path: `/pages/${slug}` },

      ])

    );



    return (

      <article>

        <JsonLd data={schema} />

        <PresentationSitePage

          locale={locale}

          dict={dict}

          content={content}

          heroImageUrl={page?.coverImageUrl ?? settings.aboutImageUrl ?? settings.heroImageUrl}

          breadcrumbs={[

            { label: dict.nav.home, href: `/${locale}` },

            { label: pageTitle, href: `/${locale}/pages/${slug}` },

          ]}

          stats={stats}

          domains={domains}

          galleryPhotos={photos}

          partners={
            isSiteSectionPublished(settings, "partners")
              ? partners.map((p) => ({
                  id: p.id,
                  name: p.name,
                  logoUrl: p.logoUrl,
                  websiteUrl: p.websiteUrl,
                }))
              : []
          }

          newsArticles={
            isSiteSectionPublished(settings, "news")
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

          events={
            isSiteSectionPublished(settings, "events") ? engagementSection.events : []
          }

          eventsEmptyMessage={engagementSection.eventsEmptyMessage}

          newsTitle={dict.pages.news.title}

          eventsTitle={dict.pages.events.title}

          viewAllNewsLabel={dict.common.viewAllNews}

          readArticleLabel={dict.common.readArticle}

          viewAllEventsLabel={dict.common.viewAllEvents}

          downloadsSection={downloadsSection}

        />

      </article>

    );

  }



  const page = await getSitePageBySlug(slug, locale);

  if (!page) notFound();



  const schema = jsonLdGraph(

    buildBreadcrumbSchema(locale, [

      { name: dict.nav.home, path: "" },

      { name: page.title, path: `/pages/${slug}` },

    ])

  );



  return (

    <article>

      <JsonLd data={schema} />

      <PageHero

        title={page.title}

        subtitle={page.excerpt ?? undefined}

        imageUrl={page.coverImageUrl}

        compact={!page.coverImageUrl}

      />

      <Container className="py-16 lg:py-20">

        <div

          className="prose prose-navy max-w-none prose-headings:text-navy-900 prose-a:text-ocean-600 prose-img:rounded-xl"

          dangerouslySetInnerHTML={{ __html: page.content }}

        />

      </Container>

    </article>

  );

}

