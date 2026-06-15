"use client";

import Link from "next/link";
import { ChevronRight, PenLine, User } from "lucide-react";
import { motion } from "framer-motion";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { SITE_IMAGES } from "@/lib/site-images";
import type { DirectorPublicContent } from "@/lib/director-content";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export type DirectorPageBreadcrumb = {
  label: string;
  href: string;
};

interface DirectorSitePageProps {
  locale: Locale;
  content: DirectorPublicContent;
  pageTitle: string;
  pageSubtitle: string;
  breadcrumbs: DirectorPageBreadcrumb[];
  heroImageUrl?: string | null;
}

function splitParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

export function DirectorSitePage({
  locale,
  content,
  pageTitle,
  pageSubtitle,
  breadcrumbs,
  heroImageUrl,
}: DirectorSitePageProps) {
  const isRtl = locale === "ar";
  const reducedMotion = useReducedMotion();
  const paragraphs = content.bodyParagraphs ?? splitParagraphs(content.quote);
  const heroBg = heroImageUrl || SITE_IMAGES.about;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <CmsImage
            src={heroBg}
            alt=""
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/88 to-navy-900/75" />
        </div>

        <Container className="relative py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-navy-200/80 md:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 opacity-60", isRtl && "rotate-180")}
                      aria-hidden
                    />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-white">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-white"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {pageTitle}
          </h1>
          <p className="mt-2 text-lg font-medium text-sky-400 md:text-xl">{pageSubtitle}</p>
        </Container>
      </section>

      {/* Two-column body */}
      <section className="bg-white py-14 lg:py-20">
        <Container>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
            className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16"
          >
            {/* Portrait column */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="overflow-hidden rounded-2xl bg-navy-50 shadow-premium-lg ring-1 ring-navy-100">
                <div className="relative aspect-[3/4] w-full">
                  {content.photoUrl ? (
                    <CmsImage
                      src={content.photoUrl}
                      alt={content.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-100 to-ocean-100 text-navy-400">
                      <User className="h-20 w-20" strokeWidth={1.25} aria-hidden />
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-lg font-bold text-navy-900">{content.name}</p>
                <p className="mt-1 text-sm text-navy-500">{content.title}</p>
              </div>
            </aside>

            {/* Message column */}
            <div className="relative lg:col-span-8 xl:col-span-9">
              <span
                className={cn(
                  "pointer-events-none absolute -top-2 select-none font-serif text-[5rem] leading-none text-sky-200 sm:text-[6.5rem]",
                  isRtl ? "left-0" : "left-0"
                )}
                aria-hidden
              >
                &ldquo;
              </span>

              <div className="relative space-y-5 pt-8 sm:pt-10">
                {paragraphs.map((paragraph, index) => {
                  const isFirst = index === 0;
                  const isLast = index === paragraphs.length - 1 && paragraphs.length > 1;

                  return (
                    <p
                      key={index}
                      className={cn(
                        "text-base leading-relaxed text-navy-700 sm:text-[1.05rem] sm:leading-8",
                        isFirst && "text-lg font-medium text-navy-800 sm:text-xl",
                        isLast && "font-bold text-navy-900"
                      )}
                    >
                      {isFirst ? `« ${paragraph.replace(/^["«]|["»]$/g, "")} »` : paragraph}
                    </p>
                  );
                })}
              </div>

              <footer className="mt-10 flex items-center justify-end gap-3 border-t border-navy-100 pt-8">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white shadow-sm">
                  <PenLine className="h-4 w-4" aria-hidden />
                </span>
                <div className={cn(isRtl && "text-right")}>
                  <p className="font-bold text-navy-900">{content.name}</p>
                  <p className="text-sm text-navy-500">{content.title}</p>
                </div>
              </footer>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
