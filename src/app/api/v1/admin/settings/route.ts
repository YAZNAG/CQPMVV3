import { siteSettingsSchema } from "@/lib/validations/settings";
import { createAdminRouteHandler } from "@/lib/api";
import { updateSiteSettings } from "@/actions/admin/settings.actions";

export const PUT = createAdminRouteHandler({
  name: "settings.update",
  methods: ["PUT"],
  resource: "settings",
  permission: "write",
  schema: siteSettingsSchema,
  handler: async (data) => updateSiteSettings(data),
});
