"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { GalleryCtaSection } from "@/features/gallery/gallery-cta-section";
import { GallerySubNav } from "@/features/gallery/gallery-sub-nav";
import { NewsSubNav, type NewsSubNavLabels } from "@/features/news/news-sub-nav";
import { SITE_IMAGES } from "@/lib/site-images";
import type { PublicGalleryMediaItem } from "@/services/gallery.service";
import type { Locale } from "@/types";

interface PhotosSitePageProps {
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

export function PhotosSitePage({
  locale,
  items,
  page,
  totalPages,
  total,
  labels,
}: PhotosSitePageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const basePath = `/${locale}/gallery/photos`;

  const buildLoadMoreHref = () => {
    const sp = new URLSearchParams();
    sp.set("page", String(page + 1));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
          style={{
            backgroundImage: `url(${labels.heroBackgroundUrl ?? SITE_IMAGES.about})`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-950/65" aria-hidden />

        <Container className="relative flex min-h-[320px] flex-col items-center justify-center py-16 text-center md:min-h-[380px] md:py-20">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {labels.title}
          </h1>
          <p className="mt-2 text-lg font-medium text-navy-200">{labels.titleAr}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-navy-100/90 sm:text-base">
            {labels.subtitle}
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container className="space-y-4">
          <NewsSubNav locale={locale} active="gallery" labels={labels.newsSubNav} />
          <GallerySubNav locale={locale} active="photos" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-slate-50/80 pb-16 lg:pb-20 pt-8 lg:pt-10">
        <Container>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <Images className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
              <p className="mt-4 text-slate-500">{labels.empty}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-100 text-left shadow-[0_4px_24px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                    onClick={() => setLightboxIndex(index)}
                  >
                    {item.imageUrl && (
                      <CmsImage
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {item.title && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent px-4 pb-4 pt-10 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {item.title}
                      </span>
                    )}
                  </button>
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

      <GalleryCtaSection locale={locale} variant="light" labels={labels.cta} />

      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex]?.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === null ? 0 : (i - 1 + items.length) % items.length
                    );
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === null ? 0 : (i + 1) % items.length
                    );
                  }}
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div
              className="relative max-h-[85vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CmsImage
                src={items[lightboxIndex].imageUrl!}
                alt={items[lightboxIndex].title}
                width={1400}
                height={900}
                className="mx-auto max-h-[85vh] w-auto rounded-xl object-contain"
              />
              {items[lightboxIndex].title && (
                <p className="mt-4 text-center text-white">{items[lightboxIndex].title}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
