"use client";

import Link from "next/link";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  fr: "FR",
  ar: "AR",
};

export function LanguageSwitcher({
  currentLocale,
  pathname,
  variant = "default",
}: {
  currentLocale: Locale;
  pathname: string;
  variant?: "default" | "topbar" | "compact";
}) {
  const getLocalePath = (locale: Locale) =>
    pathname.replace(`/${currentLocale}`, `/${locale}`);

  if (variant === "topbar") {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold" role="group" aria-label="Language">
        {(["fr", "ar"] as const).map((locale, index) => {
          const isActive = currentLocale === locale;
          return (
            <span key={locale} className="inline-flex items-center gap-1.5">
              {index > 0 && <span className="text-white/40">|</span>}
              <Link
                href={getLocalePath(locale)}
                className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                )}
                aria-current={isActive ? "true" : undefined}
                lang={locale}
              >
                {localeLabels[locale]}
              </Link>
            </span>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        role="group"
        aria-label="Language"
      >
        {(["fr", "ar"] as const).map((locale) => {
          const isActive = currentLocale === locale;
          return (
            <Link
              key={locale}
              href={getLocalePath(locale)}
              className={cn(
                "min-w-[2.25rem] rounded-md px-2 py-1 text-[11px] font-bold transition-colors",
                isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              )}
              aria-current={isActive ? "true" : undefined}
              lang={locale}
            >
              {localeLabels[locale]}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="inline-flex shrink-0 items-center rounded-xl border border-navy-200/80 bg-navy-50/60 p-1 shadow-sm"
      role="group"
      aria-label="Language"
    >
      {(["fr", "ar"] as const).map((locale) => {
        const isActive = currentLocale === locale;

        return (
          <Link
            key={locale}
            href={getLocalePath(locale)}
            className={cn(
              "relative flex min-w-[2.75rem] items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide transition-all duration-200",
              isActive
                ? "bg-navy-800 text-white shadow-sm"
                : "text-navy-600 hover:bg-white hover:text-navy-900"
            )}
            aria-current={isActive ? "true" : undefined}
            lang={locale}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
