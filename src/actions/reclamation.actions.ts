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
import {
  sendEmail,
  buildReclamationAdminEmail,
  buildReclamationAckEmail,
} from "@/lib/email/mailer";

export async function submitReclamationAction(
  input: unknown
): Promise<ActionResult<{ reference: string }>> {
  return runPublicAction({
    name: "submitReclamation",
    rateLimit: RATE_LIMITS.contact,
    schema: reclamationSubmitSchema,
    input,
    handler: async (_ctx, data) => {
      const rec = await createReclamation(data);

      const reclamationEmail = process.env.RECLAMATION_EMAIL ?? "reclamations@cqpm-nador.ma";
      const adminTpl = buildReclamationAdminEmail({
        reference: rec.reference,
        name: rec.name,
        email: rec.email,
        subject: rec.subject,
        description: rec.description,
        type: rec.type,
        reclamationId: rec.id,
      });
      sendEmail({ ...adminTpl, to: reclamationEmail, type: "RECLAMATION_ADMIN", reclamationId: rec.id }).catch(() => {});

      const ackTpl = buildReclamationAckEmail({ reference: rec.reference, name: rec.name, subject: rec.subject });
      sendEmail({ ...ackTpl, to: rec.email, type: "RECLAMATION_ACK", reclamationId: rec.id }).catch(() => {});

      return { success: true, data: { reference: rec.reference } };
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
