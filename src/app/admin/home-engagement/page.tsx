import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import {
  listAdminHomeEngagementItems,
  listAdminHomeEvents,
} from "@/services/home-engagement.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { HomeEngagementManager } from "@/components/admin/home-engagement-manager";

export default async function AdminHomeEngagementPage() {
  const session = await requirePermission("hero", "read");
  const canWrite = hasPermission(session.user.role, "hero", "write");
  const [settings, engagementItems, events] = await Promise.all([
    getSiteSettings(),
    listAdminHomeEngagementItems(),
    listAdminHomeEvents(),
  ]);

  return (
    <AdminPageShell
      title="Engagement & événements"
      description="Section accueil : événements, points d'engagement, vidéo et bannière contact."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Engagement accueil" },
      ]}
    >
      <HomeEngagementManager
        canWrite={canWrite}
        sectionPublished={isSiteSectionPublished(settings, "engagement")}
        engagementItems={engagementItems}
        events={events}
        section={{
          homeEventsTitleFr:
            settings.homeEventsTitleFr ?? "Événements et Activités",
          homeEventsTitleAr: settings.homeEventsTitleAr ?? "الفعاليات والأنشطة",
          homeEventsEmptyFr:
            settings.homeEventsEmptyFr ??
            "Aucun événement ou activité pour le moment.",
          homeEventsEmptyAr:
            settings.homeEventsEmptyAr ?? "لا توجد فعاليات أو أنشطة حالياً.",
          homeEngagementTitleFr:
            settings.homeEngagementTitleFr ?? "Notre engagement en action",
          homeEngagementTitleAr:
            settings.homeEngagementTitleAr ?? "التزامنا في الميدان",
          homeEngagementBackgroundUrl: settings.homeEngagementBackgroundUrl ?? "",
          homeEngagementMediaUrl: settings.homeEngagementMediaUrl ?? "",
          homeEngagementMediaThumbnailUrl:
            settings.homeEngagementMediaThumbnailUrl ?? "",
          homeContactBannerTitleFr:
            settings.homeContactBannerTitleFr ??
            "Pour toutes vos questions et opinions",
          homeContactBannerTitleAr:
            settings.homeContactBannerTitleAr ?? "لجميع أسئلتكم وآرائكم",
          homeContactBannerSubtitleFr:
            settings.homeContactBannerSubtitleFr ?? "Contactez-nous",
          homeContactBannerSubtitleAr:
            settings.homeContactBannerSubtitleAr ?? "تواصلوا معنا",
          homeContactBannerPhone:
            settings.homeContactBannerPhone ?? settings.phone ?? "+212 536 32 00 00",
          homeContactBannerHref: settings.homeContactBannerHref ?? "/contact",
          homeContactBannerBackgroundUrl:
            settings.homeContactBannerBackgroundUrl ?? "",
        }}
      />
    </AdminPageShell>
  );
}
