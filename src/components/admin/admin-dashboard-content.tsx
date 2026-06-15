import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Calendar,
  FileText,
  GraduationCap,
  Image,
  Mail,
  Newspaper,
  ScrollText,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@prisma/client";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  STATUS_CHANGE: "Changement statut",
  RESTORE: "Restauration",
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UPDATE: "bg-ocean-500/10 text-ocean-700 ring-ocean-500/20",
  DELETE: "bg-red-50 text-red-700 ring-red-200",
  LOGIN: "bg-slate-100 text-slate-700 ring-slate-200",
  LOGOUT: "bg-slate-100 text-slate-600 ring-slate-200",
  STATUS_CHANGE: "bg-amber-50 text-amber-700 ring-amber-200",
  RESTORE: "bg-violet-50 text-violet-700 ring-violet-200",
};

const QUICK_LINK_ICONS: Record<string, LucideIcon> = {
  "/admin/admissions": FileText,
  "/admin/news/new": Newspaper,
  "/admin/gallery": Image,
  "/admin/events": Calendar,
  "/admin/contact": Mail,
};

interface QuickLink {
  href: string;
  label: string;
}

interface RecentApp {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: Date;
}

interface RecentAudit {
  id: string;
  action: string;
  entity: string;
  createdAt: Date;
  user: { name: string | null; email: string | null } | null;
}

interface StatItem {
  key: string;
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "ocean";
  trend?: string;
}

interface AdminDashboardContentProps {
  userName: string;
  stats: StatItem[];
  quickLinks: QuickLink[];
  recentApps: RecentApp[];
  recentAudit: RecentAudit[];
}

export function AdminDashboardContent({
  userName,
  stats,
  quickLinks,
  recentApps,
  recentAudit,
}: AdminDashboardContentProps) {
  return (
    <div className="space-y-8">
      <AdminPanel className="relative overflow-hidden !p-6 lg:!p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ocean-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-navy-900/5 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-ocean-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ocean-700">
              <Sparkles className="h-3.5 w-3.5" />
              Administration
            </span>
            <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
              Bonjour, {userName}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Voici un aperçu de l&apos;activité sur la plateforme CQPM Nador.
            </p>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-ocean-600 text-white shadow-lg shadow-ocean-900/20">
            <Zap className="h-6 w-6" />
          </span>
        </div>
      </AdminPanel>

      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <AdminStatCard
              key={stat.key}
              label={stat.label}
              value={stat.value}
              href={stat.href}
              icon={stat.icon}
              variant={stat.variant}
              trend={stat.trend}
            />
          ))}
        </div>
      )}

      {quickLinks.length > 0 && (
        <AdminPanel className="!p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Actions rapides
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickLinks.map((link) => {
              const Icon = QUICK_LINK_ICONS[link.href] ?? ArrowRight;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-ocean-300/60 hover:bg-white hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-ocean-600 shadow-sm ring-1 ring-slate-100 transition group-hover:bg-ocean-500 group-hover:text-white group-hover:ring-ocean-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                    {link.label}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-ocean-500" />
                </Link>
              );
            })}
          </div>
        </AdminPanel>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {recentApps.length > 0 && (
          <AdminPanel noPadding className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-500/10 text-ocean-600">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="font-semibold text-slate-900">Dernières candidatures</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700"
                asChild
              >
                <Link href="/admin/admissions">Tout voir</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Candidat
                    </th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApps.map((app) => (
                    <tr key={app.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/admissions/${app.id}`}
                          className="font-semibold text-ocean-700 transition hover:text-ocean-800 hover:underline"
                        >
                          {app.firstName} {app.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <ApplicationStatusBadge status={app.status as ApplicationStatus} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(app.createdAt, "fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPanel>
        )}

        {recentAudit.length > 0 && (
          <AdminPanel noPadding className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <ScrollText className="h-4 w-4" />
                </span>
                <h2 className="font-semibold text-slate-900">Activité récente</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700"
                asChild
              >
                <Link href="/admin/audit">Journal complet</Link>
              </Button>
            </div>
            <ul className="divide-y divide-slate-100">
              {recentAudit.map((log) => (
                <li
                  key={log.id}
                  className="flex gap-4 px-6 py-4 transition-colors hover:bg-slate-50/60"
                >
                  <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-ocean-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                          ACTION_STYLES[log.action] ??
                            "bg-slate-100 text-slate-700 ring-slate-200"
                        )}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{log.entity}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {log.user?.name ?? log.user?.email ?? "Système"} ·{" "}
                      {formatDate(log.createdAt, "fr-FR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </AdminPanel>
        )}
      </div>
    </div>
  );
}

export {
  FileText,
  Users,
  GraduationCap,
  Newspaper,
  Image,
  Mail,
  ScrollText,
};
