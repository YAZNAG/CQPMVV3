"use client";

import { motion } from "framer-motion";
import { GsapParallax } from "@/components/motion/gsap-parallax";
import { GsapTextReveal } from "@/components/motion/gsap-text-reveal";
import { CmsImage } from "@/components/public/cms-image";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { cn } from "@/lib/utils";
import { Container } from "./container";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  imageUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80",
  compact,
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-navy-900",
        compact ? "min-h-[280px]" : "min-h-[360px] md:min-h-[420px]",
        className
      )}
    >
      <GsapParallax speed={0.12} className="absolute inset-0">
        <CmsImage
          src={imageUrl ?? "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80"}
          alt=""
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
      </GsapParallax>
      <div className="hero-overlay absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />
      <div className="wave-pattern absolute inset-0 opacity-30" />
      <Container className="relative flex min-h-[inherit] flex-col justify-center py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <GsapTextReveal
            as="h1"
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {title}
          </GsapTextReveal>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: EASE_OUT_EXPO }}
              className="mt-4 text-lg leading-relaxed text-navy-100/90"
            >
              {subtitle}
            </motion.p>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: EASE_OUT_EXPO }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
