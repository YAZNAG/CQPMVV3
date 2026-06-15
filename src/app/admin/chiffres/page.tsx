import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import {
  getChiffresPageSettings,
  listAdminChiffresFormationItems,
  listAdminChiffresGrowthBars,
  listAdminChiffresHighlights,
  listAdminChiffresInfrastructureItems,
} from "@/services/chiffres.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { ChiffresManager } from "@/components/admin/chiffres-manager";

export default async function AdminChiffresPage() {
  const session = await requirePermission("pages", "read");
  const canWrite = hasPermission(session.user.role, "pages", "write");
  const [page, highlights, growthBars, formationItems, infrastructureItems] =
    await Promise.all([
      getChiffresPageSettings(),
      listAdminChiffresHighlights(),
      listAdminChiffresGrowthBars(),
      listAdminChiffresFormationItems(),
      listAdminChiffresInfrastructureItems(),
    ]);

  return (
    <AdminPageShell
      title="Nador en Chiffres"
      description="Page chiffres clés — statistiques, graphiques, capacités et CTA."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Nador en Chiffres" },
      ]}
    >
      <ChiffresManager
        page={page}
        highlights={highlights}
        growthBars={growthBars}
        formationItems={formationItems}
        infrastructureItems={infrastructureItems}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
