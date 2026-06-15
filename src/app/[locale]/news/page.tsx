import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Newspaper } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata, getPageMeta } from "@/lib/seo";
import { getPublishedArticles, getPublishedCategories, getFeaturedArticles } from "@/services/news.service";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { Container } from "@/components/public/container";
import { NewsFilters } from "@/features/news/news-filters";
import { NewsHubHero } from "@/features/news/news-hub-hero";
import { NewsPagination } from "@/features/news/news-pagination";
import { NewsPremiumCard } from "@/features/news/news-premium-card";
import { NewsSubNav } from "@/features/news/news-sub-nav";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale: l } = await params;
  const { q, category } = await searchParams;
  const locale = l as Locale;
  const title =
    locale === "ar"
      ? category
        ? "أخبار"
        : q
          ? `بحث: ${q}`
          : "الأخبار"
      : category
        ? "Actualités"
        : q
          ? `Recherche : ${q}`
          : "Actualités & Agenda";

  const meta = getPageMeta(locale, "news");
  return buildMetadata({
    locale,
    title: q || category ? title : meta.title,
    description: meta.description,
    path: "/news",
    keywords: meta.keywords,
  });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const { locale: l } = await params;
  const { page: p, q, category } = await searchParams;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const page = Number(p) || 1;
  const showFeatured = page === 1 && !q && !category;
  const isFiltered = Boolean(q || category);

  const [dict, categories, featured, settings] = await Promise.all([
    getDictionary(locale),
    getPublishedCategories(locale),
    showFeatured ? getFeaturedArticles(locale, 3) : Promise.resolve([]),
    getSiteSettings(),
  ]);

  const showNews = isSiteSectionPublished(settings, "news");

  const result = showNews
    ? await getPublishedArticles({
        locale,
        page,
        search: q,
        categorySlug: category,
        excludeFeatured: showFeatured && featured.length > 0,
      })
    : { data: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };

  const pMeta = dict.pages.news;
  const totalArticles = result.total;

  return (
    <>
      <NewsHubHero title={pMeta.title} subtitle={pMeta.subtitle} />

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container>
          <NewsSubNav locale={locale} active="news" labels={pMeta.subNav} />
        </Container>
      </section>

      <section className="relative z-10 bg-white pb-2 pt-8">
        <Container>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
            <NewsFilters
              dict={dict}
              categories={categories}
              currentCategory={category}
              currentQuery={q}
            />
          </div>
        </Container>
      </section>

      {showFeatured && featured.length > 0 && (
        <section className="bg-white py-12 lg:py-16">
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{pMeta.featured}</h2>
              <Link
                href={`/${locale}/news?page=1`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 hover:text-ocean-700"
              >
                {pMeta.seeAll}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {featured.map((article) => (
                <NewsPremiumCard
                  key={article.id}
                  locale={locale}
                  article={article}
                  readMoreLabel={dict.common.readMore}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-slate-50/80 py-12 lg:py-16">
        <Container>
          {!isFiltered && (
            <h2 className="mb-8 text-2xl font-bold text-navy-900 md:text-3xl">
              {pMeta.latestArticles}
            </h2>
          )}

          {isFiltered && (
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-600">
                  {dict.common.search}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">
                  {q
                    ? locale === "ar"
                      ? `نتائج: « ${q} »`
                      : `Résultats pour « ${q} »`
                    : categories.find((c) => c.slug === category)?.name ?? pMeta.title}
                </h2>
                <p className="mt-2 text-sm text-navy-500">
                  {totalArticles}{" "}
                  {locale === "ar"
                    ? totalArticles === 1
                      ? "مقال"
                      : "مقالات"
                    : totalArticles === 1
                      ? "article"
                      : "articles"}
                </p>
              </div>
              <Link
                href={`/${locale}/news`}
                className="text-sm font-semibold text-ocean-600 hover:text-ocean-700 hover:underline"
              >
                {locale === "ar" ? "مسح الفلاتر" : "Effacer les filtres"}
              </Link>
            </div>
          )}

          {result.data.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-navy-200 bg-white px-8 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-ocean-600">
                <Newspaper className="h-7 w-7" />
              </div>
              <p className="mt-5 text-lg font-semibold text-navy-800">
                {dict.common.noResults}
              </p>
              <p className="mt-2 text-sm text-navy-500">
                {locale === "ar"
                  ? "جرّب كلمات بحث أخرى أو تصفّح كل المقالات."
                  : "Essayez d'autres mots-clés ou parcourez tous les articles."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {result.data.map((article) => (
                <NewsPremiumCard
                  key={article.id}
                  locale={locale}
                  article={article}
                  readMoreLabel={dict.common.readMore}
                />
              ))}
            </div>
          )}

          <NewsPagination
            page={page}
            totalPages={result.totalPages}
            locale={locale}
            q={q}
            category={category}
          />
        </Container>
      </section>
    </>
  );
}
