"use client";

import Link from "next/link";
import {
  CircleCheck,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  ScrollText,
} from "lucide-react";
import type { DownloadActionType, DownloadResourceIcon } from "@prisma/client";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { Container } from "@/components/public/container";
import type { PublicDownloadResource } from "@/services/download.service";
import { downloadResourceHref } from "@/services/download.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<
  DownloadResourceIcon,
  { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; className: string }
> = {
  PDF: { Icon: FileText, className: "bg-red-50 text-red-600" },
  SUCCESS: { Icon: CircleCheck, className: "bg-green-50 text-green-600" },
  FOLDER: { Icon: FolderOpen, className: "bg-blue-50 text-blue-600" },
  RULES: { Icon: ScrollText, className: "bg-orange-50 text-orange-600" },
};

interface DownloadsSectionProps {
  locale: Locale;
  title: string;
  subtitle: string;
  items: PublicDownloadResource[];
  downloadLabel: string;
  viewLabel: string;
  showHeader?: boolean;
  isPublished?: boolean;
}

function actionLabel(actionType: DownloadActionType, downloadLabel: string, viewLabel: string) {
  return actionType === "DOWNLOAD" ? downloadLabel : viewLabel;
}

function ActionIcon({ actionType }: { actionType: DownloadActionType }) {
  if (actionType === "DOWNLOAD") {
    return <Download className="h-4 w-4" aria-hidden />;
  }
  return <ExternalLink className="h-4 w-4" aria-hidden />;
}

export function DownloadsSection({
  locale,
  title,
  subtitle,
  items,
  downloadLabel,
  viewLabel,
  showHeader = true,
  isPublished = true,
}: DownloadsSectionProps) {
  const isRtl = locale === "ar";

  if (!isPublished || items.length === 0) return null;

  return (
    <section className="bg-slate-100/90 py-16 lg:py-24" id="telechargements">
      <Container>
        {showHeader && (
          <HomeScrollReveal index={0} locale={locale}>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">{subtitle}</p>
            </div>
          </HomeScrollReveal>
        )}

        <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6", showHeader && "mt-12")}>
          {items.map((item, index) => {
            const { Icon, className } = ICONS[item.icon];
            const label = actionLabel(item.actionType, downloadLabel, viewLabel);
            const href = `/${locale}${downloadResourceHref(item.slug)}`;

            return (
              <HomeScrollReveal key={item.id} index={index} locale={locale} item>
                <article className="flex h-full flex-col items-center rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]">
                  <span
                    className={cn(
                      "mb-5 flex h-14 w-14 items-center justify-center rounded-full",
                      className
                    )}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                  </span>

                  <h3 className="text-base font-bold text-navy-900 sm:text-lg">{item.title}</h3>

                  {item.infoLabel && (
                    <p className="mt-2 text-sm text-slate-500">{item.infoLabel}</p>
                  )}

                  <Link
                    href={href}
                    className="mt-auto inline-flex items-center justify-center gap-2 pt-6 text-sm font-bold text-navy-900 transition-colors hover:text-ocean-600"
                  >
                    {label}
                    <ActionIcon actionType={item.actionType} />
                  </Link>
                </article>
              </HomeScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function DownloadDetailActions({
  locale,
  item,
  downloadLabel,
  viewLabel,
}: {
  locale: Locale;
  item: PublicDownloadResource;
  downloadLabel: string;
  viewLabel: string;
}) {
  const isRtl = locale === "ar";

  if (item.actionType === "DOWNLOAD" && item.fileUrl) {
    return (
      <a
        href={item.fileUrl}
        download
        target={item.fileUrl.startsWith("http") ? "_blank" : undefined}
        rel={item.fileUrl.startsWith("http") ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-2 rounded-lg bg-ocean-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-700"
      >
        {downloadLabel}
        <Download className={cn("h-4 w-4", isRtl && "rotate-180")} aria-hidden />
      </a>
    );
  }

  if (item.fileUrl && item.actionType === "VIEW") {
    return (
      <a
        href={item.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
      >
        {viewLabel}
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    );
  }

  return null;
}
