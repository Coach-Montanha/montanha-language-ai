import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { speakText, createSpeechRecognizer, isSpeechRecognitionSupported } from "@/services/speech";
import {
  BookOpen,
  Headphones,
  Mic,
  CheckCircle2,
  Trophy,
  Volume2,
  Sparkles,
  ArrowRight,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";

interface DailySprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioSpeed: number;
  onSprintComplete: () => void;
}

export const DailySprintModal: React.FC<DailySprintModalProps> = ({
  open,
  onOpenChange,
  audioSpeed,
  onSprintComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [speakingText, setSpeakingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Passo 1: Leitura
  const readingExercise = {
    passage:
      "Sarah starts her day with a cup of black coffee and reads the news for ten minutes. She loves taking the morning train because it is quiet and relaxing.",
    question: "Why does Sarah like taking the morning train?",
    options: [
      { text: "Because it's fast and crowded", correct: false },
      { text: "Because it is quiet and relaxing", correct: true },
      { text: "Because she can buy coffee on the train", correct: false },
    ],
  };

  // Passo 2: Audição
  const listeningExercise = {
    phraseToListen: "Could you please tell me what time the flight departs?",
    translation: "Você poderia por favor me dizer que horas o voo parte?",
    question: "O que a pessoa está perguntando no áudio?",
    options: [
      { text: "Onde fica o portão de embarque", correct: false },
      { text: "Que horas o voo decola / parte", correct: true },
      { text: "Quanto custa a passagem de volta", correct: false },
    ],
  };

  // Passo 3: Conversação
  const speakingPrompt = "Diga ou digite em voz alta em inglês: 'I want to speak English fluently.'";
  const expectedPhrase = "I want to speak English fluently.";

  const handleSelectOption = (idx: number, isRight: boolean) => {
    setSelectedAnswer(idx);
    setIsCorrect(isRight);
    if (isRight) {
      toast.success("Excelente! Resposta correta.");
    } else {
      toast.error("Ops! Tente novamente.");
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      setStep(4);
      onSprintComplete();
    }
  };

  const handlePlayAudio = (text: string) => {
    speakText(text, { rate: audioSpeed });
  };

  const handleStartRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Reconhecimento de voz não suportado neste navegador. Digite abaixo!");
      return;
    }

    setIsRecording(true);
    const recognizer = createSpeechRecognizer(
      (result) => {
        setSpeakingText(result);
        setIsRecording(false);
        const lowerRes = result.toLowerCase().trim();
        if (lowerRes.includes("fluent") || lowerRes.includes("english") || lowerRes.includes("speak")) {
          toast.success("Ótima pronúncia!");
          setIsCorrect(true);
        } else {
          toast.info("Capturado! Clique em avançar.");
          setIsCorrect(true);
        }
      },
      (err) => {
        console.error(err);
        setIsRecording(false);
        toast.error("Não foi possível captar a voz. Você pode digitar.");
      },
      () => setIsRecording(false)
    );

    if (recognizer) {
      recognizer.start();
    }
  };

  const progressPercent = step === 4 ? 100 : ((step - 1) / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Treino Diário de 5 Minutos
            </DialogTitle>
            <span className="text-xs font-semibold text-primary">
              {step <= 3 ? `Etapa ${step} de 3` : "Concluído!"}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 mt-2" />
        </DialogHeader>

        {/* ETAPA 1: LEITURA */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
              1. LEITURA & COMPREENSÃO
            </div>

            <div className="rounded-xl bg-card border border-border p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  &ldquo;{readingExercise.passage}&rdquo;
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handlePlayAudio(readingExercise.passage)}
                  title="Ouvir leitura"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">{readingExercise.question}</p>
              <div className="space-y-2">
                {readingExercise.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i, opt.correct)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedAnswer === i
                        ? opt.correct
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-2 gap-1 text-xs"
              disabled={!isCorrect}
              onClick={handleNext}
            >
              Continuar para Audição <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* ETAPA 2: AUDIÇÃO */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Headphones className="h-4 w-4" />
              2. AUDIÇÃO & ESCUTA ATIVA
            </div>

            <div className="rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-500/5 p-4 text-center space-y-3">
              <p className="text-xs text-muted-foreground">Clique no botão abaixo para ouvir a frase:</p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handlePlayAudio(listeningExercise.phraseToListen)}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-sm"
              >
                <Volume2 className="h-5 w-5" /> Tocar Áudio
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">{listeningExercise.question}</p>
              <div className="space-y-2">
                {listeningExercise.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i, opt.correct)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedAnswer === i
                        ? opt.correct
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-2 gap-1 text-xs"
              disabled={!isCorrect}
              onClick={handleNext}
            >
              Continuar para Fala <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* ETAPA 3: FALA / CONVERSAÇÃO */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Mic className="h-4 w-4" />
              3. FALA & CONVERSAÇÃO
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <p className="text-xs text-muted-foreground">{speakingPrompt}</p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/60">
                <span className="text-sm font-semibold text-foreground">{expectedPhrase}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handlePlayAudio(expectedPhrase)}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={handleStartRecording}
                  className="rounded-full h-14 w-14 p-0 shadow-md"
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                <span className="text-[11px] text-muted-foreground mt-2">
                  {isRecording ? "Ouvindo sua pronúncia..." : "Toque no microfone e fale"}
                </span>
                {speakingText && (
                  <p className="mt-2 text-xs font-medium text-primary text-center">
                    Você disse: &ldquo;{speakingText}&rdquo;
                  </p>
                )}
              </div>

              {/* Opção de confirmação direta se o microfone não puder ser usado */}
              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setIsCorrect(true);
                    toast.success("Frase praticada!");
                  }}
                >
                  Pratiquei lendo em voz alta
                </Button>
              </div>
            </div>

            <Button
              className="w-full mt-2 gap-1 text-xs"
              disabled={!isCorrect && !speakingText}
              onClick={handleNext}
            >
              Finalizar Treino <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* ETAPA 4: CELEBRAÇÃO & CONCLUSÃO */}
        {step === 4 && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Trophy className="h-9 w-9 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Treino Diário Concluído!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Você praticou Leitura, Audição e Fala em menos de 5 minutos.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              🎉 +50 XP conquistados & Streak mantido com sucesso!
            </div>

            <Button
              className="w-full text-xs"
              onClick={() => {
                setStep(1);
                onOpenChange(false);
              }}
            >
              Fechar e Continuar Estudando
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
