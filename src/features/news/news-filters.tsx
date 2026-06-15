"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { cn } from "@/lib/utils";

interface NewsFiltersProps {
  dict: Dictionary;
  categories: { slug: string; name: string; articleCount?: number }[];
  currentCategory?: string;
  currentQuery?: string;
}

export function NewsFilters({
  dict,
  categories,
  currentCategory,
  currentQuery,
}: NewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pMeta = dict.pages.news;

  const buildUrl = (params: { q?: string; category?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = (fd.get("q") as string)?.trim();
    router.push(buildUrl({ q: q || undefined, category: currentCategory }));
  };

  const clearSearch = () => {
    router.push(buildUrl({ category: currentCategory }));
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input
            name="q"
            defaultValue={currentQuery ?? ""}
            placeholder={pMeta.searchPlaceholder}
            className="h-12 rounded-xl border-navy-100 bg-navy-50/50 pl-11 pr-10 text-base shadow-inner shadow-navy-900/5 focus-visible:border-ocean-400 focus-visible:ring-ocean-400/30"
          />
          {currentQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
              aria-label={dict.common.cancel}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          variant="ocean"
          size="lg"
          className="h-12 rounded-xl px-8 shadow-md shadow-ocean-600/20"
        >
          {dict.common.search}
        </Button>
      </form>

      {categories.length > 0 && (
        <nav
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={pMeta.allCategories}
        >
          <FilterPill
            href={buildUrl({ q: currentQuery })}
            active={!currentCategory}
            label={pMeta.allCategories}
          />
          {categories.map((cat) => (
            <FilterPill
              key={cat.slug}
              href={buildUrl({ q: currentQuery, category: cat.slug })}
              active={currentCategory === cat.slug}
              label={cat.name}
              count={cat.articleCount}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        active
          ? "border-ocean-500 bg-gradient-to-r from-ocean-600 to-ocean-500 text-white shadow-md shadow-ocean-600/25"
          : "border-slate-200 bg-white text-slate-600 hover:border-ocean-200 hover:bg-ocean-50 hover:text-ocean-700"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          )}
        >
          {count}
        </span>
      )}
    </a>
  );
}
