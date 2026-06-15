"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Video } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { resolveGalleryCoverImage } from "@/lib/site-images";
import type { Locale } from "@/types";

interface GalleryCardProps {
  locale: Locale;
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string | null;
  photoCount: number;
  videoCount: number;
  photosLabel: string;
  videosLabel: string;
  index?: number;
  viewLabel?: string;
}

export function GalleryCard({
  locale,
  slug,
  title,
  description,
  coverImageUrl,
  photoCount,
  videoCount,
  photosLabel,
  videosLabel,
  index = 0,
  viewLabel = "Voir l'album",
}: GalleryCardProps) {
  const imageSrc = resolveGalleryCoverImage(coverImageUrl);
  const totalMedia = photoCount + videoCount;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="h-full"
    >
      <Link
        href={`/${locale}/gallery/${slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(16,42,67,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-ocean-200 hover:shadow-[0_20px_50px_rgba(16,42,67,0.14)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-navy-100">
            <CmsImage
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-900/20 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {photoCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                  <ImageIcon className="h-3.5 w-3.5 text-ocean-600" />
                  {photoCount} {photosLabel}
                </span>
              )}
              {videoCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ocean-600 to-ocean-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                  <Video className="h-3.5 w-3.5" />
                  {videoCount} {videosLabel}
                </span>
              )}
            </div>

            {totalMedia > 0 && (
              <span className="absolute bottom-4 right-4 rounded-full bg-navy-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {totalMedia} {locale === "ar" ? "عنصر" : "médias"}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h2 className="text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-ocean-700 sm:text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-navy-500">
                {description}
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-600 transition-colors group-hover:text-ocean-700">
              {viewLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
