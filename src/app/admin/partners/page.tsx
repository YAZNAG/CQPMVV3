import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminPartners } from "@/services/partner.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { getSiteSettings } from "@/services/site-settings.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { PartnersManager } from "@/components/admin/partners-manager";

export default async function AdminPartnersPage() {
  const session = await requirePermission("formations", "read");
  const canWrite = hasPermission(session.user.role, "formations", "write");
  const [items, settings] = await Promise.all([
    listAdminPartners(),
    getSiteSettings(),
  ]);

  return (
    <AdminPageShell
      title="Partenaires"
      description="Logos du bandeau « Partenariat » sur la page d'accueil — défilement infini avec pause au survol."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Partenaires" },
      ]}
    >
      <PartnersManager
        items={items}
        sectionPublished={isSiteSectionPublished(settings, "partners")}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
