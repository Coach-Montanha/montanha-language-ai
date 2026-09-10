import { SupportedLanguage } from "@/types/language";

export type WordMatchStatus = "correct" | "close" | "missed";

export interface WordScore {
  id: string;
  word: string;
  status: WordMatchStatus;
  score: number; // 0 to 100
  spokenToken?: string | undefined;
  feedbackPt: string;
}

export interface PronunciationEvaluation {
  overallScore: number; // 0 to 100
  accuracyGrade: "perfect" | "great" | "good" | "retry";
  gradeLabelPt: string;
  words: WordScore[];
  feedbackPt: string;
  correctCount: number;
  totalWords: number;
}

/**
 * Normaliza um token removendo pontuações comuns, mantendo caracteres de alfabetos específicos (cirílico, grego, japonês, etc.)
 */
function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»—–]/g, "");
}

/**
 * Distância de Levenshtein para medir proximidade fonética/ortográfica entre o que foi falado e o alvo
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const c1 = s1[i - 1];
    for (let j = 1; j <= n; j++) {
      const cost = c1 === s2[j - 1] ? 0 : 1;
      const prevVal = prev[j] ?? 0;
      const currVal = curr[j - 1] ?? 0;
      const diagVal = prev[j - 1] ?? 0;
      curr[j] = Math.min(prevVal + 1, currVal + 1, diagVal + cost);
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }

  return prev[n] ?? 0;
}

/**
 * Calcula a similaridade entre 0 e 100% entre duas palavras
 */
function calculateWordSimilarity(target: string, spoken: string): number {
  const t = normalizeWord(target);
  const s = normalizeWord(spoken);

  if (!t && !s) return 100;
  if (!t || !s) return 0;
  if (t === s) return 100;

  // Substring direta
  if (t.includes(s) || s.includes(t)) {
    const minLen = Math.min(t.length, s.length);
    const maxLen = Math.max(t.length, s.length);
    if (minLen >= 3 && minLen / maxLen >= 0.7) {
      return Math.round((minLen / maxLen) * 90);
    }
  }

  const dist = levenshteinDistance(t, s);
  const maxLen = Math.max(t.length, s.length);
  const similarity = Math.max(0, 1 - dist / maxLen);

  return Math.round(similarity * 100);
}

/**
 * Avalia a pronúncia de uma frase comparando a frase esperada (targetText)
 * com o que o microfone transcreveu (spokenText).
 */
export function evaluatePronunciation(
  targetText: string,
  spokenText: string,
  _lang?: SupportedLanguage
): PronunciationEvaluation {
  // Limpeza de tokens alvo
  const targetWords = targetText
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const spokenWords = spokenText
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  if (targetWords.length === 0) {
    return {
      overallScore: 100,
      accuracyGrade: "perfect",
      gradeLabelPt: "Perfeito!",
      words: [],
      feedbackPt: "Ótima pronúncia!",
      correctCount: 0,
      totalWords: 0,
    };
  }

  // Mapeamento sequencial com janela de busca deslizante
  const wordsResult: WordScore[] = [];
  let spokenSearchIndex = 0;
  let correctCount = 0;

  targetWords.forEach((targetWord, idx) => {
    const normTarget = normalizeWord(targetWord);

    // Se é apenas pontuação, pontua 100%
    if (normTarget.length === 0) {
      wordsResult.push({
        id: `word-${idx}`,
        word: targetWord,
        status: "correct",
        score: 100,
        feedbackPt: "Pontuação",
      });
      return;
    }

    let bestScore = 0;
    let bestSpokenMatch = "";
    let bestSpokenIdx = -1;

    // Busca janela em torno do spokenSearchIndex (+/- 3 palavras)
    const windowStart = Math.max(0, spokenSearchIndex - 1);
    const windowEnd = Math.min(spokenWords.length, spokenSearchIndex + 4);

    for (let sIdx = windowStart; sIdx < windowEnd; sIdx++) {
      const candidate = spokenWords[sIdx];
      if (!candidate) continue;
      const sim = calculateWordSimilarity(normTarget, candidate);
      if (sim > bestScore) {
        bestScore = sim;
        bestSpokenMatch = candidate;
        bestSpokenIdx = sIdx;
      }
    }

    // Se encontrou bom casamento, avança o cursor falado
    if (bestSpokenIdx !== -1 && bestScore >= 50) {
      spokenSearchIndex = bestSpokenIdx + 1;
    }

    let status: WordMatchStatus = "missed";
    let feedbackPt = "Palavra não identificada ou omitida.";

    if (bestScore >= 80) {
      status = "correct";
      feedbackPt = "Pronúncia clara e correta!";
      correctCount++;
    } else if (bestScore >= 50) {
      status = "close";
      feedbackPt = `Quase lá! Falou "${bestSpokenMatch}". Toque para ouvir o som correto.`;
    } else {
      status = "missed";
      feedbackPt = "Não articulada ou não reconhecida. Toque para treinar o som.";
    }

    wordsResult.push({
      id: `word-${idx}`,
      word: targetWord,
      status,
      score: bestScore,
      spokenToken: bestSpokenMatch || undefined,
      feedbackPt,
    });
  });

  // Cálculo geral ponderado
  const validWords = wordsResult.filter((w) => normalizeWord(w.word).length > 0);
  const totalScoreSum = validWords.reduce((acc, curr) => acc + curr.score, 0);
  const overallScore =
    validWords.length > 0 ? Math.round(totalScoreSum / validWords.length) : 100;

  let accuracyGrade: "perfect" | "great" | "good" | "retry" = "retry";
  let gradeLabelPt = "Precisa Praticar";
  let feedbackPt = "Escute os termos destacados em vermelho e repita com calma.";

  if (overallScore >= 90) {
    accuracyGrade = "perfect";
    gradeLabelPt = "Excelente! 🌟";
    feedbackPt = "Sua articulação e ritmo foram praticamente perfeitos!";
  } else if (overallScore >= 75) {
    accuracyGrade = "great";
    gradeLabelPt = "Muito Bom! 👏";
    feedbackPt = "Ótima clareza! Apenas alguns detalhes de sotaque para ajustar.";
  } else if (overallScore >= 55) {
    accuracyGrade = "good";
    gradeLabelPt = "Bom Começo! 👍";
    feedbackPt = "Você foi compreendido! Toque nas palavras amarelas para afinar o som.";
  }

  return {
    overallScore,
    accuracyGrade,
    gradeLabelPt,
    words: wordsResult,
    feedbackPt,
    correctCount,
    totalWords: validWords.length,
  };
}
