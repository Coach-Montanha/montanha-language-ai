import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  speakText,
  stopSpeaking,
  bargeInInterrupt,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/services/speech";
import {
  playSuccessSound,
  playSprintCompleteSound,
  playOptionSelectSound,
  playCorrectionChime,
  playMicStartSound,
  playMicStopSound,
} from "@/services/audio-effects";
import { SupportedLanguage } from "@/types/language";
import { getDailySprintForLanguage } from "@/data/daily-tasks";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
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
  GraduationCap,
  Lightbulb,
  Check,
  HelpCircle,
} from "lucide-react";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { Rating } from "@/components/ui/rating";
import { toast } from "sonner";

interface DailySprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioSpeed: number;
  onSprintComplete: () => void;
  language?: SupportedLanguage;
}

export const DailySprintModal: React.FC<DailySprintModalProps> = ({
  open,
  onOpenChange,
  audioSpeed,
  onSprintComplete,
  language = "en",
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [speakingText, setSpeakingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [userRating, setUserRating] = useState<number>(5);

  const langDef = getLanguageById(language);
  const tutors = getTutorsForLanguage(language);
  const activeTutor = tutors[0] || { name: "Tutor", gender: "male" };

  const exercise = getDailySprintForLanguage(language);
  const miniLesson = exercise.miniLesson;
  const readingExercise = exercise.reading;
  const listeningExercise = exercise.listening;
  const speakingExercise = exercise.speaking;

  const SPRINT_STEPS: StepItem[] = [
    { label: "Lição", icon: <BookOpen className="h-3 w-3" /> },
    { label: "Leitura", icon: <GraduationCap className="h-3 w-3" /> },
    { label: "Escuta", icon: <Headphones className="h-3 w-3" /> },
    { label: "Fala", icon: <Mic className="h-3 w-3" /> },
    { label: "Vitória", icon: <Trophy className="h-3 w-3 text-amber-500" /> },
  ];

  const handleSelectOption = (idx: number, isRight: boolean, explanation?: string) => {
    playOptionSelectSound();
    setSelectedAnswer(idx);
    setIsCorrect(isRight);

    if (isRight) {
      playSuccessSound();
      toast.success("Excelente! Resposta correta.", {
        description: explanation,
      });
    } else {
      playCorrectionChime();
      toast.error("Ops! Tente novamente.", {
        description: explanation,
      });
    }
  };

  const handleNext = () => {
    stopSpeaking();
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      setStep(5);
      playSprintCompleteSound();
      onSprintComplete();
    }
  };

  const handlePlayAudio = (text: string) => {
    speakText(text, {
      rate: audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
    });
  };

  const handleStartRecording = () => {
    bargeInInterrupt(); // Barge-in imediato para não sobrepor áudio

    if (!isSpeechRecognitionSupported()) {
      toast.error("Reconhecimento de voz não suportado neste navegador. Pratique lendo em voz alta!");
      return;
    }

    playMicStartSound();
    setIsRecording(true);

    const recognizer = createSpeechRecognizer(
      (result) => {
        playMicStopSound();
        setSpeakingText(result);
        setIsRecording(false);
        playSuccessSound();
        toast.success("Ótima pronúncia!");
        setIsCorrect(true);
      },
      (err) => {
        console.error(err);
        playMicStopSound();
        setIsRecording(false);
        toast.error("Não foi possível captar a voz. Você pode confirmar clicando abaixo.");
      },
      () => {
        playMicStopSound();
        setIsRecording(false);
      },
      langDef.speechLangCode
    );

    if (recognizer) {
      recognizer.start();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Treino 5 Minutos • {langDef.flag} {langDef.name}</span>
            </DialogTitle>
          </div>
          <Stepper steps={SPRINT_STEPS} currentStep={step} className="pt-1 pb-1" />
        </DialogHeader>

        {/* ETAPA 1: MINI-LIÇÃO PEDAGÓGICA & KNOWLEDGE CHECK */}
        {step === 1 && miniLesson && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>1. MINI-LIÇÃO & OBJETIVO CHAVE</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Padrão DAIR.AI</span>
            </div>

            {/* Cartão de Conceito e Regra de Ouro */}
            <div className="rounded-xl bg-card border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2.5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  🎯 Objetivo: {miniLesson.objective}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {miniLesson.concept}
                </p>
              </div>

              <div className="flex items-start gap-2 bg-amber-500/10 p-2.5 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{miniLesson.goldTip}</span>
              </div>

              {/* Exemplo Autêntico com Áudio */}
              <div className="border-t border-border/40 pt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    &ldquo;{miniLesson.examplePhrase}&rdquo;
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handlePlayAudio(miniLesson.examplePhrase)}
                    title="Ouvir exemplo"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  {miniLesson.examplePhonetic}
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  {miniLesson.examplePt}
                </p>
              </div>
            </div>

            {/* Knowledge Check Interativo */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                <span>Fixação Rápida: {miniLesson.knowledgeCheck.question}</span>
              </div>
              <div className="space-y-2">
                {miniLesson.knowledgeCheck.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i, opt.correct, opt.explanationPt)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedAnswer === i
                        ? opt.correct
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-destructive bg-destructive/15 text-destructive"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 font-bold">
                        {String.fromCharCode(65 + i)})
                      </span>
                      <div className="space-y-1">
                        <div>{opt.text}</div>
                        {selectedAnswer === i && (
                          <div className="text-[11px] font-normal opacity-90">
                            {opt.explanationPt}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-2 gap-1 text-xs"
              disabled={!isCorrect}
              onClick={handleNext}
            >
              Continuar para Leitura <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* ETAPA 2: LEITURA & COMPREENSÃO */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>2. LEITURA & COMPREENSÃO</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{readingExercise.title}</span>
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
                  title={`Ouvir leitura em ${langDef.name}`}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Tradução de apoio */}
              <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                {readingExercise.translationPt}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{readingExercise.question}</p>
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

        {/* ETAPA 3: AUDIÇÃO & ESCUTA ATIVA */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Headphones className="h-4 w-4" />
              <span>3. AUDIÇÃO & ESCUTA ATIVA ({langDef.name})</span>
            </div>

            <div className="rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-500/5 p-4 text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Toque no botão para ouvir o áudio nativo na voz de {activeTutor.name}:
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handlePlayAudio(listeningExercise.phraseToListen)}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-sm"
              >
                <Volume2 className="h-5 w-5" /> Tocar Áudio Nativo
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{listeningExercise.question}</p>
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

        {/* ETAPA 4: FALA & PRONÚNCIA */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Mic className="h-4 w-4" />
              <span>4. FALA & PRONÚNCIA ({langDef.name})</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <p className="text-xs text-muted-foreground">{speakingExercise.promptPt}</p>

              <div className="p-2.5 rounded-lg bg-muted/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    &ldquo;{speakingExercise.phrase}&rdquo;
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handlePlayAudio(speakingExercise.phrase)}
                    title="Ouvir como pronunciar"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Guia fonético em português */}
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {speakingExercise.phonetic}
                </p>

                {/* Tradução */}
                <p className="text-[10px] text-muted-foreground italic">
                  {speakingExercise.translationPt}
                </p>
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
                  {isRecording ? `Ouvindo pronúncia em ${langDef.name}...` : "Toque no microfone e fale"}
                </span>
                {speakingText && (
                  <p className="mt-2 text-xs font-medium text-primary text-center">
                    Você disse: &ldquo;{speakingText}&rdquo;
                  </p>
                )}
              </div>

              {/* Opção de confirmação direta */}
              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    playSuccessSound();
                    setIsCorrect(true);
                    toast.success("Frase praticada com sucesso!");
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

        {/* ETAPA 5: CELEBRAÇÃO & CONCLUSÃO */}
        {step === 5 && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Trophy className="h-9 w-9 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Treino Concluído em {langDef.name}!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Você dominou a Mini-Lição, Leitura, Audição e Pronúncia com {activeTutor.name} em 5 minutos.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              🎉 +50 XP conquistados & Streak diário mantido!
            </div>

            {/* Avaliação Interativa de Desempenho com ReUI Rating */}
            <div className="rounded-2xl border border-border bg-card/60 p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-foreground block">
                Como você avalia sua pronúncia e confiança hoje?
              </span>
              <Rating
                variant="emojis"
                value={userRating}
                onValueChange={(val) => {
                  setUserRating(val);
                  toast.success("Obrigado pelo feedback de prática!");
                }}
              />
            </div>

            <Button
              className="w-full text-xs font-bold"
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
