import React from "react";
import { Flame, Zap, Timer, Settings, Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProgress } from "@/types/language";

interface HeaderProps {
  progress: UserProgress;
  userName?: string;
  onOpenDailySprint: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  userName,
  onOpenDailySprint,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-md px-3 py-2.5 sm:px-4">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-foreground flex items-center gap-1">
              Smart Language
            </h1>
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
            className="flex items-center gap-1 border-amber-300/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400"
            title="Dias seguidos praticando"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{progress.streakDays}d</span>
          </Badge>

          {/* XP */}
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-violet-300/40 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400"
            title="Pontos de experiência"
          >
            <Zap className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />
            <span>{progress.xp} XP</span>
          </Badge>

          {/* Treino Diário de 5 min */}
          <Button
            size="sm"
            variant={progress.dailySprintDone ? "secondary" : "default"}
            onClick={onOpenDailySprint}
            className={`h-8 gap-1 px-2.5 text-xs font-medium ${
              progress.dailySprintDone
                ? "border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
            title="Treino rápido diário de 5 minutos"
          >
            <Timer className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">
              {progress.dailySprintDone ? "Feito!" : "5 min"}
            </span>
          </Button>

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
