// ============================================================================
// SISTEMA DE CUSTOMIZAÇÃO E ANIMAÇÃO DE AVATARES - ESTILO STUDIO FANTASY
// Compatível com Runtime Antigravity
// ============================================================================

import { ItemTier, EquipmentSlot } from "@/types/rpg";
import { CharacterBase, ShopItem, SlotType } from "@/types/avatar";

export enum AvatarRenderLayer {
  SHADOW = 0,
  FAMILIAR_BACK = 1,
  BACK_EQUIP = 2,       // Capas, Asas, Mochilas de Escriba
  BODY_BASE = 3,        // Silhueta base do personagem (anatomia e olhos)
  HAIR_BASE = 4,        // Cabelo base
  LEGS_GEAR = 5,        // Botas e perneiras
  TORSO_GEAR = 6,       // Túnicas, coletes, armaduras de couro/aço
  HEAD_LOWER = 7,       // Máscaras, folhas, amuletos no queixo
  HEAD_UPPER = 8,       // Capuzes, bétulas, elmos, chapéus cônicos
  OFF_HAND = 9,         // Tomos de gramática, lanternas, runas
  MAIN_HAND = 10,       // Lâminas rúnicas, cajados entalhados, martelos
  FAMILIAR_FRONT = 11,  // Mascotes míticos no chão/ombro
  AURA_FX = 12          // Partículas mágicas de ofensiva (Streak FX)
}

export enum SlotCategory {
  HEADWEAR = "HEADWEAR",
  OUTFIT = "OUTFIT",
  MAIN_TOOL = "MAIN_TOOL",
  OFF_TOOL = "OFF_TOOL",
  BACKPACK_CAPE = "BACKPACK_CAPE",
  FAMILIAR = "FAMILIAR"
}

export { ItemTier };

export interface CharacterArchetype {
  id: string;
  name: string;
  title: string;
  lore: string;
  baseSpriteKey: string;
  defaultSkinTone: string;
  innatePassive: {
    name: string;
    description: string;
    xpMultiplier: number;
    bonusCoinRate: number;
  };
}

export interface WardrobeItem {
  id: string;
  name: string;
  slot: SlotCategory;
  layer: AvatarRenderLayer;
  tier: ItemTier;
  costCoins: number;
  requiredLevel: number;
  spriteAssetUrl: string;
  anchorPoint: { x: number; y: number }; // Alinhamento exato de montagem dos sprites
  gamificationBonus: {
    streakShieldChance?: number; // Salva o dia caso esqueça ou erre a lição
    extraTimeSeconds?: number;   // Tempo bônus em desafios de pronúncia/listening
    xpBoostPercent?: number;     // Acelera avanço de nível
  };
  flavorText: string;
}

// ============================================================================
// 1. BANCO DE PERSONAGENS BASE
// ============================================================================

export const ARCHETYPES_REGISTRY: Record<string, CharacterArchetype> = {
  tactician_swordsman: {
    id: "char_tactician_m",
    name: "Kaelen, o Espadachim Linguista",
    title: "Vanguarda da Sintaxe",
    lore: "Viajante de armadura leve que decifra dialetos perdidos em runas de combate.",
    baseSpriteKey: "sprites/characters/kaelen_base.png",
    defaultSkinTone: "#e5b89c",
    innatePassive: {
      name: "Corte Preciso",
      description: "+10% de ganho de XP em exercícios de formação de frases.",
      xpMultiplier: 1.10,
      bonusCoinRate: 1.05
    }
  },
  hooded_archivist: {
    id: "char_archivist_f",
    name: "Lyanna, a Maga de Véu",
    title: "Arquivista do Éter",
    lore: "Estudiosa com capuz e cajado de raízes entrelaçadas, mestre na audição atenta.",
    baseSpriteKey: "sprites/characters/lyanna_base.png",
    defaultSkinTone: "#f1c2a2",
    innatePassive: {
      name: "Eco Poliglota",
      description: "+3 segundos de tolerância em testes rápidos de audição.",
      xpMultiplier: 1.05,
      bonusCoinRate: 1.15
    }
  },
  mythic_elemental_mentor: {
    id: "char_elemental_beast",
    name: "Ignisaur, a Chama Ancestral",
    title: "Monstro Guardião do Léxico",
    lore: "Entidade draconiana serena envolta em sedas cerimoniais e fogo espiritual.",
    baseSpriteKey: "sprites/characters/ignisaur_base.png",
    defaultSkinTone: "#ba7b56",
    innatePassive: {
      name: "Sopro de Sabedoria",
      description: "Dobra as moedas recebidas em revisões perfeitas sem erros.",
      xpMultiplier: 1.20,
      bonusCoinRate: 1.30
    }
  }
};

// ============================================================================
// 2. CATÁLOGO DA LOJA (ESTÉTICA ANIMATION-STUDIO)
// ============================================================================

export const WARDROBE_CATALOG: WardrobeItem[] = [
  // --- CABEÇA / CAPUZES / CHAPÉUS ---
  {
    id: "hat_pointed_wanderer",
    name: "Chapéu Cônico do Peregrino",
    slot: SlotCategory.HEADWEAR,
    layer: AvatarRenderLayer.HEAD_UPPER,
    tier: ItemTier.APPRENTICE,
    costCoins: 350,
    requiredLevel: 2,
    spriteAssetUrl: "assets/head/wanderer_hat.png",
    anchorPoint: { x: 0.5, y: 0.95 },
    gamificationBonus: { xpBoostPercent: 5 },
    flavorText: "Aba ampla de feltro escuro que mantém a concentração focada nas lições diárias."
  },
  {
    id: "hood_silk_archivist",
    name: "Capuz Carmesim do Escriba Real",
    slot: SlotCategory.HEADWEAR,
    layer: AvatarRenderLayer.HEAD_UPPER,
    tier: ItemTier.SCHOLAR,
    costCoins: 900,
    requiredLevel: 7,
    spriteAssetUrl: "assets/head/archivist_hood.png",
    anchorPoint: { x: 0.5, y: 0.88 },
    gamificationBonus: { streakShieldChance: 0.15 },
    flavorText: "Forrado com lã macia e brocados rúnicos, bloqueia o ruído exterior para melhor pronúncia."
  },

  // --- TRAJES / ARMADURAS ---
  {
    id: "outfit_scout_tunic",
    name: "Túnica de Couro com Faixa Runada",
    slot: SlotCategory.OUTFIT,
    layer: AvatarRenderLayer.TORSO_GEAR,
    tier: ItemTier.APPRENTICE,
    costCoins: 500,
    requiredLevel: 3,
    spriteAssetUrl: "assets/outfit/scout_tunic.png",
    anchorPoint: { x: 0.5, y: 0.5 },
    gamificationBonus: { xpBoostPercent: 8 },
    flavorText: "Armadura ágil e confortável para longas caminhadas através de novos vocabulários."
  },
  {
    id: "outfit_ceremonial_silks",
    name: "Quimono Nobre do Guardião Dracônico",
    slot: SlotCategory.OUTFIT,
    layer: AvatarRenderLayer.TORSO_GEAR,
    tier: ItemTier.POLYGLOT_KNIGHT,
    costCoins: 2200,
    requiredLevel: 16,
    spriteAssetUrl: "assets/outfit/ceremonial_robe.png",
    anchorPoint: { x: 0.5, y: 0.45 },
    gamificationBonus: { xpBoostPercent: 15, streakShieldChance: 0.25 },
    flavorText: "Seda tecida com fios de fogo brando; símbolo de erudição refinada e persistência."
  },

  // --- FERRAMENTAS PRINCIPAIS & ARMAS ---
  {
    id: "weapon_runic_rapier",
    name: "Florete do Tradutor Ágil",
    slot: SlotCategory.MAIN_TOOL,
    layer: AvatarRenderLayer.MAIN_HAND,
    tier: ItemTier.SCHOLAR,
    costCoins: 1200,
    requiredLevel: 10,
    spriteAssetUrl: "assets/weapons/runic_rapier.png",
    anchorPoint: { x: 0.2, y: 0.8 },
    gamificationBonus: { extraTimeSeconds: 5 },
    flavorText: "Lâmina polida que reflete e corrige ambiguidades gramaticais num lampejo."
  },
  {
    id: "weapon_gnarled_staff",
    name: "Cajado das Raízes Ancestrais",
    slot: SlotCategory.MAIN_TOOL,
    layer: AvatarRenderLayer.MAIN_HAND,
    tier: ItemTier.APPRENTICE,
    costCoins: 400,
    requiredLevel: 1,
    spriteAssetUrl: "assets/weapons/curved_staff.png",
    anchorPoint: { x: 0.3, y: 0.9 },
    gamificationBonus: { xpBoostPercent: 5 },
    flavorText: "Madeira viva com nó curvado, guia os passos do estudante iniciante."
  },

  // --- MOCHILAS E CAPAS (BACK) ---
  {
    id: "back_field_lexicon_pack",
    name: "Alforge de Campo com Pergaminhos",
    slot: SlotCategory.BACKPACK_CAPE,
    layer: AvatarRenderLayer.BACK_EQUIP,
    tier: ItemTier.APPRENTICE,
    costCoins: 650,
    requiredLevel: 4,
    spriteAssetUrl: "assets/back/scholar_backpack.png",
    anchorPoint: { x: 0.5, y: 0.6 },
    gamificationBonus: { xpBoostPercent: 6 },
    flavorText: "Bolsos de fivela desenhados para guardar cadernos de anotações e cartões mnemônicos."
  },

  // --- COMPANHEIROS / FAMILIARES MITOLÓGICOS ---
  {
    id: "familiar_clockwork_golem",
    name: "Golem Autômato de Bolso",
    slot: SlotCategory.FAMILIAR,
    layer: AvatarRenderLayer.FAMILIAR_FRONT,
    tier: ItemTier.POLYGLOT_KNIGHT,
    costCoins: 2800,
    requiredLevel: 18,
    spriteAssetUrl: "assets/pets/clockwork_golem.png",
    anchorPoint: { x: 0.85, y: 0.1 },
    gamificationBonus: { streakShieldChance: 0.30, extraTimeSeconds: 6 },
    flavorText: "Mascote mecânico que guarda as moedas e bate palmas a cada acerto consecutivo."
  }
];

// ============================================================================
// 3. CONTROLADOR DE AVATAR (ANTIGRAVITY AVATAR CONTROLLER)
// ============================================================================

export class AntigravityAvatarController {
  private character: CharacterArchetype;
  private currentLevel: number;
  private coinBalance: number;
  private ownedItemIds: Set<string>;
  private equippedSlots: Map<SlotCategory, WardrobeItem | null>;

  constructor(baseArchetypeKey: string, initialLevel: number = 1, initialCoins: number = 600) {
    this.character = ARCHETYPES_REGISTRY[baseArchetypeKey] ?? ARCHETYPES_REGISTRY["tactician_swordsman"]!;
    this.currentLevel = initialLevel;
    this.coinBalance = initialCoins;
    this.ownedItemIds = new Set<string>();
    this.equippedSlots = new Map();

    Object.values(SlotCategory).forEach(slot => this.equippedSlots.set(slot, null));
  }

  // Getters & Setters
  public getCharacter(): CharacterArchetype {
    return this.character;
  }

  public setCharacter(character: CharacterArchetype): void {
    this.character = character;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public setCurrentLevel(level: number): void {
    this.currentLevel = level;
  }

  public getCoinBalance(): number {
    return this.coinBalance;
  }

  public setCoinBalance(coins: number): void {
    this.coinBalance = coins;
  }

  public addCoins(coins: number): void {
    this.coinBalance += Math.max(0, coins);
  }

  public getOwnedItemIds(): Set<string> {
    return this.ownedItemIds;
  }

  public setOwnedItemIds(ids: string[] | Set<string>): void {
    this.ownedItemIds = new Set(ids);
  }

  public getEquippedSlots(): Map<SlotCategory, WardrobeItem | null> {
    return this.equippedSlots;
  }

  public getEquippedItem(slot: SlotCategory): WardrobeItem | null {
    return this.equippedSlots.get(slot) || null;
  }

  // --- LOJA: COMPRA DE ITENS ---
  public purchaseItem(itemId: string): { success: boolean; message: string; remainingCoins?: number } {
    const item = WARDROBE_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: "Artigo inexistente no catálogo." };

    if (this.ownedItemIds.has(itemId)) {
      return { success: false, message: "Já possuis este artigo no teu inventário." };
    }

    if (this.currentLevel < item.requiredLevel) {
      return {
        success: false,
        message: `Nível insuficiente. Exige Nível ${item.requiredLevel} (O teu nível atual: ${this.currentLevel}).`
      };
    }

    if (this.coinBalance < item.costCoins) {
      return {
        success: false,
        message: `Moedas insuficientes. Custo: ${item.costCoins} moedas (Tens: ${this.coinBalance}).`
      };
    }

    this.coinBalance -= item.costCoins;
    this.ownedItemIds.add(itemId);

    return {
      success: true,
      message: `Sucesso! Adquiriste ${item.name}.`,
      remainingCoins: this.coinBalance
    };
  }

  // --- MONTAGEM: EQUIPAR ARTIGO ---
  public equipItem(itemId: string): { success: boolean; message: string; replacedItem?: string } {
    if (!this.ownedItemIds.has(itemId)) {
      return { success: false, message: "Precisas de comprar o artigo antes de equipá-lo." };
    }

    const item = WARDROBE_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: "Artigo não encontrado." };

    const previousItem = this.equippedSlots.get(item.slot);
    this.equippedSlots.set(item.slot, item);

    const result: { success: boolean; message: string; replacedItem?: string } = {
      success: true,
      message: `${item.name} equipado com distinção.`,
    };
    if (previousItem) {
      result.replacedItem = previousItem.name;
    }
    return result;
  }

  // --- DESMONTAGEM: REMOVER ARTIGO ---
  public unequipItem(slot: SlotCategory): { success: boolean; removedName?: string } {
    const current = this.equippedSlots.get(slot);
    if (!current) {
      return { success: false };
    }

    this.equippedSlots.set(slot, null);
    return { success: true, removedName: current.name };
  }

  // --- CÁLCULO DE BÓNUS INTEGRADOS DE GAMIFICAÇÃO ---
  public calculateCurrentBuffs() {
    let totalXpMultiplier = this.character.innatePassive.xpMultiplier;
    let totalCoinMultiplier = this.character.innatePassive.bonusCoinRate;
    let totalShieldChance = 0;
    let totalExtraTime = 0;

    this.equippedSlots.forEach(item => {
      if (item && item.gamificationBonus) {
        if (item.gamificationBonus.xpBoostPercent) {
          totalXpMultiplier += item.gamificationBonus.xpBoostPercent / 100;
        }
        if (item.gamificationBonus.streakShieldChance) {
          totalShieldChance += item.gamificationBonus.streakShieldChance;
        }
        if (item.gamificationBonus.extraTimeSeconds) {
          totalExtraTime += item.gamificationBonus.extraTimeSeconds;
        }
      }
    });

    return {
      totalXpRate: Number(totalXpMultiplier.toFixed(2)),
      totalCoinRate: Number(totalCoinMultiplier.toFixed(2)),
      streakShieldChance: `${Math.min(Math.round(totalShieldChance * 100), 75)}%`,
      extraListeningSeconds: totalExtraTime
    };
  }

  // --- PIPELINE DE RENDERIZAÇÃO POR PROFUNDIDADE (Z-INDEX STACKING) ---
  public getAntigravityDisplayTree() {
    const renderQueue: {
      layerIndex: number;
      assetUrl: string;
      anchor: { x: number; y: number };
      layerLabel: string;
    }[] = [];

    // Adiciona o corpo base do arquétipo
    renderQueue.push({
      layerIndex: AvatarRenderLayer.BODY_BASE,
      assetUrl: this.character.baseSpriteKey,
      anchor: { x: 0.5, y: 0.5 },
      layerLabel: "BASE_CHARACTER_BODY"
    });

    // Percorre todos os itens vestidos e insere-os conforme o layer correspondente
    this.equippedSlots.forEach((item) => {
      if (item) {
        renderQueue.push({
          layerIndex: item.layer,
          assetUrl: item.spriteAssetUrl,
          anchor: item.anchorPoint,
          layerLabel: item.name
        });
      }
    });

    // Ordenação estrita de trás para a frente para evitar falhas visuais
    return renderQueue.sort((a, b) => a.layerIndex - b.layerIndex);
  }
}

// ============================================================================
// ADAPTADORES PARA SISTEMA MONTANHA LANGUAGE
// ============================================================================

export function getStudioArchetypeById(id: string): CharacterArchetype | undefined {
  if (ARCHETYPES_REGISTRY[id]) return ARCHETYPES_REGISTRY[id];
  return Object.values(ARCHETYPES_REGISTRY).find(
    (a) => a.id === id || a.baseSpriteKey === id || a.name.toLowerCase().includes(id.toLowerCase())
  );
}

export function getStudioWardrobeItemById(id: string): WardrobeItem | undefined {
  return WARDROBE_CATALOG.find((it) => it.id === id);
}

export function adaptStudioArchetypeToCharacterBase(archetype: CharacterArchetype): CharacterBase {
  const category = archetype.id.includes("beast")
    ? "MYTHIC_BEAST"
    : archetype.id.includes("_f")
    ? "HUMAN_FEMALE"
    : "HUMAN_MALE";

  const supportedLanguageBonusIds =
    archetype.id === "char_tactician_m"
      ? ["es", "fr", "it", "pt"]
      : archetype.id === "char_archivist_f"
      ? ["de", "en", "ru", "el-koine"]
      : ["ja", "de", "en", "es"];

  return {
    id: archetype.id,
    name: archetype.name,
    title: archetype.title,
    category,
    lore: `${archetype.lore} Passiva Innata: ${archetype.innatePassive.name} (${archetype.innatePassive.description})`,
    nativeLanguageBonus: archetype.innatePassive.name,
    supportedLanguageBonusIds,
    baseSpriteAsset: archetype.baseSpriteKey,
    avatarGreeting: `[${archetype.name}] ${archetype.innatePassive.description}`,
  };
}

export function adaptStudioWardrobeItemToShopItem(item: WardrobeItem): ShopItem {
  const slotMap: Record<SlotCategory, SlotType> = {
    [SlotCategory.HEADWEAR]: EquipmentSlot.HEAD_UPPER,
    [SlotCategory.OUTFIT]: EquipmentSlot.ARMOR,
    [SlotCategory.MAIN_TOOL]: EquipmentSlot.RIGHT_HAND,
    [SlotCategory.OFF_TOOL]: EquipmentSlot.LEFT_HAND,
    [SlotCategory.BACKPACK_CAPE]: EquipmentSlot.GARMENT,
    [SlotCategory.FAMILIAR]: EquipmentSlot.PET_FAMILIAR,
  };

  const rarityMap: Record<ItemTier, ShopItem["rarity"]> = {
    [ItemTier.APPRENTICE]: "COMMON",
    [ItemTier.SCHOLAR]: "RARE",
    [ItemTier.POLYGLOT_KNIGHT]: "EPIC",
    [ItemTier.GRAND_ARCHIVIST]: "LEGENDARY",
    [ItemTier.NOVICE]: "COMMON",
    [ItemTier.FIRST_CLASS]: "RARE",
    [ItemTier.SECOND_CLASS]: "EPIC",
    [ItemTier.TRANSCENDENT]: "LEGENDARY",
  };

  const statBonus: ShopItem["statBonus"] = {};
  if (item.gamificationBonus.xpBoostPercent) {
    statBonus.xpMultiplier = item.gamificationBonus.xpBoostPercent / 100;
  }
  if (item.gamificationBonus.streakShieldChance) {
    statBonus.streakProtection = Math.round(item.gamificationBonus.streakShieldChance * 10);
  }
  if (item.gamificationBonus.extraTimeSeconds) {
    statBonus.timeBonusSeconds = item.gamificationBonus.extraTimeSeconds;
  }

  return {
    id: item.id,
    name: item.name,
    slot: slotMap[item.slot] || (item.slot as any),
    rarity: rarityMap[item.tier] || "RARE",
    costCoins: item.costCoins,
    requiredLevel: item.requiredLevel,
    statBonus,
    visualAsset: item.id,
    description: item.flavorText,
    inspiration: `Studio Fantasy (${item.tier})`,
  };
}
