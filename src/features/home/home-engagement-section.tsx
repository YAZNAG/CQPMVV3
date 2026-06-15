"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { VideoPlayModal } from "@/components/public/video-play-modal";
import type { PublicHomeEngagementItem } from "@/services/home-engagement.service";
import type { VideoSource } from "@/lib/video";
import { cn } from "@/lib/utils";

interface HomeEngagementSectionProps {
  title: string;
  backgroundUrl: string;
  mediaThumbnailUrl: string | null;
  video: VideoSource;
  items: PublicHomeEngagementItem[];
  locale: "fr" | "ar";
}

export function HomeEngagementSection({
  title,
  backgroundUrl,
  mediaThumbnailUrl,
  video,
  items,
  locale,
}: HomeEngagementSectionProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const thumbnail = mediaThumbnailUrl || backgroundUrl;
  const canPlay = video !== null;
  const isRtl = locale === "ar";

  if (items.length === 0 && !canPlay && !thumbnail) return null;

  return (
    <>
      <section className="relative overflow-hidden bg-white" id="engagement">
        <div className="grid lg:grid-cols-2">
          <HomeScrollReveal
            from={isRtl ? "right" : "left"}
            locale={locale}
            className="relative min-h-[320px] lg:min-h-[520px]"
          >
            <CmsImage
              src={backgroundUrl}
              alt=""
              fill
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ocean-900/85 via-navy-900/75 to-ocean-800/80" />

            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center p-6 sm:p-10",
                isRtl ? "lg:justify-start" : "lg:justify-end"
              )}
            >
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.45 }}
                whileHover={canPlay ? { scale: 1.03, y: -2 } : undefined}
                onClick={() => canPlay && setVideoOpen(true)}
                disabled={!canPlay}
                className={cn(
                  "group relative w-full max-w-md overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_28px_70px_rgba(0,0,0,0.42)]",
                  canPlay ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className="relative aspect-[4/3]">
                  <CmsImage
                    src={thumbnail}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-navy-950/20" />
                  {canPlay && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-ocean-700 shadow-xl"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      >
                        <Play className="ml-1 h-7 w-7 fill-current" />
                      </motion.span>
                    </span>
                  )}
                </div>
              </motion.button>
            </div>
          </HomeScrollReveal>

          <HomeScrollReveal
            from={isRtl ? "left" : "right"}
            locale={locale}
            className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-20"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {title}
              </h2>
              <div className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-ocean-500 to-amber-400" />
            </div>

            {items.length > 0 && (
              <ul className="mt-10 space-y-4">
                {items.map((item, i) => (
                  <HomeScrollReveal key={item.id} index={i} locale={locale} item>
                  <li className="group flex gap-4 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-slate-50">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30 transition-transform duration-200 group-hover:scale-110">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                      <span className="font-bold text-navy-900">{item.keyword}</span>
                      <span className="text-slate-500"> — </span>
                      {item.description}
                    </p>
                  </li>
                  </HomeScrollReveal>
                ))}
              </ul>
            )}
          </HomeScrollReveal>
        </div>
      </section>

      {canPlay && (
        <VideoPlayModal
          video={video}
          open={videoOpen}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </>
  );
}
