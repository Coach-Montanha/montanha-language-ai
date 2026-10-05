import { UserProgress, SupportedLanguage } from "@/types/language";
import {
  AvatarConfig,
  AvatarItem,
  LevelInfo,
  SlotType,
  ALL_SLOT_TYPES,
  CombinedStats,
  EquipmentSlot,
  AvatarArchetype,
  AvatarEquipment,
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
  const activeChar = getCharacterById(selectedCharacterId);
  const charSubType = activeChar?.baseSpriteAsset || "char_tactician_m";
  const charArchetype = activeChar?.category === "MYTHIC_BEAST" ? "monster" : "human";

  const defaultEquipment: AvatarEquipment =
    selectedCharacterId === "char_tactician_m" && !progress.equipment
      ? {
          ...STARTER_EQUIPMENT,
          HEAD: "hat_pointed_wanderer",
          HEADWEAR: "hat_pointed_wanderer",
          CHEST: "outfit_scout_tunic",
          OUTFIT: "outfit_scout_tunic",
          MAIN_HAND: "weapon_runic_rapier",
          MAIN_TOOL: "weapon_runic_rapier",
          BACK: "back_field_lexicon_pack",
          BACKPACK_CAPE: "back_field_lexicon_pack",
          FAMILIAR: "familiar_clockwork_golem",
        }
      : STARTER_EQUIPMENT;

  const equipment: AvatarEquipment = {
    ...defaultEquipment,
    ...(progress.equipment || {}),
  };

  // Se o progresso forneceu explicitamente slots desequipados (null) em qualquer alias de uma categoria,
  // propaga o estado para os aliases irmãos correspondentes para evitar que itens padrão reapareçam
  if (progress.equipment) {
    const SLOT_GROUPS: string[][] = [
      ["HEAD", "HEADWEAR", "HEAD_UPPER", "HEAD_MIDDLE", "HEAD_LOWER", "head"],
      ["CHEST", "OUTFIT", "ARMOR", "body"],
      ["LEGS", "FOOTGEAR", "legs"],
      ["MAIN_HAND", "MAIN_TOOL", "RIGHT_HAND", "hand"],
      ["OFF_HAND", "OFF_TOOL", "LEFT_HAND", "off_hand"],
      ["BACK", "BACKPACK_CAPE", "GARMENT", "BACKPACK", "back"],
      ["FAMILIAR", "PET_FAMILIAR", "pet"],
      ["ACCESSORY", "accessory"],
    ];

    for (const group of SLOT_GROUPS) {
      const explicitNull = group.some((k) => progress.equipment![k] === null);
      if (explicitNull) {
        for (const k of group) {
          equipment[k] = null;
        }
      }
    }
  }

  const inventoryItemIds = Array.from(
    new Set([
      ...STARTER_SHOP_ITEM_IDS,
      ...(progress.inventoryItemIds || []),
      ...(progress.unlockedAvatarItems || []),
    ])
  );

  const lowerSlotMap: Record<string, string> = {
    HEAD: "head",
    CHEST: "body",
    LEGS: "legs",
    MAIN_HAND: "hand",
    OFF_HAND: "off_hand",
    BACK: "back",
    ACCESSORY: "accessory",
    HEAD_UPPER: "head",
    HEAD_MIDDLE: "head",
    HEAD_LOWER: "head",
    ARMOR: "body",
    GARMENT: "back",
    FOOTGEAR: "legs",
    RIGHT_HAND: "hand",
    LEFT_HAND: "off_hand",
    BACKPACK: "back",
    PET_FAMILIAR: "pet",
    HEADWEAR: "head",
    OUTFIT: "body",
    MAIN_TOOL: "hand",
    OFF_TOOL: "off_hand",
    BACKPACK_CAPE: "back",
    FAMILIAR: "pet",
  };

  // Se selectedCharacterId foi definido/trocado, garante que o avatar reflita o arquétipo e o subType corretos
  const targetSubType =
    progress.selectedCharacterId && activeChar
      ? activeChar.baseSpriteAsset
      : progress.equippedAvatar?.subType || charSubType;

  const targetArchetype =
    activeChar?.category === "MYTHIC_BEAST"
      ? "monster"
      : progress.equippedAvatar?.archetype || charArchetype;

  const equippedAvatar: AvatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...(progress.equippedAvatar || {}),
    archetype: targetArchetype,
    subType: targetSubType,
    equipped: {
      ...DEFAULT_AVATAR_CONFIG.equipped,
      ...(progress.equippedAvatar?.equipped || {}),
      ...equipment,
    },
  };

  // Sincroniza slots mapeados para as chaves canônicas em minúsculo do avatar (ex: BACKPACK_CAPE -> back, HEADWEAR -> head)
  for (const [slotKey, lowerKey] of Object.entries(lowerSlotMap)) {
    const val = equipment[slotKey as SlotType];
    if (val === null) {
      equippedAvatar.equipped[slotKey] = null;
      equippedAvatar.equipped[lowerKey] = null;
    } else if (val) {
      equippedAvatar.equipped[slotKey] = val;
      // Dá preferência a Studio Fantasy e RO se fornecidos sobre slots legados padrão
      const isStudioOrRo =
        slotKey === "BACKPACK_CAPE" ||
        slotKey === "OUTFIT" ||
        slotKey === "HEADWEAR" ||
        slotKey === "MAIN_TOOL" ||
        slotKey === "OFF_TOOL" ||
        slotKey === "FAMILIAR" ||
        slotKey === "ARMOR" ||
        slotKey === "GARMENT" ||
        slotKey === "RIGHT_HAND";
      if (equippedAvatar.equipped[lowerKey] === null) {
        continue;
      }
      if (!equippedAvatar.equipped[lowerKey] || isStudioOrRo) {
        equippedAvatar.equipped[lowerKey] = val;
      }
    }
  }

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

// Mapeamento de slots correspondentes entre o sistema clássico (7 slots), Ragnarok Online (10 slots) e Studio Fantasy
// Evita duplicação fantasma de equipamentos simultâneos (ex: Peitoral Clássico + Armadura RO + Traje Studio Fantasy)
export const CORRESPONDING_SLOTS: Record<string, string[]> = {
  HEAD_UPPER: ["HEAD", "HEADWEAR"],
  HEAD: ["HEAD_UPPER", "HEADWEAR"],
  HEADWEAR: ["HEAD", "HEAD_UPPER"],
  ARMOR: ["CHEST", "OUTFIT"],
  CHEST: ["ARMOR", "OUTFIT"],
  OUTFIT: ["CHEST", "ARMOR"],
  FOOTGEAR: ["LEGS"],
  LEGS: ["FOOTGEAR"],
  RIGHT_HAND: ["MAIN_HAND", "MAIN_TOOL"],
  MAIN_HAND: ["RIGHT_HAND", "MAIN_TOOL"],
  MAIN_TOOL: ["MAIN_HAND", "RIGHT_HAND"],
  LEFT_HAND: ["OFF_HAND", "OFF_TOOL"],
  OFF_HAND: ["LEFT_HAND", "OFF_TOOL"],
  OFF_TOOL: ["OFF_HAND", "LEFT_HAND"],
  GARMENT: ["BACK", "BACKPACK_CAPE"],
  BACK: ["GARMENT", "BACKPACK", "BACKPACK_CAPE"],
  BACKPACK: ["BACK", "BACKPACK_CAPE"],
  BACKPACK_CAPE: ["BACK", "GARMENT", "BACKPACK"],
  FAMILIAR: ["PET_FAMILIAR", "ACCESSORY"],
  PET_FAMILIAR: ["FAMILIAR"],
};

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

  // Resolve precedência de slots equipados evitando sobreposição dupla entre slots RO, Studio Fantasy e legado
  const effectiveSlots: Record<string, string> = {};
  for (const [slot, id] of Object.entries(equipment)) {
    if (id) effectiveSlots[slot] = id;
  }
  if (effectiveSlots[EquipmentSlot.HEAD_UPPER] && effectiveSlots["HEAD"]) {
    delete effectiveSlots["HEAD"];
  }
  if (effectiveSlots["HEADWEAR"] && effectiveSlots["HEAD"]) {
    delete effectiveSlots["HEAD"];
  }
  if (effectiveSlots["HEADWEAR"] && effectiveSlots[EquipmentSlot.HEAD_UPPER]) {
    delete effectiveSlots[EquipmentSlot.HEAD_UPPER];
  }
  if (effectiveSlots[EquipmentSlot.ARMOR] && effectiveSlots["CHEST"]) {
    delete effectiveSlots["CHEST"];
  }
  if (effectiveSlots["OUTFIT"] && effectiveSlots["CHEST"]) {
    delete effectiveSlots["CHEST"];
  }
  if (effectiveSlots["OUTFIT"] && effectiveSlots[EquipmentSlot.ARMOR]) {
    delete effectiveSlots[EquipmentSlot.ARMOR];
  }
  if (effectiveSlots[EquipmentSlot.FOOTGEAR] && effectiveSlots["LEGS"]) {
    delete effectiveSlots["LEGS"];
  }
  if (effectiveSlots[EquipmentSlot.RIGHT_HAND] && effectiveSlots["MAIN_HAND"]) {
    delete effectiveSlots["MAIN_HAND"];
  }
  if (effectiveSlots["MAIN_TOOL"] && effectiveSlots["MAIN_HAND"]) {
    delete effectiveSlots["MAIN_HAND"];
  }
  if (effectiveSlots["MAIN_TOOL"] && effectiveSlots[EquipmentSlot.RIGHT_HAND]) {
    delete effectiveSlots[EquipmentSlot.RIGHT_HAND];
  }
  if (effectiveSlots[EquipmentSlot.LEFT_HAND] && effectiveSlots["OFF_HAND"]) {
    delete effectiveSlots["OFF_HAND"];
  }
  if (effectiveSlots["OFF_TOOL"] && effectiveSlots["OFF_HAND"]) {
    delete effectiveSlots["OFF_HAND"];
  }
  if (effectiveSlots["OFF_TOOL"] && effectiveSlots[EquipmentSlot.LEFT_HAND]) {
    delete effectiveSlots[EquipmentSlot.LEFT_HAND];
  }
  if (effectiveSlots[EquipmentSlot.GARMENT] && effectiveSlots["BACK"]) {
    delete effectiveSlots["BACK"];
  }
  if (effectiveSlots["BACKPACK_CAPE"] && effectiveSlots["BACK"]) {
    delete effectiveSlots["BACK"];
  }
  if (effectiveSlots["BACKPACK_CAPE"] && effectiveSlots[EquipmentSlot.GARMENT]) {
    delete effectiveSlots[EquipmentSlot.GARMENT];
  }
  if (effectiveSlots["FAMILIAR"] && effectiveSlots[EquipmentSlot.PET_FAMILIAR]) {
    delete effectiveSlots[EquipmentSlot.PET_FAMILIAR];
  }

  for (const [slot, itemId] of Object.entries(effectiveSlots)) {
    const item = getShopItemById(itemId);
    if (item && item.statBonus) {
      itemXpMultiplier += item.statBonus.xpMultiplier || 0;
      itemStreakProtection += item.statBonus.streakProtection || 0;
      itemCoinBonus += item.statBonus.coinBonus || 0;
    }
  }

  const charId = prepared.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const character = getCharacterById(charId);

  const lang = targetLanguage || prepared.selectedLanguage;
  const matchesLang = Boolean(
    character && lang && character.supportedLanguageBonusIds?.includes(lang)
  );

  const charXpBonus = character ? (matchesLang ? 0.15 : 0.05) : 0;
  const charCoinBonus = character ? (matchesLang ? 0.10 : 0.05) : 0;

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

  // Se o slot possui slots correspondentes conflitantes (ex: ARMOR vs CHEST), desequipa o conflitante
  const conflicts = CORRESPONDING_SLOTS[item.slot] || [];
  for (const conflictSlot of conflicts) {
    newEquipment[conflictSlot] = null;
    newEquippedAvatar.equipped[conflictSlot] = null;
  }

  return {
    ...prepared,
    equipment: newEquipment,
    equippedAvatar: newEquippedAvatar,
  };
}

export function unequipShopSlot(current: UserProgress, slot: SlotType | string): UserProgress {
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
  newEquipped[slot] = null;

  // Desequipa também qualquer slot correspondente legado/RO associado
  const conflicts = CORRESPONDING_SLOTS[slot] || [];
  for (const conflictSlot of conflicts) {
    if (newEquipment[conflictSlot] !== undefined) {
      newEquipment[conflictSlot] = null;
      newEquipped[conflictSlot] = null;
    }
  }

  const lowerMap: Record<string, string> = {
    HEAD: "head",
    CHEST: "body",
    LEGS: "legs",
    MAIN_HAND: "hand",
    OFF_HAND: "off_hand",
    BACK: "back",
    ACCESSORY: "accessory",
    HEAD_UPPER: "head",
    HEAD_MIDDLE: "head",
    HEAD_LOWER: "head",
    ARMOR: "body",
    GARMENT: "body",
    FOOTGEAR: "legs",
    RIGHT_HAND: "hand",
    LEFT_HAND: "off_hand",
    BACKPACK: "back",
    PET_FAMILIAR: "accessory",
  };
  if (lowerMap[slot]) {
    newEquipped[lowerMap[slot]] = null;
  }

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

  const charKey = characterId.toLowerCase();
  if (charKey === "char_tactician_m" || charKey === "tactician_swordsman" || charKey.includes("kaelen") || charKey.includes("runeguard")) {
    return equipStudioFantasyKit(prepared, "kaelen");
  }
  if (charKey === "char_archivist_f" || charKey === "hooded_archivist" || charKey.includes("lyanna") || charKey.includes("elena")) {
    return equipStudioFantasyKit(prepared, "lyanna");
  }
  if (charKey === "char_elemental_beast" || charKey === "mythic_elemental_mentor" || charKey.includes("ignisaur") || charKey.includes("glaurung")) {
    return equipStudioFantasyKit(prepared, "ignisaur");
  }
  if (charKey === "char_automaton_trixie" || charKey === "miniature_automaton" || charKey.includes("trixie")) {
    return equipStudioFantasyKit(prepared, "trixie");
  }

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

export function equipStudioFantasyKit(
  current: UserProgress,
  heroId: "kaelen" | "lyanna" | "ignisaur" | string = "kaelen"
): UserProgress {
  const prepared = ensureGamificationProgress(current);
  const heroKey = heroId.toLowerCase();

  let selectedCharacterId = "char_tactician_m";
  let subType = "char_tactician_m";
  let archetype: AvatarArchetype = "human";
  let primaryColor = "#38bdf8";
  let secondaryColor = "#fbbf24";
  let headItem: string | null = "hat_pointed_wanderer";
  let outfitItem: string | null = "outfit_scout_tunic";
  let weaponItem: string | null = "weapon_runic_rapier";
  let backItem: string | null = "back_field_lexicon_pack";
  let familiarItem: string | null = "familiar_clockwork_golem";

  if (heroKey.includes("lyanna") || heroKey.includes("elena") || heroKey === "char_archivist_f" || heroKey === "hooded_archivist") {
    selectedCharacterId = "char_archivist_f";
    subType = "char_archivist_f";
    archetype = "human";
    primaryColor = "#c084fc";
    secondaryColor = "#fbbf24";
    headItem = "hood_silk_archivist";
    outfitItem = "outfit_ceremonial_silks";
    weaponItem = "weapon_gnarled_staff";
  } else if (heroKey.includes("ignisaur") || heroKey.includes("glaurung") || heroKey === "char_elemental_beast" || heroKey === "mythic_elemental_mentor") {
    selectedCharacterId = "char_elemental_beast";
    subType = "char_elemental_beast";
    archetype = "monster";
    primaryColor = "#ea580c";
    secondaryColor = "#fbbf24";
    headItem = null;
    outfitItem = "outfit_ceremonial_silks";
    weaponItem = "weapon_gnarled_staff";
  } else if (heroKey.includes("trixie") || heroKey === "char_automaton_trixie" || heroKey === "miniature_automaton") {
    selectedCharacterId = "char_automaton_trixie";
    subType = "char_automaton_trixie";
    archetype = "monster";
    primaryColor = "#eab308";
    secondaryColor = "#ca8a04";
    headItem = null;
    outfitItem = "outfit_scout_tunic";
    weaponItem = null;
    backItem = "back_field_lexicon_pack";
    familiarItem = "familiar_clockwork_golem";
  }

  const kitItems = [headItem, outfitItem, weaponItem, backItem, familiarItem].filter(Boolean) as string[];
  const unlocked = Array.from(new Set([...(prepared.unlockedAvatarItems || []), ...kitItems]));
  const inventory = Array.from(new Set([...(prepared.inventoryItemIds || []), ...kitItems]));

  const updatedEquipment = {
    ...(prepared.equipment || {}),
    HEADWEAR: headItem,
    HEAD: headItem,
    OUTFIT: outfitItem,
    CHEST: outfitItem,
    MAIN_TOOL: weaponItem,
    MAIN_HAND: weaponItem,
    BACKPACK_CAPE: backItem,
    BACK: backItem,
    FAMILIAR: familiarItem,
  };

  const updatedEquipped: AvatarConfig["equipped"] = {
    ...(prepared.equippedAvatar?.equipped || {}),
    ...(headItem ? { head: headItem } : {}),
    HEAD: headItem,
    HEADWEAR: headItem,
    ...(outfitItem ? { body: outfitItem } : {}),
    CHEST: outfitItem,
    OUTFIT: outfitItem,
    ...(weaponItem ? { hand: weaponItem } : {}),
    MAIN_HAND: weaponItem,
    MAIN_TOOL: weaponItem,
    ...(backItem ? { back: backItem } : {}),
    BACK: backItem,
    BACKPACK_CAPE: backItem,
    ...(familiarItem ? { pet: familiarItem } : {}),
    FAMILIAR: familiarItem,
  };
  if (!headItem) {
    delete updatedEquipped.head;
  }

  return {
    ...prepared,
    selectedCharacterId,
    unlockedAvatarItems: unlocked,
    inventoryItemIds: inventory,
    equipment: updatedEquipment,
    equippedAvatar: {
      archetype,
      subType,
      primaryColor,
      secondaryColor,
      equipped: updatedEquipped,
    },
  };
}
