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
  equipStudioFantasyKit,
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
  { id: "HEAD", label: "Chapéus & Capuzes", icon: "🎩" },
  { id: "CHEST", label: "Trajes & Túnicas", icon: "👘" },
  { id: "LEGS", label: "Botas & Pernas", icon: "👢" },
  { id: "MAIN_HAND", label: "Armas & Cajados", icon: "⚔️" },
  { id: "OFF_HAND", label: "Escudos & Grimórios", icon: "🛡️" },
  { id: "BACK", label: "Capas & Mochilas", icon: "🎒" },
  { id: "PET", label: "Familiares & Mascotes", icon: "🐣" },
  { id: "ACCESSORY", label: "Relíquias & Acessórios", icon: "💎" },
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

    // Correspondência direta
    if (item.slot === selectedSlot) return true;

    // Correspondência por categoria unificada (Studio Fantasy, RO e Clássico)
    if (selectedSlot === "HEAD") {
      return (
        item.slot === "HEAD" ||
        item.slot === "HEADWEAR" ||
        item.slot === EquipmentSlot.HEAD_UPPER ||
        item.slot === EquipmentSlot.HEAD_LOWER ||
        item.slot === EquipmentSlot.HEAD_MIDDLE
      );
    }
    if (selectedSlot === "CHEST") {
      return (
        item.slot === "CHEST" ||
        item.slot === EquipmentSlot.ARMOR ||
        item.slot === "OUTFIT"
      );
    }
    if (selectedSlot === "LEGS") {
      return item.slot === "LEGS" || item.slot === EquipmentSlot.FOOTGEAR;
    }
    if (selectedSlot === "MAIN_HAND") {
      return (
        item.slot === "MAIN_HAND" ||
        item.slot === EquipmentSlot.RIGHT_HAND ||
        item.slot === "MAIN_TOOL"
      );
    }
    if (selectedSlot === "OFF_HAND") {
      return (
        item.slot === "OFF_HAND" ||
        item.slot === EquipmentSlot.LEFT_HAND ||
        item.slot === "OFF_TOOL"
      );
    }
    if (selectedSlot === "BACK") {
      return (
        item.slot === "BACK" ||
        item.slot === EquipmentSlot.GARMENT ||
        item.slot === EquipmentSlot.BACKPACK ||
        item.slot === "BACKPACK_CAPE"
      );
    }
    if (selectedSlot === "PET") {
      return (
        item.slot === EquipmentSlot.PET_FAMILIAR ||
        item.slot === "FAMILIAR"
      );
    }
    if (selectedSlot === "ACCESSORY") {
      return item.slot === "ACCESSORY";
    }

    // Fallbacks para filtros diretos por enum RO
    if (selectedSlot === EquipmentSlot.HEAD_UPPER) return item.slot === "HEAD" || item.slot === "HEADWEAR" || item.slot === EquipmentSlot.HEAD_UPPER;
    if (selectedSlot === EquipmentSlot.ARMOR) return item.slot === "CHEST" || item.slot === "OUTFIT" || item.slot === EquipmentSlot.ARMOR;
    if (selectedSlot === EquipmentSlot.FOOTGEAR) return item.slot === "LEGS" || item.slot === EquipmentSlot.FOOTGEAR;
    if (selectedSlot === EquipmentSlot.RIGHT_HAND) return item.slot === "MAIN_HAND" || item.slot === "MAIN_TOOL" || item.slot === EquipmentSlot.RIGHT_HAND;
    if (selectedSlot === EquipmentSlot.LEFT_HAND) return item.slot === "OFF_HAND" || item.slot === "OFF_TOOL" || item.slot === EquipmentSlot.LEFT_HAND;
    if (selectedSlot === EquipmentSlot.GARMENT || selectedSlot === EquipmentSlot.BACKPACK) return item.slot === "BACK" || item.slot === "BACKPACK_CAPE" || item.slot === EquipmentSlot.GARMENT || item.slot === EquipmentSlot.BACKPACK;
    if (selectedSlot === EquipmentSlot.PET_FAMILIAR) return item.slot === "ACCESSORY" || item.slot === "FAMILIAR" || item.slot === EquipmentSlot.PET_FAMILIAR;

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

  const handleEquipStudioKit = (heroId: "kaelen" | "lyanna" | "ignisaur" = "kaelen") => {
    playSuccessSound();
    const updated = equipStudioFantasyKit(prepared, heroId);
    onUpdateProgress(updated);
    const heroNames: Record<string, string> = {
      kaelen: "Kaelen, o Espadachim Linguista",
      lyanna: "Lyanna, a Maga de Véu",
      ignisaur: "Ignisaur, a Chama Ancestral",
    };
    toast.success(`✨ Visual Studio Fantasy Equipado!`, {
      description: `Transformado em ${heroNames[heroId]} com o kit Studio Fantasy completo!`,
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

        {/* Banner de Destaque Studio Fantasy - Transformação em 1 Clique */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/50 bg-gradient-to-r from-sky-950 via-indigo-950 to-purple-950 p-4 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5">
                  NOVIDADE STUDIO FANTASY
                </Badge>
                <span className="text-xs text-indigo-300 font-bold">Alta Definição Vetorial 3D</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Transforme seu Avatar no Herói Studio Fantasy Completo!
              </h3>
              <p className="text-[11px] text-slate-300 max-w-lg leading-relaxed">
                Equipe Kaelen com Florete Rúnico, Túnica de Batedor, Chapéu de Peregrino e Alforge em um único clique.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
              <Button
                onClick={() => handleEquipStudioKit("kaelen")}
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs h-9 px-3.5 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                <span>Kaelen Studio Kit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEquipStudioKit("lyanna")}
                className="border-purple-400/50 bg-purple-900/40 text-purple-200 hover:bg-purple-800/60 text-xs font-bold h-9 px-3 rounded-xl cursor-pointer"
              >
                Lyanna Kit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEquipStudioKit("ignisaur")}
                className="border-amber-400/50 bg-amber-900/40 text-amber-200 hover:bg-amber-800/60 text-xs font-bold h-9 px-3 rounded-xl cursor-pointer"
              >
                Ignisaur Kit
              </Button>
            </div>
          </div>
        </div>

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

              {/* Caixa de Texto do Avatar / Balão de Fala do Herói Ativo */}
              <div className="mt-2.5 p-2.5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-extrabold">
                  <span className="flex items-center gap-1">💬 Fala do Aventureiro:</span>
                  <button
                    type="button"
                    onClick={() => {
                      playOptionSelectSound();
                      toast.info(`Voz de ${allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.name || "Herói"} ativada!`);
                    }}
                    className="hover:underline flex items-center gap-1 cursor-pointer font-extrabold"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Ouvir</span>
                  </button>
                </div>
                <p className="italic text-slate-800 dark:text-slate-200 select-text leading-relaxed">
                  "{allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.avatarGreeting || "Pronto para treinar pronúncia e novas expressões com maestria!"}"
                </p>
              </div>
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

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <ModularAvatar
                          size="sm"
                          config={{
                            archetype: hero.category === "MYTHIC_BEAST" ? "monster" : "human",
                            subType: hero.baseSpriteAsset,
                            primaryColor: "#6366f1",
                            secondaryColor: "#f59e0b",
                            equipped: {},
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{hero.name}</h4>
                        <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold block truncate">
                          {hero.title}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {hero.lore}
                    </p>
                    <div className="pt-1 space-y-2">
                      <span className="text-[10px] font-bold text-amber-950 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20 block truncate">
                        ⚡ Afinidade: {hero.nativeLanguageBonus}
                      </span>
                      {hero.avatarGreeting && (
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 italic leading-relaxed">
                          💬 "{hero.avatarGreeting}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
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
                    {(hero.id === "char_tactician_m" || hero.id.includes("kaelen")) && (
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
                    {(hero.id === "char_archivist_f" || hero.id.includes("lyanna")) && (
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
                    {(hero.id === "char_elemental_beast" || hero.id.includes("ignisaur")) && (
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
