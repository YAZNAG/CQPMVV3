"use client";

import { AnimationProvider } from "@/components/providers/animation-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export function MotionShell({ children }: { children: React.ReactNode }) {
  return (
    <AnimationProvider>
      <ScrollProgress />
      <PageTransition>{children}</PageTransition>
    </AnimationProvider>
  );
}
