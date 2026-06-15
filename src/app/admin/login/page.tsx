import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth-instance";
import { AdminLoginForm } from "@/components/admin/login-form";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";

export const metadata = {
  title: "Connexion — Administration CQPM",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(ADMIN_HOME_PATH);
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy-900 text-white">
          Chargement...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
