"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, Info, AlertCircle, FileText, ExternalLink, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { updateInscriptionStatus } from "@/actions/admin/inscription.actions";
import type { InscriptionStatus } from "@prisma/client";
import Link from "next/link";

const STATUS_CONFIG: Record<InscriptionStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", color: "amber", icon: Clock },
  IN_REVIEW: { label: "En cours d'étude", color: "blue", icon: Info },
  INCOMPLETE: { label: "Dossier incomplet", color: "orange", icon: AlertCircle },
  ACCEPTED: { label: "Acceptée", color: "green", icon: CheckCircle },
  REJECTED: { label: "Refusée", color: "red", icon: XCircle },
};

const PROFILE_LABELS: Record<string, string> = {
  COLLEGIEN: "Collégien",
  PROFESSIONNEL: "Professionnel",
  APPRENTISSAGE: "Apprentissage",
};

type Application = {
  id: string;
  reference: string;
  status: InscriptionStatus;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string | null;
  adresse: string;
  ville: string;
  dateNaissance: Date;
  niveauScolaire: string | null;
  experienceMois: number | null;
  candidatProfile: string;
  submittedAt: Date;
  adminNote: string | null;
  motifRefus: string | null;
  decisionDate: Date | null;
  level: { nameFr: string; nameAr: string };
  filiere: { nameFr: string; nameAr: string };
  year: { year: number };
  documents: { id: string; piece: { nameFr: string }; originalName: string; sizeBytes: number; uploadedAt: Date }[];
  statusHistory: { id: string; fromStatus: InscriptionStatus | null; toStatus: InscriptionStatus; note: string | null; createdAt: Date }[];
};

export function InscriptionDetailClient({ application: app }: { application: Application }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [motifRefus, setMotifRefus] = useState("");
  const [note, setNote] = useState("");

  const handleStatusChange = (status: InscriptionStatus, extra?: { motifRefus?: string; note?: string }) => {
    startTransition(async () => {
      const result = await updateInscriptionStatus({
        id: app.id,
        status,
        motifRefus: extra?.motifRefus,
        note: extra?.note,
      });
      if (result.success) {
        toast.success("Statut mis à jour avec succès");
        router.refresh();
        setShowRefusForm(false);
        setShowNoteForm(false);
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const statusCfg = STATUS_CONFIG[app.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Candidate + Formation */}
      <div className="space-y-4 lg:col-span-2">
        {/* Status + Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={cn("h-6 w-6",
                app.status === "ACCEPTED" ? "text-green-600" :
                app.status === "REJECTED" ? "text-red-600" :
                app.status === "INCOMPLETE" ? "text-orange-600" :
                app.status === "IN_REVIEW" ? "text-blue-600" : "text-amber-600"
              )} />
              <span className="font-semibold text-slate-900">{statusCfg.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/api/inscriptions/${app.id}/receipt`} target="_blank" className="flex items-center gap-1.5 text-xs text-ocean-600 hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Voir le reçu
              </Link>
              {app.documents.length > 0 && (
                <a href={`/api/admin/inscriptions/${app.id}/download-zip`} className="flex items-center gap-1.5 text-xs text-ocean-600 hover:underline">
                  <Archive className="h-3.5 w-3.5" /> Télécharger le dossier (ZIP)
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {app.status !== "ACCEPTED" && app.status !== "REJECTED" && (
            <div className="flex flex-wrap gap-2">
              {app.status !== "IN_REVIEW" && (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("IN_REVIEW")} disabled={isPending} className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <Info className="h-3.5 w-3.5" /> En cours d&apos;étude
                </Button>
              )}
              {app.status !== "INCOMPLETE" && (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("INCOMPLETE")} disabled={isPending} className="gap-1.5 border-orange-200 text-orange-700 hover:bg-orange-50">
                  <AlertCircle className="h-3.5 w-3.5" /> Dossier incomplet
                </Button>
              )}
              <Button size="sm" onClick={() => handleStatusChange("ACCEPTED")} disabled={isPending} className="gap-1.5 bg-green-600 hover:bg-green-700">
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <CheckCircle className="h-3.5 w-3.5" /> Accepter
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowRefusForm(!showRefusForm)} disabled={isPending} className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50">
                <XCircle className="h-3.5 w-3.5" /> Refuser
              </Button>
            </div>
          )}

          {/* Refus form */}
          {showRefusForm && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-2 text-sm font-medium text-red-800">Motif du refus *</p>
              <textarea
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                rows={3}
                placeholder="Précisez le motif du refus..."
                className="w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => handleStatusChange("REJECTED", { motifRefus })} disabled={!motifRefus.trim() || isPending} className="bg-red-600 hover:bg-red-700 gap-1">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirmer le refus
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowRefusForm(false)}>Annuler</Button>
              </div>
            </div>
          )}

          {/* Note form */}
          {!showNoteForm ? (
            <button type="button" onClick={() => setShowNoteForm(true)} className="mt-3 text-xs text-slate-400 hover:text-ocean-600">
              + Ajouter une note interne
            </button>
          ) : (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Note interne</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Note interne (visible uniquement par les admins)..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => handleStatusChange(app.status, { note })} disabled={!note.trim() || isPending} className="gap-1">
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enregistrer la note
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNoteForm(false)}>Annuler</Button>
              </div>
            </div>
          )}

          {/* Existing note/motif */}
          {app.motifRefus && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-bold uppercase text-red-700">Motif du refus</p>
              <p className="mt-1 text-sm text-red-800">{app.motifRefus}</p>
            </div>
          )}
          {app.adminNote && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Note interne</p>
              <p className="mt-1 text-sm text-slate-700">{app.adminNote}</p>
            </div>
          )}
        </div>

        {/* Candidate info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Candidat</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-slate-500">Nom complet</span><p className="font-semibold">{app.prenom} {app.nom}</p></div>
            <div><span className="text-slate-500">CIN</span><p className="font-mono font-semibold">{app.cin}</p></div>
            <div><span className="text-slate-500">Date de naissance</span><p>{new Date(app.dateNaissance).toLocaleDateString("fr-FR")}</p></div>
            <div><span className="text-slate-500">Téléphone</span><p>{app.telephone}</p></div>
            {app.email && <div><span className="text-slate-500">Email</span><p>{app.email}</p></div>}
            <div><span className="text-slate-500">Ville</span><p>{app.ville}</p></div>
            <div className="sm:col-span-2"><span className="text-slate-500">Adresse</span><p>{app.adresse}</p></div>
            {app.niveauScolaire && <div><span className="text-slate-500">Niveau scolaire</span><p>{app.niveauScolaire}</p></div>}
            {app.experienceMois !== null && <div><span className="text-slate-500">Expérience</span><p>{app.experienceMois} mois</p></div>}
          </div>
        </div>

        {/* Formation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Formation</h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-slate-500">Niveau</span><p className="font-semibold">{app.level.nameFr}</p></div>
            <div><span className="text-slate-500">Filière</span><p className="font-semibold">{app.filiere.nameFr}</p></div>
            <div><span className="text-slate-500">Profil</span><p>{PROFILE_LABELS[app.candidatProfile] ?? app.candidatProfile}</p></div>
            <div><span className="text-slate-500">Année</span><p>{app.year.year}</p></div>
            <div><span className="text-slate-500">Déposé le</span><p>{formatDate(app.submittedAt)}</p></div>
          </div>
        </div>
      </div>

      {/* Right: Documents + History */}
      <div className="space-y-4">
        {/* Documents */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Pièces jointes ({app.documents.length})
          </h3>
          {app.documents.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune pièce déposée</p>
          ) : (
            <ul className="space-y-2">
              {app.documents.map((doc) => (
                <li key={doc.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs font-medium text-slate-800">{doc.piece.nameFr}</p>
                        <p className="text-[10px] text-slate-400">{doc.originalName} — {Math.round(doc.sizeBytes / 1024)} Ko</p>
                      </div>
                    </div>
                    <a
                      href={`/api/admin/inscriptions/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-ocean-600 hover:bg-ocean-50"
                    >
                      Voir
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* History */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Historique</h3>
          <ul className="space-y-3">
            {app.statusHistory.map((h) => {
              const cfg = STATUS_CONFIG[h.toStatus];
              return (
                <li key={h.id} className="flex items-start gap-2 text-xs">
                  <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full",
                    h.toStatus === "ACCEPTED" ? "bg-green-400" :
                    h.toStatus === "REJECTED" ? "bg-red-400" :
                    h.toStatus === "IN_REVIEW" ? "bg-blue-400" : "bg-slate-300"
                  )} />
                  <div>
                    <p className="font-medium text-slate-800">{cfg?.label}</p>
                    <p className="text-slate-400">{formatDate(h.createdAt)}</p>
                    {h.note && <p className="mt-0.5 text-slate-600">{h.note}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
