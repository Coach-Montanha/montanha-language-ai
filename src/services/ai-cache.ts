import { SentenceAnalysis, SupportedLanguage } from "@/types/language";

const CACHE_KEY = "smart_language_analysis_cache_v1";
const MAX_CACHE_ITEMS = 200;

interface CacheEntry {
  analysis: SentenceAnalysis;
  timestamp: number;
}

type CacheStorage = Record<string, CacheEntry>;

function normalizeKey(language: SupportedLanguage, text: string): string {
  return `${language}:${text.trim().toLowerCase()}`;
}

function loadCache(): CacheStorage {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheStorage;
  } catch (err) {
    console.warn("Falha ao ler cache semântico local:", err);
    return {};
  }
}

function saveCache(cache: CacheStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn("Falha ao salvar cache semântico local:", err);
  }
}

/**
 * Recupera análise sintática prévia em 0ms caso já tenha sido processada
 */
export function getCachedAnalysis(
  language: SupportedLanguage,
  text: string
): SentenceAnalysis | null {
  const key = normalizeKey(language, text);
  const cache = loadCache();
  const entry = cache[key];
  if (!entry) return null;
  return entry.analysis;
}

/**
 * Armazena o resultado da análise no cache local
 */
export function setCachedAnalysis(
  language: SupportedLanguage,
  text: string,
  analysis: SentenceAnalysis
): void {
  const key = normalizeKey(language, text);
  const cache = loadCache();

  // Limpeza de cache LRU simples se exceder tamanho máximo
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ITEMS) {
    const oldestKey = keys.sort((a, b) => {
      const timeA = cache[a]?.timestamp || 0;
      const timeB = cache[b]?.timestamp || 0;
      return timeA - timeB;
    })[0];
    if (oldestKey) {
      delete cache[oldestKey];
    }
  }

  cache[key] = {
    analysis,
    timestamp: Date.now(),
  };

  saveCache(cache);
}

/**
 * Limpa todo o cache de análises
 */
export function clearAnalysisCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn("Erro ao limpar cache:", err);
  }
}
