"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/public/container";
import { NewsHubHero } from "@/features/news/news-hub-hero";
import { NewsPremiumCard } from "@/features/news/news-premium-card";
import { NewsSubNav, type NewsSubNavLabels } from "@/features/news/news-sub-nav";
import type { PublicHomeEvent } from "@/services/home-engagement.service";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface AgendaSitePageProps {
  locale: Locale;
  events: PublicHomeEvent[];
  defaultLocation: string;
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    subNav: NewsSubNavLabels;
    upcomingTitle: string;
    emptyMessage: string;
    viewDetail: string;
    calendarMonth: string;
    calendarWeek: string;
    calendarList: string;
    allCategories: string;
    weekdays: string[];
  };
}

type CalendarView = "month" | "week" | "list";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayBasedWeekday(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function AgendaSitePage({
  locale,
  events,
  defaultLocation,
  labels,
}: AgendaSitePageProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState<CalendarView>("month");
  const isRtl = locale === "ar";

  const monthLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PublicHomeEvent[]>();
    for (const event of events) {
      if (!event.eventDate) continue;
      const d = new Date(event.eventDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const calendarCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = startOfMonth(cursor);
    const leading = getMondayBasedWeekday(first);
    const totalDays = daysInMonth(year, month);
    const cells: (Date | null)[] = [];

    for (let i = 0; i < leading; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return [...events]
      .filter((e) => e.eventDate && new Date(e.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime())
      .slice(0, 6);
  }, [events]);

  const prevMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <>
      <NewsHubHero
        title={labels.heroTitle}
        subtitle={labels.heroSubtitle}
        compact
        align="left"
      />

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container>
          <NewsSubNav locale={locale} active="agenda" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-slate-50/80 py-12 lg:py-16">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Previous month"
                >
                  <ChevronLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </button>
                <span className="min-w-[140px] text-center text-sm font-bold capitalize text-navy-900 md:text-base">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Next month"
                >
                  <ChevronRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                  {labels.allCategories}
                </span>
                <div className="flex rounded-lg border border-slate-200 p-0.5">
                  {(
                    [
                      ["month", labels.calendarMonth],
                      ["week", labels.calendarWeek],
                      ["list", labels.calendarList],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                        view === key
                          ? "bg-navy-900 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {view === "month" && (
              <>
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                  {labels.weekdays.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarCells.map((date, i) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${i}`}
                          className="min-h-[88px] border-b border-r border-slate-100 bg-slate-50/30 last:border-r-0"
                        />
                      );
                    }

                    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    const dayEvents = eventsByDay.get(key) ?? [];
                    const isToday =
                      date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={key}
                        className="min-h-[88px] border-b border-r border-slate-100 p-1.5 last:border-r-0"
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                            isToday ? "bg-navy-900 text-white" : "text-slate-700"
                          )}
                        >
                          {date.getDate()}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="truncate rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-800"
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {view !== "month" && (
              <div className="divide-y divide-slate-100">
                {events.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-slate-500">
                    {labels.emptyMessage}
                  </p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="px-6 py-4">
                      <p className="text-xs font-medium text-ocean-600">
                        {event.eventDate
                          ? new Intl.DateTimeFormat(
                              locale === "ar" ? "ar-MA" : "fr-FR",
                              { dateStyle: "full", timeStyle: "short" }
                            ).format(new Date(event.eventDate))
                          : "—"}
                      </p>
                      <p className="mt-1 font-bold text-navy-900">{event.title}</p>
                      {event.description && (
                        <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">
              {labels.upcomingTitle}
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">{labels.emptyMessage}</p>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <NewsPremiumCard
                    key={event.id}
                    locale={locale}
                    variant="event"
                    href={event.href ?? undefined}
                    eventDate={event.eventDate}
                    location={defaultLocation}
                    detailLabel={labels.viewDetail}
                    readMoreLabel={labels.viewDetail}
                    article={{
                      id: event.id,
                      slug: event.id,
                      title: event.title,
                      excerpt: event.description ?? "",
                      coverImageUrl: event.imageUrl,
                      category: locale === "ar" ? "فعالية" : "Événement",
                      categorySlug: "evenements",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
