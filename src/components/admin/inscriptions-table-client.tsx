"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, Eye, CheckCircle, XCircle, Info, AlertCircle,
  FileText, Download, MoreVertical, StickyNote, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateInscriptionStatus } from "@/actions/admin/inscription.actions";
import type { InscriptionStatus } from "@prisma/client";
import Link from "next/link";

const STATUS_LABELS: Record<InscriptionStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: "En attente", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", dot: "bg-amber-500" },
  IN_REVIEW: { label: "En cours", className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200", dot: "bg-blue-500" },
  INCOMPLETE: { label: "Incomplet", className: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200", dot: "bg-orange-500" },
  ACCEPTED: { label: "Accepté", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { label: "Refusé", className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200", dot: "bg-red-500" },
};

const AVATAR_PALETTE = [
  "bg-ocean-100 text-ocean-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
];

function avatarColor(seed: string) {
  const sum = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

export type AppRow = {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string | null;
  status: InscriptionStatus;
  level: { nameFr: string };
  filiere: { nameFr: string };
  submittedAt: string;
  hasDocuments: boolean;
};

/* ─────────────────────── Lightweight Modal ────────────────────────── */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────── Action Menu ──────────────────────────────── */
function ActionMenu({ app }: { app: AppRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showRefus, setShowRefus] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [motif, setMotif] = useState("");
  const [note, setNote] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const act = (status: InscriptionStatus, extra?: { motifRefus?: string; note?: string }) => {
    startTransition(async () => {
      const res = await updateInscriptionStatus({ id: app.id, status, ...extra });
      if (res.success) {
        toast.success("Statut mis à jour");
        router.refresh();
        setShowRefus(false);
        setShowNote(false);
        setMotif(""); setNote("");
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
    setOpen(false);
  };

  const isTerminal = app.status === "ACCEPTED" || app.status === "REJECTED";

  return (
    <>
      <div className="relative flex items-center gap-1" ref={menuRef}>
        {/* Consulter */}
        <Link
          href={`/admin/inscriptions/${app.id}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-ocean-50 hover:border-ocean-300 hover:text-ocean-700 transition-colors"
          title="Consulter le dossier"
        >
          <Eye className="h-3.5 w-3.5" />
        </Link>

        {/* Reçu */}
        <Link
          href={`/api/inscriptions/${app.id}/receipt`}
          target="_blank"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title="Télécharger le reçu"
        >
          <Receipt className="h-3.5 w-3.5" />
        </Link>

        {/* Pièces jointes */}
        {app.hasDocuments && (
          <Link
            href={`/admin/inscriptions/${app.id}#documents`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Voir les pièces jointes"
          >
            <Download className="h-3.5 w-3.5" />
          </Link>
        )}

        {/* More actions */}
        {!isTerminal && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={isPending}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Plus d'actions"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreVertical className="h-3.5 w-3.5" />}
            </button>

            {open && (
              <div className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {app.status !== "IN_REVIEW" && (
                  <button
                    type="button"
                    onClick={() => { act("IN_REVIEW"); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <Info className="h-3.5 w-3.5" /> Marquer en cours
                  </button>
                )}
                {app.status !== "INCOMPLETE" && (
                  <button
                    type="button"
                    onClick={() => { act("INCOMPLETE"); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange-700 hover:bg-orange-50"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> Marquer incomplet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setOpen(false); act("ACCEPTED"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Accepter
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setShowRefus(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Refuser avec motif
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => { setOpen(false); setShowNote(true); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <StickyNote className="h-3.5 w-3.5" /> Ajouter note interne
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refus modal */}
      <Modal open={showRefus} onClose={() => setShowRefus(false)} title={`Refus — ${app.reference}`}>
        <p className="mb-2 text-sm text-slate-600">
          Candidat : <strong>{app.prenom} {app.nom}</strong>
        </p>
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={4}
          placeholder="Précisez le motif du refus..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => act("REJECTED", { motifRefus: motif })}
            disabled={!motif.trim() || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirmer le refus
          </button>
          <button type="button" onClick={() => setShowRefus(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
            Annuler
          </button>
        </div>
      </Modal>

      {/* Note modal */}
      <Modal open={showNote} onClose={() => setShowNote(false)} title={`Note interne — ${app.reference}`}>
        <p className="mb-2 text-sm text-slate-600">
          Candidat : <strong>{app.prenom} {app.nom}</strong>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Note interne (visible uniquement par les admins)..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => act(app.status, { note })}
            disabled={!note.trim() || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-ocean-600 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enregistrer
          </button>
          <button type="button" onClick={() => setShowNote(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
            Annuler
          </button>
        </div>
      </Modal>
    </>
  );
}

/* ─────────────────────── Main Table ───────────────────────────────── */
export function InscriptionsTableClient({ items }: { items: AppRow[] }) {
  if (items.length === 0) {
    return (
      <tr>
        <td colSpan={10} className="py-16 text-center text-slate-400">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm font-medium text-slate-500">Aucun dossier trouvé</p>
          <p className="mt-1 text-xs text-slate-400">Essayez de modifier votre recherche ou vos filtres</p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {items.map((app) => {
        const st = STATUS_LABELS[app.status];
        const initials = `${app.prenom?.[0] ?? ""}${app.nom?.[0] ?? ""}`.toUpperCase();
        const dateStr = new Date(app.submittedAt).toLocaleDateString("fr-MA", {
          day: "2-digit", month: "2-digit", year: "numeric",
        });
        return (
          <tr key={app.id}>
            <td>
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold tracking-tight text-ocean-700">
                {app.reference}
              </span>
            </td>
            <td>
              <div className="flex items-center gap-2.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", avatarColor(app.cin))}>
                  {initials || "?"}
                </span>
                <span className="font-medium text-slate-900 whitespace-nowrap">{app.prenom} {app.nom}</span>
              </div>
            </td>
            <td className="font-mono text-xs text-slate-600">{app.cin}</td>
            <td className="text-sm whitespace-nowrap text-slate-600">{app.telephone}</td>
            <td className="text-xs text-slate-500">{app.email ?? "—"}</td>
            <td className="text-sm text-slate-700">{app.level.nameFr}</td>
            <td className="text-sm text-slate-700">{app.filiere.nameFr}</td>
            <td className="text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
            <td>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", st.className)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                {st.label}
              </span>
            </td>
            <td>
              <ActionMenu app={app} />
            </td>
          </tr>
        );
      })}
    </>
  );
}
