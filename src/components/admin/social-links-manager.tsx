"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import {
  createSiteSocialLink,
  deleteSiteSocialLink,
  updateSiteSocialLink,
} from "@/actions/admin/site-social-link.actions";
import type { SiteSocialLinkRecord } from "@/services/site-social-link.service";
import { SOCIAL_PLATFORM_OPTIONS, socialPlatformLabel } from "@/lib/site-icons";
import type { SocialPlatform } from "@prisma/client";
import { cn } from "@/lib/utils";

type SocialFormState = {
  platform: SocialPlatform;
  labelFr: string;
  labelAr: string;
  url: string;
  order: number;
  isPublished: boolean;
};

const defaultForm = (items: SiteSocialLinkRecord[]): SocialFormState => ({
  platform: "FACEBOOK",
  labelFr: "",
  labelAr: "",
  url: "",
  order: items.length,
  isPublished: true,
});

interface SocialLinksManagerProps {
  items: SiteSocialLinkRecord[];
  canWrite: boolean;
}

export function SocialLinksManager({ items, canWrite }: SocialLinksManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(items));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(items));
  };

  const loadEdit = (item: SiteSocialLinkRecord) => {
    setEditingId(item.id);
    setForm({
      platform: item.platform,
      labelFr: item.labelFr ?? "",
      labelAr: item.labelAr ?? "",
      url: item.url,
      order: item.order,
      isPublished: item.isPublished,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      ...form,
      labelFr: form.labelFr.trim() || null,
      labelAr: form.labelAr.trim() || null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateSiteSocialLink({ id: editingId, ...payload })
        : await createSiteSocialLink(payload);

      if (result.success) {
        toast.success(editingId ? "Réseau mis à jour" : "Réseau ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer ce lien ?")) return;

    startTransition(async () => {
      const result = await deleteSiteSocialLink(id);
      if (result.success) {
        toast.success("Lien supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={Share2}
        title="Réseaux sociaux"
        description="Liens affichés dans le pied de page. Ajoutez Facebook, Instagram, LinkedIn, etc."
      />

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminCard className="xl:col-span-3">
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle className="text-lg">Liens ({items.length})</AdminCardTitle>
            {canWrite && (
              <Button type="button" variant="ocean" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Nouveau réseau
              </Button>
            )}
          </AdminCardHeader>
          <AdminCardContent>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun réseau configuré.</p>
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
                        {socialPlatformLabel(item.platform)}
                      </p>
                      <p className="truncate text-sm text-slate-600">{item.url}</p>
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
                {editingId ? "Modifier le lien" : "Nouveau réseau"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="socialPlatform">Plateforme</Label>
                  <select
                    id="socialPlatform"
                    value={form.platform}
                    onChange={(e) =>
                      setForm({ ...form, platform: e.target.value as typeof form.platform })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialUrl">URL</Label>
                  <Input
                    id="socialUrl"
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://facebook.com/..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLabelFr">Libellé personnalisé (FR, optionnel)</Label>
                  <Input
                    id="socialLabelFr"
                    value={form.labelFr}
                    onChange={(e) => setForm({ ...form, labelFr: e.target.value })}
                    placeholder="Suivez-nous sur Facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLabelAr">Libellé personnalisé (AR, optionnel)</Label>
                  <Input
                    id="socialLabelAr"
                    value={form.labelAr}
                    onChange={(e) => setForm({ ...form, labelAr: e.target.value })}
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialOrder">Ordre</Label>
                  <Input
                    id="socialOrder"
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </div>
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
  );
}
