import { NextResponse } from "next/server";
import { listActiveNiveauxScolaires } from "@/services/inscription-admin.service";

export async function GET() {
  const items = await listActiveNiveauxScolaires();
  return NextResponse.json(items);
}
