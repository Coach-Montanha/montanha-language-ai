import {
  EquipmentSlot,
  ItemTier,
  ArchetypeRole,
  BaseClassAvatar,
  EquipItem,
} from "@/types/rpg";
import { CharacterBase, ShopItem, SlotType } from "@/types/avatar";

// ----------------------------------------------------------------------------
// 1. BANCO DE PERSONAGENS (Baseado no line-up da ilustração)
// ----------------------------------------------------------------------------

export const BASE_AVATARS: BaseClassAvatar[] = [
  // Homens
  {
    id: "char_swordsman_m",
    name: "Espadachim Pronteriano",
    gender: "MALE",
    role: ArchetypeRole.SWORDSMAN,
    description: "Espadachim persistente que encara gramáticas difíceis de frente.",
    baseSpriteKey: "ro_chibi_swordsman_male_base",
    languagePerk: "+15% de resistência à perda de pontos de vida (vidas do app)."
  },
  {
    id: "char_wizard_m",
    name: "Mago de Geffen",
    gender: "MALE",
    role: ArchetypeRole.MAGICIAN,
    description: "Estudioso dos tomos elementais e conjurações de orações compostas.",
    baseSpriteKey: "ro_chibi_wizard_male_base",
    languagePerk: "+20% de ganho de XP em exercícios de leitura longa."
  },
  {
    id: "char_blacksmith_m",
    name: "Ferreiro de Alberta",
    gender: "MALE",
    role: ArchetypeRole.BLACKSMITH,
    description: "Mestre da forja e da negociação, carrega um martelo colossal.",
    baseSpriteKey: "ro_chibi_blacksmith_male_base",
    languagePerk: "+25% de moedas ganhas ao gabaritar uma revisão diária."
  },

  // Mulheres
  {
    id: "char_magician_f",
    name: "Maga Arcana de Alberta",
    gender: "FEMALE",
    role: ArchetypeRole.MAGICIAN,
    description: "Controladora dos feitiços de gelo e fogo para memorização ágil.",
    baseSpriteKey: "ro_chibi_magician_female_base",
    languagePerk: "Revela uma dica gratuita por dia em exercícios difíceis."
  },
  {
    id: "char_acolyte_f",
    name: "Noviça de Prontera",
    gender: "FEMALE",
    role: ArchetypeRole.PRIEST,
    description: "Devota que abençoa o estudante e recupera corações perdidos.",
    baseSpriteKey: "ro_chibi_acolyte_female_base",
    languagePerk: "Recupera 1 vida instantaneamente a cada 3 lições perfeitas."
  },
  {
    id: "char_hunter_f",
    name: "Caçadora com Lobo",
    gender: "FEMALE",
    role: ArchetypeRole.HUNTER,
    description: "Mira impecável para identificar palavras com sons parecidos.",
    baseSpriteKey: "ro_chibi_hunter_female_base",
    languagePerk: "+5 segundos em todos os exercícios contra o relógio."
  },

  // Monstros Mitológicos / Mascotes jogáveis
  {
    id: "char_baphomet_jr",
    name: "Baphomet Jr. Mitológico",
    gender: "NEUTRAL_CREATURE",
    role: ArchetypeRole.MYTHIC_BEAST,
    description: "Demônio mitológico em miniatura com asinhas e foice arcana.",
    baseSpriteKey: "ro_chibi_baphomet_jr_base",
    languagePerk: "Dobra os pontos de ofensiva ao estudar à meia-noite."
  },
  {
    id: "char_angeling",
    name: "Angeling Alado",
    gender: "NEUTRAL_CREATURE",
    role: ArchetypeRole.MYTHIC_BEAST,
    description: "Geleia sagrada com auréola angelical, patrono dos noviços.",
    baseSpriteKey: "ro_chibi_angeling_base",
    languagePerk: "Protege o Streak se você esquecer de estudar por 1 dia."
  }
];

// ----------------------------------------------------------------------------
// 2. CATÁLOGO DE ITENS DA LOJA (Chapéus icônicos, mochilas, armas e capas)
// ----------------------------------------------------------------------------

export const ITEM_CATALOG: EquipItem[] = [
  // --- CHAPÉUS & ACESSÓRIOS DE CABEÇA (O coração da estética RO) ---
  {
    id: "head_bunny_ears",
    name: "Orelhas de Coelho Brancas",
    slot: EquipmentSlot.HEAD_UPPER,
    tier: ItemTier.NOVICE,
    costZeny: 250,
    requiredLevel: 2,
    stats: { timeBonusSeconds: 3 },
    spriteLayer: "sprites/head/bunny_ears.png",
    flavorText: "Orelhinhas felpudas adoradas por espadachins e noviças para treinar agilidade auditiva."
  },
  {
    id: "head_apple_archer",
    name: "Maçã de Archer",
    slot: EquipmentSlot.HEAD_UPPER,
    tier: ItemTier.FIRST_CLASS,
    costZeny: 600,
    requiredLevel: 5,
    stats: { xpMultiplier: 1.08 },
    spriteLayer: "sprites/head/apple_archer.png",
    flavorText: "Uma maçã fresca equilibrada no topo da cabeça. Aumenta a pontaria e o foco."
  },
  {
    id: "head_mage_hat",
    name: "Chapéu Cônico de Bruxo",
    slot: EquipmentSlot.HEAD_UPPER,
    tier: ItemTier.SECOND_CLASS,
    costZeny: 1500,
    requiredLevel: 12,
    stats: { xpMultiplier: 1.15, coinDropBonus: 0.10 },
    spriteLayer: "sprites/head/wizard_hat.png",
    flavorText: "O clássico chapéu pontudo de aba enrolada usado pelos magos graduados."
  },
  {
    id: "head_leaf_mouth",
    name: "Folhinha Romântica",
    slot: EquipmentSlot.HEAD_LOWER,
    tier: ItemTier.NOVICE,
    costZeny: 180,
    requiredLevel: 1,
    stats: { coinDropBonus: 0.05 },
    spriteLayer: "sprites/head/leaf_mouth.png",
    flavorText: "Uma folha de trevo verde segurada no canto da boca enquanto estuda ao ar livre."
  },

  // --- TRONCO / VESTIMENTAS ---
  {
    id: "armor_apprentice_robe",
    name: "Túnica com Capa Cerúlea",
    slot: EquipmentSlot.ARMOR,
    tier: ItemTier.FIRST_CLASS,
    costZeny: 800,
    requiredLevel: 6,
    stats: { streakShieldPercent: 0.15 },
    spriteLayer: "sprites/armor/apprentice_robe.png",
    flavorText: "Veste reforçada de feltro e botões de latão inspirada na classe Novice e Magician."
  },
  {
    id: "armor_blacksmith_overalls",
    name: "Jardineira do Forjador",
    slot: EquipmentSlot.ARMOR,
    tier: ItemTier.SECOND_CLASS,
    costZeny: 1800,
    requiredLevel: 14,
    stats: { coinDropBonus: 0.25 },
    spriteLayer: "sprites/armor/blacksmith_overalls.png",
    flavorText: "Bolsos sem fundo para guardar ferramentas, anotações de vocabulário e moedas."
  },

  // --- MOCHILAS & COSTAS ---
  {
    id: "pack_merchant_wooden",
    name: "Mochila de Carga do Mercador",
    slot: EquipmentSlot.BACKPACK,
    tier: ItemTier.FIRST_CLASS,
    costZeny: 1100,
    requiredLevel: 8,
    stats: { coinDropBonus: 0.20, xpMultiplier: 1.05 },
    spriteLayer: "sprites/back/merchant_pack.png",
    flavorText: "Mochila cúbica de madeira com cordas, feita para transportar gramáticas pesadas."
  },
  {
    id: "garment_angel_wings",
    name: "Asas de Anjo Celestiais",
    slot: EquipmentSlot.GARMENT,
    tier: ItemTier.TRANSCENDENT,
    costZeny: 4500,
    requiredLevel: 25,
    stats: { xpMultiplier: 1.35, streakShieldPercent: 0.30 },
    spriteLayer: "sprites/garment/angel_wings.png",
    flavorText: "Asas etéreas emplumadas. Marca visual dos veteranos que dominaram a língua estrangeira."
  },

  // --- ARMAS / ITENS EMPUNHADOS ---
  {
    id: "wpn_forging_hammer",
    name: "Martelo de Batalha do Ferreiro",
    slot: EquipmentSlot.RIGHT_HAND,
    tier: ItemTier.SECOND_CLASS,
    costZeny: 2200,
    requiredLevel: 15,
    stats: { xpMultiplier: 1.20 },
    spriteLayer: "sprites/weapons/giant_hammer.png",
    flavorText: "Um martelo gigante que esmaga os erros de concordância."
  },
  {
    id: "wpn_wizard_staff",
    name: "Cajado do Éter Elemental",
    slot: EquipmentSlot.RIGHT_HAND,
    tier: ItemTier.FIRST_CLASS,
    costZeny: 950,
    requiredLevel: 7,
    stats: { timeBonusSeconds: 5 },
    spriteLayer: "sprites/weapons/mage_staff.png",
    flavorText: "Canaliza esferas mágicas de fogo e gelo com base na acurácia da pronúncia."
  },

  // --- MONSTROS COMPANHEIROS (PETS) ---
  {
    id: "pet_poring_cute",
    name: "Poring Saltitante",
    slot: EquipmentSlot.PET_FAMILIAR,
    tier: ItemTier.NOVICE,
    costZeny: 350,
    requiredLevel: 1,
    stats: { streakShieldPercent: 0.10 },
    spriteLayer: "sprites/pets/poring.png",
    flavorText: "A geleia rosada clássica. Pula animada a cada frase concluída com sucesso."
  },
  {
    id: "pet_spore_hat",
    name: "Spore Cogumelo",
    slot: EquipmentSlot.PET_FAMILIAR,
    tier: ItemTier.FIRST_CLASS,
    costZeny: 750,
    requiredLevel: 4,
    stats: { coinDropBonus: 0.12 },
    spriteLayer: "sprites/pets/spore.png",
    flavorText: "Cogumelo simpático que espalha esporos de conhecimento linguístico."
  }
];

// ============================================================================
// 3. MOTOR DE GESTÃO DO AVATAR NO ANTIGRAVITY
// ============================================================================

export class AntigravityAvatarEngine {
  private activeAvatar: BaseClassAvatar;
  private userLevel: number;
  private zenyWallet: number;
  private inventory: Set<string>; // IDs dos itens possuídos
  private equipmentMap: Map<EquipmentSlot, EquipItem | null>;

  constructor(initialAvatar: BaseClassAvatar = BASE_AVATARS[0]!, level: number = 1, startingZeny: number = 500) {
    this.activeAvatar = initialAvatar;
    this.userLevel = level;
    this.zenyWallet = startingZeny;
    this.inventory = new Set<string>();
    this.equipmentMap = new Map();

    // Inicializa todos os slots vazios
    Object.values(EquipmentSlot).forEach((slot) => {
      this.equipmentMap.set(slot, null);
    });
  }

  // Getters & Setters auxiliares
  public getActiveAvatar(): BaseClassAvatar {
    return this.activeAvatar;
  }

  public setActiveAvatar(avatar: BaseClassAvatar): void {
    this.activeAvatar = avatar;
  }

  public getUserLevel(): number {
    return this.userLevel;
  }

  public setUserLevel(lvl: number): void {
    this.userLevel = lvl;
  }

  public getZenyWallet(): number {
    return this.zenyWallet;
  }

  public setZenyWallet(zeny: number): void {
    this.zenyWallet = zeny;
  }

  public addZeny(zeny: number): void {
    this.zenyWallet += Math.max(0, zeny);
  }

  public getInventory(): Set<string> {
    return this.inventory;
  }

  public setInventory(itemIds: string[] | Set<string>): void {
    this.inventory = new Set(itemIds);
  }

  public getEquipment(slot: EquipmentSlot): EquipItem | null {
    return this.equipmentMap.get(slot) || null;
  }

  public setEquipment(slot: EquipmentSlot, item: EquipItem | null): void {
    this.equipmentMap.set(slot, item);
  }

  public getEquipmentMap(): Map<EquipmentSlot, EquipItem | null> {
    return this.equipmentMap;
  }

  // --- COMPRAR ITEM NA LOJA ---
  public buyItem(itemId: string): { success: boolean; reason: string } {
    const item = ITEM_CATALOG.find((it) => it.id === itemId);
    if (!item) return { success: false, reason: "Item não cadastrado na loja Kafra." };

    if (this.inventory.has(itemId)) {
      return { success: false, reason: "Você já possui este equipamento." };
    }

    if (this.userLevel < item.requiredLevel) {
      return {
        success: false,
        reason: `Requer Nível de Base ${item.requiredLevel}. Seu nível atual é ${this.userLevel}.`
      };
    }

    if (this.zenyWallet < item.costZeny) {
      return {
        success: false,
        reason: `Zeny insuficiente. Preço: ${item.costZeny} Zeny, você tem ${this.zenyWallet} Zeny.`
      };
    }

    this.zenyWallet -= item.costZeny;
    this.inventory.add(item.id);

    return { success: true, reason: `Parabéns! Você adquiriu [${item.name}].` };
  }

  // --- EQUIPAR ITEM ---
  public equip(itemId: string): { success: boolean; previousItemName?: string; error?: string } {
    if (!this.inventory.has(itemId)) {
      return { success: false, error: "Você precisa comprar o item antes de equipá-lo." };
    }

    const item = ITEM_CATALOG.find((it) => it.id === itemId);
    if (!item) return { success: false, error: "Item não encontrado." };

    const oldEquip = this.equipmentMap.get(item.slot);
    this.equipmentMap.set(item.slot, item);

    const result: { success: boolean; previousItemName?: string; error?: string } = {
      success: true,
    };
    if (oldEquip) {
      result.previousItemName = oldEquip.name;
    }
    return result;
  }

  // --- DESEQUIPAR ITEM ---
  public unequip(slot: EquipmentSlot): { success: boolean; unequippedName?: string } {
    const current = this.equipmentMap.get(slot);
    if (!current) {
      return { success: false };
    }

    this.equipmentMap.set(slot, null);
    return { success: true, unequippedName: current.name };
  }

  // --- COMPUTAÇÃO DE BÔNUS PASSIVOS PARA AS LIÇÕES ---
  public calculateCombinedLessonBoosts() {
    let xpMult = 1.0;
    let coinBonus = 0.0;
    let streakShield = 0.0;
    let extraTime = 0;

    this.equipmentMap.forEach((item) => {
      if (item && item.stats) {
        if (item.stats.xpMultiplier) xpMult += (item.stats.xpMultiplier - 1.0);
        if (item.stats.coinDropBonus) coinBonus += item.stats.coinDropBonus;
        if (item.stats.streakShieldPercent) streakShield += item.stats.streakShieldPercent;
        if (item.stats.timeBonusSeconds) extraTime += item.stats.timeBonusSeconds;
      }
    });

    return {
      finalXpMultiplier: Number(xpMult.toFixed(2)),
      finalCoinBonusPercent: Number((coinBonus * 100).toFixed(0)) + "%",
      finalStreakProtection: Number((Math.min(streakShield, 0.85) * 100).toFixed(0)) + "%",
      extraSecondsPerQuestion: extraTime
    };
  }

  // --- ORDEM DE RENDERIZAÇÃO DE CAMADAS (SPRITE STACKING NO ANTIGRAVITY) ---
  // A ordem de renderização é crucial no estilo chibi do Ragnarok:
  // Fundo (Asas/Capa/Mochila) -> Base do Personagem -> Roupas -> Chapéus/Óculos -> Mãos/Pets à frente
  public getAntigravityRenderTree() {
    return {
      avatarBase: this.activeAvatar.baseSpriteKey,
      renderSequence: [
        { layer: "LAYER_BACK", asset: this.equipmentMap.get(EquipmentSlot.GARMENT)?.spriteLayer || null },
        { layer: "LAYER_BACKPACK", asset: this.equipmentMap.get(EquipmentSlot.BACKPACK)?.spriteLayer || null },
        { layer: "LAYER_BODY_BASE", asset: this.activeAvatar.baseSpriteKey },
        { layer: "LAYER_ARMOR", asset: this.equipmentMap.get(EquipmentSlot.ARMOR)?.spriteLayer || null },
        { layer: "LAYER_HEAD_LOWER", asset: this.equipmentMap.get(EquipmentSlot.HEAD_LOWER)?.spriteLayer || null },
        { layer: "LAYER_HEAD_MIDDLE", asset: this.equipmentMap.get(EquipmentSlot.HEAD_MIDDLE)?.spriteLayer || null },
        { layer: "LAYER_HEAD_UPPER", asset: this.equipmentMap.get(EquipmentSlot.HEAD_UPPER)?.spriteLayer || null },
        { layer: "LAYER_HAND_L", asset: this.equipmentMap.get(EquipmentSlot.LEFT_HAND)?.spriteLayer || null },
        { layer: "LAYER_HAND_R", asset: this.equipmentMap.get(EquipmentSlot.RIGHT_HAND)?.spriteLayer || null },
        { layer: "LAYER_PET_GROUND", asset: this.equipmentMap.get(EquipmentSlot.PET_FAMILIAR)?.spriteLayer || null }
      ].filter((node) => node.asset !== null)
    };
  }
}

// ----------------------------------------------------------------------------
// ADAPTADORES DE COMPATIBILIDADE PARA O SISTEMA MONTANHA LANGUAGE
// ----------------------------------------------------------------------------

export function getRoAvatarById(id: string): BaseClassAvatar | undefined {
  return BASE_AVATARS.find((a) => a.id === id || a.baseSpriteKey === id);
}

export function getRoItemById(id: string): EquipItem | undefined {
  return ITEM_CATALOG.find((it) => it.id === id);
}

export function adaptRoAvatarToCharacterBase(avatar: BaseClassAvatar): CharacterBase {
  const category =
    avatar.gender === "NEUTRAL_CREATURE"
      ? "MYTHIC_BEAST"
      : avatar.gender === "FEMALE"
      ? "HUMAN_FEMALE"
      : "HUMAN_MALE";

  const languageBonusMap: Record<ArchetypeRole, { native: string; ids: string[] }> = {
    [ArchetypeRole.SWORDSMAN]: { native: "Romance_Languages", ids: ["es", "it", "pt"] },
    [ArchetypeRole.MAGICIAN]: { native: "Germanic_Languages", ids: ["de", "en"] },
    [ArchetypeRole.BLACKSMITH]: { native: "Asian_Languages", ids: ["ja"] },
    [ArchetypeRole.PRIEST]: { native: "Semitic_Languages", ids: ["el-koine", "it"] },
    [ArchetypeRole.HUNTER]: { native: "Nordic_Languages", ids: ["en", "de"] },
    [ArchetypeRole.MYTHIC_BEAST]: { native: "Universal_Mythic", ids: ["en", "ja", "de", "es"] },
  };

  const bonusInfo = languageBonusMap[avatar.role] || { native: "All_Languages", ids: ["en"] };

  return {
    id: avatar.id,
    name: avatar.name,
    title: avatar.description,
    category,
    lore: `${avatar.description} Especialidade: ${avatar.languagePerk}`,
    nativeLanguageBonus: bonusInfo.native,
    supportedLanguageBonusIds: bonusInfo.ids,
    baseSpriteAsset: avatar.baseSpriteKey,
    avatarGreeting: `[${avatar.name}] ${avatar.languagePerk}`,
  };
}

export function adaptRoItemToShopItem(item: EquipItem): ShopItem {
  const rarityMap: Record<ItemTier, ShopItem["rarity"]> = {
    [ItemTier.NOVICE]: "COMMON",
    [ItemTier.FIRST_CLASS]: "RARE",
    [ItemTier.SECOND_CLASS]: "EPIC",
    [ItemTier.TRANSCENDENT]: "LEGENDARY",
    [ItemTier.APPRENTICE]: "COMMON",
    [ItemTier.SCHOLAR]: "RARE",
    [ItemTier.POLYGLOT_KNIGHT]: "EPIC",
    [ItemTier.GRAND_ARCHIVIST]: "LEGENDARY",
  };

  const statBonus: ShopItem["statBonus"] = {};
  if (item.stats.xpMultiplier !== undefined) {
    statBonus.xpMultiplier = Number((item.stats.xpMultiplier - 1.0).toFixed(2));
  }
  if (item.stats.streakShieldPercent !== undefined) {
    statBonus.streakProtection = Math.round(item.stats.streakShieldPercent * 10);
  }
  if (item.stats.coinDropBonus !== undefined) {
    statBonus.coinBonus = item.stats.coinDropBonus;
  }
  if (item.stats.timeBonusSeconds !== undefined) {
    statBonus.timeBonusSeconds = item.stats.timeBonusSeconds;
  }

  return {
    id: item.id,
    name: item.name,
    slot: item.slot as any,
    rarity: rarityMap[item.tier] || "COMMON",
    costCoins: item.costZeny,
    requiredLevel: item.requiredLevel,
    statBonus,
    visualAsset: item.id,
    description: item.flavorText,
    inspiration: `Ragnarok Online (Chibi Tier: ${item.tier})`,
  };
}
