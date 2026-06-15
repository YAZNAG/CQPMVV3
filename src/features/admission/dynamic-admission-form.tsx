"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationFileUpload } from "@/components/public/application-file-upload";
import { submitApplication } from "@/actions/application.actions";
import type {
  AdmissionFormFieldRecord,
  FormationDocumentRequirementRecord,
} from "@/services/admission-form.service";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

type FormValues = Record<string, string | boolean | string[]>;
type DocUploads = Record<string, string>;

interface DynamicAdmissionFormProps {
  fields: AdmissionFormFieldRecord[];
  documentsByFormation: Record<string, FormationDocumentRequirementRecord[]>;
  formations: { id: string; title: string }[];
  locale: Locale;
  dict: Dictionary;
}

function localized(
  field: AdmissionFormFieldRecord | FormationDocumentRequirementRecord,
  locale: Locale,
  key: "label" | "placeholder" | "hint"
) {
  const isAr = locale === "ar";
  if ("type" in field) {
    if (key === "label") return isAr ? field.labelAr : field.labelFr;
    if (key === "placeholder") {
      const v = isAr ? field.placeholderAr : field.placeholderFr;
      return v ?? undefined;
    }
    const v = isAr ? field.helpTextAr : field.helpTextFr;
    return v ?? undefined;
  }
  if (key === "label") return isAr ? field.labelAr : field.labelFr;
  const v = isAr ? field.hintAr : field.hintFr;
  return v ?? undefined;
}

export function DynamicAdmissionForm({
  fields,
  documentsByFormation,
  formations,
  locale,
  dict,
}: DynamicAdmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(() => {
    const init: FormValues = {};
    for (const field of fields) {
      if (field.type === "CHECKBOX") init[field.key] = field.defaultValue === "true";
      else if (field.type === "CHECKBOX_GROUP") init[field.key] = [];
      else init[field.key] = field.defaultValue ?? "";
    }
    return init;
  });
  const [documents, setDocuments] = useState<DocUploads>({});

  const selectedFormationId = useMemo(() => {
    const fid = String(values.formationId ?? "").trim();
    return fid || null;
  }, [values.formationId]);

  const requiredDocs = selectedFormationId
    ? documentsByFormation[selectedFormationId] ?? []
    : [];

  const submitField = fields.find((f) => f.type === "SUBMIT_BUTTON");
  const fieldsBeforeDocs = fields.filter(
    (f) =>
      f.type !== "SUBMIT_BUTTON" &&
      f.key !== "documents_heading" &&
      f.type !== "HEADING" &&
      f.type !== "PARAGRAPH" &&
      f.type !== "DIVIDER"
  );
  const docsHeading = fields.find((f) => f.key === "documents_heading" || f.type === "HEADING");

  const setValue = (key: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "formationId") {
      setDocuments({});
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormationId) {
      toast.error(dict.admission.errors.formation);
      return;
    }

    const missing = requiredDocs.filter((d) => d.isRequired && !documents[d.documentKey]);
    if (missing.length > 0) {
      toast.error(dict.admission.errors.documents);
      return;
    }

    setLoading(true);
    const result = await submitApplication({
      formationId: selectedFormationId,
      formData: values,
      documents: Object.entries(documents).map(([documentKey, fileUrl]) => ({
        documentKey,
        fileUrl,
      })),
    });
    setLoading(false);

    if (result.success && result.data) {
      setSubmittedRef(result.data.referenceNumber);
      toast.success(dict.admission.success);
    } else {
      toast.error(result.error ?? dict.common.error);
    }
  };

  if (submittedRef) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-10 text-center shadow-lg"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
        <h3 className="mt-4 text-2xl font-bold text-navy-900">{dict.admission.success}</h3>
        <p className="mt-2 text-sm text-slate-600">{dict.admission.successHint}</p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {dict.admission.reference}
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-ocean-700">{submittedRef}</p>
        <Button
          variant="ocean"
          className="mt-8"
          onClick={() => {
            setSubmittedRef(null);
            setDocuments({});
            const reset: FormValues = {};
            for (const field of fields) {
              if (field.type === "CHECKBOX") reset[field.key] = false;
              else if (field.type === "CHECKBOX_GROUP") reset[field.key] = [];
              else reset[field.key] = field.defaultValue ?? "";
            }
            setValues(reset);
          }}
        >
          {dict.admission.newApplication}
        </Button>
      </motion.div>
    );
  }

  const renderField = (field: AdmissionFormFieldRecord) => {
    const label = localized(field, locale, "label");
    const placeholder = localized(field, locale, "placeholder");
    const help = localized(field, locale, "hint");
    const value = values[field.key];
    const inputClass = "border-slate-200 bg-white focus-visible:ring-ocean-500/30";

    switch (field.type) {
      case "FORMATION_SELECT":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{label}{field.isRequired && " *"}</Label>
            <select
              id={field.key}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              required={field.isRequired}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
            >
              <option value="">{dict.admission.fields.formationPlaceholder}</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        );
      case "GENDER_SELECT":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{label}{field.isRequired && " *"}</Label>
            <select
              id={field.key}
              value={String(value ?? "M")}
              onChange={(e) => setValue(field.key, e.target.value)}
              required={field.isRequired}
              className={cn("flex h-11 w-full rounded-xl border px-4 text-sm shadow-sm", inputClass)}
            >
              <option value="M">{dict.admission.fields.genderM}</option>
              <option value="F">{dict.admission.fields.genderF}</option>
              <option value="Autre">{dict.admission.fields.genderOther}</option>
            </select>
          </div>
        );
      case "TEXTAREA":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{label}{field.isRequired && " *"}</Label>
            <Textarea
              id={field.key}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={placeholder}
              required={field.isRequired}
              rows={4}
              className={inputClass}
              dir={locale === "ar" ? "rtl" : undefined}
            />
          </div>
        );
      case "SELECT":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{label}{field.isRequired && " *"}</Label>
            <select
              id={field.key}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              required={field.isRequired}
              className={cn("flex h-11 w-full rounded-xl border px-4 text-sm", inputClass)}
            >
              <option value="">—</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {locale === "ar" ? opt.labelAr : opt.labelFr}
                </option>
              ))}
            </select>
          </div>
        );
      default: {
        const inputType =
          field.type === "EMAIL"
            ? "email"
            : field.type === "TEL"
              ? "tel"
              : field.type === "NUMBER"
                ? "number"
                : field.type === "DATE"
                  ? "date"
                  : "text";
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>{label}{field.isRequired && " *"}</Label>
            <Input
              id={field.key}
              type={inputType}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={placeholder}
              required={field.isRequired}
              className={cn("h-11 rounded-xl shadow-sm", inputClass)}
              dir={locale === "ar" ? "rtl" : undefined}
            />
            {help && <p className="text-xs text-slate-500">{help}</p>}
          </div>
        );
      }
    }
  };

  const buttonLabel = submitField
    ? localized(submitField, locale, "label")
    : dict.admission.submit;

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="space-y-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fieldsBeforeDocs.map((field) => (
          <div
            key={field.id}
            className={cn(field.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}
          >
            {renderField(field)}
          </div>
        ))}
      </div>

      {docsHeading && (
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ocean-600">
            {localized(docsHeading, locale, "label")}
          </h3>
          {localized(docsHeading, locale, "hint") && (
            <p className="mt-1 text-sm text-slate-500">
              {localized(docsHeading, locale, "hint")}
            </p>
          )}
        </div>
      )}

      {!selectedFormationId ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-8 text-center text-sm text-slate-500">
          {locale === "ar"
            ? "اختر التكوين لعرض المرفقات المطلوبة."
            : "Choisissez une formation pour afficher les pièces jointes requises."}
        </p>
      ) : requiredDocs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 py-6 text-center text-sm text-amber-800">
          {locale === "ar"
            ? "لا توجد مرفقات مطلوبة لهذا التكوين."
            : "Aucune pièce jointe requise pour cette formation."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requiredDocs.map((doc) => (
            <ApplicationFileUpload
              key={doc.documentKey}
              label={localized(doc, locale, "label") ?? doc.labelFr}
              hint={localized(doc, locale, "hint") ?? undefined}
              acceptTypes={doc.acceptTypes}
              maxSizeMb={doc.maxSizeMb}
              required={doc.isRequired}
              uploaded={!!documents[doc.documentKey]}
              onUploaded={(url) =>
                setDocuments((prev) => ({ ...prev, [doc.documentKey]: url }))
              }
            />
          ))}
        </div>
      )}

      <Button
        type="submit"
        variant="ocean"
        size="lg"
        disabled={loading || !selectedFormationId}
        className="w-full sm:w-auto shadow-lg shadow-ocean-600/20"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {dict.common.loading}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </Button>
    </motion.form>
  );
}
