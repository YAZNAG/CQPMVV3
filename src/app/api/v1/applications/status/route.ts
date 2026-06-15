import { applicationStatusSchema } from "@/lib/validations/application";
import { RATE_LIMITS, createPublicRouteHandler } from "@/lib/api";
import { checkApplicationStatusHandler } from "@/lib/api/handlers/status.handler";
import type { ApplicationStatusInput } from "@/lib/validations/application";
import type { Locale } from "@/types";

export const POST = createPublicRouteHandler({
  name: "applications.status",
  method: "POST",
  rateLimit: RATE_LIMITS.status,
  schema: applicationStatusSchema,
  handler: async (data) => {
    const parsed = data as ApplicationStatusInput;
    return checkApplicationStatusHandler(
      { cin: parsed.cin },
      (parsed.locale ?? "fr") as Locale
    );
  },
});
