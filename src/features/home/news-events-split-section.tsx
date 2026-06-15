"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import type { HomeNewsArticle } from "@/features/home/home-news-section";
import type { PublicHomeEvent } from "@/services/home-engagement.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

interface NewsEventsSplitSectionProps {
  locale: Locale;
  articles: HomeNewsArticle[];
  events: PublicHomeEvent[];
  eventsEmptyMessage: string;
  newsTitle: string;
  eventsTitle: string;
  viewAllNewsLabel: string;
  readArticleLabel: string;
  viewAllEventsLabel: string;
  newsLimit?: number;
  eventsLimit?: number;
}

function formatNewsDate(date: Date | null | undefined, locale: Locale) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date(date))
    .replace(/\./g, "")
    .toUpperCase();
}

function formatEventDayMonth(date: Date | null, locale: Locale) {
  if (!date) return { day: "—", month: "" };
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
  })
    .format(d)
    .replace(/\./g, "")
    .toUpperCase();
  return { day, month };
}

function formatEventTime(date: Date | null, locale: Locale) {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function CompactNewsCard({
  article,
  locale,
  readArticleLabel,
}: {
  article: HomeNewsArticle;
  locale: Locale;
  readArticleLabel: string;
}) {
  const isRtl = locale === "ar";
  const dateLabel = formatNewsDate(article.publishedAt, locale);

  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group block rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:p-5"
    >
      <div className="flex gap-4 sm:gap-5">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-navy-100 sm:h-28 sm:w-32">
          {article.coverImageUrl ? (
            <CmsImage
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="128px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-800 to-ocean-700 text-xs font-bold text-white/50">
              CQPM
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {dateLabel && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ocean-500">
              {dateLabel}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-ocean-700 sm:text-lg">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
              {article.excerpt}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-navy-900 transition-colors group-hover:text-ocean-600">
            {readArticleLabel}
            <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventAgendaItem({
  event,
  locale,
  isLast,
}: {
  event: PublicHomeEvent;
  locale: Locale;
  isLast: boolean;
}) {
  const { day, month } = formatEventDayMonth(event.eventDate, locale);
  const timeLabel = formatEventTime(event.eventDate, locale);

  const content = (
    <div
      className={cn(
        "flex gap-4 py-5 first:pt-0 last:pb-0",
        !isLast && "border-b border-white/10"
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-center pt-0.5">
        <span className="font-display text-3xl font-bold leading-none text-white">{day}</span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-sky-400">
          {month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-white sm:text-lg">{event.title}</h3>
        {event.description && (
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-slate-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <span>{event.description}</span>
          </p>
        )}
        {timeLabel && (
          <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            <span>{timeLabel}</span>
          </p>
        )}
      </div>
    </div>
  );

  if (event.href) {
    return (
      <Link href={event.href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

export function NewsEventsSplitSection({
  locale,
  articles,
  events,
  eventsEmptyMessage,
  newsTitle,
  eventsTitle,
  viewAllNewsLabel,
  readArticleLabel,
  viewAllEventsLabel,
  newsLimit = 2,
  eventsLimit = 3,
}: NewsEventsSplitSectionProps) {
  const isRtl = locale === "ar";
  const newsItems = articles.slice(0, newsLimit);
  const eventItems = [...events]
    .sort((a, b) => {
      const ta = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const tb = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return tb - ta;
    })
    .slice(0, eventsLimit);

  if (newsItems.length === 0 && eventItems.length === 0) return null;

  return (
    <section className="bg-slate-100/80 py-16 lg:py-20" id="news-events">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Actualités */}
          {newsItems.length > 0 && (
            <HomeScrollReveal from={isRtl ? "right" : "left"} locale={locale}>
              <div>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                    {newsTitle}
                  </h2>
                  <Link
                    href={`/${locale}/news`}
                    className="shrink-0 text-sm font-semibold text-ocean-600 transition-colors hover:text-ocean-700"
                  >
                    {viewAllNewsLabel}
                  </Link>
                </div>

                <div className="space-y-4">
                  {newsItems.map((article, index) => (
                    <HomeScrollReveal key={article.id} index={index} locale={locale} item>
                      <CompactNewsCard
                        article={article}
                        locale={locale}
                        readArticleLabel={readArticleLabel}
                      />
                    </HomeScrollReveal>
                  ))}
                </div>
              </div>
            </HomeScrollReveal>
          )}

          {/* Événements */}
          <HomeScrollReveal from={isRtl ? "left" : "right"} locale={locale}>
            <div>
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                {eventsTitle}
              </h2>

              <div className="rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 px-5 py-6 shadow-premium-lg sm:px-7 sm:py-7">
                {eventItems.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">{eventsEmptyMessage}</p>
                ) : (
                  <>
                    {eventItems.map((event, index) => (
                      <HomeScrollReveal key={event.id} index={index} locale={locale} item>
                        <EventAgendaItem
                          event={event}
                          locale={locale}
                          isLast={index === eventItems.length - 1}
                        />
                      </HomeScrollReveal>
                    ))}

                    <div className="mt-6 border-t border-white/10 pt-6 text-center">
                      <Link
                        href={`/${locale}/events`}
                        className="inline-flex items-center justify-center rounded-lg border border-white/25 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                      >
                        {viewAllEventsLabel}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </HomeScrollReveal>
        </div>
      </Container>
    </section>
  );
}
