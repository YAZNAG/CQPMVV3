"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "messages", label: "Messages" },
  { id: "form", label: "Formulaire" },
  { id: "settings", label: "Coordonnées" },
] as const;

export type ContactAdminTab = (typeof TABS)[number]["id"];

export function ContactAdminTabs({
  active,
  unread,
}: {
  active: ContactAdminTab;
  unread: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/admin/contact?tab=${tab.id}`}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-ocean-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          {tab.label}
          {tab.id === "messages" && unread > 0 && (
            <span
              className={cn(
                "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                active === tab.id ? "bg-white/20 text-white" : "bg-ocean-100 text-ocean-700"
              )}
            >
              {unread}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
