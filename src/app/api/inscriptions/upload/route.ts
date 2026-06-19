import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { saveInscriptionDocument } from "@/actions/public/inscription.actions";
import { prisma } from "@/lib/db";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function getUploadDir(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads", "inscriptions");
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const applicationId = form.get("applicationId") as string | null;
    const pieceId = form.get("pieceId") as string | null;
    const file = form.get("file") as File | null;

    if (!applicationId || !pieceId || !file) {
      return NextResponse.json({ error: "Paramètres manquants (applicationId, pieceId, file)" }, { status: 400 });
    }

    // Verify application exists
    const app = await prisma.inscriptionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
      select: { id: true },
    });
    if (!app) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Taille maximale : 5 Mo" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Fichier vide" }, { status: 400 });
    }

    const storedName = `${randomUUID()}.pdf`;
    const dir = join(getUploadDir(), applicationId);
    await mkdir(dir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(join(dir, storedName), Buffer.from(bytes));

    const result = await saveInscriptionDocument(
      applicationId,
      pieceId,
      file.name,
      storedName,
      file.type,
      file.size,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Erreur enregistrement" }, { status: 500 });
    }

    return NextResponse.json({ success: true, storedName, originalName: file.name, sizeBytes: file.size });
  } catch (err) {
    console.error("[inscription/upload]", err);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
