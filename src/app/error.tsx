"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-ocean-600">
        Erreur
      </p>
      <h1 className="mt-2 text-2xl font-bold text-navy-900">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-md text-sm text-navy-600">
        Veuillez réessayer. Si le problème persiste, redémarrez le serveur de
        développement.
      </p>
      <Button variant="ocean" className="mt-8" onClick={() => reset()}>
        Réessayer
      </Button>
    </div>
  );
}
