import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-instance";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formations = await prisma.formation.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      titleFr: true,
      titleAr: true,
      requirementsFr: true,
      requirementsAr: true,
    },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });

  return NextResponse.json(formations);
}
