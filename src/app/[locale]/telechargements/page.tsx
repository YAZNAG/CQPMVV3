import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { getAllPublishedDocuments, getPublishedDocumentCategories } from "@/services/document.service";
import { DocumentsPublicPage } from "@/features/downloads/documents-public-page";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) return {};
  const locale = l as Locale;
  const dict = await getDictionary(locale);
  return buildMetadata({
    locale,
    title: locale === "ar" ? "فضاء التحميلات" : "Espace Téléchargements",
    description:
      locale === "ar"
        ? "تصفح وتحميل جميع الوثائق الرسمية للمركز"
        : "Consultez et téléchargez l'ensemble des documents officiels du centre",
    path: "/telechargements",
  });
}

export default async function DownloadsPublicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [documents, categories] = await Promise.all([
    getAllPublishedDocuments(locale),
    getPublishedDocumentCategories(locale),
  ]);

  return (
    <DocumentsPublicPage locale={locale} documents={documents} categories={categories} />
  );
}
