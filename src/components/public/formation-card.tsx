"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/animations/motion-presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/public/cms-image";
import { resolveFormationImage } from "@/lib/site-images";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

interface FormationCardProps {
  locale: Locale;
  slug: string;
  title: string;
  description: string;
  duration: string;
  imageUrl?: string | null;
  category?: string;
  ctaLabel: string;
  secondaryCtaLabel?: string;
  index?: number;
  variant?: "default" | "catalog" | "premium";
}

export function FormationCard({
  locale,
  slug,
  title,
  description,
  duration,
  imageUrl,
  category,
  ctaLabel,
  secondaryCtaLabel,
  index = 0,
  variant = "default",
}: FormationCardProps) {
  const isCatalog = variant === "catalog";
  const isPremium = variant === "premium";
  const detailHref = `/${locale}/formations/${slug}`;
  const admissionHref = `/${locale}/inscription`;

  if (isPremium) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: index * 0.07, duration: 0.55, ease: EASE_OUT_EXPO }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
          <CmsImage
            src={resolveFormationImage(imageUrl, slug)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <Badge className="absolute left-4 top-4 border-0 bg-emerald-500 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-emerald-500">
            {locale === "ar" ? "التسجيل مفتوح" : "Inscriptions Ouvertes"}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-6">
          {category ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {category}
            </p>
          ) : null}
          <h3 className="mt-2 text-lg font-bold leading-snug text-navy-900">{title}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {duration}
            </span>
            <span>{locale === "ar" ? "تدريب عملي" : "Stage inclus"}</span>
          </div>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={detailHref}>{secondaryCtaLabel ?? ctaLabel}</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              asChild
            >
              <Link href={admissionHref}>{locale === "ar" ? "التسجيل" : "Inscription"}</Link>
            </Button>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -6, transition: { duration: 0.28, ease: EASE_OUT_EXPO } }}
    >
      <Card
        className={cn(
          "group h-full overflow-hidden bg-white transition-all duration-500",
          isCatalog
            ? "rounded-2xl border border-slate-200/80 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:-translate-y-2 hover:border-ocean-200/80 hover:shadow-[0_20px_48px_rgba(14,165,233,0.12)]"
            : "border-navy-100 hover:-translate-y-1 hover:border-ocean-300 hover:shadow-xl hover:shadow-ocean-500/10"
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
          <CmsImage
            src={resolveFormationImage(imageUrl, slug)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              isCatalog && "opacity-60 group-hover:opacity-80"
            )}
          />
          {category && (
            <Badge
              variant={isCatalog ? "default" : "navy"}
              className={cn(
                "absolute left-4 top-4 border-0 shadow-sm",
                isCatalog &&
                  "bg-amber-500 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-amber-500"
              )}
            >
              {category}
            </Badge>
          )}
        </div>
        <CardHeader className={cn("pb-2", isCatalog && "px-6 pt-6")}>
          <CardTitle
            className={cn(
              "line-clamp-2 leading-snug",
              isCatalog ? "text-lg font-bold text-navy-900 sm:text-xl" : "text-lg"
            )}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isCatalog && "px-6 pb-6")}>
          <p
            className={cn(
              "line-clamp-3 leading-relaxed",
              isCatalog ? "text-sm text-slate-600" : "text-sm text-navy-600"
            )}
          >
            {description}
          </p>
          <div
            className={cn(
              "mt-5 flex items-center justify-between border-t pt-4",
              isCatalog ? "border-slate-100" : "mt-4 border-0 pt-0"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500">
              <Clock className="h-3.5 w-3.5 text-ocean-500" />
              {duration}
            </span>
            <Link
              href={detailHref}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300",
                isCatalog
                  ? "rounded-full bg-navy-900 px-4 py-2 text-white group-hover:bg-navy-800"
                  : "text-ocean-600 hover:text-ocean-700"
              )}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
