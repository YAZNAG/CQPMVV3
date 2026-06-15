"use server";

import { RATE_LIMITS, runPublicAction } from "@/lib/api";
import {
  reclamationSubmitSchema,
  reclamationTrackSchema,
} from "@/lib/validations/reclamation";
import {
  createReclamation,
  reclamationStatusLabel,
  trackReclamation,
} from "@/services/reclamation.service";
import type { ActionResult } from "@/types";
import type { Locale } from "@/types";

export async function submitReclamationAction(
  input: unknown
): Promise<ActionResult<{ reference: string }>> {
  return runPublicAction({
    name: "submitReclamation",
    rateLimit: RATE_LIMITS.contact,
    schema: reclamationSubmitSchema,
    input,
    handler: async (_ctx, data) => {
      const reclamation = await createReclamation(data);
      return { success: true, data: { reference: reclamation.reference } };
    },
  });
}

export async function trackReclamationAction(
  input: unknown,
  locale: Locale = "fr"
): Promise<
  ActionResult<{
    reference: string;
    subject: string;
    status: string;
    statusKey: string;
    createdAt: Date;
    updatedAt: Date;
    responseNote: string | null;
  }>
> {
  return runPublicAction({
    name: "trackReclamation",
    rateLimit: RATE_LIMITS.status,
    schema: reclamationTrackSchema,
    input,
    handler: async (_ctx, data) => {
      const row = await trackReclamation(data.reference, data.email);
      if (!row) {
        return {
          success: false,
          error:
            locale === "ar"
              ? "لم يتم العثور على شكاية بهذا الرقم والبريد."
              : "Aucune réclamation trouvée pour ce dossier et cet email.",
        };
      }

      return {
        success: true,
        data: {
          reference: row.reference,
          subject: row.subject,
          statusKey: row.status,
          status: reclamationStatusLabel(row.status, locale),
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          responseNote: row.responseNote,
        },
      };
    },
  });
}
