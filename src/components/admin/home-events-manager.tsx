"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createHomeEvent,
  deleteHomeEvent,
  updateHomeEvent,
} from "@/actions/admin/home-engagement.actions";
import type { HomeEventRecord } from "@/services/home-engagement.service";
import { cn } from "@/lib/utils";

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

const defaultForm = (items: HomeEventRecord[]) => ({
  titleFr: "",
  titleAr: "",
  descriptionFr: "",
  descriptionAr: "",
  eventDate: "",
  imageUrl: "",
  href: "",
  order: items.length,
  isPublished: true,
});

interface HomeEventsManagerProps {
  events: HomeEventRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

export function HomeEventsManager({ events, sectionPublished, canWrite }: HomeEventsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(events));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(events));
  };

  const loadEvent = (event: HomeEventRecord) => {
    setEditingId(event.id);
    setForm({
      titleFr: event.titleFr,
      titleAr: event.titleAr,
      descriptionFr: event.descriptionFr ?? "",
      descriptionAr: event.descriptionAr ?? "",
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().slice(0, 10)
        : "",
      imageUrl: event.imageUrl ?? "",
      href: event.href ?? "",
      order: event.order,
      isPublished: event.isPublished,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const payload = {
        ...form,
        descriptionFr: form.descriptionFr || null,
        descriptionAr: form.descriptionAr || null,
        eventDate: form.eventDate || null,
        imageUrl: form.imageUrl || null,
        href: form.href || null,
      };

      const result = editingId
        ? await updateHomeEvent({ id: editingId, ...payload })
        : await createHomeEvent(payload);

      if (result.success) {
        toast.success(editingId ? "Événement mis à jour" : "Événement ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const togglePublished = (event: HomeEventRecord) => {
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateHomeEvent({
        id: event.id,
        titleFr: event.titleFr,
        titleAr: event.titleAr,
        descriptionFr: event.descriptionFr,
        descriptionAr: event.descriptionAr,
        eventDate: event.eventDate,
        imageUrl: event.imageUrl,
        href: event.href,
        order: event.order,
        isPublished: !event.isPublished,
      });
      if (result.success) {
        toast.success(event.isPublished ? "Événement masqué" : "Événement publié");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    startTransition(async () => {
      const result = await deleteHomeEvent(id);
      if (result.success) {
        toast.success("Événement supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const publishedCount = events.filter((e) => e.isPublished).length;

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="events"
        initialPublished={sectionPublished}
        publishedCount={publishedCount}
        totalCount={events.length}
        itemLabel="événement"
        locations="accueil & /events"
        canWrite={canWrite}
      />

    <div className="grid gap-8 xl:grid-cols-5">
      <AdminPanel className="xl:col-span-2">
        <AdminPanelHeader
          icon={editingId ? Pencil : Plus}
          title={editingId ? "Modifier l'événement" : "Nouvel événement"}
          description="Affiché sur /fr/events, /ar/events et la page d'accueil."
        />
        {canWrite ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <AdminBilingualGrid>
              <AdminField
                label="Titre (FR)"
                value={form.titleFr}
                onChange={(v) => setForm((f) => ({ ...f, titleFr: v }))}
                required
              />
              <AdminField
                label="Titre (AR)"
                value={form.titleAr}
                onChange={(v) => setForm((f) => ({ ...f, titleAr: v }))}
                dir="rtl"
                required
              />
              <AdminTextField
                label="Description (FR)"
                value={form.descriptionFr}
                onChange={(v) => setForm((f) => ({ ...f, descriptionFr: v }))}
                rows={3}
              />
              <AdminTextField
                label="Description (AR)"
                value={form.descriptionAr}
                onChange={(v) => setForm((f) => ({ ...f, descriptionAr: v }))}
                dir="rtl"
                rows={3}
              />
            </AdminBilingualGrid>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className={cn("mt-1.5", inputClass)}
                />
              </div>
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
                  className={cn("mt-1.5", inputClass)}
                />
              </div>
            </div>

            <AdminField
              label="Lien (optionnel)"
              value={form.href}
              onChange={(v) => setForm((f) => ({ ...f, href: v }))}
              placeholder="/contact ou /fr/news/..."
              hint="Lien interne commençant par /"
            />

            {form.imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200">
                <Image src={form.imageUrl} alt="" fill className="object-cover" />
              </div>
            ) : null}

            <AdminImageUpload
              folder="events"
              onUploaded={(url) => {
                setForm((f) => ({ ...f, imageUrl: url }));
                toast.success("Image téléversée");
              }}
              onError={(msg) => toast.error(msg)}
            />

            <AdminField
              label="Image (URL ou /uploads/...)"
              value={form.imageUrl}
              onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
            />

            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                form.isPublished
                  ? "border-ocean-200 bg-ocean-50/60"
                  : "border-slate-200 bg-slate-50/40"
              )}
            >
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                className="mt-1 rounded border-slate-300 text-ocean-600"
              />
              <span>
                <span className="text-sm font-medium text-slate-800">Publié</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Visible sur le site public
                </span>
              </span>
            </label>

            <AdminFormFooter className="mt-0 border-0 pt-0">
              <Button type="submit" variant="ocean" disabled={isPending}>
                {isPending
                  ? "Enregistrement…"
                  : editingId
                    ? "Enregistrer"
                    : "Ajouter l'événement"}
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
          icon={CalendarDays}
          title="Événements programmés"
          description={`${publishedCount} publié(s) sur ${events.length} au total`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/fr/events" target="_blank">
                <ExternalLink className="h-4 w-4" />
                Voir la page
              </Link>
            </Button>
          }
        />

        {events.length === 0 ? (
          <AdminEmptyState>
            Aucun événement. Ajoutez le premier via le formulaire à gauche.
          </AdminEmptyState>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center",
                  event.isPublished
                    ? "border-slate-200 bg-white"
                    : "border-slate-200/80 bg-slate-50/60 opacity-90"
                )}
              >
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-16 sm:w-24">
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-ocean-600 to-navy-900">
                      <CalendarDays className="h-6 w-6 text-white/80" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{event.titleFr}</p>
                    <Badge variant={event.isPublished ? "ocean" : "default"}>
                      {event.isPublished ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  {event.eventDate && (
                    <p className="mt-1 text-xs text-ocean-600">
                      {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {event.descriptionFr && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {event.descriptionFr}
                    </p>
                  )}
                </div>

                {canWrite && (
                  <div className="flex shrink-0 flex-wrap gap-1 sm:flex-col">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublished(event)}
                      disabled={isPending}
                      title={event.isPublished ? "Masquer" : "Publier"}
                    >
                      {event.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => loadEvent(event)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => handleDelete(event.id)}
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
      </AdminPanel>
    </div>
    </div>
  );
}
