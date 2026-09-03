import React from "react";
import { MessageSquareText, Compass, SpellCheck, Layers, Split } from "lucide-react";
import { TabType } from "@/types/language";

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "conversa", label: "Conversa", icon: MessageSquareText },
  { id: "cenario", label: "Situações", icon: Compass },
  { id: "alfabeto", label: "Alfabeto", icon: SpellCheck },
  { id: "cartoes", label: "Cartões", icon: Layers },
  { id: "destrinchar", label: "Destrinchar", icon: Split },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5 sm:px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`group flex flex-1 flex-col items-center justify-center py-1 px-1 transition-all duration-200 rounded-lg ${
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
              <span className="mt-0.5 text-[10px] tracking-tight line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
