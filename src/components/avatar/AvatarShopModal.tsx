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
  { id: "heroes", label: "Heróis RO", icon: "🧙‍♂️" },
  { id: EquipmentSlot.HEAD_UPPER, label: "Chapéus RO", icon: "🐰" },
  { id: EquipmentSlot.HEAD_LOWER, label: "Boca RO", icon: "🍃" },
  { id: EquipmentSlot.ARMOR, label: "Armaduras RO", icon: "👘" },
  { id: EquipmentSlot.GARMENT, label: "Asas & Capas RO", icon: "🪽" },
  { id: EquipmentSlot.BACKPACK, label: "Mochilas RO", icon: "📦" },
  { id: EquipmentSlot.RIGHT_HAND, label: "Armas RO", icon: "🔨" },
  { id: EquipmentSlot.PET_FAMILIAR, label: "Pets RO", icon: "🐣" },
  { id: "HEAD", label: "Cabeça", icon: "🎩" },
  { id: "CHEST", label: "Peitoral", icon: "🥋" },
  { id: "MAIN_HAND", label: "Mão", icon: "⚔️" },
  { id: "BACK", label: "Costas", icon: "🎒" },
  { id: "ACCESSORY", label: "Acessório", icon: "💎" },
];

const TIER_COLORS: Record<string, { badge: string; border: string }> = {
  NOVICE: {
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    border: "border-slate-800 hover:border-slate-600",
  },
  FIRST_CLASS: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    border: "border-blue-900/40 hover:border-blue-500",
  },
  SECOND_CLASS: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    border: "border-purple-900/40 hover:border-purple-500",
  },
  TRANSCENDENT: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30 font-black animate-pulse",
    border: "border-amber-600/60 hover:border-amber-400 shadow-md shadow-amber-500/20",
  },
  COMMON: {
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    border: "border-slate-800 hover:border-slate-600",
  },
  RARE: {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    border: "border-blue-900/40 hover:border-blue-500",
  },
  EPIC: {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    border: "border-purple-900/40 hover:border-purple-500",
  },
  LEGENDARY: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30 font-black",
    border: "border-amber-600/60 hover:border-amber-400 shadow-md shadow-amber-500/20",
  },
  MYTHIC: {
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse font-black",
    border: "border-rose-600/60 hover:border-rose-400 shadow-md shadow-rose-500/20",
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

  const roAdaptedItems = ITEM_CATALOG.map(adaptRoItemToShopItem);
  const fullShopCatalog: ShopItem[] = [...roAdaptedItems, ...SHOP_ITEMS_CATALOG];

  const allHeroes: CharacterBase[] = [
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>Loja Kafra &amp; Armaria RO</span>
            </DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{prepared.coins ?? 150} Zeny</span>
              </div>
              <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs font-bold">
                Nível {levelInfo.level}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Personalize seu herói Chibi estilo Ragnarok Online com chapéus, asas, martelos e companheiros Poring!
          </p>
        </DialogHeader>

        {/* Topo: Visualização do Avatar Chibi & Bônus de Lições */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="relative h-28 w-28 rounded-2xl bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
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
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Companheiro Ativo
                </span>
                <Badge className="bg-indigo-600/30 border-indigo-500 text-indigo-300 text-[10px]">
                  {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.name || "Espadachim Pronteriano"}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mt-1">
                {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.title || "Herói da Jornada"}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {allHeroes.find((h) => h.id === prepared.selectedCharacterId)?.lore || "Bônus ativo de aprendizado de vocabulário."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-muted-foreground block">Multiplicador XP</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">{combinedStats.finalXpMultiplier}x</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-muted-foreground block">Bônus Zeny</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400">+{Math.round((combinedStats.finalCoinBonus - 1) * 100)}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-muted-foreground block">Proteção Streak</span>
                <span className="text-xs sm:text-sm font-black text-blue-400">+{combinedStats.finalStreakProtection} Dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas Principais: Loja Kafra vs Heróis RO vs Armaria */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Button
            size="sm"
            variant={activeTab === "catalog" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("catalog");
              setSelectedSlot("all");
            }}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "catalog" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Loja Kafra
          </Button>
          <Button
            size="sm"
            variant={activeTab === "heroes" ? "default" : "ghost"}
            onClick={() => setActiveTab("heroes")}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "heroes" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            Heróis Chibi RO (8 Classes)
          </Button>
          <Button
            size="sm"
            variant={activeTab === "closet" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("closet");
              setSelectedSlot("all");
            }}
            className={`text-xs font-bold cursor-pointer ${
              activeTab === "closet" ? "bg-indigo-600 text-white" : "text-slate-400"
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
                onClick={() => setSelectedSlot(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1 border ${
                  selectedSlot === tab.id
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
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
              const isSelected = (prepared.selectedCharacterId || "valerius") === hero.id;
              return (
                <div
                  key={hero.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {hero.category}
                      </span>
                      {isSelected && (
                        <Badge className="bg-indigo-600 text-white font-bold text-[10px]">
                          Ativo ✓
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">{hero.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {hero.lore}
                    </p>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block truncate">
                        {hero.nativeLanguageBonus}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={isSelected}
                    onClick={() => handleSelectHero(hero)}
                    className={`w-full text-xs font-bold ${
                      isSelected
                        ? "bg-slate-800 text-slate-400 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
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
                badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
                border: "border-slate-800 hover:border-slate-600",
              };
              const tierStyle = (item.rarity && TIER_COLORS[item.rarity]) || fallbackTierStyle;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isItemEquipped
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${tierStyle.badge}`}>
                        {item.rarity}
                      </span>
                      {isItemEquipped ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                          Equipado
                        </Badge>
                      ) : isOwned ? (
                        <span className="text-[10px] text-slate-400 font-semibold">Adquirido</span>
                      ) : (
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          {item.costCoins} Zeny
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.statBonus?.xpMultiplier && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          +{Math.round(item.statBonus.xpMultiplier * 100)}% XP
                        </span>
                      )}
                      {item.statBonus?.coinBonus && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          +{Math.round(item.statBonus.coinBonus * 100)}% Zeny
                        </span>
                      )}
                      {item.statBonus?.streakProtection && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          +{item.statBonus.streakProtection} Proteção
                        </span>
                      )}
                      {item.statBonus?.timeBonusSeconds && (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
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
                        className="w-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        Desequipar
                      </Button>
                    ) : isOwned ? (
                      <Button
                        size="sm"
                        onClick={() => handleEquip(item)}
                        className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
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
                            ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                            : !canAfford
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-amber-600 hover:bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                        }`}
                      >
                        {!hasLevel
                          ? `Requer Nv. ${item.requiredLevel}`
                          : !canAfford
                          ? "Zeny Insuficiente"
                          : `Comprar (${item.costCoins} Zeny)`}
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
