"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PublicGalleryCategory } from "@/services/gallery.service";

interface GalleryCategoryFiltersProps {
  categories: PublicGalleryCategory[];
  activeCategory?: string;
  allLabel: string;
  basePath: string;
  mediaType: "photo" | "video";
}

export function GalleryCategoryFilters({
  categories,
  activeCategory,
  allLabel,
  basePath,
  mediaType,
}: GalleryCategoryFiltersProps) {
  const filteredCategories = categories.filter((cat) =>
    mediaType === "photo" ? cat.photoCount > 0 : cat.videoCount > 0
  );

  const buildHref = (category?: string) => {
    if (!category) return basePath;
    return `${basePath}?category=${encodeURIComponent(category)}`;
  };

  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={allLabel}
    >
      <FilterPill href={buildHref()} active={!activeCategory} label={allLabel} />
      {filteredCategories.map((cat) => (
        <FilterPill
          key={cat.slug}
          href={buildHref(cat.slug)}
          active={activeCategory === cat.slug}
          label={cat.name}
        />
      ))}
    </nav>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        active
          ? "border-navy-900 bg-navy-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {label}
    </Link>
  );
}
