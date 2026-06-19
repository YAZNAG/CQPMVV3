import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-instance";
import { listAdminPieces } from "@/services/inscription-admin.service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get("levelId") ?? undefined;
  const pieces = await listAdminPieces(levelId);
  return NextResponse.json(pieces);
}
