"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap-config";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Waves } from "lucide-react";
import { FloatingMaritime } from "@/components/motion/floating-maritime";
import { GsapTextReveal } from "@/components/motion/gsap-text-reveal";
import { PAGE_GUTTER } from "@/components/public/container";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { SITE_IMAGES } from "@/lib/site-images";
import type { PublicHeroSlide } from "@/services/hero-slide.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const AUTO_PLAY_MS = 5000;
const SLIDE_TRANSITION = { duration: 0.65, ease: [0.4, 0, 0.2, 1] as const };
const HERO_PRIMARY_BTN =
  "border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-900/30 hover:from-amber-400 hover:to-orange-400 hover:text-white";
const HERO_SECONDARY_BTN =
  "border border-white/50 bg-white/10 text-white backdrop-blur-md hover:border-white/80 hover:bg-white/20 hover:text-white";

interface HeroSectionProps {
  locale: Locale;
  dict: Dictionary;
  slides: PublicHeroSlide[];
  fallback: {
    title: string;
    subtitle: string;
    imageUrl?: string | null;
  };
}

function SlideButtons({
  buttons,
  dict,
  locale,
}: {
  buttons: PublicHeroSlide["buttons"];
  dict: Dictionary;
  locale: Locale;
}) {
  if (buttons.length > 0) {
    return (
      <>
        {buttons.map((button, index) => (
          <Button
            key={`${button.href}-${index}`}
            variant={button.variant === "primary" ? "default" : "glass"}
            size="lg"
            className={
              button.variant === "primary" ? HERO_PRIMARY_BTN : HERO_SECONDARY_BTN
            }
            asChild
          >
            <Link href={button.href}>
              {button.label}
              {button.variant === "primary" && index === 0 && (
                <ArrowRight className="h-5 w-5" />
              )}
            </Link>
          </Button>
        ))}
      </>
    );
  }

  return (
    <>
      <Button variant="default" size="lg" className={HERO_PRIMARY_BTN} asChild>
        <Link href={`/${locale}/admission`}>
          {dict.hero.ctaRegister}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="glass" size="lg" className={HERO_SECONDARY_BTN} asChild>
        <Link href={`/${locale}/formations`}>{dict.hero.ctaFormations}</Link>
      </Button>
    </>
  );
}

function HeroSlideImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    );
  }

  // Dashboard URLs can be any external host ÔÇö avoid next/image hostname errors
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function HeroSection({ locale, dict, slides, fallback }: HeroSectionProps) {
  const hasSlides = slides.length > 0;
  const displaySlides: PublicHeroSlide[] = hasSlides
    ? slides
    : [
        {
          id: "fallback",
          title: fallback.title,
          subtitle: fallback.subtitle,
          imageUrl: fallback.imageUrl ?? SITE_IMAGES.hero,
          buttons: [],
        },
      ];

  const [index, setIndex] = useState(0);
  const current = displaySlides[index] ?? displaySlides[0];
  const multiple = displaySlides.length > 1;
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageRef.current || prefersReducedMotion()) return;
      registerGsapPlugins();
      gsap.fromTo(imageRef.current, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power2.out" });
    },
    { dependencies: [current.id] }
  );

  useEffect(() => {
    if (!multiple) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displaySlides.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [displaySlides.length, multiple, index]);

  const goTo = (next: number) => {
    setIndex((next + displaySlides.length) % displaySlides.length);
  };

  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden" aria-label="Hero">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          ref={imageRef}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={SLIDE_TRANSITION}
          className="absolute inset-0"
        >
          <HeroSlideImage src={current.imageUrl} alt={current.title} />
        </motion.div>
      </AnimatePresence>

      <div className="hero-overlay absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />
      <FloatingMaritime />

      {multiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex"
            aria-label="Slide précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex"
            aria-label="Slide suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className={cn(
          "relative z-10 flex min-h-[90vh] w-full flex-col items-center justify-center py-28 text-center",
          PAGE_GUTTER
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current.id}-content`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={SLIDE_TRANSITION}
            className="flex w-full max-w-4xl flex-col items-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-aqua-400/30 bg-white/10 px-5 py-2.5 text-sm text-white backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-aqua-300" />
              <Waves className="h-4 w-4 text-aqua-400/80" />
              <span className="font-medium tracking-wide">CQPM Nador</span>
            </div>
            <GsapTextReveal
              as="h1"
              className="font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {current.title}
            </GsapTextReveal>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="mt-6 text-lg leading-relaxed text-navy-100/95 sm:text-xl"
            >
              {current.subtitle}
            </motion.p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <SlideButtons buttons={current.buttons} dict={dict} locale={locale} />
            </div>
          </motion.div>
        </AnimatePresence>

        {multiple && (
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {displaySlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-white" : "w-2.5 bg-white/50"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
