import { NextResponse, type NextRequest } from "next/server";
import { getApplicationByReferenceAndCin } from "@/services/inscription.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const cin = searchParams.get("cin");

  if (!reference || !cin) {
    return NextResponse.json(null, { status: 400 });
  }

  const app = await getApplicationByReferenceAndCin(reference, cin);
  if (!app) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({
    reference: app.reference,
    status: app.status,
    submittedAt: app.submittedAt,
    level: app.level,
    filiere: app.filiere,
    nom: app.nom,
    prenom: app.prenom,
    adminNote: app.adminNote,
    motifRefus: app.motifRefus,
    documents: app.documents.map((d: { piece: { nameFr: string; nameAr: string } }) => ({ piece: { nameFr: d.piece.nameFr } })),
    statusHistory: app.statusHistory,
  });
}
