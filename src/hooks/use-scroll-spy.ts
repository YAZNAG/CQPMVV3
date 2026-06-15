"use client";

import { useEffect, useState } from "react";
import {
  HEADER_OFFSET_PX,
  parseHashHref,
  sectionIdFromPageLink,
} from "@/lib/navigation/hash-nav";
import type { PublicNavItem } from "@/services/navigation.service";

function collectSpySectionIds(items: PublicNavItem[], pathname: string): string[] {
  const ids = new Set<string>();

  const walk = (list: PublicNavItem[]) => {
    for (const item of list) {
      const { path, hash } = parseHashHref(item.href);
      if (hash && path === pathname) ids.add(hash);

      const segment = sectionIdFromPageLink(item.href, pathname);
      if (segment) ids.add(segment);

      if (item.children?.length) walk(item.children);
    }
  };

  walk(items);
  return Array.from(ids);
}

function resolveActiveSection(sectionIds: string[], scrollY: number): string {
  const scrollPos = scrollY + HEADER_OFFSET_PX + 12;
  let current = "";

  const elements = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null)
    .sort((a, b) => {
      const topA = a.getBoundingClientRect().top + window.scrollY;
      const topB = b.getBoundingClientRect().top + window.scrollY;
      return topA - topB;
    });

  for (const el of elements) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top <= scrollPos) current = el.id;
  }

  return current;
}

export function useScrollSpy(items: PublicNavItem[], pathname: string): string {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sectionIds = collectSpySectionIds(items, pathname).filter((id) =>
      document.getElementById(id)
    );

    if (sectionIds.length === 0) {
      setActiveSection("");
      return;
    }

    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActiveSection(resolveActiveSection(sectionIds, window.scrollY));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items, pathname]);

  return activeSection;
}
