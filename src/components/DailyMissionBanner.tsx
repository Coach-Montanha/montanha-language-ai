import React, { useState } from "react";
import { WeeklyMission, UserProgress } from "@/types/language";
import { getMissionsByWeek } from "@/data/missions";
import { speakText } from "@/services/speech";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Tag,
  Compass,
  Building2,
  Briefcase,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  ShieldAlert,
  TrendingUp,
  Flame,
  CheckCircle2,
  Play,
  Lightbulb,
  Target,
  ChevronRight,
  BookOpen,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DailyMissionBannerProps {
  progress: UserProgress;
  onStartMission: (mission: WeeklyMission) => void;
  onUpdateProgress: (updated: UserProgress) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  Tag,
  Compass,
  Building2,
  Briefcase,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  ShieldAlert,
  TrendingUp,
};

export const DailyMissionBanner: React.FC<DailyMissionBannerProps> = ({
  progress,
  onStartMission,
  onUpdateProgress,
}) => {
  const currentWeek: 1 | 2 | 3 =
    progress.currentWeek === 2 || progress.currentWeek === 3 ? progress.currentWeek : 1;
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | 3>(currentWeek);

  const missionsInWeek = getMissionsByWeek(selectedWeek);
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const currentMission = missionsInWeek[activeMissionIndex] || missionsInWeek[0]!;

  const [showScript, setShowScript] = useState(false);

  const completedIds = progress.completedMissionIds || [];
  const isCompleted = completedIds.includes(currentMission.id);

  const handleSelectWeek = (week: 1 | 2 | 3) => {
    setSelectedWeek(week);
    setActiveMissionIndex(0);
    setShowScript(false);
    const updated: UserProgress = {
      ...progress,
      currentWeek: week,
    };
    onUpdateProgress(updated);
  };

  const handlePlayLine = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text, { rate: progress.audioSpeed });
  };

  const IconComponent = ICON_MAP[currentMission.icon] || Flame;

  return (
    <div className="mx-auto w-full max-w-lg px-3 pt-2 pb-1 space-y-2">
      {/* Seletor de Semanas Progressivas */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
        {[
          { week: 1 as const, title: "Semana 1", subtitle: "Sobrevivência" },
          { week: 2 as const, title: "Semana 2", subtitle: "Teu Contexto" },
          { week: 3 as const, title: "Semana 3", subtitle: "Opinião" },
        ].map((w) => {
          const isSelected = selectedWeek === w.week;
          return (
            <button
              key={w.week}
              onClick={() => handleSelectWeek(w.week)}
              className={`py-1.5 px-2 rounded-lg text-left transition-all ${
                isSelected
                  ? "bg-background text-primary shadow-xs border border-border font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-tight">
                  {w.title}
                </span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <p className="text-[11px] truncate leading-tight mt-0.5">{w.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Card da Situação Real do Dia */}
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-3.5 shadow-sm space-y-3">
        {/* Topo com foco e status */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider"
            >
              🎯 Situação Real
            </Badge>
            <span className="text-[11px] font-bold text-foreground">
              {currentMission.weekTitle}
            </span>
          </div>

          {isCompleted ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sobrevivida!
            </span>
          ) : (
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {currentMission.focus}
            </span>
          )}
        </div>

        {/* Título & Descrição da Situação */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-foreground leading-snug">
              {currentMission.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {currentMission.situationDescription}
            </p>
          </div>
        </div>

        {/* Metas e Dicas Práticas de Sobrevivência */}
        <div className="rounded-xl bg-muted/60 p-2.5 space-y-1.5 text-xs border border-border/50">
          <div className="flex items-start gap-1.5 text-[11px]">
            <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-foreground font-medium leading-tight">
              <strong>Objetivo:</strong> {currentMission.survivalObjective}
            </p>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Dica do Leo:</strong> {currentMission.survivalTipsPt}
            </p>
          </div>
        </div>

        {/* Botão de Expansão do Script da Conversa com Fonética */}
        {currentMission.script && currentMission.script.length > 0 && (
          <div className="border border-border/70 rounded-xl overflow-hidden bg-background/70">
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="w-full flex items-center justify-between p-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-primary">
                <BookOpen className="h-4 w-4" />
                <span>Roteiro de Fala da Situação (Script + Fonética)</span>
              </div>
              {showScript ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showScript && (
              <div className="p-3 pt-1 space-y-2.5 border-t border-border/50 divide-y divide-border/40 text-xs animate-in fade-in">
                {currentMission.script.map((line) => {
                  const isUser = line.roleType === "user";
                  return (
                    <div key={line.id} className="pt-2 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isUser
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-foreground border border-border"
                          }`}
                        >
                          {line.speaker}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handlePlayLine(e, line.english)}
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                          title="Ouvir pronúncia nativa"
                        >
                          <Volume2 className="h-3 w-3" /> Ouvir
                        </button>
                      </div>

                      {/* 1. Frase em Inglês */}
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        &ldquo;{line.english}&rdquo;
                      </p>

                      {/* 2. Escrita Fonética Acessível para Aprender a Falar */}
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono italic flex items-center gap-1">
                        <span className="text-[10px] not-italic text-muted-foreground uppercase font-sans">
                          Como falar:
                        </span>
                        <span>[ {line.phonetic} ]</span>
                      </p>

                      {/* 3. Tradução em Português */}
                      <p className="text-[11px] text-muted-foreground">
                        {line.portuguese}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Lista de missões da semana para trocar rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {missionsInWeek.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMissionIndex(idx);
                setShowScript(false);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                activeMissionIndex === idx
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              {m.title.split(" ")[0]} {completedIds.includes(m.id) ? "✓" : ""}
            </button>
          ))}
        </div>

        {/* Botão de Iniciar a Situação Real com o Leo */}
        <Button
          onClick={() => onStartMission(currentMission)}
          className="w-full h-9 rounded-xl font-bold text-xs gap-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Viver esta Situação com o Leo</span>
          <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />
        </Button>
      </div>
    </div>
  );
};
