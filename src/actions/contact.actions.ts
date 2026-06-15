"use server";

import { RATE_LIMITS, runPublicAction } from "@/lib/api";
import { submitDynamicContactHandler } from "@/lib/api/handlers/contact.handler";
import { dynamicContactSubmitSchema } from "@/lib/validations/contact-form";
import type { ActionResult } from "@/types";

export async function submitContactMessage(
  input: unknown
): Promise<ActionResult> {
  return runPublicAction({
    name: "submitContactMessage",
    rateLimit: RATE_LIMITS.contact,
    schema: dynamicContactSubmitSchema,
    input,
    handler: async (_ctx, data) => submitDynamicContactHandler(data),
  });
}
