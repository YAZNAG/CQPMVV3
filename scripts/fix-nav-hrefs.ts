import { prisma } from "../src/lib/db";
import { normalizeNavigationHref } from "../src/services/navigation.service";

async function main() {
  const items = await prisma.navigationItem.findMany({
    where: { deletedAt: null },
    select: { id: true, labelFr: true, href: true },
  });

  for (const item of items) {
    const normalized = normalizeNavigationHref(item.href);
    if (normalized !== item.href) {
      await prisma.navigationItem.update({
        where: { id: item.id },
        data: { href: normalized },
      });
      console.log(`Fixed: ${item.labelFr}  ${item.href} → ${normalized}`);
    }
  }

  await prisma.$disconnect();
}

main();
