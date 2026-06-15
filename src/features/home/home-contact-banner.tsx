"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Sparkles } from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import type { Locale } from "@/types";

interface HomeContactBannerProps {
  title: string;
  subtitle: string;
  phone: string;
  href: string;
  backgroundUrl?: string | null;
  locale: Locale;
}

export function HomeContactBanner({
  title,
  subtitle,
  phone,
  href,
  backgroundUrl,
  locale,
}: HomeContactBannerProps) {
  const isRtl = locale === "ar";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-ocean-900 py-16 lg:py-20">
      {backgroundUrl ? (
        <>
          <CmsImage src={backgroundUrl} alt="" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/85 to-ocean-900/80" />
        </>
      ) : (
        <>
          <div className="wave-pattern absolute inset-0 opacity-15" />
          <div className="maritime-grid absolute inset-0 opacity-30" aria-hidden />
        </>
      )}

      <Container className="relative">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row lg:gap-14">
          <HomeScrollReveal from={isRtl ? "right" : "left"} locale={locale} className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-aqua-400/25 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-aqua-200">
              <Sparkles className="h-3.5 w-3.5" />
              CQPM Nador
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {title}
            </h2>
          </HomeScrollReveal>

          <HomeScrollReveal from={isRtl ? "left" : "right"} locale={locale}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}>
              <Link
                href={href}
                className="group flex min-w-[280px] items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-6 py-5 shadow-premium-lg backdrop-blur-xl transition-all duration-300 hover:border-aqua-400/30 hover:bg-white/15 hover:shadow-[0_24px_56px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="text-left">
                  <span className="block text-xs font-medium uppercase tracking-wider text-navy-200">
                    {subtitle}
                  </span>
                  <span className="mt-1 block text-lg font-bold text-white sm:text-xl">
                    {phone}
                  </span>
                </span>
              </Link>
            </motion.div>
          </HomeScrollReveal>
        </div>
      </Container>
    </section>
  );
}
