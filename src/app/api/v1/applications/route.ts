import { dynamicApplicationSubmitSchema } from "@/lib/validations/admission-form";
import { RATE_LIMITS, createPublicRouteHandler } from "@/lib/api";
import { submitDynamicApplicationHandler } from "@/lib/api/handlers/application.handler";

export const POST = createPublicRouteHandler({
  name: "applications.submit",
  method: "POST",
  rateLimit: RATE_LIMITS.application,
  schema: dynamicApplicationSubmitSchema,
  handler: async (data) => submitDynamicApplicationHandler(data),
});
