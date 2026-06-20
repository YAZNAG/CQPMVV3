"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2, CheckCircle, XCircle, Clock, Info, AlertCircle, FileText,
  ExternalLink, Archive, ArrowLeft, Mail, MailWarning, History as HistoryIcon,
  StickyNote, ClipboardCheck, ShieldAlert, CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { updateInscriptionStatus } from "@/actions/admin/inscription.actions";
import type { InscriptionStatus, EmailLogType, EmailLogStatus } from "@prisma/client";

const STATUS_CONFIG: Record<InscriptionStatus, { label: string; color: string; icon: typeof Clock; badge: string }> = {
  PENDING: { label: "En attente", color: "amber", icon: Clock, badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
  IN_REVIEW: { label: "En cours d'étude", color: "blue", icon: Info, badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200" },
  INCOMPLETE: { label: "Dossier incomplet", color: "orange", icon: AlertCircle, badge: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200" },
  ACCEPTED: { label: "Acceptée", color: "green", icon: CheckCircle, badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" },
  REJECTED: { label: "Refusée", color: "red", icon: XCircle, badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200" },
};

const PROFILE_LABELS: Record<string, string> = {
  COLLEGIEN: "Collégien",
  PROFESSIONNEL: "Professionnel",
  APPRENTISSAGE: "Apprentissage",
};

const EMAIL_TYPE_LABELS: Record<EmailLogType, string> = {
  INSCRIPTION_SUBMITTED_ADMIN: "Nouvelle inscription → Admin",
  INSCRIPTION_SUBMITTED_CANDIDATE: "Confirmation → Candidat",
  INSCRIPTION_STATUS_CANDIDATE: "Changement statut → Candidat",
  CONTACT_ADMIN: "Contact → Admin",
  CONTACT_ACK: "Contact → Accusé",
  RECLAMATION_ADMIN: "Réclamation → Admin",
  RECLAMATION_ACK: "Réclamation → Accusé",
};

const EMAIL_STATUS_BADGE: Record<EmailLogStatus, string> = {
  SENT: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

type Piece = { id: string; nameFr: string; isRequired: boolean; maxSizeMb: number };
type RequiredPieceRow = { piece: Piece; document: DocumentRow | null };
type DocumentRow = { id: string; piece: { nameFr: string }; originalName: string; sizeBytes: number; uploadedAt: Date };
type EmailLogRow = { id: string; type: EmailLogType; status: EmailLogStatus; recipient: string; subject: string; errorMessage: string | null; sentAt: Date };

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
  documents: DocumentRow[];
  statusHistory: { id: string; fromStatus: InscriptionStatus | null; toStatus: InscriptionStatus; note: string | null; createdAt: Date }[];
  requiredPieces: RequiredPieceRow[];
  missingPieces: RequiredPieceRow[];
  conditions: { id: string; textFr: string }[];
  emailLogs: EmailLogRow[];
};

const TABS = [
  { id: "resume", label: "Résumé", icon: ClipboardCheck },
  { id: "pieces", label: "Pièces", icon: FileText },
  { id: "historique", label: "Historique", icon: HistoryIcon },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "notes", label: "Notes", icon: StickyNote },
] as const;

type TabId = typeof TABS[number]["id"];

export function InscriptionDetailClient({ application: app }: { application: Application }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>("resume");
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
  const missingCount = app.missingPieces.length;

  return (
    <div className="space-y-5">
      {/* ── Header dossier ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-navy-800 text-white font-bold">
              {app.prenom[0]}{app.nom[0]}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-ocean-700">{app.reference}</span>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", statusCfg.badge)}>
                  <StatusIcon className="h-3 w-3" /> {statusCfg.label}
                </span>
                {missingCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-inset ring-orange-200">
                    <ShieldAlert className="h-3 w-3" /> {missingCount} pièce(s) manquante(s)
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900">{app.prenom} {app.nom}</h2>
              <p className="text-xs text-slate-500">
                {app.level.nameFr} · {app.filiere.nameFr} · {PROFILE_LABELS[app.candidatProfile] ?? app.candidatProfile} — déposé le {formatDate(app.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/admin/inscriptions"><ArrowLeft className="h-3.5 w-3.5" /> Retour</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href={`/api/inscriptions/${app.id}/receipt`} target="_blank"><ExternalLink className="h-3.5 w-3.5" /> Reçu</Link>
            </Button>
            {app.documents.length > 0 && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href={`/api/admin/inscriptions/${app.id}/download-zip`}><Archive className="h-3.5 w-3.5" /> ZIP</a>
              </Button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {app.status !== "ACCEPTED" && app.status !== "REJECTED" && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
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
            <Button size="sm" onClick={() => handleStatusChange("ACCEPTED")} disabled={isPending} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <CheckCircle className="h-3.5 w-3.5" /> Accepter
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRefusForm(!showRefusForm)} disabled={isPending} className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50">
              <XCircle className="h-3.5 w-3.5" /> Refuser
            </Button>
          </div>
        )}

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

        {app.motifRefus && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-bold uppercase text-red-700">Motif du refus</p>
            <p className="mt-1 text-sm text-red-800">{app.motifRefus}</p>
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                isActive ? "bg-white text-ocean-700 shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.id === "pieces" && missingCount > 0 && (
                <span className="rounded-full bg-orange-200 px-1.5 text-[10px] font-bold text-orange-800">{missingCount}</span>
              )}
              {t.id === "emails" && app.emailLogs.length > 0 && (
                <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-bold text-slate-700">{app.emailLogs.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {tab === "resume" && (
        <div className="grid gap-4 lg:grid-cols-2">
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

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Formation demandée</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div><span className="text-slate-500">Niveau</span><p className="font-semibold">{app.level.nameFr}</p></div>
              <div><span className="text-slate-500">Filière</span><p className="font-semibold">{app.filiere.nameFr}</p></div>
              <div><span className="text-slate-500">Profil</span><p>{PROFILE_LABELS[app.candidatProfile] ?? app.candidatProfile}</p></div>
              <div><span className="text-slate-500">Année</span><p>{app.year.year}</p></div>
            </div>
            {app.conditions.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Conditions applicables</p>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  {app.conditions.map((c) => (
                    <li key={c.id} className="flex gap-2"><CircleDot className="mt-1 h-2.5 w-2.5 shrink-0 text-ocean-400" />{c.textFr}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "pieces" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pièces du dossier</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pièce demandée</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Obligatoire</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fichier déposé</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date dépôt</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {app.requiredPieces.map(({ piece, document }) => {
                    const received = !!document;
                    return (
                      <tr key={piece.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-slate-800">{piece.nameFr}</td>
                        <td className="px-4 py-3">
                          {piece.isRequired
                            ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-200">Obligatoire</span>
                            : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Optionnelle</span>}
                        </td>
                        <td className="px-4 py-3">
                          {received ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                              <CheckCircle className="h-3 w-3" /> Reçue
                            </span>
                          ) : piece.isRequired ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
                              <XCircle className="h-3 w-3" /> Manquante
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                              Non fournie
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{document?.originalName ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{document ? formatDate(document.uploadedAt) : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {document && (
                            <a href={`/api/admin/inscriptions/documents/${document.id}`} target="_blank" rel="noopener noreferrer"
                              className="rounded px-2 py-1 text-xs font-medium text-ocean-600 hover:bg-ocean-50">
                              Voir / Télécharger
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {app.requiredPieces.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucune pièce paramétrée pour ce niveau/filière/profil</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {missingCount > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-800">
                <ShieldAlert className="h-4 w-4" /> Pièces manquantes ({missingCount})
              </p>
              <ul className="space-y-1 text-sm text-orange-800">
                {app.missingPieces.map(({ piece }) => <li key={piece.id}>• {piece.nameFr}</li>)}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Tous les fichiers déposés ({app.documents.length})
            </h3>
            {app.documents.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun fichier déposé</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {app.documents.map((doc) => (
                  <li key={doc.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-800">{doc.piece.nameFr}</p>
                          <p className="truncate text-[10px] text-slate-400">{doc.originalName} — {Math.round(doc.sizeBytes / 1024)} Ko</p>
                        </div>
                      </div>
                      <a href={`/api/admin/inscriptions/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-ocean-600 hover:bg-ocean-50">
                        Voir
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "historique" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Historique du dossier</h3>
          <ul className="space-y-4">
            {app.statusHistory.map((h) => {
              const cfg = STATUS_CONFIG[h.toStatus];
              return (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    h.toStatus === "ACCEPTED" ? "bg-emerald-400" :
                    h.toStatus === "REJECTED" ? "bg-red-400" :
                    h.toStatus === "IN_REVIEW" ? "bg-blue-400" : "bg-slate-300"
                  )} />
                  <div>
                    <p className="font-medium text-slate-800">{cfg?.label}</p>
                    <p className="text-xs text-slate-400">{formatDate(h.createdAt)}</p>
                    {h.note && <p className="mt-0.5 text-slate-600">{h.note}</p>}
                  </div>
                </li>
              );
            })}
            {app.statusHistory.length === 0 && <p className="text-sm text-slate-400">Aucun historique</p>}
          </ul>
        </div>
      )}

      {tab === "emails" && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Emails liés au dossier</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Destinataire</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sujet</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {app.emailLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-xs text-slate-700">{EMAIL_TYPE_LABELS[log.type]}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.recipient}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.subject}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", EMAIL_STATUS_BADGE[log.status])}>
                        {log.status === "FAILED" && <MailWarning className="h-3 w-3" />}
                        {log.status === "SENT" ? "Envoyé" : "Échoué"}
                      </span>
                      {log.errorMessage && <p className="mt-1 text-[10px] text-red-500">{log.errorMessage}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(log.sentAt)}</td>
                  </tr>
                ))}
                {app.emailLogs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Aucun email enregistré pour ce dossier</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Notes internes</h3>

          {app.adminNote && (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Note actuelle</p>
              <p className="mt-1 text-sm text-slate-700">{app.adminNote}</p>
            </div>
          )}

          {!showNoteForm ? (
            <button type="button" onClick={() => setShowNoteForm(true)} className="text-sm text-ocean-600 hover:underline">
              + Ajouter / modifier la note interne
            </button>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
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
        </div>
      )}
    </div>
  );
}
