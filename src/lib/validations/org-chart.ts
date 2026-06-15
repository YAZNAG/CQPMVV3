import { z } from "zod";

export const orgChartNodeSchema = z.object({
  titleFr: z.string().min(1).max(255),
  titleAr: z.string().min(1).max(255),
  parentId: z.string().cuid().nullable().optional(),
  style: z.enum([
    "LEADERSHIP",
    "DEPARTMENT_WHITE",
    "DEPARTMENT_BLUE",
    "DEPARTMENT_ORANGE",
    "UNIT",
  ]),
  accent: z.enum(["NONE", "PINK", "GREEN", "PURPLE", "YELLOW", "TEAL", "SKY"]),
  icon: z.enum([
    "USER",
    "USERS",
    "WRENCH",
    "BUILDING",
    "SHIP",
    "GRADUATION_CAP",
    "SHIELD",
    "BOOK",
    "BOX",
    "NONE",
  ]),
  order: z.coerce.number().int().min(0),
  isPublished: z.boolean(),
});

export const orgChartNodeUpdateSchema = orgChartNodeSchema.extend({
  id: z.string().cuid(),
});

export const orgChartPageSchema = z.object({
  orgChartPageTitleFr: z.string().min(1).max(255),
  orgChartPageTitleAr: z.string().min(1).max(255),
  orgChartPageSubtitleFr: z.string().min(1).max(500),
  orgChartPageSubtitleAr: z.string().min(1).max(500),
  orgChartBackgroundUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\//, "Chemin local (ex: /uploads/...)"),
      z.literal(""),
    ])
    .nullable()
    .optional(),
  orgChartPublished: z.boolean(),
});

export type OrgChartNodeInput = z.infer<typeof orgChartNodeSchema>;
export type OrgChartNodeUpdateInput = z.infer<typeof orgChartNodeUpdateSchema>;
export type OrgChartPageInput = z.infer<typeof orgChartPageSchema>;
