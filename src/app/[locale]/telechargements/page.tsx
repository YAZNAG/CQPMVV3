import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { buildPublicDownloadsSection } from "@/services/download.service";
import { CommuniquesSitePage } from "@/features/news/communiques-site-page";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};
  const dict = await getDictionary(locale);
  return buildMetadata({
    locale,
    title: dict.pages.communiques.title,
    description: dict.pages.communiques.subtitle,
    path: "/telechargements",
  });
}

export default async function DownloadsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, section] = await Promise.all([
    getDictionary(locale),
    buildPublicDownloadsSection(locale),
  ]);

  const cMeta = dict.pages.communiques;

  return (
    <CommuniquesSitePage
      locale={locale}
      items={section.items}
      isPublished={section.isPublished}
      labels={{
        heroTitle: cMeta.title,
        heroSubtitle: cMeta.subtitle,
        subNav: dict.pages.news.subNav,
        filterBy: cMeta.filterBy,
        all: cMeta.all,
        noteService: cMeta.noteService,
        inscriptions: cMeta.inscriptions,
        exams: cMeta.exams,
        year: cMeta.year,
        downloadPdf: cMeta.downloadPdf,
        reference: cMeta.reference,
        empty: cMeta.empty,
      }}
    />
  );
}
