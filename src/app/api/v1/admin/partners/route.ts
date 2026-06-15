import { partnerSchema } from "@/lib/validations/partner";
import { createAdminRouteHandler } from "@/lib/api";
import { createPartner } from "@/actions/admin/partners.actions";

export const POST = createAdminRouteHandler({
  name: "partners.create",
  methods: ["POST"],
  resource: "formations",
  permission: "write",
  schema: partnerSchema,
  handler: async (data) => createPartner(data),
});
