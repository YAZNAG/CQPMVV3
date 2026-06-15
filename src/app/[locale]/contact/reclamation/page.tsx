import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { ReclamationSitePage } from "@/features/contact/reclamation-site-page";
import { getSiteSettings } from "@/services/site-settings.service";
import { getLocalized } from "@/types";
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
  const r = dict.pages.reclamation;
  return buildMetadata({
    locale,
    title: r.heroTitle,
    description: r.heroSubtitle,
    path: "/contact/reclamation",
  });
}

export default async function ReclamationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, settings] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
  ]);

  const p = dict.pages;
  const r = p.reclamation;
  const contact = p.contact;

  return (
    <ReclamationSitePage
      locale={locale}
      contactInfo={{
        phone: settings.phone,
        email: settings.email,
        hours: getLocalized(
          locale,
          settings.contactHoursFr ?? contact.hours,
          settings.contactHoursAr ?? contact.hours
        ),
        address: getLocalized(
          locale,
          settings.addressFr ?? "",
          settings.addressAr ?? ""
        ),
      }}
      labels={{
        heroTitle: r.heroTitle,
        heroTitleAr: r.heroTitleAr,
        heroSubtitle: r.heroSubtitle,
        subNav: contact.subNav,
        procedureTitle: r.procedureTitle,
        steps: r.steps,
        formTitle: r.formTitle,
        formSubtitle: r.formSubtitle,
        fields: r.fields,
        types: r.types,
        submit: r.submit,
        success: r.success,
        successHint: r.successHint,
        referenceLabel: r.referenceLabel,
        trackTitle: r.trackTitle,
        trackReference: r.trackReference,
        trackEmail: r.trackEmail,
        trackSubmit: r.trackSubmit,
        trackResult: r.trackResult,
        infoTitle: r.infoTitle,
        infoItems: r.infoItems,
        quickContactTitle: r.quickContactTitle,
        bottomTitle: r.bottomTitle,
        bottomSubtitle: r.bottomSubtitle,
        bottomContact: r.bottomContact,
        bottomFormations: r.bottomFormations,
        loading: dict.common.loading,
        error: dict.common.error,
      }}
    />
  );
}
