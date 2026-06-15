"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { defaultViewport, EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { cn } from "@/lib/utils";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 24, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
