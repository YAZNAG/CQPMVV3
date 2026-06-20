import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const panelClass =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)]";

export function AdminPanel({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={cn(panelClass, !noPadding && "p-6 lg:p-7", className)}>{children}</div>
  );
}

export function AdminPanelHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-navy-800 text-white shadow-md shadow-ocean-900/20">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Alias layout for list + form split views (replaces shadcn Card in admin). */
export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(panelClass, className)}>{children}</div>;
}

export function AdminCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-slate-900", className)}>
      {children}
    </h3>
  );
}

export function AdminCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(panelClass, "overflow-x-auto")}>
      <table
        className={cn(
          "w-full text-left text-sm",
          "[&_thead]:bg-slate-50/80 [&_thead]:border-b [&_thead]:border-slate-200",
          "[&_th]:px-4 [&_th]:py-3 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500 [&_th]:whitespace-nowrap",
          "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr]:last:border-0 [&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-ocean-50/40",
          "[&_td]:px-4 [&_td]:py-3.5 [&_td]:align-middle [&_td]:text-slate-700"
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function AdminEmptyState({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center text-sm text-slate-500",
        className
      )}
    >
      {children}
    </div>
  );
}
