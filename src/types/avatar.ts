export type AvatarArchetype = "human" | "animal" | "monster";

export type AvatarSlot = "head" | "eyes" | "body" | "hand" | "aura" | "archetype";

export type AvatarItemRarity = "common" | "rare" | "epic" | "legendary";

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
}

export interface AvatarConfig {
  archetype: AvatarArchetype;
  subType: string; // ex: "adventurer" | "scholar" | "wolf" | "owl" | "cat" | "dragon" | "golem" | "elemental" | "goblin"
  primaryColor: string;
  secondaryColor: string;
  equipped: {
    head?: string;
    eyes?: string;
    body?: string;
    hand?: string;
    aura?: string;
  };
}

export type AvatarAnimationState = "idle" | "speaking" | "listening" | "celebrating" | "thinking";

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalCoinsEarned: number;
}
