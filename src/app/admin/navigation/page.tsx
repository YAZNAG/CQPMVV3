import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminNavigation } from "@/services/navigation.service";
import { listPublishedSitePagesForNav } from "@/services/site-page.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { NavigationManager } from "@/components/admin/navigation-manager";

export default async function AdminNavigationPage() {
  const session = await requirePermission("navigation", "read");
  const canWrite = hasPermission(session.user.role, "navigation", "write");
  const [{ links, buttons }, publishedPages] = await Promise.all([
    listAdminNavigation(),
    listPublishedSitePagesForNav(),
  ]);

  return (
    <AdminPageShell
      title="Navigation du site"
      description="Gérez les liens du menu. Pour créer une nouvelle page de contenu, utilisez Pages CMS."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Navigation" },
      ]}
    >
      <NavigationManager
        links={links}
        buttons={buttons}
        publishedPages={publishedPages}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
