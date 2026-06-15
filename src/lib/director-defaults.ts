import type { Locale } from "@/types";

export const DIRECTOR_DEFAULT_NAME = {
  fr: "Hassan Benaissa",
  ar: "حسن بن عيسى",
} as const;

export const DIRECTOR_DEFAULT_TITLE = {
  fr: "Docteur en écologie aquatique – Capitaine de pêche – Lauréat de l'Institut Supérieur des Pêches Maritimes",
  ar: "دكتور في البيئة المائية – ربان صيد – خريج المعهد العالي للصيد البحري",
} as const;

export const DIRECTOR_DEFAULT_BODY = {
  fr: `Le Centre de Qualification Professionnelle Maritime de Nador (CQPM Nador) s'inscrit dans une dynamique nationale visant à structurer, professionnaliser et valoriser les métiers de la mer, piliers essentiels de l'économie maritime et du développement durable de notre littoral.

En ma qualité de directeur du centre, je tiens à rappeler que les grands marins, les navigateurs expérimentés ainsi que les mécaniciens navals hautement qualifiés que nous connaissons aujourd'hui ont, pour la majorité, débuté leur parcours dans des centres de formation similaires au nôtre. Ils ont été, à leurs premiers pas, des étudiants en apprentissage, formés aux fondamentaux de la navigation, de la machine et de la vie en mer.

Le rôle fondamental du CQPM Nador est précisément celui-ci : préparer des hommes et des femmes de mer compétents, disciplinés et opérationnels, quel que soit leur niveau initial, afin de les intégrer efficacement dans les différents segments du secteur maritime, de la pêche artisanale aux unités industrielles.

Notre mission dépasse toutefois la simple transmission de compétences techniques. Elle intègre une vision stratégique et responsable du métier maritime. Nous formons des professionnels conscients que la mer n'est pas seulement un espace de travail, mais un patrimoine naturel fragile, dont l'exploitation doit être rationnelle, maîtrisée et respectueuse des équilibres écologiques.

Dans ce sens, nous affirmons avec force que la performance maritime ne peut être dissociée de la durabilité des ressources halieutiques, ni de la préservation des écosystèmes marins pour les générations futures. Chaque marin formé au sein de notre établissement est appelé à devenir un acteur responsable, conscient que la mer doit être protégée autant qu'elle est exploitée.

Ainsi, le CQPM Nador se positionne comme un espace d'excellence, de discipline et de citoyenneté maritime, contribuant à former une nouvelle génération de professionnels capables de relever les défis de la modernisation du secteur tout en respectant les engagements environnementaux du Royaume.`,
  ar: `يندرج مركز التأهيل المهني البحري بالناظور (CQPM Nador) في دينامية وطنية تهدف إلى هيكلة وتأهيل وت valorisation مهن البحر، الركائز الأساسية للاقتصاد البحري والتنمية المستدامة لساحلنا.

بصفتي مدير المركز، أؤكد أن كبار البحارة والملاحين والميكانiciens البحريين المؤهلين بدؤوا غالباً مسارهم في مراكز تكوين مماثلة، كمتدربين في التخصص على أساسيات الملاحة والميكانيك والحياة في البحر.

دور CQPM Nador هو إعداد رجال ونساء البحر كفؤاء ومنضبطين، لإدماجهم في مختلف فروع القطاع البحري، من الصيد التقليدي إلى الوحدات الصناعية.

تتجاوز مهمتنا نقل المهارات التقنية، فتتضمن رؤية مسؤولة للمهنة البحرية وحماية البحر كتراث طبيعي يجب استغلاله بعقلانية واحترام التوازنات البيئية.

نؤكد أن الأداء البحري مرتبط باستدامة الموارد السمكية وحفظ النظم البيئية البحرية. كل متخرج من مركزنا مدعو ليكون فاعلاً مسؤولاً يحمي البحر بقدر ما يستغله.

وهكذا يضع المركز نفسه كفضاء للتميز والانضباط والمواطنة البحرية، لتكوين جيل جديد قادر على مواجهة تحديات القطاع مع احترام التزامات المملكة البيئية.`,
} as const;

export function splitDirectorParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

export function defaultDirectorBody(locale: Locale): string {
  return locale === "ar" ? DIRECTOR_DEFAULT_BODY.ar : DIRECTOR_DEFAULT_BODY.fr;
}

export function defaultDirectorQuote(locale: Locale): string {
  return splitDirectorParagraphs(defaultDirectorBody(locale))[0] ?? "";
}

export function defaultDirectorName(locale: Locale): string {
  return locale === "ar" ? DIRECTOR_DEFAULT_NAME.ar : DIRECTOR_DEFAULT_NAME.fr;
}

export function defaultDirectorTitle(locale: Locale): string {
  return locale === "ar" ? DIRECTOR_DEFAULT_TITLE.ar : DIRECTOR_DEFAULT_TITLE.fr;
}
