import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getOrCreateDefaultGalleryAlbum } from "@/lib/gallery/default-album";
import {
  getGalleryStats,
  listAdminGalleryItems,
} from "@/services/gallery-admin.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import { GalleryMediaManager } from "@/components/admin/gallery-media-manager";
import { GalleryPageHeroSettings } from "@/components/admin/gallery-page-hero-settings";
import { getSiteSettings } from "@/services/site-settings.service";
import { resolveGalleryPageHeroSettings } from "@/services/gallery-page.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { cn } from "@/lib/utils";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requirePermission("gallery", "read");
  const canWrite = hasPermission(session.user.role, "gallery", "write");
  const { tab } = await searchParams;
  const activeTab = tab === "videos" ? "videos" : "photos";

  const [stats, defaultAlbum, photoItems, videoItems, settings] = await Promise.all([
    getGalleryStats(),
    getOrCreateDefaultGalleryAlbum(),
    listAdminGalleryItems("PHOTO"),
    listAdminGalleryItems("VIDEO"),
    getSiteSettings(),
  ]);

  const tabs = [
    { id: "photos" as const, label: "Photos", count: stats.photos },
    { id: "videos" as const, label: "Vidéos", count: stats.videos },
  ];

  return (
    <AdminPageShell
      title="Galerie"
      description="Gérez les photos et vidéos affichées sur le site public."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Galerie" },
      ]}
    >
      <div className="mt-8">
        <AdminSectionToggleBanner
          sectionKey="gallery"
          initialPublished={isSiteSectionPublished(settings, "gallery")}
          publishedCount={stats.items}
          totalCount={stats.items}
          itemLabel="média"
          locations="/gallery & présentation"
          canWrite={canWrite}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Médias", value: stats.items },
          { label: "Photos", value: stats.photos },
          { label: "Vidéos", value: stats.videos },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/gallery?tab=${t.id}`}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
              activeTab === t.id
                ? "bg-navy-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-navy-900"
            )}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-70">({t.count})</span>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <GalleryPageHeroSettings
          page={activeTab}
          initial={resolveGalleryPageHeroSettings(settings, activeTab)}
          canWrite={canWrite}
        />
      </div>

      <div className="mt-8">
        {canWrite ? (
          <GalleryMediaManager
            mode={activeTab}
            defaultAlbumId={defaultAlbum.id}
            items={activeTab === "photos" ? photoItems : videoItems}
          />
        ) : (
          <p className="rounded-xl border bg-white p-8 text-center text-slate-500">
            Vous n&apos;avez pas les droits pour modifier la galerie.
          </p>
        )}
      </div>
    </AdminPageShell>
  );
}
