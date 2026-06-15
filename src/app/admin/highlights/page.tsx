import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminHomeHighlights } from "@/services/home-highlight.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { getSiteSettings } from "@/services/site-settings.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { HomeHighlightsManager } from "@/components/admin/home-highlights-manager";
import { Button } from "@/components/ui/button";

export default async function AdminHighlightsPage() {
  const session = await requirePermission("hero", "read");
  const canWrite = hasPermission(session.user.role, "hero", "write");
  const [items, settings] = await Promise.all([
    listAdminHomeHighlights(),
    getSiteSettings(),
  ]);

  return (
    <AdminPageShell
      title="Cartes sous le hero"
      description="Bandeau coloré (Mdiq, Larache, Mehdia…) — titre, chiffres, couleur, icône et ordre."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Cartes sous hero" },
      ]}
    >
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/hero">Gérer le slider hero</Link>
        </Button>
      </div>
      <HomeHighlightsManager
        items={items}
        sectionPublished={isSiteSectionPublished(settings, "highlights")}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
