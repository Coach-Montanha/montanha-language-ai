import { SupportedLanguage } from "@/types/language";

export interface PhonemeFamily {
  id: string;
  symbol: string;
  namePt: string;
  descriptionPt: string;
  language: SupportedLanguage;
  sampleWords: string[];
  testPattern: RegExp;
}

export interface PhonemeDiagnosticResult {
  family: PhonemeFamily;
  totalAttempts: number;
  successfulAttempts: number;
  accuracyPercent: number;
  status: "mastered" | "improving" | "needs_practice";
}

export const PHONEME_CATALOG: Record<SupportedLanguage, PhonemeFamily[]> = {
  en: [
    {
      id: "en-th",
      symbol: "θ / ð",
      namePt: "Sons do 'TH' (Língua entre dentes)",
      descriptionPt: "Diferenciação entre 'think' (sem voz) e 'this/that' (com vibração).",
      language: "en",
      sampleWords: ["think", "this", "mother", "birthday", "through"],
      testPattern: /\b\w*th\w*\b/i,
    },
    {
      id: "en-r",
      symbol: "ɹ (R Americano)",
      namePt: "R Retroflexo",
      descriptionPt: "A ponta da língua curva para trás sem tocar o céu da boca.",
      language: "en",
      sampleWords: ["right", "world", "girl", "water", "restaurant"],
      testPattern: /\b\w*r\w*\b/i,
    },
    {
      id: "en-vowels",
      symbol: "ɪ vs iː",
      namePt: "Vogais Curtas vs Longas",
      descriptionPt: "Diferenciação entre 'ship' (curto) e 'sheep' (longo).",
      language: "en",
      sampleWords: ["ship", "sheep", "live", "leave", "fit", "feet"],
      testPattern: /\b(ship|sheep|live|leave|fit|feet|sit|seat)\b/i,
    },
    {
      id: "en-dark-l",
      symbol: "ɫ (Dark L)",
      namePt: "L Velarizado Final",
      descriptionPt: "Som escuro do L no fim de sílaba, como em 'milk' ou 'ball'.",
      language: "en",
      sampleWords: ["milk", "ball", "people", "hotel", "table"],
      testPattern: /\b\w+l(e|k|d)?\b/i,
    },
  ],
  ru: [
    {
      id: "ru-y",
      symbol: "Ы",
      namePt: "Vogal Central Posterior 'Ы'",
      descriptionPt: "Produzido recuando o dorso da língua, sem bico nos lábios.",
      language: "ru",
      sampleWords: ["быть", "ты", "мы", "вы", "рыба", "сыр"],
      testPattern: /[ыЫ]/,
    },
    {
      id: "ru-shch",
      symbol: "Щ vs Ш",
      namePt: "Sibilantes Suaves vs Duras",
      descriptionPt: "Diferença entre o 'Ш' duro e o 'Щ' suave e prolongado.",
      language: "ru",
      sampleWords: ["борщ", "хорошо", "ещё", "женщина", "машина"],
      testPattern: /[щЩшШжЖ]/,
    },
    {
      id: "ru-soft",
      symbol: "Ь (Sinal Brando)",
      namePt: "Palatalização de Consoantes",
      descriptionPt: "Consoantes suavizadas pela aproximação da língua ao palato.",
      language: "ru",
      sampleWords: ["день", "мать", "любовь", "очень", "говорить"],
      testPattern: /[ьЬ]/,
    },
  ],
  fr: [
    {
      id: "fr-r",
      symbol: "ʁ (R Gútural)",
      namePt: "R Uvular Francês",
      descriptionPt: "Produzido no fundo da garganta, vibrando suavemente a úvula.",
      language: "fr",
      sampleWords: ["merci", "croissant", "bonjour", "paris", "très"],
      testPattern: /[rR]/,
    },
    {
      id: "fr-nasal",
      symbol: "ɑ̃ / ɔ̃ / ɛ̃",
      namePt: "Vogais Nasais",
      descriptionPt: "O ar ressoa pelo nariz sem pronunciar a consoante N final.",
      language: "fr",
      sampleWords: ["bonjour", "temps", "vin", "maison", "pain"],
      testPattern: /(an|en|in|on|un|ain|ein)/i,
    },
    {
      id: "fr-u",
      symbol: "y (U Francês)",
      namePt: "Vogal 'U' Fechada",
      descriptionPt: "Lábios em posição de 'U' mas emitindo som de 'I'.",
      language: "fr",
      sampleWords: ["tu", "salut", "musique", "rue", "lune"],
      testPattern: /[uU]/,
    },
  ],
  es: [
    {
      id: "es-rr",
      symbol: "r (Vibrante Múltipla)",
      namePt: "R Vibrado (RR)",
      descriptionPt: "Vibração vigorosa da ponta da língua contra os alvéolos.",
      language: "es",
      sampleWords: ["perro", "arriba", "carro", "rápido", "ferrocarril"],
      testPattern: /(rr|^r)/i,
    },
    {
      id: "es-j",
      symbol: "x (J / G Espanhol)",
      namePt: "Som Fricativo Velar",
      descriptionPt: "Som raspado no fundo da garganta como em 'jamón' e 'gente'.",
      language: "es",
      sampleWords: ["jamón", "gente", "rojo", "trabajo", "viaje"],
      testPattern: /[jJ]|g[eEiI]/,
    },
  ],
  de: [
    {
      id: "de-ch",
      symbol: "ç / x (CH Alemão)",
      namePt: "Ich-Laut & Ach-Laut",
      descriptionPt: "Sopro suave no palato ('ich') ou raspado na garganta ('Bach').",
      language: "de",
      sampleWords: ["ich", "nicht", "auch", "buch", "sprechen"],
      testPattern: /ch/i,
    },
    {
      id: "de-umlaut",
      symbol: "ä / ö / ü",
      namePt: "Vogais com Trema (Umlaut)",
      descriptionPt: "Alteração de timbre vocal de fundamental importância.",
      language: "de",
      sampleWords: ["schön", "für", "männer", "öffnen", "können"],
      testPattern: /[äöüÄÖÜ]/,
    },
  ],
  it: [
    {
      id: "it-gli",
      symbol: "ʎ (GLI Italiano)",
      namePt: "Som Palatal 'GLI'",
      descriptionPt: "Semelhante ao 'LH' do português, mas mais estalado e suave.",
      language: "it",
      sampleWords: ["famiglia", "figlio", "bottiglia", "meglio", "voglio"],
      testPattern: /gli/i,
    },
    {
      id: "it-double",
      symbol: "C: (Consoantes Duplas)",
      namePt: "Geminação Consonantal",
      descriptionPt: "Pausa tensa na consoante dupla que altera o sentido da palavra.",
      language: "it",
      sampleWords: ["notte", "bella", "pizza", "fratello", "caffè"],
      testPattern: /([bcdfghlmnpqrstvz])\1/i,
    },
  ],
  ja: [
    {
      id: "ja-r",
      symbol: "ɾ (R / L Japonês)",
      namePt: "Toque Alveolar R/L",
      descriptionPt: "Toque rápido da ponta da língua, intermediário entre R e L.",
      language: "ja",
      sampleWords: ["arigatou", "sayonara", "kore", "ramen", "nihon"],
      testPattern: /(ra|ri|ru|re|ro|[らりるれろラリルレロ])/i,
    },
    {
      id: "ja-tsu",
      symbol: "ts / っ",
      namePt: "Tsu & Pausa Curta (Sokuon)",
      descriptionPt: "Pronúncia do 'TS' e pequenas paradas glotais marcadas por 'っ'.",
      language: "ja",
      sampleWords: ["tsunami", "motto", "chotto", "kitte", "gakko"],
      testPattern: /(tsu|っ|[つツ])/i,
    },
  ],
  "el-koine": [
    {
      id: "el-theta",
      symbol: "θ (Theta)",
      namePt: "Theta Fricativo",
      descriptionPt: "Sopro dental antigo como o 'TH' em inglês ou 'Z' espanhol.",
      language: "el-koine",
      sampleWords: ["theos", "thanatos", "thelema", "agathos"],
      testPattern: /[θΘ]|th/i,
    },
  ],
};

function getDiagnosticStorageKey(language: SupportedLanguage): string {
  return `smart_language_phoneme_diag_${language}_v1`;
}

interface StoredPhonemeStats {
  total: number;
  success: number;
}

export function recordPhonemeAttempt(
  language: SupportedLanguage,
  targetWord: string,
  isCorrect: boolean
) {
  if (typeof window === "undefined") return;

  const catalog = PHONEME_CATALOG[language] || [];
  if (catalog.length === 0) return;

  const key = getDiagnosticStorageKey(language);
  let stored: Record<string, StoredPhonemeStats> = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (_) {}

  catalog.forEach((family) => {
    if (family.testPattern.test(targetWord)) {
      const current = stored[family.id] || { total: 0, success: 0 };
      current.total += 1;
      if (isCorrect) current.success += 1;
      stored[family.id] = current;
    }
  });

  try {
    localStorage.setItem(key, JSON.stringify(stored));
  } catch (_) {}
}

export function getPhonemeDiagnostics(
  language: SupportedLanguage
): PhonemeDiagnosticResult[] {
  const catalog = PHONEME_CATALOG[language] || [];
  if (typeof window === "undefined") {
    return catalog.map((f) => ({
      family: f,
      totalAttempts: 0,
      successfulAttempts: 0,
      accuracyPercent: 100,
      status: "mastered",
    }));
  }

  const key = getDiagnosticStorageKey(language);
  let stored: Record<string, StoredPhonemeStats> = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) stored = JSON.parse(raw);
  } catch (_) {}

  return catalog.map((family) => {
    const stats = stored[family.id] || { total: 0, success: 0 };
    const accuracy = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100;
    let status: "mastered" | "improving" | "needs_practice" = "mastered";

    if (stats.total > 0) {
      if (accuracy >= 80) status = "mastered";
      else if (accuracy >= 55) status = "improving";
      else status = "needs_practice";
    }

    return {
      family,
      totalAttempts: stats.total,
      successfulAttempts: stats.success,
      accuracyPercent: accuracy,
      status,
    };
  });
}
