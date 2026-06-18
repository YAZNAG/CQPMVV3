"use client";

import { useState, useEffect, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Loader2, Calendar } from "lucide-react";
import { createYear, updateYear } from "@/actions/admin/inscription.actions";
import { cn } from "@/lib/utils";

type Year = { id: string; year: number; isOpen: boolean; openDate: string | null; closeDate: string | null; _count: { applications: number } };

function YearForm({ initial, onSave, onCancel }: { initial?: Year; onSave: () => void; onCancel: () => void }) {
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [isOpen, setIsOpen] = useState(initial?.isOpen ?? false);
  const [openDate, setOpenDate] = useState(initial?.openDate ? initial.openDate.slice(0, 10) : "");
  const [closeDate, setCloseDate] = useState(initial?.closeDate ? initial.closeDate.slice(0, 10) : "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const input = { year: parseInt(year), isOpen, openDate: openDate || undefined, closeDate: closeDate || undefined };
      const result = initial ? await updateYear({ ...input, id: initial.id }) : await createYear(input);
      if (result.success) { toast.success(initial ? "Mis à jour" : "Année créée"); onSave(); }
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <div className="rounded-xl border border-ocean-200 bg-ocean-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label className="mb-1 block text-xs">Année *</Label><Input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2100" /></div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="open" checked={isOpen} onChange={e => setIsOpen(e.target.checked)} className="h-4 w-4" />
          <Label htmlFor="open" className="text-xs">Inscriptions ouvertes</Label>
        </div>
        <div><Label className="mb-1 block text-xs">Date ouverture</Label><Input type="date" value={openDate} onChange={e => setOpenDate(e.target.value)} /></div>
        <div><Label className="mb-1 block text-xs">Date clôture</Label><Input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} /></div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!year || isPending} className="gap-1">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {initial ? "Enregistrer" : "Créer"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </div>
  );
}

export default function AnneesPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchYears = async () => {
    const res = await fetch("/api/admin/inscription-years", { cache: "no-store" });
    if (res.ok) setYears(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchYears(); }, []);

  return (
    <AdminPageShell
      title="Années de concours"
      description="Gérez les années d'inscription et leur statut d'ouverture"
      breadcrumbs={[{ label: "Inscriptions", href: "/admin/inscriptions" }, { label: "Années" }]}
      actions={<Button size="sm" onClick={() => setShowForm(true)} className="gap-1"><Plus className="h-4 w-4" />Ajouter</Button>}
    >
      {showForm && !editingId && (
        <div className="mb-4">
          <YearForm onSave={() => { setShowForm(false); fetchYears(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}
      <AdminPanel>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-3">
            {years.map((yr) => (
              <div key={yr.id}>
                {editingId === yr.id ? (
                  <YearForm initial={yr} onSave={() => { setEditingId(null); fetchYears(); }} onCancel={() => setEditingId(null)} />
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-ocean-500" />
                      <div>
                        <p className="font-semibold text-slate-900">Concours {yr.year}</p>
                        <p className="text-xs text-slate-500">{yr._count.applications} candidature(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", yr.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {yr.isOpen ? "Ouvert" : "Fermé"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(yr.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {years.length === 0 && <p className="py-8 text-center text-slate-400">Aucune année configurée</p>}
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
