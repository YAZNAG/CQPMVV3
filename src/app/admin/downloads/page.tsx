import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import {
  getDownloadsSectionSettings,
  listAdminDownloadResources,
} from "@/services/download.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { DownloadsManager } from "@/components/admin/downloads-manager";

export default async function AdminDownloadsPage() {
  const session = await requirePermission("pages", "read");
  const canWrite = hasPermission(session.user.role, "pages", "write");
  const [items, section] = await Promise.all([
    listAdminDownloadResources(),
    getDownloadsSectionSettings(),
  ]);

  return (
    <AdminPageShell
      title="Espace Téléchargement"
      description="Documents et ressources affichés sur la page Présentation et /telechargements."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Téléchargements" },
      ]}
    >
      <DownloadsManager items={items} section={section} canWrite={canWrite} />
    </AdminPageShell>
  );
}
