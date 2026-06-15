import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, getPageMeta } from "@/lib/seo";
import { getPublishedFormations } from "@/services/formation.service";
import { getSiteSettings } from "@/services/site-settings.service";
import {
  DEFAULT_ADMISSION_FORM_FIELDS,
  getFormationDocumentsMap,
  getPublishedAdmissionFormFields,
} from "@/services/admission-form.service";
import { AdmissionTabs } from "@/features/admission/admission-tabs";
import { PageHero } from "@/components/public/page-hero";
import { Container } from "@/components/public/container";
import type { Locale } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = l as Locale;
  return buildPageMetadata(locale, getPageMeta(locale, "admission"), "/admission");
}

export default async function AdmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale: l } = await params;
  const { tab } = await searchParams;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const [dict, categories, fields, documentsByFormation, settings] = await Promise.all([
    getDictionary(locale),
    getPublishedFormations(locale),
    getPublishedAdmissionFormFields(),
    getFormationDocumentsMap(),
    getSiteSettings(),
  ]);
  const formFields =
    fields.length > 0
      ? fields
      : DEFAULT_ADMISSION_FORM_FIELDS.map((f, i) => ({ ...f, id: `default-${i}` }));
  const initialTab = tab === "track" ? "track" : "register";

  return (
    <>
      <PageHero
        title={dict.pages.admission.title}
        subtitle={dict.pages.admission.subtitle}
        compact
        className="admission-print-hide"
      />
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50/80 py-12 lg:py-16 print:bg-white print:py-0">
        <Container className="print:px-0">
          <AdmissionTabs
            dict={dict}
            locale={locale}
            categories={categories}
            fields={formFields}
            documentsByFormation={documentsByFormation}
            initialTab={initialTab}
            siteName={locale === "ar" ? settings.siteNameAr : settings.siteNameFr}
            siteAddress={locale === "ar" ? settings.addressAr : settings.addressFr}
            sitePhone={settings.phone}
            siteEmail={settings.email}
          />
        </Container>
      </section>
    </>
  );
}
