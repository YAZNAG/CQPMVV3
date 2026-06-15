"use client";

import { useMemo, useState } from "react";
import {
  Anchor,
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Heart,
  Info,
  Loader2,
  Lock,
  MapPin,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationFileUpload } from "@/components/public/application-file-upload";
import { submitApplication } from "@/actions/application.actions";
import { AdmissionStepper, type AdmissionStepId } from "@/features/admission/admission-stepper";
import { AdmissionSuccessView } from "@/features/admission/admission-success-view";
import type {
  AdmissionFormFieldRecord,
  FormationDocumentRequirementRecord,
} from "@/services/admission-form.service";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

type FormValues = Record<string, string | boolean | string[]>;
type DocUploads = Record<string, string>;

export type AdmissionCategory = {
  id: string;
  name: string;
  formations: {
    id: string;
    title: string;
    slug: string;
    requirements: string;
    duration: string;
    description: string;
  }[];
};

interface AdmissionWizardProps {
  dict: Dictionary;
  locale: Locale;
  categories: AdmissionCategory[];
  fields: AdmissionFormFieldRecord[];
  documentsByFormation: Record<string, FormationDocumentRequirementRecord[]>;
  siteName: string;
  siteAddress: string | null;
  sitePhone: string | null;
  siteEmail: string | null;
}

const STEP_IDS: AdmissionStepId[] = [
  "filiere",
  "centre",
  "conditions",
  "documents",
  "confirmation",
];

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

function parseRequirementLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter(Boolean);
}

function initValues(fields: AdmissionFormFieldRecord[]): FormValues {
  const init: FormValues = {};
  for (const field of fields) {
    if (field.type === "CHECKBOX") init[field.key] = field.defaultValue === "true";
    else if (field.type === "CHECKBOX_GROUP") init[field.key] = [];
    else init[field.key] = field.defaultValue ?? "";
  }
  return init;
}

export function AdmissionWizard({
  dict,
  locale,
  categories,
  fields,
  documentsByFormation,
  siteName,
  siteAddress,
  sitePhone,
  siteEmail,
}: AdmissionWizardProps) {
  const a = dict.admission;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(() => initValues(fields));
  const [documents, setDocuments] = useState<DocUploads>({});
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmData, setConfirmData] = useState(false);

  const steps = STEP_IDS.map((id) => ({ id, label: a.steps[id] }));

  const selectedFormationId = String(values.formationId ?? "").trim() || null;

  const selectedMeta = useMemo(() => {
    if (!selectedFormationId) return null;
    for (const cat of categories) {
      const formation = cat.formations.find((f) => f.id === selectedFormationId);
      if (formation) return { formation, categoryName: cat.name };
    }
    return null;
  }, [categories, selectedFormationId]);

  const requiredDocs = selectedFormationId
    ? documentsByFormation[selectedFormationId] ?? []
    : [];

  const personalFields = fields.filter(
    (f) =>
      f.type !== "FORMATION_SELECT" &&
      f.type !== "SUBMIT_BUTTON" &&
      f.key !== "documents_heading" &&
      f.type !== "HEADING" &&
      f.type !== "PARAGRAPH" &&
      f.type !== "DIVIDER"
  );

  const requirementItems = useMemo(() => {
    const raw = selectedMeta?.formation.requirements?.trim();
    if (raw) {
      const parsed = parseRequirementLines(raw);
      if (parsed.length > 0) return parsed;
    }
    return a.conditions.defaultItems;
  }, [a.conditions.defaultItems, selectedMeta?.formation.requirements]);

  const setValue = (key: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const candidateName = `${values.firstName ?? ""} ${values.lastName ?? ""}`.trim();

  const validatePersonalFields = () => {
    for (const field of personalFields) {
      if (!field.isRequired) continue;
      const val = values[field.key];
      if (val === undefined || val === null || String(val).trim() === "") {
        toast.error(dict.admission.errors.required);
        return false;
      }
    }
    return true;
  };

  const validateDocuments = () => {
    const missing = requiredDocs.filter((d) => d.isRequired && !documents[d.documentKey]);
    if (missing.length > 0) {
      toast.error(dict.admission.errors.documents);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !selectedFormationId) {
      toast.error(dict.admission.errors.formation);
      return;
    }
    if (step === 3) {
      if (!conditionsAccepted) {
        toast.error(
          locale === "ar"
            ? "يرجى تأكيد الشروط."
            : "Veuillez confirmer les conditions d'inscription."
        );
        return;
      }
      if (!validatePersonalFields()) return;
    }
    if (step === 4 && !validateDocuments()) return;
    setStep((s) => Math.min(s + 1, steps.length));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const resetWizard = () => {
    setSubmittedRef(null);
    setStep(1);
    setValues(initValues(fields));
    setDocuments({});
    setConditionsAccepted(false);
    setConfirmInfo(false);
    setConfirmData(false);
  };

  const onSubmit = async () => {
    if (!selectedFormationId) return;
    if (!confirmInfo || !confirmData) {
      toast.error(
        locale === "ar" ? "يرجى تأكيد جميع الخانات." : "Veuillez cocher les confirmations."
      );
      return;
    }
    if (!validateDocuments()) return;

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

  const renderField = (field: AdmissionFormFieldRecord) => {
    const label = localized(field, locale, "label");
    const placeholder = localized(field, locale, "placeholder");
    const help = localized(field, locale, "hint");
    const value = values[field.key];
    const inputClass = "border-slate-200 bg-white focus-visible:ring-ocean-500/30";

    switch (field.type) {
      case "GENDER_SELECT":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {label}
              {field.isRequired && <span className="text-red-500"> *</span>}
            </Label>
            <select
              id={field.key}
              value={String(value ?? "M")}
              onChange={(e) => setValue(field.key, e.target.value)}
              required={field.isRequired}
              className={cn("flex h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
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
            <Label htmlFor={field.key}>
              {label}
              {field.isRequired && <span className="text-red-500"> *</span>}
            </Label>
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
            <Label htmlFor={field.key}>
              {label}
              {field.isRequired && <span className="text-red-500"> *</span>}
            </Label>
            <select
              id={field.key}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              required={field.isRequired}
              className={cn("flex h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
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
            <Label htmlFor={field.key}>
              {label}
              {field.isRequired && <span className="text-red-500"> *</span>}
            </Label>
            <Input
              id={field.key}
              type={inputType}
              value={String(value ?? "")}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={placeholder}
              required={field.isRequired}
              className={cn("h-11 rounded-lg", inputClass)}
              dir={locale === "ar" ? "rtl" : undefined}
            />
            {help && <p className="text-xs text-slate-500">{help}</p>}
          </div>
        );
      }
    }
  };

  const SummarySidebar = ({ className }: { className?: string }) => (
    <aside
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        className
      )}
    >
      <h3 className="text-base font-bold text-navy-900">{a.summary.title}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {a.summary.program}
          </dt>
          <dd className="mt-1 font-medium text-navy-900">
            {selectedMeta?.formation.title ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {a.summary.level}
          </dt>
          <dd className="mt-1 text-slate-600">
            {selectedMeta?.formation.duration || values.educationLevel?.toString() || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {a.summary.candidate}
          </dt>
          <dd className="mt-1 text-slate-600">
            {candidateName || "—"}
            {values.cin ? (
              <span className="mt-0.5 block font-mono text-xs text-slate-400">
                {String(values.cin)}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
    </aside>
  );

  if (submittedRef && selectedMeta) {
    return (
      <AdmissionSuccessView
        locale={locale}
        dict={dict}
        reference={submittedRef}
        candidateName={candidateName || "—"}
        formationTitle={selectedMeta.formation.title}
        categoryName={selectedMeta.categoryName}
        siteName={siteName}
        siteAddress={siteAddress ?? ""}
        sitePhone={sitePhone ?? ""}
        siteEmail={siteEmail ?? ""}
        onNewApplication={resetWizard}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <Anchor className="h-4 w-4 text-ocean-600" aria-hidden />
          CQPM Nador
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          {a.secureBadge}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          {a.portalTitle}
        </h2>
        {selectedMeta && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Anchor className="h-4 w-4 text-ocean-500" aria-hidden />
            <span>
              {a.currentSelection} :{" "}
              <strong className="text-navy-900">{selectedMeta.formation.title}</strong>
            </span>
          </p>
        )}
      </div>

      <AdmissionStepper steps={steps} currentStep={step} />

      <div className="min-h-[420px]">
        {step === 1 && (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                  {category.name}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.formations.map((formation) => {
                    const selected = selectedFormationId === formation.id;
                    return (
                      <button
                        key={formation.id}
                        type="button"
                        onClick={() => {
                          setValue("formationId", formation.id);
                          setDocuments({});
                        }}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition-all",
                          selected
                            ? "border-navy-900 bg-navy-900 text-white shadow-lg"
                            : "border-slate-200/80 bg-white hover:border-ocean-300 hover:shadow-md"
                        )}
                      >
                        <GraduationCap
                          className={cn(
                            "h-6 w-6",
                            selected ? "text-sky-300" : "text-ocean-600"
                          )}
                          aria-hidden
                        />
                        <p className="mt-3 font-bold leading-snug">{formation.title}</p>
                        {formation.duration && (
                          <p
                            className={cn(
                              "mt-2 text-xs",
                              selected ? "text-navy-200" : "text-slate-500"
                            )}
                          >
                            {formation.duration}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="bg-navy-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-300" aria-hidden />
                <h3 className="font-bold">{a.centre.title}</h3>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <h4 className="text-lg font-bold text-navy-900">{a.centre.name}</h4>
              <p className="text-sm leading-relaxed text-slate-600">{a.centre.description}</p>
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" aria-hidden />
                {a.centre.address}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="bg-navy-900 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-sky-300" aria-hidden />
                  <h3 className="font-bold">{a.conditions.title}</h3>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <ul className="space-y-3">
                  {requirementItems.map((item, index) => {
                    const icons = [GraduationCap, UserRound, Heart];
                    const Icon = icons[index] ?? Info;
                    return (
                      <li key={item} className="flex gap-3 text-sm text-slate-600">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" aria-hidden />
                        {item}
                      </li>
                    );
                  })}
                </ul>
                <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <input
                    type="checkbox"
                    checked={conditionsAccepted}
                    onChange={(e) => setConditionsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm leading-relaxed text-slate-700">
                    {a.conditions.confirmLabel}
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-navy-900">
                <UserRound className="h-5 w-5 text-ocean-600" aria-hidden />
                {a.conditions.personalTitle}
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {personalFields.map((field) => (
                  <div
                    key={field.id}
                    className={cn(field.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}
                  >
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-navy-900">{a.documents.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{a.documents.subtitle}</p>
              </div>
              {requiredDocs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                  {locale === "ar"
                    ? "لا توجد مرفقات مطلوبة."
                    : "Aucune pièce jointe requise pour cette formation."}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
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
                      onRemove={() =>
                        setDocuments((prev) => {
                          const next = { ...prev };
                          delete next[doc.documentKey];
                          return next;
                        })
                      }
                      variant="portal"
                      dragHint={a.documents.dragHint}
                      validatedLabel={a.documents.validated}
                    />
                  ))}
                </div>
              )}
            </div>
            <SummarySidebar className="hidden lg:block" />
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-navy-900">{a.steps.confirmation}</h3>
                <p className="mt-2 text-sm text-slate-500">{a.summary.confirmInfo}</p>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={confirmInfo}
                    onChange={(e) => setConfirmInfo(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">{a.summary.confirmInfo}</span>
                </label>
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={confirmData}
                    onChange={(e) => setConfirmData(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">{a.summary.confirmData}</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <SummarySidebar />
              <Button
                type="button"
                disabled={loading}
                onClick={onSubmit}
                className="w-full rounded-lg bg-[#E85D2A] py-6 text-base hover:bg-[#d4521f]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {dict.common.loading}
                  </>
                ) : (
                  <>
                    {a.validateApplication}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {step < 5 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            disabled={step === 1}
            className="rounded-lg border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {a.previous}
          </Button>
          <Button type="button" onClick={goNext} className="rounded-lg bg-navy-900 hover:bg-navy-800">
            {a.next}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="border-t border-slate-200/80 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            className="rounded-lg border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {a.previous}
          </Button>
        </div>
      )}
    </div>
  );
}
