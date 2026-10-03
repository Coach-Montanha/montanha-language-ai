import { UserProgress } from "@/types/language";
import { AvatarConfig, AvatarItem, LevelInfo, AvatarArchetype } from "@/types/avatar";
import { DEFAULT_AVATAR_CONFIG, STARTER_UNLOCKED_ITEM_IDS, getItemById } from "@/data/avatar-items";

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, title: "Aprendiz Curioso" },
  { level: 2, minXp: 100, title: "Explorador de Vocabulário" },
  { level: 3, minXp: 250, title: "Aventureiro Poliglota" },
  { level: 4, minXp: 450, title: "Guardião da Pronúncia" },
  { level: 5, minXp: 700, title: "Mestre dos Diálogos" },
  { level: 6, minXp: 1050, title: "Mago da Eloquência" },
  { level: 7, minXp: 1500, title: "Lorde dos Idiomas" },
  { level: 8, minXp: 2100, title: "Orador Ancestral" },
  { level: 9, minXp: 2800, title: "Grão-Mestre Linguista" },
  { level: 10, minXp: 3600, title: "Sábio Lendário Montanha" },
];

export function calculateLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, xp || 0);

  let currentLevelObj = LEVEL_THRESHOLDS[0]!;
  let nextLevelObj = LEVEL_THRESHOLDS[1]!;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    const entry = LEVEL_THRESHOLDS[i]!;
    if (safeXp >= entry.minXp) {
      currentLevelObj = entry;
      nextLevelObj = LEVEL_THRESHOLDS[i + 1] || {
        level: entry.level + 1,
        minXp: entry.minXp + 1000,
        title: "Sábio Lendário Montanha",
      };
      break;
    }
  }

  const xpInCurrentSpan = safeXp - currentLevelObj.minXp;
  const spanTotal = Math.max(1, nextLevelObj.minXp - currentLevelObj.minXp);
  const progressPercent = Math.min(100, Math.floor((xpInCurrentSpan / spanTotal) * 100));

  return {
    level: currentLevelObj.level,
    title: currentLevelObj.title,
    currentXp: safeXp,
    xpForCurrentLevel: currentLevelObj.minXp,
    xpForNextLevel: nextLevelObj.minXp,
    progressPercent,
    totalCoinsEarned: safeXp,
  };
}

export function ensureGamificationProgress(progress: UserProgress): UserProgress {
  const levelInfo = calculateLevelInfo(progress.xp);

  const coins =
    typeof progress.coins === "number"
      ? progress.coins
      : 150; // Inicia com 150 moedas de boas-vindas

  const level = progress.level || levelInfo.level;
  const skillPoints = typeof progress.skillPoints === "number" ? progress.skillPoints : level;

  const equippedAvatar: AvatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...(progress.equippedAvatar || {}),
    equipped: {
      ...DEFAULT_AVATAR_CONFIG.equipped,
      ...(progress.equippedAvatar?.equipped || {}),
    },
  };

  const unlockedAvatarItems = Array.from(
    new Set([...STARTER_UNLOCKED_ITEM_IDS, ...(progress.unlockedAvatarItems || [])])
  );

  return {
    ...progress,
    coins,
    level,
    skillPoints,
    equippedAvatar,
    unlockedAvatarItems,
  };
}

export function awardGamificationRewards(
  current: UserProgress,
  xpToAdd: number,
  coinsToAdd: number
): {
  updated: UserProgress;
  leveledUp: boolean;
  newLevel?: number | undefined;
  bonusCoins?: number | undefined;
} {
  const prepared = ensureGamificationProgress(current);
  const oldLevelInfo = calculateLevelInfo(prepared.xp);
  const newXp = prepared.xp + Math.max(0, xpToAdd);
  const newLevelInfo = calculateLevelInfo(newXp);

  const leveledUp = newLevelInfo.level > oldLevelInfo.level;
  const bonusCoins = leveledUp ? (newLevelInfo.level - oldLevelInfo.level) * 100 : 0;
  const addedCoins = Math.max(0, coinsToAdd) + bonusCoins;

  const updated: UserProgress = {
    ...prepared,
    xp: newXp,
    level: newLevelInfo.level,
    coins: (prepared.coins ?? 150) + addedCoins,
    skillPoints: (prepared.skillPoints ?? 1) + (leveledUp ? (newLevelInfo.level - oldLevelInfo.level) : 0),
  };

  return {
    updated,
    leveledUp,
    newLevel: leveledUp ? newLevelInfo.level : undefined,
    bonusCoins: leveledUp ? bonusCoins : undefined,
  };
}

export function buyAvatarItem(
  current: UserProgress,
  item: AvatarItem
): { success: boolean; error?: string; updated?: UserProgress } {
  const prepared = ensureGamificationProgress(current);
  const levelInfo = calculateLevelInfo(prepared.xp);

  if ((prepared.unlockedAvatarItems || []).includes(item.id)) {
    return { success: false, error: "Você já possui este item!" };
  }

  if (levelInfo.level < item.minLevel) {
    return {
      success: false,
      error: `Este item requer nível ${item.minLevel}. Você está no nível ${levelInfo.level}. Continue praticando!`,
    };
  }

  if ((prepared.coins ?? 0) < item.price) {
    const missing = item.price - (prepared.coins ?? 0);
    return {
      success: false,
      error: `Moedas insuficientes. Faltam ${missing} moedas. Complete mais treinos e diálogos!`,
    };
  }

  const updated: UserProgress = {
    ...prepared,
    coins: (prepared.coins ?? 0) - item.price,
    unlockedAvatarItems: [...(prepared.unlockedAvatarItems || []), item.id],
  };

  // Auto-equipa após comprar
  const equipped = equipAvatarItem(updated, item);

  return { success: true, updated: equipped };
}

export function equipAvatarItem(current: UserProgress, item: AvatarItem): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;

  if (item.slot === "archetype") {
    const subType =
      item.id.includes("owl") ? "owl" :
      item.id.includes("wolf") ? "wolf" :
      item.id.includes("cat") ? "cat" :
      item.id.includes("dragon") ? "dragon" :
      item.id.includes("golem") ? "golem" :
      item.id.includes("elemental") ? "elemental" :
      item.id.includes("goblin") ? "goblin" :
      "adventurer";

    return {
      ...prepared,
      equippedAvatar: {
        ...currentConfig,
        archetype: item.archetype === "all" ? "human" : item.archetype,
        subType,
      },
    };
  }

  return {
    ...prepared,
    equippedAvatar: {
      ...currentConfig,
      equipped: {
        ...currentConfig.equipped,
        [item.slot]: item.id,
      },
    },
  };
}

export function unequipAvatarSlot(
  current: UserProgress,
  slot: "head" | "eyes" | "body" | "hand" | "aura"
): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const newEquipped = { ...currentConfig.equipped };
  delete newEquipped[slot];

  return {
    ...prepared,
    equippedAvatar: {
      ...currentConfig,
      equipped: newEquipped,
    },
  };
}

export function setAvatarColors(
  current: UserProgress,
  primaryColor: string,
  secondaryColor?: string
): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;

  return {
    ...prepared,
    equippedAvatar: {
      ...currentConfig,
      primaryColor,
      secondaryColor: secondaryColor || currentConfig.secondaryColor,
    },
  };
}
