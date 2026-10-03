import React from "react";
import {
  Timer,
  MessageSquareText,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { TabType } from "@/types/language";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  dailySprintDone?: boolean;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "treino", label: "Treino 5m", icon: Timer },
  { id: "conversa", label: "Conversa", icon: MessageSquareText },
  { id: "cenario", label: "Situações", icon: Compass },
  { id: "avatar", label: "Avatar RPG", icon: Sparkles },
  { id: "estudo", label: "Estudo", icon: Layers },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  dailySprintDone,
}) => {
  const isEstudoActive =
    activeTab === "estudo" ||
    activeTab === "cartoes" ||
    activeTab === "alfabeto" ||
    activeTab === "laboratorio" ||
    activeTab === "destrinchar";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-0.5 py-1 sm:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === "estudo"
              ? isEstudoActive
              : activeTab === item.id;

          const isTreinoTab = item.id === "treino";

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
                  isActive
                    ? "bg-primary/15 text-primary shadow-xs"
                    : isTreinoTab && !dailySprintDone
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20"
                    : "group-hover:bg-muted"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "stroke-[2.5]"
                      : isTreinoTab && !dailySprintDone
                      ? "stroke-[2.2] animate-pulse text-emerald-600 dark:text-emerald-400"
                      : "stroke-[1.8]"
                  }`}
                />

                {/* Badge verde de sprint diário concluído */}
                {isTreinoTab && dailySprintDone && (
                  <CheckCircle2 className="absolute -top-0.5 -right-0.5 h-3 w-3 text-emerald-500 fill-background" />
                )}

                {/* Ponto pulsante quando o treino ainda não foi feito hoje */}
                {isTreinoTab && !dailySprintDone && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </div>

              <span
                className={`mt-0.5 text-[9.5px] sm:text-[10px] tracking-tight line-clamp-1 ${
                  isTreinoTab && !dailySprintDone && !isActive
                    ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                    : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
