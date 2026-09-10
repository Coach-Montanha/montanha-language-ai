import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillFilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface PillFilterProps {
  options: PillFilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export const PillFilter: React.FC<PillFilterProps> = ({
  options,
  selectedId,
  onSelect,
  className,
  size = "sm",
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full font-medium transition-all cursor-pointer",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
              isSelected
                ? "bg-primary text-primary-foreground font-bold shadow-xs scale-102"
                : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[9px] font-bold leading-none",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
