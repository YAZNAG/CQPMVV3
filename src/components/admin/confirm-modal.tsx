"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  icon,
  accent = "ocean",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "ocean" | "red" | "emerald" | "orange";
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const accentClasses: Record<string, string> = {
    ocean: "from-ocean-500 to-navy-800",
    red: "from-red-500 to-red-700",
    emerald: "from-emerald-500 to-emerald-700",
    orange: "from-orange-500 to-orange-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={cn("flex items-start gap-3 bg-gradient-to-br px-6 py-5 text-white", accentClasses[accent])}>
          {icon && <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-white/80">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1 text-white/70 hover:bg-white/15 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children && <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}
