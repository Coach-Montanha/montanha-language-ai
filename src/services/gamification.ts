import { UserProgress, SupportedLanguage } from "@/types/language";
import {
  AvatarConfig,
  AvatarItem,
  LevelInfo,
  SlotType,
  ALL_SLOT_TYPES,
  CombinedStats,
} from "@/types/avatar";
import {
  DEFAULT_AVATAR_CONFIG,
  STARTER_UNLOCKED_ITEM_IDS,
  STARTER_SHOP_ITEM_IDS,
  STARTER_EQUIPMENT,
  DEFAULT_CHARACTER_ID,
  getCharacterById,
  getShopItemById,
  getItemById,
} from "@/data/avatar-items";

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
  const selectedCharacterId = progress.selectedCharacterId || DEFAULT_CHARACTER_ID;

  const equipment = {
    ...STARTER_EQUIPMENT,
    ...(progress.equipment || {}),
  };

  const inventoryItemIds = Array.from(
    new Set([
      ...STARTER_SHOP_ITEM_IDS,
      ...(progress.inventoryItemIds || []),
      ...(progress.unlockedAvatarItems || []),
    ])
  );

  const equippedAvatar: AvatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...(progress.equippedAvatar || {}),
    equipped: {
      ...DEFAULT_AVATAR_CONFIG.equipped,
      ...(progress.equippedAvatar?.equipped || {}),
      ...equipment,
    },
  };

  const unlockedAvatarItems = Array.from(
    new Set([
      ...STARTER_UNLOCKED_ITEM_IDS,
      ...STARTER_SHOP_ITEM_IDS,
      ...(progress.unlockedAvatarItems || []),
      ...(progress.inventoryItemIds || []),
    ])
  );

  return {
    ...progress,
    coins,
    level,
    skillPoints,
    selectedCharacterId,
    equipment,
    inventoryItemIds,
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

// =========================================================================
// RPG COMBINED STATS CALCULATION
// =========================================================================
export function getCombinedStats(
  progress: UserProgress,
  targetLanguage?: SupportedLanguage
): CombinedStats {
  const prepared = ensureGamificationProgress(progress);
  const equipment = prepared.equipment || STARTER_EQUIPMENT;

  let itemXpMultiplier = 0;
  let itemStreakProtection = 0;
  let itemCoinBonus = 0;

  for (const slot of ALL_SLOT_TYPES) {
    const itemId = equipment[slot];
    if (itemId) {
      const item = getShopItemById(itemId);
      if (item && item.statBonus) {
        itemXpMultiplier += item.statBonus.xpMultiplier || 0;
        itemStreakProtection += item.statBonus.streakProtection || 0;
        itemCoinBonus += item.statBonus.coinBonus || 0;
      }
    }
  }

  const charId = prepared.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const character = getCharacterById(charId);

  const lang = targetLanguage || prepared.selectedLanguage;
  const matchesLang = Boolean(
    character && lang && character.supportedLanguageBonusIds?.includes(lang)
  );

  const charXpBonus = matchesLang ? 0.15 : 0.05;
  const charCoinBonus = matchesLang ? 0.10 : 0.05;

  const totalItemStats = {
    xpMultiplier: Number(itemXpMultiplier.toFixed(2)),
    streakProtection: itemStreakProtection,
    coinBonus: Number(itemCoinBonus.toFixed(2)),
  };

  const characterBonus = {
    characterId: character ? character.id : null,
    characterName: character ? character.name : null,
    xpMultiplier: charXpBonus,
    coinBonus: charCoinBonus,
    active: matchesLang,
    languageBonusCategory: character ? character.nativeLanguageBonus : null,
  };

  const finalXpMultiplier = Number(
    (1.0 + totalItemStats.xpMultiplier + charXpBonus).toFixed(2)
  );
  const finalCoinBonus = Number(
    (1.0 + totalItemStats.coinBonus + charCoinBonus).toFixed(2)
  );
  const finalStreakProtection = totalItemStats.streakProtection;

  return {
    finalXpMultiplier,
    finalStreakProtection,
    finalCoinBonus,
    totalItemStats,
    characterBonus,
  };
}

// =========================================================================
// RPG SHOP & ARMORY PURCHASING, EQUIPPING, UNEQUIPPING
// =========================================================================
export function buyShopItem(
  current: UserProgress,
  itemId: string
): { success: boolean; error?: string; updated?: UserProgress } {
  const prepared = ensureGamificationProgress(current);
  const levelInfo = calculateLevelInfo(prepared.xp);
  const item = getShopItemById(itemId);

  if (!item) {
    return { success: false, error: "Item não encontrado no catálogo da Loja!" };
  }

  const inventory = prepared.inventoryItemIds || [];
  if (inventory.includes(item.id)) {
    return { success: false, error: "Você já possui este item em seu inventário!" };
  }

  if (levelInfo.level < item.requiredLevel) {
    return {
      success: false,
      error: `Este item requer nível ${item.requiredLevel}. Você está no nível ${levelInfo.level}. Continue praticando!`,
    };
  }

  if ((prepared.coins ?? 0) < item.costCoins) {
    const missing = item.costCoins - (prepared.coins ?? 0);
    return {
      success: false,
      error: `Moedas insuficientes. Faltam ${missing} moedas. Complete mais treinos e diálogos!`,
    };
  }

  const updatedProgress: UserProgress = {
    ...prepared,
    coins: (prepared.coins ?? 0) - item.costCoins,
    inventoryItemIds: [...inventory, item.id],
    unlockedAvatarItems: Array.from(new Set([...(prepared.unlockedAvatarItems || []), item.id])),
  };

  // Auto-equipa após comprar
  const equipped = equipShopItem(updatedProgress, item.id);

  return { success: true, updated: equipped };
}

export function equipShopItem(current: UserProgress, itemId: string): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const item = getShopItemById(itemId);
  if (!item) return prepared;

  const currentEquipment = {
    ...STARTER_EQUIPMENT,
    ...(prepared.equipment || {}),
  };

  const newEquipment = {
    ...currentEquipment,
    [item.slot]: item.id,
  };

  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const newEquippedAvatar: AvatarConfig = {
    ...currentConfig,
    equipped: {
      ...currentConfig.equipped,
      [item.slot]: item.id,
    },
  };

  return {
    ...prepared,
    equipment: newEquipment,
    equippedAvatar: newEquippedAvatar,
  };
}

export function unequipShopSlot(current: UserProgress, slot: SlotType): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const currentEquipment = {
    ...STARTER_EQUIPMENT,
    ...(prepared.equipment || {}),
  };

  const newEquipment = {
    ...currentEquipment,
    [slot]: null,
  };

  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const newEquipped = { ...currentConfig.equipped };
  delete newEquipped[slot];

  const lowerMap: Record<SlotType, string> = {
    HEAD: "head",
    CHEST: "body",
    LEGS: "legs",
    MAIN_HAND: "hand",
    OFF_HAND: "off_hand",
    BACK: "back",
    ACCESSORY: "accessory",
  };
  delete newEquipped[lowerMap[slot]];

  return {
    ...prepared,
    equipment: newEquipment,
    equippedAvatar: {
      ...currentConfig,
      equipped: newEquipped,
    },
  };
}

export function selectRpgCharacter(current: UserProgress, characterId: string): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const character = getCharacterById(characterId);
  if (!character) return prepared;

  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const archetype = character.category === "MYTHIC_BEAST" ? "monster" : "human";

  return {
    ...prepared,
    selectedCharacterId: characterId,
    equippedAvatar: {
      ...currentConfig,
      archetype,
      subType: character.baseSpriteAsset,
    },
  };
}

// =========================================================================
// BACKWARD-COMPATIBLE AVATAR SHOP FUNCTIONS
// =========================================================================
export function buyAvatarItem(
  current: UserProgress,
  item: AvatarItem
): { success: boolean; error?: string; updated?: UserProgress } {
  // Se for item da loja RPG, delega para buyShopItem
  const shopItem = getShopItemById(item.id);
  if (shopItem) {
    return buyShopItem(current, item.id);
  }

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
    inventoryItemIds: [...(prepared.inventoryItemIds || []), item.id],
  };

  // Auto-equipa após comprar
  const equipped = equipAvatarItem(updated, item);

  return { success: true, updated: equipped };
}

export function equipAvatarItem(current: UserProgress, item: AvatarItem): UserProgress {
  const shopItem = getShopItemById(item.id);
  if (shopItem) {
    return equipShopItem(current, item.id);
  }

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
      "valerius_scribe";

    return {
      ...prepared,
      equippedAvatar: {
        ...currentConfig,
        archetype: item.archetype === "all" ? "human" : item.archetype,
        subType,
      },
    };
  }

  const upperMap: Record<string, SlotType> = {
    head: "HEAD",
    body: "CHEST",
    hand: "MAIN_HAND",
  };
  const upper = upperMap[item.slot];

  return {
    ...prepared,
    equipment: upper
      ? {
          ...STARTER_EQUIPMENT,
          ...(prepared.equipment || {}),
          [upper]: item.id,
        }
      : prepared.equipment,
    equippedAvatar: {
      ...currentConfig,
      equipped: {
        ...currentConfig.equipped,
        [item.slot]: item.id,
        ...(upper ? { [upper]: item.id } : {}),
      },
    },
  };
}

export function unequipAvatarSlot(
  current: UserProgress,
  slot: "head" | "eyes" | "body" | "hand" | "aura" | SlotType
): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const currentConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const newEquipped = { ...currentConfig.equipped };

  delete newEquipped[slot];

  const upperMap: Record<string, SlotType> = {
    head: "HEAD",
    body: "CHEST",
    hand: "MAIN_HAND",
  };
  const upper = upperMap[slot] || (slot.toUpperCase() as SlotType);
  if (ALL_SLOT_TYPES.includes(upper)) {
    delete newEquipped[upper];
    const currentEquipment = {
      ...STARTER_EQUIPMENT,
      ...(prepared.equipment || {}),
      [upper]: null,
    };
    return {
      ...prepared,
      equipment: currentEquipment,
      equippedAvatar: {
        ...currentConfig,
        equipped: newEquipped,
      },
    };
  }

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
