"use client";

import {
  BookOpen,
  Box,
  Building2,
  ChevronRight,
  GraduationCap,
  Shield,
  Ship,
  User,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/public/container";
import { SITE_IMAGES } from "@/lib/site-images";
import type { PublicOrgChartNode } from "@/services/org-chart.service";
import type { OrgChartNodeAccent, OrgChartNodeIcon, OrgChartNodeStyle } from "@prisma/client";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

export type OrganigrammeBreadcrumb = {
  label: string;
  href: string;
};

const ICONS: Record<
  OrgChartNodeIcon,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  USER: User,
  USERS: Users,
  WRENCH: Wrench,
  BUILDING: Building2,
  SHIP: Ship,
  GRADUATION_CAP: GraduationCap,
  SHIELD: Shield,
  BOOK: BookOpen,
  BOX: Box,
  NONE: User,
};

const ACCENT_STYLES: Record<OrgChartNodeAccent, { border: string; icon: string; bg: string }> = {
  NONE: { border: "border-slate-300", icon: "text-slate-600", bg: "bg-white" },
  PINK: { border: "border-rose-400", icon: "text-rose-500", bg: "bg-rose-50/40" },
  GREEN: { border: "border-emerald-500", icon: "text-emerald-600", bg: "bg-emerald-50/40" },
  PURPLE: { border: "border-violet-500", icon: "text-violet-600", bg: "bg-violet-50/40" },
  YELLOW: { border: "border-amber-400", icon: "text-amber-600", bg: "bg-amber-50/40" },
  TEAL: { border: "border-teal-500", icon: "text-teal-600", bg: "bg-teal-50/40" },
  SKY: { border: "border-sky-400", icon: "text-sky-600", bg: "bg-sky-50/40" },
};

function HelmWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="10" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 60 + Math.cos(angle) * 14;
        const y1 = 60 + Math.sin(angle) * 14;
        const x2 = 60 + Math.cos(angle) * 50;
        const y2 = 60 + Math.sin(angle) * 50;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="3"
          />
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = ((i + 0.5) * Math.PI) / 4;
        const x1 = 60 + Math.cos(angle) * 22;
        const y1 = 60 + Math.sin(angle) * 22;
        const x2 = 60 + Math.cos(angle) * 46;
        const y2 = 60 + Math.sin(angle) * 46;
        return (
          <line
            key={`inner-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

function OrgChartNodeCard({
  node,
  leadershipLevel,
}: {
  node: PublicOrgChartNode;
  leadershipLevel?: number;
}) {
  const Icon = ICONS[node.icon] ?? User;
  const isLeadership = node.style === "LEADERSHIP";

  if (isLeadership) {
    const bg =
      leadershipLevel === 0
        ? "bg-[#0a2d52]"
        : leadershipLevel === 1
          ? "bg-[#1a5490]"
          : "bg-[#0a2d52]";

    return (
      <div
        className={cn(
          "flex min-w-[11.5rem] max-w-[13rem] items-center gap-3 rounded-lg px-4 py-3 text-white shadow-[0_4px_14px_rgba(10,45,82,0.28)]",
          bg
        )}
      >
        <Icon className="h-5 w-5 shrink-0 text-white/90" strokeWidth={1.75} />
        <div className="min-w-0 flex-1 text-left">
          <span className="block text-[11px] font-bold uppercase leading-tight tracking-wide sm:text-xs">
            {node.title}
          </span>
          <span className="mt-1.5 block h-0.5 w-7 rounded-full bg-orange-500" aria-hidden />
        </div>
      </div>
    );
  }

  const departmentStyles: Record<
    Exclude<OrgChartNodeStyle, "LEADERSHIP">,
    { box: string; icon: string }
  > = {
    DEPARTMENT_WHITE: {
      box: "border border-slate-200 bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
      icon: "text-slate-600",
    },
    DEPARTMENT_BLUE: {
      box: "border border-sky-300 bg-sky-50/60 text-slate-800 shadow-[0_2px_8px_rgba(14,116,144,0.12)]",
      icon: "text-sky-600",
    },
    DEPARTMENT_ORANGE: {
      box: "border border-orange-300 bg-orange-50/70 text-slate-800 shadow-[0_2px_8px_rgba(234,88,12,0.12)]",
      icon: "text-orange-600",
    },
    UNIT: "",
  };

  const accent = ACCENT_STYLES[node.accent];
  const deptStyle =
    node.style !== "UNIT"
      ? departmentStyles[node.style]
      : { box: cn("border-2", accent.border, accent.bg, "text-slate-800 shadow-sm"), icon: accent.icon };

  return (
    <div
      className={cn(
        "flex min-w-[8.5rem] max-w-[10.5rem] items-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-semibold leading-snug sm:min-w-[9rem] sm:text-[11px]",
        deptStyle.box
      )}
    >
      {node.icon !== "NONE" && (
        <Icon className={cn("h-4 w-4 shrink-0", deptStyle.icon)} strokeWidth={1.75} />
      )}
      <span className="flex-1 text-center">{node.title}</span>
    </div>
  );
}

function collectLeadershipStack(node: PublicOrgChartNode) {
  const stack: PublicOrgChartNode[] = [node];
  let current = node;
  while (
    current.children.length === 1 &&
    current.children[0].style === "LEADERSHIP"
  ) {
    current = current.children[0];
    stack.push(current);
  }
  return { stack, branch: current };
}

function OrgChartSvgDefs() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
      <defs>
        <marker
          id="org-arrow-down"
          viewBox="0 0 10 10"
          refX="5"
          refY="8"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M2 2 L8 5 L2 8 Z" fill="#334155" />
        </marker>
        <marker
          id="org-arrow-right"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M2 2 L8 5 L2 8 Z" fill="#334155" />
        </marker>
        <marker
          id="org-arrow-left"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M8 2 L2 5 L8 8 Z" fill="#475569" />
        </marker>
      </defs>
    </svg>
  );
}

function DottedDownArrow({ height = 22 }: { height?: number }) {
  return (
    <svg width={12} height={height} className="shrink-0 overflow-visible" aria-hidden>
      <line
        x1={6}
        y1={0}
        x2={6}
        y2={height - 2}
        stroke="#475569"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#org-arrow-down)"
      />
    </svg>
  );
}

function DottedHorizontalLine({ className }: { className?: string }) {
  return (
    <svg className={cn("h-2 w-full overflow-visible", className)} preserveAspectRatio="none" aria-hidden>
      <line
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="#475569"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function DoubleHeadedDottedArrow({ width = 96 }: { width?: number }) {
  return (
    <svg width={width} height={12} className="overflow-visible" aria-hidden>
      <line
        x1={6}
        y1={6}
        x2={width - 6}
        y2={6}
        stroke="#475569"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerStart="url(#org-arrow-left)"
        markerEnd="url(#org-arrow-right)"
      />
    </svg>
  );
}

function SolidDownArrow({ height = 18 }: { height?: number }) {
  return (
    <svg width={12} height={height} className="shrink-0 overflow-visible" aria-hidden>
      <line
        x1={6}
        y1={0}
        x2={6}
        y2={height - 2}
        stroke="#334155"
        strokeWidth="1.5"
        markerEnd="url(#org-arrow-down)"
      />
    </svg>
  );
}

function ChildTreeBranches({ children }: { children: PublicOrgChartNode[] }) {
  if (children.length === 0) return null;

  if (children.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <SolidDownArrow height={20} />
        <OrgChartNodeCard node={children[0]} />
      </div>
    );
  }

  const rowHeight = 46;
  const trunkX = 10;
  const branchLength = 14;
  const trunkTop = 10;
  const trunkBottom = trunkTop + (children.length - 1) * rowHeight + rowHeight / 2;

  return (
    <div className="mt-1 flex items-start justify-center">
      <svg
        width={trunkX + branchLength + 4}
        height={trunkBottom + 4}
        className="shrink-0 overflow-visible"
        aria-hidden
      >
        <line
          x1={trunkX}
          y1={0}
          x2={trunkX}
          y2={trunkTop}
          stroke="#334155"
          strokeWidth="1.5"
        />
        <line
          x1={trunkX}
          y1={trunkTop}
          x2={trunkX}
          y2={trunkBottom}
          stroke="#334155"
          strokeWidth="1.5"
        />
        {children.map((_, index) => {
          const y = trunkTop + index * rowHeight + rowHeight / 2;
          return (
            <line
              key={index}
              x1={trunkX}
              y1={y}
              x2={trunkX + branchLength}
              y2={y}
              stroke="#334155"
              strokeWidth="1.5"
              markerEnd="url(#org-arrow-right)"
            />
          );
        })}
      </svg>
      <div className="flex flex-col" style={{ gap: rowHeight - 36, paddingTop: trunkTop - 4 }}>
        {children.map((child) => (
          <div key={child.id} className="flex items-center" style={{ minHeight: 36 }}>
            <OrgChartNodeCard node={child} />
          </div>
        ))}
      </div>
    </div>
  );
}

function isOrangePeerLink(current: PublicOrgChartNode, previous?: PublicOrgChartNode) {
  return (
    !!previous &&
    previous.style === "DEPARTMENT_ORANGE" &&
    current.style === "DEPARTMENT_ORANGE"
  );
}

function DepartmentColumn({
  node,
  peerLinkFromLeft,
}: {
  node: PublicOrgChartNode;
  peerLinkFromLeft?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {peerLinkFromLeft ? (
        <div className="absolute -left-[50%] top-[18px] z-10 hidden w-full justify-center lg:flex">
          <DoubleHeadedDottedArrow width={110} />
        </div>
      ) : null}
      <DottedDownArrow height={20} />
      <OrgChartNodeCard node={node} />
      <ChildTreeBranches children={node.children} />
    </div>
  );
}

function OrgChartTree({ roots }: { roots: PublicOrgChartNode[] }) {
  if (roots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
        Organigramme en cours de mise à jour.
      </p>
    );
  }

  const { stack, branch } = collectLeadershipStack(roots[0]);
  const departments = branch.children;

  return (
    <div className="relative flex w-full flex-col items-center">
      <OrgChartSvgDefs />

      <div className="flex flex-col items-center">
        {stack.map((node, index) => (
          <div key={node.id} className="flex flex-col items-center">
            <OrgChartNodeCard node={node} leadershipLevel={index} />
            {index < stack.length - 1 && <DottedDownArrow height={24} />}
          </div>
        ))}
      </div>

      {departments.length > 0 && (
        <div className="relative mt-0 w-full">
          <div className="flex justify-center">
            <DottedDownArrow height={28} />
          </div>
          <div className="relative mx-auto w-full">
            <DottedHorizontalLine className="absolute left-0 right-0 top-0" />
            <div className="grid grid-cols-2 gap-x-2 gap-y-10 pt-5 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-3">
              {departments.map((dept, index) => (
                <DepartmentColumn
                  key={dept.id}
                  node={dept}
                  peerLinkFromLeft={isOrangePeerLink(dept, departments[index - 1])}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrganigrammeSitePageProps {
  locale: Locale;
  title: string;
  subtitle: string;
  backgroundUrl?: string | null;
  roots: PublicOrgChartNode[];
  breadcrumbs: OrganigrammeBreadcrumb[];
}

export function OrganigrammeSitePage({
  locale,
  title,
  subtitle,
  backgroundUrl,
  roots,
  breadcrumbs,
}: OrganigrammeSitePageProps) {
  const isRtl = locale === "ar";
  const heroBg = backgroundUrl || SITE_IMAGES.about;

  return (
    <article>
      <section className="relative min-h-[220px] overflow-hidden bg-slate-200 md:min-h-[260px]">
        <HelmWatermark
          className={cn(
            "pointer-events-none absolute top-1/2 z-[1] h-56 w-56 -translate-y-1/2 text-white opacity-[0.12] sm:h-72 sm:w-72",
            isRtl ? "-right-10" : "-left-10"
          )}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isRtl
              ? "bg-gradient-to-l from-white/92 via-white/72 to-white/35"
              : "bg-gradient-to-r from-white/92 via-white/72 to-white/35"
          )}
          aria-hidden
        />

        <Container className="relative z-[2] py-8 md:py-11">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 md:text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 opacity-50", isRtl && "rotate-180")}
                      aria-hidden
                    />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-slate-600">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-[#0a2d52] hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="w-full">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0a2d52] md:text-[2.35rem]">
              {title}
            </h1>
            <span className="mt-2 block h-1 w-14 rounded-full bg-orange-500" aria-hidden />
            {subtitle ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-white py-10 md:py-14">
        <Container>
          <OrgChartTree roots={roots} />
        </Container>
      </section>
    </article>
  );
}
