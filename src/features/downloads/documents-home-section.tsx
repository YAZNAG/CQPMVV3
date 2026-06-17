"use client";

import Link from "next/link";
import { Download, FileText, FileSpreadsheet, File, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { Container } from "@/components/public/container";
import type { PublicDocument } from "@/services/document.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  DOC: FileText,
  DOCX: FileText,
  XLS: FileSpreadsheet,
  XLSX: FileSpreadsheet,
  PPT: File,
  PPTX: File,
  ZIP: File,
};

const FILE_COLORS: Record<string, string> = {
  PDF: "bg-red-50 text-red-600",
  DOC: "bg-blue-50 text-blue-600",
  DOCX: "bg-blue-50 text-blue-600",
  XLS: "bg-green-50 text-green-600",
  XLSX: "bg-green-50 text-green-600",
  PPT: "bg-orange-50 text-orange-600",
  PPTX: "bg-orange-50 text-orange-600",
  ZIP: "bg-slate-50 text-slate-600",
};

interface Props {
  locale: Locale;
  title: string;
  subtitle: string;
  documents: PublicDocument[];
  viewMoreLabel?: string;
}

export function DocumentsHomeSection({ locale, title, subtitle, documents, viewMoreLabel }: Props) {
  const isRtl = locale === "ar";
  const viewMore = viewMoreLabel ?? (locale === "ar" ? "عرض المزيد" : "Voir plus");
  const downloadLabel = locale === "ar" ? "تحميل" : "Télécharger";

  if (documents.length === 0) return null;

  return (
    <section className="bg-slate-100/90 py-16 lg:py-24" id="telechargements">
      <Container>
        <HomeScrollReveal index={0} locale={locale}>
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">{subtitle}</p>
          </div>
        </HomeScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {documents.map((doc, index) => {
            const IconComp = FILE_ICONS[doc.fileType] ?? File;
            const colorClass = FILE_COLORS[doc.fileType] ?? "bg-slate-50 text-slate-600";

            return (
              <HomeScrollReveal key={doc.id} index={index} locale={locale} item>
                <article className="flex h-full flex-col rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]">
                  {/* Icon + type */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                        colorClass
                      )}
                    >
                      <IconComp className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {doc.fileType}
                      </span>
                      {doc.categoryName && (
                        <p className="text-xs text-ocean-600 font-medium">{doc.categoryName}</p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      "text-sm font-bold leading-snug text-navy-900 flex-1",
                      isRtl && "text-right"
                    )}
                  >
                    {doc.title}
                  </h3>

                  {/* Description */}
                  {doc.description && (
                    <p className={cn("mt-2 text-xs text-slate-500 line-clamp-2", isRtl && "text-right")}>
                      {doc.description}
                    </p>
                  )}

                  {/* Date */}
                  {doc.publishedAt && (
                    <div className={cn("mt-3 flex items-center gap-1 text-xs text-slate-400", isRtl && "justify-end")}>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(doc.publishedAt), "dd/MM/yyyy", {
                          locale: locale === "fr" ? frLocale : undefined,
                        })}
                      </span>
                    </div>
                  )}

                  {/* Download button */}
                  <a
                    href={doc.fileUrl}
                    download
                    target={doc.fileUrl.startsWith("http") ? "_blank" : undefined}
                    rel={doc.fileUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={cn(
                      "mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-ocean-600",
                      isRtl && "flex-row-reverse"
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloadLabel}
                  </a>
                </article>
              </HomeScrollReveal>
            );
          })}
        </div>

        {/* View more */}
        <HomeScrollReveal index={documents.length} locale={locale}>
          <div className="mt-10 flex justify-center">
            <Link
              href={`/${locale}/telechargements`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-navy-50 hover:border-navy-300",
                isRtl && "flex-row-reverse"
              )}
            >
              {viewMore}
              <ChevronRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
            </Link>
          </div>
        </HomeScrollReveal>
      </Container>
    </section>
  );
}
