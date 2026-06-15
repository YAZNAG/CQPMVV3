"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Anchor, Award, ArrowRight, Building2, Clock, Ship, UserRound } from "lucide-react";
import type { HomeHighlightIcon } from "@prisma/client";
import type { PublicHomeFormationsSection } from "@/services/home-formation-showcase.service";
import { SITE_IMAGES } from "@/lib/site-images";
import { Container } from "@/components/public/container";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const ICONS: Record<
  HomeHighlightIcon,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  ANCHOR: Anchor,
  SHIP: Ship,
  USER: UserRound,
  BUILDING: Building2,
  AWARD: Award,
};

interface HomeFormationsSectionProps {
  locale: Locale;
  section: PublicHomeFormationsSection;
  cardCtaLabel: string;
}

function ShowcaseCard({
  item,
  index,
  cardCtaLabel,
}: {
  item: PublicHomeFormationsSection["items"][number];
  index: number;
  cardCtaLabel: string;
}) {
  const Icon = ICONS[item.icon] ?? Award;
  const imageSrc = item.imageUrl || SITE_IMAGES.formationFallback;

  const card = (
    <article className="group relative flex h-full min-h-[24rem] flex-col overflow-hidden bg-transparent sm:min-h-[26rem] lg:min-h-[28rem]">
      {/* Image — proportions ITPM, un peu plus grande */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm bg-navy-100 lg:aspect-[5/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {item.badge && (
          <span className="absolute left-3 top-3 rounded bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-800">
            {item.badge}
          </span>
        )}
      </div>

      {/* État normal — boîte blanche + lien (style ITPM) */}
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col pb-6 pt-0",
          "transition-all duration-500 ease-out",
          "md:group-hover:pointer-events-none md:group-hover:opacity-0"
        )}
      >
        <div className="relative mx-auto -mt-16 w-[90%] max-w-[20rem] bg-white px-7 py-6 shadow-[0_10px_40px_rgba(16,42,67,0.1)] sm:-mt-[4.5rem] sm:max-w-[22rem] sm:px-8 sm:py-7">
          <div className="mb-4 flex h-10 w-10 items-center justify-center text-amber-500">
            <Icon className="h-9 w-9" strokeWidth={1.5} aria-hidden />
          </div>
          <h3 className="text-lg font-bold leading-snug text-navy-800 sm:text-xl">{item.title}</h3>
        </div>

        <p className="mt-auto pt-6 text-center text-sm font-medium text-navy-400 sm:text-[0.95rem]">
          {cardCtaLabel}
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" aria-hidden />
        </p>
      </div>

      {/* Panneau hover — monte par le bas (desktop) */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 hidden flex-col bg-navy-800 px-6 py-6 text-white sm:px-7 sm:py-7 md:flex",
          "top-[30%] sm:top-[32%]",
          "translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:translate-y-0"
        )}
      >
        <div className="mb-3 text-amber-400">
          <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden />
        </div>

        <h3 className="text-base font-bold leading-snug sm:text-lg">{item.title}</h3>

        {item.description && (
          <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-navy-100/95">
            {item.description}
          </p>
        )}

        {item.duration && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy-200 sm:text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {item.duration}
          </span>
        )}

        <span
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-semibold text-white",
            "bg-gradient-to-r from-amber-500 to-orange-500",
            "transition-colors duration-300 group-hover:from-amber-400 group-hover:to-orange-400"
          )}
        >
          {cardCtaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </article>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="h-full"
    >
      {item.href ? (
        <Link
          href={item.href}
          className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
        >
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  );
}

export function HomeFormationsSection({
  locale,
  section,
  cardCtaLabel,
}: HomeFormationsSectionProps) {
  if (section.items.length === 0) return null;

  const colCount = section.items.length;

  return (
    <section className="bg-gradient-to-b from-white to-navy-50/40 py-20 lg:py-28" id="formations">
      <Container>
        <SectionHeading
          variant="featured"
          label={locale === "ar" ? "التكوينات" : "Formations"}
          title={section.title}
          description={section.subtitle}
        />

        <div
          className={cn(
            "mt-14 grid w-full gap-8 lg:mt-16 lg:gap-10",
            colCount === 1 && "max-w-md mx-auto",
            colCount === 2 && "sm:grid-cols-2",
            colCount >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {section.items.map((item, i) => (
            <ShowcaseCard key={item.id} item={item} index={i} cardCtaLabel={cardCtaLabel} />
          ))}
        </div>

        <div className="mt-12 text-center lg:mt-14">
          <Button
            variant="outline"
            size="lg"
            className="border-navy-300 bg-white px-8 hover:bg-navy-50"
            asChild
          >
            <Link href={section.ctaHref}>{section.ctaLabel}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
