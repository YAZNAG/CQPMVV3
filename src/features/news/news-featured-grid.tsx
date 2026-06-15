"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Star } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export type NewsFeaturedArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: string | null;
};

interface NewsFeaturedGridProps {
  locale: Locale;
  articles: NewsFeaturedArticle[];
  featuredLabel: string;
  readMoreLabel: string;
}

function FeaturedImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <CmsImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 66vw"
        className={cn("object-cover transition-transform duration-700 group-hover:scale-105", className)}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-700">
      <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold tracking-[0.3em] text-white/20">
        CQPM
      </span>
    </div>
  );
}

function FeaturedCard({
  article,
  locale,
  featuredLabel,
  readMoreLabel,
  size = "default",
  index = 0,
}: {
  article: NewsFeaturedArticle;
  locale: Locale;
  featuredLabel: string;
  readMoreLabel: string;
  size?: "hero" | "default" | "compact";
  index?: number;
}) {
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.55 }}
      className="h-full"
    >
      <Link
        href={`/${locale}/news/${article.slug}`}
        className="group relative block h-full overflow-hidden rounded-2xl bg-navy-900 shadow-[0_20px_50px_rgba(16,42,67,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            size === "hero" && "min-h-[420px] lg:min-h-[520px]",
            size === "default" && "min-h-[320px] lg:min-h-[380px]",
            size === "compact" && "min-h-[240px]"
          )}
        >
          <FeaturedImage src={article.coverImageUrl} alt={article.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-900/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/40 to-transparent" />

          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
            <Star className="h-3.5 w-3.5 fill-current" />
            {featuredLabel}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            {article.category && (
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ocean-300">
                {article.category}
              </span>
            )}
            <h2
              className={cn(
                "mt-2 font-bold leading-tight text-white transition-colors group-hover:text-ocean-100",
                size === "hero" ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
              )}
            >
              {article.title}
            </h2>
            {size !== "compact" && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-navy-100/90 sm:text-base">
                {article.excerpt}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {article.publishedAt && (
                <time
                  dateTime={new Date(article.publishedAt).toISOString()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-200 sm:text-sm"
                >
                  <Calendar className="h-4 w-4 text-ocean-300" />
                  {formatDate(article.publishedAt, dateLocale)}
                </time>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 transition-colors group-hover:text-amber-300">
                {readMoreLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function NewsFeaturedGrid({
  locale,
  articles,
  featuredLabel,
  readMoreLabel,
}: NewsFeaturedGridProps) {
  if (articles.length === 0) return null;

  if (articles.length === 1) {
    return (
      <FeaturedCard
        article={articles[0]}
        locale={locale}
        featuredLabel={featuredLabel}
        readMoreLabel={readMoreLabel}
        size="hero"
      />
    );
  }

  const [lead, ...rest] = articles;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <FeaturedCard
          article={lead}
          locale={locale}
          featuredLabel={featuredLabel}
          readMoreLabel={readMoreLabel}
          size="hero"
          index={0}
        />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-5">
        {rest.map((article, i) => (
          <FeaturedCard
            key={article.id}
            article={article}
            locale={locale}
            featuredLabel={featuredLabel}
            readMoreLabel={readMoreLabel}
            size="compact"
            index={i + 1}
          />
        ))}
      </div>
    </div>
  );
}
