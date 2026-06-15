"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "candidatures", label: "Candidatures" },
  { id: "form", label: "Formulaire" },
  { id: "documents", label: "Pièces jointes" },
] as const;

export type AdmissionAdminTab = (typeof TABS)[number]["id"];

export function AdmissionAdminTabs({
  active,
  pending,
}: {
  active: AdmissionAdminTab;
  pending: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={
            tab.id === "candidatures"
              ? "/admin/admissions"
              : `/admin/admissions?tab=${tab.id}`
          }
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-ocean-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          {tab.label}
          {tab.id === "candidatures" && pending > 0 && (
            <span
              className={cn(
                "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                active === tab.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              )}
            >
              {pending}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
