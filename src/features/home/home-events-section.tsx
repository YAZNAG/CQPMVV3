"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import type { PublicHomeEvent } from "@/services/home-engagement.service";
import { cn } from "@/lib/utils";

interface HomeEventsSectionProps {
  title: string;
  emptyMessage: string;
  events: PublicHomeEvent[];
  locale: "fr" | "ar";
}

function formatEventDate(date: Date | null, locale: "fr" | "ar") {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function HomeEventsSection({
  title,
  emptyMessage,
  events,
  locale,
}: HomeEventsSectionProps) {
  return (
    <section className="overflow-hidden bg-slate-50/80 py-16 lg:py-20" id="events">
      <Container>
        <HomeScrollReveal index={0} locale={locale}>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {title}
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-ocean-500 to-amber-400" />
          </div>
        </HomeScrollReveal>

        {events.length === 0 ? (
          <HomeScrollReveal index={1} locale={locale}>
            <p className="mt-10 text-center text-sm text-slate-500">{emptyMessage}</p>
          </HomeScrollReveal>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => {
              const dateLabel = formatEventDate(event.eventDate, locale);
              const inner = (
                <article
                  className={cn(
                    "group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300",
                    event.href && "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
                    {event.imageUrl ? (
                      <CmsImage
                        src={event.imageUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-ocean-600 to-navy-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
                  </div>
                  <div className="p-5">
                    {dateLabel && (
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ocean-600">
                        <CalendarDays className="h-4 w-4" />
                        {dateLabel}
                      </p>
                    )}
                    <h3 className="mt-2 text-lg font-bold text-navy-900">{event.title}</h3>
                    {event.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {event.description}
                      </p>
                    )}
                  </div>
                </article>
              );

              return (
                <HomeScrollReveal key={event.id} index={i} locale={locale} item>
                  {event.href ? (
                    <Link href={event.href} className="block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </HomeScrollReveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
