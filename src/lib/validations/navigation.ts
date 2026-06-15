import { z } from "zod";

export const navigationLocationSchema = z.enum(["HEADER", "FOOTER", "BOTH"]);

export const navigationItemTypeSchema = z.enum(["LINK", "BUTTON"]);

const navigationItemBaseSchema = z.object({
  labelFr: z.string().min(1, "Label FR requis").max(120),
  labelAr: z.string().min(1, "Label AR requis").max(120),
  href: z
    .string()
    .min(1, "Chemin requis")
    .max(512)
    .regex(/^\//, "Le chemin doit commencer par / (ex: /#about)")
    .refine(
      (href) => !/\s/.test(href),
      "Le chemin ne doit pas contenir d'espaces. Pour À propos, utilisez /#about"
    ),
  location: navigationLocationSchema.default("HEADER"),
  itemType: navigationItemTypeSchema.default("LINK"),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
  exactMatch: z.boolean(),
  openInNewTab: z.boolean(),
  parentId: z.string().cuid().nullable().optional(),
});

function refineNavigationItem<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (data.itemType === "BUTTON") {
      if (data.location !== "HEADER") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Les boutons CTA sont affichés uniquement dans l'en-tête",
          path: ["location"],
        });
      }
      if (data.parentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Un bouton CTA ne peut pas avoir de menu parent",
          path: ["parentId"],
        });
      }
    }
  });
}

export const navigationItemSchema = refineNavigationItem(navigationItemBaseSchema);

export const navigationItemUpdateSchema = refineNavigationItem(
  navigationItemBaseSchema.extend({
    id: z.string().cuid(),
  })
);

export type NavigationItemInput = z.infer<typeof navigationItemSchema>;
export type NavigationItemUpdateInput = z.infer<typeof navigationItemUpdateSchema>;
