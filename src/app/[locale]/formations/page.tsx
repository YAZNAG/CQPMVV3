import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, getPageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildWebPageSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import { getPublishedFormations } from "@/services/formation.service";
import { FormationsCatalog } from "@/features/formations/formations-catalog";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  return buildPageMetadata(locale, getPageMeta(locale, "formations"), "/formations");
}

export default async function FormationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: l } = await params;
  const { category } = await searchParams;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const [dict, categories] = await Promise.all([
    getDictionary(locale),
    getPublishedFormations(locale),
  ]);

  const p = dict.pages.formations;
  const meta = getPageMeta(locale, "formations");
  const breadcrumbs = buildBreadcrumbSchema(locale, [
    { name: dict.nav.home, path: "" },
    { name: p.title, path: "/formations" },
  ]);

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          buildWebPageSchema({
            locale,
            name: meta.title,
            description: meta.description,
            path: "/formations",
          }),
          breadcrumbs
        )}
      />
      <FormationsCatalog
        locale={locale}
        categories={categories}
        activeCategory={category}
        heroTitle={locale === "ar" ? "تكويناتنا" : "Nos Formations"}
        heroSubtitle={locale === "ar" ? "تكويناتنا" : p.title}
        heroDescription={p.subtitle}
        ctaLabel={dict.common.readMore}
        discoverLabel={locale === "ar" ? "اكتشف" : "Découvrir"}
        allFormationsLabel={p.all}
      />
    </>
  );
}
