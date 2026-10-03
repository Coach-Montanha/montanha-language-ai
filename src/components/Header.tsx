import React from "react";
import {
  Flame,
  Zap,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown,
  Trophy,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProgress } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { calculateLevelInfo, ensureGamificationProgress } from "@/services/gamification";
import { ModularAvatar } from "@/components/avatar/ModularAvatar";

interface HeaderProps {
  progress: UserProgress;
  userName?: string | undefined;
  onOpenDailySprint?: (() => void) | undefined;
  onOpenSettings: () => void;
  onLogout?: (() => void) | undefined;
  onCycleFontSize?: (() => void) | undefined;
  onOpenLanguageSelector?: (() => void) | undefined;
  onOpenTimeline?: (() => void) | undefined;
  onOpenAvatarShop?: (() => void) | undefined;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  userName,
  onOpenDailySprint,
  onOpenSettings,
  onLogout,
  onCycleFontSize,
  onOpenLanguageSelector,
  onOpenTimeline,
  onOpenAvatarShop,
}) => {
  const currentLang = getLanguageById(progress.selectedLanguage || "en");
  const prepared = ensureGamificationProgress(progress);
  const levelInfo = calculateLevelInfo(prepared.xp);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md px-3 py-2 sm:px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        {/* Logo, Marca & Seletor de Idioma */}
        <div className="flex items-center gap-2">
          {/* Avatar ou Logo */}
          <button
            type="button"
            onClick={onOpenAvatarShop}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden p-0.5"
            title="Abrir Personalização do Avatar RPG & Loja"
          >
            <ModularAvatar
              config={prepared.equippedAvatar}
              state="idle"
              size="xs"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold leading-tight tracking-tight text-foreground">
                Montanha Language AI
              </h1>
              {/* Pill Seletor de Idioma */}
              {onOpenLanguageSelector && (
                <button
                  type="button"
                  onClick={onOpenLanguageSelector}
                  className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 px-1.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer"
                  title="Trocar idioma de estudo"
                >
                  <span>{currentLang.flag}</span>
                  <span className="hidden xs:inline">{currentLang.name}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-70" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-none font-medium hidden xs:block">
              Tutor de Idiomas com IA & Treinos Diários Gamificados
            </p>
          </div>
        </div>

        {/* Status de Progresso RPG & Ações */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Nível RPG */}
          <Badge
            variant="outline"
            onClick={onOpenAvatarShop}
            className="flex items-center gap-1 border-violet-300/40 bg-violet-500/10 px-2 py-1 text-xs font-black text-violet-600 dark:text-violet-400 cursor-pointer hover:bg-violet-500/20 active:scale-95 transition-all"
            title={`Nível ${levelInfo.level}: ${levelInfo.title} • Clique para abrir o Avatar RPG`}
          >
            <Trophy className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
            <span>Nv. {levelInfo.level}</span>
          </Badge>

          {/* Moedas RPG */}
          <Badge
            variant="outline"
            onClick={onOpenAvatarShop}
            className="flex items-center gap-1 border-amber-300/40 bg-amber-500/10 px-2 py-1 text-xs font-black text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all"
            title="Suas moedas para a Loja Virtual RPG"
          >
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span>{prepared.coins ?? 150}</span>
          </Badge>

          {/* Streak de dias */}
          <Badge
            variant="outline"
            onClick={onOpenTimeline}
            className={`flex items-center gap-1 border-amber-300/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 ${
              onOpenTimeline ? "cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all" : ""
            }`}
            title="Dias seguidos de treino"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{progress.streakDays}d</span>
          </Badge>

          {/* Botão de Configurações */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={onOpenSettings}
            title="Configurações de Áudio e IA"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Usuário e Botão de Logout */}
          {userName && onLogout && (
            <Button
              size="icon"
              variant="ghost"
              data-testid="btn-logout"
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              onClick={onLogout}
              title={`Conectado como ${userName} (Clique para sair/trocar usuário)`}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
