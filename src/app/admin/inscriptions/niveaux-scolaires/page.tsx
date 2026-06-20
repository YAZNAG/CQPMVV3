"use client";

import { useState, useEffect, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { createNiveauScolaire, updateNiveauScolaire, deleteNiveauScolaire } from "@/actions/admin/inscription.actions";

type NiveauScolaire = { id: string; nameFr: string; nameAr: string; isActive: boolean; order: number };

function NiveauScolaireForm({
  initial, onSave, onCancel,
}: { initial?: NiveauScolaire; onSave: () => void; onCancel: () => void }) {
  const [nameFr, setNameFr] = useState(initial?.nameFr ?? "");
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const input = { nameFr, nameAr, isActive, order: parseInt(order) || 0 };
      const result = initial ? await updateNiveauScolaire({ ...input, id: initial.id }) : await createNiveauScolaire(input);
      if (result.success) { toast.success(initial ? "Mis à jour" : "Créé"); onSave(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <div className="rounded-xl border border-ocean-200 bg-ocean-50 p-4">
      <h3 className="mb-4 text-sm font-semibold">{initial ? "Modifier" : "Nouveau niveau scolaire"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label className="mb-1 block text-xs">Nom FR *</Label><Input value={nameFr} onChange={e => setNameFr(e.target.value)} placeholder="Ex: 9ème année de l'enseignement secondaire collégial" /></div>
        <div><Label className="mb-1 block text-xs">Nom AR *</Label><Input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" /></div>
        <div><Label className="mb-1 block text-xs">Ordre</Label><Input type="number" value={order} onChange={e => setOrder(e.target.value)} /></div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
          <Label htmlFor="active" className="text-xs">Actif</Label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!nameFr || !nameAr || isPending} className="gap-1">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial ? "Enregistrer" : "Créer"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

export default function NiveauxScolairesPage() {
  const [items, setItems] = useState<NiveauScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchItems = async () => {
    const res = await fetch("/api/admin/inscription-niveaux-scolaires", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Désactiver ce niveau scolaire ?")) return;
    startTransition(async () => {
      const result = await deleteNiveauScolaire(id);
      if (result.success) { toast.success("Supprimé"); fetchItems(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <AdminPageShell
      title="Niveaux scolaires"
      description="Gérez les niveaux scolaires proposés aux candidats dans le formulaire d'inscription (à ne pas confondre avec les niveaux de formation)"
      breadcrumbs={[{ label: "Inscriptions", href: "/admin/inscriptions" }, { label: "Niveaux scolaires" }]}
      actions={<Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); }} className="gap-1"><Plus className="h-4 w-4" />Ajouter</Button>}
    >
      {showForm && !editingId && (
        <div className="mb-4">
          <NiveauScolaireForm onSave={() => { setShowForm(false); fetchItems(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}
      <AdminPanel>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-3">
            {items.map((ns) => (
              <div key={ns.id}>
                {editingId === ns.id ? (
                  <NiveauScolaireForm initial={ns} onSave={() => { setEditingId(null); fetchItems(); }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-ocean-500" />
                      <div>
                        <p className="font-medium text-slate-900">{ns.nameFr}</p>
                        <p className="text-xs text-slate-500">{ns.nameAr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ns.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {ns.isActive ? "Actif" : "Inactif"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(ns.id)} className="gap-1"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(ns.id)} disabled={isPending} className="gap-1 text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <p className="py-8 text-center text-slate-400">Aucun niveau scolaire configuré</p>}
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
