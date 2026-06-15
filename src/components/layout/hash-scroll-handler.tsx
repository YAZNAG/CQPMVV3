"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToHash } from "@/lib/navigation/hash-nav";

function runHashScroll() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return () => {};

  let cancelled = false;
  let attempts = 0;
  let timeoutId: number | undefined;

  const tryScroll = () => {
    if (cancelled) return;
    if (scrollToHash(hash, "smooth")) return;
    attempts += 1;
    if (attempts < 30) {
      timeoutId = window.setTimeout(tryScroll, 100);
    }
  };

  timeoutId = window.setTimeout(tryScroll, 50);

  return () => {
    cancelled = true;
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => runHashScroll(), [pathname]);

  useEffect(() => {
    const onHashChange = () => runHashScroll();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
