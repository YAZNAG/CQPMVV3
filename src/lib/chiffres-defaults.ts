import type { ChiffresInfraStyle, SiteStatIcon } from "@prisma/client";
import { SITE_IMAGES } from "@/lib/site-images";

export type ChiffresHighlightSeed = {
  labelFr: string;
  labelAr: string;
  value: number;
  suffix?: string;
  icon: SiteStatIcon;
  order: number;
};

export type ChiffresGrowthBarSeed = {
  labelFr: string;
  labelAr: string;
  value: number;
  order: number;
};

export type ChiffresFormationItemSeed = {
  labelFr: string;
  labelAr: string;
  valueText: string;
  icon: SiteStatIcon;
  order: number;
};

export type ChiffresInfrastructureItemSeed = {
  labelFr: string;
  labelAr: string;
  valueText: string;
  icon: SiteStatIcon;
  style: ChiffresInfraStyle;
  order: number;
};

export const DEFAULT_CHIFFRES_HIGHLIGHTS: ChiffresHighlightSeed[] = [
  {
    labelFr: "Diplômés",
    labelAr: "متخرجون",
    value: 1500,
    suffix: "+",
    icon: "GRADUATION_CAP",
    order: 0,
  },
  {
    labelFr: "Taux d'insertion",
    labelAr: "معدل الإدماج",
    value: 85,
    suffix: "%",
    icon: "AWARD",
    order: 1,
  },
  {
    labelFr: "Filières",
    labelAr: "شعب",
    value: 6,
    suffix: "+",
    icon: "STAR",
    order: 2,
  },
  {
    labelFr: "Années d'expérience",
    labelAr: "سنوات الخبرة",
    value: 20,
    suffix: "+",
    icon: "CALENDAR",
    order: 3,
  },
  {
    labelFr: "Stagiaires / an",
    labelAr: "متدربون / سنة",
    value: 300,
    suffix: "+",
    icon: "USERS",
    order: 4,
  },
  {
    labelFr: "Partenaires",
    labelAr: "شركاء",
    value: 50,
    suffix: "+",
    icon: "HANDSHAKE",
    order: 5,
  },
];

export const DEFAULT_CHIFFRES_GROWTH_BARS: ChiffresGrowthBarSeed[] = [
  { labelFr: "2019", labelAr: "2019", value: 180, order: 0 },
  { labelFr: "2020", labelAr: "2020", value: 220, order: 1 },
  { labelFr: "2021", labelAr: "2021", value: 260, order: 2 },
  { labelFr: "2022", labelAr: "2022", value: 300, order: 3 },
  { labelFr: "2023", labelAr: "2023", value: 350, order: 4 },
];

export const DEFAULT_CHIFFRES_FORMATION_ITEMS: ChiffresFormationItemSeed[] = [
  {
    labelFr: "Filières actives",
    labelAr: "شعب نشطة",
    valueText: "6",
    icon: "STAR",
    order: 0,
  },
  {
    labelFr: "Formateurs experts",
    labelAr: "مدربون خبراء",
    valueText: "40+",
    icon: "USERS",
    order: 1,
  },
  {
    labelFr: "Stagiaires simultanés",
    labelAr: "متدربون في آن واحد",
    valueText: "300+",
    icon: "GRADUATION_CAP",
    order: 2,
  },
  {
    labelFr: "Heures de formation / an",
    labelAr: "ساعات تكوين / سنة",
    valueText: "12 000+",
    icon: "CALENDAR",
    order: 3,
  },
];

export const DEFAULT_CHIFFRES_INFRASTRUCTURE_ITEMS: ChiffresInfrastructureItemSeed[] = [
  {
    labelFr: "Salles de cours",
    labelAr: "قاعات دراسية",
    valueText: "12",
    icon: "BUILDING",
    style: "NAVY",
    order: 0,
  },
  {
    labelFr: "Ateliers",
    labelAr: "ورشات",
    valueText: "4",
    icon: "BUILDING",
    style: "GREY",
    order: 1,
  },
  {
    labelFr: "Laboratoires",
    labelAr: "مختبرات",
    valueText: "3",
    icon: "AWARD",
    style: "OCEAN",
    order: 2,
  },
  {
    labelFr: "Équipements",
    labelAr: "معدات",
    valueText: "100+",
    icon: "STAR",
    style: "LIGHT",
    order: 3,
  },
];

export const DEFAULT_CHIFFRES_PAGE = {
  chiffresPageTitleFr: "CQPM Nador en Chiffres",
  chiffresPageTitleAr: "الناظور بالأرقام",
  chiffresPageSubtitleFr:
    "Découvrez les chiffres clés qui illustrent le développement, la qualité et la performance du CQPM Nador.",
  chiffresPageSubtitleAr:
    "اكتشفوا الأرقام الرئيسية التي توضح تطور وجودة وأداء مركز التأهيل المهني البحري بالناظور.",
  chiffresHeroBackgroundUrl: SITE_IMAGES.about,
  chiffresPublished: true,
  chiffresEvolutionTitleFr: "Évolution et Croissance",
  chiffresEvolutionTitleAr: "التطور والنمو",
  chiffresEvolutionSubtitleFr:
    "Une dynamique de croissance continue au service de la formation maritime.",
  chiffresEvolutionSubtitleAr: "دينامية نمو مستمرة في خدمة التكوين البحري.",
  chiffresGrowthChartTitleFr: "Croissance des Effectifs",
  chiffresGrowthChartTitleAr: "نمو الأعداد",
  chiffresSuccessChartTitleFr: "Taux de Réussite Annuel",
  chiffresSuccessChartTitleAr: "معدل النجاح السنوي",
  chiffresSuccessRateValue: 92,
  chiffresSuccessRateLabelFr: "Moyenne sur 5 ans",
  chiffresSuccessRateLabelAr: "متوسط على 5 سنوات",
  chiffresCapacityTitleFr: "Capacités & Infrastructure",
  chiffresCapacityTitleAr: "القدرات والبنية التحتية",
  chiffresFormationColumnTitleFr: "Formation",
  chiffresFormationColumnTitleAr: "التكوين",
  chiffresInfrastructureColumnTitleFr: "Infrastructure",
  chiffresInfrastructureColumnTitleAr: "البنية التحتية",
  chiffresCtaTitleFr: "Rejoignez un centre de formation performant.",
  chiffresCtaTitleAr: "انضموا إلى مركز تكوين فعّال.",
  chiffresCtaTextFr:
    "Le CQPM Nador vous accompagne vers l'excellence professionnelle maritime avec des parcours certifiés et un encadrement de qualité.",
  chiffresCtaTextAr:
    "يرافقكم مركز الناظور نحو التميز المهني البحري عبر مسارات معتمدة وتأطير عالي الجودة.",
  chiffresCtaPrimaryLabelFr: "Voir les formations",
  chiffresCtaPrimaryLabelAr: "عرض التكوينات",
  chiffresCtaPrimaryHref: "/formations",
  chiffresCtaSecondaryLabelFr: "S'inscrire maintenant",
  chiffresCtaSecondaryLabelAr: "التسجيل الآن",
  chiffresCtaSecondaryHref: "/admission",
} as const;
