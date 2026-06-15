import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { listAdminHomeFormations } from "@/services/home-formation-showcase.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { HomeFormationsManager } from "@/components/admin/home-formations-manager";

export default async function AdminHomeFormationsPage() {
  const session = await requirePermission("formations", "read");
  const canWrite = hasPermission(session.user.role, "formations", "write");
  const [settings, formations] = await Promise.all([
    getSiteSettings(),
    listAdminHomeFormations(),
  ]);

  return (
    <AdminPageShell
      title="Formations — page d'accueil"
      description="Choisissez quelles formations du catalogue afficher sur la page d'accueil."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Formations accueil" },
      ]}
    >
      <HomeFormationsManager
        canWrite={canWrite}
        formations={formations}
        sectionPublished={isSiteSectionPublished(settings, "formations")}
        section={{
          homeFormationsTitleFr:
            settings.homeFormationsTitleFr ?? "Nos formations",
          homeFormationsTitleAr:
            settings.homeFormationsTitleAr ?? "تكويناتنا",
          homeFormationsSubtitleFr:
            settings.homeFormationsSubtitleFr ??
            "Parcours certifiés en pêche, navigation et sécurité maritime",
          homeFormationsSubtitleAr:
            settings.homeFormationsSubtitleAr ??
            "مسارات معتمدة في الصيد البحري والملاحة والسلامة",
          homeFormationsCtaLabelFr:
            settings.homeFormationsCtaLabelFr ?? "Voir tout",
          homeFormationsCtaLabelAr:
            settings.homeFormationsCtaLabelAr ?? "عرض الكل",
          homeFormationsCtaHref: settings.homeFormationsCtaHref ?? "/formations",
        }}
      />
    </AdminPageShell>
  );
}
