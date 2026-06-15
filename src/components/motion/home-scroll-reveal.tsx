"use client";

import { ScrollRevealSide } from "@/components/motion/scroll-reveal-side";
import type { Locale } from "@/types";

function resolveFrom(index: number, locale?: Locale): "left" | "right" {
  const isRtl = locale === "ar";
  const even = index % 2 === 0;
  if (even) return isRtl ? "right" : "left";
  return isRtl ? "left" : "right";
}

interface HomeScrollRevealProps {
  children: React.ReactNode;
  /** Alternates slide direction when `from` is omitted */
  index?: number;
  locale?: Locale;
  from?: "left" | "right";
  className?: string;
  distance?: number;
  /** Lighter motion for cards / grid items */
  item?: boolean;
}

export function HomeScrollReveal({
  children,
  index = 0,
  locale,
  from,
  className,
  distance,
  item = false,
}: HomeScrollRevealProps) {
  const side = from ?? resolveFrom(index, locale);

  return (
    <ScrollRevealSide
      from={side}
      distance={distance ?? (item ? 72 : 110)}
      subtle={item}
      className={className}
    >
      {children}
    </ScrollRevealSide>
  );
}
