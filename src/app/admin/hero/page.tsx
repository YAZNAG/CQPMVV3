import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminHeroSlides } from "@/services/hero-slide.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";
import { getSiteSettings } from "@/services/site-settings.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
import { Button } from "@/components/ui/button";

export default async function AdminHeroPage() {
  const session = await requirePermission("hero", "read");
  const canWrite = hasPermission(session.user.role, "hero", "write");
  const [slides, settings] = await Promise.all([
    listAdminHeroSlides(),
    getSiteSettings(),
  ]);

  return (
    <AdminPageShell
      title="Hero / Slider"
      description="Gérez les slides de la page d'accueil : image, titre, texte, boutons et ordre."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Hero / Slider" },
      ]}
    >
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/highlights">Gérer les cartes sous le hero (Mdiq, Larache…)</Link>
        </Button>
      </div>
      <HeroSlidesManager
        slides={slides}
        sectionPublished={isSiteSectionPublished(settings, "hero")}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
