import { redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import type { Locale } from "@/types";

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) return null;
  const locale = l as Locale;
  redirect(`/${locale}/admission?tab=track`);
}
