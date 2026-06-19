import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth/auth-instance";
import { prisma } from "@/lib/db";

function getUploadDir(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads", "inscriptions");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { documentId } = await params;

  const doc = await prisma.inscriptionDocument.findFirst({
    where: { id: documentId, deletedAt: null },
    select: {
      storedName: true,
      originalName: true,
      mimeType: true,
      applicationId: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  try {
    const filePath = join(getUploadDir(), doc.applicationId, doc.storedName);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalName)}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 });
  }
}
