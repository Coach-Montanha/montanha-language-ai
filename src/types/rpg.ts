// ============================================================================
// SISTEMA DE AVATARES, EQUIPAMENTOS E GAMIFICAÇÃO ESTILO RAGNAROK ONLINE (RO)
// Plataforma: Antigravity Game Engine / Runtime
// ============================================================================

export enum EquipmentSlot {
  HEAD_UPPER = "HEAD_UPPER",     // Chapéu / Touca / Orelhas / Tiara
  HEAD_MIDDLE = "HEAD_MIDDLE",   // Óculos / Viseira / Tapa-olho
  HEAD_LOWER = "HEAD_LOWER",     // Pipa / Folha / Máscara / Rosa na boca
  ARMOR = "ARMOR",               // Túnicas, Armaduras de Malha, Coletes
  GARMENT = "GARMENT",           // Capas, Asas, Mantos
  FOOTGEAR = "FOOTGEAR",         // Botas de Couro, Sandálias, Grevas
  RIGHT_HAND = "RIGHT_HAND",     // Espada, Cajado, Martelo de Forja
  LEFT_HAND = "LEFT_HAND",       // Escudos, Bíblia/Livros de feitiço
  BACKPACK = "BACKPACK",         // Mochila do Mercador / Alforge de Estudos
  PET_FAMILIAR = "PET_FAMILIAR"  // Monstrinhos companheiros (Poring, Spore)
}

export enum ItemTier {
  NOVICE = "NOVICE",         // Básico inicial
  FIRST_CLASS = "FIRST_CLASS", // Aprendiz dedicado
  SECOND_CLASS = "SECOND_CLASS", // Intermediário avançado
  TRANSCENDENT = "TRANSCENDENT"  // Fluência e maestria
}

export enum ArchetypeRole {
  SWORDSMAN = "SWORDSMAN",   // Foco em vocabulário de ação e verbos fortes
  MAGICIAN = "MAGICIAN",     // Foco em sintaxe e conjurações gramaticais
  BLACKSMITH = "BLACKSMITH", // Foco em acúmulo de moedas e repetição
  PRIEST = "PRIEST",         // Foco em regeneração de ofensiva / cura de erros
  HUNTER = "HUNTER",         // Foco em precisão auditiva / listening rápido
  MYTHIC_BEAST = "MYTHIC_BEAST" // Formas mitológicas e mascotes
}

// ----------------------------------------------------------------------------
// INTERFACES DO SISTEMA
// ----------------------------------------------------------------------------

export interface BaseClassAvatar {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "NEUTRAL_CREATURE";
  role: ArchetypeRole;
  description: string;
  baseSpriteKey: string;
  languagePerk: string; // Ex: Bônus de retenção de memória em exercícios
}

export interface EquipItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  tier: ItemTier;
  costZeny: number;        // Moeda temática (Zeny / Gemas)
  requiredLevel: number;
  stats: {
    xpMultiplier?: number;        // Bônus de XP na conclusão de lições
    coinDropBonus?: number;       // Moedas extras ao acertar questões
    streakShieldPercent?: number; // Salva ofensiva (streak) em caso de erro
    timeBonusSeconds?: number;    // Tempo extra em testes de listening/speed
  };
  spriteLayer: string;      // Asset compatível com o boneco chibi
  flavorText: string;
}

export type RoEquipmentMap = Partial<Record<EquipmentSlot, EquipItem | null>>;
