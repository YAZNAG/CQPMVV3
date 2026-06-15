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

  await prisma.contactMessage.create({
    data: {
      ...summary,
      formData: formData as Prisma.InputJsonValue,
    },
  });

  if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const body = Object.entries(formData)
        .map(([key, value]) => {
          const field = fields.find((f) => f.key === key);
          const label = field?.labelFr ?? key;
          const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
          return `${label}: ${text}`;
        })
        .join("\n");

      await resend.emails.send({
        from: process.env.FROM_EMAIL ?? "noreply@cqpm-nador.ma",
        to: process.env.CONTACT_EMAIL,
        subject: `[CQPM] ${summary.subject}`,
        text: `De: ${summary.name} <${summary.email}>\n\n${body}`,
      });
    } catch (error) {
      log.error("email_failed", { error: String(error) });
    }
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
