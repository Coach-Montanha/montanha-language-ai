import React, { useState } from "react";
import { UserProgress, SupportedLanguage } from "@/types/language";
import {
  AvatarAnimationState,
  SlotType,
  ALL_SLOT_TYPES,
  ShopItem,
  CharacterBase,
  ItemRarity,
  AvatarEquipment,
  EquipmentSlot,
} from "@/types/avatar";
import { ModularAvatar } from "@/components/avatar/ModularAvatar";
import {
  CHARACTERS_DATABASE,
  SHOP_ITEMS_CATALOG,
  DEFAULT_AVATAR_CONFIG,
  getShopItemById,
  getCharacterById,
  BASE_AVATARS,
  ITEM_CATALOG,
  adaptRoAvatarToCharacterBase,
  adaptRoItemToShopItem,
} from "@/data/avatar-items";
import {
  calculateLevelInfo,
  ensureGamificationProgress,
  getCombinedStats,
  buyShopItem,
  equipShopItem,
  unequipShopSlot,
  selectRpgCharacter,
  buyAvatarItem,
  equipAvatarItem,
} from "@/services/gamification";
import {
  playSuccessSound,
  playOptionSelectSound,
  playSprintCompleteSound,
} from "@/services/audio-effects";
import {
  Sparkles,
  Coins,
  Shield,
  Trophy,
  ShoppingBag,
  Shirt,
  Check,
  Lock,
  Volume2,
  Mic,
  Smile,
  Brain,
  ChevronRight,
  Flame,
  Sword,
  Wand2,
  Backpack,
  Gem,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface AvatarTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onOpenConversation?: () => void;
  onOpenAvatarShop?: () => void;
}

interface PaperDollSlotDef {
  slotKey: string;
  fallbackKeys?: string[];
  label: string;
  icon: string;
}

const RO_PAPER_DOLL_SLOTS: PaperDollSlotDef[] = [
  { slotKey: EquipmentSlot.HEAD_UPPER, fallbackKeys: ["HEAD"], label: "Chapéu RO", icon: "🐰" },
  { slotKey: EquipmentSlot.HEAD_MIDDLE, fallbackKeys: ["eyes"], label: "Óculos RO", icon: "👓" },
  { slotKey: EquipmentSlot.HEAD_LOWER, fallbackKeys: ["head_lower"], label: "Boca RO", icon: "🍃" },
  { slotKey: EquipmentSlot.ARMOR, fallbackKeys: ["CHEST", "body"], label: "Armadura RO", icon: "👘" },
  { slotKey: EquipmentSlot.GARMENT, fallbackKeys: ["BACK", "back"], label: "Asas & Capas RO", icon: "🪽" },
  { slotKey: EquipmentSlot.FOOTGEAR, fallbackKeys: ["LEGS", "legs"], label: "Botas RO", icon: "🥾" },
  { slotKey: EquipmentSlot.RIGHT_HAND, fallbackKeys: ["MAIN_HAND", "hand"], label: "Arma RO", icon: "🔨" },
  { slotKey: EquipmentSlot.LEFT_HAND, fallbackKeys: ["OFF_HAND", "off_hand"], label: "Escudo RO", icon: "🛡️" },
  { slotKey: EquipmentSlot.BACKPACK, fallbackKeys: ["backpack"], label: "Mochila RO", icon: "📦" },
  { slotKey: EquipmentSlot.PET_FAMILIAR, fallbackKeys: ["pet"], label: "Pet Companheiro", icon: "🐣" },
  { slotKey: "ACCESSORY", fallbackKeys: ["accessory"], label: "Relíquia / Acessório", icon: "💎" },
];

const SLOT_TABS: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "Tudo", icon: "✨" },
  { id: "archetype", label: "Heróis", icon: "🧙‍♂️" },
  { id: EquipmentSlot.HEAD_UPPER, label: "Chapéus RO", icon: "🐰" },
  { id: EquipmentSlot.HEAD_LOWER, label: "Boca RO", icon: "🍃" },
  { id: EquipmentSlot.ARMOR, label: "Armaduras RO", icon: "👘" },
  { id: EquipmentSlot.GARMENT, label: "Asas & Capas RO", icon: "🪽" },
  { id: EquipmentSlot.BACKPACK, label: "Mochilas RO", icon: "📦" },
  { id: EquipmentSlot.RIGHT_HAND, label: "Armas RO", icon: "🔨" },
  { id: EquipmentSlot.PET_FAMILIAR, label: "Pets RO", icon: "🐣" },
  { id: "HEAD", label: "Cabeça", icon: "🎩" },
  { id: "CHEST", label: "Peitoral", icon: "🥋" },
  { id: "LEGS", label: "Pernas", icon: "👢" },
  { id: "MAIN_HAND", label: "Mão Principal", icon: "⚔️" },
  { id: "OFF_HAND", label: "Mão Secundária", icon: "🛡️" },
  { id: "BACK", label: "Costas", icon: "🎒" },
  { id: "ACCESSORY", label: "Acessório", icon: "💎" },
];

const RARITY_COLORS: Record<ItemRarity, { badge: string; border: string }> = {
  COMMON: {
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    border: "border-slate-800 hover:border-slate-600",
  },
  RARE: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    border: "border-blue-900/40 hover:border-blue-500",
  },
  EPIC: {
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    border: "border-purple-900/40 hover:border-purple-500",
  },
  LEGENDARY: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    border: "border-amber-700/50 hover:border-amber-400 shadow-sm shadow-amber-500/10",
  },
  MYTHIC: {
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse",
    border: "border-rose-600/60 hover:border-rose-400 shadow-md shadow-rose-500/20",
  },
};

export const AvatarTab: React.FC<AvatarTabProps> = ({
  progress,
  onUpdateProgress,
  onOpenConversation,
  onOpenAvatarShop,
}) => {
  const prepared = ensureGamificationProgress(progress);
  const levelInfo = calculateLevelInfo(prepared.xp);
  const combinedStats = getCombinedStats(prepared, prepared.selectedLanguage);
  const avatarConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const currentEquipment = (prepared.equipment || {}) as Record<string, string | null | undefined>;
  const inventoryIds = prepared.inventoryItemIds || [];
  const selectedChar = getCharacterById(prepared.selectedCharacterId || "valerius");

  const allHeroes: CharacterBase[] = [
    ...BASE_AVATARS.map(adaptRoAvatarToCharacterBase),
    ...CHARACTERS_DATABASE,
  ];

  const fullShopCatalog: ShopItem[] = [
    ...ITEM_CATALOG.map(adaptRoItemToShopItem),
    ...SHOP_ITEMS_CATALOG,
  ];

  const [activeSlot, setActiveSlot] = useState<string>("all");
  const [shopMode, setShopMode] = useState<"shop" | "closet">("shop");
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "ALL">("ALL");
  const [previewState, setPreviewState] = useState<AvatarAnimationState>("idle");

  const filteredItems = fullShopCatalog.filter((item) => {
    // Filtro por slot com mapeamento bidirecional entre sistema RO e legado
    if (activeSlot !== "all" && activeSlot !== "archetype") {
      const directMatch = item.slot === activeSlot;
      const mappedMatch =
        (activeSlot === "HEAD" && (item.slot === EquipmentSlot.HEAD_UPPER || item.slot === EquipmentSlot.HEAD_LOWER || item.slot === EquipmentSlot.HEAD_MIDDLE)) ||
        (activeSlot === EquipmentSlot.HEAD_UPPER && item.slot === "HEAD") ||
        (activeSlot === "CHEST" && item.slot === EquipmentSlot.ARMOR) ||
        (activeSlot === EquipmentSlot.ARMOR && item.slot === "CHEST") ||
        (activeSlot === "BACK" && (item.slot === EquipmentSlot.GARMENT || item.slot === EquipmentSlot.BACKPACK)) ||
        (activeSlot === EquipmentSlot.GARMENT && item.slot === "BACK") ||
        (activeSlot === EquipmentSlot.BACKPACK && item.slot === "BACK") ||
        (activeSlot === "MAIN_HAND" && item.slot === EquipmentSlot.RIGHT_HAND) ||
        (activeSlot === EquipmentSlot.RIGHT_HAND && item.slot === "MAIN_HAND") ||
        (activeSlot === "OFF_HAND" && item.slot === EquipmentSlot.LEFT_HAND) ||
        (activeSlot === EquipmentSlot.LEFT_HAND && item.slot === "OFF_HAND") ||
        (activeSlot === "ACCESSORY" && item.slot === EquipmentSlot.PET_FAMILIAR) ||
        (activeSlot === EquipmentSlot.PET_FAMILIAR && item.slot === "ACCESSORY") ||
        (activeSlot === "LEGS" && item.slot === EquipmentSlot.FOOTGEAR) ||
        (activeSlot === EquipmentSlot.FOOTGEAR && item.slot === "LEGS");

      if (!directMatch && !mappedMatch) return false;
    }
    if (activeSlot === "archetype") return false;

    // Filtro por raridade
    if (rarityFilter !== "ALL" && item.rarity !== rarityFilter) return false;

    // Filtro por modo: loja vs closet (itens adquiridos)
    if (shopMode === "closet") {
      return inventoryIds.includes(item.id);
    }
    return true;
  });

  const handleBuy = (item: ShopItem) => {
    const res = buyShopItem(prepared, item.id);
    if (!res.success) {
      toast.error(res.error || "Não foi possível comprar este item.");
      return;
    }
    playSprintCompleteSound();
    toast.success(`🎉 Você desbloqueou: ${item.name}!`, {
      description: "Item adicionado ao inventário e equipado automaticamente!",
    });
    if (res.updated) {
      onUpdateProgress(res.updated);
    }
  };

  const handleEquip = (item: ShopItem) => {
    playOptionSelectSound();
    const updated = equipShopItem(prepared, item.id);
    onUpdateProgress(updated);
    toast.success(`${item.name} equipado com sucesso!`);
  };

  const handleUnequip = (slot: string) => {
    playOptionSelectSound();
    const updated = unequipShopSlot(prepared, slot);
    onUpdateProgress(updated);
    toast.info("Slot desequipado.");
  };

  const handleSelectCharacter = (character: CharacterBase) => {
    playOptionSelectSound();
    const updated = selectRpgCharacter(prepared, character.id);
    onUpdateProgress(updated);
    toast.success(`Herói selecionado: ${character.name}!`, {
      description: `${character.avatarGreeting || "Pronto para os estudos!"}`,
    });
  };

  const isEquipped = (itemId: string, slot: string) => {
    return currentEquipment[slot] === itemId;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6 pb-20">
      {/* ============================================================ */}
      {/* 1. BANNER RPG: NÍVEL, XP, TÍTULO, MOEDAS E BÔNUS COMBINADOS */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/80 via-slate-900/90 to-indigo-950/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-black px-3 py-0.5 text-xs">
                Nível {levelInfo.level}
              </Badge>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {selectedChar ? selectedChar.name : levelInfo.title}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {selectedChar?.lore ||
                "Ganhe XP e Moedas em treinos diários e conversas com o Tutor IA para equipar e evoluir seu avatar RPG."}
            </p>
          </div>

          {/* Saldo de Moedas & Botão Conversar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-inner">
              <Coins className="h-6 w-6 text-amber-400" />
              <div>
                <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                  Moedas RPG
                </span>
                <span className="text-lg font-black text-amber-400 leading-none">
                  {prepared.coins ?? 150} 🪙
                </span>
              </div>
            </div>

            {onOpenConversation && (
              <Button
                onClick={onOpenConversation}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg cursor-pointer text-xs h-10 px-4 rounded-xl"
              >
                Praticar com Tutor
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas RPG Combinadas (Atributos de Equipamento) */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Multiplicador de XP
              </span>
              <span className="text-sm font-black text-indigo-300">
                {combinedStats.finalXpMultiplier}x{" "}
                <span className="text-xs font-medium text-emerald-400">
                  (+{Math.round((combinedStats.finalXpMultiplier - 1) * 100)}%)
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Bônus de Moedas
              </span>
              <span className="text-sm font-black text-emerald-300">
                {combinedStats.finalCoinBonus}x{" "}
                <span className="text-xs font-medium text-emerald-400">
                  (+{Math.round((combinedStats.finalCoinBonus - 1) * 100)}%)
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Proteção de Ofensiva
              </span>
              <span className="text-sm font-black text-blue-300">
                {combinedStats.finalStreakProtection} Dias Protegidos
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de Nível */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5">
          <div className="flex justify-between text-[11px] font-semibold text-slate-300">
            <span>Progresso para o Nível {levelInfo.level + 1}</span>
            <span className="text-violet-400 font-bold">
              {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP ({levelInfo.progressPercent}%)
            </span>
          </div>
          <Progress value={levelInfo.progressPercent} className="h-2 bg-slate-800" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. VITRINE DE AVATAR RPG & OS 7 SLOTS DE EQUIPAMENTO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Central: Avatar 3D-like + Controles de Estado */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-card/60 backdrop-blur-md p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              Pré-visualização do Personagem
            </span>
            <h3 className="text-base font-extrabold text-foreground">
              {selectedChar?.name || "Herói Aventureiro"}
            </h3>
            {selectedChar && (
              <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-300">
                ⚡ Afinidade: {selectedChar.nativeLanguageBonus}
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/20 to-slate-950/40 border border-indigo-500/20 shadow-inner">
            <ModularAvatar
              config={avatarConfig}
              state={previewState}
              size="xl"
              level={levelInfo.level}
              showBadge={true}
            />
          </div>

          {/* Seletor de Estados de Animação */}
          <div className="w-full pt-2 border-t border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 text-center">
              Testar Animações do Avatar
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { id: "idle", label: "Normal", icon: Smile },
                  { id: "speaking", label: "Falando", icon: Volume2 },
                  { id: "listening", label: "Ouvindo", icon: Mic },
                  { id: "celebrating", label: "Vitória", icon: Trophy },
                  { id: "thinking", label: "Pensando", icon: Brain },
                ] as const
              ).map((st) => {
                const Icon = st.icon;
                const active = previewState === st.id;
                return (
                  <Button
                    key={st.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      playOptionSelectSound();
                      setPreviewState(st.id);
                    }}
                    className={`flex flex-col items-center h-auto py-1.5 px-1 text-[10px] gap-0.5 ${
                      active ? "bg-indigo-600 text-white" : "border-slate-800 text-slate-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{st.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel dos Slots de Equipamento Ragnarok Online (Paper Doll) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-card/60 backdrop-blur-md p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Shirt className="w-4 h-4 text-indigo-400" />
                Equipamento Chibi RO (10 Slots de Aventura)
              </h3>
              <p className="text-xs text-muted-foreground">
                Equipe chapéus, asas, martelos, capas e companheiros Poring para potencializar seus estudos.
              </p>
            </div>
            {onOpenAvatarShop && (
              <Button
                size="sm"
                onClick={onOpenAvatarShop}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Loja Kafra RO
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {RO_PAPER_DOLL_SLOTS.map((slotDef) => {
              // Resolução com fallback seguro para preservação de progresso legado
              let itemId: string | null = currentEquipment[slotDef.slotKey] || null;
              let activeUnequipKey = slotDef.slotKey;

              if (!itemId && slotDef.fallbackKeys) {
                for (const fallback of slotDef.fallbackKeys) {
                  if (currentEquipment[fallback]) {
                    itemId = currentEquipment[fallback]!;
                    activeUnequipKey = fallback;
                    break;
                  }
                }
              }

              const item = itemId ? getShopItemById(itemId) : null;

              return (
                <div
                  key={slotDef.slotKey}
                  onClick={() => setActiveSlot(slotDef.slotKey)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    item
                      ? RARITY_COLORS[item.rarity].border + " bg-slate-900/60"
                      : "border-slate-800/80 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/60 shrink-0">
                      {slotDef.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block truncate">
                        {slotDef.label}
                      </span>
                      <span className="text-xs font-bold text-foreground block truncate max-w-[140px]">
                        {item ? item.name : "Vazio"}
                      </span>
                      {item && (
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {item.statBonus.xpMultiplier && (
                            <span className="text-[9px] text-indigo-400 font-bold">
                              +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                            </span>
                          )}
                          {item.statBonus.streakProtection && (
                            <span className="text-[9px] text-blue-400 font-bold">
                              +{item.statBonus.streakProtection} Prot.
                            </span>
                          )}
                          {item.statBonus.coinBonus && (
                            <span className="text-[9px] text-emerald-400 font-bold">
                              +{Math.round(item.statBonus.coinBonus * 100)}% 🪙
                            </span>
                          )}
                          {item.statBonus.timeBonusSeconds && (
                            <span className="text-[9px] text-cyan-400 font-bold">
                              +{item.statBonus.timeBonusSeconds}s Tempo
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {item && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnequip(activeUnequipKey);
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-400 h-7 px-2 cursor-pointer shrink-0"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SELEÇÃO DE HERÓIS E ARQUÉTIPOS RPG */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-800 bg-card/60 backdrop-blur-md p-6 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Galeria de Heróis &amp; Companheiros Linguistas
          </h3>
          <p className="text-xs text-muted-foreground">
            Escolha seu companheiro de jornada. Cada herói possui bônus de afinidade para famílias de línguas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {allHeroes.map((char) => {
            const isCurrent = prepared.selectedCharacterId === char.id;
            return (
              <div
                key={char.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  isCurrent
                    ? "border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                      {char.category}
                    </Badge>
                    {isCurrent && (
                      <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
                        Ativo ✓
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">{char.name}</h4>
                    <span className="text-[11px] text-indigo-400 font-semibold block">
                      {char.title}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {char.lore}
                  </p>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Afinidade: {char.nativeLanguageBonus} (+15% XP)
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isCurrent ? "secondary" : "default"}
                  disabled={isCurrent}
                  onClick={() => handleSelectCharacter(char)}
                  className={`w-full text-xs font-bold ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  }`}
                >
                  {isCurrent ? "Herói Selecionado" : "Escolher Herói"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LOJA & ARMORY RPG COM CATÁLOGO DOS 7 SLOTS */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-800 bg-card/60 backdrop-blur-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              Arsenal &amp; Loja de Itens RPG
            </h3>
            <p className="text-xs text-muted-foreground">
              Compre relíquias lendárias e equipe seu personagem para acelerar o progresso nos idiomas.
            </p>
          </div>

          {/* Toggle Loja vs Inventário */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <Button
              size="sm"
              variant={shopMode === "shop" ? "default" : "ghost"}
              onClick={() => {
                playOptionSelectSound();
                setShopMode("shop");
              }}
              className={`text-xs font-bold ${
                shopMode === "shop" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Loja Completa
            </Button>
            <Button
              size="sm"
              variant={shopMode === "closet" ? "default" : "ghost"}
              onClick={() => {
                playOptionSelectSound();
                setShopMode("closet");
              }}
              className={`text-xs font-bold ${
                shopMode === "closet" ? "bg-indigo-600 text-white" : "text-slate-400"
              }`}
            >
              Meu Inventário ({inventoryIds.length})
            </Button>
          </div>
        </div>

        {/* Abas dos Slots RPG */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {SLOT_TABS.map((slot) => {
            const active = activeSlot === slot.id;
            return (
              <Button
                key={slot.id}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  playOptionSelectSound();
                  setActiveSlot(slot.id);
                }}
                className={`text-xs font-bold whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className="mr-1.5">{slot.icon}</span>
                {slot.label}
              </Button>
            );
          })}
        </div>

        {/* Filtros de Raridade */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">Raridade:</span>
          {(["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const).map((rarity) => (
            <button
              key={rarity}
              onClick={() => {
                playOptionSelectSound();
                setRarityFilter(rarity);
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                rarityFilter === rarity
                  ? "bg-primary text-primary-foreground border-primary shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-foreground"
              }`}
            >
              {rarity}
            </button>
          ))}
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredItems.map((item) => {
            const owned = inventoryIds.includes(item.id);
            const equipped = isEquipped(item.id, item.slot);
            const canAfford = (prepared.coins ?? 0) >= item.costCoins;
            const levelMet = levelInfo.level >= item.requiredLevel;
            const rarityStyle = RARITY_COLORS[item.rarity];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-slate-900/40 backdrop-blur-sm ${rarityStyle.border}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-bold ${rarityStyle.badge}`}>
                      {item.rarity}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Slot: {item.slot}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-foreground">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Inspiração Épica */}
                  <div className="text-[10px] text-indigo-300/90 italic bg-indigo-950/30 p-2 rounded-lg border border-indigo-900/30">
                    🗡️ Inspirado em: {item.inspiration}
                  </div>

                  {/* Bônus de Atributos */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.statBonus.xpMultiplier && (
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                      </span>
                    )}
                    {item.statBonus.streakProtection && (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        +{item.statBonus.streakProtection} Dias Protegidos
                      </span>
                    )}
                    {item.statBonus.coinBonus && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{Math.round(item.statBonus.coinBonus * 100)}% Moedas
                      </span>
                    )}
                    {item.statBonus.timeBonusSeconds && (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        +{item.statBonus.timeBonusSeconds}s Tempo
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                  <div>
                    {!owned && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-amber-400">
                          {item.costCoins > 0 ? `${item.costCoins} 🪙` : "Grátis"}
                        </span>
                        {!levelMet && (
                          <span className="text-[10px] text-rose-400 block font-semibold">
                            (Requer Nvl {item.requiredLevel})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {equipped ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Equipado
                    </Button>
                  ) : owned ? (
                    <Button
                      size="sm"
                      onClick={() => handleEquip(item)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Equipar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!canAfford || !levelMet}
                      onClick={() => handleBuy(item)}
                      className={`text-xs font-bold cursor-pointer ${
                        canAfford && levelMet
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {!levelMet ? (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1" /> Nível {item.requiredLevel}
                        </>
                      ) : (
                        `Comprar (${item.costCoins} 🪙)`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
