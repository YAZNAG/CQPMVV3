import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildNewsArticleSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import {
  getArticleBySlug,
  getArticleBySlugForMetadata,
  getRelatedArticles,
} from "@/services/news.service";
import { NewsArticleView } from "@/features/news/news-article-view";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};
  const article = await getArticleBySlugForMetadata(slug, locale);
  if (!article) return { title: "Article" };

  return buildMetadata({
    locale,
    title: article.title,
    description: article.excerpt,
    path: `/news/${slug}`,
    image: article.coverImageUrl ?? undefined,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.authorName,
  });
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const [dict, article, related] = await Promise.all([
    getDictionary(locale),
    getArticleBySlug(slug, locale),
    getRelatedArticles(slug, locale, 3),
  ]);
  if (!article) notFound();

  const pMeta = dict.pages.news;

  const articleSchema = jsonLdGraph(
    buildNewsArticleSchema({
      locale,
      headline: article.title,
      description: article.excerpt,
      slug,
      imageUrl: article.coverImageUrl,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      authorName: article.authorName,
      categoryName: article.category,
    }),
    buildBreadcrumbSchema(locale, [
      { name: dict.nav.home, path: "" },
      { name: pMeta.title, path: "/news" },
      { name: article.title, path: `/news/${slug}` },
    ])
  );

  return (
    <>
      <JsonLd data={articleSchema} />
      <NewsArticleView
        locale={locale}
        article={article}
        related={related}
        labels={{
          back: dict.common.back,
          shareTitle: pMeta.shareTitle,
          relatedTitle: pMeta.relatedTitle,
          readMore: dict.common.readMore,
          by: pMeta.by,
        }}
      />
    </>
  );
}
