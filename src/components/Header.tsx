import React from "react";
import { Flame, Zap, Settings, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProgress } from "@/types/language";
import { getLanguageById } from "@/data/languages";

interface HeaderProps {
  progress: UserProgress;
  userName?: string;
  onOpenDailySprint?: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
  onCycleFontSize?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenTimeline?: () => void;
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
}) => {
  const currentLang = getLanguageById(progress.selectedLanguage || "en");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md px-3 py-2.5 sm:px-4">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
        {/* Logo, Marca & Seletor de Idioma */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold leading-tight tracking-tight text-foreground">
                Smart Language
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
            <p className="text-[10px] text-muted-foreground leading-none font-medium">
              Tutor & Treino 5 min
            </p>
          </div>
        </div>

        {/* Status de Progresso & Ações */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak de dias */}
          <Badge
            variant="outline"
            onClick={onOpenTimeline}
            className={`flex items-center gap-1 border-amber-300/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 ${
              onOpenTimeline ? "cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all" : ""
            }`}
            title="Ver linha do tempo de conquistas"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{progress.streakDays}d</span>
          </Badge>

          {/* XP */}
          <Badge
            variant="outline"
            onClick={onOpenTimeline}
            className={`flex items-center gap-1 border-violet-300/40 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 ${
              onOpenTimeline ? "cursor-pointer hover:bg-violet-500/20 active:scale-95 transition-all" : ""
            }`}
            title="Ver linha do tempo de aprendizado"
          >
            <Zap className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
            <span>{progress.xp} XP</span>
          </Badge>

          {/* Botão de Configurações */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
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
