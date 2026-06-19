"use client";

import { useState, useEffect, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Paperclip } from "lucide-react";
import { createPiece, updatePiece, deletePiece } from "@/actions/admin/inscription.actions";

type Level = { id: string; nameFr: string };
type Filiere = { id: string; nameFr: string };
type Piece = {
  id: string; levelId: string; filiereId: string | null;
  candidatProfile: string | null; nameFr: string; nameAr: string;
  isRequired: boolean; maxSizeMb: number; isActive: boolean; order: number;
  level: { nameFr: string }; filiere: { nameFr: string } | null;
};

const PROFILES = [
  { value: "", label: "Tous profils" },
  { value: "COLLEGIEN", label: "Collégien" },
  { value: "PROFESSIONNEL", label: "Professionnel" },
  { value: "APPRENTISSAGE", label: "Apprentissage" },
];

function PieceForm({
  initial, levels, filieres, onSave, onCancel,
}: {
  initial?: Piece; levels: Level[]; filieres: Filiere[]; onSave: () => void; onCancel: () => void;
}) {
  const [levelId, setLevelId] = useState(initial?.levelId ?? "");
  const [filiereId, setFiliereId] = useState(initial?.filiereId ?? "");
  const [candidatProfile, setCandidatProfile] = useState(initial?.candidatProfile ?? "");
  const [nameFr, setNameFr] = useState(initial?.nameFr ?? "");
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? "");
  const [isRequired, setIsRequired] = useState(initial?.isRequired ?? true);
  const [maxSizeMb, setMaxSizeMb] = useState(String(initial?.maxSizeMb ?? 5));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!levelId || !nameFr || !nameAr) { toast.error("Niveau, nom FR et nom AR sont obligatoires"); return; }
    startTransition(async () => {
      const input = {
        levelId, filiereId: filiereId || null, candidatProfile: candidatProfile || null,
        nameFr, nameAr, isRequired, maxSizeMb: parseInt(maxSizeMb) || 5, isActive, order: parseInt(order) || 0,
      };
      const result = initial
        ? await updatePiece({ ...input, id: initial.id })
        : await createPiece(input);
      if (result.success) { toast.success(initial ? "Pièce mise à jour" : "Pièce créée"); onSave(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <div className="rounded-xl border border-ocean-200 bg-ocean-50 p-4">
      <h3 className="mb-4 text-sm font-semibold">{initial ? "Modifier la pièce" : "Nouvelle pièce demandée"}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label className="mb-1 block text-xs">Niveau *</Label>
          <select value={levelId} onChange={e => setLevelId(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="">-- Choisir --</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.nameFr}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-1 block text-xs">Filière (optionnel)</Label>
          <select value={filiereId} onChange={e => setFiliereId(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="">Toutes filières</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{f.nameFr}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-1 block text-xs">Profil candidat</Label>
          <select value={candidatProfile} onChange={e => setCandidatProfile(e.target.value)} className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
            {PROFILES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3 grid gap-3 sm:grid-cols-2">
          <div><Label className="mb-1 block text-xs">Nom FR *</Label><Input value={nameFr} onChange={e => setNameFr(e.target.value)} placeholder="Ex: Copie de la CIN" /></div>
          <div><Label className="mb-1 block text-xs">Nom AR *</Label><Input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" placeholder="اسم الوثيقة بالعربية" /></div>
        </div>
        <div><Label className="mb-1 block text-xs">Taille max (Mo)</Label><Input type="number" value={maxSizeMb} onChange={e => setMaxSizeMb(e.target.value)} min="1" max="20" /></div>
        <div><Label className="mb-1 block text-xs">Ordre</Label><Input type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
        <div className="flex items-end gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="required" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="required" className="text-xs">Obligatoire</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activeP" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="activeP" className="text-xs">Active</Label>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!levelId || !nameFr || !nameAr || isPending} className="gap-1">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial ? "Enregistrer" : "Créer"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

export default function PiecesPage() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, lRes, fRes] = await Promise.all([
      fetch(`/api/admin/inscription-pieces${filterLevel ? `?levelId=${filterLevel}` : ""}`, { cache: "no-store" }),
      fetch("/api/admin/inscription-levels", { cache: "no-store" }),
      fetch("/api/admin/inscription-filieres", { cache: "no-store" }),
    ]);
    if (pRes.ok) setPieces(await pRes.json());
    if (lRes.ok) setLevels(await lRes.json());
    if (fRes.ok) setFilieres(await fRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterLevel]);

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette pièce ?")) return;
    startTransition(async () => {
      const result = await deletePiece(id);
      if (result.success) { toast.success("Supprimée"); fetchAll(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <AdminPageShell
      title="Pièces demandées"
      description="Gérez la liste des pièces justificatives requises pour chaque inscription"
      breadcrumbs={[{ label: "Inscriptions", href: "/admin/inscriptions" }, { label: "Pièces demandées" }]}
      actions={
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); }} className="gap-1">
          <Plus className="h-4 w-4" />Ajouter
        </Button>
      }
    >
      {showForm && !editingId && (
        <div className="mb-4">
          <PieceForm levels={levels} filieres={filieres}
            onSave={() => { setShowForm(false); fetchAll(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Filters */}
      <AdminPanel className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-xs text-slate-500">Filtrer par niveau :</Label>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            className="flex h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[160px]">
            <option value="">Tous les niveaux</option>
            {levels.map(l => <option key={l.id} value={l.id}>{l.nameFr}</option>)}
          </select>
          <span className="text-xs text-slate-400">{pieces.length} pièce(s)</span>
        </div>
      </AdminPanel>

      <AdminPanel>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-2">
            {pieces.map((p) => (
              <div key={p.id}>
                {editingId === p.id ? (
                  <PieceForm initial={p} levels={levels} filieres={filieres}
                    onSave={() => { setEditingId(null); fetchAll(); }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-ocean-500" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-900 text-sm">{p.nameFr}</p>
                          {p.isRequired && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Obligatoire</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.level.nameFr}
                          {p.filiere && ` › ${p.filiere.nameFr}`}
                          {p.candidatProfile && ` · ${PROFILES.find(pr => pr.value === p.candidatProfile)?.label}`}
                          {` · Max ${p.maxSizeMb} Mo`}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(p.id)} className="gap-1">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" disabled={isPending}
                        onClick={() => handleDelete(p.id)}
                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {pieces.length === 0 && (
              <p className="py-8 text-center text-slate-400">Aucune pièce configurée pour ce filtre</p>
            )}
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
