import { requireAuth } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import {
  getDashboardStats,
  getRecentApplications,
  getRecentAuditLogs,
} from "@/services/admin-dashboard.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import {
  AdminDashboardContent,
  FileText,
  GraduationCap,
  Image,
  Mail,
  Newspaper,
  ScrollText,
  Users,
} from "@/components/admin/admin-dashboard-content";
import type { UserRole } from "@prisma/client";

export default async function AdminDashboardPage() {
  const session = await requireAuth();
  const role = session.user.role as UserRole;

  const [stats, recentApps, recentAudit] = await Promise.all([
    getDashboardStats(),
    hasPermission(role, "admissions", "read")
      ? getRecentApplications(5)
      : Promise.resolve([]),
    hasPermission(role, "audit", "read")
      ? getRecentAuditLogs(6)
      : Promise.resolve([]),
  ]);

  const quickLinks = [
    {
      href: "/admin/admissions",
      label: "Candidatures",
      show: hasPermission(role, "admissions", "read"),
    },
    {
      href: "/admin/news/new",
      label: "Nouvel article",
      show: hasPermission(role, "news", "write"),
    },
    {
      href: "/admin/gallery",
      label: "Galerie",
      show: hasPermission(role, "gallery", "write"),
    },
    {
      href: "/admin/events",
      label: "Événements",
      show: hasPermission(role, "hero", "write"),
    },
    {
      href: "/admin/contact",
      label: "Messages",
      show: hasPermission(role, "contact", "read"),
    },
  ].filter((l) => l.show);

  const statItems = [
    hasPermission(role, "admissions", "read") && {
      key: "applications",
      label: "Candidatures",
      value: stats.applications,
      href: "/admin/admissions",
      icon: FileText,
      variant: "ocean" as const,
    },
    hasPermission(role, "admissions", "read") && {
      key: "pending",
      label: "En attente",
      value: stats.pendingApplications,
      href: "/admin/admissions?status=PENDING",
      icon: FileText,
      variant: stats.pendingApplications > 0 ? ("warning" as const) : ("default" as const),
    },
    hasPermission(role, "users", "read") && {
      key: "users",
      label: "Utilisateurs actifs",
      value: stats.users,
      href: "/admin/users",
      icon: Users,
    },
    hasPermission(role, "formations", "read") && {
      key: "formations",
      label: "Formations publiées",
      value: stats.formations,
      href: "/admin/formations",
      icon: GraduationCap,
    },
    hasPermission(role, "news", "read") && {
      key: "news",
      label: "Articles publiés",
      value: stats.newsPublished,
      href: "/admin/news?status=published",
      icon: Newspaper,
      trend: `${stats.newsDraft} brouillon(s)`,
    },
    hasPermission(role, "gallery", "read") && {
      key: "gallery",
      label: "Médias galerie",
      value: stats.galleryItems,
      href: "/admin/gallery",
      icon: Image,
    },
    hasPermission(role, "contact", "read") && {
      key: "messages",
      label: "Messages non lus",
      value: stats.unreadMessages,
      href: "/admin/contact",
      icon: Mail,
      variant: stats.unreadMessages > 0 ? ("warning" as const) : ("default" as const),
    },
    hasPermission(role, "audit", "read") && {
      key: "audit",
      label: "Événements (24h)",
      value: stats.auditLast24h,
      href: "/admin/audit",
      icon: ScrollText,
    },
  ].filter(Boolean) as Parameters<typeof AdminDashboardContent>[0]["stats"];

  return (
    <AdminPageShell
      title="Tableau de bord"
      description={`Bienvenue, ${session.user.name ?? session.user.email}. Vue d'ensemble de la plateforme CQPM Nador.`}
    >
      <AdminDashboardContent
        userName={session.user.name ?? "Administrateur"}
        stats={statItems}
        quickLinks={quickLinks}
        recentApps={recentApps}
        recentAudit={recentAudit}
      />
    </AdminPageShell>
  );
}
