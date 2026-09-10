import React from "react";
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
} from "lucide-react";

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

        {/* ReUI Timeline */}
        <div className="pt-3 pb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3 px-1">
            Marcos Conquistados
          </span>
          <Timeline items={timelineItems} />
        </div>

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
