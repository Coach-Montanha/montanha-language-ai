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
    : [...current.reviewQueue, wordId];
  
  // Se entrou na fila de revisão, remove de dominada
  const updatedMastered = inQueue
    ? current.masteredIds
    : current.masteredIds.filter((id) => id !== wordId);

  const updated: Top200Progress = {
    ...current,
    reviewQueue: updatedQueue,
    masteredIds: updatedMastered,
  };
  saveTop200Progress(language, updated);
  return updated;
}

