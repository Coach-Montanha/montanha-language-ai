import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface IconTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  selected?: boolean;
  actionSlot?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  title,
  subtitle,
  badge,
  selected = false,
  actionSlot,
  orientation = "horizontal",
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "relative rounded-2xl border p-3 text-left transition-all select-none cursor-pointer group flex",
        orientation === "horizontal"
          ? "items-center justify-between gap-3 w-full"
          : "flex-col items-center justify-center text-center gap-2 p-4",
        selected
          ? "border-primary bg-primary/8 shadow-xs ring-2 ring-primary/25"
          : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 shadow-2xs",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-3 min-w-0 flex-1",
          orientation === "vertical" && "flex-col text-center"
        )}
      >
        {/* Caixa do Ícone */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            selected
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/70 text-foreground"
          )}
        >
          {icon}
        </div>

        {/* Título e Subtítulo */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h4>
            {badge && <div>{badge}</div>}
          </div>

          {subtitle && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Ações ou Indicador de Seleção */}
      <div className="shrink-0 flex items-center gap-1.5">
        {actionSlot}
        {selected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
            <Check className="h-3 w-3 stroke-[2.5]" />
          </div>
        )}
      </div>
    </button>
  );
};
