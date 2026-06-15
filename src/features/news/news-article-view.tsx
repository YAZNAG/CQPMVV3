"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Link2,
  Mail,
  Printer,
  User,
} from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { estimateReadMinutes, formatReadTime } from "@/lib/news-ui";
import { formatDate, cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface NewsArticleViewProps {
  locale: Locale;
  article: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string | null;
    publishedAt?: Date | null;
    category?: string | null;
    categorySlug?: string | null;
    authorName?: string | null;
  };
  related: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl?: string | null;
    publishedAt?: Date | null;
    category?: string | null;
    categorySlug?: string | null;
  }[];
  labels: {
    back: string;
    shareTitle: string;
    relatedTitle: string;
    readMore: string;
    by: string;
  };
}

export function NewsArticleView({
  locale,
  article,
  related,
  labels,
}: NewsArticleViewProps) {
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";
  const readMinutes = estimateReadMinutes(article.content, locale);
  const readTimeLabel = formatReadTime(readMinutes, locale);
  const [pageUrl, setPageUrl] = useState("");
  const isRtl = locale === "ar";

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const shareMail = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(pageUrl)}`;

  return (
    <article className="pb-20">
      <section className="relative min-h-[360px] overflow-hidden bg-navy-950 md:min-h-[440px]">
        {article.coverImageUrl ? (
          <CmsImage
            src={article.coverImageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-ocean-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-900/30" />

        <Container className="relative flex min-h-[360px] flex-col justify-end pb-10 pt-24 md:min-h-[440px] md:pb-14">
          {article.category && (
            <span className="mb-4 inline-flex w-fit rounded-md bg-ocean-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {article.category}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.65rem]">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-100/90">
            {article.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-ocean-300" aria-hidden />
                {formatDate(article.publishedAt, dateLocale)}
              </span>
            )}
            {article.authorName && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 text-ocean-300" aria-hidden />
                {labels.by} {article.authorName}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ocean-300" aria-hidden />
              {readTimeLabel}
            </span>
          </div>
        </Container>
      </section>

      <Container className="mt-8">
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600 hover:text-ocean-700"
        >
          <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} aria-hidden />
          {labels.back}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div>
            {article.excerpt && (
              <p className="text-lg leading-relaxed text-slate-600">{article.excerpt}</p>
            )}
            <div
              className={cn(
                "prose prose-navy mt-8 max-w-none",
                "prose-headings:font-display prose-headings:font-bold prose-headings:text-navy-900",
                "prose-p:leading-relaxed prose-p:text-slate-700",
                "prose-blockquote:border-l-4 prose-blockquote:border-ocean-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:pl-6 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-navy-800",
                "prose-a:text-ocean-600 prose-img:rounded-xl"
              )}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                {labels.shareTitle}
              </h2>
              <div className="mt-4 flex gap-3">
                <a
                  href={shareMail}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-ocean-200 hover:text-ocean-600"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => pageUrl && navigator.clipboard?.writeText(pageUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-ocean-200 hover:text-ocean-600"
                  aria-label="Copy link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-ocean-200 hover:text-ocean-600"
                  aria-label="Print"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>

            {related.length > 0 && (
              <div>
                <h2 className="border-b border-slate-200 pb-3 text-lg font-bold text-navy-900">
                  {labels.relatedTitle}
                </h2>
                <div className="mt-4 space-y-4">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${locale}/news/${item.slug}`}
                      className="group flex gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-navy-100">
                        {item.coverImageUrl ? (
                          <CmsImage
                            src={item.coverImageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-ocean-700" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold text-navy-900 group-hover:text-ocean-700">
                          {item.title}
                        </h3>
                        {item.publishedAt && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" aria-hidden />
                            {formatDate(item.publishedAt, dateLocale)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
