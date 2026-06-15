import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { getApplicationById } from "@/services/application.service";
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { ApplicationReviewPanel } from "@/components/admin/application-review-panel";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { DocumentType } from "@prisma/client";

const DOC_LABELS: Partial<Record<DocumentType, string>> = {
  CIN: "Carte d'identité (CIN)",
  DIPLOMA: "Diplôme / attestation",
  PHOTO: "Photo d'identité",
  OTHER: "Document",
};

const GENDER_LABELS = { M: "Masculin", F: "Féminin", OTHER: "Autre" } as const;

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("admissions", "read");
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  const canWrite = hasPermission(session.user.role, "admissions", "write");

  return (
    <AdminPageShell
      title={`${application.firstName} ${application.lastName}`}
      description={application.referenceNumber}
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Candidatures", href: "/admin/admissions" },
        { label: application.referenceNumber },
      ]}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/admissions">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ApplicationStatusBadge status={application.status} />
        <span className="text-sm text-slate-500">
          Reçue le {formatDate(application.createdAt, "fr-FR")}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <InfoRow label="CIN" value={application.cin} />
              <InfoRow
                label="Date de naissance"
                value={formatDate(application.birthDate, "fr-FR")}
              />
              <InfoRow label="Sexe" value={GENDER_LABELS[application.gender]} />
              <InfoRow label="Niveau scolaire" value={application.educationLevel} />
              <InfoRow label="Ville" value={application.city} />
              <InfoRow label="Adresse" value={application.address} className="sm:col-span-2" />
              <InfoRow
                label="Email"
                value={application.email}
                href={`mailto:${application.email}`}
                icon={Mail}
              />
              <InfoRow
                label="Téléphone"
                value={application.phone}
                href={`tel:${application.phone}`}
                icon={Phone}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formation demandée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-navy-900">{application.formation.titleFr}</p>
              <p className="mt-1 text-sm text-slate-600">{application.formation.titleAr}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {application.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.mediaFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-sm transition-colors hover:border-ocean-300 hover:bg-ocean-50/30"
                >
                  <span className="font-medium text-navy-800">
                    {doc.labelFr ?? DOC_LABELS[doc.type] ?? doc.documentKey}
                  </span>
                  <ExternalLink className="h-4 w-4 text-ocean-600" />
                </a>
              ))}
            </CardContent>
          </Card>

          {application.statusNote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dernière note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {application.statusNote}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <ApplicationReviewPanel
            applicationId={application.id}
            currentStatus={application.status}
            currentNote={application.statusNote}
            canWrite={canWrite}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique de revue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              {application.reviewedAt ? (
                <>
                  <p>
                    Dernière revue : {formatDate(application.reviewedAt, "fr-FR")}
                  </p>
                  {application.reviewer && (
                    <p>
                      Par : {application.reviewer.name ?? application.reviewer.email}
                    </p>
                  )}
                </>
              ) : (
                <p>Aucune revue enregistrée</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageShell>
  );
}

function InfoRow({
  label,
  value,
  href,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: typeof Mail;
  className?: string;
}) {
  const content = href ? (
    <a href={href} className="text-ocean-600 hover:underline">
      {value}
    </a>
  ) : (
    <span className="text-navy-900">{value}</span>
  );

  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {content}
      </p>
    </div>
  );
}
