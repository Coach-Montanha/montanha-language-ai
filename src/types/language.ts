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
  phonetic?: string | undefined;
  translationPt?: string | undefined;
  originalPt?: string | undefined;
  wasTranslated?: boolean | undefined;
  correction?: GrammarCorrection | undefined;
  timestamp: number;
}

export interface ContextualSuggestion {
  category?: "agree" | "alternative" | "ask_back" | "detail" | "quick" | "general";
  label: string;
  text: string;
  phonetic: string;
  translationPt: string;
}

export interface TutorChatResponse {
  replyText: string;
  phonetic?: string | undefined;
  translationPt?: string | undefined;
  correction?: GrammarCorrection | undefined;
  userTranslatedText?: string | undefined;
  userOriginalPt?: string | undefined;
  userPhonetic?: string | undefined;
  userTranslationPt?: string | undefined;
  suggestedReplies?: ContextualSuggestion[] | undefined;
}

export interface ScriptSuggestion {
  english: string;
  phonetic: string;
  portuguese: string;
}

export interface DialogueScriptLine {
  id: string;
  speaker: string;
  roleType: "ai" | "user";
  english: string;
  phonetic: string;
  portuguese: string;
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
  structuredSuggestions?: ScriptSuggestion[] | undefined;
  script?: DialogueScriptLine[] | undefined;
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
  theme?: string | undefined;
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

export interface WeeklyMission {
  id: string;
  language?: SupportedLanguage | undefined;
  week: number;
  weekTitle: string;
  title: string;
  icon: string;
  focus: string; // ex: "Sobrevivência", "Contexto & Trabalho", "Opinião & Debate"
  situationDescription: string;
  aiRole: string;
  userRole: string;
  openingAiDialogue: string;
  openingAiPhonetic?: string | undefined;
  openingAiPortuguese?: string | undefined;
  survivalObjective: string;
  survivalTipsPt: string;
  sampleResponses: string[];
  structuredSuggestions?: ScriptSuggestion[] | undefined;
  script?: DialogueScriptLine[] | undefined;
}

export type SupportedLanguage = "en" | "es" | "ja" | "el-koine" | "it" | "fr" | "de" | "ru";

export interface LanguageDefinition {
  id: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechLangCode: string;
  description: string;
  welcomeMessage: string;
  defaultTutorId: string;
}

export interface TutorPersona {
  id: string;
  language: SupportedLanguage;
  name: string;
  gender: "male" | "female";
  avatar: string;
  city: string;
  country: string;
  flag: string;
  styleTitle: string;
  styleDesc: string;
  bioPt: string;
  initialGreeting: string;
  initialGreetingPhonetic?: string | undefined;
  initialGreetingPt?: string | undefined;
  speechPitch?: number | undefined;
  samplePhrase: string;
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
  audioSpeed: number; // 0.7, 0.85, 1.0, 1.2
  currentWeek?: number | undefined;
  customMissions?: WeeklyMission[] | undefined;
  completedMissionIds?: string[] | undefined;
  activeMissionId?: string | undefined;
  selectedTutorId?: string | undefined;
  selectedLanguage?: SupportedLanguage | undefined;
  fontSize?: ("sm" | "md" | "lg" | "xl") | undefined;
  design?: ("classic" | "midnight" | "focus") | undefined;
  unlockedAchievementIds?: string[] | undefined;
  voiceCallsCount?: number | undefined;
  bestPronunciationScore?: number | undefined;
}

export interface LearnerTopicMemory {
  topic: string;
  lastMentioned: number;
  count: number;
}

export interface LearnerGrammarSlip {
  pattern: string;
  explanationPt: string;
  lastSeen: number;
  count: number;
}

export interface LearnerProfileMemory {
  language: SupportedLanguage;
  topicsDiscussed: LearnerTopicMemory[];
  grammarSlips: LearnerGrammarSlip[];
  favoriteVocabulary: string[];
  learnerInterests: string[];
  tutorNotes: Record<string, string>; // tutorId -> nota pedagógica contínua
  lastUpdated: number;
}
