import { prisma } from "@/lib/db";

export async function getAdminNavBadges() {
  const [admissions, contact, reclamations] = await Promise.all([
    prisma.application.count({
      where: { status: "PENDING", deletedAt: null },
    }),
    prisma.contactMessage.count({
      where: { isRead: false, deletedAt: null },
    }),
    prisma.reclamation.count({
      where: { status: "PENDING", deletedAt: null },
    }),
  ]);
  return { admissions, contact, reclamations };
}

export async function getDashboardStats() {
  const [
    users,
    applications,
    pendingApplications,
    formations,
    newsPublished,
    newsDraft,
    galleryItems,
    testimonials,
    unreadMessages,
    auditLast24h,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.application.count({ where: { deletedAt: null } }),
    prisma.application.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.formation.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.newsArticle.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.newsArticle.count({ where: { isPublished: false, deletedAt: null } }),
    prisma.galleryItem.count({ where: { deletedAt: null, album: { deletedAt: null } } }),
    prisma.testimonial.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.contactMessage.count({ where: { isRead: false, deletedAt: null } }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    users,
    applications,
    pendingApplications,
    formations,
    newsPublished,
    newsDraft,
    galleryItems,
    testimonials,
    unreadMessages,
    auditLast24h,
  };
}

export async function getRecentApplications(limit = 5) {
  return prisma.application.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { formation: { select: { titleFr: true } } },
  });
}

export async function getRecentAuditLogs(limit = 8) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function listAuditLogs({
  page = 1,
  pageSize = 25,
  action,
  entity,
  userId,
}: {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
  userId?: string;
}) {
  const where = {
    ...(action ? { action: action as never } : {}),
    ...(entity ? { entity: { contains: entity, mode: "insensitive" as const } } : {}),
    ...(userId ? { userId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
