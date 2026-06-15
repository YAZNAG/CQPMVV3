import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getSiteSettings } from "@/services/site-settings.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { DirectorMessageManager } from "@/components/admin/director-message-manager";

export default async function AdminDirectorPage() {
  const session = await requirePermission("hero", "read");
  const canWrite = hasPermission(session.user.role, "hero", "write");
  const settings = await getSiteSettings();

  return (
    <AdminPageShell
      title="Mot du directeur"
      description="Citation, photo et titre affichés sous la section À propos sur l'accueil."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Mot du directeur" },
      ]}
    >
      <DirectorMessageManager
        canWrite={canWrite}
        settings={{
          directorPhotoUrl: settings.directorPhotoUrl,
          directorQuoteFr: settings.directorQuoteFr,
          directorQuoteAr: settings.directorQuoteAr,
          directorBodyFr: settings.directorBodyFr,
          directorBodyAr: settings.directorBodyAr,
          directorNameFr: settings.directorNameFr,
          directorNameAr: settings.directorNameAr,
          directorTitleFr: settings.directorTitleFr,
          directorTitleAr: settings.directorTitleAr,
          directorMessagePublished: settings.directorMessagePublished,
        }}
      />
    </AdminPageShell>
  );
}
