"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, FileText, Clock, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";
import type { InscriptionStatus } from "@prisma/client";

type ApplicationResult = {
  reference: string;
  status: InscriptionStatus;
  submittedAt: string;
  level: { nameFr: string };
  filiere: { nameFr: string };
  nom: string;
  prenom: string;
  adminNote: string | null;
  motifRefus: string | null;
  documents: { piece: { nameFr: string } }[];
  statusHistory: { toStatus: InscriptionStatus; note: string | null; createdAt: string }[];
};

const STATUS_CONFIG: Record<InscriptionStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", color: "amber", icon: Clock },
  IN_REVIEW: { label: "En cours d'étude", color: "blue", icon: Info },
  INCOMPLETE: { label: "Dossier incomplet", color: "orange", icon: AlertCircle },
  ACCEPTED: { label: "Acceptée", color: "green", icon: CheckCircle },
  REJECTED: { label: "Refusée", color: "red", icon: XCircle },
};

export function SuiviInscriptionPage({ locale }: { locale: Locale }) {
  const [reference, setReference] = useState("");
  const [cin, setCin] = useState("");
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isRtl = locale === "ar";

  const handleSearch = () => {
    if (!reference.trim() || !cin.trim()) return;
    setNotFound(false);
    setResult(null);
    startTransition(async () => {
      const res = await fetch(`/api/inscriptions/suivi?reference=${encodeURIComponent(reference.trim().toUpperCase())}&cin=${encodeURIComponent(cin.trim().toUpperCase())}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data) setResult(data);
        else setNotFound(true);
      } else {
        setNotFound(true);
      }
    });
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-slate-50 to-white", isRtl && "font-arabic")} dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-[#0c1929] py-10 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-ocean-300">CQPM Nador</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Suivi de mon dossier</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-5 text-sm text-slate-600">Saisissez votre code dossier et votre CIN pour suivre l&apos;avancement de votre inscription.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ref" className="mb-1.5 block text-sm">Code dossier *</Label>
              <Input
                id="ref"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="CQPM-2026-000001"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="cin2" className="mb-1.5 block text-sm">CIN *</Label>
              <Input
                id="cin2"
                value={cin}
                onChange={(e) => setCin(e.target.value.toUpperCase())}
                placeholder="AB123456"
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={!reference.trim() || !cin.trim() || isPending} className="mt-4 w-full gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Rechercher mon dossier
          </Button>
        </div>

        {notFound && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="font-semibold text-red-800">Dossier introuvable</p>
            <p className="mt-1 text-sm text-red-700">Vérifiez votre code dossier et votre CIN.</p>
          </div>
        )}

        {result && (() => {
          const statusCfg = STATUS_CONFIG[result.status];
          const Icon = statusCfg.icon;
          return (
            <div className="mt-6 space-y-4">
              {/* Status card */}
              <div className={cn(
                "rounded-2xl border-2 p-6 text-center",
                result.status === "ACCEPTED" ? "border-green-300 bg-green-50" :
                result.status === "REJECTED" ? "border-red-300 bg-red-50" :
                result.status === "INCOMPLETE" ? "border-orange-300 bg-orange-50" :
                result.status === "IN_REVIEW" ? "border-blue-300 bg-blue-50" :
                "border-amber-300 bg-amber-50"
              )}>
                <Icon className={cn("mx-auto mb-2 h-10 w-10",
                  result.status === "ACCEPTED" ? "text-green-600" :
                  result.status === "REJECTED" ? "text-red-600" :
                  result.status === "INCOMPLETE" ? "text-orange-600" :
                  result.status === "IN_REVIEW" ? "text-blue-600" : "text-amber-600"
                )} />
                <p className="text-lg font-bold text-slate-900">{statusCfg.label}</p>
                <p className="text-sm text-slate-600">Référence : <span className="font-mono font-bold">{result.reference}</span></p>
              </div>

              {/* Details */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Détails du dossier</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidat</span>
                    <span className="font-medium">{result.prenom} {result.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Formation</span>
                    <span className="font-medium">{result.level.nameFr} — {result.filiere.nameFr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date de dépôt</span>
                    <span className="font-medium">{new Date(result.submittedAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>

              {/* Motif refus */}
              {result.status === "REJECTED" && result.motifRefus && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-red-800">Motif du refus</h3>
                  <p className="text-sm text-red-700">{result.motifRefus}</p>
                </div>
              )}

              {/* Admin note */}
              {result.adminNote && result.status !== "REJECTED" && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">Message de l&apos;administration</h3>
                  <p className="text-sm text-blue-700">{result.adminNote}</p>
                </div>
              )}

              {/* Documents */}
              {result.documents.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    Pièces reçues ({result.documents.length})
                  </h3>
                  <ul className="space-y-1">
                    {result.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-green-500" />
                        {doc.piece.nameFr}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* History */}
              {result.statusHistory.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">Historique</h3>
                  <ul className="space-y-2">
                    {result.statusHistory.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ocean-400" />
                        <div>
                          <span className="font-medium">{STATUS_CONFIG[h.toStatus]?.label}</span>
                          <span className="text-slate-400"> — {new Date(h.createdAt).toLocaleDateString("fr-FR")}</span>
                          {h.note && <p className="mt-0.5 text-slate-600">{h.note}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
