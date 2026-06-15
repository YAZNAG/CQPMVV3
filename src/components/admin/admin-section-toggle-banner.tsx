"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleSiteSectionPublished } from "@/actions/admin/site-section.actions";
import type { SiteSectionKey } from "@/lib/site-section-publish";
import {
  AdminSectionStatusBanner,
  formatSectionItemSubtitle,
} from "@/components/admin/admin-section-status-banner";

type AdminSectionToggleBannerProps = {
  sectionKey: SiteSectionKey;
  initialPublished: boolean;
  canWrite: boolean;
} & (
  | {
      subtitle: string;
      publishedCount?: never;
      totalCount?: never;
      itemLabel?: never;
      locations?: never;
    }
  | {
      subtitle?: never;
      publishedCount: number;
      totalCount: number;
      itemLabel: string;
      locations: string;
    }
);

export function AdminSectionToggleBanner({
  sectionKey,
  initialPublished,
  canWrite,
  subtitle,
  publishedCount,
  totalCount,
  itemLabel,
  locations,
}: AdminSectionToggleBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sectionPublished, setSectionPublished] = useState(initialPublished);

  useEffect(() => {
    setSectionPublished(initialPublished);
  }, [initialPublished]);

  const onToggle = () => {
    if (!canWrite) return;
    const next = !sectionPublished;
    setSectionPublished(next);
    startTransition(async () => {
      const result = await toggleSiteSectionPublished(sectionKey, next);
      if (result.success) {
        toast.success(next ? "Section activée sur le site" : "Section masquée sur le site");
        router.refresh();
      } else {
        setSectionPublished(!next);
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const resolvedSubtitle =
    subtitle ??
    formatSectionItemSubtitle(publishedCount, totalCount, itemLabel, locations);

  return (
    <AdminSectionStatusBanner
      isPublished={sectionPublished}
      subtitle={resolvedSubtitle}
      canWrite={canWrite}
      disabled={isPending}
      onToggle={onToggle}
    />
  );
}
