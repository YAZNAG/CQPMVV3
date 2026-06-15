import { newsArticleSchema } from "@/lib/validations/news";
import { createAdminRouteHandler } from "@/lib/api";
import { createNewsArticle } from "@/actions/admin/news.actions";

export const POST = createAdminRouteHandler({
  name: "news.create",
  methods: ["POST"],
  resource: "news",
  permission: "write",
  schema: newsArticleSchema,
  handler: async (data) => createNewsArticle(data),
});
