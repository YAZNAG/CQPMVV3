"use client";

import { useState, useEffect, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Globe } from "lucide-react";
import { createCondition, updateCondition, deleteCondition } from "@/actions/admin/inscription.actions";

type Level = { id: string; nameFr: string };
type Filiere = { id: string; nameFr: string };
type Condition = {
  id: string; levelId: string; filiereId: string | null;
  candidatProfile: string | null; textFr: string; textAr: string;
  isActive: boolean; order: number;
  level: { nameFr: string }; filiere: { nameFr: string } | null;
};

const PROFILES = [
  { value: "", label: "Tous profils" },
  { value: "COLLEGIEN", label: "Collégien" },
  { value: "PROFESSIONNEL", label: "Professionnel" },
  { value: "APPRENTISSAGE", label: "Apprentissage" },
];

function ConditionForm({
  initial, levels, filieres, onSave, onCancel,
}: {
  initial?: Condition; levels: Level[]; filieres: Filiere[]; onSave: () => void; onCancel: () => void;
}) {
  const [levelId, setLevelId] = useState(initial?.levelId ?? "");
  const [filiereId, setFiliereId] = useState(initial?.filiereId ?? "");
  const [candidatProfile, setCandidatProfile] = useState(initial?.candidatProfile ?? "");
  const [textFr, setTextFr] = useState(initial?.textFr ?? "");
  const [textAr, setTextAr] = useState(initial?.textAr ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!levelId || !textFr || !textAr) { toast.error("Niveau, texte FR et texte AR sont obligatoires"); return; }
    startTransition(async () => {
      const input = {
        levelId, filiereId: filiereId || null, candidatProfile: candidatProfile || null,
        textFr, textAr, isActive, order: parseInt(order) || 0,
      };
      const result = initial
        ? await updateCondition({ ...input, id: initial.id })
        : await createCondition(input);
      if (result.success) { toast.success(initial ? "Condition mise à jour" : "Condition créée"); onSave(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <div className="rounded-xl border border-ocean-200 bg-ocean-50 p-4">
      <h3 className="mb-4 text-sm font-semibold">{initial ? "Modifier la condition" : "Nouvelle condition d'accès"}</h3>
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
        <div className="sm:col-span-3">
          <Label className="mb-1 block text-xs">Condition FR *</Label>
          <textarea value={textFr} onChange={e => setTextFr(e.target.value)} rows={2}
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-3">
          <Label className="mb-1 block text-xs">Condition AR *</Label>
          <textarea value={textAr} onChange={e => setTextAr(e.target.value)} rows={2} dir="rtl"
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <div><Label className="mb-1 block text-xs">Ordre</Label><Input type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
          <Label htmlFor="active" className="text-xs">Active</Label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!levelId || !textFr || !textAr || isPending} className="gap-1">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial ? "Enregistrer" : "Créer"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchAll = async () => {
    setLoading(true);
    const [cRes, lRes, fRes] = await Promise.all([
      fetch(`/api/admin/inscription-conditions${filterLevel ? `?levelId=${filterLevel}` : ""}`, { cache: "no-store" }),
      fetch("/api/admin/inscription-levels", { cache: "no-store" }),
      fetch("/api/admin/inscription-filieres", { cache: "no-store" }),
    ]);
    if (cRes.ok) setConditions(await cRes.json());
    if (lRes.ok) setLevels(await lRes.json());
    if (fRes.ok) setFilieres(await fRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterLevel]);

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette condition ?")) return;
    startTransition(async () => {
      const result = await deleteCondition(id);
      if (result.success) { toast.success("Supprimée"); fetchAll(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <AdminPageShell
      title="Conditions d'accès"
      description="Gérez les conditions requises pour s'inscrire à chaque formation"
      breadcrumbs={[{ label: "Inscriptions", href: "/admin/inscriptions" }, { label: "Conditions d'accès" }]}
      actions={
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); }} className="gap-1">
          <Plus className="h-4 w-4" />Ajouter
        </Button>
      }
    >
      {showForm && !editingId && (
        <div className="mb-4">
          <ConditionForm levels={levels} filieres={filieres}
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
          <span className="text-xs text-slate-400">{conditions.length} condition(s)</span>
        </div>
      </AdminPanel>

      <AdminPanel>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-2">
            {conditions.map((c) => (
              <div key={c.id}>
                {editingId === c.id ? (
                  <ConditionForm initial={c} levels={levels} filieres={filieres}
                    onSave={() => { setEditingId(null); fetchAll(); }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-ocean-500" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm">{c.textFr}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {c.level.nameFr}
                          {c.filiere && ` › ${c.filiere.nameFr}`}
                          {c.candidatProfile && ` · ${PROFILES.find(p => p.value === c.candidatProfile)?.label}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(c.id)} className="gap-1">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" disabled={isPending}
                        onClick={() => handleDelete(c.id)}
                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {conditions.length === 0 && (
              <p className="py-8 text-center text-slate-400">Aucune condition configurée pour ce filtre</p>
            )}
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
