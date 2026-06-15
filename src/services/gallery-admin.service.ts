import type { GalleryItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const active = { deletedAt: null } as const;

export async function getGalleryStats() {
  const [items, photos, videos] = await Promise.all([
    prisma.galleryItem.count({ where: { ...active, album: active } }),
    prisma.galleryItem.count({ where: { ...active, type: "PHOTO", album: active } }),
    prisma.galleryItem.count({ where: { ...active, type: "VIDEO", album: active } }),
  ]);
  return { items, photos, videos };
}

export async function listAdminGalleryItems(type: GalleryItemType) {
  const rows = await prisma.galleryItem.findMany({
    where: { ...active, type, album: active },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { mediaFile: true },
  });

  return rows.map((item) => ({
    id: item.id,
    type: item.type,
    titleFr: item.titleFr,
    titleAr: item.titleAr,
    order: item.order,
    imageUrl: item.mediaFile?.url ?? null,
    videoUrl: item.videoUrl,
  }));
}

export async function listAdminAlbums({
  page = 1,
  pageSize = 12,
  search,
  status,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | "published" | "draft";
}) {
  const where: Prisma.GalleryAlbumWhereInput = {
    ...active,
    ...(status === "published" ? { isPublished: true } : {}),
    ...(status === "draft" ? { isPublished: false } : {}),
    ...(search
      ? {
          OR: [
            { titleFr: { contains: search, mode: "insensitive" } },
            { titleAr: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.galleryAlbum.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        items: {
          where: active,
          select: { id: true, type: true },
        },
      },
    }),
    prisma.galleryAlbum.count({ where }),
  ]);

  return {
    data: data.map((a) => ({
      ...a,
      photoCount: a.items.filter((i) => i.type === "PHOTO").length,
      videoCount: a.items.filter((i) => i.type === "VIDEO").length,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAdminAlbumById(id: string) {
  return prisma.galleryAlbum.findFirst({
    where: { id, ...active },
    include: {
      items: {
        where: active,
        orderBy: { order: "asc" },
        include: { mediaFile: true },
      },
    },
  });
}

export async function ensureUniqueAlbumSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let n = 1;
  while (true) {
    const existing = await prisma.galleryAlbum.findFirst({
      where: {
        slug: candidate,
        ...active,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

export async function getNextItemOrder(albumId: string) {
  const last = await prisma.galleryItem.findFirst({
    where: { albumId, ...active },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}
