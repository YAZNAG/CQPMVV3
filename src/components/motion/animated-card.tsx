"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-premium transition-shadow duration-300 hover:shadow-premium-lg",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-aqua-400/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      {children}
    </motion.div>
  );
}
