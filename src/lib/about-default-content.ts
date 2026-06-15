export const ABOUT_PRESENTATION_PARAGRAPH_1 = {
  fr: "Le Centre de Qualification Professionnelle Maritime de Nador (CQPM Nador) est un établissement public relevant du Département de la Pêche Maritime. Il est dédié à la formation professionnelle dans les métiers de la mer, notamment la pêche maritime et la filière Machine (mécanique navale).",
  ar: "مركز التأهيل المهني البحري بالناظور (CQPM Nador) مؤسسة عمومية ترتبط بمديرية الصيد البحري. يكرّس المركز جهوده للتكوين المهني في مهن البحر، لا سيما الصيد البحري وشعبة الميكانيك (الميكانيك البحري).",
} as const;

export const ABOUT_PRESENTATION_PARAGRAPH_2 = {
  fr: "Le centre fait partie d'un réseau national de centres de formation maritime répartis sur les principales zones côtières du Maroc.",
  ar: "ينتمي المركز إلى شبكة وطنية من مراكز التكوين البحري المنتشرة على السواحل الرئيسية للمغرب.",
} as const;

export const ABOUT_MISSIONS = {
  fr: [
    "Former des professionnels qualifiés dans le domaine de la pêche maritime",
    "Développer les compétences techniques des jeunes dans les métiers de la mer",
    "Préparer à l'insertion professionnelle dans le secteur maritime",
    "Renforcer la sécurité et la culture maritime",
    "Accompagner les évolutions du secteur halieutique marocain",
  ],
  ar: [
    "تكوين مهنيين مؤهلين في مجال الصيد البحري",
    "تطوير الكفاءات التقنية للشباب في مهن البحر",
    "التحضير للإدماج المهني في القطاع البحري",
    "تعزيز السلامة والثقافة البحرية",
    "مرافقة تطورات القطاع الصيدي المغربي",
  ],
} as const;

export function aboutPresentationParagraph1(locale: "fr" | "ar") {
  return ABOUT_PRESENTATION_PARAGRAPH_1[locale];
}

export function aboutPresentationParagraph2(locale: "fr" | "ar") {
  return ABOUT_PRESENTATION_PARAGRAPH_2[locale];
}

export function aboutMissionsText(locale: "fr" | "ar") {
  return ABOUT_MISSIONS[locale].join("\n");
}

export function aboutPresentationParagraphs(locale: "fr" | "ar") {
  return [aboutPresentationParagraph1(locale), aboutPresentationParagraph2(locale)];
}
