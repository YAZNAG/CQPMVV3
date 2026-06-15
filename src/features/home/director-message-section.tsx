"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

interface DirectorMessageSectionProps {
  locale: Locale;
  quote: string;
  name: string;
  title: string;
  photoUrl: string | null;
}

export function DirectorMessageSection({
  locale,
  quote,
  name,
  title,
  photoUrl,
}: DirectorMessageSectionProps) {
  const isRtl = locale === "ar";
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden bg-[#0a1628] py-20 lg:py-28"
      id="director-message"
      aria-labelledby="director-message-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08)_0%,_transparent_60%)]"
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute top-4 select-none font-serif text-[12rem] leading-none text-sky-400/[0.07] sm:text-[16rem]",
          isRtl ? "left-4 sm:left-10" : "right-4 sm:right-10"
        )}
        aria-hidden
      >
        &rdquo;
      </span>

      <Container className="relative">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mx-auto flex w-full flex-col items-center text-center"
        >
          <div className="relative mb-10 sm:mb-12">
            <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-sky-400 bg-navy-900 shadow-[0_0_0_4px_rgba(56,189,248,0.15)] sm:h-28 sm:w-28">
              {photoUrl ? (
                <CmsImage
                  src={photoUrl}
                  alt={name}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-sky-700 text-white">
                  <User className="h-10 w-10 opacity-80" aria-hidden />
                </span>
              )}
            </div>
          </div>

          <blockquote className="relative px-2">
            <p
              id="director-message-heading"
              className="font-display text-xl font-bold italic leading-relaxed text-white sm:text-2xl sm:leading-relaxed lg:text-[1.65rem] lg:leading-[1.75]"
            >
              &ldquo;{quote}&rdquo;
            </p>
          </blockquote>

          <footer className="mt-10 space-y-2 sm:mt-12">
            <p className="text-lg font-bold text-white sm:text-xl">{name}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400 sm:text-xs">
              {title}
            </p>
          </footer>
        </motion.div>
      </Container>
    </section>
  );
}
