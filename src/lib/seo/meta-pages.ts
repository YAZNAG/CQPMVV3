import type { Locale } from "@/types";

export type SeoPageKey =
  | "home"
  | "about"
  | "formations"
  | "admission"
  | "news"
  | "gallery"
  | "blog"
  | "events"
  | "contact";

type PageMeta = { title: string; description: string; keywords?: string[] };

const PAGES: Record<SeoPageKey, Record<Locale, PageMeta>> = {
  home: {
    fr: {
      title: "Accueil",
      description:
        "CQPM Nador — Centre de Qualification Professionnelle Maritime. Formations, inscriptions en ligne et excellence dans les métiers de la mer.",
      keywords: ["accueil", "centre maritime Nador"],
    },
    ar: {
      title: "الرئيسية",
      description:
        "مركز التأهيل المهني البحري بالناظور — تكوينات مهنية في مجال الصيد البحري والتأهيل المهني.",
      keywords: ["الرئيسية", "تكوين بحري الناظور"],
    },
  },
  about: {
    fr: {
      title: "À propos",
      description:
        "Découvrez le CQPM Nador : historique, mission, vision et valeurs au service de la formation maritime au Maroc.",
    },
    ar: {
      title: "من نحن",
      description:
        "تعرف على مركز التأهيل المهني البحري بالناظور: التاريخ، المهمة، الرؤية والقيم.",
    },
  },
  formations: {
    fr: {
      title: "Formations",
      description:
        "Catalogue des formations maritimes du CQPM Nador : qualification, spécialisation et formation continue.",
      keywords: ["formations maritimes", "programmes CQPM"],
    },
    ar: {
      title: "التكوينات",
      description:
        "برامج التكوين المهني البحري في مركز الناظور: التأهيل والتخصص والتكوين المستمر.",
    },
  },
  admission: {
    fr: {
      title: "Inscriptions",
      description:
        "Candidatez en ligne au CQPM Nador et suivez l'état de votre dossier d'inscription.",
      keywords: ["inscription en ligne", "candidature CQPM"],
    },
    ar: {
      title: "التسجيل",
      description:
        "سجّل عبر الإنترنت في مركز الناظور وتابع حالة ملف ترشيحك.",
    },
  },
  news: {
    fr: {
      title: "Actualités",
      description:
        "Annonces, événements et nouvelles du Centre de Qualification Professionnelle Maritime de Nador.",
    },
    ar: {
      title: "الأخبار",
      description:
        "إعلانات وأنشطة وأخبار مركز التأهيل المهني البحري بالناظور.",
    },
  },
  gallery: {
    fr: {
      title: "Galerie",
      description:
        "Photos et vidéos des infrastructures, activités et vie au centre CQPM Nador.",
    },
    ar: {
      title: "المعرض",
      description:
        "صور وفيديوهات عن مرافق المركز وأنشطته بالناظور.",
    },
  },
  blog: {
    fr: {
      title: "Blog",
      description:
        "Articles et publications du Centre de Qualification Professionnelle Maritime de Nador.",
    },
    ar: {
      title: "المدونة",
      description:
        "مقالات ومنشورات مركز التأهيل المهني البحري بالناظور.",
    },
  },
  events: {
    fr: {
      title: "Événements",
      description:
        "Agenda des événements et activités du CQPM Nador.",
    },
    ar: {
      title: "الفعاليات",
      description:
        "أجندة فعاليات وأنشطة مركز التأهيل المهني البحري بالناظور.",
    },
  },
  contact: {
    fr: {
      title: "Contact",
      description:
        "Contactez le CQPM Nador : coordonnées, horaires et formulaire de message.",
      keywords: ["contact CQPM", "Nador"],
    },
    ar: {
      title: "اتصل بنا",
      description:
        "تواصل مع مركز التأهيل المهني البحري بالناظور: معلومات الاتصال ونموذج المراسلة.",
    },
  },
};

export function getPageMeta(locale: Locale, page: SeoPageKey): PageMeta {
  return PAGES[page][locale];
}
