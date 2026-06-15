"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import { ADMIN_NAV } from "@/lib/admin/navigation";
import { canAccessNavItem } from "@/lib/auth/permissions";
import { LogoutButton } from "@/components/admin/logout-button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

interface AdminSidebarProps {
  role: UserRole;
  email: string;
  name: string | null;
  badges?: { admissions: number; contact: number };
  logoUrl?: string | null;
  siteNameFr?: string;
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  role,
  email,
  name,
  badges,
  logoUrl,
  siteNameFr = "CQPM",
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleNavigate = () => {
    onClose?.();
  };

  return (
    <aside
      className={cn(
        "flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-[#0c1929] text-white",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          className="flex items-center gap-3"
          onClick={handleNavigate}
        >
          <SiteBrandLogo logoUrl={logoUrl} size="sm" variant="dark" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">{siteNameFr}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-ocean-300/90">
              Administration
            </p>
          </div>
        </Link>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Administration">
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((item) =>
            canAccessNavItem(role, item.resource)
          );
          if (items.length === 0) return null;

          return (
            <div key={section.title} className="mb-6 last:mb-0">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const badge =
                    item.badgeKey && badges ? badges[item.badgeKey] : 0;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-ocean-600/90 text-white shadow-sm"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/5 px-3 py-2.5">
          <p className="truncate text-sm font-medium text-white">
            {name ?? "Utilisateur"}
          </p>
          <p className="truncate text-xs text-slate-400">{email}</p>
          <span className="mt-2 inline-block rounded-md bg-ocean-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-ocean-300">
            {role.replace("_", " ")}
          </span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
