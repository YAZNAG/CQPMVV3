"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className="w-full overflow-x-clip"
    >
      {children}
    </motion.div>
  );
}
