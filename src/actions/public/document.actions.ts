"use server";

import { prisma } from "@/lib/db";

export async function recordDocumentDownload(id: string): Promise<void> {
  if (!id) return;
  await prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
}
