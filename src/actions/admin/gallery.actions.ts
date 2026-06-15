"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import {
  galleryAlbumSchema,
  galleryItemUpdateSchema,
  galleryPhotoSchema,
  galleryVideoSchema,
} from "@/lib/validations/gallery";
import {
  ensureUniqueAlbumSlug,
  getNextItemOrder,
} from "@/services/gallery-admin.service";
import type { ActionResult } from "@/types";
import type { ZodError } from "zod";

function validationError(error: ZodError): ActionResult<never> {
  const issue = error.issues[0];
  const path = issue?.path?.length ? `${String(issue.path.join("."))}: ` : "";
  return {
    success: false,
    error: `${path}${issue?.message ?? "Données invalides"}`,
  };
}

function revalidateGallery(slug?: string) {
  revalidatePath("/admin/gallery");
  revalidatePath("/fr/gallery");
  revalidatePath("/ar/gallery");
  revalidatePath("/fr/gallery/photos");
  revalidatePath("/ar/gallery/photos");
  revalidatePath("/fr/gallery/videos");
  revalidatePath("/ar/gallery/videos");
  if (slug) {
    revalidatePath(`/fr/gallery/${slug}`);
    revalidatePath(`/ar/gallery/${slug}`);
  }
}

export async function createGalleryAlbum(
  input: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await assertPermission("gallery", "write");
  const parsed = galleryAlbumSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;
  const slug = await ensureUniqueAlbumSlug(data.slug ?? slugify(data.titleFr));

  const album = await prisma.galleryAlbum.create({
    data: {
      slug,
      titleFr: data.titleFr,
      titleAr: data.titleAr,
      descriptionFr: data.descriptionFr ?? null,
      descriptionAr: data.descriptionAr ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      order: data.order,
      isPublished: data.isPublished,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "GalleryAlbum",
    entityId: album.id,
    metadata: { slug },
  });

  revalidateGallery(slug);
  return { success: true, data: { id: album.id, slug } };
}

export async function updateGalleryAlbum(
  id: string,
  input: unknown
): Promise<ActionResult<{ slug: string }>> {
  const session = await assertPermission("gallery", "write");
  const parsed = galleryAlbumSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await prisma.galleryAlbum.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { success: false, error: "Album introuvable" };

  const data = parsed.data;
  const baseSlug = data.slug ?? slugify(data.titleFr);
  const slug =
    baseSlug === existing.slug
      ? existing.slug
      : await ensureUniqueAlbumSlug(baseSlug, id);

  const album = await prisma.galleryAlbum.update({
    where: { id },
    data: {
      slug,
      titleFr: data.titleFr,
      titleAr: data.titleAr,
      descriptionFr: data.descriptionFr ?? null,
      descriptionAr: data.descriptionAr ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      order: data.order,
      isPublished: data.isPublished,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "GalleryAlbum",
    entityId: id,
  });

  revalidateGallery(album.slug);
  if (existing.slug !== album.slug) revalidateGallery(existing.slug);
  return { success: true, data: { slug: album.slug } };
}

export async function deleteGalleryAlbum(id: string): Promise<ActionResult> {
  const session = await assertPermission("gallery", "write");

  const existing = await prisma.galleryAlbum.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { success: false, error: "Album introuvable" };

  await prisma.$transaction([
    prisma.galleryItem.updateMany({
      where: { albumId: id },
      data: { deletedAt: new Date() },
    }),
    prisma.galleryAlbum.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    }),
  ]);

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entity: "GalleryAlbum",
    entityId: id,
  });

  revalidateGallery(existing.slug);
  return { success: true };
}

export async function addGalleryPhoto(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await assertPermission("gallery", "write");
  const parsed = galleryPhotoSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;
  const album = await prisma.galleryAlbum.findFirst({
    where: { id: data.albumId, deletedAt: null },
  });
  if (!album) return { success: false, error: "Album introuvable" };

  const order = data.order ?? (await getNextItemOrder(data.albumId));

  const media = await prisma.mediaFile.create({
    data: {
      url: data.imageUrl,
      name: data.fileName ?? "Photo galerie",
      mimeType: data.mimeType ?? "image/jpeg",
      size: data.size ?? 0,
      purpose: "GALLERY",
      uploadedById: session.user.id,
    },
  });

  const item = await prisma.galleryItem.create({
    data: {
      albumId: data.albumId,
      type: "PHOTO",
      mediaFileId: media.id,
      titleFr: data.titleFr ?? null,
      titleAr: data.titleAr ?? null,
      order,
    },
  });

  if (!album.coverImageUrl) {
    await prisma.galleryAlbum.update({
      where: { id: album.id },
      data: { coverImageUrl: data.imageUrl },
    });
  }

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "GalleryItem",
    entityId: item.id,
    metadata: { type: "PHOTO", albumId: data.albumId },
  });

  revalidateGallery(album.slug);
  revalidatePath(`/admin/gallery/${album.id}/edit`);
  return { success: true, data: { id: item.id } };
}

export async function addGalleryVideo(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await assertPermission("gallery", "write");
  const parsed = galleryVideoSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;
  const album = await prisma.galleryAlbum.findFirst({
    where: { id: data.albumId, deletedAt: null },
  });
  if (!album) return { success: false, error: "Album introuvable" };

  const order = data.order ?? (await getNextItemOrder(data.albumId));

  const item = await prisma.galleryItem.create({
    data: {
      albumId: data.albumId,
      type: "VIDEO",
      videoUrl: data.videoUrl,
      titleFr: data.titleFr ?? null,
      titleAr: data.titleAr ?? null,
      order,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "GalleryItem",
    entityId: item.id,
    metadata: { type: "VIDEO", albumId: data.albumId },
  });

  revalidateGallery(album.slug);
  revalidatePath(`/admin/gallery/${album.id}/edit`);
  return { success: true, data: { id: item.id } };
}

export async function updateGalleryItem(
  input: unknown
): Promise<ActionResult> {
  const session = await assertPermission("gallery", "write");
  const parsed = galleryItemUpdateSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const item = await prisma.galleryItem.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
    include: { album: true, mediaFile: true },
  });
  if (!item) return { success: false, error: "Élément introuvable" };

  const data = parsed.data;

  if (data.videoUrl !== undefined) {
    if (item.type !== "VIDEO") {
      return { success: false, error: "Impossible de modifier l'URL d'une photo" };
    }
  }

  if (data.imageUrl !== undefined) {
    if (item.type !== "PHOTO") {
      return { success: false, error: "Impossible de remplacer l'image d'une vidéo" };
    }
    if (!item.mediaFileId) {
      return { success: false, error: "Fichier média introuvable" };
    }

    await prisma.mediaFile.update({
      where: { id: item.mediaFileId },
      data: {
        url: data.imageUrl,
        ...(data.fileName !== undefined ? { name: data.fileName } : {}),
        ...(data.mimeType !== undefined ? { mimeType: data.mimeType } : {}),
        ...(data.size !== undefined ? { size: data.size } : {}),
      },
    });
  }

  await prisma.galleryItem.update({
    where: { id: data.id },
    data: {
      ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
      ...(data.titleAr !== undefined ? { titleAr: data.titleAr } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "GalleryItem",
    entityId: item.id,
  });

  revalidateGallery(item.album.slug);
  revalidatePath(`/admin/gallery/${item.albumId}/edit`);
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const session = await assertPermission("gallery", "write");

  const item = await prisma.galleryItem.findFirst({
    where: { id, deletedAt: null },
    include: { album: true, mediaFile: true },
  });
  if (!item) return { success: false, error: "Élément introuvable" };

  await prisma.galleryItem.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entity: "GalleryItem",
    entityId: id,
  });

  revalidateGallery(item.album.slug);
  revalidatePath(`/admin/gallery/${item.albumId}/edit`);
  return { success: true };
}

export async function reorderGalleryItems(
  albumId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await assertPermission("gallery", "write");

  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.galleryItem.update({
        where: { id, albumId, deletedAt: null },
        data: { order },
      })
    )
  );

  const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "GalleryAlbum",
    entityId: albumId,
    metadata: { reorder: true },
  });

  if (album) revalidateGallery(album.slug);
  revalidatePath(`/admin/gallery/${albumId}/edit`);
  return { success: true };
}

export async function reorderGalleryMediaItems(
  type: "PHOTO" | "VIDEO",
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await assertPermission("gallery", "write");

  if (orderedIds.length === 0) return { success: true };

  const items = await prisma.galleryItem.findMany({
    where: { id: { in: orderedIds }, deletedAt: null, type },
    select: { id: true },
  });

  if (items.length !== orderedIds.length) {
    return { success: false, error: "Éléments introuvables" };
  }

  await prisma.$transaction(
    orderedIds.map((id, order) =>
      prisma.galleryItem.update({
        where: { id, deletedAt: null, type },
        data: { order },
      })
    )
  );

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "GalleryItem",
    entityId: orderedIds[0],
    metadata: { reorder: true, type, count: orderedIds.length },
  });

  revalidateGallery();
  return { success: true };
}
