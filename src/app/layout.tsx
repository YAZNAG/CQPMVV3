import type { Metadata } from "next";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/services/site-settings.service";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    return buildRootMetadata(settings);
  } catch {
    return buildRootMetadata();
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
