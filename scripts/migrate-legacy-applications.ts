/**
 * Migration optionnelle: applications (ancien système) -> inscription_applications
 *
 * Usage:
 *   npx tsx scripts/migrate-legacy-applications.ts           # dry-run (affiche le mapping, ne modifie rien)
 *   npx tsx scripts/migrate-legacy-applications.ts --confirm # exécute réellement la migration
 *
 * Ne supprime jamais la table `applications` d'origine.
 */
import { prisma } from "@/lib/db";

const NOTE = "Candidature migrée depuis ancien système applications";

const STATUS_MAP: Record<string, "PENDING" | "IN_REVIEW" | "ACCEPTED" | "REJECTED" | "INCOMPLETE"> = {
  PENDING: "PENDING",
  UNDER_REVIEW: "IN_REVIEW",
  WAITING_LIST: "IN_REVIEW",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
};

async function main() {
  const confirm = process.argv.includes("--confirm");

  const legacy = await prisma.application.findMany({
    where: { deletedAt: null },
    include: { formation: { select: { titleFr: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (legacy.length === 0) {
    console.log("Aucune candidature legacy à migrer.");
    return;
  }

  const year = await prisma.inscriptionYear.findFirst({ where: { isOpen: true } });
  const level = await prisma.inscriptionLevel.findFirst({ where: { isActive: true }, orderBy: { order: "asc" } });
  const filiere = level
    ? await prisma.inscriptionFiliere.findFirst({ where: { levelId: level.id, isActive: true }, orderBy: { order: "asc" } })
    : null;

  if (!year || !level || !filiere) {
    console.error("Impossible de migrer: aucune année ouverte, niveau ou filière actif trouvé.");
    return;
  }

  console.log(`\n=== ${legacy.length} candidature(s) trouvée(s) dans 'applications' ===\n`);
  console.log(`Mapping niveau/filière par défaut (à vérifier manuellement après migration): ${level.nameFr} / ${filiere.nameFr}\n`);

  const existingCount = await prisma.inscriptionApplication.count({ where: { yearId: year.id } });
  let counter = existingCount;

  for (const app of legacy) {
    const mappedStatus = STATUS_MAP[app.status] ?? "PENDING";
    console.log(
      `- [${app.id}] ${app.firstName} ${app.lastName} | CIN: ${app.cin} | email: ${app.email} | tel: ${app.phone} | ` +
      `formation: ${app.formation?.titleFr ?? "?"} | statut: ${app.status} -> ${mappedStatus} | créé: ${app.createdAt.toISOString()}`
    );

    if (confirm) {
      const alreadyMigrated = await prisma.inscriptionApplication.findFirst({
        where: { cin: app.cin.toUpperCase(), adminNote: { contains: app.id } },
      });
      if (alreadyMigrated) {
        console.log(`  -> déjà migré (ignoré)`);
        continue;
      }

      counter += 1;
      const reference = `CQPM-${year.year}-${String(counter).padStart(6, "0")}`;

      const created = await prisma.inscriptionApplication.create({
        data: {
          reference,
          yearId: year.id,
          levelId: level.id,
          filiereId: filiere.id,
          candidatProfile: "PROFESSIONNEL",
          nom: app.lastName,
          prenom: app.firstName,
          cin: app.cin.toUpperCase(),
          dateNaissance: app.birthDate,
          telephone: app.phone,
          email: app.email,
          adresse: app.address,
          ville: app.city,
          niveauScolaire: app.educationLevel,
          status: mappedStatus,
          adminNote: `${NOTE} (ancien id: ${app.id}, formation: ${app.formation?.titleFr ?? "?"}). Niveau/filière à vérifier manuellement.`,
          submittedAt: app.createdAt,
        },
      });

      await prisma.inscriptionStatusHistory.create({
        data: {
          applicationId: created.id,
          fromStatus: null,
          toStatus: mappedStatus,
          note: NOTE,
        },
      });

      console.log(`  -> migré sous la référence ${reference}`);
    }
  }

  if (!confirm) {
    console.log("\nDRY-RUN: aucune donnée modifiée. Relancer avec --confirm pour exécuter la migration réelle.");
  } else {
    console.log("\nMigration terminée. La table 'applications' d'origine n'a pas été modifiée ni supprimée.");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
