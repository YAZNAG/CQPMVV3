"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="fr">
      <body className="bg-navy-50 font-sans text-navy-900 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold">Erreur critique</h1>
          <p className="mt-3 max-w-md text-sm text-navy-600">
            L&apos;application a rencontré un problème. Rechargez la page ou
            redémarrez le serveur.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-lg bg-ocean-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-ocean-600"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
