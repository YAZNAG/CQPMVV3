import { contactSchema } from "@/lib/validations/contact";
import { RATE_LIMITS, createPublicRouteHandler } from "@/lib/api";
import { submitContactHandler } from "@/lib/api/handlers/contact.handler";
import type { ContactInput } from "@/lib/validations/contact";

export const POST = createPublicRouteHandler({
  name: "contact.submit",
  method: "POST",
  rateLimit: RATE_LIMITS.contact,
  schema: contactSchema,
  handler: async (data) => submitContactHandler(data as ContactInput),
});
