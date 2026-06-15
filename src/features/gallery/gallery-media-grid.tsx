"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { toEmbedVideoUrl, isGalleryFileVideo } from "@/lib/gallery/video";
import { cn } from "@/lib/utils";

export interface GalleryMediaItem {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
}

interface GalleryMediaGridProps {
  items: GalleryMediaItem[];
  photosLabel: string;
  videosLabel: string;
}

export function GalleryMediaGrid({ items, photosLabel, videosLabel }: GalleryMediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = items.filter((i) => i.type === "PHOTO" && i.imageUrl);

  const openLightbox = (id: string) => {
    const idx = photos.findIndex((p) => p.id === id);
    if (idx >= 0) setLightboxIndex(idx);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure
            key={item.id}
            className={cn(
              "group overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm",
              item.type === "PHOTO" && item.imageUrl && "cursor-pointer"
            )}
            onClick={() => item.type === "PHOTO" && item.imageUrl && openLightbox(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && item.type === "PHOTO") openLightbox(item.id);
            }}
            role={item.type === "PHOTO" ? "button" : undefined}
            tabIndex={item.type === "PHOTO" ? 0 : undefined}
          >
            {item.type === "VIDEO" && item.videoUrl ? (
              <div className="relative aspect-video bg-navy-900">
                {isGalleryFileVideo(item.videoUrl) ? (
                  <video
                    src={item.videoUrl}
                    title={item.title || videosLabel}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <iframe
                    src={toEmbedVideoUrl(item.videoUrl)}
                    title={item.title || videosLabel}
                    className="h-full w-full"
                    allowFullScreen
                  />
                )}
              </div>
            ) : item.imageUrl ? (
              <div className="relative aspect-[4/3]">
                <CmsImage
                  src={item.imageUrl}
                  alt={item.title || photosLabel}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-navy-100">
                <Play className="h-10 w-10 text-navy-400" />
              </div>
            )}
            {item.title && (
              <figcaption className="p-3 text-sm font-medium text-navy-800">
                {item.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && photos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/95 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setLightboxIndex(null)}
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === null ? 0 : (i - 1 + photos.length) % photos.length
                    );
                  }}
                  aria-label="Précédent"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) =>
                      i === null ? 0 : (i + 1) % photos.length
                    );
                  }}
                  aria-label="Suivant"
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
                src={photos[lightboxIndex].imageUrl!}
                alt={photos[lightboxIndex].title}
                width={1200}
                height={800}
                className="mx-auto max-h-[85vh] w-auto rounded-lg object-contain"
              />
              {photos[lightboxIndex].title && (
                <p className="mt-4 text-center text-white">{photos[lightboxIndex].title}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
