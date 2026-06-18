import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import type { Locale } from "@/types";
import { getOpenInscriptionYear, getActiveLevels } from "@/services/inscription.service";
import { InscriptionFormPage } from "@/features/inscription/inscription-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription en ligne — CQPM Nador",
  description: "Déposez votre dossier d'inscription en ligne au Centre de Qualification Professionnelle Maritime de Nador",
};

export default async function InscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  if (!isValidLocale(l)) notFound();
  const locale = l as Locale;

  const [openYear, levels] = await Promise.all([
    getOpenInscriptionYear(),
    getActiveLevels(),
  ]);

  return (
    <InscriptionFormPage
      locale={locale}
      openYear={openYear}
      levels={levels}
    />
  );
}
