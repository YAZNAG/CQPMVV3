import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide");

const optionalImageUrl = z
  .union([
    z.string().url(),
    z.string().regex(/^\//, "Chemin local (ex: /images/formation.jpg)"),
    z.literal(""),
  ])
  .nullable()
  .optional();

export const formationCategorySchema = z.object({
  nameFr: z.string().min(2).max(255),
  nameAr: z.string().min(2).max(255),
  slug: slugSchema.optional(),
  descriptionFr: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

const textField = (label: string) =>
  z.string().min(3, `${label} : au moins 3 caractères`).max(10000);

export const formationSchema = z.object({
  categoryId: z.string().cuid(),
  titleFr: z.string().min(2, "Titre (FR) : au moins 2 caractères").max(255),
  titleAr: z.string().min(2, "Titre (AR) : au moins 2 caractères").max(255),
  slug: slugSchema.optional(),
  descriptionFr: textField("Description (FR)"),
  descriptionAr: textField("Description (AR)"),
  objectivesFr: textField("Objectifs (FR)"),
  objectivesAr: textField("Objectifs (AR)"),
  durationFr: z.string().min(2, "Durée (FR) requise").max(120),
  durationAr: z.string().min(2, "Durée (AR) requise").max(120),
  requirementsFr: textField("Conditions d'admission (FR)"),
  requirementsAr: textField("Conditions d'admission (AR)"),
  imageUrl: optionalImageUrl,
  order: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const idSchema = z.object({ id: z.string().cuid() });

export type FormationCategoryInput = z.infer<typeof formationCategorySchema>;
export type FormationInput = z.infer<typeof formationSchema>;
