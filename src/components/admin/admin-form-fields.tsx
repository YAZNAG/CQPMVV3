"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldInputClass =
  "mt-1.5 border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

export function AdminField({
  label,
  value,
  onChange,
  type = "text",
  className,
  dir,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  dir?: "rtl";
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInputClass}
        dir={dir}
        placeholder={placeholder}
        required={required}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function AdminTextField({
  label,
  value,
  onChange,
  className,
  dir,
  rows = 3,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  dir?: "rtl";
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={fieldInputClass}
        dir={dir}
        placeholder={placeholder}
      />
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AdminBilingualGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>
  );
}

export function AdminFormFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminSelect({
  label,
  id,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1.5 flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm transition-colors focus:border-ocean-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/20",
          className
        )}
      >
        {children}
      </select>
    </div>
  );
}
