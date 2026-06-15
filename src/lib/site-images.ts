/** Local assets in /public/images — maritime imagery for CQPM Nador */
export const SITE_IMAGES = {
  about: "/images/about-cqpm-nador.jpg",
  hero: "/images/about-cqpm-nador.jpg",
  logo: "/images/cqpm-logo.png",
  formationFallback: "/images/maritime-training.jpg",
  galleryFallback: "/images/maritime-training.jpg",
} as const;

/** Uploaded CMS media (real site assets) */
export const UPLOAD_IMAGES = {
  logo: "/uploads/site/2ad6203a-4514-47a9-b404-6150bc1bff99.png",
  newsCover: "/uploads/news/9b3e236c-82ec-460c-a8ba-d9d357505a84.png",
  gallery: [
    "/uploads/gallery/b8b87c99-9296-4e87-b63b-67c7ad859300.jpg",
    "/uploads/gallery/20955d5b-28c1-4024-8b8d-4464f7026a6e.jpg",
    "/uploads/gallery/4a17efce-79cc-448b-bed4-2ab1ea81bf84.png",
  ],
} as const;

/** Partner logos (local SVG — remote placehold.co URLs return SVG blocked by next/image) */
export const PARTNER_LOGOS = {
  onp: "/images/partners/onp.svg",
  mpm: "/images/partners/mpm.svg",
} as const;

/** Per-formation cover images (slug → public path) */
export const FORMATION_IMAGES_BY_SLUG: Record<string, string> = {
  "qualification-peche-maritime": "/images/formation-fishing.jpg",
  "qualification-machine-maritime": "/images/formation-mechanics.jpg",
  "specialisation-peche-maritime": "/images/formation-fishing.jpg",
  "specialisation-machine-maritime": "/images/formation-mechanics.jpg",
};

/** Known dead remote URLs stored in legacy seed data */
export const BROKEN_FORMATION_IMAGE_URLS = new Set([
  "https://images.unsplash.com/photo-1567894340315-ef73403f69c8?w=800&q=80",
  "https://images.unsplash.com/photo-1567894340315-ef73403f69c8",
]);

export function resolveGalleryCoverImage(imageUrl: string | null | undefined): string {
  if (
    imageUrl &&
    !BROKEN_FORMATION_IMAGE_URLS.has(imageUrl) &&
    !imageUrl.includes("photo-1567894340315-ef73403f69c8")
  ) {
    if (imageUrl.startsWith("/")) return imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
  }
  return SITE_IMAGES.galleryFallback;
}

export function resolveFormationImage(
  imageUrl: string | null | undefined,
  slug?: string
): string {
  if (
    imageUrl &&
    !BROKEN_FORMATION_IMAGE_URLS.has(imageUrl) &&
    !imageUrl.includes("photo-1567894340315-ef73403f69c8")
  ) {
    if (imageUrl.startsWith("/")) return imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
  }

  if (slug && FORMATION_IMAGES_BY_SLUG[slug]) {
    return FORMATION_IMAGES_BY_SLUG[slug];
  }

  return SITE_IMAGES.formationFallback;
}

/** Hostnames allowed in next.config.ts `images.remotePatterns` */
export const NEXT_IMAGE_ALLOWED_HOSTS = new Set([
  "utfs.io",
  "uploadthing.com",
  "images.unsplash.com",
  "placehold.co",
  "media-cdn.tripadvisor.com",
]);

export function canUseNextImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    return NEXT_IMAGE_ALLOWED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function resolvePartnerLogo(
  logoUrl: string | null | undefined,
  name?: string
): string | null {
  if (logoUrl?.startsWith("/")) return logoUrl;

  if (logoUrl?.includes("placehold.co")) {
    if (logoUrl.includes("ONP") || name?.includes("Office National")) {
      return PARTNER_LOGOS.onp;
    }
    if (logoUrl.includes("MPM") || name?.includes("Ministère")) {
      return PARTNER_LOGOS.mpm;
    }
  }

  if (logoUrl?.startsWith("http://") || logoUrl?.startsWith("https://")) {
    return logoUrl;
  }

  return null;
}
