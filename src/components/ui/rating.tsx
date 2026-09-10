import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface RatingProps {
  value: number; // 1 to max
  max?: number;
  onValueChange?: (value: number) => void;
  readOnly?: boolean;
  variant?: "stars" | "emojis";
  size?: "sm" | "md" | "lg";
  className?: string;
  labels?: string[];
}

const DEFAULT_EMOJIS = [
  { emoji: "🔁", label: "Praticar Mais" },
  { emoji: "💡", label: "Em Progresso" },
  { emoji: "👍", label: "Muito Bom" },
  { emoji: "⚡", label: "Ótimo" },
  { emoji: "🔥", label: "Fluente & Perfeito" },
];

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onValueChange,
  readOnly = false,
  variant = "stars",
  size = "md",
  className,
  labels,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const emojiSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  if (variant === "emojis") {
    return (
      <div className={cn("flex flex-col items-center gap-1.5", className)}>
        <div className="flex items-center gap-2">
          {DEFAULT_EMOJIS.slice(0, max).map((item, idx) => {
            const val = idx + 1;
            const isSelected = value === val;
            const isHovered = hoverValue === val;

            return (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => onValueChange?.(val)}
                onMouseEnter={() => !readOnly && setHoverValue(val)}
                onMouseLeave={() => !readOnly && setHoverValue(null)}
                aria-label={item.label}
                className={cn(
                  "p-1.5 rounded-xl transition-all select-none",
                  emojiSizes[size],
                  readOnly ? "cursor-default" : "cursor-pointer hover:scale-125 active:scale-95",
                  isSelected
                    ? "bg-primary/15 ring-2 ring-primary scale-110 shadow-xs"
                    : isHovered
                    ? "bg-muted scale-110"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <span>{item.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Rótulo descritivo do emoji ativo */}
        <span className="text-[11px] font-semibold text-muted-foreground h-4">
          {activeValue > 0
            ? labels?.[activeValue - 1] || DEFAULT_EMOJIS[activeValue - 1]?.label
            : ""}
        </span>
      </div>
    );
  }

  // Estrelas padrão
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, idx) => {
          const starVal = idx + 1;
          const isFilled = starVal <= activeValue;

          return (
            <button
              key={idx}
              type="button"
              disabled={readOnly}
              onClick={() => onValueChange?.(starVal)}
              onMouseEnter={() => !readOnly && setHoverValue(starVal)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              aria-label={`Nota ${starVal} de ${max}`}
              className={cn(
                "p-0.5 rounded transition-transform select-none focus:outline-hidden",
                readOnly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-115 active:scale-90"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                    : "text-muted-foreground/35 fill-transparent"
                )}
              />
            </button>
          );
        })}
      </div>

      {labels && labels.length >= max && activeValue > 0 && (
        <span className="text-[11px] font-medium text-muted-foreground">
          {labels[activeValue - 1]}
        </span>
      )}
    </div>
  );
};
