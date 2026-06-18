import { redirect } from "next/navigation";

export default function AdminAdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Consolidated under /admin/inscriptions
  redirect("/admin/inscriptions");
}
