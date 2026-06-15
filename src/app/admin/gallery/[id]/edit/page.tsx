import { redirect } from "next/navigation";

export default function AdminGalleryEditPage() {
  redirect("/admin/gallery?tab=photos");
}
