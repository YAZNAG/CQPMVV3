import { updateUserAccessSchema } from "@/lib/validations/user";
import { createAdminRouteHandler } from "@/lib/api";
import { updateUserAccess } from "@/actions/admin/users.actions";

export const PATCH = createAdminRouteHandler({
  name: "users.update",
  methods: ["PATCH"],
  resource: "users",
  permission: "write",
  schema: updateUserAccessSchema,
  handler: async (data) => updateUserAccess(data),
});
