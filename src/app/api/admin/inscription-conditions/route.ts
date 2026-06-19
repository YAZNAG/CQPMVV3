import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-instance";
import { listAdminConditions } from "@/services/inscription-admin.service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get("levelId") ?? undefined;
  const conditions = await listAdminConditions(levelId);
  return NextResponse.json(conditions);
}
