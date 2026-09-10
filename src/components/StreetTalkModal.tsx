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
import { SupportedLanguage } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage, getDefaultTutorForLanguage } from "@/data/tutors";
import { getStreetTalkForLanguage, StreetTalkItem } from "@/data/street-talk";
import { speakText, stopSpeaking } from "@/services/speech";
import { addXP } from "@/services/storage";
import {
  Volume2,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface StreetTalkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: SupportedLanguage;
  onRewardXp?: (amount: number) => void;
}

const fallbackQuizItem: StreetTalkItem = {
  id: "default",
  formalBook: "What are you going to do?",
  streetNative: "Whatcha gonna do?",
  phoneticPt: "uátcha gôna du?",
  translationPt: "O que você vai fazer?",
  explanationPt: "Nativos fundem 'What are you' em 'Whatcha'.",
  category: "contraction",
};

export const StreetTalkModal: React.FC<StreetTalkModalProps> = ({
  open,
  onOpenChange,
  language,
  onRewardXp,
}) => {
  const langDef = getLanguageById(language);
  const activeTutors = getTutorsForLanguage(language);
  const activeTutor = activeTutors[0] || getDefaultTutorForLanguage(language);

  const items = getStreetTalkForLanguage(language);
  const [activeTab, setActiveTab] = useState<"catalog" | "quiz">("catalog");

  // Estados do Quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handlePlayAudio = (text: string, slow: boolean = false) => {
    stopSpeaking();
    speakText(text, {
      rate: slow ? 0.75 : 1.0,
      pitch: activeTutor.speechPitch,
      gender: activeTutor.gender,
      lang: langDef.speechLangCode,
    });
  };

  // Prepara opções do quiz atual
  const currentQuizItem: StreetTalkItem = items[quizIndex] ?? items[0] ?? fallbackQuizItem;
  const quizOptions = React.useMemo(() => {
    if (!currentQuizItem) return [];
    const others = items.filter((it) => it.id !== currentQuizItem.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 2);
    const combined = [currentQuizItem, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentQuizItem, items]);

  const handleAnswerQuiz = (chosenItem: StreetTalkItem, index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = chosenItem.id === currentQuizItem.id;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      toast.success("Correto! Expressão nativa identificada!");
      if (onRewardXp) onRewardXp(10);
      else addXP(10);
    } else {
      toast.error("Ops! Veja a explicação da forma correta.");
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    if (quizIndex < items.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-4 sm:p-6 max-h-[88vh] flex flex-col">
        <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                🗣️
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <span>Street Talk: Como Nativos Falam</span>
                  <span className="text-xs">{langDef.flag}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Gírias, contrações orais e linguagem autêntica do dia a dia
                </DialogDescription>
              </div>
            </div>

            {/* Alternador Catálogo vs Quiz */}
            <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Catálogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("quiz");
                  handleResetQuiz();
                }}
                className={`py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === "quiz"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Quiz 🎯
              </button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "catalog" ? (
          /* MODO CATÁLOGO COMPARATIVO */
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 hover:border-primary/40 transition-all shadow-xs"
              >
                {/* Lado a Lado: Livro vs Rua */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Livro Formal */}
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Livro (Formal)
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground">
                        {item.formalBook}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => handlePlayAudio(item.formalBook, false)}
                        title="Ouvir versão formal"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Nativo na Rua */}
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Nativo na Rua
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-primary">
                        {item.streetNative}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-primary hover:bg-primary/10"
                          onClick={() => handlePlayAudio(item.streetNative, false)}
                          title="Ouvir versão nativa"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1 text-[9px] font-bold text-muted-foreground"
                          onClick={() => handlePlayAudio(item.streetNative, true)}
                          title="Ouvir em 0.75x"
                        >
                          0.75x
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pronúncia Fonética e Tradução */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    [ {item.phoneticPt} ]
                  </span>
                  <span className="font-medium text-foreground">
                    &ldquo;{item.translationPt}&rdquo;
                  </span>
                </div>

                {/* Explicação Cultural */}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  💡 {item.explanationPt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* MODO QUIZ INTERATIVO */
          <div className="flex-1 flex flex-col justify-between py-3">
            {!quizFinished ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Pergunta {quizIndex + 1} de {items.length}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Pontos: {quizScore}
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Como um nativo falaria informalmente:
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-foreground">
                      &ldquo;{currentQuizItem.formalBook}&rdquo;
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handlePlayAudio(currentQuizItem.formalBook)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Tradução: {currentQuizItem.translationPt}
                  </p>
                </div>

                {/* Opções de Resposta */}
                <div className="space-y-2">
                  {quizOptions.map((opt, i) => {
                    let btnStyle = "border-border bg-background hover:bg-muted/60";
                    if (selectedOption !== null) {
                      if (opt.id === currentQuizItem.id) {
                        btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                      } else if (selectedOption === i) {
                        btnStyle = "border-destructive bg-destructive/15 text-destructive font-bold";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswerQuiz(opt, i)}
                        disabled={selectedOption !== null}
                        className={`w-full p-3 rounded-xl text-xs text-left border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span className="font-semibold">{opt.streetNative}</span>
                        <span className="text-[11px] font-mono opacity-80">[ {opt.phoneticPt} ]</span>
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1 animate-in fade-in">
                    <p className="font-bold text-foreground">
                      Explicação:
                    </p>
                    <p className="text-muted-foreground leading-snug">
                      {currentQuizItem.explanationPt}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Resultado do Quiz */
              <div className="text-center py-6 space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                  🎉
                </div>
                <h4 className="text-base font-bold text-foreground">
                  Quiz de Gírias Concluído!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Você acertou <strong>{quizScore}</strong> de {items.length} expressões de rua em {langDef.name}!
                </p>
                <Button
                  size="sm"
                  onClick={handleResetQuiz}
                  className="gap-1.5 text-xs mx-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Jogar Novamente</span>
                </Button>
              </div>
            )}

            {!quizFinished && selectedOption !== null && (
              <Button
                size="sm"
                onClick={handleNextQuiz}
                className="w-full mt-2 text-xs"
              >
                Próxima Expressão
              </Button>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs"
          >
            Fechar Street Talk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
