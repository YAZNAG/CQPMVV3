import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminHomeEvents } from "@/services/home-engagement.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { getSiteSettings } from "@/services/site-settings.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { HomeEventsManager } from "@/components/admin/home-events-manager";

export default async function AdminEventsPage() {
  const session = await requirePermission("hero", "read");
  const canWrite = hasPermission(session.user.role, "hero", "write");
  const [events, settings] = await Promise.all([
    listAdminHomeEvents(),
    getSiteSettings(),
  ]);

  return (
    <AdminPageShell
      title="Événements"
      description="Agenda des activités affiché sur la page Événements et la section accueil."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Événements" },
      ]}
    >
      <HomeEventsManager
        events={events}
        sectionPublished={isSiteSectionPublished(settings, "events")}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
