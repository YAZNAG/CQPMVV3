"use server";

import { RATE_LIMITS, runPublicAction } from "@/lib/api";
import { submitDynamicApplicationHandler } from "@/lib/api/handlers/application.handler";
import { checkApplicationStatusHandler } from "@/lib/api/handlers/status.handler";
import { applicationStatusSchema } from "@/lib/validations/application";
import { dynamicApplicationSubmitSchema } from "@/lib/validations/admission-form";
import type { ActionResult, Locale } from "@/types";

export async function submitApplication(
  input: unknown
): Promise<ActionResult<{ referenceNumber: string }>> {
  return runPublicAction({
    name: "submitApplication",
    rateLimit: RATE_LIMITS.application,
    schema: dynamicApplicationSubmitSchema,
    input,
    handler: async (_ctx, data) => submitDynamicApplicationHandler(data),
  });
}

export async function checkApplicationStatus(
  cin: string,
  locale: Locale = "fr"
): Promise<
  ActionResult<
    {
      status: string;
      referenceNumber: string;
      updatedAt: Date;
      createdAt: Date;
      formationTitle: string;
      statusNote: string | null;
    }[]
  >
> {
  return runPublicAction({
    name: "checkApplicationStatus",
    rateLimit: RATE_LIMITS.application,
    schema: applicationStatusSchema,
    input: { cin, locale },
    handler: async (_ctx, data) =>
      checkApplicationStatusHandler(data as { cin: string; locale?: Locale }, locale),
  });
}
