import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  badge?: string;
  status?: "completed" | "current" | "pending";
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative pl-6 space-y-6", className)} {...props}>
      {/* Linha vertical contínua */}
      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border rounded-full" />

      {items.map((item, idx) => {
        const isCompleted = item.status === "completed";
        const isCurrent = item.status === "current";

        return (
          <div key={item.id || idx} className="relative group select-none">
            {/* Marcador do Ponto */}
            <div
              className={cn(
                "absolute -left-6 top-1 h-5 w-5 rounded-full border flex items-center justify-center text-[10px] transition-all bg-background",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : isCurrent
                  ? "border-primary ring-4 ring-primary/20 bg-background text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {item.icon ? (
                item.icon
              ) : (
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isCompleted ? "bg-white" : isCurrent ? "bg-primary" : "bg-muted-foreground/50"
                  )}
                />
              )}
            </div>

            {/* Conteúdo do Item */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "text-xs font-bold transition-colors",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </h4>

                {item.timestamp && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.timestamp}
                  </span>
                )}
              </div>

              {item.badge && (
                <span className="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                  {item.badge}
                </span>
              )}

              {item.description && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
