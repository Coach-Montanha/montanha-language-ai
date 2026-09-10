import { SupportedLanguage } from "@/types/language";

export interface SrsItem {
  cardId: string;
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: number; // Timestamp em milissegundos
  lastReviewedDate: number;
  reviewCount: number;
}

export type SrsRating = "again" | "hard" | "good" | "easy";

/**
 * Mapeia os 4 botões de repetição para as notas de qualidade do SM-2 (0 a 5):
 * - again (Errei) ➔ nota 1
 * - hard (Difícil) ➔ nota 3
 * - good (Bom) ➔ nota 4
 * - easy (Fácil) ➔ nota 5
 */
export function srsRatingToQuality(rating: SrsRating): number {
  switch (rating) {
    case "again":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

/**
 * Calcula o próximo estado do cartão de acordo com o algoritmo SuperMemo SM-2
 */
export function calculateNextSrsState(
  existing: SrsItem | undefined,
  cardId: string,
  quality: number // 0 a 5
): SrsItem {
  const currentEase = existing?.easeFactor ?? 2.5;
  const currentRep = existing?.repetition ?? 0;
  const currentInterval = existing?.intervalDays ?? 0;
  const reviewCount = (existing?.reviewCount ?? 0) + 1;

  let nextRep = currentRep;
  let nextInterval = currentInterval;

  if (quality >= 3) {
    if (currentRep === 0) {
      nextInterval = 1;
    } else if (currentRep === 1) {
      nextInterval = quality === 5 ? 10 : 4;
    } else {
      nextInterval = Math.round(currentInterval * currentEase);
    }
    nextRep += 1;
  } else {
    // Errou a palavra: reseta repetições e revisa em 1 dia
    nextRep = 0;
    nextInterval = 1;
  }

  // Atualização do Fator de Facilidade (EF) com limite mínimo de 1.3
  const newEase = Math.max(
    1.3,
    currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const nextReviewDate = now + nextInterval * 24 * 60 * 60 * 1000;

  return {
    cardId,
    repetition: nextRep,
    intervalDays: nextInterval,
    easeFactor: Math.round(newEase * 100) / 100,
    nextReviewDate,
    lastReviewedDate: now,
    reviewCount,
  };
}

function getSrsStorageKey(language: SupportedLanguage): string {
  return `smart_language_srs_${language}_v1`;
}

/**
 * Carrega todos os registros de SRS salvos para o idioma
 */
export function loadSrsData(language: SupportedLanguage): Record<string, SrsItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getSrsStorageKey(language));
    return raw ? (JSON.parse(raw) as Record<string, SrsItem>) : {};
  } catch (e) {
    console.error("Erro ao carregar dados SRS:", e);
    return {};
  }
}

/**
 * Salva a avaliação de um item no SRS
 */
export function recordSrsReview(
  language: SupportedLanguage,
  cardId: string,
  rating: SrsRating
): SrsItem {
  const data = loadSrsData(language);
  const existing = data[cardId];
  const quality = srsRatingToQuality(rating);
  const nextItem = calculateNextSrsState(existing, cardId, quality);

  data[cardId] = nextItem;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getSrsStorageKey(language), JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar SRS:", e);
    }
  }

  return nextItem;
}

/**
 * Filtra e retorna cartões que venceram e precisam ser revisados hoje
 */
export function getDueSrsCards<T extends { id: string }>(
  allCards: T[],
  language: SupportedLanguage
): {
  dueCards: T[];
  dueCount: number;
  totalRecorded: number;
} {
  const srsData = loadSrsData(language);
  const now = Date.now();

  // Cartões com data de revisão já vencida
  const dueCards = allCards.filter((card) => {
    const item = srsData[card.id];
    if (!item) return false;
    return item.nextReviewDate <= now;
  });

  return {
    dueCards,
    dueCount: dueCards.length,
    totalRecorded: Object.keys(srsData).length,
  };
}
