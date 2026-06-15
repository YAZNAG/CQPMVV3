"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap-config";
import { cn } from "@/lib/utils";

interface ScrollRevealSideProps {
  children: React.ReactNode;
  from?: "left" | "right";
  className?: string;
  /** Horizontal travel in px while scrolling into view */
  distance?: number;
  /** Less rotation — better for cards and small blocks */
  subtle?: boolean;
}

/**
 * Scroll-scrubbed entrance: content slides in from the side as the user scrolls.
 */
export function ScrollRevealSide({
  children,
  from = "left",
  className,
  distance = 110,
  subtle = false,
}: ScrollRevealSideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    registerGsapPlugins();
    const offset = from === "left" ? -distance : distance;

    const rotate = subtle ? 0 : from === "left" ? -1.5 : 1.5;

    const tween = gsap.fromTo(
      el,
      { y: offset, opacity: 0, rotate },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: subtle ? "top 94%" : "top 92%",
          end: subtle ? "top 58%" : "top 48%",
          scrub: subtle ? 0.9 : 1.15,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [from, distance, subtle]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
