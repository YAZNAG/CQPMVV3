"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Play,
  Video,
  X,
} from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { GalleryCtaSection } from "@/features/gallery/gallery-cta-section";
import { GallerySubNav } from "@/features/gallery/gallery-sub-nav";
import { NewsSubNav, type NewsSubNavLabels } from "@/features/news/news-sub-nav";
import { formatDate } from "@/lib/utils";
import { isGalleryFileVideo, resolveGalleryVideoPlayback } from "@/lib/gallery/video";
import type { PublicGalleryMediaItem } from "@/services/gallery.service";
import type { Locale } from "@/types";

interface VideosSitePageProps {
  locale: Locale;
  items: PublicGalleryMediaItem[];
  page: number;
  totalPages: number;
  total: number;
  labels: {
    title: string;
    titleAr: string;
    subtitle: string;
    heroBackgroundUrl?: string | null;
    subNav: { photos: string; videos: string };
    newsSubNav: NewsSubNavLabels;
    loadMore: string;
    empty: string;
    cta: {
      title: string;
      subtitle: string;
      formations: string;
      register: string;
    };
  };
}

export function VideosSitePage({
  locale,
  items,
  page,
  totalPages,
  total,
  labels,
}: VideosSitePageProps) {
  const [activeVideo, setActiveVideo] = useState<PublicGalleryMediaItem | null>(null);
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";
  const basePath = `/${locale}/gallery/videos`;

  const buildLoadMoreHref = () => {
    const sp = new URLSearchParams();
    sp.set("page", String(page + 1));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 py-16 md:py-20">
        {labels.heroBackgroundUrl ? (
          <>
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
              style={{ backgroundImage: `url(${labels.heroBackgroundUrl})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-navy-950/65" aria-hidden />
          </>
        ) : (
          <div className="wave-pattern absolute inset-0 opacity-10" aria-hidden />
        )}
        <Container className="relative text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {labels.title}{" "}
            <span className="text-navy-300">({labels.titleAr})</span>
          </h1>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-100/90 sm:text-base">
            {labels.subtitle}
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container className="space-y-4">
          <NewsSubNav locale={locale} active="gallery" labels={labels.newsSubNav} />
          <GallerySubNav locale={locale} active="videos" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-slate-50/80 pb-16 lg:pb-20 pt-8 lg:pt-10">
        <Container>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <Video className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-4 text-slate-500">{labels.empty}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
                  >
                    <button
                      type="button"
                      className="relative block w-full aspect-video overflow-hidden bg-navy-900"
                      onClick={() => setActiveVideo(item)}
                    >
                      {item.imageUrl && !isGalleryFileVideo(item.videoUrl ?? "") ? (
                        <CmsImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : item.videoUrl && isGalleryFileVideo(item.videoUrl) ? (
                        <video
                          src={item.videoUrl}
                          className="absolute inset-0 h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-ocean-900" />
                      )}
                      <div className="absolute inset-0 bg-navy-950/25 transition-colors group-hover:bg-navy-950/40" />
                      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
                      </span>
                    </button>

                    <div className="p-5">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-navy-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {formatDate(item.createdAt, dateLocale)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {page < totalPages && (
                <div className="mt-10 text-center">
                  <Link
                    href={buildLoadMoreHref()}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                  >
                    {labels.loadMore}
                  </Link>
                  <p className="mt-3 text-xs text-slate-400">
                    {items.length} / {total}
                  </p>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      <GalleryCtaSection locale={locale} variant="dark" labels={labels.cta} />

      <AnimatePresence>
        {activeVideo?.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4"
            onClick={() => setActiveVideo(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setActiveVideo(null)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {resolveGalleryVideoPlayback(activeVideo.videoUrl).mode === "file" ? (
                <video
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="h-full w-full"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  src={resolveGalleryVideoPlayback(activeVideo.videoUrl).src}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
