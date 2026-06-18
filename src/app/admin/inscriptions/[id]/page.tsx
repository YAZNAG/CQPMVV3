import { requirePermission } from "@/lib/auth/guards";
import { notFound } from "next/navigation";
import { getInscriptionApplicationById } from "@/services/inscription-admin.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { InscriptionDetailClient } from "@/components/admin/inscription-detail-client";

export default async function InscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("admissions", "read");
  const { id } = await params;
  const app = await getInscriptionApplicationById(id);
  if (!app) notFound();

  return (
    <AdminPageShell
      title={`Dossier ${app.reference}`}
      description={`${app.prenom} ${app.nom} — ${app.level.nameFr} / ${app.filiere.nameFr}`}
      breadcrumbs={[
        { label: "Inscriptions", href: "/admin/inscriptions" },
        { label: app.reference },
      ]}
    >
      <InscriptionDetailClient application={app} />
    </AdminPageShell>
  );
}
