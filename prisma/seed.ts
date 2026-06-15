/**
 * CQPM Nador — Database seed
 * Run: npm run db:seed (after migrate)
 *
 * Roles are PostgreSQL enums (UserRole), not a separate table.
 * Default credentials — change in production!
 */

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  FORMATION_IMAGES_BY_SLUG,
  PARTNER_LOGOS,
  SITE_IMAGES,
} from "../src/lib/site-images";
import {
  ABOUT_MISSIONS,
  aboutMissionsText,
  aboutPresentationParagraph1,
  aboutPresentationParagraph2,
} from "../src/lib/about-default-content";
import {
  DIRECTOR_DEFAULT_BODY,
  DIRECTOR_DEFAULT_NAME,
  DIRECTOR_DEFAULT_TITLE,
  splitDirectorParagraphs,
} from "../src/lib/director-defaults";
import { seedFormationCategoriesAndFormations as runSeedFormations } from "./seed-formations";
import { FORMATIONS } from "../src/lib/formation-default-content";
import {
  DEFAULT_ORG_CHART_NODES,
  DEFAULT_ORG_CHART_PAGE,
} from "../src/lib/org-chart-defaults";
import {
  DEFAULT_CHIFFRES_FORMATION_ITEMS,
  DEFAULT_CHIFFRES_GROWTH_BARS,
  DEFAULT_CHIFFRES_HIGHLIGHTS,
  DEFAULT_CHIFFRES_INFRASTRUCTURE_ITEMS,
  DEFAULT_CHIFFRES_PAGE,
} from "../src/lib/chiffres-defaults";

/** Coordonnées officielles CQPM Nador (Département de la Pêche Maritime) */
const CQPM_CONTACT = {
  phone: "0536608727 / 0668221128",
  email: "contact@cqpm-nador.ma",
  addressFr:
    "Centre de Qualification Professionnelle Maritime de Nador, Beni Ensar B.P 697, Nador 62000, Maroc",
  addressAr: "مركز التأهيل المهني البحري بالناظور، بني نصر ص.ب 697، الناظور 62000، المغرب",
  facebook: "https://www.facebook.com/cqpm.nador",
  linkedin: "https://www.linkedin.com/company/cqpm-nador",
} as const;

const DIRECTOR_MESSAGE = {
  directorQuoteFr: splitDirectorParagraphs(DIRECTOR_DEFAULT_BODY.fr)[0],
  directorQuoteAr: splitDirectorParagraphs(DIRECTOR_DEFAULT_BODY.ar)[0],
  directorNameFr: DIRECTOR_DEFAULT_NAME.fr,
  directorNameAr: DIRECTOR_DEFAULT_NAME.ar,
  directorTitleFr: DIRECTOR_DEFAULT_TITLE.fr,
  directorTitleAr: DIRECTOR_DEFAULT_TITLE.ar,
  directorBodyFr: DIRECTOR_DEFAULT_BODY.fr,
  directorBodyAr: DIRECTOR_DEFAULT_BODY.ar,
  directorMessagePublished: true,
} as const;

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Admin@CQPM2025!";

// -----------------------------------------------------------------------------
// Helpers (slug is indexed, not globally unique — match active rows only)
// -----------------------------------------------------------------------------

async function upsertUserByEmail(data: {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        role: data.role,
        passwordHash: data.passwordHash,
        isActive: true,
      },
    });
  }
  return prisma.user.create({ data });
}

async function upsertFormationCategory(data: {
  slug: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  order: number;
}) {
  const existing = await prisma.formationCategory.findFirst({
    where: { slug: data.slug, deletedAt: null },
  });
  if (existing) {
    return prisma.formationCategory.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.formationCategory.create({ data });
}

type FormationSeedData = {
  categoryId: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  objectivesFr: string;
  objectivesAr: string;
  durationFr: string;
  durationAr: string;
  requirementsFr: string;
  requirementsAr: string;
  order: number;
  isPublished: boolean;
  imageUrl?: string | null;
};

/** Seed re-run must not reset images chosen in admin (/uploads/ or custom paths). */
function omitKeys<T extends Record<string, unknown>, K extends keyof T>(
  data: T,
  keys: K[]
): Omit<T, K> {
  const copy = { ...data };
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
}

async function upsertFormation(slug: string, data: FormationSeedData) {
  const existing = await prisma.formation.findFirst({
    where: { slug, deletedAt: null },
  });
  if (existing) {
    return prisma.formation.update({
      where: { id: existing.id },
      data: omitKeys(data, ["imageUrl"]),
    });
  }
  return prisma.formation.create({ data: { ...data, slug } });
}

// -----------------------------------------------------------------------------
// Cleanup legacy / demo data
// -----------------------------------------------------------------------------

async function cleanupLegacyTestData() {
  console.log("→ Nettoyage données test / anciens centres");

  const now = new Date();

  const highlightTitles = [
    "Centre De Mdiq",
    "ITPM de Larache",
    "Centre De Mehdia",
    "Centre de Mdiq",
    "Centre de Mehdia",
  ];
  await prisma.homeHighlight.updateMany({
    where: {
      deletedAt: null,
      titleFr: { in: highlightTitles },
    },
    data: { deletedAt: now },
  });

  await prisma.testimonial.updateMany({
    where: {
      deletedAt: null,
      OR: [
        { nameFr: { in: ["Ahmed Benali", "Fatima Zahra"] } },
        { contentFr: { contains: "chef de quart" } },
      ],
    },
    data: { deletedAt: now },
  });

  await prisma.navigationItem.updateMany({
    where: {
      deletedAt: null,
      OR: [
        { labelFr: { contains: "Mdiq" } },
        { labelFr: { contains: "Larache" } },
        { labelFr: { contains: "Mehdia" } },
        { labelFr: { contains: "ITPM" } },
      ],
    },
    data: { deletedAt: now },
  });

  await prisma.contactFormField.updateMany({
    where: {
      deletedAt: null,
      key: "email",
      OR: [
        { placeholderFr: { contains: "exemple" } },
        { placeholderAr: { contains: "example" } },
      ],
    },
    data: {
      placeholderFr: "contact@cqpm-nador.ma",
      placeholderAr: "contact@cqpm-nador.ma",
    },
  });

  await prisma.application.updateMany({
    where: {
      deletedAt: null,
      OR: [
        { email: { contains: "test@" } },
        { email: { contains: "example.com" } },
        { firstName: { in: ["Test", "Demo", "John"] } },
        { lastName: { in: ["Test", "Demo", "Doe"] } },
      ],
    },
    data: { deletedAt: now },
  });

  await prisma.contactMessage.updateMany({
    where: {
      deletedAt: null,
      OR: [
        { email: { contains: "test@" } },
        { email: { contains: "example.com" } },
      ],
    },
    data: { deletedAt: now },
  });

  await prisma.galleryAlbum.updateMany({
    where: {
      deletedAt: null,
      slug: "vie-au-centre",
    },
    data: { deletedAt: now },
  });

  await prisma.newsArticle.updateMany({
    where: {
      deletedAt: null,
      OR: [
        { slug: "test" },
        { titleFr: { equals: "test", mode: "insensitive" } },
        { titleFr: { contains: "Perspectives de la formation maritime", mode: "insensitive" } },
        { titleFr: { contains: "ITPM", mode: "insensitive" } },
        { titleFr: { contains: "Larache", mode: "insensitive" } },
      ],
    },
    data: { deletedAt: now },
  });

  console.log("  ✓ Données test / legacy retirées");
}


async function seedRolesAndUsers(passwordHash: string) {
  console.log("→ Roles & staff users (UserRole enum: SUPER_ADMIN | ADMIN | EDITOR)");

  const staff = [
    {
      email: "admin@cqpm-nador.ma",
      name: "Super Administrateur",
      role: UserRole.SUPER_ADMIN,
    },
    {
      email: "administration@cqpm-nador.ma",
      name: "Administrateur CQPM",
      role: UserRole.ADMIN,
    },
    {
      email: "redaction@cqpm-nador.ma",
      name: "Rédacteur CQPM",
      role: UserRole.EDITOR,
    },
  ];

  for (const user of staff) {
    await upsertUserByEmail({ ...user, passwordHash });
    console.log(`  ✓ ${user.role.padEnd(12)} ${user.email}`);
  }
}

async function seedSiteSettings() {
  console.log("→ Site settings (singleton)");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteNameFr: "CQPM Nador",
      siteNameAr: "مركز التأهيل المهني البحري الناظور",
      taglineFr: "Former les professionnels de la mer de demain",
      taglineAr: "تكوين مهنيي البحر في الغد",
      email: CQPM_CONTACT.email,
      phone: CQPM_CONTACT.phone,
      addressFr: CQPM_CONTACT.addressFr,
      addressAr: CQPM_CONTACT.addressAr,
      aboutHistoryFr: aboutPresentationParagraph1("fr"),
      aboutHistoryAr: aboutPresentationParagraph1("ar"),
      aboutPresentationFr: aboutPresentationParagraph2("fr"),
      aboutPresentationAr: aboutPresentationParagraph2("ar"),
      missionFr: aboutMissionsText("fr"),
      missionAr: aboutMissionsText("ar"),
      visionFr: `Être le centre de référence de la formation maritime professionnelle en Méditerranée marocaine, reconnu pour la qualité de ses programmes et l'employabilité de ses lauréats.`,
      visionAr: `أن نكون مركز المرجعية للتكوين المهني البحري في المتوسط المغربي، معترفاً بجودة برامجنا وقابلية خريجينا للتوظيف.`,
      valuesFr: `Excellence pédagogique\nSécurité et responsabilité\nRespect de l'environnement marin\nÉquité et inclusion\nInnovation et amélioration continue`,
      valuesAr: `التميز التربوي\nالسلامة والمسؤولية\nاحترام البيئة البحرية\nالإنصاف والإدماج\nالابتكار والتحسين المستمر`,
      statsStudents: 2800,
      statsFormations: 18,
      statsYears: 25,
      statsPartners: 14,
      facebookUrl: CQPM_CONTACT.facebook,
      linkedinUrl: CQPM_CONTACT.linkedin,
      homeFormationsTitleFr: "Nos formations",
      homeFormationsTitleAr: "تكويناتنا",
      homeFormationsSubtitleFr:
        "Deux niveaux — Qualification et Spécialisation — en filières Pêche maritime et Machine",
      homeFormationsSubtitleAr:
        "مستويان — التأهيل والتخصص — في شعبتي الصيد البحري والميكانيك",
      homeFormationsCtaLabelFr: "Voir tout",
      homeFormationsCtaLabelAr: "عرض الكل",
      homeFormationsCtaHref: "/formations",
      homeEventsTitleFr: "Événements et Activités",
      homeEventsTitleAr: "الفعاليات والأنشطة",
      homeEventsEmptyFr: "Aucun événement ou activité pour le moment.",
      homeEventsEmptyAr: "لا توجد فعاليات أو أنشطة حالياً.",
      homeEngagementTitleFr: "Notre engagement en action",
      homeEngagementTitleAr: "التزامنا في الميدان",
      homeContactBannerTitleFr: "Pour toutes vos questions et opinions",
      homeContactBannerTitleAr: "لجميع أسئلتكم وآرائكم",
      homeContactBannerSubtitleFr: "Contactez-nous",
      homeContactBannerSubtitleAr: "تواصلوا معنا",
      homeContactBannerPhone: CQPM_CONTACT.phone,
      homeContactBannerHref: "/contact",
      contactHoursFr: "Lundi — Vendredi, 8h30 — 16h30",
      contactHoursAr: "الاثنين — الجمعة، 8h30 — 16h30",
      contactIntroFr:
        "Une question sur nos formations ? Écrivez-nous, notre équipe vous répond rapidement.",
      contactIntroAr: "لديكم سؤال حول تكويناتنا؟ راسلونا، فريقنا يجيبكم بسرعة.",
      downloadsSectionTitleFr: "Espace Téléchargement",
      downloadsSectionTitleAr: "فضاء التحميل",
      downloadsSectionSubtitleFr:
        "Accédez aux avis officiels, résultats des concours et documents d'inscription.",
      downloadsSectionSubtitleAr:
        "اطلعوا على الإعلانات الرسمية ونتائج المباريات ووثائق التسجيل.",
      ...DEFAULT_ORG_CHART_PAGE,
      ...DEFAULT_CHIFFRES_PAGE,
      ...DIRECTOR_MESSAGE,
    },
    create: {
      id: "default",
      siteNameFr: "CQPM Nador",
      siteNameAr: "مركز التأهيل المهني البحري الناظور",
      taglineFr: "Former les professionnels de la mer de demain",
      taglineAr: "تكوين مهنيي البحر في الغد",
      email: CQPM_CONTACT.email,
      phone: CQPM_CONTACT.phone,
      addressFr: CQPM_CONTACT.addressFr,
      addressAr: CQPM_CONTACT.addressAr,
      logoUrl: SITE_IMAGES.logo,
      aboutImageUrl: SITE_IMAGES.about,
      heroImageUrl: SITE_IMAGES.hero,
      aboutHistoryFr: aboutPresentationParagraph1("fr"),
      aboutHistoryAr: aboutPresentationParagraph1("ar"),
      aboutPresentationFr: aboutPresentationParagraph2("fr"),
      aboutPresentationAr: aboutPresentationParagraph2("ar"),
      missionFr: aboutMissionsText("fr"),
      missionAr: aboutMissionsText("ar"),
      visionFr: `Centre de référence en formation maritime.`,
      visionAr: `مركز مرجعي في التكوين البحري.`,
      valuesFr: "Excellence • Sécurité • Environnement",
      valuesAr: "التميز • السلامة • البيئة",
      statsStudents: 2800,
      statsFormations: 18,
      statsYears: 25,
      statsPartners: 14,
      ...DEFAULT_ORG_CHART_PAGE,
      ...DEFAULT_CHIFFRES_PAGE,
      ...DIRECTOR_MESSAGE,
    },
  });

  console.log("  ✓ site_settings (id: default)");
}

async function seedSiteStatsAndSocialLinks() {
  console.log("→ Site stats & réseaux sociaux");
  const stats = [
      {
        id: "stat_students",
        labelFr: "Stagiaires formés",
        labelAr: "متدربون مؤهلون",
        value: 2800,
        icon: "USERS" as const,
        order: 0,
      },
      {
        id: "stat_formations",
        labelFr: "Formations",
        labelAr: "تكوينات",
        value: 18,
        icon: "GRADUATION_CAP" as const,
        order: 1,
      },
      {
        id: "stat_years",
        labelFr: "Années d'expérience",
        labelAr: "سنوات الخبرة",
        value: 25,
        icon: "CALENDAR" as const,
        order: 2,
      },
      {
        id: "stat_partners",
        labelFr: "Partenaires",
        labelAr: "شركاء",
        value: 14,
        icon: "HANDSHAKE" as const,
        order: 3,
      },
    ];
  for (const stat of stats) {
    await prisma.siteStat.upsert({
      where: { id: stat.id },
      create: { ...stat, showPlus: true, isPublished: true },
      update: { ...stat, showPlus: true, isPublished: true, deletedAt: null },
    });
  }
  console.log("  ✓ site_stats");

  const links = [
      {
        id: "social_facebook",
        platform: "FACEBOOK" as const,
        url: CQPM_CONTACT.facebook,
        order: 0,
      },
      {
        id: "social_linkedin",
        platform: "LINKEDIN" as const,
        url: CQPM_CONTACT.linkedin,
        order: 1,
      },
    ];
  for (const link of links) {
    await prisma.siteSocialLink.upsert({
      where: { id: link.id },
      create: { ...link, isPublished: true },
      update: { ...link, isPublished: true, deletedAt: null },
    });
  }
  console.log("  ✓ site_social_links");
}

async function seedFormationCategoriesAndFormations() {
  await runSeedFormations(prisma, upsertFormationCategory, upsertFormation);
}

async function upsertNewsCategory(data: {
  slug: string;
  nameFr: string;
  nameAr: string;
  order: number;
}) {
  const existing = await prisma.newsCategory.findFirst({
    where: { slug: data.slug, deletedAt: null },
  });
  if (existing) {
    return prisma.newsCategory.update({ where: { id: existing.id }, data });
  }
  return prisma.newsCategory.create({ data });
}

async function upsertNewsArticle(
  slug: string,
  data: {
    categoryId: string;
    authorId: string;
    titleFr: string;
    titleAr: string;
    excerptFr: string;
    excerptAr: string;
    contentFr: string;
    contentAr: string;
    coverImageUrl: string;
    isFeatured: boolean;
    publishedAt: Date;
  }
) {
  const existing = await prisma.newsArticle.findFirst({
    where: { slug, deletedAt: null },
  });
  const payload = { ...data, isPublished: true };
  if (existing) {
    await prisma.newsArticle.update({
      where: { id: existing.id },
      data: omitKeys(payload, ["coverImageUrl"]),
    });
  } else {
    await prisma.newsArticle.create({ data: { slug, ...payload } });
  }
}

async function seedCqpmPublicContent(superAdminId: string) {
  console.log("→ Contenu public CQPM (actualités, galerie, partenaires)");

  const [catAnnonces, catEvenements] = await Promise.all([
    upsertNewsCategory({
      slug: "annonces",
      nameFr: "Annonces",
      nameAr: "إعلانات",
      order: 0,
    }),
    upsertNewsCategory({
      slug: "evenements",
      nameFr: "Événements",
      nameAr: "فعاليات",
      order: 1,
    }),
  ]);

  const cqpmArticles = [
    {
      slug: "ouverture-inscriptions-2026",
      categoryId: catAnnonces.id,
      titleFr: "Concours d'accès — Qualification Pêche & Machine 2026",
      titleAr: "مباراة الولوج — تأهيل الصيد والميكانيك 2026",
      excerptFr:
        "Le Département de la Pêche Maritime organise le concours d'accès au CQPM Nador (Bni Nsser) pour les filières Pêche et Machine — formation initiale résidentielle de 2 ans.",
      excerptAr:
        "تنظم مديرية الصيد البحري مباراة الولوج إلى المركز بالناظور (بني نصار) لشعبتي الصيد والميكانيك — تكوين أولي داخلي لمدة سنتين.",
      contentFr: `<p>Sous la tutelle du <strong>Département de la Pêche Maritime</strong>, le CQPM Nador — <strong>Bni Nsser, B.P 697</strong> — ouvre les candidatures pour 2026-2027. Filières Pêche et Machine, formation résidentielle de 2 ans. Concours : sécurité maritime, techniques, langues arabe et française. Contact : ${CQPM_CONTACT.phone}</p>`,
      contentAr: `<p>تحت إشراف مديرية الصيد البحري، يعلن المركز بالناظور (بني نصار) عن مباراة الولوج 2026-2027 لشعبتي الصيد والميكانيك. تكوين داخلي لمدة سنتين. للاستفسار : ${CQPM_CONTACT.phone}</p>`,
      coverImageUrl: "/images/formation-fishing.jpg",
      isFeatured: true,
      publishedAt: new Date("2026-06-13T09:00:00Z"),
    },
    {
      slug: "presentation-cqpm-nador-bni-nsser",
      categoryId: catAnnonces.id,
      titleFr: "Le CQPM Nador — Centre de qualification maritime à Bni Nsser",
      titleAr: "المركز بالناظور — تأهيل مهني بحري ببني نصار",
      excerptFr:
        "Établissement public du Département de la Pêche Maritime, le CQPM Nador forme les marins et techniciens des filières Pêche et Machine.",
      excerptAr:
        "مؤسسة عمومية تابعة لمديرية الصيد البحري، يكوّن المركز بالناظور البحارة والتقنيين في شعبتي الصيد والميكانيك.",
      contentFr: `<p>Le <strong>CQPM Nador</strong> prépare au diplôme de Qualification Professionnelle Maritime. Adresse : ${CQPM_CONTACT.addressFr}. Tél : ${CQPM_CONTACT.phone}. Email : ${CQPM_CONTACT.email}</p>`,
      contentAr: `<p><strong>مركز التأهيل المهني البحري بالناظور</strong> يؤهل للحصول على شهادة التأهيل المهني البحري. العنوان : ${CQPM_CONTACT.addressAr}. الهاتف : ${CQPM_CONTACT.phone}</p>`,
      coverImageUrl: SITE_IMAGES.about,
      isFeatured: false,
      publishedAt: new Date("2026-06-01T10:00:00Z"),
    },
    {
      slug: "journee-portes-ouvertes-cqpm-nador-2026",
      categoryId: catEvenements.id,
      titleFr: "Journée portes ouvertes — CQPM Nador 2026",
      titleAr: "يوم الأبواب المفتوحة — المركز بالناظور 2026",
      excerptFr:
        "Découvrez les ateliers Pêche et Machine et rencontrez l'équipe pédagogique du centre de Bni Nsser.",
      excerptAr:
        "تعرفوا على الورشات وشعبتي الصيد والميكانيك والتقوا بالفريق التربوي ببني نصار.",
      contentFr: `<p>Journée portes ouvertes au CQPM Nador : visite des ateliers, présentation des parcours de 2 ans, informations sur le concours d'accès. Gratuit — ${CQPM_CONTACT.phone}</p>`,
      contentAr: `<p>يوم الأبواب المفتوحة بالمركز : زيارة الورش، عرض مسارات التأهيل، معلومات حول مباراة الولوج. مجاني — ${CQPM_CONTACT.phone}</p>`,
      coverImageUrl: "/images/maritime-training.jpg",
      isFeatured: false,
      publishedAt: new Date("2026-05-28T09:00:00Z"),
    },
  ];

  for (const article of cqpmArticles) {
    await upsertNewsArticle(article.slug, {
      ...article,
      authorId: superAdminId,
    });
    console.log(`  ✓ Actualité: ${article.slug}`);
  }

  const galleryAlbum = await prisma.galleryAlbum.findFirst({
    where: { slug: "cqpm-nador", deletedAt: null },
  });
  if (!galleryAlbum) {
    const album = await prisma.galleryAlbum.create({
      data: {
        slug: "cqpm-nador",
        titleFr: "CQPM Nador — Formations maritimes",
        titleAr: "المركز بالناظور — التكوين البحري",
        descriptionFr:
          "Ateliers, pratiques en mer et vie au centre de qualification maritime de Bni Nsser.",
        descriptionAr: "ورشات، تطبيقات في البحر والحياة في مركز التأهيل ببني نصار.",
        coverImageUrl: SITE_IMAGES.about,
        order: 0,
        isPublished: true,
      },
    });

    const galleryPhotos = [
      { url: SITE_IMAGES.about, titleFr: "Centre CQPM Nador", titleAr: "مركز التأهيل بالناظور" },
      { url: "/images/formation-fishing.jpg", titleFr: "Filière Pêche", titleAr: "شعبة الصيد" },
      { url: "/images/formation-mechanics.jpg", titleFr: "Filière Machine", titleAr: "شعبة الميكانيك" },
      { url: "/images/maritime-training.jpg", titleFr: "Formation pratique", titleAr: "تكوين تطبيقي" },
    ];

    for (const [i, photo] of galleryPhotos.entries()) {
      const media = await prisma.mediaFile.create({
        data: {
          url: photo.url,
          name: photo.titleFr,
          mimeType: "image/jpeg",
          size: 0,
          purpose: "GALLERY",
        },
      });
      await prisma.galleryItem.create({
        data: {
          albumId: album.id,
          type: "PHOTO",
          mediaFileId: media.id,
          titleFr: photo.titleFr,
          titleAr: photo.titleAr,
          order: i,
        },
      });
    }
    console.log("  ✓ Galerie: cqpm-nador");
  }

  const partnerSeeds = [
    {
      name: "Office National des Pêches",
      logoUrl: PARTNER_LOGOS.onp,
      websiteUrl: "https://www.onp.ma",
      order: 0,
      isPublished: true,
    },
    {
      name: "Ministère de la Pêche Maritime",
      logoUrl: PARTNER_LOGOS.mpm,
      websiteUrl: "https://www.mpm.gov.ma",
      order: 1,
      isPublished: true,
    },
    {
      name: "Département de la Pêche Maritime — Région Oriental",
      logoUrl: PARTNER_LOGOS.onp,
      websiteUrl: null,
      order: 2,
      isPublished: true,
    },
  ];

  for (const partner of partnerSeeds) {
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name, deletedAt: null },
    });
    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: omitKeys(partner, ["logoUrl"]),
      });
    } else {
      await prisma.partner.create({ data: partner });
    }
  }

  console.log("  ✓ Partenaires institutionnels");
}

async function seedNavigation() {
  console.log("→ Navigation menu");

  const alreadyConfigured = await prisma.navigationItem.findFirst();
  if (alreadyConfigured) {
    console.log("  ↷ Ignoré — menu géré via l'admin (les suppressions sont conservées)");
    return;
  }

  type NavSeed = {
    labelFr: string;
    labelAr: string;
    href: string;
    location: "HEADER" | "FOOTER" | "BOTH";
    order: number;
    exactMatch: boolean;
    children?: NavSeed[];
  };

  const linkTree: NavSeed[] = [
    {
      labelFr: "Accueil",
      labelAr: "الرئيسية",
      href: "/",
      location: "HEADER",
      order: 0,
      exactMatch: true,
    },
    {
      labelFr: "À propos",
      labelAr: "من نحن",
      href: "/pages/presentation",
      location: "BOTH",
      order: 1,
      exactMatch: false,
      children: [
        {
          labelFr: "Présentation",
          labelAr: "العرض",
          href: "/pages/presentation",
          location: "BOTH",
          order: 0,
          exactMatch: false,
        },
        {
          labelFr: "Le mot du directeur",
          labelAr: "كلمة المدير",
          href: "/pages/mot-du-directeur",
          location: "BOTH",
          order: 1,
          exactMatch: false,
        },
      ],
    },
    {
      labelFr: "Formations",
      labelAr: "التكوينات",
      href: "/formations",
      location: "BOTH",
      order: 2,
      exactMatch: false,
      children: FORMATIONS.map((formation, order) => ({
        labelFr: formation.navLabelFr,
        labelAr: formation.navLabelAr,
        href: `/formations/${formation.slug}`,
        location: "BOTH" as const,
        order,
        exactMatch: false,
      })),
    },
    {
      labelFr: "Inscriptions",
      labelAr: "التسجيل",
      href: "/admission",
      location: "BOTH",
      order: 3,
      exactMatch: false,
    },
    {
      labelFr: "Actualités",
      labelAr: "الأخبار",
      href: "/news",
      location: "BOTH",
      order: 4,
      exactMatch: false,
      children: [
        {
          labelFr: "Galerie",
          labelAr: "المعرض",
          href: "/gallery",
          location: "BOTH",
          order: 0,
          exactMatch: false,
        },
        {
          labelFr: "Blog",
          labelAr: "المدونة",
          href: "/news",
          location: "BOTH",
          order: 1,
          exactMatch: false,
        },
        {
          labelFr: "Événements",
          labelAr: "الفعاليات",
          href: "/events",
          location: "BOTH",
          order: 2,
          exactMatch: false,
        },
      ],
    },
    {
      labelFr: "Contact",
      labelAr: "اتصل بنا",
      href: "/contact",
      location: "BOTH",
      order: 5,
      exactMatch: false,
      children: [
        {
          labelFr: "Réclamation",
          labelAr: "شكاية",
          href: "/contact/reclamation",
          location: "BOTH",
          order: 0,
          exactMatch: false,
        },
      ],
    },
  ];

  const buttonItems = [
    {
      labelFr: "S'inscrire",
      labelAr: "التسجيل",
      href: "/admission",
      location: "HEADER" as const,
      itemType: "BUTTON" as const,
      order: 0,
      exactMatch: false,
    },
  ];

  async function upsertNavLink(item: NavSeed, parentId: string | null = null) {
    const existing = await prisma.navigationItem.findFirst({
      where: {
        deletedAt: null,
        itemType: "LINK",
        parentId,
        OR: [{ href: item.href }, { labelFr: item.labelFr }],
      },
    });

    const data = {
      labelFr: item.labelFr,
      labelAr: item.labelAr,
      href: item.href,
      location: item.location,
      itemType: "LINK" as const,
      order: item.order,
      exactMatch: item.exactMatch,
      isPublished: true,
      openInNewTab: false,
      parentId,
    };

    const row = existing
      ? await prisma.navigationItem.update({ where: { id: existing.id }, data })
      : await prisma.navigationItem.create({ data });

    if (item.children) {
      for (const child of item.children) {
        await upsertNavLink(child, row.id);
      }
    }

    return row;
  }

  for (const item of linkTree) {
    await upsertNavLink(item);
  }

  // Retire l'ancienne entrée Galerie au niveau racine
  await prisma.navigationItem.updateMany({
    where: {
      deletedAt: null,
      parentId: null,
      href: "/gallery",
      itemType: "LINK",
    },
    data: { deletedAt: new Date() },
  });

  for (const item of buttonItems) {
    const existing = await prisma.navigationItem.findFirst({
      where: {
        parentId: null,
        deletedAt: null,
        itemType: item.itemType,
        OR: [{ href: item.href }, { labelFr: item.labelFr }],
      },
    });
    const data = {
      ...item,
      isPublished: true,
      openInNewTab: false,
    };
    if (existing) {
      await prisma.navigationItem.update({ where: { id: existing.id }, data });
    } else {
      await prisma.navigationItem.create({ data });
    }
  }

  console.log("  ✓ Navigation items");
}

async function upsertSitePage(
  slug: string,
  data: {
    titleFr: string;
    titleAr: string;
    excerptFr: string;
    excerptAr: string;
    contentFr: string;
    contentAr: string;
    coverImageUrl?: string | null;
    order: number;
    isPublished: boolean;
  }
) {
  const existing = await prisma.sitePage.findFirst({
    where: { slug, deletedAt: null },
  });
  if (existing) {
    await prisma.sitePage.update({
      where: { id: existing.id },
      data: omitKeys(data, ["coverImageUrl"]),
    });
  } else {
    await prisma.sitePage.create({ data: { slug, ...data } });
  }
}

async function upsertNavChild(
  parentId: string,
  item: {
    labelFr: string;
    labelAr: string;
    href: string;
    order: number;
  }
) {
  const existing = await prisma.navigationItem.findFirst({
    where: {
      deletedAt: null,
      parentId,
      OR: [{ href: item.href }, { labelFr: item.labelFr }],
    },
  });

  const data = {
    labelFr: item.labelFr,
    labelAr: item.labelAr,
    href: item.href,
    location: "BOTH" as const,
    itemType: "LINK" as const,
    order: item.order,
    exactMatch: false,
    isPublished: true,
    openInNewTab: false,
    parentId,
  };

  if (existing) {
    await prisma.navigationItem.update({ where: { id: existing.id }, data });
  } else {
    await prisma.navigationItem.create({ data });
  }
}

async function seedAboutSectionPagesAndNav() {
  console.log("→ Pages & sous-menu « À propos »");

  const presentationContentFr = `<h2>Présentation générale</h2>
<p>${aboutPresentationParagraph1("fr")}</p>
<p>${aboutPresentationParagraph2("fr")}</p>
<h2>Missions du centre</h2>
<ul>
${ABOUT_MISSIONS.fr.map((item) => `<li>${item}</li>`).join("\n")}
</ul>`;

  const presentationContentAr = `<h2>عرض عام</h2>
<p>${aboutPresentationParagraph1("ar")}</p>
<p>${aboutPresentationParagraph2("ar")}</p>
<h2>مهام المركز</h2>
<ul>
${ABOUT_MISSIONS.ar.map((item) => `<li>${item}</li>`).join("\n")}
</ul>`;

  await upsertSitePage("presentation", {
    titleFr: "Présentation",
    titleAr: "العرض",
    excerptFr:
      "Découvrez le CQPM Nador — centre de qualification maritime à Bni Nsser.",
    excerptAr: "تعرفوا على مركز التأهيل المهني البحري بالناظور — بني نصار.",
    contentFr: presentationContentFr,
    contentAr: presentationContentAr,
    coverImageUrl: SITE_IMAGES.about,
    order: 0,
    isPublished: true,
  });
  console.log("  ✓ Page CMS: presentation");

  let aboutParent = await prisma.navigationItem.findFirst({
    where: {
      deletedAt: null,
      itemType: "LINK",
      parentId: null,
      OR: [{ labelFr: "À propos" }, { href: "/#about" }, { href: "/pages/presentation" }],
    },
  });

  if (!aboutParent) {
    aboutParent = await prisma.navigationItem.create({
      data: {
        labelFr: "À propos",
        labelAr: "من نحن",
        href: "/pages/presentation",
        location: "BOTH",
        itemType: "LINK",
        order: 1,
        exactMatch: false,
        isPublished: true,
        openInNewTab: false,
      },
    });
  } else {
    await prisma.navigationItem.update({
      where: { id: aboutParent.id },
      data: {
        labelFr: "À propos",
        labelAr: "من نحن",
        href: "/pages/presentation",
        isPublished: true,
      },
    });
  }

  await upsertNavChild(aboutParent.id, {
    labelFr: "Présentation",
    labelAr: "العرض",
    href: "/pages/presentation",
    order: 0,
  });
  await upsertNavChild(aboutParent.id, {
    labelFr: "Le mot du directeur",
    labelAr: "كلمة المدير",
    href: "/pages/mot-du-directeur",
    order: 1,
  });
  await upsertNavChild(aboutParent.id, {
    labelFr: "Organigramme",
    labelAr: "الهيكل التنظيمي",
    href: "/pages/organigramme",
    order: 2,
  });
  await upsertNavChild(aboutParent.id, {
    labelFr: "Nador en Chiffres",
    labelAr: "الناظور بالأرقام",
    href: "/pages/nador-en-chiffres",
    order: 3,
  });

  await upsertSitePage("organigramme", {
    titleFr: DEFAULT_ORG_CHART_PAGE.orgChartPageTitleFr,
    titleAr: DEFAULT_ORG_CHART_PAGE.orgChartPageTitleAr,
    excerptFr: DEFAULT_ORG_CHART_PAGE.orgChartPageSubtitleFr,
    excerptAr: DEFAULT_ORG_CHART_PAGE.orgChartPageSubtitleAr,
    contentFr:
      "<p>Consultez la structure organisationnelle du centre sur cette page.</p>",
    contentAr: "<p>اطلعوا على الهيكل التنظيمي للمركز في هذه الصفحة.</p>",
    coverImageUrl: null,
    order: 2,
    isPublished: true,
  });

  await upsertSitePage("nador-en-chiffres", {
    titleFr: DEFAULT_CHIFFRES_PAGE.chiffresPageTitleFr,
    titleAr: DEFAULT_CHIFFRES_PAGE.chiffresPageTitleAr,
    excerptFr: DEFAULT_CHIFFRES_PAGE.chiffresPageSubtitleFr,
    excerptAr: DEFAULT_CHIFFRES_PAGE.chiffresPageSubtitleAr,
    contentFr: "<p>Consultez les chiffres clés du centre sur cette page.</p>",
    contentAr: "<p>اطلعوا على الأرقام الرئيسية للمركز في هذه الصفحة.</p>",
    coverImageUrl: DEFAULT_CHIFFRES_PAGE.chiffresHeroBackgroundUrl,
    order: 3,
    isPublished: true,
  });

  console.log("  ✓ Sous-menu: Présentation, Le mot du directeur, Organigramme, Nador en Chiffres");
}

async function seedContactSubNav() {
  console.log("→ Sous-menu « Contact »");

  const contactParent = await prisma.navigationItem.findFirst({
    where: {
      deletedAt: null,
      itemType: "LINK",
      parentId: null,
      OR: [{ labelFr: "Contact" }, { href: "/contact" }],
    },
  });

  if (!contactParent) {
    console.log("  ↷ Contact introuvable dans le menu");
    return;
  }

  await upsertNavChild(contactParent.id, {
    labelFr: "Réclamation",
    labelAr: "شكاية",
    href: "/contact/reclamation",
    order: 0,
  });

  console.log("  ✓ Sous-menu: Réclamation");
}

async function seedFormationSubNav() {
  console.log("→ Sous-menu « Formations »");

  const formationsParent = await prisma.navigationItem.findFirst({
    where: {
      deletedAt: null,
      itemType: "LINK",
      parentId: null,
      OR: [{ labelFr: "Formations" }, { href: "/formations" }],
    },
  });

  if (!formationsParent) {
    console.log("  ↷ Formations introuvable dans le menu");
    return;
  }

  for (const [order, formation] of FORMATIONS.entries()) {
    await upsertNavChild(formationsParent.id, {
      labelFr: formation.navLabelFr,
      labelAr: formation.navLabelAr,
      href: `/formations/${formation.slug}`,
      order,
    });
  }

  console.log(`  ✓ Sous-menu: ${FORMATIONS.length} formations`);
}

async function seedHeroSlides() {
  console.log("→ Hero slider");

  const { HERO_DEFAULT_SLIDE } = await import("../src/lib/hero-default-content");
  const defaultSlide = { ...HERO_DEFAULT_SLIDE };

  const existing = await prisma.heroSlide.findFirst({
    where: { order: 0, deletedAt: null },
  });

  if (existing) {
    await prisma.heroSlide.update({
      where: { id: existing.id },
      data: omitKeys(defaultSlide, ["imageUrl"]),
    });
  } else {
    await prisma.heroSlide.create({ data: defaultSlide });
  }

  console.log("  ✓ Hero slides");
}

async function seedHomeHighlights() {
  console.log("→ Home highlights band");

  await prisma.homeHighlight.updateMany({
    where: {
      deletedAt: null,
      titleFr: { in: ["Centre De Mdiq", "ITPM de Larache", "Centre De Mehdia"] },
    },
    data: { deletedAt: new Date() },
  });

  const cards = [
    {
      titleFr: "Filière Pêche",
      titleAr: "شعبة الصيد",
      subtitleFr: "Niveau Qualification — Filière Pêche maritime",
      subtitleAr: "مستوى التأهيل — شعبة الصيد البحري",
      backgroundColor: "#5c4d8a",
      imageUrl: "/images/formation-fishing.jpg",
      icon: "ANCHOR" as const,
      href: "/formations",
      order: 0,
    },
    {
      titleFr: "Filière Machine",
      titleAr: "شعبة الميكانيك",
      subtitleFr: "Niveau Qualification — Filière Machine",
      subtitleAr: "مستوى التأهيل — شعبة الميكانيك",
      backgroundColor: "#1e6eb8",
      imageUrl: "/images/formation-mechanics.jpg",
      icon: "SHIP" as const,
      href: "/formations",
      order: 1,
    },
    {
      titleFr: "CQPM Nador",
      titleAr: "المركز بالناظور",
      subtitleFr: "Beni Ensar B.P 697 — Qualification & Spécialisation",
      subtitleAr: "بني نصر ص.ب 697 — التأهيل والتخصص",
      backgroundColor: "#e8751a",
      imageUrl: "/images/about-cqpm-nador.jpg",
      icon: "BUILDING" as const,
      href: "/#about",
      order: 2,
    },
  ];

  for (const card of cards) {
    const existing = await prisma.homeHighlight.findFirst({
      where: { titleFr: card.titleFr, deletedAt: null },
    });
    const data = { ...card, isPublished: true };
    if (existing) {
      await prisma.homeHighlight.update({
        where: { id: existing.id },
        data: omitKeys(data, ["imageUrl"]),
      });
    } else {
      await prisma.homeHighlight.create({ data });
    }
  }

  console.log("  ✓ Home highlights");
}

async function seedHomeFeaturedFormations() {
  console.log("→ Home featured formations");

  const featured = [
    { slug: "qualification-peche-maritime", homeOrder: 0 },
    { slug: "qualification-machine-maritime", homeOrder: 1 },
    { slug: "specialisation-peche-maritime", homeOrder: 2 },
    { slug: "specialisation-machine-maritime", homeOrder: 3 },
  ];

  for (const item of featured) {
    const formation = await prisma.formation.findFirst({
      where: { slug: item.slug, deletedAt: null },
    });
    if (formation) {
      await prisma.formation.update({
        where: { id: formation.id },
        data: { showOnHome: true, homeOrder: item.homeOrder },
      });
      console.log(`  ✓ Featured on home: ${formation.titleFr}`);
    }
  }
}

async function seedHomeEngagement() {
  console.log("→ Home engagement & events");

  const engagementPoints = [
    {
      keywordFr: "Compétence",
      keywordAr: "الكفاءة",
      descriptionFr:
        "Expertise approfondie dans la formation des marins et des professionnels de la mer.",
      descriptionAr: "خبرة عميقة في تكوين البحارة ومهنيي القطاع البحري.",
      order: 0,
    },
    {
      keywordFr: "Adaptabilité",
      keywordAr: "القدرة على التكيف",
      descriptionFr:
        "Programmes évolutifs alignés sur les exigences internationales et locales.",
      descriptionAr: "برامج متطورة وفق المتطلبات الدولية والمحلية.",
      order: 1,
    },
    {
      keywordFr: "Engagement",
      keywordAr: "الالتزام",
      descriptionFr:
        "Accompagnement personnalisé des apprenants tout au long de leur parcours.",
      descriptionAr: "مرافقة شخصية للمتعلمين طوال مسارهم التكويني.",
      order: 2,
    },
    {
      keywordFr: "Sensibilisation",
      keywordAr: "التوعية",
      descriptionFr:
        "Promotion de la sécurité en mer et du respect de l'environnement marin.",
      descriptionAr: "تعزيز السلامة في البحر واحترام البيئة البحرية.",
      order: 3,
    },
    {
      keywordFr: "Accessibilité",
      keywordAr: "الإدماج",
      descriptionFr:
        "Formation ouverte et inclusive pour tous les profils du secteur halieutique.",
      descriptionAr: "تكوين مفتوح وشامل لجميع فئات قطاع الصيد البحري.",
      order: 4,
    },
    {
      keywordFr: "Qualité",
      keywordAr: "الجودة",
      descriptionFr:
        "Excellence pédagogique garantie par des formateurs qualifiés et des infrastructures modernes.",
      descriptionAr: "تميز تربوي بفضل مدربين مؤهلين وبنية تحتية حديثة.",
      order: 5,
    },
  ];

  for (const point of engagementPoints) {
    const existing = await prisma.homeEngagementItem.findFirst({
      where: { keywordFr: point.keywordFr, deletedAt: null },
    });
    if (existing) {
      await prisma.homeEngagementItem.update({ where: { id: existing.id }, data: point });
    } else {
      await prisma.homeEngagementItem.create({ data: { ...point, isPublished: true } });
    }
  }

  console.log("  ✓ Home engagement items");
}

async function seedHomeEvents() {
  console.log("→ Home events");

  const events = [
    {
      titleFr: "Concours d'accès — Qualification Pêche & Machine",
      titleAr: "مباراة الولوج — تأهيل الصيد والميكانيك",
      descriptionFr:
        "Concours annuel organisé par le Département de la Pêche Maritime pour l'accès aux filières Qualification en Pêche et Machine au CQPM Nador.",
      descriptionAr:
        "مباراة سنوية تنظمها مديرية الصيد البحري للولوج إلى شعبتي التأهيل في الصيد والميكانيك بالمركز.",
      eventDate: new Date("2026-07-15T08:00:00Z"),
      imageUrl: "/images/formation-fishing.jpg",
      href: "/admission",
      order: 0,
    },
    {
      titleFr: "Journée portes ouvertes",
      titleAr: "يوم الأبواب المفتوحة",
      descriptionFr:
        "Découvrez nos ateliers, nos formateurs et nos parcours de qualification maritime à Bni Nsser.",
      descriptionAr: "تعرفوا على ورشنا ومدربينا ومسارات التأهيل البحري ببني نصار.",
      eventDate: new Date("2026-09-20T09:00:00Z"),
      imageUrl: "/images/maritime-training.jpg",
      href: "/contact",
      order: 1,
    },
    {
      titleFr: "Formation continue — Sécurité en mer",
      titleAr: "تكوين مستمر — السلامة في البحر",
      descriptionFr: "Session STCW de secourisme et survie en mer pour marins en activité.",
      descriptionAr: "دورة STCW في الإسعاف والنجاة في البحر للبحارة في الخدمة.",
      eventDate: new Date("2026-11-10T08:30:00Z"),
      imageUrl: "/images/formation-safety.jpg",
      href: "/formations",
      order: 2,
    },
  ];

  for (const event of events) {
    const existing = await prisma.homeEvent.findFirst({
      where: { titleFr: event.titleFr, deletedAt: null },
    });
    const data = { ...event, isPublished: true };
    if (existing) {
      await prisma.homeEvent.update({
        where: { id: existing.id },
        data: omitKeys(data, ["imageUrl"]),
      });
    } else {
      await prisma.homeEvent.create({ data });
    }
  }

  console.log("  ✓ Home events");
}

async function seedDownloadResources() {
  console.log("→ Espace téléchargement");

  const items = [
    {
      slug: "avis-concours",
      titleFr: "Avis de Concours",
      titleAr: "إعلان المباراة",
      infoLabelFr: "Dernière mise à jour : 02/06/2024",
      infoLabelAr: "آخر تحديث : 02/06/2024",
      excerptFr: "Avis officiel d'accès aux filières Qualification Pêche et Machine.",
      excerptAr: "الإعلان الرسمي للولوج إلى شعبتي التأهيل في الصيد والميكانيك.",
      contentFr:
        "<p>Consultez l'avis officiel du concours d'accès au CQPM Nador pour les filières Pêche et Machine. Le document détaille les conditions d'admission, les dates clés et les pièces à fournir.</p>",
      contentAr:
        "<p>اطلعوا على الإعلان الرسمي لمباراة الولوج إلى مركز التأهيل المهني البحري بالناظور لشعبتي الصيد والميكانيك.</p>",
      icon: "PDF" as const,
      actionType: "DOWNLOAD" as const,
      fileUrl: null,
      order: 0,
    },
    {
      slug: "resultats-finaux",
      titleFr: "Résultats Finaux",
      titleAr: "النتائج النهائية",
      infoLabelFr: "Session Mai 2024",
      infoLabelAr: "دورة ماي 2024",
      excerptFr: "Résultats définitifs du concours d'accès.",
      excerptAr: "النتائج النهائية لمباراة الولوج.",
      contentFr:
        "<p>Liste des candidats admis au concours d'accès — session Mai 2024. Les lauréats sont invités à compléter leur dossier d'inscription dans les délais indiqués.</p>",
      contentAr: "<p>لائحة المترشحين المقبولين في مباراة الولوج — دورة ماي 2024.</p>",
      icon: "SUCCESS" as const,
      actionType: "VIEW" as const,
      fileUrl: null,
      order: 1,
    },
    {
      slug: "dossier-admission",
      titleFr: "Dossier d'Admission",
      titleAr: "ملف التسجيل",
      infoLabelFr: "Liste des pièces à fournir",
      infoLabelAr: "لائحة الوثائق المطلوبة",
      excerptFr: "Documents requis pour candidater au CQPM Nador.",
      excerptAr: "الوثائق المطلوبة للتقدم إلى المركز.",
      contentFr:
        "<p>Téléchargez la liste complète des pièces à fournir pour votre candidature : copies certifiées, photos, formulaire d'inscription et attestations requises.</p>",
      contentAr: "<p>حمّلوا اللائحة الكاملة للوثائق المطلوبة لملف ترشحكم.</p>",
      icon: "FOLDER" as const,
      actionType: "DOWNLOAD" as const,
      fileUrl: null,
      order: 2,
    },
    {
      slug: "reglement-interieur",
      titleFr: "Règlement Intérieur",
      titleAr: "النظام الداخلي",
      infoLabelFr: "Version 2024/2025",
      infoLabelAr: "النسخة 2024/2025",
      excerptFr: "Règles de vie et d'organisation au centre.",
      excerptAr: "قواعد الحياة والتنظيم داخل المركز.",
      contentFr:
        "<p>Le règlement intérieur du CQPM Nador définit les droits et devoirs des stagiaires, les règles de discipline, de sécurité et d'hygiène applicables au centre.</p>",
      contentAr: "<p>ينظم النظام الداخلي لمركز التأهيل المهني البحري بالناظور حقوق وواجبات المتدربين.</p>",
      icon: "RULES" as const,
      actionType: "VIEW" as const,
      fileUrl: null,
      order: 3,
    },
  ];

  for (const item of items) {
    const existing = await prisma.downloadResource.findFirst({
      where: { slug: item.slug, deletedAt: null },
    });
    const data = { ...item, isPublished: true };
    if (existing) {
      await prisma.downloadResource.update({
        where: { id: existing.id },
        data: omitKeys(data, ["fileUrl"]),
      });
    } else {
      await prisma.downloadResource.create({ data });
    }
  }

  console.log("  ✓ Download resources");
}

async function seedContactFormFields() {
  const existing = await prisma.contactFormField.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log("→ Contact form fields (already configured, skip)");
    return;
  }

  console.log("→ Contact form fields");
  const fields = [
    {
      key: "name",
      type: "TEXT" as const,
      labelFr: "Nom complet",
      labelAr: "الاسم الكامل",
      placeholderFr: "Votre nom",
      placeholderAr: "اسمك",
      isRequired: true,
      width: "half",
      order: 0,
    },
    {
      key: "email",
      type: "EMAIL" as const,
      labelFr: "Email",
      labelAr: "البريد الإلكتروني",
      placeholderFr: "contact@cqpm-nador.ma",
      placeholderAr: "contact@cqpm-nador.ma",
      isRequired: true,
      width: "half",
      order: 1,
    },
    {
      key: "phone",
      type: "TEL" as const,
      labelFr: "Téléphone",
      labelAr: "الهاتف",
      isRequired: false,
      width: "full",
      order: 2,
    },
    {
      key: "subject",
      type: "TEXT" as const,
      labelFr: "Sujet",
      labelAr: "الموضوع",
      isRequired: true,
      width: "full",
      order: 3,
    },
    {
      key: "message",
      type: "TEXTAREA" as const,
      labelFr: "Message",
      labelAr: "الرسالة",
      isRequired: true,
      width: "full",
      order: 4,
    },
    {
      key: "submit",
      type: "SUBMIT_BUTTON" as const,
      labelFr: "Envoyer",
      labelAr: "إرسال",
      buttonStyle: "ocean",
      isRequired: false,
      width: "full",
      order: 5,
    },
  ];

  for (const field of fields) {
    await prisma.contactFormField.create({
      data: {
        ...field,
        isPublished: true,
      },
    });
  }
  console.log("  ✓ Contact form fields");
}

async function seedAdmissionFormFields() {
  const existing = await prisma.admissionFormField.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log("→ Admission form fields (already configured, skip)");
    return;
  }

  console.log("→ Admission form fields");
  const fields = [
    { key: "lastName", type: "TEXT" as const, labelFr: "Nom", labelAr: "الاسم العائلي", isRequired: true, width: "half", order: 0 },
    { key: "firstName", type: "TEXT" as const, labelFr: "Prénom", labelAr: "الاسم الشخصي", isRequired: true, width: "half", order: 1 },
    { key: "cin", type: "TEXT" as const, labelFr: "Numéro CIN", labelAr: "رقم البطاقة الوطنية", isRequired: true, width: "half", order: 2 },
    { key: "birthDate", type: "DATE" as const, labelFr: "Date de naissance", labelAr: "تاريخ الازدياد", isRequired: true, width: "half", order: 3 },
    { key: "gender", type: "GENDER_SELECT" as const, labelFr: "Sexe", labelAr: "الجنس", isRequired: true, width: "half", order: 4, defaultValue: "M" },
    { key: "formationId", type: "FORMATION_SELECT" as const, labelFr: "Formation choisie", labelAr: "التكوين المختار", isRequired: true, width: "half", order: 5 },
    { key: "address", type: "TEXT" as const, labelFr: "Adresse", labelAr: "العنوان", isRequired: true, width: "full", order: 6 },
    { key: "city", type: "TEXT" as const, labelFr: "Ville", labelAr: "المدينة", isRequired: true, width: "half", order: 7 },
    { key: "phone", type: "TEL" as const, labelFr: "Téléphone", labelAr: "الهاتف", isRequired: true, width: "half", order: 8 },
    { key: "email", type: "EMAIL" as const, labelFr: "Email", labelAr: "البريد الإلكتروني", isRequired: true, width: "half", order: 9 },
    { key: "educationLevel", type: "TEXT" as const, labelFr: "Niveau scolaire", labelAr: "المستوى الدراسي", isRequired: true, width: "half", order: 10 },
    { key: "documents_heading", type: "HEADING" as const, labelFr: "Pièces jointes", labelAr: "المرفقات", helpTextFr: "Les documents requis dépendent de la formation choisie.", helpTextAr: "المرفقات المطلوبة تعتمد على التكوين المختار.", isRequired: false, width: "full", order: 11 },
    { key: "submit", type: "SUBMIT_BUTTON" as const, labelFr: "Soumettre la candidature", labelAr: "إرسال الطلب", buttonStyle: "ocean", isRequired: false, width: "full", order: 12 },
  ];

  for (const field of fields) {
    await prisma.admissionFormField.create({ data: { ...field, isPublished: true } });
  }
  console.log("  ✓ Admission form fields");
}

async function seedFormationDocumentRequirements() {
  const existing = await prisma.formationDocumentRequirement.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log("→ Formation documents (already configured, skip)");
    return;
  }

  console.log("→ Formation document requirements");
  const formations = await prisma.formation.findMany({
    where: { deletedAt: null, isPublished: true },
    select: { id: true },
  });

  const templates = [
    { documentKey: "cin", labelFr: "CIN (PDF)", labelAr: "البطاقة الوطنية (PDF)", hintFr: "PDF, max. 8 Mo", hintAr: "PDF، 8 م.ب كحد أقصى", acceptTypes: "pdf", maxSizeMb: 8, order: 0 },
    { documentKey: "diploma", labelFr: "Diplôme / attestation", labelAr: "الشهادة / الإشهاد", hintFr: "PDF, max. 8 Mo", hintAr: "PDF، 8 م.ب كحد أقصى", acceptTypes: "pdf", maxSizeMb: 8, order: 1 },
    { documentKey: "photo", labelFr: "Photo d'identité", labelAr: "صورة شخصية", hintFr: "JPG ou PNG, max. 4 Mo", hintAr: "JPG أو PNG، 4 م.ب كحد أقصى", acceptTypes: "image", maxSizeMb: 4, order: 2 },
  ];

  for (const formation of formations) {
    for (const tpl of templates) {
      await prisma.formationDocumentRequirement.create({
        data: { formationId: formation.id, ...tpl, isRequired: true },
      });
    }
  }
  console.log("  ✓ Formation document requirements");
}

async function seedOrgChart() {
  console.log("→ Organigramme");

  const existing = await prisma.orgChartNode.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log("  ↷ Postes déjà présents — skip");
    return;
  }

  const idByKey = new Map<string, string>();

  for (const node of DEFAULT_ORG_CHART_NODES) {
    const created = await prisma.orgChartNode.create({
      data: {
        titleFr: node.titleFr,
        titleAr: node.titleAr,
        parentId: node.parentKey ? idByKey.get(node.parentKey) ?? null : null,
        style: node.style,
        accent: node.accent ?? "NONE",
        icon: node.icon ?? "USER",
        order: node.order,
        isPublished: true,
      },
    });
    idByKey.set(node.key, created.id);
  }

  console.log(`  ✓ ${DEFAULT_ORG_CHART_NODES.length} postes organigramme`);
}

async function seedChiffresPage() {
  console.log("→ Nador en Chiffres");

  const existing = await prisma.chiffresHighlight.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log("  ↷ Chiffres déjà présents — skip");
    return;
  }

  for (const item of DEFAULT_CHIFFRES_HIGHLIGHTS) {
    await prisma.chiffresHighlight.create({
      data: { ...item, isPublished: true },
    });
  }
  for (const item of DEFAULT_CHIFFRES_GROWTH_BARS) {
    await prisma.chiffresGrowthBar.create({ data: item });
  }
  for (const item of DEFAULT_CHIFFRES_FORMATION_ITEMS) {
    await prisma.chiffresFormationItem.create({
      data: { ...item, isPublished: true },
    });
  }
  for (const item of DEFAULT_CHIFFRES_INFRASTRUCTURE_ITEMS) {
    await prisma.chiffresInfrastructureItem.create({
      data: { ...item, isPublished: true },
    });
  }

  console.log(
    `  ✓ ${DEFAULT_CHIFFRES_HIGHLIGHTS.length} chiffres, ${DEFAULT_CHIFFRES_GROWTH_BARS.length} barres, ${DEFAULT_CHIFFRES_FORMATION_ITEMS.length} formation, ${DEFAULT_CHIFFRES_INFRASTRUCTURE_ITEMS.length} infra`
  );
}

async function main() {
  console.log("\n🌊 CQPM Nador — Database seed\n");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  await cleanupLegacyTestData();
  await seedRolesAndUsers(passwordHash);
  await seedSiteSettings();
  await seedSiteStatsAndSocialLinks();
  await seedFormationCategoriesAndFormations();
  await seedNavigation();
  await seedAboutSectionPagesAndNav();
  await seedContactSubNav();
  await seedFormationSubNav();
  await seedOrgChart();
  await seedChiffresPage();
  await seedHeroSlides();
  await seedHomeHighlights();
  await seedHomeFeaturedFormations();
  await seedHomeEngagement();
  await seedHomeEvents();
  await seedDownloadResources();
  await seedContactFormFields();
  await seedAdmissionFormFields();
  await seedFormationDocumentRequirements();

  const superAdmin = await prisma.user.findFirst({
    where: { email: "admin@cqpm-nador.ma", deletedAt: null },
  });
  if (superAdmin) {
    await seedCqpmPublicContent(superAdmin.id);
  }

  console.log("\n✅ Seed completed.\n");
  console.log("Staff accounts (password for all):", DEFAULT_PASSWORD);
  console.log("  SUPER_ADMIN  admin@cqpm-nador.ma");
  console.log("  ADMIN        administration@cqpm-nador.ma");
  console.log("  EDITOR       redaction@cqpm-nador.ma");
  console.log("\n⚠️  Change passwords before production.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
