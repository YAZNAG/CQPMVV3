import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildPageMetadata, getPageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildContactPageSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import { ContactSitePage } from "@/features/contact/contact-site-page";
import {
  getPublishedContactFormFields,
  DEFAULT_CONTACT_FORM_FIELDS,
} from "@/services/contact-form.service";
import {
  getPublishedSocialLinks,
  toPublicSocialLinks,
} from "@/services/site-social-link.service";
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
  return buildPageMetadata(locale, getPageMeta(locale, "contact"), "/contact");
}

function buildMapUrls(address: string) {
  const query = encodeURIComponent(address || "CQPM Nador Bni Nsser");
  return {
    external: `https://www.google.com/maps/search/?api=1&query=${query}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [dict, settings, fields, socialRecords] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
    getPublishedContactFormFields(),
    getPublishedSocialLinks(),
  ]);

  const p = dict.pages.contact;
  const address = getLocalized(
    locale,
    settings.addressFr ?? "",
    settings.addressAr ?? ""
  );
  const hours = getLocalized(
    locale,
    settings.contactHoursFr ?? p.hours,
    settings.contactHoursAr ?? p.hours
  );
  const mapUrl =
    settings.contactMapUrl ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    null;
  const mapUrls = buildMapUrls(address);

  const formFields =
    fields.length > 0
      ? fields
      : DEFAULT_CONTACT_FORM_FIELDS.map((f, i) => ({ ...f, id: `default-${i}` }));

  const socialLinks = toPublicSocialLinks(socialRecords, locale);

  const schema = jsonLdGraph(
    buildContactPageSchema(locale),
    buildBreadcrumbSchema(locale, [
      { name: dict.nav.home, path: "" },
      { name: p.title, path: "/contact" },
    ])
  );

  return (
    <>
      <JsonLd data={schema} />
      <ContactSitePage
        locale={locale}
        fields={formFields}
        address={address}
        phone={settings.phone}
        email={settings.email}
        hours={hours}
        mapUrl={mapUrl}
        mapDirectionsUrl={mapUrls.directions}
        mapExternalUrl={mapUrls.external}
        socialLinks={socialLinks}
        labels={{
          heroTitle: p.heroTitle,
          heroTitleAr: p.heroTitleAr,
          heroSubtitle: p.heroSubtitle,
          subNav: p.subNav,
          cards: p.cards,
          phoneHint: p.phoneHint,
          formTitle: p.formTitle,
          formSubtitle: p.formSubtitle,
          directions: p.directions,
          openMaps: p.openMaps,
          gpsLabel: p.gpsLabel,
          socialTitle: p.socialTitle,
          faqTitle: p.faqTitle,
          faq: p.faq,
          ctaTitle: p.ctaTitle,
          ctaSubtitle: p.ctaSubtitle,
          ctaFormations: p.ctaFormations,
          ctaRegister: p.ctaRegister,
          formLabels: {
            success: dict.contact.success,
            error: dict.common.error,
            loading: dict.common.loading,
            send: dict.contact.send,
          },
        }}
      />
    </>
  );
}
