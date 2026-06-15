"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Anchor, Award, Building2, Ship, UserRound } from "lucide-react";
import type { HomeHighlightIcon } from "@prisma/client";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import type { PublicHomeHighlight } from "@/services/home-highlight.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

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

function HighlightCard({
  item,
  index,
  locale,
}: {
  item: PublicHomeHighlight;
  index: number;
  locale: Locale;
}) {
  const Icon = ICONS[item.icon] ?? Anchor;
  const content = (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
      className="relative flex min-h-[10rem] items-center justify-between gap-4 overflow-hidden px-6 py-9 sm:min-h-[11rem] sm:px-8"
      style={{ backgroundColor: item.backgroundColor }}
    >
      {item.imageUrl && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" aria-hidden />

      <div className="relative z-10 min-w-0">
        <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-white/90 sm:text-base">{item.subtitle}</p>
      </div>

      <Icon
        className="relative z-10 h-16 w-16 shrink-0 text-white/25 transition-transform duration-500 group-hover:scale-110 group-hover:text-white/40 sm:h-20 sm:w-20"
        strokeWidth={1.25}
        aria-hidden
      />
    </motion.div>
  );

  return (
    <HomeScrollReveal index={index} locale={locale} item>
      {item.href ? (
        <Link
          href={item.href}
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      ) : (
        <div className="group">{content}</div>
      )}
    </HomeScrollReveal>
  );
}

interface HomeHighlightsBandProps {
  items: PublicHomeHighlight[];
  locale: Locale;
}

export function HomeHighlightsBand({ items, locale }: HomeHighlightsBandProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Centres et chiffres clés" className="w-full overflow-hidden">
      <div
        className={cn(
          "grid grid-cols-1",
          items.length === 2 && "md:grid-cols-2",
          items.length >= 3 && "md:grid-cols-3"
        )}
      >
        {items.map((item, index) => (
          <HighlightCard key={item.id} item={item} index={index} locale={locale} />
        ))}
      </div>
    </section>
  );
}
