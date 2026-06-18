import { redirect } from "next/navigation";

export default async function AdminAdmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Consolidated under /admin/inscriptions
  redirect("/admin/inscriptions");
}
