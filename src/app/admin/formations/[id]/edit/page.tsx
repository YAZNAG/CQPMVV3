import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import {
  getAdminFormationById,
  listAdminFormationCategories,
} from "@/services/formation-admin.service";
import { FormationForm } from "@/components/admin/formation-form";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { Badge } from "@/components/ui/badge";

export default async function AdminFormationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("formations", "write");
  const { id } = await params;

  const [formation, categories] = await Promise.all([
    getAdminFormationById(id),
    listAdminFormationCategories(),
  ]);

  if (!formation) notFound();

  return (
    <AdminPageShell
      title={formation.titleFr}
      description={`Slug : ${formation.slug}`}
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Formations", href: "/admin/formations" },
        { label: "Modifier" },
      ]}
      actions={
        <Badge
          className={
            formation.isPublished
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-700"
          }
        >
          {formation.isPublished ? "Active" : "Inactive"}
        </Badge>
      }
    >
      <FormationForm
        categories={categories.map((c) => ({
          id: c.id,
          nameFr: c.nameFr,
          slug: c.slug,
        }))}
        initial={{
          id: formation.id,
          categoryId: formation.categoryId,
          slug: formation.slug,
          titleFr: formation.titleFr,
          titleAr: formation.titleAr,
          descriptionFr: formation.descriptionFr,
          descriptionAr: formation.descriptionAr,
          objectivesFr: formation.objectivesFr,
          objectivesAr: formation.objectivesAr,
          durationFr: formation.durationFr,
          durationAr: formation.durationAr,
          requirementsFr: formation.requirementsFr,
          requirementsAr: formation.requirementsAr,
          imageUrl: formation.imageUrl,
          order: formation.order,
          isPublished: formation.isPublished,
        }}
      />
    </AdminPageShell>
  );
}
