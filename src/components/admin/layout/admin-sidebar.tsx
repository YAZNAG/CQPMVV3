"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
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
    const base = href.split("?")[0];
    if (base === "/admin") return pathname === "/admin";
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const parentContainsActive = (item: (typeof ADMIN_NAV)[0]["items"][0]) => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  };

  const getInitialExpanded = () => {
    const expanded: Record<string, boolean> = {};
    for (const section of ADMIN_NAV) {
      for (const item of section.items) {
        if (item.children && parentContainsActive(item)) {
          expanded[item.href] = true;
        }
      }
    }
    return expanded;
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>(getInitialExpanded);

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const section of ADMIN_NAV) {
        for (const item of section.items) {
          if (item.children && parentContainsActive(item)) {
            next[item.href] = true;
          }
        }
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (href: string) => {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const handleNavigate = () => {
    onClose?.();
  };

  const getBadgeCount = (badgeKey?: "admissions" | "contact" | "reclamations") => {
    if (!badgeKey || !badges) return 0;
    if (badgeKey === "admissions") return badges.admissions;
    if (badgeKey === "contact" || badgeKey === "reclamations") return badges.contact;
    return 0;
  };

  return (
    <aside
      className={cn(
        "flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-[#0c1929] text-white",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3" onClick={handleNavigate}>
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Administration">
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((item) =>
            canAccessNavItem(role, item.resource)
          );
          if (items.length === 0) return null;

          return (
            <div key={section.title} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expanded[item.href];
                  const isParentActive = hasChildren ? parentContainsActive(item) : isActive(item.href);
                  const badge = getBadgeCount(item.badgeKey);

                  if (hasChildren) {
                    return (
                      <li key={item.href}>
                        {/* Accordion toggle */}
                        <button
                          type="button"
                          onClick={() => toggleGroup(item.href)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                            isParentActive
                              ? "bg-white/10 text-white"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-90" />
                          <span className="flex-1 truncate">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </button>

                        {/* Sub-items */}
                        {isExpanded && (
                          <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-white/10 pl-3">
                            {item.children!
                              .filter((child) => canAccessNavItem(role, child.resource))
                              .map((child) => {
                                const ChildIcon = child.icon;
                                const childActive = isActive(child.href);
                                const childBadge = getBadgeCount(child.badgeKey);
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={handleNavigate}
                                      className={cn(
                                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                                        childActive
                                          ? "bg-ocean-600/90 text-white shadow-sm"
                                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                                      )}
                                      aria-current={childActive ? "page" : undefined}
                                    >
                                      <ChildIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                                      <span className="flex-1 truncate">{child.label}</span>
                                      {childBadge > 0 && (
                                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                                          {childBadge > 99 ? "99+" : childBadge}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  // Simple link (no children)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isParentActive
                            ? "bg-ocean-600/90 text-white shadow-sm"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                        aria-current={isParentActive ? "page" : undefined}
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

      {/* User info & logout */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/5 px-3 py-2.5">
          <p className="truncate text-sm font-medium text-white">{name ?? "Utilisateur"}</p>
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
