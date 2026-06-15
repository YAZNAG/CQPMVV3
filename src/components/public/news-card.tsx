"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { CmsImage } from "@/components/public/cms-image";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/types";

interface NewsCardProps {
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: string | null;
  ctaLabel: string;
  index?: number;
  variant?: "default" | "home";
  animateEntrance?: boolean;
}

export function NewsCard({
  locale,
  slug,
  title,
  excerpt,
  coverImageUrl,
  publishedAt,
  category,
  ctaLabel,
  index = 0,
  variant = "default",
  animateEntrance = true,
}: NewsCardProps) {
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";
  const categoryLabel =
    category ?? (locale === "ar" ? "الأخبار" : "Actualités");

  if (variant === "home") {
    const homeCard = (
      <Link
        href={`/${locale}/news/${slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
      >
        <div className="flex h-full flex-col transition-transform duration-300 group-hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
            {coverImageUrl ? (
              <CmsImage
                src={coverImageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-700">
                <span className="text-lg font-bold tracking-widest text-white/40">CQPM</span>
              </div>
            )}
            <span className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
              {categoryLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col px-1 pb-2 pt-5">
            {publishedAt && (
              <time
                dateTime={new Date(publishedAt).toISOString()}
                className="text-sm text-navy-400"
              >
                {formatDate(publishedAt, dateLocale)}
              </time>
            )}
            <h3 className="mt-2 line-clamp-3 text-base font-bold leading-snug text-navy-800 transition-colors group-hover:text-ocean-700 sm:text-lg">
              {title}
            </h3>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-navy-400 transition-colors group-hover:text-ocean-600">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );

    if (!animateEntrance) {
      return <article className="h-full">{homeCard}</article>;
    }

    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08, duration: 0.55, ease: EASE_OUT_EXPO }}
        whileHover={{ y: -5, transition: { duration: 0.28, ease: EASE_OUT_EXPO } }}
        className="h-full"
      >
        {homeCard}
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -5, transition: { duration: 0.28, ease: EASE_OUT_EXPO } }}
      className="h-full"
    >
      <Link
        href={`/${locale}/news/${slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
      >
        <div className="flex h-full flex-col transition-transform duration-300 group-hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-navy-100 shadow-[0_12px_40px_rgba(16,42,67,0.08)]">
            {coverImageUrl ? (
              <CmsImage
                src={coverImageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-ocean-700">
                <span className="text-lg font-bold tracking-widest text-white/40">
                  CQPM
                </span>
              </div>
            )}
            <span className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
              {categoryLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col px-1 pb-2 pt-5">
            {publishedAt && (
              <time
                dateTime={new Date(publishedAt).toISOString()}
                className="text-sm text-navy-400"
              >
                {formatDate(publishedAt, dateLocale)}
              </time>
            )}
            <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-navy-800 transition-colors group-hover:text-ocean-700 sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-500">
              {excerpt}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-navy-400 transition-colors group-hover:text-ocean-600">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
