import React from "react";
import { MessageSquareText, Compass, SpellCheck, Layers, Split, Timer, CheckCircle2 } from "lucide-react";
import { TabType } from "@/types/language";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenDailySprint?: () => void;
  dailySprintDone?: boolean;
}

type BottomNavItem =
  | { type: "tab"; id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }
  | { type: "sprint"; id: "treino"; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_ITEMS: BottomNavItem[] = [
  { type: "tab", id: "conversa", label: "Conversa", icon: MessageSquareText },
  { type: "tab", id: "cenario", label: "Situações", icon: Compass },
  { type: "sprint", id: "treino", label: "Treino 5m", icon: Timer },
  { type: "tab", id: "alfabeto", label: "Alfabeto", icon: SpellCheck },
  { type: "tab", id: "cartoes", label: "Cartões", icon: Layers },
  { type: "tab", id: "destrinchar", label: "Destrinchar", icon: Split },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenDailySprint,
  dailySprintDone,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5 py-1 sm:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.type === "sprint") {
            return (
              <button
                key="treino-sprint"
                type="button"
                onClick={() => onOpenDailySprint?.()}
                aria-label={dailySprintDone ? "Treino diário concluído" : "Abrir treino diário de 5 minutos"}
                className="group flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 min-h-[44px] min-w-[44px] transition-all duration-200 rounded-xl cursor-pointer active:scale-95"
                title="Treino rápido diário de 5 minutos"
              >
                <div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                    dailySprintDone
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-emerald-600 text-white shadow-xs group-hover:scale-105"
                  }`}
                >
                  {dailySprintDone ? (
                    <CheckCircle2 className="h-4 w-4 stroke-[2.2]" />
                  ) : (
                    <Icon className="h-4 w-4 stroke-[2.2] animate-pulse" />
                  )}
                  {!dailySprintDone && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>
                <span
                  className={`mt-0.5 text-[9.5px] tracking-tight line-clamp-1 ${
                    dailySprintDone
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-emerald-700 dark:text-emerald-300 font-bold"
                  }`}
                >
                  {dailySprintDone ? "Treino Feito" : "Treino 5m"}
                </span>
              </button>
            );
          }

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              data-testid={`tab-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              aria-label={`Aba ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={`group flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 min-h-[44px] min-w-[44px] transition-all duration-200 rounded-xl cursor-pointer active:scale-95 ${
                isActive
                  ? "text-primary font-bold scale-105"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? "bg-primary/15 text-primary shadow-xs" : "group-hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="mt-0.5 text-[9.5px] sm:text-[10px] tracking-tight line-clamp-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
