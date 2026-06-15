import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbSchema, jsonLdGraph } from "@/lib/seo/structured-data";
import {
  buildPublicDownloadsSection,
  getDownloadResourceBySlug,
  getDownloadResourceBySlugForMetadata,
} from "@/services/download.service";
import { DownloadsSection, DownloadDetailActions } from "@/features/downloads/downloads-section";
import { Container } from "@/components/public/container";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};

  const page = await getDownloadResourceBySlugForMetadata(slug, locale);
  if (!page) return { title: "Document" };

  return buildMetadata({
    locale,
    title: page.title,
    description: page.excerpt ?? page.title,
    path: `/telechargements/${slug}`,
    modifiedTime: page.updatedAt,
  });
}

export default async function DownloadResourcePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, item] = await Promise.all([
    getDictionary(locale),
    getDownloadResourceBySlug(slug, locale),
  ]);

  if (!item) notFound();

  const isRtl = locale === "ar";
  const pageTitle = item.title;

  const schema = jsonLdGraph(
    buildBreadcrumbSchema(locale, [
      { name: dict.nav.home, path: "" },
      {
        name: locale === "ar" ? "التحميلات" : "Téléchargements",
        path: "/telechargements",
      },
      { name: pageTitle, path: `/telechargements/${slug}` },
    ])
  );

  return (
    <article>
      <JsonLd data={schema} />

      <section className="border-b border-navy-100 bg-navy-50/40 py-10">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-navy-500 md:text-sm">
              <li>
                <Link href={`/${locale}`} className="hover:text-navy-900">
                  {dict.nav.home}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className={cn("h-3.5 w-3.5", isRtl && "rotate-180")} aria-hidden />
                <Link href={`/${locale}/telechargements`} className="hover:text-navy-900">
                  {locale === "ar" ? "التحميلات" : "Téléchargements"}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className={cn("h-3.5 w-3.5", isRtl && "rotate-180")} aria-hidden />
                <span className="font-medium text-navy-900">{pageTitle}</span>
              </li>
            </ol>
          </nav>

          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {pageTitle}
          </h1>
          {item.infoLabel && <p className="mt-3 text-sm text-slate-500">{item.infoLabel}</p>}
          {item.excerpt && (
            <p className="mt-2 text-base leading-relaxed text-slate-600">{item.excerpt}</p>
          )}

          <div className="mt-6">
            <DownloadDetailActions
              locale={locale}
              item={item}
              downloadLabel={dict.common.download}
              viewLabel={dict.common.viewDocument}
            />
          </div>
        </Container>
      </section>

      <Container className="py-14 lg:py-16">
        <div
          className="prose prose-navy max-w-none prose-headings:text-navy-900 prose-a:text-ocean-600"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </Container>
    </article>
  );
}
