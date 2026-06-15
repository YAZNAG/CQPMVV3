import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";

export const metadata = {
  title: "Accès refusé — Administration CQPM",
  robots: { index: false, follow: false },
};

export default async function UnauthorizedPage() {
  const session = await requireAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-16 w-16 text-amber-500" aria-hidden />
      <h1 className="mt-6 text-2xl font-bold text-navy-900">Accès refusé</h1>
      <p className="mt-3 max-w-md text-navy-600">
        Votre rôle ({session.user.role}) ne permet pas d&apos;accéder à cette
        section. Contactez un super administrateur si vous pensez qu&apos;il
        s&apos;agit d&apos;une erreur.
      </p>
      <Button variant="ocean" className="mt-8" asChild>
        <Link href="/admin">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}
