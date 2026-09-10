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
import { SupportedLanguage, UserProgress } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage, getDefaultTutorForLanguage } from "@/data/tutors";
import {
  getPlacementQuestionsForLanguage,
  evaluatePlacementTest,
  CefrResult,
  PlacementQuestion,
} from "@/data/placement-tests";
import { speakText, stopSpeaking } from "@/services/speech";
import { addXP } from "@/services/storage";
import {
  playSuccessSound,
  playOptionSelectSound,
  playSprintCompleteSound,
} from "@/services/audio-effects";
import {
  Volume2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface PlacementTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: SupportedLanguage;
  currentCefrLevel?: string | undefined;
  onCompletePlacement?: ((level: string, earnedXp: number) => void) | undefined;
  progress?: UserProgress | undefined;
  onUpdateProgress?: ((updated: UserProgress) => void) | undefined;
}

const fallbackQ: PlacementQuestion = {
  id: "default-q",
  levelTarget: "A1",
  type: "reading",
  title: "Questão",
  prompt: "Identifique a opção correta",
  options: [{ id: "opt-1", text: "Olá", correct: true, explanationPt: "Opção padrão" }],
};

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  open,
  onOpenChange,
  language,
  currentCefrLevel,
  onCompletePlacement,
  progress,
  onUpdateProgress,
}) => {
  const langDef = getLanguageById(language);
  const activeTutors = getTutorsForLanguage(language);
  const activeTutor = activeTutors[0] || getDefaultTutorForLanguage(language);

  const questions = getPlacementQuestionsForLanguage(language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<CefrResult | null>(null);

  const currentQ: PlacementQuestion = questions[currentIndex] ?? questions[0] ?? fallbackQ;

  const handlePlayAudio = (text: string) => {
    stopSpeaking();
    speakText(text, {
      rate: progress?.audioSpeed || 0.85,
      pitch: activeTutor.speechPitch,
      gender: activeTutor.gender,
      lang: langDef.speechLangCode,
    });
  };

  const handleSelectOption = (optId: string, isCorrect: boolean) => {
    if (selectedOptionId !== null) return;
    playOptionSelectSound();
    setSelectedOptionId(optId);

    if (isCorrect) {
      playSuccessSound();
      setCorrectCount((prev) => prev + 1);
      toast.success("Resposta correta!");
    } else {
      toast.info("Veja a explicação pedagógica abaixo.");
    }
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const testResult = evaluatePlacementTest(language, correctCount, questions.length);
      setResult(testResult);
      setIsFinished(true);
      playSprintCompleteSound();

      if (onCompletePlacement) {
        onCompletePlacement(testResult.level, 100);
      } else if (progress && onUpdateProgress) {
        const updatedProgress: UserProgress = {
          ...progress,
          xp: progress.xp + 100,
          cefrLevel: testResult.level,
        };
        onUpdateProgress(updatedProgress);
        addXP(100);
      } else {
        addXP(100);
      }
      toast.success(`Parabéns! Nível ${testResult.level} alcançado! (+100 XP)`);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setCorrectCount(0);
    setIsFinished(false);
    setResult(null);
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-4 sm:p-6 max-h-[88vh] flex flex-col">
        <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 text-lg font-bold">
                🎓
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <span>Simulado CEFR • Nivelamento Rápido</span>
                  <span className="text-xs">{langDef.flag}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Diagnóstico rápido de proficiência internacional (A1 a C1)
                </DialogDescription>
              </div>
            </div>

            {(currentCefrLevel || progress?.cefrLevel) && (
              <Badge
                variant="outline"
                className="text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
              >
                Nível: {currentCefrLevel || progress?.cefrLevel}
              </Badge>
            )}
          </div>

          {!isFinished && (
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Questão {currentIndex + 1} de {questions.length}</span>
                <span>Alvo: {currentQ.levelTarget}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5 rounded-full" />
            </div>
          )}
        </DialogHeader>

        {!isFinished ? (
          /* MODO QUESTIONÁRIO */
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">{currentQ.title}</span>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                  {currentQ.type === "listening" ? "🎧 Audição" : currentQ.type === "reading" ? "📖 Leitura" : "✍️ Gramática"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{currentQ.prompt}</p>

              {/* Botão de Áudio para perguntas de listening */}
              {currentQ.audioPhrase && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-2 mt-1">
                  <span className="text-xs font-semibold text-primary">
                    Toque para ouvir a frase falada:
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 gap-1.5 text-xs rounded-lg active:scale-95"
                    onClick={() => handlePlayAudio(currentQ.audioPhrase!)}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Ouvir Áudio</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Opções de Resposta */}
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                let btnStyle = "border-border bg-background hover:bg-muted/60";
                if (selectedOptionId !== null) {
                  if (opt.correct) {
                    btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold";
                  } else if (selectedOptionId === opt.id) {
                    btnStyle = "border-destructive bg-destructive/15 text-destructive font-bold";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id, opt.correct)}
                    disabled={selectedOptionId !== null}
                    className={`w-full p-3 rounded-xl text-xs text-left border transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="font-bold shrink-0 mt-0.5 uppercase">{opt.id})</span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explicação Pedagógica */}
            {selectedOptionId !== null && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/80 text-xs space-y-1 animate-in fade-in">
                <p className="font-bold text-foreground">
                  Explicação Pedagógica:
                </p>
                <p className="text-muted-foreground leading-snug">
                  {currentQ.options.find((o) => o.id === selectedOptionId)?.explanationPt ||
                    currentQ.options.find((o) => o.correct)?.explanationPt}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* MODO RESULTADO CEFR & CERTIFICADO */
          <div className="flex-1 flex flex-col justify-center items-center py-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="h-20 w-20 rounded-2xl bg-violet-500/15 border-2 border-violet-500/30 flex items-center justify-center text-4xl shadow-md">
              {result?.badgeIcon || "🎓"}
            </div>

            <div className="space-y-1 max-w-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Classificação Internacional
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                {result?.titlePt}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {result?.descriptionPt}
              </p>
            </div>

            {/* Estatísticas do Simulado */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs pt-1">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-center">
                <span className="text-xs text-muted-foreground block">Acertos</span>
                <span className="text-base font-bold text-foreground">
                  {result?.correctAnswers} / {result?.totalQuestions}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                <span className="text-xs text-violet-600 dark:text-violet-400 block">Precisão</span>
                <span className="text-base font-bold text-violet-700 dark:text-violet-300">
                  {result?.scorePercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Refazer Teste</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Concluir
              </Button>
            </div>
          </div>
        )}

        {!isFinished && selectedOptionId !== null && (
          <div className="pt-2 border-t border-border/60">
            <Button
              size="sm"
              onClick={handleNext}
              className="w-full text-xs gap-1.5"
            >
              <span>{currentIndex < questions.length - 1 ? "Próxima Questão" : "Ver Resultado CEFR"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
