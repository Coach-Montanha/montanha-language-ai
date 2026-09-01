export type TabType = "conversa" | "cenario" | "alfabeto" | "cartoes" | "destrinchar";

export interface GrammarCorrection {
  hasError: boolean;
  original: string;
  corrected: string;
  explanationPt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "tutor" | "system";
  text: string;
  correction?: GrammarCorrection | undefined;
  timestamp: number;
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  roleAi: string;
  roleUser: string;
  description: string;
  context: string;
  initialAiMessage: string;
  sampleReplies: string[];
}

export interface AlphabetItem {
  id: string;
  letter: string;
  phoneticIpa: string;
  phoneticPt: string;
  exampleWord: string;
  exampleTranslation: string;
  category: "vowel" | "consonant" | "sound";
  description: string;
}

export interface Flashcard {
  id: string;
  theme: string;
  word: string;
  phonetic: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  status?: "learning" | "mastered" | undefined;
}

export interface WordToken {
  word: string;
  partOfSpeech: string;
  posBadge: string;
  posColor: string;
  literalTranslation: string;
  note?: string | undefined;
}

export interface SentenceAnalysis {
  original: string;
  tokens: WordToken[];
  naturalTranslation: string;
  explanation: string;
}

export interface UserProgress {
  streakDays: number;
  lastActiveDate: string;
  xp: number;
  cardsMasteredCount: number;
  phrasesAnalyzedCount: number;
  messagesSentCount: number;
  dailySprintDone: boolean;
  geminiApiKey?: string | undefined;
  audioSpeed: number; // 0.8, 1.0, 1.2
}
