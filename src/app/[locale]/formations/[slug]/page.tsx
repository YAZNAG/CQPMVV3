import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildCourseSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import { getFormationBySlug } from "@/services/formation.service";
import { resolveFormationImage } from "@/lib/site-images";
import { FormationDetailView } from "@/features/formations/formation-detail-view";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};
  const formation = await getFormationBySlug(slug, locale);
  return buildMetadata({
    locale,
    title: formation?.title ?? "Formation",
    description: formation?.description ?? "",
    path: `/formations/${slug}`,
    image: resolveFormationImage(formation?.imageUrl, slug),
  });
}

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const [dict, formation] = await Promise.all([
    getDictionary(locale),
    getFormationBySlug(slug, locale),
  ]);
  if (!formation) notFound();

  const coverImage = resolveFormationImage(formation.imageUrl, slug);
  const p = dict.pages.formations;

  const courseSchema = jsonLdGraph(
    buildCourseSchema({
      locale,
      name: formation.title,
      description: formation.description,
      slug,
      duration: formation.duration,
      imageUrl: coverImage,
    }),
    buildBreadcrumbSchema(locale, [
      { name: dict.nav.home, path: "" },
      { name: p.title, path: "/formations" },
      { name: formation.title, path: `/formations/${slug}` },
    ])
  );

  return (
    <>
      <JsonLd data={courseSchema} />
      <FormationDetailView
        locale={locale}
        coverImage={coverImage}
        formation={{
          title: formation.title,
          description: formation.description,
          objectives: formation.objectives,
          requirements: formation.requirements,
          duration: formation.duration,
          categoryName: formation.categoryName,
          categorySlug: formation.categorySlug,
        }}
        labels={{
          presentation:
            locale === "ar" ? "العرض والأهداف" : "Présentation & Objectifs",
          objectives: p.objectives,
          program: locale === "ar" ? "برنامج الدراسة" : "Programme d'Études",
          careers:
            locale === "ar" ? "آفاق مهنية" : "Débouchés Professionnels",
          requirements: p.requirements,
          documents: locale === "ar" ? "الوثائق المطلوبة" : "Pièces à fournir",
          register: dict.hero.ctaRegister,
          faq: "FAQ",
          openEnrollment:
            locale === "ar" ? "التسجيل مفتوح" : "Inscriptions Ouvertes",
        }}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${locale}` },
          { label: p.title, href: `/${locale}/formations` },
          {
            label: formation.categoryName,
            href: `/${locale}/formations?category=${formation.categorySlug}`,
          },
          { label: formation.title, href: `/${locale}/formations/${slug}` },
        ]}
        admissionHref={`/${locale}/inscription`}
        formationsHref={`/${locale}/formations`}
      />
    </>
  );
}
