import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { ACHIEVEMENTS_LIST, checkAchievements } from "@/data/achievements";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import {
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Target,
  Sparkles,
  CheckCircle2,
  Calendar,
  Lock,
  Award,
  Activity,
  Volume2,
} from "lucide-react";
import { getPhonemeDiagnostics } from "@/services/phoneme-diagnostics";
import { speakText } from "@/services/speech";

interface ActivityTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: UserProgress;
}

export const ActivityTimelineModal: React.FC<ActivityTimelineModalProps> = ({
  open,
  onOpenChange,
  progress,
}) => {
  const currentLang = getLanguageById(progress.selectedLanguage || "en");
  const userLevel = Math.max(Math.floor(progress.xp / 100) + 1, 1);
  const nextLevelXp = userLevel * 100;
  const currentLevelBaseXp = (userLevel - 1) * 100;
  const levelProgress = Math.min(
    Math.max(
      Math.round(
        ((progress.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100
      ),
      0
    ),
    100
  );

  const [activeModalTab, setActiveModalTab] = useState<"timeline" | "badges" | "phonemes">("timeline");
  const phonemeDiagnostics = getPhonemeDiagnostics(progress.selectedLanguage || "en");
  const { unlockedList } = checkAchievements(progress);
  const unlockedIds = new Set(unlockedList.map((a) => a.id));

  const completedMissionsCount = progress.completedMissionIds?.length || 0;

  const timelineItems: TimelineItem[] = [
    {
      id: "streak",
      title: `${progress.streakDays} Dias de Sequência Prática`,
      description: "Você manteve a consistência diária de estudo nos últimos dias.",
      badge: "Sequência Ativa",
      timestamp: "Hoje",
      status: "completed",
      icon: <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />,
    },
    {
      id: "level",
      title: `Nível Atual: Nível ${userLevel}`,
      description: `${progress.xp} XP conquistados acumulados com exercícios e conversação.`,
      badge: `${nextLevelXp - progress.xp} XP para Nível ${userLevel + 1}`,
      timestamp: "Em Andamento",
      status: "current",
      icon: <Zap className="h-3 w-3 fill-primary text-primary" />,
    },
    {
      id: "vocabulary",
      title: `${progress.cardsMasteredCount} Palavras Dominadas`,
      description: `Vocabulário ativo memorizado e revisado no modo Flashcards em ${currentLang.name}.`,
      badge: "Memória de Longo Prazo",
      status: progress.cardsMasteredCount > 0 ? "completed" : "pending",
      icon: <BookOpen className="h-3 w-3 text-emerald-500" />,
    },
    {
      id: "missions",
      title: `${completedMissionsCount} Situações Reais Sobrevividas`,
      description: "Cenários de viagem, pedidos e conversas cotidianas concluídos com os tutores.",
      badge: "Fluência Prática",
      status: completedMissionsCount > 0 ? "completed" : "pending",
      icon: <Target className="h-3 w-3 text-sky-500" />,
    },
    {
      id: "breakdown",
      title: `${progress.phrasesAnalyzedCount} Frases Destrinchadas`,
      description: "Análise morfológica profunda e ordenação gramatical dominadas.",
      badge: "Gramática Viva",
      status: progress.phrasesAnalyzedCount > 0 ? "completed" : "pending",
      icon: <Sparkles className="h-3 w-3 text-amber-500" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Linha do Tempo de Aprendizado
              </DialogTitle>
              <DialogDescription className="text-xs">
                Seus marcos e conquistas acumuladas em {currentLang.flag} {currentLang.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Card Resumo de Nível */}
        <div className="rounded-2xl border border-border bg-card p-3.5 space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Nível {userLevel}</span>
            </div>
            <span className="text-[11px] font-semibold text-primary">
              {progress.xp} / {nextLevelXp} XP
            </span>
          </div>

          <Progress value={levelProgress} className="h-2 rounded-full" />

          <p className="text-[10px] text-muted-foreground text-right">
            Faltam apenas <strong>{Math.max(nextLevelXp - progress.xp, 0)} XP</strong> para alcançar o Nível {userLevel + 1}
          </p>
        </div>

        {/* Seletor de visualização: Linha do Tempo vs Medalhas vs Fonemas */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl mt-1">
          <button
            type="button"
            onClick={() => setActiveModalTab("timeline")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeModalTab === "timeline"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Linha</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab("badges")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeModalTab === "badges"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Medalhas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab("phonemes")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeModalTab === "phonemes"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>Fonemas</span>
          </button>
        </div>

        {activeModalTab === "timeline" ? (
          /* ReUI Timeline */
          <div className="pt-3 pb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3 px-1">
              Marcos Conquistados
            </span>
            <Timeline items={timelineItems} />
          </div>
        ) : activeModalTab === "badges" ? (
          /* Galeria de Conquistas & Medalhas */
          <div className="pt-3 pb-1 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Todas as Conquistas
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {unlockedList.length} de {ACHIEVEMENTS_LIST.length} desbloqueadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACHIEVEMENTS_LIST.map((ach) => {
                const isUnlocked = unlockedIds.has(ach.id);

                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3 border transition-all ${
                      isUnlocked
                        ? "bg-amber-500/5 border-amber-500/30 text-foreground shadow-xs"
                        : "bg-muted/30 border-border/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                          isUnlocked
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground grayscale"
                        }`}
                      >
                        {isUnlocked ? ach.icon : <Lock className="h-4 w-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold truncate text-foreground">
                            {ach.title}
                          </h5>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isUnlocked
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            +{ach.xpReward} XP
                          </span>
                        </div>
                        <p className="text-[10.5px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                          {ach.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold">
                          {isUnlocked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Desbloqueada
                            </span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Lock className="h-2.5 w-2.5" /> Em progresso
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Radar de Fonemas Desafiadores */
          <div className="pt-3 pb-1 space-y-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <h4 className="text-xs font-bold text-foreground">
                  Radar de Sons Críticos em {currentLang.name}
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                Estes são os fonemas mais desafiadores para falantes nativos de português. Pratique a posição da língua e lábios para soar natural.
              </p>
            </div>

            <div className="space-y-2.5">
              {phonemeDiagnostics.map((diag) => {
                const statusBadge =
                  diag.status === "mastered"
                    ? { text: "Dominado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" }
                    : diag.status === "improving"
                    ? { text: "Ajustando", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" }
                    : { text: "Treinar", color: "bg-rose-500/10 text-rose-600 border-rose-500/30" };

                return (
                  <div
                    key={diag.family.id}
                    className="rounded-xl border border-border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-mono font-black text-sm flex items-center justify-center">
                          {diag.family.symbol}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-foreground">
                            {diag.family.namePt}
                          </h5>
                          <span className="text-[10px] text-muted-foreground">
                            {diag.totalAttempts} treinos • Precisão estimada: {diag.accuracyPercent}%
                          </span>
                        </div>
                      </div>

                      <Badge variant="outline" className={`text-[10px] ${statusBadge.color}`}>
                        {statusBadge.text}
                      </Badge>
                    </div>

                    {/* Dica de Articulação na Boca */}
                    <div className="text-[11px] text-foreground/90 bg-muted/40 rounded-lg p-2 leading-snug">
                      🗣️ <strong className="text-primary font-semibold">Como produzir:</strong>{" "}
                      {diag.family.descriptionPt}
                    </div>

                    {/* Palavras de Exemplo com Áudio */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-semibold text-muted-foreground mr-1">
                        Exemplos:
                      </span>
                      {diag.family.sampleWords.map((word: string) => (
                        <button
                          key={word}
                          type="button"
                          onClick={() =>
                            speakText(word, {
                              lang: currentLang.speechLangCode,
                              rate: 0.8,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-background border border-border hover:border-primary/50 text-foreground transition-all cursor-pointer active:scale-95"
                          title={`Ouvir pronúncia de "${word}"`}
                        >
                          <Volume2 className="h-3 w-3 text-primary" />
                          <span>{word}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="w-full text-xs mt-2"
        >
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
