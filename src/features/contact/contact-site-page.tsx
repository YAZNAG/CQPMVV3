import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { Container } from "@/components/public/container";
import { ContactFaqSection } from "@/features/contact/contact-faq-section";
import { ContactSubNav } from "@/features/contact/contact-sub-nav";
import { DynamicContactForm } from "@/features/contact/dynamic-contact-form";
import { SOCIAL_PLATFORM_ICONS, socialPlatformLabel } from "@/lib/site-icons";
import { SITE_IMAGES } from "@/lib/site-images";
import { cn } from "@/lib/utils";
import type { ContactFormFieldRecord } from "@/services/contact-form.service";
import type { PublicSocialLink } from "@/services/site-social-link.service";
import type { Locale } from "@/types";

interface ContactSitePageProps {
  locale: Locale;
  fields: ContactFormFieldRecord[];
  address: string;
  phone: string | null;
  email: string | null;
  hours: string;
  mapUrl: string | null;
  mapDirectionsUrl: string;
  mapExternalUrl: string;
  socialLinks: PublicSocialLink[];
  labels: {
    heroTitle: string;
    heroTitleAr: string;
    heroSubtitle: string;
    subNav: { contact: string; reclamation: string };
    cards: { address: string; phone: string; email: string; hours: string };
    phoneHint: string;
    formTitle: string;
    formSubtitle: string;
    directions: string;
    openMaps: string;
    gpsLabel: string;
    socialTitle: string;
    faqTitle: string;
    faq: { question: string; answer: string }[];
    ctaTitle: string;
    ctaSubtitle: string;
    ctaFormations: string;
    ctaRegister: string;
    formLabels: {
      success: string;
      error: string;
      loading: string;
      send: string;
    };
  };
}

export function ContactSitePage({
  locale,
  fields,
  address,
  phone,
  email,
  hours,
  mapUrl,
  mapDirectionsUrl,
  mapExternalUrl,
  socialLinks,
  labels,
}: ContactSitePageProps) {
  const infoCards = [
    address && {
      icon: MapPin,
      title: labels.cards.address,
      lines: [address],
      href: mapExternalUrl,
    },
    phone && {
      icon: Phone,
      title: labels.cards.phone,
      lines: [phone, labels.phoneHint],
      href: `tel:${phone}`,
    },
    email && {
      icon: Mail,
      title: labels.cards.email,
      lines: [email],
      href: `mailto:${email}`,
    },
    hours && {
      icon: Clock,
      title: labels.cards.hours,
      lines: [hours],
      href: null,
    },
  ].filter(Boolean) as {
    icon: typeof MapPin;
    title: string;
    lines: string[];
    href: string | null;
  }[];

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${SITE_IMAGES.about})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-950/75" aria-hidden />
        <Container className="relative py-16 text-center md:py-20">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {labels.heroTitle}{" "}
            <span className="text-navy-300">| {labels.heroTitleAr}</span>
          </h1>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-100/90 sm:text-base">
            {labels.heroSubtitle}
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container>
          <ContactSubNav locale={locale} active="contact" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-slate-50/80 py-10 lg:py-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ocean-50 text-ocean-600">
                  <card.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-sm font-bold text-navy-900">{card.title}</h2>
                <div className="mt-2 space-y-1 text-sm text-slate-500">
                  {card.lines.map((line) =>
                    card.href && line === card.lines[0] ? (
                      <a
                        key={line}
                        href={card.href}
                        className="block hover:text-ocean-600"
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={line}>{line}</p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50/80 pb-16 lg:pb-20">
        <Container>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy-900 sm:text-2xl">{labels.formTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">{labels.formSubtitle}</p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
            <DynamicContactForm
              fields={fields}
              locale={locale}
              labels={labels.formLabels}
              variant="premium"
            />

            <aside className="flex h-full min-h-0 flex-col gap-6">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {mapUrl ? (
                  <iframe
                    title="Carte CQPM Nador"
                    src={mapUrl}
                    className="min-h-[220px] w-full flex-1 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div
                    className="min-h-[220px] flex-1 bg-cover bg-center"
                    style={{ backgroundImage: `url(${SITE_IMAGES.about})` }}
                  />
                )}
                <div className="shrink-0 space-y-3 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {labels.gpsLabel}
                  </p>
                  {address && <p className="text-sm text-slate-600">{address}</p>}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-700"
                    >
                      <Navigation className="h-4 w-4" />
                      {labels.directions}
                    </a>
                    <a
                      href={mapExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {labels.openMaps}
                    </a>
                  </div>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="shrink-0 rounded-2xl bg-navy-950 p-6 text-white shadow-lg">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-navy-200">
                    {labels.socialTitle}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {socialLinks.map((link) => {
                      const Icon = SOCIAL_PLATFORM_ICONS[link.platform];
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-ocean-600"
                          aria-label={link.label ?? socialPlatformLabel(link.platform)}
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <ContactFaqSection title={labels.faqTitle} items={labels.faq} />

      <section className="bg-slate-50/80 py-16 lg:py-20">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-navy-950 px-6 py-12 text-center shadow-xl sm:px-10 sm:py-14">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {labels.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-100/85 sm:text-base">
              {labels.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${locale}/formations`}
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {labels.ctaFormations}
              </Link>
              <Link
                href={`/${locale}/admission`}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors",
                  "bg-[#E85D2A] hover:bg-[#d4521f]"
                )}
              >
                {labels.ctaRegister}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
