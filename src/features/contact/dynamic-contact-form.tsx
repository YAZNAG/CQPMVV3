"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/actions/contact.actions";
import type { ContactFormFieldRecord } from "@/services/contact-form.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

type FormValues = Record<string, string | boolean | string[]>;

interface DynamicContactFormProps {
  fields: ContactFormFieldRecord[];
  locale: Locale;
  labels: {
    success: string;
    error: string;
    loading: string;
    send: string;
  };
  variant?: "default" | "premium";
}

function getLocalizedField(
  field: ContactFormFieldRecord,
  locale: Locale,
  key: "label" | "placeholder" | "help"
) {
  const isAr = locale === "ar";
  if (key === "label") return isAr ? field.labelAr : field.labelFr;
  if (key === "placeholder") {
    const v = isAr ? field.placeholderAr : field.placeholderFr;
    return v ?? undefined;
  }
  const v = isAr ? field.helpTextAr : field.helpTextFr;
  return v ?? undefined;
}

function getOptionLabel(
  option: { labelFr: string; labelAr: string },
  locale: Locale
) {
  return locale === "ar" ? option.labelAr : option.labelFr;
}

export function DynamicContactForm({ fields, locale, labels, variant = "default" }: DynamicContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<FormValues>(() => {
    const init: FormValues = {};
    for (const field of fields) {
      if (field.type === "CHECKBOX") init[field.key] = field.defaultValue === "true";
      else if (field.type === "CHECKBOX_GROUP") init[field.key] = [];
      else init[field.key] = field.defaultValue ?? "";
    }
    return init;
  });

  const submitField = fields.find((f) => f.type === "SUBMIT_BUTTON");

  const setValue = (key: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckboxGroup = (key: string, optionValue: string, checked: boolean) => {
    setValues((prev) => {
      const current = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      return {
        ...prev,
        [key]: checked
          ? [...current, optionValue]
          : current.filter((v) => v !== optionValue),
      };
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await submitContactMessage({ formData: values });
    setLoading(false);
    if (result.success) {
      toast.success(labels.success);
      const reset: FormValues = {};
      for (const field of fields) {
        if (field.type === "CHECKBOX") reset[field.key] = false;
        else if (field.type === "CHECKBOX_GROUP") reset[field.key] = [];
        else reset[field.key] = "";
      }
      setValues(reset);
    } else {
      toast.error(result.error ?? labels.error);
    }
  }

  const renderField = (field: ContactFormFieldRecord) => {
    const label = getLocalizedField(field, locale, "label");
    const placeholder = getLocalizedField(field, locale, "placeholder");
    const help = getLocalizedField(field, locale, "help");
    const value = values[field.key];

    switch (field.type) {
      case "HEADING":
        return (
          <h3 className="text-lg font-bold text-navy-900" dir={locale === "ar" ? "rtl" : undefined}>
            {label}
          </h3>
        );
      case "PARAGRAPH":
        return (
          <p className="text-sm leading-relaxed text-slate-600" dir={locale === "ar" ? "rtl" : undefined}>
            {help ?? label}
          </p>
        );
      case "DIVIDER":
        return <hr className="border-slate-200" />;
      case "SUBMIT_BUTTON":
        return null;
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
              rows={5}
              className="border-slate-200 bg-white"
              dir={locale === "ar" ? "rtl" : undefined}
            />
            {help && <p className="text-xs text-slate-500">{help}</p>}
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
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              dir={locale === "ar" ? "rtl" : undefined}
            >
              <option value="">—</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getOptionLabel(opt, locale)}
                </option>
              ))}
            </select>
          </div>
        );
      case "RADIO":
        return (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-navy-900">
              {label}{field.isRequired && " *"}
            </legend>
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name={field.key}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => setValue(field.key, opt.value)}
                    required={field.isRequired}
                  />
                  {getOptionLabel(opt, locale)}
                </label>
              ))}
            </div>
          </fieldset>
        );
      case "CHECKBOX":
        return (
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setValue(field.key, e.target.checked)}
              required={field.isRequired}
              className="mt-1"
            />
            <span className="text-sm text-slate-700" dir={locale === "ar" ? "rtl" : undefined}>
              {label}{field.isRequired && " *"}
              {help && <span className="mt-1 block text-xs text-slate-500">{help}</span>}
            </span>
          </label>
        );
      case "CHECKBOX_GROUP":
        return (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-navy-900">
              {label}{field.isRequired && " *"}
            </legend>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) ? value.includes(opt.value) : false;
                return (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) =>
                        toggleCheckboxGroup(field.key, opt.value, e.target.checked)
                      }
                    />
                    {getOptionLabel(opt, locale)}
                  </label>
                );
              })}
            </div>
          </fieldset>
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
              className="border-slate-200 bg-white"
              dir={locale === "ar" ? "rtl" : undefined}
            />
            {help && <p className="text-xs text-slate-500">{help}</p>}
          </div>
        );
      }
    }
  };

  const buttonLabel = submitField
    ? getLocalizedField(submitField, locale, "label")
    : labels.send;
  const buttonVariant =
    submitField?.buttonStyle === "outline"
      ? "outline"
      : submitField?.buttonStyle === "navy"
        ? "default"
        : "ocean";

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className={cn(
        "space-y-5",
        variant === "premium"
          ? "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
          : "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8"
      )}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          if (field.type === "SUBMIT_BUTTON") return null;
          const span = field.width === "half" ? "sm:col-span-1" : "sm:col-span-2";
          return (
            <div key={field.id} className={cn(span)}>
              {renderField(field)}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        variant={variant === "premium" ? "default" : buttonVariant}
        size="lg"
        disabled={loading}
        className={cn(
          "w-full sm:w-auto",
          variant === "premium" && "rounded-lg bg-navy-900 px-8 hover:bg-navy-800"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {labels.loading}
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
