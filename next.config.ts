import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "media-cdn.tripadvisor.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },
  async redirects() {
    return [
      { source: "/fr/admission", destination: "/fr/inscription", permanent: true },
      { source: "/ar/admission", destination: "/ar/inscription", permanent: true },
      { source: "/admission", destination: "/fr/inscription", permanent: true },
      { source: "/admin/admissions", destination: "/admin/inscriptions", permanent: false },
    ];
  },
};

export default nextConfig;
