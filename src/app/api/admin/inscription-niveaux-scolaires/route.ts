import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-instance";
import { listAdminNiveauxScolaires } from "@/services/inscription-admin.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await listAdminNiveauxScolaires();
  return NextResponse.json(items);
}
