import { z } from "zod";

export const CONTACT_FIELD_TYPES = [
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
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SUBMIT_BUTTON",
] as const;

export type ContactFieldType = (typeof CONTACT_FIELD_TYPES)[number];

export const contactFieldOptionSchema = z.object({
  value: z.string().min(1).max(120),
  labelFr: z.string().min(1).max(255),
  labelAr: z.string().min(1).max(255),
});

export const contactFormFieldSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/, "Clé invalide (a-z, 0-9, _)"),
  type: z.enum(CONTACT_FIELD_TYPES),
  labelFr: z.string().min(1).max(255),
  labelAr: z.string().min(1).max(255),
  placeholderFr: z.string().max(255).nullable().optional(),
  placeholderAr: z.string().max(255).nullable().optional(),
  helpTextFr: z.string().max(500).nullable().optional(),
  helpTextAr: z.string().max(500).nullable().optional(),
  options: z.array(contactFieldOptionSchema).nullable().optional(),
  defaultValue: z.string().max(500).nullable().optional(),
  isRequired: z.boolean().default(false),
  width: z.enum(["full", "half"]).default("full"),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  buttonStyle: z.enum(["ocean", "outline", "navy"]).nullable().optional(),
});

export const contactFormFieldUpdateSchema = contactFormFieldSchema.extend({
  id: z.string().cuid(),
});

export const contactPageSettingsSchema = z.object({
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  addressFr: z.string().max(500).nullable().optional(),
  addressAr: z.string().max(500).nullable().optional(),
  contactHoursFr: z.string().max(255).nullable().optional(),
  contactHoursAr: z.string().max(255).nullable().optional(),
  contactIntroFr: z.string().max(500).nullable().optional(),
  contactIntroAr: z.string().max(500).nullable().optional(),
  contactMapUrl: z
    .union([z.string().url(), z.literal("")])
    .nullable()
    .optional(),
});

export const dynamicContactSubmitSchema = z.object({
  formData: z.record(z.string(), z.unknown()),
});

export type ContactFormFieldInput = z.infer<typeof contactFormFieldSchema>;
export type ContactPageSettingsInput = z.infer<typeof contactPageSettingsSchema>;
