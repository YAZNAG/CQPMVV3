"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  deleteReclamation,
  updateReclamation,
} from "@/actions/admin/reclamation.actions";
import { reclamationStatusLabel } from "@/services/reclamation.service";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ReclamationStatus, ReclamationType } from "@prisma/client";

const TYPE_LABELS: Record<ReclamationType, string> = {
  ADMINISTRATIVE: "Administrative",
  PEDAGOGICAL: "Pédagogique",
  INFRASTRUCTURE: "Infrastructure",
  OTHER: "Autre",
};

const STATUS_OPTIONS: ReclamationStatus[] = [
  "PENDING",
  "IN_REVIEW",
  "RESOLVED",
  "CLOSED",
];

export interface ReclamationRow {
  id: string;
  reference: string;
  name: string;
  cin: string;
  phone: string;
  email: string;
  type: ReclamationType;
  subject: string;
  description: string;
  attachmentUrl: string | null;
  status: ReclamationStatus;
  responseNote: string | null;
  createdAt: Date;
}

export function ReclamationInbox({
  items,
  canWrite,
}: {
  items: ReclamationRow[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<ReclamationStatus>("PENDING");
  const [responseNote, setResponseNote] = useState("");

  const startEdit = (item: ReclamationRow) => {
    setEditingId(item.id);
    setStatus(item.status);
    setResponseNote(item.responseNote ?? "");
  };

  const save = (id: string) => {
    startTransition(async () => {
      const result = await updateReclamation({
        id,
        status,
        responseNote: responseNote.trim() || null,
      });
      if (result.success) {
        toast.success("Réclamation mise à jour");
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm("Supprimer cette réclamation ?")) return;
    startTransition(async () => {
      const result = await deleteReclamation(id);
      if (result.success) {
        toast.success("Réclamation supprimée");
        if (editingId === id) setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  if (items.length === 0) {
    return (
      <AdminPanel>
        <p className="py-8 text-center text-slate-500">
          Aucune réclamation pour le moment.
        </p>
      </AdminPanel>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <AdminPanel
            className={
              item.status === "PENDING"
                ? "border-amber-300/60 ring-1 ring-amber-200/50"
                : undefined
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-navy-900">
                    {item.reference}
                  </p>
                  <Badge variant="outline">{TYPE_LABELS[item.type]}</Badge>
                  <Badge
                    variant={
                      item.status === "PENDING"
                        ? "default"
                        : item.status === "RESOLVED"
                          ? "ocean"
                          : "secondary"
                    }
                  >
                    {reclamationStatusLabel(item.status, "fr")}
                  </Badge>
                </div>
                <p className="mt-2 font-semibold text-slate-900">{item.subject}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.name} · CIN {item.cin} · {item.phone}
                </p>
                <p className="text-sm text-slate-600">
                  <a href={`mailto:${item.email}`} className="text-ocean-600 hover:underline">
                    {item.email}
                  </a>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(item.createdAt, "fr-FR")}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                  {item.description}
                </p>
                {item.attachmentUrl && (
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-ocean-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Pièce jointe
                  </a>
                )}
                {item.responseNote && editingId !== item.id && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">Réponse au demandeur</p>
                    <p className="mt-1 whitespace-pre-wrap">{item.responseNote}</p>
                  </div>
                )}
              </div>
              {canWrite && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      editingId === item.id ? setEditingId(null) : startEdit(item)
                    }
                  >
                    {editingId === item.id ? "Fermer" : "Traiter"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    disabled={isPending}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {editingId === item.id && canWrite && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  <Label htmlFor={`status-${item.id}`}>Statut</Label>
                  <select
                    id={`status-${item.id}`}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReclamationStatus)}
                    className="h-11 w-full max-w-xs rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {reclamationStatusLabel(s, "fr")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`note-${item.id}`}>
                    Réponse visible par le demandeur (suivi en ligne)
                  </Label>
                  <Textarea
                    id={`note-${item.id}`}
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    rows={4}
                    placeholder="Expliquez la décision ou la suite du traitement…"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ocean"
                    size="sm"
                    disabled={isPending}
                    onClick={() => save(item.id)}
                  >
                    Enregistrer
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/fr/contact/reclamation" target="_blank">
                      <ExternalLink className="h-4 w-4" />
                      Voir page publique
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </AdminPanel>
        </li>
      ))}
    </ul>
  );
}
