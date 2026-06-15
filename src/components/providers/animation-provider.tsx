"use client";

import { useEffect } from "react";
import { registerGsapPlugins } from "@/lib/animations/gsap-config";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsapPlugins();
  }, []);
  return <>{children}</>;
}
