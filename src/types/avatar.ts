// RPG Gamification Enums and Types

export type SlotType =
  | "HEAD"
  | "CHEST"
  | "LEGS"
  | "MAIN_HAND"
  | "OFF_HAND"
  | "BACK"
  | "ACCESSORY";

export const ALL_SLOT_TYPES: SlotType[] = [
  "HEAD",
  "CHEST",
  "LEGS",
  "MAIN_HAND",
  "OFF_HAND",
  "BACK",
  "ACCESSORY",
];

export type ItemRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export type ArchetypeCategory = "HUMAN_MALE" | "HUMAN_FEMALE" | "MYTHIC_BEAST";

export interface StatBonus {
  xpMultiplier?: number;
  streakProtection?: number;
  coinBonus?: number;
}

export interface CharacterBase {
  id: string;
  name: string;
  title: string;
  category: ArchetypeCategory;
  lore: string;
  nativeLanguageBonus: string;
  baseSpriteAsset: string;
  supportedLanguageBonusIds?: string[];
  avatarGreeting?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  slot: SlotType;
  rarity: ItemRarity;
  costCoins: number;
  requiredLevel: number;
  statBonus: StatBonus;
  visualAsset: string;
  description: string;
  inspiration: string;
  icon?: string;
}

export type AvatarEquipment = Record<SlotType, string | null>;

export interface CombinedStats {
  finalXpMultiplier: number;
  finalStreakProtection: number;
  finalCoinBonus: number;
  totalItemStats: {
    xpMultiplier: number;
    streakProtection: number;
    coinBonus: number;
  };
  characterBonus: {
    characterId: string | null;
    characterName: string | null;
    xpMultiplier: number;
    coinBonus: number;
    active: boolean;
    languageBonusCategory: string | null;
  };
}

// Backward compatibility types
export type AvatarArchetype = "human" | "animal" | "monster" | ArchetypeCategory;

export type AvatarSlot =
  | SlotType
  | "head"
  | "eyes"
  | "body"
  | "hand"
  | "aura"
  | "archetype";

export type AvatarItemRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | ItemRarity;

export interface AvatarItem {
  id: string;
  name: string;
  slot: AvatarSlot;
  archetype: AvatarArchetype | "all";
  description: string;
  price: number;
  minLevel: number;
  rarity: AvatarItemRarity;
  icon?: string;
  inspiration?: string;
  statBonus?: StatBonus;
}

export interface AvatarConfig {
  archetype: AvatarArchetype;
  subType: string;
  primaryColor: string;
  secondaryColor: string;
  equipped: {
    head?: string;
    eyes?: string;
    body?: string;
    hand?: string;
    aura?: string;
    HEAD?: string | null;
    CHEST?: string | null;
    LEGS?: string | null;
    MAIN_HAND?: string | null;
    OFF_HAND?: string | null;
    BACK?: string | null;
    ACCESSORY?: string | null;
    [key: string]: string | null | undefined;
  };
}

export type AvatarAnimationState =
  | "idle"
  | "speaking"
  | "listening"
  | "celebrating"
  | "thinking";

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalCoinsEarned: number;
}
