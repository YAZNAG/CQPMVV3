"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Tag } from "lucide-react";
import { Container } from "@/components/public/container";
import { NewsHubHero } from "@/features/news/news-hub-hero";
import { NewsSubNav, type NewsSubNavLabels } from "@/features/news/news-sub-nav";
import type { PublicDownloadResource } from "@/services/download.service";
import { downloadResourceHref } from "@/services/download.service";
import { formatCommuniqueDate, getCommuniqueTagTone } from "@/lib/news-ui";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface CommuniquesSitePageProps {
  locale: Locale;
  items: PublicDownloadResource[];
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    subNav: NewsSubNavLabels;
    filterBy: string;
    all: string;
    noteService: string;
    inscriptions: string;
    exams: string;
    year: string;
    downloadPdf: string;
    reference: string;
    empty: string;
  };
  isPublished: boolean;
}

type FilterKey = "all" | "note" | "inscriptions" | "exams";

function matchesFilter(item: PublicDownloadResource, filter: FilterKey): boolean {
  if (filter === "all") return true;
  const hay = `${item.infoLabel ?? ""} ${item.title} ${item.excerpt ?? ""}`.toLowerCase();
  if (filter === "note") return hay.includes("note") || hay.includes("service");
  if (filter === "inscriptions") return hay.includes("inscription");
  if (filter === "exams") return hay.includes("examen") || hay.includes("concours");
  return true;
}

export function CommuniquesSitePage({
  locale,
  items,
  labels,
  isPublished,
}: CommuniquesSitePageProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [year, setYear] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const years = useMemo(() => {
    const set = new Set(items.map((i) => new Date(i.updatedAt).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const itemYear = new Date(item.updatedAt).getFullYear();
      if (year !== "all" && String(itemYear) !== year) return false;
      return matchesFilter(item, filter);
    });
  }, [items, filter, year]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: labels.all },
    { key: "note", label: labels.noteService },
    { key: "inscriptions", label: labels.inscriptions },
    { key: "exams", label: labels.exams },
  ];

  if (!isPublished) {
    return (
      <>
        <NewsHubHero title={labels.heroTitle} subtitle={labels.heroSubtitle} compact align="left" />
        <Container className="py-16">
          <p className="text-center text-slate-500">{labels.empty}</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <NewsHubHero title={labels.heroTitle} subtitle={labels.heroSubtitle} compact align="left" />

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container>
          <NewsSubNav locale={locale} active="communiques" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">{labels.filterBy}</span>
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setFilter(f.key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    filter === f.key
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">{labels.year}</span>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy-900"
              >
                <option value="all">{labels.all}</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-10 space-y-4">
            {paginated.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500">
                {labels.empty}
              </p>
            ) : (
              paginated.map((item) => {
                const { day, monthYear } = formatCommuniqueDate(item.updatedAt, locale);
                const tag = item.infoLabel ?? (locale === "ar" ? "وثيقة" : "Document");
                const tone = getCommuniqueTagTone(item.infoLabel);
                const href = `/${locale}${downloadResourceHref(item.slug)}`;

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"
                  >
                    <div className="flex shrink-0 items-center gap-4 sm:w-24 sm:flex-col sm:items-start sm:gap-1">
                      <div className="text-center sm:text-left">
                        <span className="block text-3xl font-bold leading-none text-navy-900">
                          {day}
                        </span>
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {monthYear}
                        </span>
                      </div>
                      <div className="hidden h-12 w-px bg-slate-200 sm:block" aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1 border-slate-200 sm:border-l sm:pl-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            tone.bg,
                            tone.text
                          )}
                        >
                          {tag}
                        </span>
                        {item.infoLabel && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Tag className="h-3 w-3" aria-hidden />
                            {labels.reference}: {item.slug.toUpperCase().slice(0, 12)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-navy-900">{item.title}</h3>
                      {item.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 sm:pl-4">
                      {item.fileUrl ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                        >
                          <Download className="h-4 w-4" aria-hidden />
                          {labels.downloadPdf}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                        >
                          {labels.downloadPdf}
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold",
                    page === n
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                ›
              </button>
            </nav>
          )}
        </Container>
      </section>
    </>
  );
}
