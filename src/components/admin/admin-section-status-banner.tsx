"use client";

import { Power } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminSectionStatusBannerProps = {
  isPublished: boolean;
  subtitle: string;
  canWrite?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
};

export function AdminSectionStatusBanner({
  isPublished,
  subtitle,
  canWrite = false,
  disabled = false,
  onToggle,
}: AdminSectionStatusBannerProps) {
  const showToggle = canWrite && onToggle;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4",
        isPublished ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"
      )}
    >
      <div className="flex items-start gap-3">
        <Power
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            isPublished ? "text-emerald-600" : "text-amber-600"
          )}
        />
        <div>
          <p className="font-semibold text-slate-900">
            Section {isPublished ? "active" : "masquée"} sur le site
          </p>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      {showToggle ? (
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={onToggle}
            disabled={disabled}
            className="h-5 w-5 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">
            {isPublished ? "Section activée" : "Section désactivée"}
          </span>
        </label>
      ) : null}
    </div>
  );
}

export function formatSectionItemSubtitle(
  publishedCount: number,
  totalCount: number,
  itemLabel: string,
  locations: string
): string {
  const plural = publishedCount !== 1 ? "s" : "";
  return `${publishedCount} ${itemLabel}${plural} active${plural} sur ${totalCount} — ${locations}`;
}

export function AdminListSectionStatusBanner({
  publishedCount,
  totalCount,
  itemLabel,
  locations,
}: {
  publishedCount: number;
  totalCount: number;
  itemLabel: string;
  locations: string;
}) {
  return (
    <AdminSectionStatusBanner
      isPublished={publishedCount > 0}
      subtitle={formatSectionItemSubtitle(publishedCount, totalCount, itemLabel, locations)}
    />
  );
}
