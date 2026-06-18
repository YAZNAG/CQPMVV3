import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import type { Locale } from "@/types";
import { SuiviInscriptionPage } from "@/features/inscription/suivi-inscription-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi d'inscription — CQPM Nador",
  description: "Suivez l'avancement de votre dossier d'inscription au CQPM Nador",
};

export default async function SuiviPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;
  return <SuiviInscriptionPage locale={locale} />;
}
