import React, { useEffect, useRef } from "react";
import {
  Timer,
  MessageSquareText,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { TabType } from "@/types/language";

interface LeftSidebarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenDailySprint?: () => void;
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

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
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

  const activeKey = isEstudoActive ? "estudo" : activeTab;

  const navRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const nav = navRef.current;
    const bar = barRef.current;
    const button = buttonRefs.current[activeKey];
    if (!nav || !bar || !button) return;
    const navRect = nav.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    bar.style.top = `${buttonRect.top - navRect.top + 3}px`;
    bar.style.height = `${buttonRect.height - 6}px`;
  }, [activeKey]);

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-background p-3 shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 px-3 py-3 mb-4 border-b border-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Sparkles className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-foreground">Montanha Language AI</h2>
          <p className="text-[10px] text-muted-foreground font-medium">Tutor com IA & Gamificação</p>
        </div>
      </div>

      <div ref={navRef} className="relative flex flex-col gap-1">
        <span
          ref={barRef}
          className="pointer-events-none absolute left-1 w-1 rounded-full bg-primary shadow-[2px_0_6px_rgba(59,130,246,.7),4px_0_12px_rgba(59,130,246,.4)] transition-[top,height] duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
        />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === "estudo"
              ? isEstudoActive
              : activeTab === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              onClick={() => onChangeTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary stroke-[2.5]" : "opacity-70"}`} />
              <span>{item.label}</span>
              {item.id === "treino" && dailySprintDone && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
