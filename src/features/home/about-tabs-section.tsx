"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Anchor, ChevronRight, Sparkles } from "lucide-react";
import { GsapParallax } from "@/components/motion/gsap-parallax";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  EASE_OUT_EXPO,
  fadeUp,
  smoothTransition,
  staggerContainer,
} from "@/lib/animations/motion-presets";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

type AboutTab = "presentation" | "mission";

function toBulletItems(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  return text
    .split(/[;•·]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

interface AboutTabsSectionProps {
  locale: Locale;
  sectionLabel: string;
  titleMain: string;
  titleAccent: string;
  tabPresentation: string;
  tabMission: string;
  presentationContent: string;
  missionContent: string;
  imageUrl: string;
  imageAlt: string;
}

export function AboutTabsSection({
  locale,
  sectionLabel,
  titleMain,
  titleAccent,
  tabPresentation,
  tabMission,
  presentationContent,
  missionContent,
  imageUrl,
  imageAlt,
}: AboutTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<AboutTab>("presentation");
  const missionBullets = toBulletItems(missionContent);
  const isRtl = locale === "ar";
  const reducedMotion = useReducedMotion();

  const tabs: { id: AboutTab; number: string; label: string }[] = [
    { id: "presentation", number: "01", label: tabPresentation },
    { id: "mission", number: "02", label: tabMission },
  ];

  const imageFrom = isRtl ? "right" : "left";
  const contentFrom = isRtl ? "left" : "right";

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-white via-navy-50/30 to-white pb-16 pt-24 lg:pb-24 lg:pt-28"
      id="about"
    >
      <div className="maritime-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-ocean-400/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <HomeScrollReveal from={imageFrom} locale={locale} distance={140} className="relative">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-premium-lg ring-1 ring-navy-900/10">
              <GsapParallax speed={0.1} className="absolute inset-0 h-[115%] w-full -top-[7%]">
                <CmsImage
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </GsapParallax>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20, x: isRtl ? 20 : -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.35, duration: 0.6, ease: EASE_OUT_EXPO }}
                className={cn(
                  "absolute bottom-5 flex items-center gap-3 rounded-xl border border-white/20 bg-white/90 px-4 py-3 shadow-premium backdrop-blur-sm",
                  isRtl ? "right-5" : "left-5"
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy-800 to-ocean-600 text-white shadow-md">
                  <Anchor className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-navy-900">CQPM</p>
                  <p className="text-xs font-medium text-ocean-600">{titleAccent}</p>
                </div>
              </motion.div>

              <div
                className={cn(
                  "absolute top-5 rounded-full border border-ocean-400/30 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ocean-700 shadow-sm backdrop-blur-sm",
                  isRtl ? "left-5" : "right-5"
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Maritime
                </span>
              </div>
            </div>

            <div
              className={cn(
                "absolute -z-10 h-full w-full rounded-2xl bg-gradient-to-br from-ocean-200/40 to-navy-200/30",
                isRtl ? "-left-4 top-4" : "-right-4 top-4"
              )}
              aria-hidden
            />
          </HomeScrollReveal>

          <HomeScrollReveal from={contentFrom} locale={locale} distance={120}>
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-ocean-500 to-transparent" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-navy-400">
                {sectionLabel}
              </p>
            </div>

            <h2 className="font-display mt-5 text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-[2.15rem] lg:leading-snug">
              {titleMain}{" "}
              <span className="bg-gradient-to-r from-ocean-600 to-navy-600 bg-clip-text text-transparent">
                {titleAccent}
              </span>
            </h2>

            <div
              className="relative mt-9 flex rounded-2xl border border-navy-100 bg-navy-50/70 p-1.5 shadow-sm"
              role="tablist"
              aria-label={sectionLabel}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`about-panel-${tab.id}`}
                    id={`about-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3.5 text-sm font-semibold transition-colors sm:px-4 sm:text-base",
                      isActive ? "text-white" : "text-navy-700"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="about-tab-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 shadow-lg"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold tabular-nums",
                          isActive ? "text-ocean-300" : "text-orange-500"
                        )}
                      >
                        {tab.number}
                      </span>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 min-h-[11rem]">
              <AnimatePresence mode="wait">
                {activeTab === "presentation" ? (
                  <motion.div
                    key="presentation"
                    role="tabpanel"
                    id="about-panel-presentation"
                    aria-labelledby="about-tab-presentation"
                    initial={reducedMotion ? false : { opacity: 0, x: isRtl ? -24 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: isRtl ? 16 : -16 }}
                    transition={smoothTransition}
                  >
                    <div className="space-y-4">
                      {toBulletItems(presentationContent).length > 1 ? (
                        toBulletItems(presentationContent).map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-base leading-relaxed text-navy-600 sm:text-[1.05rem] sm:leading-8"
                          >
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-base leading-relaxed text-navy-600 sm:text-[1.05rem] sm:leading-8">
                          {presentationContent}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mission"
                    role="tabpanel"
                    id="about-panel-mission"
                    aria-labelledby="about-tab-mission"
                    initial={reducedMotion ? false : { opacity: 0, x: isRtl ? -24 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: isRtl ? 16 : -16 }}
                    transition={smoothTransition}
                  >
                    {missionBullets.length > 1 ? (
                      <motion.ul
                        className="space-y-4"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {missionBullets.map((item, i) => (
                          <motion.li
                            key={item}
                            variants={fadeUp}
                            transition={smoothTransition}
                            className="group flex gap-4 text-navy-600"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-500/10 text-xs font-bold text-ocean-700 transition-colors group-hover:bg-ocean-500 group-hover:text-white">
                              {i + 1}
                            </span>
                            <span className="pt-0.5 text-base leading-relaxed sm:leading-7">
                              {item}
                            </span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    ) : (
                      <p className="text-base leading-relaxed text-navy-600 sm:text-[1.05rem] sm:leading-8">
                        {missionContent}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-ocean-600">
              <span className="h-px w-8 bg-ocean-300" />
              <span className="inline-flex items-center gap-1">
                CQPM Nador
                <ChevronRight className={cn("h-4 w-4", isRtl && "rotate-180")} aria-hidden />
              </span>
            </div>
          </HomeScrollReveal>
        </div>
      </Container>
    </section>
  );
}
