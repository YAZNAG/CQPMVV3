import { NextResponse, type NextRequest } from "next/server";
import { getConditionsForSelection } from "@/services/inscription.service";
import type { CandidatProfile } from "@prisma/client";

const VALID_PROFILES: CandidatProfile[] = ["COLLEGIEN", "PROFESSIONNEL", "APPRENTISSAGE"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get("levelId");
  const filiereId = searchParams.get("filiereId");
  const candidatProfile = searchParams.get("candidatProfile") as CandidatProfile | null;

  if (!levelId || !filiereId || !candidatProfile || !VALID_PROFILES.includes(candidatProfile)) {
    return NextResponse.json([], { status: 400 });
  }

  const conditions = await getConditionsForSelection(levelId, filiereId, candidatProfile);
  return NextResponse.json(conditions);
}
