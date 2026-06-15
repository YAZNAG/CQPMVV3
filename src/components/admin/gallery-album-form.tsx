"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  Globe,
  ImageIcon,
  Images,
  Languages,
  Send,
  Trash2,
} from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { CmsImage } from "@/components/public/cms-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import { AdminSectionStatusBanner } from "@/components/admin/admin-section-status-banner";
import {
  GalleryAlbumPendingMedia,
  type PendingGalleryPhoto,
  type PendingGalleryVideo,
} from "@/components/admin/gallery-album-pending-media";
import {
  GalleryItemsManager,
  type GalleryItemRow,
} from "@/components/admin/gallery-items-manager";
import {
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  addGalleryPhoto,
  addGalleryVideo,
} from "@/actions/admin/gallery.actions";
import { slugify, cn } from "@/lib/utils";

export interface GalleryAlbumFormData {
  id?: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  coverImageUrl: string | null;
  order: number;
  isPublished: boolean;
}

interface GalleryAlbumFormProps {
  initial?: GalleryAlbumFormData;
  items?: GalleryItemRow[];
}

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

export function GalleryAlbumForm({ initial, items = [] }: GalleryAlbumFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [isPending, startTransition] = useTransition();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [titleFr, setTitleFr] = useState(initial?.titleFr ?? "");
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [descriptionFr, setDescriptionFr] = useState(initial?.descriptionFr ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.descriptionAr ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);

  const [pendingPhotos, setPendingPhotos] = useState<PendingGalleryPhoto[]>([]);
  const [pendingVideos, setPendingVideos] = useState<PendingGalleryVideo[]>([]);

  const buildPayload = () => ({
    slug: slug || slugify(titleFr),
    titleFr,
    titleAr,
    descriptionFr: descriptionFr || undefined,
    descriptionAr: descriptionAr || undefined,
    coverImageUrl: coverImageUrl || null,
    order,
    isPublished,
  });

  const attachPendingMedia = async (albumId: string) => {
    for (const photo of pendingPhotos) {
      const result = await addGalleryPhoto({
        albumId,
        imageUrl: photo.url,
        fileName: photo.name,
        size: photo.size,
        mimeType: "image/jpeg",
      });
      if (!result.success) {
        throw new Error(result.error ?? "Erreur lors de l'ajout d'une photo");
      }
    }
    for (const video of pendingVideos) {
      const result = await addGalleryVideo({
        albumId,
        videoUrl: video.url,
        titleFr: video.titleFr,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Erreur lors de l'ajout d'une vidéo");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = buildPayload();
        const result = isEdit
          ? await updateGalleryAlbum(initial!.id!, payload)
          : await createGalleryAlbum(payload);

        if (!result.success) {
          toast.error(result.error ?? "Erreur");
          return;
        }

        if (!isEdit && result.data && "id" in result.data) {
          const albumId = String(result.data.id);
          if (pendingPhotos.length > 0 || pendingVideos.length > 0) {
            await attachPendingMedia(albumId);
          }
          const mediaCount = pendingPhotos.length + pendingVideos.length;
          toast.success(
            mediaCount > 0
              ? `Album créé avec ${mediaCount} média(s)`
              : "Album créé"
          );
          router.push(`/admin/gallery/${albumId}/edit`);
          return;
        }

        toast.success(isEdit ? "Album mis à jour" : "Album créé");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id || !confirm("Supprimer cet album et tous ses médias ?")) return;
    startTransition(async () => {
      const result = await deleteGalleryAlbum(initial.id!);
      if (result.success) {
        toast.success("Album supprimé");
        router.push("/admin/gallery");
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const previewSlug = slug || slugify(titleFr) || "album";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AdminSectionStatusBanner
        isPublished={isPublished}
        subtitle={
          isEdit
            ? `${items.length} média${items.length !== 1 ? "s" : ""} — /gallery`
            : "Nouvel album — enregistrez pour publier sur /gallery"
        }
        canWrite
        disabled={isPending}
        onToggle={() => setIsPublished((v) => !v)}
      />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <AdminPanel>
            <AdminPanelHeader
              icon={Languages}
              title="Informations (FR)"
              description="Titre et description de l'album en français."
            />
            <div className="space-y-5">
              <AdminField
                label="Titre (FR)"
                value={titleFr}
                onChange={(v) => {
                  setTitleFr(v);
                  if (!slugTouched) setSlug(slugify(v));
                }}
                required
              />
              <AdminTextField
                label="Description (FR)"
                value={descriptionFr}
                onChange={setDescriptionFr}
                rows={4}
              />
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={Languages}
              title="Informations (AR)"
              description="العنوان والوصف بالعربية."
            />
            <div className="space-y-5" dir="rtl">
              <AdminField
                label="العنوان (AR)"
                value={titleAr}
                onChange={setTitleAr}
                dir="rtl"
                required
              />
              <AdminTextField
                label="الوصف (AR)"
                value={descriptionAr}
                onChange={setDescriptionAr}
                dir="rtl"
                rows={4}
              />
            </div>
          </AdminPanel>

          {!isEdit && (
            <GalleryAlbumPendingMedia
              photos={pendingPhotos}
              videos={pendingVideos}
              onPhotosChange={setPendingPhotos}
              onVideosChange={setPendingVideos}
            />
          )}

          {isEdit && initial?.id && (
            <AdminPanel>
              <AdminPanelHeader
                icon={Images}
                title="Médias de l'album"
                description="Téléversez des photos ou ajoutez des liens vidéo."
              />
              <GalleryItemsManager albumId={initial.id} items={items} />
            </AdminPanel>
          )}
        </div>

        <div className="space-y-8">
          <AdminPanel>
            <AdminPanelHeader
              icon={Send}
              title="Publication"
              description="Visibilité sur le site public."
            />
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ordre d&apos;affichage
                </p>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className={cn("mt-1.5", inputClass)}
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={Globe}
              title="URL (SEO)"
              description="Adresse unique de l'album."
            />
            <div className="space-y-5">
              <AdminField
                label="Slug"
                value={slug}
                onChange={(v) => {
                  setSlugTouched(true);
                  setSlug(v);
                }}
                hint={`/fr/gallery/${previewSlug}`}
                required
              />
              {isPublished && (
                <a
                  href={`/fr/gallery/${previewSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Aperçu public
                </a>
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={ImageIcon}
              title="Image de couverture"
              description="Affichée sur les cartes de la galerie."
            />
            <div className="space-y-4">
              {coverImageUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <CmsImage src={coverImageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
                  <ImageIcon className="h-10 w-10 text-slate-300" aria-hidden />
                  <p className="text-xs text-slate-400">Aucune couverture</p>
                </div>
              )}
              <AdminImageUpload
                folder="gallery"
                onUploaded={(url) => {
                  setCoverImageUrl(url);
                  toast.success("Couverture téléversée");
                }}
                onError={(msg) => toast.error(msg)}
              />
              <AdminField
                label="Ou coller un lien"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                placeholder="https://… ou /uploads/…"
              />
              {coverImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-200"
                  onClick={() => setCoverImageUrl("")}
                >
                  Retirer la couverture
                </Button>
              )}
            </div>
          </AdminPanel>
        </div>
      </div>

      <AdminPanel className="sticky bottom-4 z-10 border-ocean-100/80 bg-white/95 backdrop-blur-sm">
        <AdminFormFooter className="mt-0 border-0 pt-0">
          <Button type="submit" variant="ocean" disabled={isPending}>
            {isPending
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer l'album"
                : pendingPhotos.length + pendingVideos.length > 0
                  ? `Créer l'album (${pendingPhotos.length + pendingVideos.length} média(s))`
                  : "Créer l'album"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-slate-200"
            onClick={() => router.push("/admin/gallery")}
          >
            Annuler
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              className="ml-auto border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          )}
        </AdminFormFooter>
      </AdminPanel>
    </form>
  );
}
