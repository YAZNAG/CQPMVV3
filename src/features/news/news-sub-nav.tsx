"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type NewsSection = "news" | "gallery" | "blog" | "agenda" | "communiques";

export type NewsSubNavLabels = {
  news: string;
  gallery: string;
  blog: string;
  agenda: string;
  communiques: string;
};

interface NewsSubNavProps {
  locale: Locale;
  active: NewsSection;
  labels: NewsSubNavLabels;
}

export function NewsSubNav({ locale, active, labels }: NewsSubNavProps) {
  const links: { section: NewsSection; href: string; label: string }[] = [
    { section: "news", href: `/${locale}/news`, label: labels.news },
    { section: "gallery", href: `/${locale}/gallery/photos`, label: labels.gallery },
    { section: "blog", href: `/${locale}/news`, label: labels.blog },
    { section: "agenda", href: `/${locale}/events`, label: labels.agenda },
    { section: "communiques", href: `/${locale}/telechargements`, label: labels.communiques },
  ];

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm"
      aria-label={labels.news}
    >
      {links.map((link) => (
        <Link
          key={link.section}
          href={link.href}
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:px-5",
            active === link.section
              ? "bg-navy-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
          )}
          aria-current={active === link.section ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
