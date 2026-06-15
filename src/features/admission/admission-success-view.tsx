"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, FolderOpen, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  downloadAdmissionReceiptPdf,
  printAdmissionReceipt,
} from "@/lib/admission-receipt-pdf";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";

interface AdmissionSuccessViewProps {
  locale: Locale;
  dict: Dictionary;
  reference: string;
  candidateName: string;
  formationTitle: string;
  categoryName: string;
  siteName: string;
  siteAddress: string;
  sitePhone: string;
  siteEmail: string;
  onNewApplication: () => void;
}

export function AdmissionSuccessView({
  locale,
  dict,
  reference,
  candidateName,
  formationTitle,
  categoryName,
  siteName,
  siteAddress,
  sitePhone,
  siteEmail,
  onNewApplication,
}: AdmissionSuccessViewProps) {
  const a = dict.admission;
  const [isDownloading, startDownload] = useTransition();
  const depositDate = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleDownloadPdf = () => {
    startDownload(() => {
      try {
        downloadAdmissionReceiptPdf({
          filename: `recu-inscription-${reference}.pdf`,
          siteName,
          siteDescription: dict.footer.description,
          siteAddress,
          sitePhone,
          siteEmail,
          rightsLabel: dict.footer.rights,
          receiptTitle: a.receiptTitle,
          successTitle: a.success,
          successMessage: a.successMessage,
          dossierDetails: a.dossierDetails,
          dossierNumberLabel: a.dossierNumber,
          depositDateLabel: a.depositDate,
          candidateNameLabel: a.candidateName,
          formationLabel: a.training,
          categoryLabel: a.filiere,
          statusLabel: a.status,
          statusValue: a.statusPending,
          reference,
          depositDateValue: depositDate,
          candidateName,
          formationTitle,
          categoryName,
        });
      } catch {
        toast.error(dict.common.error);
      }
    });
  };

  const detailRows = [
    { label: a.dossierNumber, value: reference, mono: true },
    { label: a.depositDate, value: depositDate },
    { label: a.candidateName, value: candidateName },
    { label: a.training, value: formationTitle },
    { label: a.filiere, value: categoryName },
    { label: a.status, value: a.statusPending, status: true },
  ] as const;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] print:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #0d2c54 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div
        id="admission-receipt-document"
        className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12 print:max-w-none print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none"
      >
        <div className="border-b border-slate-100 pb-6 print:border-navy-200">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ocean-500">
            {siteName}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-navy-900 sm:text-2xl">
            {a.receiptTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{dict.footer.description}</p>
        </div>

        <div className="py-8 text-center print:py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 print:h-14 print:w-14">
            <CheckCircle2 className="h-9 w-9 text-emerald-600 print:h-8 print:w-8" strokeWidth={1.75} />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold text-navy-900 sm:text-3xl print:text-2xl">
            {a.success}
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base print:text-sm">
            {a.successMessage}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left print:rounded-xl">
          <div className="h-1 bg-sky-400" aria-hidden />
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <FolderOpen className="h-5 w-5 text-sky-500" aria-hidden />
            <h4 className="font-bold text-navy-900">{a.dossierDetails}</h4>
          </div>

          <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6 print:gap-4 print:p-5">
            {detailRows.map((row) => (
              <div key={row.label}>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {row.label}
                </dt>
                <dd className="mt-1">
                  {"status" in row && row.status ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
                      {row.value}
                    </span>
                  ) : (
                    <span
                      className={
                        "mono" in row && row.mono
                          ? "inline-block rounded-md border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-sm font-bold text-navy-900"
                          : "text-sm font-medium text-navy-900"
                      }
                    >
                      {row.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 print:mt-6">
          {siteAddress && <p>{siteAddress}</p>}
          {(sitePhone || siteEmail) && (
            <p className="mt-1">
              {[sitePhone, siteEmail].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-3 text-slate-400">
            © {new Date().getFullYear()} {siteName}. {dict.footer.rights}.
          </p>
        </div>
      </div>

      <div className="admission-print-hide mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 print:hidden">
        <Button
          type="button"
          disabled={isDownloading}
          className="rounded-lg bg-[#E85D2A] px-6 hover:bg-[#d4521f]"
          onClick={handleDownloadPdf}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {dict.common.loading}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {a.downloadReceipt}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-lg border-slate-300"
          onClick={printAdmissionReceipt}
        >
          <Printer className="h-4 w-4" />
          {a.printReceipt}
        </Button>
      </div>

      <div className="admission-print-hide mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-4 print:hidden">
        <Button variant="ocean" onClick={onNewApplication}>
          {a.newApplication}
        </Button>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {a.backHome}
        </Link>
      </div>
    </div>
  );
}
