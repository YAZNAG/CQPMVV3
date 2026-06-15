import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "1.0.0",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Service indisponible" },
      { status: 503 }
    );
  }
}
