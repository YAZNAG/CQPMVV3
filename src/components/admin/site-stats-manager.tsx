"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createSiteStat,
  deleteSiteStat,
  updateSiteStat,
} from "@/actions/admin/site-stat.actions";
import type { SiteStatRecord } from "@/services/site-stat.service";
import { SITE_STAT_ICON_OPTIONS } from "@/lib/site-icons";
import type { SiteStatIcon } from "@prisma/client";
import { cn } from "@/lib/utils";

type StatFormState = {
  labelFr: string;
  labelAr: string;
  value: number;
  icon: SiteStatIcon;
  showPlus: boolean;
  order: number;
  isPublished: boolean;
};

const defaultForm = (items: SiteStatRecord[]): StatFormState => ({
  labelFr: "",
  labelAr: "",
  value: 0,
  icon: "USERS",
  showPlus: true,
  order: items.length,
  isPublished: true,
});

interface SiteStatsManagerProps {
  items: SiteStatRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

export function SiteStatsManager({ items, sectionPublished, canWrite }: SiteStatsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(items));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(items));
  };

  const loadEdit = (item: SiteStatRecord) => {
    setEditingId(item.id);
    setForm({
      labelFr: item.labelFr,
      labelAr: item.labelAr,
      value: item.value,
      icon: item.icon,
      showPlus: item.showPlus,
      order: item.order,
      isPublished: item.isPublished,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const result = editingId
        ? await updateSiteStat({ id: editingId, ...form })
        : await createSiteStat(form);

      if (result.success) {
        toast.success(editingId ? "Chiffre mis à jour" : "Chiffre ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer ce chiffre clé ?")) return;

    startTransition(async () => {
      const result = await deleteSiteStat(id);
      if (result.success) {
        toast.success("Chiffre supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const publishedCount = items.filter((i) => i.isPublished).length;

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="stats"
        initialPublished={sectionPublished}
        publishedCount={publishedCount}
        totalCount={items.length}
        itemLabel="chiffre"
        locations="accueil"
        canWrite={canWrite}
      />

    <AdminPanel>
      <AdminPanelHeader
        icon={BarChart3}
        title="Chiffres clés"
        description="Statistiques affichées sur la page d'accueil. Ajoutez, modifiez ou supprimez des chiffres."
      />

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminCard className="xl:col-span-3">
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle className="text-lg">Chiffres ({items.length})</AdminCardTitle>
            {canWrite && (
              <Button type="button" variant="ocean" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Nouveau chiffre
              </Button>
            )}
          </AdminCardHeader>
          <AdminCardContent>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun chiffre configuré.</p>
            ) : (
              <ul className="divide-y">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between gap-4 py-4",
                      editingId === item.id && "rounded-lg bg-ocean-50/40 px-3"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-navy-900">
                        {item.value.toLocaleString()}
                        {item.showPlus ? "+" : ""} — {item.labelFr}
                      </p>
                      <p className="text-sm text-slate-600" dir="rtl">
                        {item.labelAr}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ordre {item.order}
                        {!item.isPublished && " · Masqué"}
                      </p>
                    </div>
                    {canWrite && (
                      <div className="flex shrink-0 gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => loadEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </AdminCardContent>
        </AdminCard>

        {canWrite && (
          <AdminCard className="xl:col-span-2">
            <AdminCardHeader>
              <AdminCardTitle className="text-lg">
                {editingId ? "Modifier le chiffre" : "Nouveau chiffre"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="statLabelFr">Libellé (FR)</Label>
                  <Input
                    id="statLabelFr"
                    value={form.labelFr}
                    onChange={(e) => setForm({ ...form, labelFr: e.target.value })}
                    placeholder="Stagiaires formés"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statLabelAr">Libellé (AR)</Label>
                  <Input
                    id="statLabelAr"
                    value={form.labelAr}
                    onChange={(e) => setForm({ ...form, labelAr: e.target.value })}
                    placeholder="متدربون مؤهلون"
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="statValue">Valeur</Label>
                    <Input
                      id="statValue"
                      type="number"
                      min={0}
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statOrder">Ordre</Label>
                    <Input
                      id="statOrder"
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statIcon">Icône</Label>
                  <select
                    id="statIcon"
                    value={form.icon}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value as typeof form.icon })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {SITE_STAT_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.showPlus}
                    onChange={(e) => setForm({ ...form, showPlus: e.target.checked })}
                  />
                  Afficher le « + » après le chiffre
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  Publié
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="ocean" disabled={isPending}>
                    {editingId ? "Enregistrer" : "Ajouter"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </AdminCardContent>
          </AdminCard>
        )}
      </div>
    </AdminPanel>
    </div>
  );
}
