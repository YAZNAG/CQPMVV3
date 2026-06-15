"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Info,
  Shield,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { Container } from "@/components/public/container";
import { Button } from "@/components/ui/button";
import { parseBulletLines } from "@/lib/formation-ui";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const MODULE_ICONS = [Wrench, Zap, Shield, Target];

interface FormationDetailViewProps {
  locale: Locale;
  coverImage: string;
  formation: {
    title: string;
    description: string;
    objectives: string;
    requirements: string;
    duration: string;
    categoryName: string;
    categorySlug: string;
  };
  labels: {
    presentation: string;
    objectives: string;
    program: string;
    careers: string;
    requirements: string;
    documents: string;
    register: string;
    faq: string;
    openEnrollment: string;
  };
  breadcrumbs: { label: string; href: string }[];
  admissionHref: string;
  formationsHref: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function FormationDetailView({
  locale,
  coverImage,
  formation,
  labels,
  breadcrumbs,
  admissionHref,
  formationsHref,
}: FormationDetailViewProps) {
  const objectiveLines = parseBulletLines(formation.objectives);
  const requirementLines = parseBulletLines(formation.requirements);
  const programModules = objectiveLines.slice(0, 4);
  const careerTags = requirementLines.slice(0, 4);
  const isRtl = locale === "ar";

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${coverImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-950/82" aria-hidden />
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
                    <Link href={crumb.href} className="hover:text-white">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="w-full">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              {formation.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-navy-100/90 md:text-base">
              {formation.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <BadgePill icon={Clock} label={formation.duration} tone="blue" />
              <BadgePill icon={GraduationCap} label={formation.categoryName} tone="slate" />
              <BadgePill icon={CheckCircle2} label={labels.openEnrollment} tone="green" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f6f8] py-12 lg:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-6 lg:col-span-2">
              <DetailCard
                index={0}
                icon={Info}
                title={labels.presentation}
                iconBg="bg-sky-100 text-sky-700"
              >
                <p className="leading-relaxed text-slate-600">{formation.description}</p>
                {objectiveLines.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {objectiveLines.map((line) => (
                      <li key={line} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </DetailCard>

              {programModules.length > 0 && (
                <DetailCard
                  index={1}
                  icon={Target}
                  title={labels.program}
                  iconBg="bg-violet-100 text-violet-700"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {programModules.map((line, i) => {
                      const Icon = MODULE_ICONS[i % MODULE_ICONS.length];
                      return (
                        <div
                          key={line}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
                        >
                          <Icon className="mb-2 h-5 w-5 text-ocean-600" />
                          <p className="text-sm font-semibold text-navy-900">{line}</p>
                        </div>
                      );
                    })}
                  </div>
                </DetailCard>
              )}

              {careerTags.length > 0 && (
                <DetailCard
                  index={2}
                  icon={Briefcase}
                  title={labels.careers}
                  iconBg="bg-emerald-100 text-emerald-700"
                >
                  <div className="flex flex-wrap gap-2">
                    {careerTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-800"
                      >
                        <Briefcase className="h-3.5 w-3.5 text-ocean-600" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </DetailCard>
              )}
            </div>

            <motion.aside
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-5">
                <div className="overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-premium-lg">
                  <h2 className="text-lg font-bold">{labels.requirements}</h2>
                  <ul className="mt-5 space-y-4">
                    {requirementLines.map((line) => (
                      <li key={line} className="flex gap-3 text-sm leading-relaxed text-navy-100">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-sky-300">
                    {labels.documents}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-navy-200">
                    <li>• CIN (PDF)</li>
                    <li>• {locale === "ar" ? "شهادة دراسية" : "Diplôme / attestation"}</li>
                    <li>• {locale === "ar" ? "شهادة طبية" : "Certificat médical"}</li>
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 w-full bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <Link href={admissionHref}>
                      {labels.register}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 shrink-0 text-ocean-600" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900">
                        {locale === "ar" ? "سؤال؟" : "Une question ?"}
                      </p>
                      <Link
                        href={`/${locale}/contact`}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ocean-700 hover:underline"
                      >
                        FAQ
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                <Link
                  href={formationsHref}
                  className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-ocean-700"
                >
                  ← {locale === "ar" ? "جميع التكوينات" : "Toutes les formations"}
                </Link>
              </div>
            </motion.aside>
          </div>
        </Container>
      </section>
    </>
  );
}

function DetailCard({
  index,
  icon: Icon,
  title,
  iconBg,
  children,
}: {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="flex items-center gap-3 text-xl font-bold text-navy-900">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </motion.article>
  );
}

function BadgePill({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "blue" | "slate" | "green";
}) {
  const tones = {
    blue: "bg-sky-500/20 text-sky-100 border-sky-400/30",
    slate: "bg-white/10 text-white border-white/20",
    green: "bg-emerald-500/20 text-emerald-100 border-emerald-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
        tones[tone]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
