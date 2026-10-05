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
  DEFAULT_CHARACTER_ID,
  getShopItemById,
  getCharacterById,
  BASE_AVATARS,
  ITEM_CATALOG,
  adaptRoAvatarToCharacterBase,
  adaptRoItemToShopItem,
  ARCHETYPES_REGISTRY,
  WARDROBE_CATALOG,
  adaptStudioArchetypeToCharacterBase,
  adaptStudioWardrobeItemToShopItem,
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
  equipStudioFantasyKit,
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
  { slotKey: EquipmentSlot.HEAD_UPPER, fallbackKeys: ["HEAD", "HEADWEAR"], label: "Chapéu / Capuz", icon: "🎩" },
  { slotKey: EquipmentSlot.HEAD_MIDDLE, fallbackKeys: ["eyes"], label: "Óculos / Viseira", icon: "👓" },
  { slotKey: EquipmentSlot.HEAD_LOWER, fallbackKeys: ["head_lower"], label: "Boca / Amuleto", icon: "🍃" },
  { slotKey: EquipmentSlot.ARMOR, fallbackKeys: ["CHEST", "body", "OUTFIT"], label: "Traje / Armadura", icon: "🥋" },
  { slotKey: EquipmentSlot.GARMENT, fallbackKeys: ["BACK", "back", "BACKPACK_CAPE"], label: "Capa & Asas", icon: "🪽" },
  { slotKey: EquipmentSlot.FOOTGEAR, fallbackKeys: ["LEGS", "legs"], label: "Botas / Calçado", icon: "👢" },
  { slotKey: EquipmentSlot.RIGHT_HAND, fallbackKeys: ["MAIN_HAND", "hand", "MAIN_TOOL"], label: "Arma / Ferramenta", icon: "⚔️" },
  { slotKey: EquipmentSlot.LEFT_HAND, fallbackKeys: ["OFF_HAND", "off_hand", "OFF_TOOL"], label: "Escudo / Grimório", icon: "🛡️" },
  { slotKey: EquipmentSlot.BACKPACK, fallbackKeys: ["backpack", "BACKPACK_CAPE"], label: "Mochila / Alforge", icon: "🎒" },
  { slotKey: EquipmentSlot.PET_FAMILIAR, fallbackKeys: ["pet", "FAMILIAR"], label: "Familiar & Mascote", icon: "🐣" },
  { slotKey: "ACCESSORY", fallbackKeys: ["accessory"], label: "Relíquia / Acessório", icon: "💎" },
];

const SLOT_TABS: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "Tudo", icon: "✨" },
  { id: "HEAD", label: "Chapéus & Capuzes", icon: "🎩" },
  { id: "CHEST", label: "Trajes & Túnicas", icon: "👘" },
  { id: "LEGS", label: "Botas & Pernas", icon: "👢" },
  { id: "MAIN_HAND", label: "Armas & Cajados", icon: "⚔️" },
  { id: "OFF_HAND", label: "Escudos & Grimórios", icon: "🛡️" },
  { id: "BACK", label: "Capas & Mochilas", icon: "🎒" },
  { id: "PET", label: "Familiares & Mascotes", icon: "🐣" },
  { id: "ACCESSORY", label: "Relíquias & Acessórios", icon: "💎" },
  { id: "archetype", label: "Galeria de Heróis", icon: "🧙‍♂️" },
];

const RARITY_COLORS: Record<ItemRarity, { badge: string; border: string }> = {
  COMMON: {
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
    border: "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
  },
  RARE: {
    badge: "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold",
    border: "border-blue-200 dark:border-blue-800/80 hover:border-blue-500 dark:hover:border-blue-400",
  },
  EPIC: {
    badge: "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-bold",
    border: "border-purple-200 dark:border-purple-800/80 hover:border-purple-500 dark:hover:border-purple-400",
  },
  LEGENDARY: {
    badge: "bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-black",
    border: "border-amber-300 dark:border-amber-700 hover:border-amber-500 dark:hover:border-amber-400 shadow-sm",
  },
  MYTHIC: {
    badge: "bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-black animate-pulse",
    border: "border-rose-300 dark:border-rose-600 hover:border-rose-500 dark:hover:border-rose-400 shadow-md",
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
  const selectedChar = getCharacterById(prepared.selectedCharacterId || DEFAULT_CHARACTER_ID);

  const allHeroes: CharacterBase[] = [
    ...Object.values(ARCHETYPES_REGISTRY).map(adaptStudioArchetypeToCharacterBase),
    ...BASE_AVATARS.map(adaptRoAvatarToCharacterBase),
    ...CHARACTERS_DATABASE,
  ];

  const fullShopCatalog: ShopItem[] = [
    ...WARDROBE_CATALOG.map(adaptStudioWardrobeItemToShopItem),
    ...ITEM_CATALOG.map(adaptRoItemToShopItem),
    ...SHOP_ITEMS_CATALOG,
  ];

  const [activeSlot, setActiveSlot] = useState<string>("all");
  const [shopMode, setShopMode] = useState<"shop" | "closet">("shop");
  const [rarityFilter, setRarityFilter] = useState<ItemRarity | "ALL">("ALL");
  const [previewState, setPreviewState] = useState<AvatarAnimationState>("idle");

  const filteredItems = fullShopCatalog.filter((item) => {
    // Filtro por slot unificado com mapeamento entre sistema Studio Fantasy, RO e legado
    if (activeSlot !== "all" && activeSlot !== "archetype") {
      const directMatch = item.slot === activeSlot;
      const mappedMatch =
        (activeSlot === "HEAD" && (item.slot === "HEAD" || item.slot === EquipmentSlot.HEAD_UPPER || item.slot === EquipmentSlot.HEAD_LOWER || item.slot === EquipmentSlot.HEAD_MIDDLE || item.slot === "HEADWEAR")) ||
        (activeSlot === "CHEST" && (item.slot === "CHEST" || item.slot === EquipmentSlot.ARMOR || item.slot === "OUTFIT")) ||
        (activeSlot === "LEGS" && (item.slot === "LEGS" || item.slot === EquipmentSlot.FOOTGEAR)) ||
        (activeSlot === "MAIN_HAND" && (item.slot === "MAIN_HAND" || item.slot === EquipmentSlot.RIGHT_HAND || item.slot === "MAIN_TOOL")) ||
        (activeSlot === "OFF_HAND" && (item.slot === "OFF_HAND" || item.slot === EquipmentSlot.LEFT_HAND || item.slot === "OFF_TOOL")) ||
        (activeSlot === "BACK" && (item.slot === "BACK" || item.slot === EquipmentSlot.GARMENT || item.slot === EquipmentSlot.BACKPACK || item.slot === "BACKPACK_CAPE")) ||
        (activeSlot === "PET" && (item.slot === EquipmentSlot.PET_FAMILIAR || item.slot === "FAMILIAR")) ||
        (activeSlot === "ACCESSORY" && item.slot === "ACCESSORY");

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

  const handleEquipStudioKit = (heroId: "kaelen" | "lyanna" | "ignisaur" = "kaelen") => {
    playSuccessSound();
    const updated = equipStudioFantasyKit(prepared, heroId);
    onUpdateProgress(updated);
    const heroNames: Record<string, string> = {
      kaelen: "Kaelen, o Espadachim Linguista",
      lyanna: "Lyanna, a Maga de Véu",
      ignisaur: "Ignisaur, a Chama Ancestral",
    };
    toast.success(`✨ Visual Studio Fantasy Ativado!`, {
      description: `Transformado em ${heroNames[heroId]} com o kit Studio Fantasy completo equipado!`,
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
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-5 sm:p-6 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-black px-3 py-0.5 text-xs shadow-sm">
                Nível {levelInfo.level}
              </Badge>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {selectedChar ? selectedChar.name : levelInfo.title}
              </h2>
            </div>
            <p className="text-xs text-slate-100 font-medium max-w-xl leading-relaxed">
              {selectedChar?.lore ||
                "Ganhe XP e Moedas em treinos diários e conversas com o Tutor IA para equipar e evoluir seu avatar RPG."}
            </p>
          </div>

          {/* Saldo de Moedas & Botão Conversar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-amber-400/50 px-4 py-2.5 rounded-2xl shadow-inner">
              <Coins className="h-6 w-6 text-amber-300" />
              <div>
                <span className="text-[10px] text-amber-200 font-bold block uppercase tracking-wider">
                  Moedas RPG
                </span>
                <span className="text-lg font-black text-amber-300 leading-none">
                  {prepared.coins ?? 150} 🪙
                </span>
              </div>
            </div>

            {onOpenConversation && (
              <Button
                onClick={onOpenConversation}
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold shadow-lg cursor-pointer text-xs h-10 px-4 rounded-xl"
              >
                Praticar com Tutor
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas RPG Combinadas (Atributos de Equipamento) */}
        <div className="mt-4 pt-4 border-t border-indigo-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-sm">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 font-bold block uppercase tracking-wider">
                Multiplicador de XP
              </span>
              <span className="text-sm font-black text-white">
                {combinedStats.finalXpMultiplier}x{" "}
                <span className="text-xs font-bold text-emerald-300">
                  (+{Math.round((combinedStats.finalXpMultiplier - 1) * 100)}%)
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 font-bold block uppercase tracking-wider">
                Bônus de Moedas
              </span>
              <span className="text-sm font-black text-white">
                {combinedStats.finalCoinBonus}x{" "}
                <span className="text-xs font-bold text-emerald-300">
                  (+{Math.round((combinedStats.finalCoinBonus - 1) * 100)}%)
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 font-bold block uppercase tracking-wider">
                Proteção de Ofensiva
              </span>
              <span className="text-sm font-black text-white">
                {combinedStats.finalStreakProtection} Dias Protegidos
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de Nível */}
        <div className="mt-4 pt-3 border-t border-indigo-800/60 space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-100">
            <span>Progresso para o Nível {levelInfo.level + 1}</span>
            <span className="text-amber-300 font-black">
              {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP ({levelInfo.progressPercent}%)
            </span>
          </div>
          <Progress value={levelInfo.progressPercent} className="h-2 bg-slate-950/80" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* NOVIDADE: VITRINE DESTAQUE STUDIO FANTASY (TRANSFORMAÇÃO 1-CLIQUE) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-r from-sky-950 via-indigo-950 to-purple-950 p-5 sm:p-6 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 shadow-sm">
                NOVIDADE STUDIO FANTASY
              </Badge>
              <span className="text-xs text-sky-300 font-bold">Vetor 3D Shaded • Fidelidade Estúdio RPG</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              Heróis e Mascotes Studio Fantasy com Visual de Alta Produção
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Descubra Kaelen (o Espadachim Linguista), Lyanna (a Maga de Véu) e Ignisaur (a Chama Ancestral) com 
              sombreamento volumétrico, asas em camadas e runas de sintaxe gravadas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Button
              onClick={() => handleEquipStudioKit("kaelen")}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs h-11 px-5 rounded-2xl shadow-xl shadow-indigo-500/30 cursor-pointer transform hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Transformar em Kaelen (Visual Completo Studio Fantasy)</span>
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEquipStudioKit("lyanna")}
                className="flex-1 sm:flex-none border-purple-400/50 bg-purple-900/40 text-purple-200 hover:bg-purple-800/60 text-xs font-bold h-11 px-3.5 rounded-2xl cursor-pointer"
              >
                ✨ Lyanna Kit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEquipStudioKit("ignisaur")}
                className="flex-1 sm:flex-none border-amber-400/50 bg-amber-900/40 text-amber-200 hover:bg-amber-800/60 text-xs font-bold h-11 px-3.5 rounded-2xl cursor-pointer"
              >
                🔥 Ignisaur Kit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. VITRINE DE AVATAR RPG & OS SLOTS DE EQUIPAMENTO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Central: Avatar Preview + Controles de Estado */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 flex flex-col items-center justify-center space-y-4 shadow-sm dark:shadow-xl">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Pré-visualização do Personagem
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {selectedChar?.name || "Herói Aventureiro"}
            </h3>
            {selectedChar && (
              <Badge variant="outline" className="text-[10px] font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80">
                ⚡ Afinidade: {selectedChar.nativeLanguageBonus}
              </Badge>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-slate-100 dark:from-indigo-950/40 dark:to-slate-950/80 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
            <ModularAvatar
              config={avatarConfig}
              state={previewState}
              size="xl"
              level={levelInfo.level}
              showBadge={true}
            />
          </div>

          {/* ============================================================ */}
          {/* CAIXA DE TEXTO DO AVATAR (BALÃO DE DIÁLOGO EM ALTO CONTRASTE) */}
          {/* ============================================================ */}
          <div className="w-full relative rounded-2xl border-2 border-indigo-300 dark:border-indigo-600 bg-slate-50 dark:bg-slate-900 p-4 shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">💬</span>
                <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider truncate">
                  {selectedChar?.name || "Herói Aventureiro"}
                </span>
              </div>
              <Badge className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-0.5 shrink-0 shadow-xs">
                {previewState === "speaking"
                  ? "Falando"
                  : previewState === "listening"
                  ? "Ouvindo"
                  : previewState === "celebrating"
                  ? "Vitória!"
                  : previewState === "thinking"
                  ? "Pensando"
                  : "Voz Ativa"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed select-text">
              {previewState === "speaking"
                ? selectedChar?.avatarGreeting || "Pronto para treinar pronúncia e novas expressões com maestria!"
                : previewState === "listening"
                ? "Estou ouvindo você com atenção! Fale com naturalidade para refinarmos sua entonação."
                : previewState === "celebrating"
                ? "Excelente progresso! A cada lição e diálogo completado seu vocabulário se torna lendário!"
                : previewState === "thinking"
                ? "Analisando nuances sintáticas e a gramática ideal para o contexto da conversa..."
                : selectedChar?.avatarGreeting || "Salve, estudioso! Equipamentos aumentam seu ganho de XP e moedas em cada treino."}
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-bold">
              <span className="truncate mr-1">
                ⚡ Afinidade: <strong className="text-slate-950 dark:text-white font-black">{selectedChar?.nativeLanguageBonus}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  playOptionSelectSound();
                  toast.info(`Voz de ${selectedChar?.name || "Herói"} ativada!`);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-extrabold flex items-center gap-1 text-[11px] shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ouvir</span>
              </button>
            </div>
          </div>
          <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 text-center">
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
                    className={`flex flex-col items-center h-auto py-1.5 px-1 text-[10px] gap-0.5 font-bold cursor-pointer ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{st.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Atalho Studio Fantasy Rápido */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={() => handleEquipStudioKit("kaelen")}
              className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs py-2 rounded-xl shadow-md cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              <span>Vestir Kit Kaelen Studio Fantasy</span>
            </Button>
          </div>
        </div>

        {/* Painel dos Slots de Equipamento (Paper Doll) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 space-y-4 shadow-sm dark:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Shirt className="w-4 h-4 text-indigo-500" />
                Equipamento Chibi &amp; Estúdio (Slots de Aventura)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Equipe chapéus, asas, martelos, capas e companheiros para potencializar seus estudos.
              </p>
            </div>
            {onOpenAvatarShop && (
              <Button
                size="sm"
                onClick={onOpenAvatarShop}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Loja Kafra &amp; Estúdio
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
              const isFilled = !!item;

              return (
                <div
                  key={slotDef.slotKey}
                  onClick={() => setActiveSlot(slotDef.slotKey)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                    isFilled
                      ? "bg-slate-50 dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-500"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                      {slotDef.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider block truncate">
                        {slotDef.label}
                      </span>
                      <span className={`text-xs font-black block truncate max-w-[150px] ${
                        isFilled ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 font-medium"
                      }`}>
                        {item ? item.name : "Vazio"}
                      </span>
                      {item && (
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {item.statBonus.xpMultiplier && (
                            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded font-bold">
                              +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                            </span>
                          )}
                          {item.statBonus.streakProtection && (
                            <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-bold">
                              +{item.statBonus.streakProtection} Prot.
                            </span>
                          )}
                          {item.statBonus.coinBonus && (
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded font-bold">
                              +{Math.round(item.statBonus.coinBonus * 100)}% 🪙
                            </span>
                          )}
                          {item.statBonus.timeBonusSeconds && (
                            <span className="text-[10px] text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 px-1.5 py-0.2 rounded font-bold">
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
                      className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold h-7 px-2 cursor-pointer shrink-0"
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
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md p-6 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Galeria de Heróis &amp; Companheiros Linguistas
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
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
                    ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-md shadow-indigo-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:border-indigo-300 dark:hover:border-slate-600 shadow-sm"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {char.category}
                    </Badge>
                    {isCurrent && (
                      <Badge className="bg-indigo-600 text-white font-extrabold text-[10px]">
                        Ativo ✓
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      <ModularAvatar
                        size="sm"
                        config={{
                          archetype: char.category === "MYTHIC_BEAST" ? "monster" : "human",
                          subType: char.baseSpriteAsset,
                          primaryColor: "#6366f1",
                          secondaryColor: "#f59e0b",
                          equipped: {},
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{char.name}</h4>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold block truncate">
                        {char.title}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 font-normal leading-relaxed">
                    {char.lore}
                  </p>

                  <div className="pt-1 space-y-2">
                    <span className="text-[10px] font-bold text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/50 block truncate">
                      ⚡ Afinidade: {char.nativeLanguageBonus} (+15% XP)
                    </span>
                    {char.avatarGreeting && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        💬 "{char.avatarGreeting}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Button
                    size="sm"
                    variant={isCurrent ? "secondary" : "default"}
                    disabled={isCurrent}
                    onClick={() => handleSelectCharacter(char)}
                    className={`w-full text-xs font-bold ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                    }`}
                  >
                    {isCurrent ? "Herói Selecionado" : "Escolher Herói"}
                  </Button>
                  {(char.id === "char_tactician_m" || char.id.includes("kaelen")) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipStudioKit("kaelen")}
                      className="w-full text-[11px] font-bold border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                      Vestir Kit Completo Studio
                    </Button>
                  )}
                  {(char.id === "char_archivist_f" || char.id.includes("lyanna")) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipStudioKit("lyanna")}
                      className="w-full text-[11px] font-bold border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                      Vestir Kit Completo Studio
                    </Button>
                  )}
                  {(char.id === "char_elemental_beast" || char.id.includes("ignisaur")) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipStudioKit("ignisaur")}
                      className="w-full text-[11px] font-bold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                      Vestir Kit Completo Studio
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LOJA & ARMORY RPG COM CATÁLOGO DOS 7 SLOTS */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Arsenal &amp; Loja de Itens RPG
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Compre relíquias lendárias e equipe seu personagem para acelerar o progresso nos idiomas.
            </p>
          </div>

          {/* Toggle Loja vs Inventário */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-1 rounded-xl">
            <Button
              size="sm"
              variant={shopMode === "shop" ? "default" : "ghost"}
              onClick={() => {
                playOptionSelectSound();
                setShopMode("shop");
              }}
              className={`text-xs font-bold ${
                shopMode === "shop"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                shopMode === "closet"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                    ? "bg-indigo-600 text-white shadow-md font-bold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
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
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mr-1">Raridade:</span>
          {(["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const).map((rarity) => (
            <button
              key={rarity}
              onClick={() => {
                playOptionSelectSound();
                setRarityFilter(rarity);
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                rarityFilter === rarity
                  ? "bg-indigo-600 text-white border-indigo-600 shadow font-bold"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold"
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
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white dark:bg-slate-800/95 shadow-sm backdrop-blur-sm ${rarityStyle.border}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-bold ${rarityStyle.badge}`}>
                      {item.rarity}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Slot: {item.slot}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Inspiração Épica */}
                  <div className="text-[10px] text-indigo-900 dark:text-indigo-200 italic bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800/60 font-medium">
                    🗡️ Inspirado em: {item.inspiration}
                  </div>

                  {/* Bônus de Atributos */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.statBonus.xpMultiplier && (
                      <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700/50">
                        +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                      </span>
                    )}
                    {item.statBonus.streakProtection && (
                      <span className="text-[10px] font-bold text-blue-950 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700/50">
                        +{item.statBonus.streakProtection} Dias Protegidos
                      </span>
                    )}
                    {item.statBonus.coinBonus && (
                      <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/50">
                        +{Math.round(item.statBonus.coinBonus * 100)}% Moedas
                      </span>
                    )}
                    {item.statBonus.timeBonusSeconds && (
                      <span className="text-[10px] font-bold text-cyan-950 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-700/50">
                        +{item.statBonus.timeBonusSeconds}s Tempo
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div>
                    {!owned && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                          {item.costCoins > 0 ? `${item.costCoins} 🪙` : "Grátis"}
                        </span>
                        {!levelMet && (
                          <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-bold">
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
                      className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Equipado
                    </Button>
                  ) : owned ? (
                    <Button
                      size="sm"
                      onClick={() => handleEquip(item)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-sm"
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
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 font-bold cursor-not-allowed"
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
