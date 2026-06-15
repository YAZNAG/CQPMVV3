"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { getNewsCategoryTone } from "@/lib/news-ui";
import { formatDate, cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type NewsCardArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: string | null;
  categorySlug?: string | null;
};

interface NewsPremiumCardProps {
  locale: Locale;
  article: NewsCardArticle;
  readMoreLabel: string;
  className?: string;
  variant?: "news" | "event";
  href?: string | null;
  eventDate?: Date | null;
  location?: string | null;
  detailLabel?: string;
}

export function NewsPremiumCard({
  locale,
  article,
  readMoreLabel,
  className,
  variant = "news",
  href: hrefProp,
  eventDate,
  location,
  detailLabel,
}: NewsPremiumCardProps) {
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";
  const tone = getNewsCategoryTone(article.categorySlug);
  const categoryLabel =
    article.category ??
    (variant === "event"
      ? locale === "ar"
        ? "فعالية"
        : "Événement"
      : locale === "ar"
        ? "الأخبار"
        : "Actualités");
  const href =
    hrefProp ?? (variant === "event" ? null : `/${locale}/news/${article.slug}`);

  const displayDate = eventDate ?? article.publishedAt;
  const cta = detailLabel ?? readMoreLabel;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]",
        className
      )}
    >
      {href ? (
        <Link
          href={href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
        >
          <CardImage article={article} tone={tone} categoryLabel={categoryLabel} />
        </Link>
      ) : (
        <CardImage article={article} tone={tone} categoryLabel={categoryLabel} />
      )}

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {variant === "news" && article.publishedAt && (
          <time
            dateTime={new Date(article.publishedAt).toISOString()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
          >
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDate(article.publishedAt, dateLocale)}
          </time>
        )}

        {href ? (
          <Link href={href}>
            <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-ocean-700 md:text-lg">
              {article.title}
            </h3>
          </Link>
        ) : (
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-navy-900 md:text-lg">
            {article.title}
          </h3>
        )}

        {variant === "event" && displayDate && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-ocean-600" aria-hidden />
            {formatDate(displayDate, dateLocale)}
            {eventDate &&
              new Intl.DateTimeFormat(dateLocale, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(eventDate)) !== "00:00" && (
                <>
                  {", "}
                  {new Intl.DateTimeFormat(dateLocale, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(eventDate))}
                </>
              )}
          </p>
        )}

        {variant === "event" && location && (
          <p className="mt-1.5 inline-flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ocean-600" aria-hidden />
            {location}
          </p>
        )}

        {variant === "news" && article.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
            {article.excerpt}
          </p>
        )}

        {variant === "event" ? (
          href ? (
            <Link
              href={href}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-navy-900 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
            >
              {cta}
            </Link>
          ) : (
            <span className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400">
              {cta}
            </span>
          )
        ) : (
          href && (
            <Link
              href={href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 transition-colors hover:text-ocean-700"
            >
              {cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )
        )}
      </div>
    </article>
  );
}

function CardImage({
  article,
  tone,
  categoryLabel,
}: {
  article: NewsCardArticle;
  tone: { bg: string; text: string };
  categoryLabel: string;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
      {article.coverImageUrl ? (
        <CmsImage
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-700" />
      )}
      <span
        className={cn(
          "absolute right-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
          tone.bg,
          tone.text
        )}
      >
        {categoryLabel}
      </span>
    </div>
  );
}
