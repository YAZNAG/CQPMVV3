import { redirect } from "next/navigation";

export default function AdminGalleryNewPage() {
  redirect("/admin/gallery?tab=photos");
}
