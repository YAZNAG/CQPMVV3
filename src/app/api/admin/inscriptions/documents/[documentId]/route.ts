import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth-instance";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { readCandidatFile } from "@/lib/storage/candidat-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "admissions", "read")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { documentId } = await params;

  const doc = await prisma.inscriptionDocument.findFirst({
    where: { id: documentId, deletedAt: null },
    select: {
      storedName: true,
      originalName: true,
      mimeType: true,
      applicationId: true,
      application: { select: { reference: true } },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  try {
    const buffer = await readCandidatFile(doc.application.reference, doc.storedName);

    await createAuditLog({
      userId: session.user.id,
      action: "DOWNLOAD",
      entity: "InscriptionDocument",
      entityId: documentId,
      metadata: { reference: doc.application.reference, originalName: doc.originalName },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

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
