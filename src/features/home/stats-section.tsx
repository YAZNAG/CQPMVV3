"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/public/container";
import { GlassPanel } from "@/components/motion/glass-panel";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SITE_STAT_ICONS } from "@/lib/site-icons";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import type { PublicSiteStat } from "@/services/site-stat.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

interface StatsSectionProps {
  dict: Dictionary;
  items: PublicSiteStat[];
  locale: Locale;
  className?: string;
}

const LG_GRID_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

function AnimatedCounter({ value, showPlus }: { value: number; showPlus: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <span ref={ref} className="inline-flex items-baseline gap-0.5">
      <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-navy-900 sm:text-[2.75rem] lg:text-5xl">
        {display.toLocaleString()}
      </span>
      {showPlus && (
        <span className="text-xl font-semibold text-ocean-500 sm:text-2xl">+</span>
      )}
    </span>
  );
}

export function StatsSection({ dict, items, locale, className }: StatsSectionProps) {
  if (items.length === 0) return null;

  const lgCols = LG_GRID_COLS[Math.min(items.length, 6)] ?? "lg:grid-cols-4";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-navy-100/80 bg-gradient-to-b from-white to-navy-50/40 pb-24 pt-16",
        className
      )}
      aria-label={dict.sections.stats}
    >
      <div className="maritime-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <Container className="relative">
        <HomeScrollReveal index={0} locale={locale}>
          <div className="mb-12 flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-ocean-400 to-transparent" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy-400">
              {dict.sections.stats}
            </p>
          </div>
        </HomeScrollReveal>

        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", lgCols)}>
          {items.map((item, i) => {
            const Icon = SITE_STAT_ICONS[item.icon];
            return (
              <HomeScrollReveal key={item.id} index={i + 1} locale={locale} item>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.25, ease: EASE_OUT_EXPO } }}
                  className="h-full"
                >
                  <GlassPanel
                    variant="ocean"
                    className="group flex h-full flex-col items-center px-6 py-8 text-center transition-shadow duration-300 hover:shadow-premium-lg sm:px-8"
                  >
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-500/10 text-ocean-600 transition-colors duration-300 group-hover:bg-ocean-500 group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>

                    <AnimatedCounter value={item.value} showPlus={item.showPlus} />

                    <p className="mx-auto mt-3 max-w-[12rem] text-sm leading-snug text-navy-500">
                      {item.label}
                    </p>
                  </GlassPanel>
                </motion.div>
              </HomeScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
