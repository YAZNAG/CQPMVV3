import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildDynamicContactSchema,
  extractContactSummary,
  type ContactFormFieldConfig,
} from "@/lib/contact-form-validation";
import { getPublishedContactFormFields } from "@/services/contact-form.service";
import { createLogger } from "@/lib/api/logger";
import type { ActionResult } from "@/types";
import {
  sendEmail,
  buildContactAdminEmail,
  buildContactAckEmail,
} from "@/lib/email/mailer";

const log = createLogger("handler:contact");

export async function submitDynamicContactHandler(
  raw: unknown
): Promise<ActionResult> {
  const fields = await getPublishedContactFormFields();
  const inputFields: ContactFormFieldConfig[] = fields.map((f) => ({
    key: f.key,
    type: f.type,
    labelFr: f.labelFr,
    isRequired: f.isRequired,
    options: f.options,
  }));

  const schema = buildDynamicContactSchema(inputFields);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? "Données invalides",
    };
  }

  const formData = parsed.data.formData as Record<string, unknown>;
  const summary = extractContactSummary(inputFields, formData);

  const message = await prisma.contactMessage.create({
    data: {
      ...summary,
      formData: formData as Prisma.InputJsonValue,
    },
  });

  // Build field list for email
  const emailFields = fields
    .filter((f) => f.type !== "HEADING" && f.type !== "DIVIDER" && f.type !== "SUBMIT_BUTTON")
    .map((f) => ({
      label: f.labelFr,
      value: Array.isArray(formData[f.key])
        ? (formData[f.key] as string[]).join(", ")
        : String(formData[f.key] ?? ""),
    }));

  // Notify admin
  const contactEmail = process.env.CONTACT_EMAIL ?? "contact@cqpm-nador.ma";
  const adminTpl = buildContactAdminEmail({
    name: summary.name,
    email: summary.email,
    subject: summary.subject,
    fields: emailFields,
    messageId: message.id,
  });
  sendEmail({ ...adminTpl, to: contactEmail, type: "CONTACT_ADMIN", contactMessageId: message.id }).catch(() => {});

  // Send ack to visitor if email provided
  if (summary.email) {
    const ackTpl = buildContactAckEmail({ name: summary.name, subject: summary.subject });
    sendEmail({ ...ackTpl, to: summary.email, type: "CONTACT_ACK", contactMessageId: message.id }).catch(() => {});
  }

  return { success: true };
}

/** @deprecated Legacy fixed schema — kept for API route compatibility */
export async function submitContactHandler(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<ActionResult> {
  return submitDynamicContactHandler({
    formData: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      subject: data.subject,
      message: data.message,
    },
  });
}
