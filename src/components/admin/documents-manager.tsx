"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  EyeOff,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/admin-panel";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  toggleDocumentStatus,
} from "@/actions/admin/document.actions";
import { uploadAdminDocument } from "@/actions/admin/upload.actions";
import type { DocumentAdminRow, DocumentCategoryAdminRow } from "@/services/document-admin.service";

const FILE_ICONS: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-red-500" />,
  DOC: <FileText className="h-4 w-4 text-blue-500" />,
  DOCX: <FileText className="h-4 w-4 text-blue-500" />,
  XLS: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  XLSX: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  PPT: <File className="h-4 w-4 text-orange-500" />,
  PPTX: <File className="h-4 w-4 text-orange-500" />,
  ZIP: <File className="h-4 w-4 text-slate-500" />,
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

interface Props {
  documents: DocumentAdminRow[];
  categories: DocumentCategoryAdminRow[];
  stats: { total: number; published: number; draft: number; totalDownloads: number };
}

const EMPTY_FORM = {
  id: "",
  titleFr: "",
  titleAr: "",
  descriptionFr: "",
  descriptionAr: "",
  categoryId: "",
  fileUrl: "",
  fileName: "",
  fileType: "PDF",
  fileSize: 0,
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
  sortOrder: 0,
};

export function DocumentsManager({ documents, categories, stats }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "DRAFT" | "PUBLISHED">("all");

  const setField = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: documents.length });
  };

  const loadEdit = (d: DocumentAdminRow) => {
    setEditingId(d.id);
    setForm({
      id: d.id,
      titleFr: d.titleFr,
      titleAr: d.titleAr ?? "",
      descriptionFr: d.descriptionFr ?? "",
      descriptionAr: d.descriptionAr ?? "",
      categoryId: d.categoryId ?? "",
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      sortOrder: d.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadAdminDocument(fd);
      if (result.success && result.data) {
        setForm((f) => ({
          ...f,
          fileUrl: result.data!.url,
          fileName: result.data!.fileName,
          fileType: result.data!.fileType,
          fileSize: result.data!.fileSize,
        }));
        toast.success("Fichier téléversé");
      } else {
        toast.error(result.error ?? "Erreur upload");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileUrl) {
      toast.error("Veuillez téléverser un fichier");
      return;
    }
    const payload = {
      titleFr: form.titleFr,
      titleAr: form.titleAr || null,
      descriptionFr: form.descriptionFr || null,
      descriptionAr: form.descriptionAr || null,
      categoryId: form.categoryId || null,
      fileUrl: form.fileUrl,
      fileName: form.fileName,
      fileType: form.fileType,
      fileSize: form.fileSize,
      status: form.status,
      sortOrder: form.sortOrder,
      ...(editingId ? { id: editingId } : {}),
    };

    startTransition(async () => {
      const result = editingId
        ? await updateDocument(payload)
        : await createDocument(payload);

      if (result.success) {
        toast.success(editingId ? "Document mis à jour" : "Document créé");
        reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    startTransition(async () => {
      const result = await deleteDocument(id);
      if (result.success) {
        toast.success("Document supprimé");
        if (editingId === id) reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleDocumentStatus(id);
      if (result.success) {
        toast.success("Statut mis à jour");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const filtered = documents.filter((d) => {
    const matchSearch =
      !search ||
      d.titleFr.toLowerCase().includes(search.toLowerCase()) ||
      (d.titleAr ?? "").toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || d.categoryId === filterCategory;
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "text-navy-900" },
          { label: "Publiés", value: stats.published, color: "text-green-600" },
          { label: "Brouillons", value: stats.draft, color: "text-amber-600" },
          { label: "Téléchargements", value: stats.totalDownloads, color: "text-ocean-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="text-lg">
                {editingId ? "Modifier le document" : "Nouveau document"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* File upload */}
                <div className="space-y-2">
                  <Label>Fichier *</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="docFile"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Upload..." : "Choisir fichier"}
                    </Button>
                  </div>
                  {form.fileUrl && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      {FILE_ICONS[form.fileType] ?? <File className="h-4 w-4" />}
                      <span className="flex-1 truncate text-slate-700">{form.fileName}</span>
                      <span className="text-xs text-slate-400">{formatBytes(form.fileSize)}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP · max 20 Mo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docTitleFr">Titre (FR) *</Label>
                  <Input
                    id="docTitleFr"
                    value={form.titleFr}
                    onChange={(e) => setField("titleFr", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docTitleAr">Titre (AR)</Label>
                  <Input
                    id="docTitleAr"
                    value={form.titleAr}
                    onChange={(e) => setField("titleAr", e.target.value)}
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docDescFr">Description (FR)</Label>
                  <Textarea
                    id="docDescFr"
                    value={form.descriptionFr}
                    onChange={(e) => setField("descriptionFr", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docDescAr">Description (AR)</Label>
                  <Textarea
                    id="docDescAr"
                    value={form.descriptionAr}
                    onChange={(e) => setField("descriptionAr", e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={form.categoryId || "none"}
                    onValueChange={(v) => setField("categoryId", v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sans catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sans catégorie</SelectItem>
                      {categories
                        .filter((c) => c.isActive)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nameFr}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setField("status", v as "DRAFT" | "PUBLISHED")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Brouillon</SelectItem>
                        <SelectItem value="PUBLISHED">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docOrder">Ordre</Label>
                    <Input
                      id="docOrder"
                      type="number"
                      min={0}
                      value={form.sortOrder}
                      onChange={(e) => setField("sortOrder", Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="ocean" disabled={isPending || isUploading}>
                    <Plus className="h-4 w-4" />
                    {editingId ? "Enregistrer" : "Créer"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={reset}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </AdminCardContent>
          </AdminCard>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="text-lg">Documents ({filtered.length})</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {/* Filters */}
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-9"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="PUBLISHED">Publiés</SelectItem>
                    <SelectItem value="DRAFT">Brouillons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Aucun document trouvé.</p>
              ) : (
                <ul className="divide-y">
                  {filtered.map((doc) => (
                    <li key={doc.id} className="py-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0">
                          {FILE_ICONS[doc.fileType] ?? <File className="h-4 w-4 text-slate-400" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium text-sm text-navy-900">{doc.titleFr}</p>
                            <Badge
                              variant="default"
                              className={`shrink-0 text-xs ${doc.status !== "PUBLISHED" ? "bg-slate-100 text-slate-500" : ""}`}
                            >
                              {doc.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                            </Badge>
                            {doc.categoryNameFr && (
                              <span className="text-xs text-slate-400">{doc.categoryNameFr}</span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                            <span>{doc.fileType}</span>
                            <span>·</span>
                            <span>{formatBytes(doc.fileSize)}</span>
                            <span>·</span>
                            <span>
                              <Download className="inline h-3 w-3" /> {doc.downloadCount}
                            </span>
                            {doc.publishedAt && (
                              <>
                                <span>·</span>
                                <span>{format(new Date(doc.publishedAt), "dd/MM/yyyy", { locale: fr })}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(doc.id)}
                            disabled={isPending}
                            title={doc.status === "PUBLISHED" ? "Mettre en brouillon" : "Publier"}
                          >
                            {doc.status === "PUBLISHED" ? (
                              <EyeOff className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Eye className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => loadEdit(doc)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(doc.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCardContent>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
