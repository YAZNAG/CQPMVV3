"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  ImageIcon,
  Video,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { AdminGalleryImagesUpload } from "@/components/admin/admin-gallery-images-upload";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { AdminVideoUpload } from "@/components/admin/admin-video-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import {
  addGalleryPhoto,
  addGalleryVideo,
  deleteGalleryItem,
  reorderGalleryMediaItems,
  updateGalleryItem,
} from "@/actions/admin/gallery.actions";
import type { GalleryItemRow } from "@/components/admin/gallery-items-manager";
import { isGalleryFileVideo } from "@/lib/gallery/video";

interface GalleryMediaManagerProps {
  mode: "photos" | "videos";
  defaultAlbumId: string;
  items: GalleryItemRow[];
}

export function GalleryMediaManager({
  mode,
  defaultAlbumId,
  items: initialItems,
}: GalleryMediaManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitleFr, setVideoTitleFr] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleFr, setEditTitleFr] = useState("");
  const [editTitleAr, setEditTitleAr] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const itemType = mode === "photos" ? "PHOTO" : "VIDEO";
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const editingItem = editingId ? items.find((i) => i.id === editingId) : null;

  const resetEdit = () => {
    setEditingId(null);
    setEditTitleFr("");
    setEditTitleAr("");
    setEditVideoUrl("");
    setEditImageUrl(null);
    setPendingImageName(null);
    setUploadedVideoUrl(null);
  };

  const startEdit = (item: GalleryItemRow) => {
    setEditingId(item.id);
    setEditTitleFr(item.titleFr ?? "");
    setEditTitleAr(item.titleAr ?? "");
    setEditVideoUrl(item.videoUrl ?? "");
    setEditImageUrl(item.imageUrl);
    setPendingImageName(null);
    setUploadedVideoUrl(null);
  };

  const persistOrder = (ordered: GalleryItemRow[]) => {
    setItems(ordered);
    startTransition(async () => {
      const result = await reorderGalleryMediaItems(
        itemType,
        ordered.map((i) => i.id)
      );
      if (!result.success) toast.error(result.error ?? "Erreur ordre");
      else router.refresh();
    });
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const index = sorted.findIndex((i) => i.id === id);
    if (index < 0) return;
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next.map((item, order) => ({ ...item, order })));
  };

  const handlePhotoUpload = (files: { url: string; name: string; size: number }[]) => {
    startTransition(async () => {
      for (const file of files) {
        const result = await addGalleryPhoto({
          albumId: defaultAlbumId,
          imageUrl: file.url,
          fileName: file.name,
          size: file.size,
          mimeType: "image/jpeg",
        });
        if (!result.success) {
          toast.error(result.error ?? "Erreur photo");
          return;
        }
      }
      toast.success(`${files.length} photo(s) ajoutée(s)`);
      router.refresh();
    });
  };

  const handleAddVideo = () => {
    const source = uploadedVideoUrl || videoUrl.trim();
    if (!source) {
      toast.error("Choisissez une vidéo ou saisissez une URL");
      return;
    }
    startTransition(async () => {
      const result = await addGalleryVideo({
        albumId: defaultAlbumId,
        videoUrl: source,
        titleFr: videoTitleFr || undefined,
      });
      if (result.success) {
        toast.success("Vidéo ajoutée");
        setVideoUrl("");
        setVideoTitleFr("");
        setUploadedVideoUrl(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    if (mode === "videos" && !editVideoUrl.trim() && !uploadedVideoUrl) {
      toast.error("Choisissez une vidéo ou saisissez une URL");
      return;
    }

    startTransition(async () => {
      const payload =
        mode === "photos"
          ? {
              id: editingId,
              titleFr: editTitleFr.trim() || null,
              titleAr: editTitleAr.trim() || null,
              ...(editImageUrl && editImageUrl !== editingItem?.imageUrl
                ? {
                    imageUrl: editImageUrl,
                    fileName: pendingImageName ?? "Photo galerie",
                    mimeType: "image/jpeg",
                  }
                : {}),
            }
          : {
              id: editingId,
              titleFr: editTitleFr.trim() || null,
              titleAr: editTitleAr.trim() || null,
              videoUrl: uploadedVideoUrl || editVideoUrl.trim(),
            };

      const result = await updateGalleryItem(payload);
      if (result.success) {
        toast.success("Média mis à jour");
        resetEdit();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    startTransition(async () => {
      const result = await deleteGalleryItem(id);
      if (result.success) {
        toast.success("Élément supprimé");
        if (editingId === id) resetEdit();
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="space-y-6">
      {editingItem ? (
        <AdminCard className="border-ocean-200 ring-1 ring-ocean-100">
          <AdminCardHeader className="flex flex-row items-center justify-between gap-4">
            <AdminCardTitle className="text-base">
              {mode === "photos" ? "Modifier la photo" : "Modifier la vidéo"}
            </AdminCardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={resetEdit}>
              <X className="h-4 w-4" />
              Annuler
            </Button>
          </AdminCardHeader>
          <AdminCardContent className="space-y-4">
            {mode === "photos" ? (
              <>
                <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-xl border bg-slate-100">
                  {editImageUrl && (
                    <Image src={editImageUrl} alt="" fill className="object-cover" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Remplacer l&apos;image</Label>
                  <AdminImageUpload
                    folder="gallery"
                    onUploaded={(url) => {
                      setEditImageUrl(url);
                      setPendingImageName("Nouvelle photo");
                    }}
                    onError={(message) => toast.error(message)}
                  />
                </div>
              </>
            ) : (
              <>
                <AdminVideoUpload
                  folder="gallery"
                  onUploaded={(url) => {
                    setUploadedVideoUrl(url);
                    setEditVideoUrl(url);
                  }}
                  onError={(message) => toast.error(message)}
                  label="Remplacer la vidéo"
                />
                <div className="relative py-2 text-center text-xs text-slate-400">
                  <span className="bg-white px-2">ou URL externe</span>
                  <span className="absolute inset-x-0 top-1/2 -z-10 border-t border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editVideoUrl">URL (YouTube, Vimeo, etc.)</Label>
                  <Input
                    id="editVideoUrl"
                    value={editVideoUrl}
                    onChange={(e) => {
                      setEditVideoUrl(e.target.value);
                      setUploadedVideoUrl(null);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editTitleFr">Titre (FR)</Label>
                <Input
                  id="editTitleFr"
                  value={editTitleFr}
                  onChange={(e) => setEditTitleFr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTitleAr">Titre (AR)</Label>
                <Input
                  id="editTitleAr"
                  value={editTitleAr}
                  onChange={(e) => setEditTitleAr(e.target.value)}
                  dir="rtl"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="ocean"
              disabled={isPending}
              onClick={handleSaveEdit}
            >
              Enregistrer les modifications
            </Button>
          </AdminCardContent>
        </AdminCard>
      ) : mode === "photos" ? (
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-5 w-5 text-ocean-600" />
              Ajouter des photos
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <AdminGalleryImagesUpload
              maxFiles={10}
              onUploaded={(files) => handlePhotoUpload(files)}
            />
          </AdminCardContent>
        </AdminCard>
      ) : (
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle className="flex items-center gap-2 text-base">
              <Video className="h-5 w-5 text-ocean-600" />
              Ajouter une vidéo
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-4">
              <AdminVideoUpload
                folder="gallery"
                onUploaded={(url) => {
                  setUploadedVideoUrl(url);
                  setVideoUrl("");
                }}
                onError={(message) => toast.error(message)}
              />
              <div className="relative py-2 text-center text-xs text-slate-400">
                <span className="bg-white px-2">ou URL externe</span>
                <span className="absolute inset-x-0 top-1/2 -z-10 border-t border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setUploadedVideoUrl(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={Boolean(uploadedVideoUrl)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoTitle">Titre (optionnel)</Label>
                <Input
                  id="videoTitle"
                  value={videoTitleFr}
                  onChange={(e) => setVideoTitleFr(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ocean"
                size="sm"
                disabled={isPending || (!uploadedVideoUrl && !videoUrl.trim())}
                onClick={handleAddVideo}
              >
                <Plus className="h-4 w-4" />
                Ajouter la vidéo
              </Button>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-base">
            {mode === "photos" ? `Photos (${items.length})` : `Vidéos (${items.length})`}
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {mode === "photos"
                ? "Aucune photo. Téléversez des images ci-dessus."
                : "Aucune vidéo. Ajoutez une URL ci-dessus."}
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((item) => (
                <li
                  key={item.id}
                  className={`overflow-hidden rounded-xl border bg-white ${
                    editingId === item.id ? "border-ocean-400 ring-2 ring-ocean-100" : "border-slate-200"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {item.type === "PHOTO" && item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill className="object-cover" />
                    ) : item.type === "VIDEO" ? (
                      item.videoUrl && isGalleryFileVideo(item.videoUrl) ? (
                        <video
                          src={item.videoUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                          <Video className="h-10 w-10" />
                          <span className="px-2 text-center text-xs line-clamp-2">
                            {item.videoUrl}
                          </span>
                        </div>
                      )
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => moveItem(item.id, -1)}
                        disabled={isPending}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => moveItem(item.id, 1)}
                        disabled={isPending}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-ocean-700"
                        onClick={() => startEdit(item)}
                        disabled={isPending}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {item.titleFr && (
                    <p className="border-t px-3 py-2 text-xs text-slate-600 line-clamp-1">
                      {item.titleFr}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
