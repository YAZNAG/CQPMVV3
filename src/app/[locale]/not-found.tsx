import Link from "next/link";

export default function LocaleNotFound({
  params,
}: {
  params?: { locale?: string };
}) {
  const locale = params?.locale === "ar" ? "ar" : "fr";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-ocean-600">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">
        {locale === "ar" ? "الصفحة غير موجودة" : "Page introuvable"}
      </h1>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-ocean-500 px-6 text-sm font-medium text-white hover:bg-ocean-600"
      >
        {locale === "ar" ? "العودة إلى الرئيسية" : "Retour à l'accueil"}
      </Link>
    </div>
  );
}
