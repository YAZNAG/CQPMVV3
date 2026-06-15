"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { AdminGalleryImagesUpload } from "@/components/admin/admin-gallery-images-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import {
  addGalleryPhoto,
  addGalleryVideo,
  deleteGalleryItem,
  reorderGalleryItems,
} from "@/actions/admin/gallery.actions";

export interface GalleryItemRow {
  id: string;
  type: "PHOTO" | "VIDEO";
  titleFr: string | null;
  titleAr: string | null;
  order: number;
  imageUrl: string | null;
  videoUrl: string | null;
}

interface GalleryItemsManagerProps {
  albumId: string;
  items: GalleryItemRow[];
}

export function GalleryItemsManager({ albumId, items: initialItems }: GalleryItemsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitleFr, setVideoTitleFr] = useState("");
  const [filter, setFilter] = useState<"all" | "PHOTO" | "VIDEO">("all");

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  const persistOrder = (ordered: GalleryItemRow[]) => {
    setItems(ordered);
    startTransition(async () => {
      const result = await reorderGalleryItems(
        albumId,
        ordered.map((i) => i.id)
      );
      if (!result.success) toast.error(result.error ?? "Erreur ordre");
      else router.refresh();
    });
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
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
          albumId,
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
    if (!videoUrl.trim()) return;
    startTransition(async () => {
      const result = await addGalleryVideo({
        albumId,
        videoUrl: videoUrl.trim(),
        titleFr: videoTitleFr || undefined,
      });
      if (result.success) {
        toast.success("Vidéo ajoutée");
        setVideoUrl("");
        setVideoTitleFr("");
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
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const photoCount = items.filter((i) => i.type === "PHOTO").length;
  const videoCount = items.filter((i) => i.type === "VIDEO").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="ocean">{photoCount} photos</Badge>
        <Badge variant="default">{videoCount} vidéos</Badge>
        <div className="ml-auto flex gap-1 rounded-lg bg-slate-100 p-1">
          {(["all", "PHOTO", "VIDEO"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                filter === f ? "bg-white shadow-sm" : "text-slate-600"
              }`}
            >
              {f === "all" ? "Tous" : f === "PHOTO" ? "Photos" : "Vidéos"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle className="flex items-center gap-2 text-base">
              <Video className="h-5 w-5 text-ocean-600" />
              Ajouter une vidéo
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
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
                disabled={isPending || !videoUrl.trim()}
                onClick={handleAddVideo}
              >
                <Plus className="h-4 w-4" />
                Ajouter la vidéo
              </Button>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-base">Médias de l&apos;album ({items.length})</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun média. Téléversez des photos ou ajoutez une vidéo.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {item.type === "PHOTO" && item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" />
                      ) : item.type === "VIDEO" ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                          <Video className="h-10 w-10" />
                          <span className="px-2 text-center text-xs line-clamp-2">
                            {item.videoUrl}
                          </span>
                        </div>
                      ) : null}
                      <Badge
                        variant={item.type === "PHOTO" ? "ocean" : "navy"}
                        className="absolute left-2 top-2"
                      >
                        {item.type === "PHOTO" ? "Photo" : "Vidéo"}
                      </Badge>
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
