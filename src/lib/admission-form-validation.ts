import { z } from "zod";
import type { AdmissionFieldType } from "@/lib/validations/admission-form";
import type { FormationDocumentRequirementRecord } from "@/services/admission-form.service";

export type AdmissionFormFieldConfig = {
  key: string;
  type: AdmissionFieldType;
  labelFr: string;
  isRequired: boolean;
  options?: { value: string; labelFr: string; labelAr: string }[] | null;
};

const DISPLAY_ONLY = new Set<AdmissionFieldType>([
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SUBMIT_BUTTON",
]);

function fieldSchema(field: AdmissionFormFieldConfig): z.ZodTypeAny {
  const req = field.isRequired;
  const label = field.labelFr;

  switch (field.type) {
    case "EMAIL": {
      const base = z.string().email(`${label} : email invalide`);
      return req ? base.min(1, `${label} est requis`) : base.optional().or(z.literal(""));
    }
    case "FORMATION_SELECT":
      return req
        ? z.string().min(1, "Choisissez une formation")
        : z.string().optional().or(z.literal(""));
    case "GENDER_SELECT":
      return req
        ? z.enum(["M", "F", "Autre"], { message: `${label} est requis` })
        : z.enum(["M", "F", "Autre"]).optional();
    case "DATE":
      return req
        ? z.string().min(1, `${label} est requis`)
        : z.string().optional().or(z.literal(""));
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
        ? z.string().min(2, `${label} est requis`).max(5000)
        : z.string().max(5000).optional().or(z.literal(""));
    case "TEL":
    case "NUMBER":
    case "TEXT":
    default:
      return req
        ? z.string().min(1, `${label} est requis`).max(2000)
        : z.string().max(2000).optional().or(z.literal(""));
  }
}

export function buildDynamicAdmissionSchema(fields: AdmissionFormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (DISPLAY_ONLY.has(field.type)) continue;
    shape[field.key] = fieldSchema(field);
  }
  return z.object({
    formationId: z.string().cuid(),
    formData: z.object(shape),
    documents: z.array(
      z.object({
        documentKey: z.string().min(1),
        fileUrl: z.union([z.string().url(), z.string().regex(/^\//)]),
      })
    ),
  });
}

export function extractApplicationSummary(
  fields: AdmissionFormFieldConfig[],
  formData: Record<string, unknown>,
  formationId: string
) {
  const get = (key: string) => {
    const v = formData[key];
    if (v == null) return "";
    return String(v).trim();
  };

  const findKey = (keys: string[]) => keys.find((k) => fields.some((f) => f.key === k));

  const lastName = get(findKey(["lastName", "last_name", "nom"]) ?? "lastName");
  const firstName = get(findKey(["firstName", "first_name", "prenom"]) ?? "firstName");
  const cin = get(findKey(["cin"]) ?? "cin");
  const birthDateRaw = get(findKey(["birthDate", "birth_date"]) ?? "birthDate");
  const genderRaw = get(findKey(["gender", "sexe"]) ?? "gender") || "M";
  const address = get(findKey(["address", "adresse"]) ?? "address");
  const city = get(findKey(["city", "ville"]) ?? "city");
  const phone = get(findKey(["phone", "telephone"]) ?? "phone");
  const email = get(findKey(["email"]) ?? "email");
  const educationLevel = get(findKey(["educationLevel", "education_level"]) ?? "educationLevel");

  const birthDate = birthDateRaw ? new Date(birthDateRaw) : new Date();
  const gender = genderRaw === "Autre" ? ("OTHER" as const) : (genderRaw as "M" | "F");

  return {
    lastName: lastName || "Candidat",
    firstName: firstName || "Anonyme",
    cin: cin || "00000000",
    birthDate,
    gender,
    address: address || "—",
    city: city || "—",
    phone: phone || "0000000000",
    email: email || "sans-email@local",
    educationLevel: educationLevel || "—",
    formationId,
  };
}

export function validateFormationDocuments(
  requirements: FormationDocumentRequirementRecord[],
  documents: { documentKey: string; fileUrl: string }[]
) {
  const uploaded = new Set(documents.map((d) => d.documentKey));
  const missing = requirements
    .filter((r) => r.isRequired && !uploaded.has(r.documentKey))
    .map((r) => r.labelFr);
  if (missing.length > 0) {
    return `Documents manquants : ${missing.join(", ")}`;
  }
  return null;
}

export function documentKeyToLegacyType(key: string): "CIN" | "DIPLOMA" | "PHOTO" | "OTHER" {
  if (key === "cin") return "CIN";
  if (key === "diploma") return "DIPLOMA";
  if (key === "photo") return "PHOTO";
  return "OTHER";
}
