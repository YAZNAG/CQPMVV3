import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  href?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "warning" | "success" | "ocean";
}

const variants = {
  default: "border-slate-200/80 bg-white",
  warning: "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white",
  success: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white",
  ocean: "border-ocean-200/80 bg-gradient-to-br from-ocean-50/70 to-white",
};

const iconVariants = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  ocean: "bg-gradient-to-br from-ocean-500 to-navy-700 text-white shadow-md shadow-ocean-900/15",
};

export function AdminStatCard({
  label,
  value,
  href,
  icon: Icon,
  trend,
  variant = "default",
}: AdminStatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ocean-900/5",
        variants[variant],
        href && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
          {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
        </div>
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconVariants[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
