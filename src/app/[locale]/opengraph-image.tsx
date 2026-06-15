import { ImageResponse } from "next/og";
import { isValidLocale } from "@/lib/i18n/config";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/config";
import type { Locale } from "@/types";

export const runtime = "edge";
export const alt = "CQPM Nador";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: l } = await params;
  const locale = (isValidLocale(l) ? l : "fr") as Locale;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: locale === "ar" ? "flex-end" : "flex-start",
          padding: 80,
          background: "linear-gradient(160deg, #0c2340 0%, #155e75 100%)",
          color: "#fff",
          textAlign: locale === "ar" ? "right" : "left",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700 }}>{SITE_NAME[locale]}</div>
        <div style={{ fontSize: 28, marginTop: 24, opacity: 0.9, maxWidth: 900 }}>
          {SITE_TAGLINE[locale]}
        </div>
      </div>
    ),
    { ...size }
  );
}
