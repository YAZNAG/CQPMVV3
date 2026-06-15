import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminNavigation } from "@/services/navigation.service";
import { listAdminSitePages } from "@/services/site-page.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { SitePagesManager } from "@/components/admin/site-pages-manager";

export default async function AdminSitePagesPage() {
  const session = await requirePermission("pages", "read");
  const canWrite = hasPermission(session.user.role, "pages", "write");
  const [items, { links }] = await Promise.all([
    listAdminSitePages(),
    listAdminNavigation(),
  ]);

  return (
    <AdminPageShell
      title="Pages du site"
      description="Créez des pages de contenu (FR/AR) et liez-les au menu — pas seulement des liens externes."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Pages" },
      ]}
    >
      <SitePagesManager items={items} navParents={links} canWrite={canWrite} />
    </AdminPageShell>
  );
}
