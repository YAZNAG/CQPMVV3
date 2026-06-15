"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface NewsPaginationProps {
  page: number;
  totalPages: number;
  locale: Locale;
  q?: string;
  category?: string;
  /** Route segment after locale, e.g. "news" or "blog" */
  basePath?: string;
}

function buildPageUrl(
  locale: Locale,
  pageNum: number,
  basePath: string,
  q?: string,
  category?: string
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (pageNum > 1) params.set("page", String(pageNum));
  const qs = params.toString();
  return `/${locale}/${basePath}${qs ? `?${qs}` : ""}`;
}

export function NewsPagination({
  page,
  totalPages,
  locale,
  q,
  category,
  basePath = "news",
}: NewsPaginationProps) {
  if (totalPages <= 1) return null;

  const prevLabel = locale === "ar" ? "السابق" : "Précédent";
  const nextLabel = locale === "ar" ? "التالي" : "Suivant";

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "min-w-[8rem] rounded-xl border-navy-200",
          page <= 1 && "pointer-events-none opacity-40"
        )}
        asChild={page > 1}
        disabled={page <= 1}
      >
        {page > 1 ? (
          <Link href={buildPageUrl(locale, page - 1, basePath, q, category)}>
            <ChevronLeft className="h-4 w-4" />
            {prevLabel}
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
            {prevLabel}
          </span>
        )}
      </Button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, i, arr) => {
            const showEllipsis = i > 0 && p - arr[i - 1] > 1;
            return (
              <span key={p} className="flex items-center gap-2">
                {showEllipsis && <span className="text-navy-400">…</span>}
                <Link
                  href={buildPageUrl(locale, p, basePath, q, category)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                    p === page
                      ? "bg-gradient-to-r from-ocean-600 to-ocean-500 text-white shadow-md shadow-ocean-600/25"
                      : "border border-navy-100 bg-white text-navy-600 hover:border-ocean-200 hover:text-ocean-700"
                  )}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Link>
              </span>
            );
          })}
      </div>

      <Button
        variant="outline"
        size="lg"
        className={cn(
          "min-w-[8rem] rounded-xl border-navy-200",
          page >= totalPages && "pointer-events-none opacity-40"
        )}
        asChild={page < totalPages}
        disabled={page >= totalPages}
      >
        {page < totalPages ? (
          <Link href={buildPageUrl(locale, page + 1, basePath, q, category)}>
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </motion.nav>
  );
}
