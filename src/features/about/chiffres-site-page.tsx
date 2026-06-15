"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/components/public/container";
import { Button } from "@/components/ui/button";
import { SITE_STAT_ICONS } from "@/lib/site-icons";
import { SITE_IMAGES } from "@/lib/site-images";
import type { PublicChiffresPage } from "@/services/chiffres.service";
import type { ChiffresInfraStyle } from "@prisma/client";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export type ChiffresBreadcrumb = { label: string; href: string };

const INFRA_STYLES: Record<
  ChiffresInfraStyle,
  { card: string; icon: string; text: string }
> = {
  NAVY: {
    card: "bg-[#0a2d52] text-white",
    icon: "text-sky-200",
    text: "text-white",
  },
  GREY: {
    card: "bg-slate-100 text-slate-800 border border-slate-200",
    icon: "text-slate-600",
    text: "text-slate-800",
  },
  OCEAN: {
    card: "bg-ocean-500 text-white",
    icon: "text-sky-100",
    text: "text-white",
  },
  LIGHT: {
    card: "bg-slate-50 text-slate-800 border border-slate-200",
    icon: "text-ocean-600",
    text: "text-slate-800",
  },
};

interface ChiffresSitePageProps {
  locale: Locale;
  page: PublicChiffresPage;
  breadcrumbs: ChiffresBreadcrumb[];
}

export function ChiffresSitePage({ locale, page, breadcrumbs }: ChiffresSitePageProps) {
  const isRtl = locale === "ar";
  const heroBg = page.heroBackgroundUrl || SITE_IMAGES.about;
  const maxBar = Math.max(...page.growthBars.map((b) => b.value), 1);

  const localeHref = (href: string) =>
    href.startsWith("/") ? `/${locale}${href}` : href;

  return (
    <article>
      <section className="relative min-h-[320px] overflow-hidden bg-navy-950 md:min-h-[380px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-950/75" aria-hidden />
        <div className="wave-pattern absolute inset-0 opacity-20" aria-hidden />

        <Container className="relative flex min-h-[320px] flex-col justify-center py-14 md:min-h-[380px] md:py-16">
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

          <div className="w-full">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              {page.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-navy-100/90 md:text-lg">
              {page.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {page.highlights.length > 0 && (
        <section className="bg-slate-50 py-12 md:py-16">
          <Container>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.highlights.map((item) => {
                const Icon = SITE_STAT_ICONS[item.icon];
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center rounded-xl border border-slate-200/80 bg-white px-6 py-8 text-center shadow-[0_2px_12px_rgba(15,23,42,0.06)]"
                  >
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-ocean-600">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <p className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                      {item.displayValue}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {(page.growthBars.length > 0 || page.successRateValue > 0) && (
        <section className="bg-white py-14 md:py-18">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                {page.evolutionTitle}
              </h2>
              <p className="mx-auto mt-3 text-sm text-slate-600 md:text-base">
                {page.evolutionSubtitle}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-navy-900">{page.growthChartTitle}</h3>
                  <BarChart3 className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </div>
                <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
                  {page.growthBars.map((bar, index) => {
                    const height = Math.max(12, (bar.value / maxBar) * 100);
                    const shade =
                      index === page.growthBars.length - 1
                        ? "bg-[#0a2d52]"
                        : index >= page.growthBars.length - 2
                          ? "bg-ocean-600"
                          : "bg-slate-300";
                    return (
                      <div key={bar.id} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={cn("w-full max-w-[3.5rem] rounded-t-md transition-all", shade)}
                          style={{ height: `${height}%` }}
                          aria-hidden
                        />
                        <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
                <div className="mb-6 flex w-full items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-navy-900">{page.successChartTitle}</h3>
                  <TrendingUp className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </div>
                <p className="font-display text-6xl font-bold text-ocean-500 sm:text-7xl">
                  {page.successRateValue}%
                </p>
                <p className="mt-3 text-sm text-slate-500">{page.successRateLabel}</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {(page.formationItems.length > 0 || page.infrastructureItems.length > 0) && (
        <section className="bg-slate-50 py-14 md:py-16">
          <Container>
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {page.capacityTitle}
            </h2>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {page.formationItems.length > 0 && (
                <div>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-ocean-600">
                    {page.formationColumnTitle}
                  </h3>
                  <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                    {page.formationItems.map((item) => {
                      const Icon = SITE_STAT_ICONS[item.icon];
                      return (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-ocean-600" strokeWidth={1.75} />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold text-navy-900">{item.valueText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {page.infrastructureItems.length > 0 && (
                <div>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-ocean-600">
                    {page.infrastructureColumnTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {page.infrastructureItems.map((item) => {
                      const Icon = SITE_STAT_ICONS[item.icon];
                      const style = INFRA_STYLES[item.style];
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-xl px-4 py-8 text-center shadow-sm",
                            style.card
                          )}
                        >
                          <Icon className={cn("mb-3 h-6 w-6", style.icon)} strokeWidth={1.75} />
                          <p className={cn("text-2xl font-bold", style.text)}>{item.valueText}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-90",
                              style.text
                            )}
                          >
                            {item.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      <section className="relative overflow-hidden bg-navy-950 py-14 md:py-16">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,116,144,0.25),transparent_70%)]"
          aria-hidden
        />
        <Container className="relative text-center">
          <Building2 className="mx-auto mb-4 h-8 w-8 text-ocean-400 opacity-80" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{page.ctaTitle}</h2>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-100/85 md:text-base">
            {page.ctaText}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={localeHref(page.ctaPrimaryHref)}>{page.ctaPrimaryLabel}</Link>
            </Button>
            <Button asChild variant="secondary" className="bg-sky-100 text-navy-900 hover:bg-white">
              <Link href={localeHref(page.ctaSecondaryHref)}>{page.ctaSecondaryLabel}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </article>
  );
}
