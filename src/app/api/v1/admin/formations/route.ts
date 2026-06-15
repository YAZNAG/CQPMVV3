import { formationSchema } from "@/lib/validations/formation";
import { createAdminRouteHandler } from "@/lib/api";
import { createFormation } from "@/actions/admin/formations.actions";

export const POST = createAdminRouteHandler({
  name: "formations.create",
  methods: ["POST"],
  resource: "formations",
  permission: "write",
  schema: formationSchema,
  handler: async (data) => createFormation(data),
});
