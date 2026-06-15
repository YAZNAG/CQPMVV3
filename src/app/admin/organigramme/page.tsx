import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import {
  getOrgChartPageSettings,
  listAdminOrgChartNodes,
} from "@/services/org-chart.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { OrgChartManager } from "@/components/admin/org-chart-manager";

export default async function AdminOrganigrammePage() {
  const session = await requirePermission("pages", "read");
  const canWrite = hasPermission(session.user.role, "pages", "write");
  const [nodes, page] = await Promise.all([
    listAdminOrgChartNodes(),
    getOrgChartPageSettings(),
  ]);

  return (
    <AdminPageShell
      title="Organigramme"
      description="Structure organisationnelle du centre — postes, services et hiérarchie."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Organigramme" },
      ]}
    >
      <OrgChartManager nodes={nodes} page={page} canWrite={canWrite} />
    </AdminPageShell>
  );
}
