import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-ocean-600">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">Page introuvable</h1>
      <p className="mt-3 max-w-md text-sm text-navy-600">
        La page demandée n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href={`/${defaultLocale}`}
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-ocean-500 px-6 text-sm font-medium text-white hover:bg-ocean-600"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
