import type { GalleryItemType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toEmbedVideoUrl, getVideoThumbnail, isGalleryFileVideo } from "@/lib/gallery/video";
import type { GalleryMediaFilter } from "@/lib/gallery/types";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type { GalleryMediaFilter } from "@/lib/gallery/types";

const activeAlbum = { deletedAt: null } as const;
const publishedAlbum = { isPublished: true, deletedAt: null } as const;
const activeItem = { deletedAt: null } as const;

function itemTypeFilter(filter: GalleryMediaFilter): GalleryItemType | undefined {
  if (filter === "photo") return "PHOTO";
  if (filter === "video") return "VIDEO";
  return undefined;
}

export async function getPublishedAlbums(
  locale: Locale,
  options?: {
    search?: string;
    mediaFilter?: GalleryMediaFilter;
    page?: number;
    pageSize?: number;
  }
) {
  const { search, mediaFilter = "all", page = 1, pageSize = 12 } = options ?? {};
  const type = itemTypeFilter(mediaFilter);

  const albums = await prisma.galleryAlbum.findMany({
    where: {
      ...publishedAlbum,
      ...(search
        ? {
            OR: [
              { titleFr: { contains: search, mode: "insensitive" } },
              { titleAr: { contains: search, mode: "insensitive" } },
              { descriptionFr: { contains: search, mode: "insensitive" } },
              { descriptionAr: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(type
        ? { items: { some: { ...activeItem, type } } }
        : { items: { some: activeItem } }),
    },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: activeItem,
        select: { id: true, type: true },
      },
    },
  });

  const mapped = albums.map((a) => {
    const photoCount = a.items.filter((i) => i.type === "PHOTO").length;
    const videoCount = a.items.filter((i) => i.type === "VIDEO").length;
    return {
      id: a.id,
      slug: a.slug,
      title: getLocalized(locale, a.titleFr, a.titleAr),
      description: getLocalized(locale, a.descriptionFr ?? "", a.descriptionAr ?? ""),
      coverImageUrl: a.coverImageUrl,
      photoCount,
      videoCount,
      itemCount: a.items.length,
    };
  });

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  const data = mapped.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getAlbumBySlug(
  slug: string,
  locale: Locale,
  mediaFilter: GalleryMediaFilter = "all"
) {
  const type = itemTypeFilter(mediaFilter);

  const album = await prisma.galleryAlbum.findFirst({
    where: { slug, ...publishedAlbum },
    include: {
      items: {
        where: {
          ...activeItem,
          ...(type ? { type } : {}),
        },
        orderBy: { order: "asc" },
        include: { mediaFile: true },
      },
    },
  });
  if (!album) return null;

  const allItems = await prisma.galleryItem.findMany({
    where: { albumId: album.id, ...activeItem },
    select: { type: true },
  });

  return {
    id: album.id,
    slug: album.slug,
    title: getLocalized(locale, album.titleFr, album.titleAr),
    description: getLocalized(locale, album.descriptionFr ?? "", album.descriptionAr ?? ""),
    coverImageUrl: album.coverImageUrl,
    photoCount: allItems.filter((i) => i.type === "PHOTO").length,
    videoCount: allItems.filter((i) => i.type === "VIDEO").length,
    items: album.items.map((item) => ({
      id: item.id,
      type: item.type,
      title: getLocalized(locale, item.titleFr ?? "", item.titleAr ?? ""),
      imageUrl: item.mediaFile?.url ?? null,
      videoUrl: item.videoUrl ? toEmbedVideoUrl(item.videoUrl) : null,
    })),
  };
}

export async function getAlbumBySlugForMetadata(slug: string, locale: Locale) {
  const album = await prisma.galleryAlbum.findFirst({
    where: { slug, ...publishedAlbum },
  });
  if (!album) return null;
  return {
    title: getLocalized(locale, album.titleFr, album.titleAr),
    description: getLocalized(locale, album.descriptionFr ?? "", album.descriptionAr ?? ""),
    coverImageUrl: album.coverImageUrl,
  };
}

export async function getRecentGalleryPhotos(locale: Locale, limit = 5) {
  const items = await prisma.galleryItem.findMany({
    where: {
      ...activeItem,
      type: "PHOTO",
      mediaFileId: { not: null },
      album: activeAlbum,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      mediaFile: { select: { url: true } },
    },
  });

  return items
    .filter((item) => item.mediaFile?.url)
    .map((item) => ({
      id: item.id,
      imageUrl: item.mediaFile!.url,
      alt: getLocalized(locale, item.titleFr ?? "", item.titleAr ?? "") || "CQPM Nador",
    }));
}

export type PublicGalleryCategory = {
  slug: string;
  name: string;
  photoCount: number;
  videoCount: number;
};

export type PublicGalleryMediaItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoEmbedUrl: string | null;
  albumSlug: string;
  albumTitle: string;
  createdAt: Date;
};

export async function getGalleryFilterCategories(locale: Locale): Promise<PublicGalleryCategory[]> {
  const albums = await prisma.galleryAlbum.findMany({
    where: {
      ...publishedAlbum,
      items: { some: activeItem },
    },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: activeItem,
        select: { type: true },
      },
    },
  });

  return albums.map((album) => ({
    slug: album.slug,
    name: getLocalized(locale, album.titleFr, album.titleAr),
    photoCount: album.items.filter((i) => i.type === "PHOTO").length,
    videoCount: album.items.filter((i) => i.type === "VIDEO").length,
  }));
}

export async function getPublishedGalleryMediaItems(
  locale: Locale,
  options: {
    type: "PHOTO" | "VIDEO";
    albumSlug?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { type, albumSlug, search, page = 1, pageSize = 8 } = options;

  const items = await prisma.galleryItem.findMany({
    where: {
      ...activeItem,
      type,
      ...(type === "PHOTO" ? { mediaFileId: { not: null } } : { videoUrl: { not: null } }),
      album: {
        ...activeAlbum,
        ...(albumSlug ? { slug: albumSlug } : {}),
      },
      ...(search
        ? {
            OR: [
              { titleFr: { contains: search, mode: "insensitive" } },
              { titleAr: { contains: search, mode: "insensitive" } },
              { album: { titleFr: { contains: search, mode: "insensitive" } } },
              { album: { titleAr: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      mediaFile: { select: { url: true } },
      album: { select: { slug: true, titleFr: true, titleAr: true, coverImageUrl: true } },
    },
  });

  const mapped: PublicGalleryMediaItem[] = items
    .map((item) => {
      const imageUrl =
        item.mediaFile?.url ??
        (item.videoUrl ? null : item.album.coverImageUrl) ??
        null;
      const videoEmbedUrl = item.videoUrl ? toEmbedVideoUrl(item.videoUrl) : null;
      const thumbFromVideo = item.videoUrl ? getVideoThumbnail(item.videoUrl) : null;

      return {
        id: item.id,
        type: item.type,
        title:
          getLocalized(locale, item.titleFr ?? "", item.titleAr ?? "") ||
          getLocalized(locale, item.album.titleFr, item.album.titleAr),
        imageUrl: imageUrl ?? thumbFromVideo ?? (item.videoUrl && isGalleryFileVideo(item.videoUrl) ? item.videoUrl : null) ?? item.album.coverImageUrl,
        videoUrl: item.videoUrl,
        videoEmbedUrl,
        albumSlug: item.album.slug,
        albumTitle: getLocalized(locale, item.album.titleFr, item.album.titleAr),
        createdAt: item.createdAt,
      };
    })
    .filter((item) => (type === "PHOTO" ? Boolean(item.imageUrl) : Boolean(item.videoUrl)));

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  const data = mapped.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
    allItems: mapped,
  };
}
