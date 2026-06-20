"use client";

import Link from "next/link";
import {
  Award,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Handshake,
  MapPin,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { GsapParallax } from "@/components/motion/gsap-parallax";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { StatsSection } from "@/features/home/stats-section";
import { HomePartnersSection } from "@/features/home/home-partners-section";
import { NewsEventsSplitSection } from "@/features/home/news-events-split-section";
import { DownloadsSection } from "@/features/downloads/downloads-section";
import type { HomeNewsArticle } from "@/features/home/home-news-section";
import type { PublicHomeEvent } from "@/services/home-engagement.service";
import type { PublicDownloadsSection } from "@/services/download.service";
import type { PresentationPublicContent, PresentationDomain, PresentationGalleryPhoto } from "@/lib/presentation-content";
import { SITE_IMAGES } from "@/lib/site-images";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { PublicSiteStat } from "@/services/site-stat.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const MISSION_ICONS = [GraduationCap, Handshake, TrendingUp, Target] as const;
const WHY_ICONS = [Award, Users, Wrench, Sparkles, MapPin] as const;
const VALUE_ICONS = [Award, Shield, Sparkles, Users, Shield, Handshake] as const;

export type PresentationPageBreadcrumb = {
  label: string;
  href: string;
};

interface PresentationSitePageProps {
  locale: Locale;
  dict: Dictionary;
  content: PresentationPublicContent;
  heroImageUrl?: string | null;
  breadcrumbs: PresentationPageBreadcrumb[];
  stats: PublicSiteStat[];
  domains: PresentationDomain[];
  galleryPhotos: PresentationGalleryPhoto[];
  partners: { id: string; name: string; logoUrl: string; websiteUrl: string | null }[];
  newsArticles: HomeNewsArticle[];
  events: PublicHomeEvent[];
  eventsEmptyMessage: string;
  newsTitle: string;
  eventsTitle: string;
  viewAllNewsLabel: string;
  readArticleLabel: string;
  viewAllEventsLabel: string;
  downloadsSection: PublicDownloadsSection;
}

export function PresentationSitePage({
  locale,
  dict,
  content,
  heroImageUrl,
  breadcrumbs,
  stats,
  domains,
  galleryPhotos,
  partners,
  newsArticles,
  events,
  eventsEmptyMessage,
  newsTitle,
  eventsTitle,
  viewAllNewsLabel,
  readArticleLabel,
  viewAllEventsLabel,
  downloadsSection,
}: PresentationSitePageProps) {
  const isRtl = locale === "ar";
  const heroBg = heroImageUrl || SITE_IMAGES.about;
  const imageFrom = isRtl ? "right" : "left";
  const contentFrom = isRtl ? "left" : "right";

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[420px] overflow-hidden bg-navy-950 md:min-h-[480px]">
        <div className="absolute inset-0">
          <GsapParallax speed={0.1} className="absolute inset-0 h-[115%] w-full -top-[7%]">
            <CmsImage
              src={heroBg}
              alt=""
              fill
              priority
              className="object-cover opacity-40"
              sizes="100vw"
            />
          </GsapParallax>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/88 to-navy-900/70" />
          <div className="wave-pattern absolute inset-0 opacity-20" aria-hidden />
        </div>

        <Container className="relative flex min-h-[inherit] flex-col justify-center py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-navy-200/80 md:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 opacity-60", isRtl && "rotate-180")}
                      aria-hidden
                    />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-white">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:text-white">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <HomeScrollReveal from={contentFrom} locale={locale}>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-navy-100/90 sm:text-lg">
              {content.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="premium" size="lg" asChild>
                <Link href={`/${locale}/inscription`}>{content.ctaPrimaryLabel}</Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link href={`/${locale}/formations`}>{dict.hero.ctaFormations}</Link>
              </Button>
            </div>
          </HomeScrollReveal>
        </Container>
      </section>

      {/* About — Un Pilier de l'Économie Bleue */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="maritime-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
        <Container className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <HomeScrollReveal from={contentFrom} locale={locale} distance={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ocean-600">
                {content.aboutLabel}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                {content.aboutTitle}
              </h2>
              <div className="mt-6 space-y-4">
                {content.aboutParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed text-navy-600 sm:text-[1.05rem]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </HomeScrollReveal>

            <HomeScrollReveal from={imageFrom} locale={locale} distance={140} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-lg ring-1 ring-navy-900/10">
                <CmsImage
                  src={heroBg}
                  alt={content.aboutTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
              </div>
              <div
                className="pointer-events-none absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-full bg-ocean-400/20 blur-3xl lg:block"
                aria-hidden
              />
            </HomeScrollReveal>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <StatsSection dict={dict} items={stats} locale={locale} className="border-t-0 bg-navy-50/50" />

      {/* Missions */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <HomeScrollReveal index={0} locale={locale}>
            <SectionHeading title={content.missionsTitle} align="center" variant="featured" />
          </HomeScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-6">
            {content.missions.map((mission, index) => {
              const Icon = MISSION_ICONS[index] ?? Target;
              return (
                <HomeScrollReveal key={`${mission.title}-${index}`} index={index} locale={locale} item>
                  <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-navy-50/60 p-6 shadow-sm transition-shadow hover:shadow-premium">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-600">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="text-base font-bold leading-snug text-navy-900">{mission.title}</h3>
                    {mission.description ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">
                        {mission.description}
                      </p>
                    ) : null}
                  </article>
                </HomeScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Values — dark section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 py-16 lg:py-24">
        <div className="maritime-grid absolute inset-0 opacity-15" aria-hidden />
        <Container className="relative">
          <HomeScrollReveal index={0} locale={locale}>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {content.valuesTitle}
              </h2>
              <p className="mt-4 text-base text-navy-200/90 sm:text-lg">{content.valuesSubtitle}</p>
            </div>
          </HomeScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.values.map((value, index) => {
              const Icon = VALUE_ICONS[index] ?? Award;
              return (
                <HomeScrollReveal key={`${value.title}-${index}`} index={index} locale={locale} item>
                  <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean-500/20 text-sky-300">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-navy-200/85">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </HomeScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Why choose */}
      <section className="bg-gradient-to-b from-white to-navy-50/40 py-16 lg:py-24">
        <Container>
          <HomeScrollReveal index={0} locale={locale}>
            <SectionHeading title={content.whyChooseTitle} align="center" variant="featured" />
          </HomeScrollReveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.whyChoose.map((item, index) => {
              const Icon = WHY_ICONS[index] ?? Award;
              const isLastRowCenter =
                content.whyChoose.length === 5 && index >= 3;

              return (
                <HomeScrollReveal
                  key={item.title}
                  index={index}
                  locale={locale}
                  item
                  className={cn(
                    isLastRowCenter && index === 3 && "lg:col-start-2",
                    isLastRowCenter && index === 4 && "lg:col-start-3"
                  )}
                >
                  <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-premium ring-1 ring-navy-100/80">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-ocean-600">
                      <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                    </span>
                    <h3 className="text-lg font-bold text-navy-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-600">{item.description}</p>
                  </article>
                </HomeScrollReveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Formation domains */}
      {domains.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <Container>
            <HomeScrollReveal index={0} locale={locale}>
              <SectionHeading title={content.domainsTitle} align="center" variant="featured" />
            </HomeScrollReveal>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {domains.map((domain, index) => (
                <HomeScrollReveal key={domain.href} index={index} locale={locale} item>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-premium ring-1 ring-navy-100/80">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <CmsImage
                        src={domain.imageUrl}
                        alt={domain.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold text-navy-900">{domain.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">
                        {domain.description}
                      </p>
                      <Link
                        href={domain.href}
                        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ocean-600 transition-colors hover:text-ocean-700"
                      >
                        {content.readMoreLabel}
                        <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} aria-hidden />
                      </Link>
                    </div>
                  </article>
                </HomeScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Vie au Centre */}
      {galleryPhotos.length > 0 && (
        <section className="bg-navy-50/50 py-16 lg:py-24">
          <Container>
            <HomeScrollReveal index={0} locale={locale}>
              <SectionHeading title={content.lifeTitle} align="center" variant="featured" />
            </HomeScrollReveal>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {galleryPhotos.map((photo, index) => (
                <HomeScrollReveal key={photo.id} index={index} locale={locale} item>
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-xl shadow-md ring-1 ring-navy-100",
                      index === 0 && "col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[280px]",
                      index !== 0 && "aspect-square"
                    )}
                  >
                    <CmsImage
                      src={photo.imageUrl}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </HomeScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Espace Téléchargement — avant actualités pour visibilité */}
      <DownloadsSection
        locale={locale}
        title={downloadsSection.title}
        subtitle={downloadsSection.subtitle}
        items={downloadsSection.items}
        downloadLabel={dict.common.download}
        viewLabel={dict.common.viewDocument}
        isPublished={downloadsSection.isPublished}
      />

      {/* Actualités + Événements */}
      <NewsEventsSplitSection
        locale={locale}
        articles={newsArticles}
        events={events}
        eventsEmptyMessage={eventsEmptyMessage}
        newsTitle={newsTitle}
        eventsTitle={eventsTitle}
        viewAllNewsLabel={viewAllNewsLabel}
        readArticleLabel={readArticleLabel}
        viewAllEventsLabel={viewAllEventsLabel}
        newsLimit={2}
        eventsLimit={3}
      />

      {/* Partners */}
      {partners.length > 0 && (
        <HomePartnersSection
          locale={locale}
          title={content.partnersLabel}
          partners={partners}
        />
      )}

      {/* CTA Banner */}
      <section className="py-16 lg:py-20">
        <Container>
          <HomeScrollReveal index={0} locale={locale}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-ocean-900 px-8 py-14 shadow-premium-lg md:px-14 md:py-16">
              <CmsImage
                src={heroBg}
                alt=""
                fill
                className="object-cover opacity-15"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/85 to-ocean-900/80" />
              <div className="relative text-center">
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  {content.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 text-base text-navy-100/90 sm:text-lg">
                  {content.ctaSubtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button variant="premium" size="lg" asChild>
                    <Link href={`/${locale}/inscription`}>{content.ctaPrimaryLabel}</Link>
                  </Button>
                  <Button variant="glass" size="lg" asChild>
                    <Link href={`/${locale}/contact`}>{content.ctaSecondaryLabel}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </HomeScrollReveal>
        </Container>
      </section>
    </>
  );
}
