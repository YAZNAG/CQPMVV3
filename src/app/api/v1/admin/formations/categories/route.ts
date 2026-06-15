import { formationCategorySchema } from "@/lib/validations/formation";
import { createAdminRouteHandler } from "@/lib/api";
import { createFormationCategory } from "@/actions/admin/formations.actions";

export const POST = createAdminRouteHandler({
  name: "formations.categories.create",
  methods: ["POST"],
  resource: "formations",
  permission: "write",
  schema: formationCategorySchema,
  handler: async (data) => createFormationCategory(data),
});
