import { z } from "zod";

export const ADMISSION_FIELD_TYPES = [
  "TEXT",
  "EMAIL",
  "TEL",
  "NUMBER",
  "TEXTAREA",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "CHECKBOX_GROUP",
  "GENDER_SELECT",
  "FORMATION_SELECT",
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SUBMIT_BUTTON",
] as const;

export type AdmissionFieldType = (typeof ADMISSION_FIELD_TYPES)[number];

const fieldOptionSchema = z.object({
  value: z.string().min(1).max(120),
  labelFr: z.string().min(1).max(255),
  labelAr: z.string().min(1).max(255),
});

export const admissionFormFieldSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/, "Clé invalide"),
  type: z.enum(ADMISSION_FIELD_TYPES),
  labelFr: z.string().min(1).max(255),
  labelAr: z.string().min(1).max(255),
  placeholderFr: z.string().max(255).nullable().optional(),
  placeholderAr: z.string().max(255).nullable().optional(),
  helpTextFr: z.string().max(500).nullable().optional(),
  helpTextAr: z.string().max(500).nullable().optional(),
  options: z.array(fieldOptionSchema).nullable().optional(),
  defaultValue: z.string().max(500).nullable().optional(),
  isRequired: z.boolean().default(false),
  width: z.enum(["full", "half"]).default("full"),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  buttonStyle: z.enum(["ocean", "outline", "navy"]).nullable().optional(),
});

export const admissionFormFieldUpdateSchema = admissionFormFieldSchema.extend({
  id: z.string().cuid(),
});

export const formationDocumentRequirementSchema = z.object({
  formationId: z.string().cuid(),
  documentKey: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/, "Clé invalide"),
  labelFr: z.string().min(1).max(255),
  labelAr: z.string().min(1).max(255),
  hintFr: z.string().max(500).nullable().optional(),
  hintAr: z.string().max(500).nullable().optional(),
  acceptTypes: z.enum(["pdf", "image", "pdf_image"]).default("pdf"),
  maxSizeMb: z.coerce.number().int().min(1).max(16).default(8),
  order: z.coerce.number().int().min(0).default(0),
  isRequired: z.boolean().default(true),
});

export const formationDocumentRequirementUpdateSchema =
  formationDocumentRequirementSchema.extend({
    id: z.string().cuid(),
  });

const fileUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\//, "Chemin local"),
]);

export const dynamicApplicationSubmitSchema = z.object({
  formationId: z.string().cuid(),
  formData: z.record(z.string(), z.unknown()),
  documents: z.array(
    z.object({
      documentKey: z.string().min(1).max(80),
      fileUrl: fileUrlSchema,
    })
  ),
});

export type AdmissionFormFieldInput = z.infer<typeof admissionFormFieldSchema>;
export type FormationDocumentRequirementInput = z.infer<
  typeof formationDocumentRequirementSchema
>;
