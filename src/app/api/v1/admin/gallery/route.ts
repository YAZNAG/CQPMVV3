import { galleryAlbumSchema } from "@/lib/validations/gallery";
import { createAdminRouteHandler } from "@/lib/api";
import { createGalleryAlbum } from "@/actions/admin/gallery.actions";

export const POST = createAdminRouteHandler({
  name: "gallery.create",
  methods: ["POST"],
  resource: "gallery",
  permission: "write",
  schema: galleryAlbumSchema,
  handler: async (data) => createGalleryAlbum(data),
});
