import { UserProgress, ChatMessage, Flashcard } from "@/types/language";

const STORAGE_KEY_PROGRESS = "smart_language_progress_v1";
const STORAGE_KEY_CHAT = "smart_language_chat_v1";
const STORAGE_KEY_CUSTOM_CARDS = "smart_language_custom_cards_v1";

const DEFAULT_PROGRESS: UserProgress = {
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split("T")[0] || "",
  xp: 50,
  cardsMasteredCount: 0,
  phrasesAnalyzedCount: 0,
  messagesSentCount: 0,
  dailySprintDone: false,
  audioSpeed: 1.0,
  design: "classic",
};

export function loadUserProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) {
      saveUserProgress(DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
    const data = JSON.parse(raw) as UserProgress;

    // Verificar streak de acordo com a data
    const today = new Date().toISOString().split("T")[0] || "";
    if (data.lastActiveDate !== today) {
      const lastDate = new Date(data.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Dia consecutivo!
        data.streakDays += 1;
      } else if (diffDays > 1) {
        // Quebrou o streak
        data.streakDays = 1;
      }
      data.lastActiveDate = today;
      data.dailySprintDone = false; // reseta o sprint diário para o novo dia
      saveUserProgress(data);
    }

    return { ...DEFAULT_PROGRESS, ...data };
  } catch (error) {
    console.error("Erro ao carregar progresso:", error);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
  }
}

export function addXP(amount: number): UserProgress {
  const current = loadUserProgress();
  const updated = { ...current, xp: current.xp + amount };
  saveUserProgress(updated);
  return updated;
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch (e) {
    console.error("Erro ao carregar chat:", e);
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    // Guarda até as últimas 50 mensagens para economia de espaço
    const toSave = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(toSave));
  } catch (e) {
    console.error("Erro ao salvar chat:", e);
  }
}

export function loadCustomFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CARDS);
    return raw ? (JSON.parse(raw) as Flashcard[]) : [];
  } catch (e) {
    console.error("Erro ao carregar flashcards customizados:", e);
    return [];
  }
}

export function saveCustomFlashcard(card: Flashcard): Flashcard[] {
  const existing = loadCustomFlashcards();
  const updated = [card, ...existing.filter((c) => c.id !== card.id)];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CARDS, JSON.stringify(updated));
  }
  return updated;
}

// ================= TOP 200 PROGRESS STORAGE =================
import { Top200Progress } from "@/data/top200/types";
import { SupportedLanguage } from "@/types/language";

export function getTop200StorageKey(language: SupportedLanguage): string {
  return `smart_language_top200_${language}_v1`;
}

export function loadTop200Progress(language: SupportedLanguage): Top200Progress {
  const defaultProgress: Top200Progress = {
    currentIndex: 0,
    masteredIds: [],
    reviewQueue: [],
  };

  if (typeof window === "undefined") return defaultProgress;

  try {
    const raw = localStorage.getItem(getTop200StorageKey(language));
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Erro ao carregar progresso Top 200:", e);
    return defaultProgress;
  }
}

export function saveTop200Progress(
  language: SupportedLanguage,
  progress: Top200Progress
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getTop200StorageKey(language), JSON.stringify(progress));
  } catch (e) {
    console.error("Erro ao salvar progresso Top 200:", e);
  }
}

export function markTop200WordMastered(
  language: SupportedLanguage,
  wordId: string
): Top200Progress {
  const current = loadTop200Progress(language);
  const updatedMastered = Array.from(new Set([...current.masteredIds, wordId]));
  const updatedQueue = current.reviewQueue.filter((id) => id !== wordId);
  const updated: Top200Progress = {
    ...current,
    masteredIds: updatedMastered,
    reviewQueue: updatedQueue,
  };
  saveTop200Progress(language, updated);
  return updated;
}

export function toggleTop200ReviewQueue(
  language: SupportedLanguage,
  wordId: string
): Top200Progress {
  const current = loadTop200Progress(language);
  const inQueue = current.reviewQueue.includes(wordId);
  const updatedQueue = inQueue
    ? current.reviewQueue.filter((id) => id !== wordId)
    : Array.from(new Set([...current.reviewQueue, wordId]));

  // A repetição para fixação de pronúncia mantém a palavra dominada sem desmarcá-la
  const updated: Top200Progress = {
    ...current,
    reviewQueue: updatedQueue,
  };
  saveTop200Progress(language, updated);
  return updated;
}

// ================= MEMÓRIA CONVERSACIONAL DO ALUNO =================
import {
  LearnerProfileMemory,
  GrammarCorrection,
} from "@/types/language";

export function getLearnerMemoryKey(language: SupportedLanguage): string {
  return `smart_language_learner_memory_${language}_v1`;
}

export function createDefaultLearnerMemory(language: SupportedLanguage): LearnerProfileMemory {
  return {
    language,
    topicsDiscussed: [],
    grammarSlips: [],
    favoriteVocabulary: [],
    learnerInterests: [],
    tutorNotes: {},
    lastUpdated: Date.now(),
  };
}

export function loadLearnerMemory(language: SupportedLanguage): LearnerProfileMemory {
  if (typeof window === "undefined") return createDefaultLearnerMemory(language);
  try {
    const raw = localStorage.getItem(getLearnerMemoryKey(language));
    if (!raw) return createDefaultLearnerMemory(language);
    const parsed = JSON.parse(raw) as LearnerProfileMemory;
    return {
      language,
      topicsDiscussed: Array.isArray(parsed.topicsDiscussed) ? parsed.topicsDiscussed : [],
      grammarSlips: Array.isArray(parsed.grammarSlips) ? parsed.grammarSlips : [],
      favoriteVocabulary: Array.isArray(parsed.favoriteVocabulary) ? parsed.favoriteVocabulary : [],
      learnerInterests: Array.isArray(parsed.learnerInterests) ? parsed.learnerInterests : [],
      tutorNotes: parsed.tutorNotes || {},
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch (e) {
    console.error("Erro ao carregar memória do aluno:", e);
    return createDefaultLearnerMemory(language);
  }
}

export function saveLearnerMemory(
  language: SupportedLanguage,
  memory: LearnerProfileMemory
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getLearnerMemoryKey(language), JSON.stringify(memory));
  } catch (e) {
    console.error("Erro ao salvar memória do aluno:", e);
  }
}

export function clearLearnerMemory(language: SupportedLanguage): LearnerProfileMemory {
  const fresh = createDefaultLearnerMemory(language);
  saveLearnerMemory(language, fresh);
  return fresh;
}

/**
 * Atualiza organicamente a memória conversacional do aluno após cada turno de conversa.
 */
export function updateLearnerMemoryFromInteraction(
  language: SupportedLanguage,
  tutorId: string,
  userText: string,
  correction?: GrammarCorrection,
  customTopic?: string
): LearnerProfileMemory {
  const current = loadLearnerMemory(language);
  const now = Date.now();

  // 1. Detecta tópico se não informado explicitamente
  let detectedTopic = customTopic;
  if (!detectedTopic) {
    const lower = userText.toLowerCase();
    if (lower.includes("coffee") || lower.includes("café") || lower.includes("kaffee") || lower.includes("chá") || lower.includes("tea")) {
      detectedTopic = "Café e preferências matinais";
    } else if (lower.includes("work") || lower.includes("trabalh") || lower.includes("arbeit") || lower.includes("job") || lower.includes("office")) {
      detectedTopic = "Trabalho e rotina profissional";
    } else if (lower.includes("travel") || lower.includes("viag") || lower.includes("reise") || lower.includes("hotel") || lower.includes("flight") || lower.includes("trem")) {
      detectedTopic = "Viagens e transporte";
    } else if (lower.includes("weekend") || lower.includes("fim de semana") || lower.includes("wochenende") || lower.includes("vacation") || lower.includes("férias")) {
      detectedTopic = "Planos para fins de semana e lazer";
    } else if (lower.includes("food") || lower.includes("comida") || lower.includes("essen") || lower.includes("pizza") || lower.includes("restaurant") || lower.includes("almoç")) {
      detectedTopic = "Gastronomia e culinária";
    } else if (lower.includes("weather") || lower.includes("tempo") || lower.includes("chuva") || lower.includes("sol") || lower.includes("wetter") || lower.includes("calor")) {
      detectedTopic = "Clima e tempo";
    } else if (lower.includes("study") || lower.includes("estud") || lower.includes("lernen") || lower.includes("idioma") || lower.includes("aprender")) {
      detectedTopic = "Metas de aprendizado e estudo";
    }
  }

  // Atualiza tópicos
  const updatedTopics = [...current.topicsDiscussed];
  if (detectedTopic) {
    const topicIdx = updatedTopics.findIndex(
      (t) => t.topic.toLowerCase() === detectedTopic!.toLowerCase()
    );
    if (topicIdx >= 0 && updatedTopics[topicIdx]) {
      updatedTopics[topicIdx] = {
        ...updatedTopics[topicIdx],
        lastMentioned: now,
        count: updatedTopics[topicIdx].count + 1,
      };
    } else {
      updatedTopics.unshift({
        topic: detectedTopic,
        lastMentioned: now,
        count: 1,
      });
    }
  }

  // 2. Registra eventuais deslizes gramaticais para reforço positivo contínuo
  const updatedSlips = [...current.grammarSlips];
  if (correction && correction.hasError && correction.explanationPt) {
    const patternKey = correction.explanationPt.slice(0, 60);
    const slipIdx = updatedSlips.findIndex((s) => s.explanationPt === correction.explanationPt);
    if (slipIdx >= 0 && updatedSlips[slipIdx]) {
      updatedSlips[slipIdx] = {
        ...updatedSlips[slipIdx],
        lastSeen: now,
        count: updatedSlips[slipIdx].count + 1,
      };
    } else {
      updatedSlips.unshift({
        pattern: patternKey,
        explanationPt: correction.explanationPt,
        lastSeen: now,
        count: 1,
      });
    }
  }

  // 3. Atualiza anotações do tutor específico
  const updatedNotes = { ...current.tutorNotes };
  if (detectedTopic) {
    updatedNotes[tutorId] = `Conversou sobre "${detectedTopic}".`;
  }

  const updatedMemory: LearnerProfileMemory = {
    ...current,
    topicsDiscussed: updatedTopics.slice(0, 10), // guarda os 10 tópicos mais recentes
    grammarSlips: updatedSlips.slice(0, 8),      // guarda os 8 deslizes mais recentes
    tutorNotes: updatedNotes,
    lastUpdated: now,
  };

  saveLearnerMemory(language, updatedMemory);
  return updatedMemory;
}

// ================= BACKUP & PORTABILIDADE LOCAL-FIRST =================

const BACKUP_KEYS = [
  STORAGE_KEY_PROGRESS,
  STORAGE_KEY_CHAT,
  STORAGE_KEY_CUSTOM_CARDS,
  "smart_language_analysis_cache_v1",
  "smart_language_fontsize",
  "smart_language_design",
];

const LANG_KEYS: SupportedLanguage[] = ["en", "es", "fr", "de", "it", "ru", "ja", "el-koine"];

export function exportFullBackupData(): string {
  if (typeof window === "undefined") return "{}";
  const snapshot: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    version: "smart_language_backup_v1",
  };
  // Chaves fixas
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        snapshot[key] = JSON.parse(raw);
      } catch {
        snapshot[key] = raw;
      }
    }
  }
  // Chaves por idioma (top200 + memória)
  for (const lang of LANG_KEYS) {
    const top200Key = getTop200StorageKey(lang);
    const memKey = getLearnerMemoryKey(lang);
    const rawTop = localStorage.getItem(top200Key);
    const rawMem = localStorage.getItem(memKey);
    if (rawTop !== null) {
      try { snapshot[top200Key] = JSON.parse(rawTop); } catch { snapshot[top200Key] = rawTop; }
    }
    if (rawMem !== null) {
      try { snapshot[memKey] = JSON.parse(rawMem); } catch { snapshot[memKey] = rawMem; }
    }
  }
  return JSON.stringify(snapshot, null, 2);
}

export function importFullBackupData(json: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const snapshot = JSON.parse(json) as Record<string, unknown>;
    for (const [key, value] of Object.entries(snapshot)) {
      if (key === "exportedAt" || key === "version") continue;
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
    return true;
  } catch (e) {
    console.error("Erro ao importar backup:", e);
    return false;
  }
}
