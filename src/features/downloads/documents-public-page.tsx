"use client";

import { useState, useTransition } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { Container } from "@/components/public/container";
import { cn } from "@/lib/utils";
import { recordDocumentDownload } from "@/actions/public/document.actions";
import type { PublicDocument, PublicDocumentCategory } from "@/services/document.service";
import type { Locale } from "@/types";

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
  PDF: "bg-red-50 text-red-600 border-red-200",
  DOC: "bg-blue-50 text-blue-600 border-blue-200",
  DOCX: "bg-blue-50 text-blue-600 border-blue-200",
  XLS: "bg-green-50 text-green-600 border-green-200",
  XLSX: "bg-green-50 text-green-600 border-green-200",
  PPT: "bg-orange-50 text-orange-600 border-orange-200",
  PPTX: "bg-orange-50 text-orange-600 border-orange-200",
  ZIP: "bg-slate-50 text-slate-600 border-slate-200",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "–";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface Props {
  locale: Locale;
  documents: PublicDocument[];
  categories: PublicDocumentCategory[];
}

export function DocumentsPublicPage({ locale, documents, categories }: Props) {
  const isRtl = locale === "ar";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [, startTransition] = useTransition();

  const labels = {
    pageTitle: isRtl ? "فضاء التحميلات" : "Espace Téléchargements",
    pageSubtitle: isRtl
      ? "تصفح وتحميل جميع الوثائق الرسمية للمركز"
      : "Consultez et téléchargez l'ensemble des documents officiels du centre",
    searchPlaceholder: isRtl ? "بحث..." : "Rechercher un document…",
    allCategories: isRtl ? "جميع الفئات" : "Toutes les catégories",
    downloadBtn: isRtl ? "تحميل" : "Télécharger",
    noResults: isRtl ? "لا توجد وثائق." : "Aucun document disponible.",
    downloads: isRtl ? "تحميل" : "téléch.",
  };

  const filtered = documents.filter((doc) => {
    const matchCat =
      selectedCategory === "all" || doc.categorySlug === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.titleFr.toLowerCase().includes(q) ||
      (doc.titleAr ?? "").toLowerCase().includes(q) ||
      (doc.description ?? "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleDownload = (id: string) => {
    startTransition(async () => {
      await recordDocumentDownload(id);
    });
  };

  return (
    <div className={cn("min-h-screen bg-slate-50", isRtl && "dir-rtl")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-navy-900 py-16">
        <Container>
          <div className={cn("text-center", isRtl && "text-right")}>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {labels.pageTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-navy-200 sm:text-lg">
              {labels.pageSubtitle}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        {/* Filters */}
        <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-center", isRtl && "sm:flex-row-reverse")}>
          {/* Search */}
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400", isRtl ? "right-3" : "left-3")} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className={cn(
                "w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-navy-900 placeholder:text-slate-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20",
                isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
              )}
            />
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className={cn("flex items-center gap-2 flex-wrap", isRtl && "flex-row-reverse")}>
              <Filter className="h-4 w-4 shrink-0 text-slate-400" />
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  selectedCategory === "all"
                    ? "bg-navy-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-navy-300"
                )}
              >
                {labels.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    selectedCategory === cat.slug
                      ? "bg-ocean-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-ocean-300"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className={cn("mb-6 text-sm text-slate-500", isRtl && "text-right")}>
          {isRtl ? `${filtered.length} وثيقة` : `${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <p className="text-slate-500">{labels.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((doc) => {
              const IconComp = FILE_ICONS[doc.fileType] ?? File;
              const colorClass = FILE_COLORS[doc.fileType] ?? "bg-slate-50 text-slate-600 border-slate-200";

              return (
                <article
                  key={doc.id}
                  className="flex flex-col rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)]"
                >
                  {/* Type badge */}
                  <div className={cn("flex items-center gap-3 mb-4", isRtl && "flex-row-reverse")}>
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", colorClass)}>
                      <IconComp className="h-5 w-5" />
                    </span>
                    <div className={isRtl ? "text-right" : ""}>
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        {doc.fileType}
                      </span>
                      <span className="text-xs text-slate-400">{formatBytes(doc.fileSize)}</span>
                    </div>
                  </div>

                  {/* Category */}
                  {doc.categoryName && (
                    <span className={cn("mb-2 inline-block text-xs font-semibold text-ocean-600", isRtl && "text-right")}>
                      {doc.categoryName}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className={cn("flex-1 text-sm font-bold leading-snug text-navy-900", isRtl && "text-right")}>
                    {doc.title}
                  </h2>

                  {/* Description */}
                  {doc.description && (
                    <p className={cn("mt-2 text-xs text-slate-500 line-clamp-2", isRtl && "text-right")}>
                      {doc.description}
                    </p>
                  )}

                  {/* Date + downloads */}
                  <div className={cn("mt-3 flex items-center justify-between text-xs text-slate-400", isRtl && "flex-row-reverse")}>
                    {doc.publishedAt ? (
                      <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.publishedAt), "dd/MM/yyyy", {
                          locale: locale === "fr" ? frLocale : undefined,
                        })}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className={cn("flex items-center gap-1", isRtl && "flex-row-reverse")}>
                      <Download className="h-3 w-3" />
                      {doc.downloadCount} {labels.downloads}
                    </span>
                  </div>

                  {/* Download button */}
                  <a
                    href={doc.fileUrl}
                    download
                    target={doc.fileUrl.startsWith("http") ? "_blank" : undefined}
                    rel={doc.fileUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    onClick={() => handleDownload(doc.id)}
                    className={cn(
                      "mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-ocean-600",
                      isRtl && "flex-row-reverse"
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {labels.downloadBtn}
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
