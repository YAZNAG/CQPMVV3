import { redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import type { Locale } from "@/types";

export default async function GalleryIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) redirect("/fr/gallery/photos");
  const locale = l as Locale;
  redirect(`/${locale}/gallery/photos`);
}
