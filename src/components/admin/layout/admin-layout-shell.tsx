"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import type { UserRole } from "@prisma/client";

interface AdminLayoutShellProps {
  role: UserRole;
  email: string;
  name: string | null;
  badges: { admissions: number; contact: number };
  logoUrl?: string | null;
  siteNameFr: string;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  role,
  email,
  name,
  badges,
  logoUrl,
  siteNameFr,
  children,
}: AdminLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        role={role}
        email={email}
        name={name}
        badges={badges}
        logoUrl={logoUrl}
        siteNameFr={siteNameFr}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <SiteBrandLogo logoUrl={logoUrl} size="sm" />
            <span className="truncate text-sm font-bold text-slate-900">
              {siteNameFr}
            </span>
          </Link>
          <div className="w-10" aria-hidden />
        </header>

        {children}
      </div>
    </div>
  );
}
