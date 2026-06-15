import type { Locale } from "@/types";

export const PRESENTATION_MISSION_TITLES = {
  fr: ["Former", "Accompagner", "Développer", "Répondre"],
  ar: ["التكوين", "المرافقة", "التطوير", "الاستجابة"],
} as const;

export const PRESENTATION_VALUE_DESCRIPTIONS = {
  fr: [
    "Des programmes exigeants et des formateurs certifiés pour garantir la qualité pédagogique.",
    "La rigueur et la discipline au cœur de chaque parcours de formation maritime.",
    "Des équipements modernes et des méthodes pédagogiques adaptées au secteur.",
    "Un encadrement expérimenté et une approche centrée sur l'apprenant.",
    "L'honnêteté, la transparence et le respect des normes professionnelles.",
    "Le respect des personnes, de l'environnement marin et des traditions maritimes.",
  ],
  ar: [
    "برامج صارمة ومكونون معتمدون لضمان الجودة التربوية.",
    "الانضباط والصرامة في قلب كل مسار تكوين بحري.",
    "معدات حديثة وأساليب تربوية ملائمة للقطاع.",
    "تأطير ذو خبرة ونهج يركز على المتعلم.",
    "النزاهة والشفافية واحترام المعايير المهنية.",
    "احترام الأشخاص والبيئة البحرية والتقاليد البحرية.",
  ],
} as const;

export const PRESENTATION_WHY_CHOOSE = {
  fr: [
    {
      title: "Certifications reconnues",
      description:
        "Des parcours alignés sur les exigences du Département de la Pêche Maritime et les standards internationaux.",
    },
    {
      title: "Encadrement expert",
      description:
        "Une équipe pédagogique qualifiée, issue du secteur maritime, pour un apprentissage concret et rigoureux.",
    },
    {
      title: "Infrastructures modernes",
      description:
        "Ateliers, simulateurs et moyens pédagogiques adaptés aux filières Pêche et Machine.",
    },
    {
      title: "Employabilité",
      description:
        "Des compétences recherchées par les armateurs et les entreprises du secteur halieutique.",
    },
    {
      title: "Proximité & accompagnement",
      description:
        "Un centre ancré à Bni Nsser, au service des professionnels de la mer de la région de l'Oriental.",
    },
  ],
  ar: [
    {
      title: "شواهد معترف بها",
      description: "مسارات متوافقة مع متطلبات مديرية الصيد البحري والمعايير الدولية.",
    },
    {
      title: "تأطير خبير",
      description: "فريق تربوي مؤهل من القطاع البحري لتعلم عملي ودقيق.",
    },
    {
      title: "بنيات تحتية حديثة",
      description: "ورشات ومحاكيات ووسائل تربوية ملائمة لشعبتي الصيد والميكانيك.",
    },
    {
      title: "قابلية التشغيل",
      description: "كفاءات مطلوبة من طرف armateurs وشركات القطاع البحري.",
    },
    {
      title: "القرب والمرافقة",
      description: "مركز متجذر في بني نصار، في خدمة مهنيي البحر بجهة الشرق.",
    },
  ],
} as const;

export const PRESENTATION_LABELS = {
  fr: {
    heroTitle: "Présentation du Centre",
    heroSubtitle:
      "CQPM Nador — Beni Ensar. Deux niveaux de formation (Qualification et Spécialisation) en filières Pêche maritime et Machine.",
    aboutLabel: "Présentation générale",
    aboutTitle: "Centre de Qualification Professionnelle Maritime de Nador",
    valuesTitle: "Nos Valeurs Fondamentales",
    valuesSubtitle: "L'éthique et la rigueur au cœur de notre réussite.",
    missionsTitle: "Missions du centre",
    whyChooseTitle: "Pourquoi choisir CQPM Nador ?",
    domainsTitle: "Domaines de Formation",
    lifeTitle: "Vie au Centre",
    partnersLabel: "Ils nous font confiance",
    ctaTitle: "Prêt à embarquer pour votre futur ?",
    ctaSubtitle:
      "Rejoignez le CQPM Nador et transformez votre passion pour la mer en une carrière d'excellence.",
    ctaPrimary: "S'inscrire maintenant",
    ctaSecondary: "Nous contacter",
    readMore: "En savoir plus",
  },
  ar: {
    heroTitle: "عرض المركز",
    heroSubtitle:
      "مركز التأهيل المهني البحري بالناظور — بني نصر. مستويان (التأهيل والتخصص) في شعبتي الصيد البحري والميكانيك.",
    aboutLabel: "عرض عام",
    aboutTitle: "مركز التأهيل المهني البحري بالناظور",
    valuesTitle: "قيمنا الأساسية",
    valuesSubtitle: "الأخلاق والصرامة في قلب نجاحنا.",
    missionsTitle: "مهام المركز",
    whyChooseTitle: "لماذا CQPM الناظور؟",
    domainsTitle: "مجالات التكوين",
    lifeTitle: "الحياة في المركز",
    partnersLabel: "يثقون بنا",
    ctaTitle: "مستعدون للانطلاق نحو مستقبلكم؟",
    ctaSubtitle: "انضموا إلى مركز التأهيل المهني البحري بالناظور وحولوا شغفكم بالبحر إلى مسار مهني.",
    ctaPrimary: "التسجيل الآن",
    ctaSecondary: "اتصلوا بنا",
    readMore: "المزيد",
  },
} as const;

export function presentationLabels(locale: Locale) {
  return locale === "ar" ? PRESENTATION_LABELS.ar : PRESENTATION_LABELS.fr;
}

export function presentationWhyChoose(locale: Locale) {
  return locale === "ar" ? PRESENTATION_WHY_CHOOSE.ar : PRESENTATION_WHY_CHOOSE.fr;
}

export function presentationMissionTitles(locale: Locale) {
  return locale === "ar" ? PRESENTATION_MISSION_TITLES.ar : PRESENTATION_MISSION_TITLES.fr;
}

export function presentationValueDescriptions(locale: Locale) {
  return locale === "ar" ? PRESENTATION_VALUE_DESCRIPTIONS.ar : PRESENTATION_VALUE_DESCRIPTIONS.fr;
}
