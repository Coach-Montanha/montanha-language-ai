import React, { useState } from "react";
import { UserProgress } from "@/types/language";
import { AvatarAnimationState, AvatarSlot, AvatarItem } from "@/types/avatar";
import { ModularAvatar } from "@/components/avatar/ModularAvatar";
import {
  AVATAR_ITEMS,
  DEFAULT_AVATAR_CONFIG,
  getItemById,
} from "@/data/avatar-items";
import {
  calculateLevelInfo,
  ensureGamificationProgress,
  buyAvatarItem,
  equipAvatarItem,
  unequipAvatarSlot,
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
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface AvatarTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onOpenConversation?: () => void;
}

const SLOT_TABS: { id: AvatarSlot | "all"; label: string; icon: string }[] = [
  { id: "all", label: "Tudo", icon: "✨" },
  { id: "archetype", label: "Arquétipos", icon: "🧬" },
  { id: "head", label: "Cabeça", icon: "🎩" },
  { id: "eyes", label: "Rosto", icon: "👓" },
  { id: "body", label: "Traje", icon: "🥋" },
  { id: "hand", label: "Mão", icon: "🪄" },
  { id: "aura", label: "Aura", icon: "🌌" },
];

const RARITY_COLORS: Record<string, { badge: string; border: string }> = {
  common: {
    badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    border: "border-slate-700/50 hover:border-slate-500",
  },
  rare: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    border: "border-blue-900/40 hover:border-blue-500",
  },
  epic: {
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    border: "border-purple-900/40 hover:border-purple-500",
  },
  legendary: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    border: "border-amber-700/50 hover:border-amber-400 shadow-sm shadow-amber-500/10",
  },
};

export const AvatarTab: React.FC<AvatarTabProps> = ({
  progress,
  onUpdateProgress,
  onOpenConversation,
}) => {
  const prepared = ensureGamificationProgress(progress);
  const levelInfo = calculateLevelInfo(prepared.xp);
  const avatarConfig = prepared.equippedAvatar || DEFAULT_AVATAR_CONFIG;
  const unlockedIds = prepared.unlockedAvatarItems || [];

  const [activeSlot, setActiveSlot] = useState<AvatarSlot | "all">("all");
  const [shopMode, setShopMode] = useState<"shop" | "closet">("shop");
  const [previewState, setPreviewState] = useState<AvatarAnimationState>("idle");

  const filteredItems = AVATAR_ITEMS.filter((item) => {
    // Filtro por slot
    if (activeSlot !== "all" && item.slot !== activeSlot) return false;

    // Filtro por modo: loja (todos) ou closet (apenas os que já possui)
    if (shopMode === "closet") {
      return unlockedIds.includes(item.id);
    }
    return true;
  });

  const handleBuy = (item: AvatarItem) => {
    const res = buyAvatarItem(prepared, item);
    if (!res.success) {
      toast.error(res.error || "Não foi possível comprar este item.");
      return;
    }
    playSprintCompleteSound();
    toast.success(`🎉 Você desbloqueou: ${item.name}!`, {
      description: "Item equipado automaticamente no seu avatar tutor!",
    });
    if (res.updated) {
      onUpdateProgress(res.updated);
    }
  };

  const handleEquip = (item: AvatarItem) => {
    playOptionSelectSound();
    const updated = equipAvatarItem(prepared, item);
    onUpdateProgress(updated);
    toast.success(`${item.name} equipado com sucesso!`);
  };

  const handleUnequip = (slot: "head" | "eyes" | "body" | "hand" | "aura") => {
    playOptionSelectSound();
    const updated = unequipAvatarSlot(prepared, slot);
    onUpdateProgress(updated);
    toast.info("Item desequipado.");
  };

  const isEquipped = (item: AvatarItem) => {
    if (item.slot === "archetype") {
      const sub = avatarConfig.subType;
      return (
        item.id.includes(sub) ||
        (avatarConfig.archetype === item.archetype &&
          item.id === "starter_human" &&
          sub === "adventurer")
      );
    }
    return avatarConfig.equipped[item.slot] === item.id;
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 max-w-5xl mx-auto w-full space-y-6 pb-20">
      {/* ============================================================ */}
      {/* 1. BANNER RPG: NÍVEL, XP, TÍTULO E MOEDAS */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-indigo-950/60 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 text-xs">
                Nível {levelInfo.level}
              </Badge>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                {levelInfo.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Ganhe XP e Moedas em treinos diários e conversas com o Tutor IA para equipar e evoluir seu avatar RPG.
            </p>
          </div>

          {/* Saldo de Moedas & Botão Conversar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 rounded-xl">
              <Coins className="h-5 w-5 text-amber-400 animate-spin origin-center duration-3000" />
              <div>
                <span className="text-[10px] text-amber-300 font-semibold block uppercase tracking-wider">
                  Moedas Montanha
                </span>
                <span className="text-base font-black text-amber-400 leading-none">
                  {prepared.coins ?? 150} 🪙
                </span>
              </div>
            </div>

            {onOpenConversation && (
              <Button
                onClick={onOpenConversation}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer text-xs"
              >
                Conversar com Tutor
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Barra de Progresso de XP até o Próximo Nível */}
        <div className="mt-3.5 pt-3 border-t border-border/40 space-y-1.5">
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Progresso para o Nível {levelInfo.level + 1}</span>
            <span className="text-violet-400 font-bold">
              {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP ({levelInfo.progressPercent}%)
            </span>
          </div>
          <Progress value={levelInfo.progressPercent} className="h-2 bg-slate-800" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PALCO DO AVATAR & VISUALIZADOR DE ESTADOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Painel Central do Avatar */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/80 shadow-md">
          <div className="relative p-2">
            <ModularAvatar
              config={avatarConfig}
              state={previewState}
              size="xl"
              showBadge
              level={levelInfo.level}
            />
          </div>

          <div className="mt-3 text-center">
            <h3 className="text-sm font-bold text-foreground">
              {avatarConfig.archetype === "animal"
                ? `Animal Místico (${avatarConfig.subType})`
                : avatarConfig.archetype === "monster"
                ? `Monstro Fantasia (${avatarConfig.subType})`
                : "Humano Poliglota"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Este avatar é o seu companheiro e tutor na aba Conversa com IA.
            </p>
          </div>

          {/* Testador de Expressões / Animações do Avatar */}
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground mr-1 font-semibold">
              Pose:
            </span>
            <button
              type="button"
              onClick={() => setPreviewState("idle")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                previewState === "idle"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Parado
            </button>
            <button
              type="button"
              onClick={() => setPreviewState("speaking")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                previewState === "speaking"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Falando
            </button>
            <button
              type="button"
              onClick={() => setPreviewState("listening")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                previewState === "listening"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Ouvindo
            </button>
            <button
              type="button"
              onClick={() => setPreviewState("celebrating")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                previewState === "celebrating"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Festa
            </button>
            <button
              type="button"
              onClick={() => setPreviewState("thinking")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                previewState === "thinking"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Pensando
            </button>
          </div>
        </div>

        {/* Resumo de Equipamentos Atuais & Seletor de Arquétipo Rápido */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shirt className="h-3.5 w-3.5 text-primary" />
              Equipamento Atual do Avatar Tutor
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(["head", "eyes", "body", "hand", "aura"] as const).map((slot) => {
                const itemId = avatarConfig.equipped[slot];
                const item = getItemById(itemId);
                return (
                  <div
                    key={slot}
                    className="p-2.5 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        {slot === "head"
                          ? "Cabeça"
                          : slot === "eyes"
                          ? "Rosto"
                          : slot === "body"
                          ? "Traje"
                          : slot === "hand"
                          ? "Item"
                          : "Aura"}
                      </span>
                      <span className="font-semibold text-foreground truncate block">
                        {item ? item.name : "Nenhum"}
                      </span>
                    </div>

                    {item && (
                      <button
                        type="button"
                        onClick={() => handleUnequip(slot)}
                        className="text-[10px] text-destructive hover:underline cursor-pointer ml-1 font-bold shrink-0"
                        title="Desequipar este item"
                      >
                        Tirar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Troca Rápida de Arquétipo Base (Humano, Animal, Monstro) */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Escolha sua Espécie / Arquétipo Base
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "starter_human", label: "Humano", icon: "🧑" },
                { id: "starter_animal_owl", label: "Coruja Sábia", icon: "🦉" },
                { id: "starter_animal_wolf", label: "Lobo Guardião", icon: "🐺" },
                { id: "starter_animal_cat", label: "Gato Místico", icon: "🐱" },
                { id: "starter_animal_dragon", label: "Dragão", icon: "🐉" },
                { id: "starter_monster_golem", label: "Golem", icon: "💎" },
                { id: "starter_monster_elemental", label: "Elemental", icon: "⚡" },
                { id: "starter_monster_goblin", label: "Duende", icon: "🧝" },
              ].map((arch) => {
                const item = getItemById(arch.id);
                if (!item) return null;
                const active = isEquipped(item);
                const owned = unlockedIds.includes(item.id);

                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => {
                      if (!owned) {
                        handleBuy(item);
                      } else {
                        handleEquip(item);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm scale-105"
                        : owned
                        ? "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        : "bg-muted/40 text-muted-foreground/60 border border-dashed border-border"
                    }`}
                  >
                    <span>{arch.icon}</span>
                    <span>{arch.label}</span>
                    {!owned && <span className="text-[10px] text-amber-400 font-extrabold">{item.price}🪙</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CATÁLOGO DA LOJA VIRTUAL & GUARDA-ROUPA */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* Alternância Loja vs Guarda-Roupa & Filtros por Slot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          {/* Toggle Loja / Armário */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setShopMode("shop")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shopMode === "shop"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              <span>Loja de Itens</span>
            </button>
            <button
              type="button"
              onClick={() => setShopMode("closet")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shopMode === "closet"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shirt className="h-3.5 w-3.5 text-violet-400" />
              <span>Meu Guarda-Roupa ({unlockedIds.length})</span>
            </button>
          </div>

          {/* Filtros de Slot */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {SLOT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSlot(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSlot === tab.id
                    ? "bg-primary/15 text-primary font-bold border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const owned = unlockedIds.includes(item.id);
            const equipped = isEquipped(item);
            const canAfford = (prepared.coins ?? 0) >= item.price;
            const meetsLevel = levelInfo.level >= item.minLevel;
            const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS["common"]!;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 bg-card transition-all flex flex-col justify-between ${
                  equipped
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : rarityStyle.border
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">
                          {item.name}
                        </h4>
                        <span
                          className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityStyle.badge}`}
                        >
                          {item.rarity === "legendary"
                            ? "Lendário"
                            : item.rarity === "epic"
                            ? "Épico"
                            : item.rarity === "rare"
                            ? "Raro"
                            : "Comum"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold block capitalize mt-0.5">
                        Slot: {item.slot}
                      </span>
                    </div>

                    {equipped && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                        Equipado
                      </Badge>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  {owned ? (
                    <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Desbloqueado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                      <Coins className="h-4 w-4" />
                      <span>{item.price === 0 ? "Grátis" : `${item.price} Moedas`}</span>
                    </div>
                  )}

                  <div>
                    {equipped ? (
                      item.slot !== "archetype" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnequip(item.slot as any)}
                          className="h-8 text-xs font-semibold cursor-pointer"
                        >
                          Desequipar
                        </Button>
                      )
                    ) : owned ? (
                      <Button
                        size="sm"
                        onClick={() => handleEquip(item)}
                        className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                      >
                        Equipar
                      </Button>
                    ) : !meetsLevel ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        <Lock className="h-3 w-3" />
                        <span>Nível {item.minLevel}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleBuy(item)}
                        className={`h-8 text-xs font-bold cursor-pointer ${
                          canAfford
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? "Comprar" : "Faltam Moedas"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
            <Shirt className="h-10 w-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm font-semibold">Nenhum item encontrado neste filtro.</p>
            <p className="text-xs">Experimente selecionar outro slot ou alternar para a Loja.</p>
          </div>
        )}
      </div>
    </div>
  );
};
