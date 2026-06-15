"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type ContactSection = "contact" | "reclamation";

interface ContactSubNavProps {
  locale: Locale;
  active: ContactSection;
  labels: {
    contact: string;
    reclamation: string;
  };
}

export function ContactSubNav({ locale, active, labels }: ContactSubNavProps) {
  const links: { section: ContactSection; href: string; label: string }[] = [
    { section: "contact", href: `/${locale}/contact`, label: labels.contact },
    { section: "reclamation", href: `/${locale}/contact/reclamation`, label: labels.reclamation },
  ];

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm"
      aria-label={labels.contact}
    >
      {links.map((link) => (
        <Link
          key={link.section}
          href={link.href}
          className={cn(
            "rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
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
