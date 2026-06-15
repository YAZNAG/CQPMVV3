"use client";

import { useEffect, useRef } from "react";
import { Anchor, Compass, Ship, Waves } from "lucide-react";
import { gsap, prefersReducedMotion, registerGsapPlugins } from "@/lib/animations/gsap-config";
import { cn } from "@/lib/utils";

const ITEMS = [
  { Icon: Anchor, className: "left-[10%] top-[20%] text-aqua-400/35", delay: 0 },
  { Icon: Ship, className: "right-[14%] top-[30%] text-white/15", delay: 0.5 },
  { Icon: Compass, className: "left-[20%] bottom-[24%] text-aqua-300/25", delay: 1 },
  { Icon: Waves, className: "right-[18%] bottom-[20%] text-ocean-300/20", delay: 1.4 },
] as const;

export function FloatingMaritime({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    registerGsapPlugins();
    const nodes = ref.current.querySelectorAll("[data-float]");
    const tweens = Array.from(nodes).map((node, i) =>
      gsap.to(node, {
        y: "+=14",
        rotation: i % 2 ? 5 : -5,
        duration: 2.5 + i * 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: ITEMS[i]?.delay ?? 0,
      })
    );
    return () => tweens.forEach((t) => t.kill());
  }, []);

  return (
    <div ref={ref} className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {ITEMS.map(({ Icon, className: cls }, i) => (
        <div key={i} data-float className={cn("absolute h-8 w-8 sm:h-10 sm:w-10", cls)}>
          <Icon strokeWidth={1.25} className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
