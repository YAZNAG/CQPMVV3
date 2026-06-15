import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageIcon, Video } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbSchema,
  buildImageGallerySchema,
  jsonLdGraph,
} from "@/lib/seo/structured-data";
import {
  getAlbumBySlug,
  getAlbumBySlugForMetadata,
  type GalleryMediaFilter,
} from "@/services/gallery.service";
import { PageHero } from "@/components/public/page-hero";
import { Container } from "@/components/public/container";
import { GalleryMediaGrid } from "@/features/gallery/gallery-media-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/types";

function parseMediaFilter(type?: string): GalleryMediaFilter {
  if (type === "photo" || type === "video") return type;
  return "all";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isValidLocale(l)) return {};
  const album = await getAlbumBySlugForMetadata(slug, locale);
  return buildMetadata({
    locale,
    title: album?.title ?? "Galerie",
    description: album?.description ?? "",
    path: `/gallery/${slug}`,
    image: album?.coverImageUrl ?? undefined,
  });
}

export default async function GalleryAlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale: l, slug } = await params;
  const { type } = await searchParams;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  const mediaFilter = parseMediaFilter(type);

  const [dict, album] = await Promise.all([
    getDictionary(locale),
    getAlbumBySlug(slug, locale, mediaFilter),
  ]);
  if (!album) notFound();

  const p = dict.pages.gallery;
  const basePath = `/${locale}/gallery/${slug}`;

  const filterLinks: { value: GalleryMediaFilter; label: string; count: number }[] = [
    { value: "all", label: p.filterAll, count: album.photoCount + album.videoCount },
    { value: "photo", label: p.filterPhotos, count: album.photoCount },
    { value: "video", label: p.filterVideos, count: album.videoCount },
  ];

  const gallerySchema = jsonLdGraph(
    buildImageGallerySchema({
      locale,
      name: album.title,
      description: album.description,
      slug,
      imageUrl: album.coverImageUrl,
    }),
    buildBreadcrumbSchema(locale, [
      { name: dict.nav.home, path: "" },
      { name: p.title, path: "/gallery/photos" },
      { name: album.title, path: `/gallery/${slug}` },
    ])
  );

  return (
    <>
      <JsonLd data={gallerySchema} />
      <PageHero title={album.title} subtitle={album.description} compact />

      <section className="py-16">
        <Container>
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href={`/${locale}/gallery/photos`}>
              <ArrowLeft className="h-4 w-4" />
              {dict.common.back}
            </Link>
          </Button>

          <div className="mb-8 flex flex-wrap gap-2">
            {filterLinks.map((f) => {
              if (f.value !== "all" && f.count === 0) return null;
              const href =
                f.value === "all" ? basePath : `${basePath}?type=${f.value}`;
              return (
                <Link key={f.value} href={href}>
                  <Badge
                    variant={mediaFilter === f.value ? "ocean" : "default"}
                    className="cursor-pointer gap-1 px-4 py-2 text-sm"
                  >
                    {f.value === "photo" && <ImageIcon className="h-3.5 w-3.5" />}
                    {f.value === "video" && <Video className="h-3.5 w-3.5" />}
                    {f.label}
                    <span className="opacity-70">({f.count})</span>
                  </Badge>
                </Link>
              );
            })}
          </div>

          {album.items.length === 0 ? (
            <p className="py-12 text-center text-navy-600">{dict.common.noResults}</p>
          ) : (
            <GalleryMediaGrid
              items={album.items.map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                imageUrl: item.imageUrl,
                videoUrl: item.videoUrl,
              }))}
              photosLabel={p.photos}
              videosLabel={p.videos}
            />
          )}
        </Container>
      </section>
    </>
  );
}
