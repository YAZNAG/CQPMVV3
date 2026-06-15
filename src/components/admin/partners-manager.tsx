"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Handshake, Pencil, Trash2 } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminField,
  AdminFormFooter,
} from "@/components/admin/admin-form-fields";
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createPartner,
  deletePartner,
  updatePartner,
} from "@/actions/admin/partners.actions";
import type { PartnerRecord } from "@/services/partner.service";
import { resolvePartnerLogo } from "@/lib/site-images";
import { cn } from "@/lib/utils";

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

const defaultForm = (items: PartnerRecord[]) => ({
  name: "",
  logoUrl: "",
  websiteUrl: "",
  order: items.length,
  isPublished: true,
});

interface PartnersManagerProps {
  items: PartnerRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

export function PartnersManager({ items, sectionPublished, canWrite }: PartnersManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(items));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(items));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const payload = {
        ...form,
        websiteUrl: form.websiteUrl || null,
      };
      const result = editingId
        ? await updatePartner({ id: editingId, ...payload })
        : await createPartner(payload);

      if (result.success) {
        toast.success(editingId ? "Partenaire mis à jour" : "Partenaire ajouté");
        resetForm();
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
        sectionKey="partners"
        initialPublished={sectionPublished}
        publishedCount={publishedCount}
        totalCount={items.length}
        itemLabel="partenaire"
        locations="accueil (bandeau défilant)"
        canWrite={canWrite}
      />

    <div className="grid gap-8 xl:grid-cols-5">
      <AdminPanel className="xl:col-span-2">
        <AdminPanelHeader
          icon={Handshake}
          title={editingId ? "Modifier le partenaire" : "Nouveau partenaire"}
          description="Logo affiché dans le bandeau défilant de la page d'accueil."
        />
        {canWrite ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <AdminField
              label="Nom"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
            />
            <AdminField
              label="Logo (URL ou /uploads/...)"
              value={form.logoUrl}
              onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))}
              required
            />
            <AdminImageUpload
              folder="partners"
              onUploaded={(url) => {
                setForm((f) => ({ ...f, logoUrl: url }));
                toast.success("Logo téléversé");
              }}
              onError={(msg) => toast.error(msg)}
            />
            <AdminField
              label="Site web (optionnel)"
              value={form.websiteUrl}
              onChange={(v) => setForm((f) => ({ ...f, websiteUrl: v }))}
              placeholder="https://..."
            />
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ordre
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                  className={cn("mt-1.5 w-24", inputClass)}
                />
              </div>
              <label className="flex items-center gap-2 pt-5 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPublished: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-ocean-600"
                />
                Publié
              </label>
            </div>
            <AdminFormFooter className="mt-0 border-0 pt-0">
              <Button type="submit" variant="ocean" disabled={isPending}>
                {editingId ? "Enregistrer" : "Ajouter"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </AdminFormFooter>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Lecture seule.</p>
        )}
      </AdminPanel>

      <AdminPanel className="xl:col-span-3">
        <AdminPanelHeader
          icon={Handshake}
          title="Partenaires publiés"
          description="Défilement continu sur l'accueil — pause au survol."
        />
        {items.length === 0 ? (
          <AdminEmptyState>Aucun partenaire. Ajoutez un logo pour démarrer.</AdminEmptyState>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const logoSrc = resolvePartnerLogo(item.logoUrl, item.name);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt=""
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="truncate text-xs text-slate-500">{item.logoUrl}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Ordre {item.order}
                      {!item.isPublished && " · Masqué"}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            name: item.name,
                            logoUrl: item.logoUrl,
                            websiteUrl: item.websiteUrl ?? "",
                            order: item.order,
                            isPublished: item.isPublished,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => {
                          if (!confirm("Supprimer ce partenaire ?")) return;
                          startTransition(async () => {
                            const result = await deletePartner(item.id);
                            if (result.success) {
                              toast.success("Supprimé");
                              if (editingId === item.id) resetForm();
                              router.refresh();
                            } else toast.error(result.error ?? "Erreur");
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>
    </div>
    </div>
  );
}
