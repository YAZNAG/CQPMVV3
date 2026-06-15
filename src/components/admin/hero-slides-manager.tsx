"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createHeroSlide,
  deleteHeroSlide,
  updateHeroSlide,
} from "@/actions/admin/hero-slides.actions";
import type { HeroSlideRecord } from "@/services/hero-slide.service";
import type { HeroSlideButtonInput } from "@/lib/validations/hero-slide";
import { cn } from "@/lib/utils";

const emptyButton = (order: number): HeroSlideButtonInput => ({
  labelFr: "",
  labelAr: "",
  href: "/",
  variant: "primary",
  order,
});

const defaultForm = (slides: HeroSlideRecord[]) => ({
  titleFr: "",
  titleAr: "",
  subtitleFr: "",
  subtitleAr: "",
  imageUrl: "/images/about-cqpm-nador.jpg",
  buttons: [emptyButton(0)],
  order: slides.length,
  isPublished: true,
});

interface HeroSlidesManagerProps {
  slides: HeroSlideRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

export function HeroSlidesManager({ slides, sectionPublished, canWrite }: HeroSlidesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(slides));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(slides));
  };

  const loadEdit = (slide: HeroSlideRecord) => {
    setEditingId(slide.id);
    setForm({
      titleFr: slide.titleFr,
      titleAr: slide.titleAr,
      subtitleFr: slide.subtitleFr,
      subtitleAr: slide.subtitleAr,
      imageUrl: slide.imageUrl,
      buttons: slide.buttons.length > 0 ? slide.buttons : [emptyButton(0)],
      order: slide.order,
      isPublished: slide.isPublished,
    });
  };

  const updateButton = (index: number, patch: Partial<HeroSlideButtonInput>) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.map((button, i) =>
        i === index ? { ...button, ...patch } : button
      ),
    }));
  };

  const addButton = () => {
    if (form.buttons.length >= 4) return;
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, emptyButton(prev.buttons.length)],
    }));
  };

  const removeButton = (index: number) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons
        .filter((_, i) => i !== index)
        .map((button, i) => ({ ...button, order: i })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      ...form,
      buttons: form.buttons.filter((b) => b.labelFr.trim() && b.labelAr.trim()),
    };

    startTransition(async () => {
      const result = editingId
        ? await updateHeroSlide({ id: editingId, ...payload })
        : await createHeroSlide(payload);

      if (result.success) {
        toast.success(editingId ? "Slide mise à jour" : "Slide créée");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer cette slide ?")) return;

    startTransition(async () => {
      const result = await deleteHeroSlide(id);
      if (result.success) {
        toast.success("Slide supprimée");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const publishedCount = slides.filter((s) => s.isPublished).length;

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="hero"
        initialPublished={sectionPublished}
        publishedCount={publishedCount}
        totalCount={slides.length}
        itemLabel="slide"
        locations="accueil (hero)"
        canWrite={canWrite}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          {slides.length} slide{slides.length > 1 ? "s" : ""} — ordre croissant
        </p>
        {canWrite && (
          <Button type="button" variant="ocean" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            Nouvelle slide
          </Button>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminCard className="xl:col-span-3">
          <AdminCardHeader>
            <AdminCardTitle className="text-lg">Slides du hero</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            {slides.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune slide. Ajoutez-en une ci-contre.</p>
            ) : (
              <ul className="divide-y">
                {slides.map((slide) => (
                  <li
                    key={slide.id}
                    className={cn(
                      "flex gap-4 py-4",
                      editingId === slide.id && "rounded-lg bg-ocean-50/40 px-3"
                    )}
                  >
                    <div
                      className="h-16 w-24 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-slate-200"
                      style={{ backgroundImage: `url(${slide.imageUrl})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-navy-900">{slide.titleFr}</p>
                        {!slide.isPublished && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                            Brouillon
                          </span>
                        )}
                        <span className="text-xs text-slate-500">Ordre {slide.order}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{slide.subtitleFr}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {slide.buttons.length} bouton(s)
                      </p>
                    </div>
                    {canWrite && (
                      <div className="flex shrink-0 gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => loadEdit(slide)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(slide.id)}
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
                {editingId ? "Modifier la slide" : "Nouvelle slide"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitleFr">Titre (FR)</Label>
                  <Input
                    id="heroTitleFr"
                    value={form.titleFr}
                    onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroTitleAr">Titre (AR)</Label>
                  <Input
                    id="heroTitleAr"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitleFr">Paragraphe (FR)</Label>
                  <textarea
                    id="heroSubtitleFr"
                    value={form.subtitleFr}
                    onChange={(e) => setForm({ ...form, subtitleFr: e.target.value })}
                    required
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitleAr">Paragraphe (AR)</Label>
                  <textarea
                    id="heroSubtitleAr"
                    value={form.subtitleAr}
                    onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })}
                    required
                    rows={3}
                    dir="rtl"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-right text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Image de la slide</Label>
                  {form.imageUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                      <Image
                        src={form.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={form.imageUrl.startsWith("/uploads/")}
                      />
                    </div>
                  ) : null}
                  <AdminImageUpload
                    folder="hero"
                    onUploaded={(url) => {
                      setForm({ ...form, imageUrl: url });
                      toast.success("Image téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="heroImageUrl" className="text-xs text-slate-500">
                      Ou coller une URL / chemin
                    </Label>
                    <Input
                      id="heroImageUrl"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="/images/about-cqpm-nador.jpg"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroOrder">Ordre</Label>
                  <Input
                    id="heroOrder"
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Boutons</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addButton}
                      disabled={form.buttons.length >= 4}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                  {form.buttons.map((button, index) => (
                    <div key={index} className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Bouton {index + 1}
                        </span>
                        {form.buttons.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-red-600"
                            onClick={() => removeButton(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Label FR"
                        value={button.labelFr}
                        onChange={(e) => updateButton(index, { labelFr: e.target.value })}
                      />
                      <Input
                        placeholder="Label AR"
                        value={button.labelAr}
                        onChange={(e) => updateButton(index, { labelAr: e.target.value })}
                        dir="rtl"
                        className="text-right"
                      />
                      <Input
                        placeholder="/admission"
                        value={button.href}
                        onChange={(e) => updateButton(index, { href: e.target.value })}
                      />
                      <select
                        value={button.variant}
                        onChange={(e) =>
                          updateButton(index, {
                            variant: e.target.value as "primary" | "outline",
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="primary">Bouton principal (bleu)</option>
                        <option value="outline">Bouton contour (transparent)</option>
                      </select>
                    </div>
                  ))}
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
    </div>
  );
}
