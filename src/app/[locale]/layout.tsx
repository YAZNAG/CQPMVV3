import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { isValidLocale, getDirection } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSiteSettings } from "@/services/site-settings.service";
import {
  getPublishedSocialLinks,
  toPublicSocialLinks,
} from "@/services/site-social-link.service";
import {
  getPublishedNavigation,
  getPublishedHeaderButtons,
  hasNavigationBeenConfigured,
  toPublicNavTree,
  toPublicNavButtons,
  enrichFormationNavItems,
  getHeaderNavItems,
} from "@/services/navigation.service";
import { MotionShell } from "@/components/layout/motion-shell";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HashScrollHandler } from "@/components/layout/hash-scroll-handler";
import { LocaleHtmlAttributes } from "@/components/layout/locale-html-attributes";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPageMeta } from "@/lib/seo/meta-pages";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import type { Locale } from "@/types";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: l } = await params;
  if (!isValidLocale(l)) return {};
  const locale = l as Locale;
  const settings = await getSiteSettings();
  const meta = getPageMeta(locale, "home");
  return buildPageMetadata(
    locale,
    {
      title: meta.title,
      description:
        locale === "ar"
          ? settings.taglineAr || meta.description
          : settings.taglineFr || meta.description,
      keywords: meta.keywords,
    },
    ""
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const [dict, settings, footerNav, headerButtons, navConfigured, socialLinks] =
    await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
    getPublishedNavigation("FOOTER"),
    getPublishedHeaderButtons(),
    hasNavigationBeenConfigured(),
    getPublishedSocialLinks(),
  ]);

  const headerNavItems = await getHeaderNavItems(locale, dict);

  const publicSocialLinks = toPublicSocialLinks(socialLinks, locale);

  const rawFooterNavItems =
    footerNav.length > 0
      ? toPublicNavTree(footerNav, locale)
      : navConfigured
        ? []
        : undefined;

  const footerNavItems =
    rawFooterNavItems !== undefined
      ? await enrichFormationNavItems(rawFooterNavItems, locale)
      : undefined;

  const headerCtaButtons =
    headerButtons.length > 0
      ? toPublicNavButtons(headerButtons, locale)
      : navConfigured
        ? []
        : undefined;

  const globalSchema = jsonLdGraph(
    buildOrganizationSchema(
      settings,
      locale,
      publicSocialLinks.map((link) => link.url)
    ),
    buildWebSiteSchema(locale)
  );

  const direction = getDirection(locale);

  return (
    <div
      className={`min-h-screen w-full overflow-x-clip ${inter.variable} ${plusJakarta.variable} ${notoArabic.variable} ${locale === "ar" ? "font-[family-name:var(--font-arabic)]" : "font-sans"}`}
      dir={direction}
    >
      <LocaleHtmlAttributes locale={locale} dir={direction} />
      <JsonLd data={globalSchema} />
      <HashScrollHandler />
      <Header
        locale={locale}
        dict={dict}
        siteNameFr={settings.siteNameFr}
        siteNameAr={settings.siteNameAr}
        logoUrl={settings.logoUrl}
        phone={settings.phone}
        email={settings.email}
        addressFr={settings.addressFr}
        addressAr={settings.addressAr}
        navItems={headerNavItems}
        ctaButtons={headerCtaButtons}
      />
      <main id="main-content" className="w-full overflow-x-clip">
        <MotionShell>{children}</MotionShell>
      </main>
      <Footer
        locale={locale}
        dict={dict}
        navItems={footerNavItems}
        settings={settings}
        socialLinks={publicSocialLinks}
      />
      <Toaster richColors position="top-center" />
    </div>
  );
}
