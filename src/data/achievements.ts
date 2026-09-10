import { UserProgress } from "@/types/language";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "chat" | "sprint" | "speech" | "streak" | "vocab";
  xpReward: number;
  condition: (p: UserProgress) => boolean;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "first_chat",
    title: "Primeiro Contato",
    description: "Envie sua primeira mensagem para o tutor no chat",
    icon: "💬",
    category: "chat",
    xpReward: 20,
    condition: (p) => p.messagesSentCount >= 1,
  },
  {
    id: "chat_enthusiast",
    title: "Fluência em Conversa",
    description: "Troque mais de 10 mensagens em imersão com os tutores",
    icon: "🗣️",
    category: "chat",
    xpReward: 50,
    condition: (p) => p.messagesSentCount >= 10,
  },
  {
    id: "voice_call_first",
    title: "Papo Direto",
    description: "Inicie e complete uma Chamada de Voz hands-free com o tutor",
    icon: "📞",
    category: "speech",
    xpReward: 35,
    condition: (p) => (p.voiceCallsCount ?? 0) >= 1,
  },
  {
    id: "pronunciation_gold",
    title: "Sotaque de Ouro",
    description: "Alcance 85% ou mais no Avaliador Visual de Pronúncia",
    icon: "🎯",
    category: "speech",
    xpReward: 40,
    condition: (p) => (p.bestPronunciationScore ?? 0) >= 85,
  },
  {
    id: "daily_sprint_hero",
    title: "Rotina de Campeão",
    description: "Conclua seu primeiro Treino Diário de 5 Minutos",
    icon: "⚡",
    category: "sprint",
    xpReward: 30,
    condition: (p) => p.dailySprintDone,
  },
  {
    id: "streak_fire_3",
    title: "Fogo Sagrado",
    description: "Mantenha o ritmo de estudo por 3 dias consecutivos",
    icon: "🔥",
    category: "streak",
    xpReward: 60,
    condition: (p) => p.streakDays >= 3,
  },
  {
    id: "vocab_explorer",
    title: "Colecionador de Palavras",
    description: "Domine 10 ou mais flashcards no catálogo de vocabulário",
    icon: "🃏",
    category: "vocab",
    xpReward: 35,
    condition: (p) => p.cardsMasteredCount >= 10,
  },
  {
    id: "grammar_analyst",
    title: "Linguista Curioso",
    description: "Analise frases na aba Destrinchar ou no Sentence Scramble",
    icon: "🧩",
    category: "vocab",
    xpReward: 30,
    condition: (p) => p.phrasesAnalyzedCount >= 3,
  },
];

/**
 * Avalia o progresso do usuário e retorna as conquistas desbloqueadas
 */
export function checkAchievements(progress: UserProgress): {
  unlockedList: Achievement[];
  lockedList: Achievement[];
  newlyUnlocked: Achievement[];
  updatedProgress: UserProgress;
} {
  const currentUnlockedIds = new Set(progress.unlockedAchievementIds || []);
  const newlyUnlocked: Achievement[] = [];
  let addedXp = 0;

  ACHIEVEMENTS_LIST.forEach((ach) => {
    if (ach.condition(progress)) {
      if (!currentUnlockedIds.has(ach.id)) {
        currentUnlockedIds.add(ach.id);
        newlyUnlocked.push(ach);
        addedXp += ach.xpReward;
      }
    }
  });

  const updatedProgress: UserProgress = {
    ...progress,
    xp: progress.xp + addedXp,
    unlockedAchievementIds: Array.from(currentUnlockedIds),
  };

  const unlockedList = ACHIEVEMENTS_LIST.filter((a) => currentUnlockedIds.has(a.id));
  const lockedList = ACHIEVEMENTS_LIST.filter((a) => !currentUnlockedIds.has(a.id));

  return {
    unlockedList,
    lockedList,
    newlyUnlocked,
    updatedProgress,
  };
}
