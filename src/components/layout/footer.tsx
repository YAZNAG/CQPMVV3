import { HashLink } from "@/components/layout/hash-link";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/public/container";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SOCIAL_PLATFORM_ICONS, socialPlatformLabel } from "@/lib/site-icons";
import type { PublicNavItem } from "@/services/navigation.service";
import type { PublicSocialLink } from "@/services/site-social-link.service";
import type { Locale } from "@/types";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
  /** undefined = use built-in default links (first install only) */
  navItems?: PublicNavItem[];
  settings: {
    siteNameFr: string;
    siteNameAr: string;
    taglineFr: string;
    taglineAr: string;
    logoUrl?: string | null;
    email: string | null;
    phone: string | null;
    addressFr: string | null;
    addressAr: string | null;
  };
  socialLinks?: PublicSocialLink[];
}

export function Footer({ locale, dict, navItems, settings, socialLinks = [] }: FooterProps) {
  const isAr = locale === "ar";
  const siteName = isAr ? settings.siteNameAr : settings.siteNameFr;
  const tagline = isAr ? settings.taglineAr : settings.taglineFr;
  const address = isAr ? settings.addressAr : settings.addressFr;
  const year = new Date().getFullYear();

  const links =
    navItems !== undefined
      ? navItems.flatMap((item) =>
          item.children?.length
            ? item.children.map((child) => ({ href: child.href, label: child.label }))
            : [{ href: item.href, label: item.label }]
        )
      : [
          { href: `/${locale}#about`, label: dict.nav.about },
          { href: `/${locale}/formations`, label: dict.nav.formations },
          { href: `/${locale}/admission`, label: dict.nav.admission },
          { href: `/${locale}/news`, label: dict.nav.news },
          { href: `/${locale}/contact`, label: dict.nav.contact },
        ];

  return (
    <footer id="site-footer" className="w-full border-t border-navy-800/20 bg-navy-900 text-navy-100">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <SiteBrandLogo logoUrl={settings.logoUrl} size="lg" variant="dark" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-white">{siteName}</p>
                <p className="text-sm text-navy-300">{tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-300">
              {dict.footer.description}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_PLATFORM_ICONS[link.platform];
                  const ariaLabel =
                    link.label ?? socialPlatformLabel(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-navy-800 p-2.5 text-navy-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-600 hover:text-white hover:shadow-lg hover:shadow-ocean-900/30"
                      aria-label={ariaLabel}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {dict.footer.quickLinks}
            </h3>
            <ul className="mt-4 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <HashLink
                    href={link.href}
                    className="text-sm text-navy-300 transition-colors hover:text-ocean-400"
                  >
                    {link.label}
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {dict.sections.contact}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {address && (
                <li className="flex gap-2 text-navy-300">
                  <MapPin className="h-4 w-4 shrink-0 text-ocean-400" />
                  <span>{address}</span>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex gap-2 text-navy-300 hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-ocean-400" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex gap-2 text-navy-300 hover:text-white"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-ocean-400" />
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-800 pt-8 text-center text-sm text-navy-400">
          © {year} CQPM Nador. {dict.footer.rights}
        </div>
      </Container>
    </footer>
  );
}
