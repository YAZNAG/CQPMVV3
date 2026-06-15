import { z } from "zod";
import type { ContactFieldType } from "@/lib/validations/contact-form";

export type ContactFormFieldConfig = {
  key: string;
  type: ContactFieldType;
  labelFr: string;
  isRequired: boolean;
  options?: { value: string; labelFr: string; labelAr: string }[] | null;
};

const DISPLAY_ONLY = new Set<ContactFieldType>([
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SUBMIT_BUTTON",
]);

function fieldSchema(field: ContactFormFieldConfig): z.ZodTypeAny {
  const req = field.isRequired;
  const label = field.labelFr;

  switch (field.type) {
    case "EMAIL": {
      const base = z.string().email(`${label} : email invalide`);
      return req ? base.min(1, `${label} est requis`) : base.optional().or(z.literal(""));
    }
    case "NUMBER": {
      const base = z.coerce.number();
      return req
        ? base.refine((v) => !Number.isNaN(v), `${label} est requis`)
        : z.union([base, z.literal(""), z.undefined()]).optional();
    }
    case "CHECKBOX":
      return req
        ? z.literal(true, { errorMap: () => ({ message: `${label} est requis` }) })
        : z.boolean().optional();
    case "CHECKBOX_GROUP": {
      const base = z.array(z.string()).min(req ? 1 : 0, `${label} est requis`);
      return req ? base : z.array(z.string()).optional();
    }
    case "SELECT":
    case "RADIO": {
      const values = field.options?.map((o) => o.value) ?? [];
      const base =
        values.length > 0
          ? z.enum(values as [string, ...string[]], {
              errorMap: () => ({ message: `${label} : choix invalide` }),
            })
          : z.string();
      return req ? base : base.optional().or(z.literal(""));
    }
    case "TEXTAREA":
      return req
        ? z.string().min(10, `${label} : au moins 10 caractères`).max(5000)
        : z.string().max(5000).optional().or(z.literal(""));
    case "DATE":
    case "TEL":
    case "TEXT":
    default:
      return req
        ? z.string().min(1, `${label} est requis`).max(2000)
        : z.string().max(2000).optional().or(z.literal(""));
  }
}

export function buildDynamicContactSchema(fields: ContactFormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (DISPLAY_ONLY.has(field.type)) continue;
    shape[field.key] = fieldSchema(field);
  }
  return z.object({ formData: z.object(shape) });
}

export function extractContactSummary(
  fields: ContactFormFieldConfig[],
  formData: Record<string, unknown>
) {
  const get = (key: string) => {
    const v = formData[key];
    if (v == null) return "";
    if (Array.isArray(v)) return v.join(", ");
    return String(v).trim();
  };

  const byKey = (k: string) => get(k);
  const byType = (t: ContactFieldType) =>
    fields.find((f) => f.type === t)?.key;

  const emailKey = fields.find((f) => f.type === "EMAIL")?.key ?? "email";
  const nameKey =
    fields.find((f) => f.key === "name" || f.key === "full_name")?.key ??
    fields.find((f) => f.type === "TEXT")?.key;
  const subjectKey =
    fields.find((f) => f.key === "subject" || f.key === "sujet")?.key ??
    fields.filter((f) => f.type === "TEXT")[1]?.key;
  const messageKey =
    fields.find((f) => f.type === "TEXTAREA")?.key ??
    fields.find((f) => f.key === "message")?.key;
  const phoneKey = byType("TEL") ?? "phone";

  const email = byKey(emailKey) || "sans-email@local";
  const name = (nameKey ? byKey(nameKey) : "") || "Visiteur";
  const subject = (subjectKey ? byKey(subjectKey) : "") || "Message contact";
  const message =
    (messageKey ? byKey(messageKey) : "") ||
    fields
      .filter((f) => !DISPLAY_ONLY.has(f.type) && f.key !== emailKey)
      .map((f) => `${f.labelFr}: ${get(f.key)}`)
      .filter((line) => !line.endsWith(": "))
      .join("\n");
  const phone = byKey(phoneKey) || null;

  return { name, email, phone: phone || null, subject, message };
}
