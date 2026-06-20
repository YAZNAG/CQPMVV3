import Link from "next/link";
import { Ship } from "lucide-react";
import { Container } from "@/components/public/container";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/types";

interface GalleryCtaSectionProps {
  locale: Locale;
  variant?: "light" | "dark";
  labels: {
    title: string;
    subtitle: string;
    formations: string;
    register: string;
  };
}

export function GalleryCtaSection({
  locale,
  variant = "light",
  labels,
}: GalleryCtaSectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={
        isDark
          ? "bg-navy-950 py-16 lg:py-20"
          : "border-t border-slate-200/80 bg-slate-50/90 py-16 lg:py-20"
      }
    >
      <Container>
        <div className="text-center">
          <div
            className={
              isDark
                ? "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ocean-600/20 text-ocean-300"
                : "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-ocean-100 text-ocean-600"
            }
          >
            <Ship className="h-6 w-6" aria-hidden />
          </div>
          <h2
            className={
              isDark
                ? "font-display text-2xl font-bold text-white sm:text-3xl"
                : "font-display text-2xl font-bold text-navy-900 sm:text-3xl"
            }
          >
            {labels.title}
          </h2>
          <p
            className={
              isDark
                ? "mt-4 text-sm leading-relaxed text-navy-100/85 sm:text-base"
                : "mt-4 text-sm leading-relaxed text-slate-500 sm:text-base"
            }
          >
            {labels.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant={isDark ? "ocean" : "outline"} size="lg" className="rounded-lg px-6" asChild>
              <Link href={`/${locale}/formations`}>{labels.formations}</Link>
            </Button>
            <Button
              variant={isDark ? "outline" : "default"}
              size="lg"
              className={
                isDark
                  ? "rounded-lg border-white/30 bg-transparent px-6 text-white hover:bg-white/10"
                  : "rounded-lg bg-navy-900 px-6 hover:bg-navy-800"
              }
              asChild
            >
              <Link href={`/${locale}/inscription`}>{labels.register}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
