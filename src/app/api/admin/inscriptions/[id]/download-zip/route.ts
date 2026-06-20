import { NextResponse, type NextRequest } from "next/server";
import { ZipArchive } from "archiver";
import { auth } from "@/lib/auth/auth-instance";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { readCandidatFile } from "@/lib/storage/candidat-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "admissions", "read")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const app = await prisma.inscriptionApplication.findFirst({
    where: { id, deletedAt: null },
    select: {
      reference: true,
      documents: { where: { deletedAt: null }, select: { storedName: true, originalName: true } },
    },
  });

  if (!app) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  for (const doc of app.documents) {
    try {
      const buffer = await readCandidatFile(app.reference, doc.storedName);
      archive.append(buffer, { name: doc.originalName });
    } catch {
      // skip missing files
    }
  }

  const finalized = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });
  await archive.finalize();
  await finalized;

  await createAuditLog({
    userId: session.user.id,
    action: "DOWNLOAD",
    entity: "InscriptionApplication",
    entityId: id,
    metadata: { reference: app.reference, type: "zip-archive" },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${app.reference}.zip"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
