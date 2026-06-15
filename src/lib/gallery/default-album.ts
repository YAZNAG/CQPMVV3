import { prisma } from "@/lib/db";

export const DEFAULT_GALLERY_ALBUM_SLUG = "galerie-cqpm";

export async function getOrCreateDefaultGalleryAlbum() {
  const existing = await prisma.galleryAlbum.findFirst({
    where: { slug: DEFAULT_GALLERY_ALBUM_SLUG, deletedAt: null },
  });
  if (existing) return existing;

  return prisma.galleryAlbum.create({
    data: {
      slug: DEFAULT_GALLERY_ALBUM_SLUG,
      titleFr: "Galerie CQPM Nador",
      titleAr: "معرض CQPM الناظور",
      isPublished: true,
      order: 0,
    },
  });
}
