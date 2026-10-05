import React, { useState } from "react";
import { UserProgress } from "@/types/language";
import {
  AvatarAnimationState,
  SlotType,
  ShopItem,
  CharacterBase,
  EquipmentSlot,
  ItemTier,
} from "@/types/avatar";
import { ModularAvatar } from "@/components/avatar/ModularAvatar";
import {
  BASE_AVATARS,
  ITEM_CATALOG,
  CHARACTERS_DATABASE,
  SHOP_ITEMS_CATALOG,
  DEFAULT_AVATAR_CONFIG,
  adaptRoAvatarToCharacterBase,
  adaptRoItemToShopItem,
  getShopItemById,
} from "@/data/avatar-items";
import {
  ARCHETYPES_REGISTRY,
  WARDROBE_CATALOG,
  adaptStudioArchetypeToCharacterBase,
  adaptStudioWardrobeItemToShopItem,
} from "@/data/studio-fantasy";
import {
  calculateLevelInfo,
  ensureGamificationProgress,
  getCombinedStats,
  buyShopItem,
  equipShopItem,
  unequipShopSlot,
  selectRpgCharacter,
} from "@/services/gamification";
import {
  playSuccessSound,
  playOptionSelectSound,
  playSprintCompleteSound,
} from "@/services/audio-effects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Coins,
  Shield,
  ShoppingBag,
  Shirt,
  Check,
  Lock,
  Smile,
  Brain,
  Mic,
  Volume2,
  Sword,
  Wand2,
  Backpack,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AvatarShopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

const RO_SLOT_TABS: { id: string; label: string; icon: string }[] = [
  { id: "all", label: "Tudo", icon: "✨" },
  { id: "heroes", label: "Heróis & Companheiros", icon: "🧙‍♂️" },
  { id: EquipmentSlot.HEAD_UPPER, label: "Chapéus & Capuzes", icon: "🎩" },
  { id: EquipmentSlot.HEAD_LOWER, label: "Boca & Acessórios", icon: "🍃" },
  { id: EquipmentSlot.ARMOR, label: "Trajes & Túnicas", icon: "👘" },
  { id: EquipmentSlot.GARMENT, label: "Asas & Capas", icon: "🪽" },
  { id: EquipmentSlot.BACKPACK, label: "Mochilas & Alforjes", icon: "🎒" },
  { id: EquipmentSlot.RIGHT_HAND, label: "Armas & Cajados", icon: "⚔️" },
  { id: EquipmentSlot.PET_FAMILIAR, label: "Familiares & Mascotes", icon: "🐣" },
  { id: "HEAD", label: "Cabeça", icon: "🧢" },
  { id: "CHEST", label: "Peitoral", icon: "🥋" },
  { id: "MAIN_HAND", label: "Mão", icon: "🔨" },
  { id: "BACK", label: "Costas", icon: "📦" },
  { id: "ACCESSORY", label: "Acessório", icon: "💎" },
];

const TIER_COLORS: Record<string, { badge: string; border: string }> = {
  // Studio Fantasy Tiers
  APPRENTICE: {
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
    border: "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
  },
  SCHOLAR: {
    badge: "bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700/60 font-bold",
    border: "border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500",
  },
  POLYGLOT_KNIGHT: {
    badge: "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700/60 font-bold",
    border: "border-purple-300 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-500",
  },
  GRAND_ARCHIVIST: {
    badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-600 font-black",
    border: "border-amber-300 dark:border-amber-700/60 hover:border-amber-500 shadow-sm",
  },

  // Ragnarok Online Tiers
  NOVICE: {
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
    border: "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
  },
  FIRST_CLASS: {
    badge: "bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700/60 font-bold",
    border: "border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500",
  },
  SECOND_CLASS: {
    badge: "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700/60 font-bold",
    border: "border-purple-300 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-500",
  },
  TRANSCENDENT: {
    badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-600 font-black",
    border: "border-amber-300 dark:border-amber-700/60 hover:border-amber-500 shadow-sm",
  },

  // Legacy Tiers
  COMMON: {
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
    border: "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
  },
  RARE: {
    badge: "bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700/60 font-bold",
    border: "border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500",
  },
  EPIC: {
    badge: "bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700/60 font-bold",
    border: "border-purple-300 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-500",
  },
  LEGENDARY: {
    badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-600 font-black",
    border: "border-amber-300 dark:border-amber-700/60 hover:border-amber-500 shadow-sm",
  },
  MYTHIC: {
    badge: "bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700/60 font-black",
    border: "border-rose-300 dark:border-rose-700/60 hover:border-rose-500 shadow-sm",
  },
};

export const AvatarShopModal: React.FC<AvatarShopModalProps> = ({
  open,
  onOpenChange,
  progress,
  onUpdateProgress,
}) => {
  const prepared = ensureGamificationProgress(progress);
  const levelInfo = calculateLevelInfo(prepared.xp);
  const combinedStats = getCombinedStats(prepared, prepared.selectedLanguage);
  const avatarConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const currentEquipment = (prepared.equipment || {}) as Record<string, string | null | undefined>;
  const inventoryIds = prepared.inventoryItemIds || [];

  const [activeTab, setActiveTab] = useState<"catalog" | "heroes" | "closet">("catalog");
  const [selectedSlot, setSelectedSlot] = useState<string>("all");
  const [previewState, setPreviewState] = useState<AvatarAnimationState>("idle");

  const studioAdaptedItems = WARDROBE_CATALOG.map(adaptStudioWardrobeItemToShopItem);
  const roAdaptedItems = ITEM_CATALOG.map(adaptRoItemToShopItem);
  const fullShopCatalog: ShopItem[] = [...studioAdaptedItems, ...roAdaptedItems, ...SHOP_ITEMS_CATALOG];

  const allHeroes: CharacterBase[] = [
    ...Object.values(ARCHETYPES_REGISTRY).map(adaptStudioArchetypeToCharacterBase),
    ...BASE_AVATARS.map(adaptRoAvatarToCharacterBase),
    ...CHARACTERS_DATABASE,
  ];

  const filteredItems = fullShopCatalog.filter((item) => {
    if (activeTab === "closet" && !inventoryIds.includes(item.id)) {
      return false;
    }

    if (selectedSlot === "all") return true;

    // Correspondência direta do slot
    if (item.slot === selectedSlot) return true;

    // Mapeamento Studio Fantasy SlotCategory (bidirecional)
    if ((selectedSlot === "HEAD" || selectedSlot === EquipmentSlot.HEAD_UPPER) && item.slot === "HEADWEAR") return true;
    if (selectedSlot === "HEADWEAR" && (item.slot === "HEAD" || item.slot === EquipmentSlot.HEAD_UPPER)) return true;

    if ((selectedSlot === "CHEST" || selectedSlot === EquipmentSlot.ARMOR) && item.slot === "OUTFIT") return true;
    if (selectedSlot === "OUTFIT" && (item.slot === "CHEST" || item.slot === EquipmentSlot.ARMOR)) return true;

    if ((selectedSlot === "MAIN_HAND" || selectedSlot === EquipmentSlot.RIGHT_HAND) && item.slot === "MAIN_TOOL") return true;
    if (selectedSlot === "MAIN_TOOL" && (item.slot === "MAIN_HAND" || item.slot === EquipmentSlot.RIGHT_HAND)) return true;

    if ((selectedSlot === "OFF_HAND" || selectedSlot === EquipmentSlot.LEFT_HAND) && item.slot === "OFF_TOOL") return true;
    if (selectedSlot === "OFF_TOOL" && (item.slot === "OFF_HAND" || item.slot === EquipmentSlot.LEFT_HAND)) return true;

    if ((selectedSlot === "BACK" || selectedSlot === EquipmentSlot.BACKPACK || selectedSlot === EquipmentSlot.GARMENT) && item.slot === "BACKPACK_CAPE") return true;
    if (selectedSlot === "BACKPACK_CAPE" && (item.slot === "BACK" || item.slot === EquipmentSlot.BACKPACK || item.slot === EquipmentSlot.GARMENT)) return true;

    if ((selectedSlot === "ACCESSORY" || selectedSlot === EquipmentSlot.PET_FAMILIAR) && item.slot === "FAMILIAR") return true;
    if (selectedSlot === "FAMILIAR" && (item.slot === "ACCESSORY" || item.slot === EquipmentSlot.PET_FAMILIAR)) return true;

    // Mapeamento de slots RO compatíveis (bidirecional)
    if (selectedSlot === "HEAD" && (item.slot === EquipmentSlot.HEAD_UPPER || item.slot === EquipmentSlot.HEAD_LOWER || item.slot === EquipmentSlot.HEAD_MIDDLE)) return true;
    if (selectedSlot === EquipmentSlot.HEAD_UPPER && item.slot === "HEAD") return true;
    if (selectedSlot === "CHEST" && item.slot === EquipmentSlot.ARMOR) return true;
    if (selectedSlot === EquipmentSlot.ARMOR && item.slot === "CHEST") return true;
    if (selectedSlot === "BACK" && (item.slot === EquipmentSlot.GARMENT || item.slot === EquipmentSlot.BACKPACK)) return true;
    if (selectedSlot === EquipmentSlot.GARMENT && item.slot === "BACK") return true;
    if (selectedSlot === EquipmentSlot.BACKPACK && item.slot === "BACK") return true;
    if (selectedSlot === "MAIN_HAND" && item.slot === EquipmentSlot.RIGHT_HAND) return true;
    if (selectedSlot === EquipmentSlot.RIGHT_HAND && item.slot === "MAIN_HAND") return true;
    if (selectedSlot === "OFF_HAND" && item.slot === EquipmentSlot.LEFT_HAND) return true;
    if (selectedSlot === EquipmentSlot.LEFT_HAND && item.slot === "OFF_HAND") return true;
    if (selectedSlot === "ACCESSORY" && item.slot === EquipmentSlot.PET_FAMILIAR) return true;
    if (selectedSlot === EquipmentSlot.PET_FAMILIAR && item.slot === "ACCESSORY") return true;
    if (selectedSlot === "LEGS" && item.slot === EquipmentSlot.FOOTGEAR) return true;
    if (selectedSlot === EquipmentSlot.FOOTGEAR && item.slot === "LEGS") return true;

    return false;
  });

  const handleBuy = (item: ShopItem) => {
    const res = buyShopItem(prepared, item.id);
    if (!res.success) {
      toast.error(res.error || "Não foi possível comprar este item.");
      return;
    }
    playSprintCompleteSound();
    toast.success(`🎉 Você desbloqueou: [${item.name}]!`, {
      description: "Equipado automaticamente no seu avatar Chibi!",
    });
    if (res.updated) {
      onUpdateProgress(res.updated);
    }
  };

  const handleEquip = (item: ShopItem) => {
    playOptionSelectSound();
    const updated = equipShopItem(prepared, item.id);
    onUpdateProgress(updated);
    toast.success(`[${item.name}] equipado com sucesso!`);
  };

  const handleUnequip = (slot: string) => {
    playOptionSelectSound();
    const updated = unequipShopSlot(prepared, slot);
    onUpdateProgress(updated);
    toast.info("Item desequipado.");
  };

  const handleSelectHero = (hero: CharacterBase) => {
    playOptionSelectSound();
    const updated = selectRpgCharacter(prepared, hero.id);
    onUpdateProgress(updated);
    toast.success(`Herói selecionado: ${hero.name}!`, {
      description: hero.avatarGreeting || "Pronto para as lições!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              <span>Loja &amp; Armaria Studio Fantasy</span>
            </DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{prepared.coins ?? 150} Moedas</span>
              </div>
              <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold">
                Nível {levelInfo.level}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Personalize seu herói com chapéus de viajante, mantos cerimoniais, rapieiras rúnicas e golens autômatos!
          </p>
        </DialogHeader>

        {/* Topo: Visualização do Avatar Chibi & Bônus de Lições */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-sm">
            <div className="relative h-28 w-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
              <ModularAvatar
                config={avatarConfig}
                state={previewState}
                size="md"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["idle", "speaking", "listening", "celebrating", "thinking"] as AvatarAnimationState[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPreviewState(st)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    previewState === st
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={`Testar pose: ${st}`}
                >
                  {st === "speaking" && <Volume2 className="w-3 h-3" />}
                  {st === "listening" && <Mic className="w-3 h-3" />}
                  {st === "celebrating" && <Smile className="w-3 h-3" />}
                  {st === "thinking" && <Brain className="w-3 h-3" />}
                  {st === "idle" && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Companheiro Ativo
                </span>
                <Badge className="bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-300 dark:border-indigo-500 text-indigo-900 dark:text-indigo-300 text-[10px] font-bold">
                  {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.name || "Kaelen, o Tático Errante"}
                </Badge>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.title || "Herói da Jornada"}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.lore || "Bônus ativo de aprendizado de vocabulário."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">Multiplicador XP</span>
                <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">{combinedStats.finalXpMultiplier}x</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">Bônus Moedas</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">+{Math.round((combinedStats.finalCoinBonus - 1) * 100)}%</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">Proteção Streak</span>
                <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">+{combinedStats.finalStreakProtection} Dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas Principais: Loja Fantasy vs Galeria de Heróis vs Armaria */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Button
            size="sm"
            variant={activeTab === "catalog" ? "default" : "ghost"}
            onClick={() => {
              playOptionSelectSound();
              setActiveTab("catalog");
              setSelectedSlot("all");
            }}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "catalog" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Loja Fantasy
          </Button>
          <Button
            size="sm"
            variant={activeTab === "heroes" ? "default" : "ghost"}
            onClick={() => {
              playOptionSelectSound();
              setActiveTab("heroes");
            }}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "heroes" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            Galeria de Heróis ({allHeroes.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "closet" ? "default" : "ghost"}
            onClick={() => {
              playOptionSelectSound();
              setActiveTab("closet");
              setSelectedSlot("all");
            }}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "closet" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Shirt className="w-3.5 h-3.5 mr-1.5" />
            Minha Armaria ({inventoryIds.length})
          </Button>
        </div>

        {/* Sub-Abas de Filtro de Slots (somente nos modos de itens) */}
        {activeTab !== "heroes" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {RO_SLOT_TABS.filter((t) => t.id !== "heroes").map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playOptionSelectSound();
                  setSelectedSlot(tab.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all flex items-center gap-1 border ${
                  selectedSlot === tab.id
                    ? "bg-amber-100 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500/50 text-amber-900 dark:text-amber-300 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo: Galeria de Heróis */}
        {activeTab === "heroes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allHeroes.map((hero) => {
              const isSelected = (prepared.selectedCharacterId || "char_tactician_m") === hero.id;
              return (
                <div
                  key={hero.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {hero.category}
                      </span>
                      {isSelected && (
                        <Badge className="bg-indigo-600 text-white font-extrabold text-[10px]">
                          Ativo ✓
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{hero.name}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {hero.lore}
                    </p>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20 block truncate">
                        Afinidade: {hero.nativeLanguageBonus}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={isSelected}
                    onClick={() => handleSelectHero(hero)}
                    className={`w-full text-xs font-bold ${
                      isSelected
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                    }`}
                  >
                    {isSelected ? "Selecionado" : "Escolher Herói"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Conteúdo: Itens do Catálogo ou Armaria */}
        {activeTab !== "heroes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isOwned = inventoryIds.includes(item.id);
              const isItemEquipped = currentEquipment[item.slot] === item.id;
              const canAfford = (prepared.coins ?? 150) >= item.costCoins;
              const hasLevel = levelInfo.level >= item.requiredLevel;

              const fallbackTierStyle = {
                badge: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
                border: "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500",
              };
              const tierStyle = (item.rarity && TIER_COLORS[item.rarity]) || fallbackTierStyle;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white dark:bg-slate-900/60 shadow-sm ${tierStyle.border} ${
                    isItemEquipped
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : ""
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tierStyle.badge}`}>
                        {item.rarity}
                      </span>
                      {isItemEquipped ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          Equipado
                        </Badge>
                      ) : isOwned ? (
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">Adquirido</span>
                      ) : (
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {item.costCoins} Moedas
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.statBonus?.xpMultiplier && (
                        <span className="text-[10px] font-bold text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/50">
                          +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                        </span>
                      )}
                      {item.statBonus?.coinBonus && (
                        <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700/50">
                          +{Math.round(item.statBonus.coinBonus * 100)}% Moedas
                        </span>
                      )}
                      {item.statBonus?.streakProtection && (
                        <span className="text-[10px] font-bold text-blue-950 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-700/50">
                          +{item.statBonus.streakProtection} Proteção
                        </span>
                      )}
                      {item.statBonus?.timeBonusSeconds && (
                        <span className="text-[10px] font-bold text-cyan-950 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-300 dark:border-cyan-700/50">
                          +{item.statBonus.timeBonusSeconds}s Tempo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    {isItemEquipped ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUnequip(item.slot)}
                        className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        Desequipar
                      </Button>
                    ) : isOwned ? (
                      <Button
                        size="sm"
                        onClick={() => handleEquip(item)}
                        className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                      >
                        Equipar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!canAfford || !hasLevel}
                        onClick={() => handleBuy(item)}
                        className={`w-full text-xs font-bold cursor-pointer ${
                          !hasLevel
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            : !canAfford
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-sm"
                        }`}
                      >
                        {!hasLevel
                          ? `Requer Nv. ${item.requiredLevel}`
                          : !canAfford
                          ? "Moedas Insuficientes"
                          : `Comprar (${item.costCoins} 🪙)`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
