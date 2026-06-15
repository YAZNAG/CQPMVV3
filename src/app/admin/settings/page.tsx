import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { listAdminSiteStats } from "@/services/site-stat.service";
import { listAdminSocialLinks } from "@/services/site-social-link.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { SiteStatsManager } from "@/components/admin/site-stats-manager";
import { SocialLinksManager } from "@/components/admin/social-links-manager";

export default async function AdminSettingsPage() {
  const session = await requirePermission("settings", "read");
  const canWrite = hasPermission(session.user.role, "settings", "write");
  const [settings, siteStats, socialLinks] = await Promise.all([
    getSiteSettings(),
    listAdminSiteStats(),
    listAdminSocialLinks(),
  ]);

  return (
    <AdminPageShell
      title="Paramètres du site"
      description="Coordonnées, identité bilingue, chiffres clés et réseaux sociaux."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Paramètres" },
      ]}
    >
      <div className="max-w-4xl space-y-8">
        <SettingsForm
          canWrite={canWrite}
          settings={{
            siteNameFr: settings.siteNameFr,
            siteNameAr: settings.siteNameAr,
            logoUrl: settings.logoUrl,
            email: settings.email,
            phone: settings.phone,
            addressFr: settings.addressFr,
            addressAr: settings.addressAr,
            aboutImageUrl: settings.aboutImageUrl,
            aboutPresentationFr: settings.aboutPresentationFr,
            aboutPresentationAr: settings.aboutPresentationAr,
            missionFr: settings.missionFr,
            missionAr: settings.missionAr,
          }}
        />
        <SiteStatsManager
          items={siteStats}
          sectionPublished={isSiteSectionPublished(settings, "stats")}
          canWrite={canWrite}
        />
        <SocialLinksManager items={socialLinks} canWrite={canWrite} />
      </div>
    </AdminPageShell>
  );
}
