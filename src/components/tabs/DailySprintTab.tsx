import React, { useState } from "react";
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
import { SupportedLanguage, UserProgress } from "@/types/language";
import { getDailySprintForLanguage } from "@/data/daily-tasks";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import { evaluatePronunciation, PronunciationEvaluation } from "@/services/pronunciation-scorer";
import { PronunciationScore } from "@/components/ui/pronunciation-score";
import { awardGamificationRewards } from "@/services/gamification";
import {
  BookOpen,
  Headphones,
  Mic,
  CheckCircle2,
  Trophy,
  Volume2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Check,
  HelpCircle,
  RotateCcw,
  MessageSquareText,
  Coins,
  Shield,
  Zap,
} from "lucide-react";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { Rating } from "@/components/ui/rating";
import { toast } from "sonner";

interface DailySprintTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onNavigateToTab?: (tab: "conversa" | "avatar") => void;
}

export const DailySprintTab: React.FC<DailySprintTabProps> = ({
  progress,
  onUpdateProgress,
  onNavigateToTab,
}) => {
  const language = progress.selectedLanguage || "en";
  const audioSpeed = progress.audioSpeed || 1.0;
  const selectedVoiceName = progress.selectedVoiceName;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [speakingText, setSpeakingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pronunciationEval, setPronunciationEval] = useState<PronunciationEvaluation | null>(null);
  const [userRating, setUserRating] = useState<number>(5);

  const langDef = getLanguageById(language);
  const tutors = getTutorsForLanguage(language);
  const activeTutor = tutors[0] || getTutorsForLanguage("en")[0]!;

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
    setPronunciationEval(null);
    setSpeakingText("");

    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      setStep(5);
      playSprintCompleteSound();

      // Conclui o sprint e concede +50 XP e +100 Moedas
      const rewardResult = awardGamificationRewards(progress, 50, 100);
      const updated: UserProgress = {
        ...rewardResult.updated,
        dailySprintDone: true,
      };
      onUpdateProgress(updated);

      if (rewardResult.leveledUp) {
        toast.success(`🎉 LEVEL UP! Você subiu para o Nível ${rewardResult.newLevel}!`, {
          description: `Bônus de ${rewardResult.bonusCoins} moedas concedido para sua loja RPG!`,
        });
      } else {
        toast.success("Treino concluído com maestria! +50 XP e +100 Moedas!");
      }
    }
  };

  const handlePlayAudio = (text: string) => {
    speakText(text, {
      rate: audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
      preferredVoiceKeywords: activeTutor.preferredVoiceKeywords,
      voiceName: selectedVoiceName,
    });
  };

  const handleStartRecording = () => {
    bargeInInterrupt();

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
        const evalResult = evaluatePronunciation(speakingExercise.phrase, result, language);
        setPronunciationEval(evalResult);
        if (evalResult.overallScore >= 50) {
          playSuccessSound();
          toast.success(`${evalResult.gradeLabelPt} (${evalResult.overallScore}% de precisão)`);
          setIsCorrect(true);
        } else {
          toast.info("Tente pronunciar com mais calma ou ouça o modelo em 0.75x.");
        }
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

  const handleResetSprint = () => {
    setStep(1);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setPronunciationEval(null);
    setSpeakingText("");
    toast.info("Treino reiniciado. Bons estudos!");
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 max-w-2xl mx-auto w-full space-y-4 pb-20">
      {/* Cabeçalho do Treino */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                <span>Treino 5 Minutos</span>
                <span className="text-xs font-normal text-muted-foreground">
                  • {langDef.flag} {langDef.name}
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Prática rápida diária: Lição, Leitura, Escuta e Pronúncia em voz alta
              </p>
            </div>
          </div>

          {progress.dailySprintDone && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Concluído hoje</span>
            </div>
          )}
        </div>

        {/* Stepper Visual de 5 Etapas */}
        <Stepper steps={SPRINT_STEPS} currentStep={step} className="pt-2 pb-1" />
      </div>

      {/* ============================================================ */}
      {/* ETAPA 1: MINI-LIÇÃO PEDAGÓGICA & KNOWLEDGE CHECK */}
      {/* ============================================================ */}
      {step === 1 && miniLesson && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>1. MINI-LIÇÃO & OBJETIVO CHAVE</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">5 MIN SPRINT</span>
          </div>

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                🎯 Objetivo: {miniLesson.objective}
              </span>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {miniLesson.concept}
              </p>
            </div>

            <div className="flex items-start gap-2 bg-amber-500/10 p-3 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-200">
              <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span>{miniLesson.goldTip}</span>
            </div>

            {/* Exemplo Autêntico com Áudio */}
            <div className="border-t border-border/40 pt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  &ldquo;{miniLesson.examplePhrase}&rdquo;
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={() => handlePlayAudio(miniLesson.examplePhrase)}
                  title="Ouvir exemplo"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {miniLesson.examplePhonetic}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {miniLesson.examplePt}
              </p>
            </div>
          </div>

          {/* Fixação / Knowledge Check */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>Fixação Rápida: {miniLesson.knowledgeCheck.question}</span>
            </div>
            <div className="space-y-2">
              {miniLesson.knowledgeCheck.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i, opt.correct, opt.explanationPt)}
                  className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    selectedAnswer === i
                      ? opt.correct
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 shadow-xs"
                        : "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 font-bold">
                      {String.fromCharCode(65 + i)})
                    </span>
                    <div className="space-y-1">
                      <div>{opt.text}</div>
                      {selectedAnswer === i && (
                        <div className="text-xs font-normal opacity-90 pt-1">
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
            className="w-full mt-3 gap-1.5 text-xs font-bold cursor-pointer"
            disabled={!isCorrect}
            onClick={handleNext}
          >
            Continuar para Leitura <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ETAPA 2: LEITURA & COMPREENSÃO */}
      {/* ============================================================ */}
      {step === 2 && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>2. LEITURA & COMPREENSÃO</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">ETAPA 2/4</span>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Leitura em {langDef.name}: {readingExercise.title}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                onClick={() => handlePlayAudio(readingExercise.passage)}
                title="Ouvir leitura"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
              &ldquo;{readingExercise.passage}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground italic">
              {readingExercise.translationPt}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>{readingExercise.question}</span>
            </div>
            <div className="space-y-2">
              {readingExercise.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i, opt.correct)}
                  className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    selectedAnswer === i
                      ? opt.correct
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        : "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 font-bold">
                      {String.fromCharCode(65 + i)})
                    </span>
                    <div>{opt.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full mt-3 gap-1.5 text-xs font-bold cursor-pointer"
            disabled={!isCorrect}
            onClick={handleNext}
          >
            Continuar para Audição <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ETAPA 3: AUDIÇÃO & COMPREENSÃO ORAL */}
      {/* ============================================================ */}
      {step === 3 && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400">
            <div className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4" />
              <span>3. ESCUTA ATIVA & AUDIÇÃO</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">ETAPA 3/4</span>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Toque no botão para ouvir o áudio nativo e identifique a frase dita:
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => handlePlayAudio(listeningExercise.phraseToListen)}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 shadow-md cursor-pointer font-bold"
              >
                <Volume2 className="h-5 w-5" />
                Ouvir Áudio
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dica: Você pode ouvir quantas vezes precisar.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>{listeningExercise.question}</span>
            </div>
            <div className="space-y-2">
              {listeningExercise.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i, opt.correct)}
                  className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    selectedAnswer === i
                      ? opt.correct
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        : "border-destructive bg-destructive/15 text-destructive"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 font-bold">
                      {String.fromCharCode(65 + i)})
                    </span>
                    <div>{opt.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full mt-3 gap-1.5 text-xs font-bold cursor-pointer"
            disabled={!isCorrect}
            onClick={handleNext}
          >
            Continuar para Pronúncia <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ETAPA 4: FALA & DIAGNÓSTICO DE PRONÚNCIA */}
      {/* ============================================================ */}
      {step === 4 && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-1.5">
              <Mic className="h-4 w-4" />
              <span>4. PRONÚNCIA EM VOZ ALTA</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">ETAPA 4/4</span>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Leia em voz alta no microfone:
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                onClick={() => handlePlayAudio(speakingExercise.phrase)}
                title="Ouvir pronúncia de referência"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg font-bold text-foreground">
              {speakingExercise.phrase}
            </p>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
              {speakingExercise.phonetic}
            </p>
            <p className="text-xs text-muted-foreground italic">
              &ldquo;{speakingExercise.translationPt}&rdquo;
            </p>
          </div>

          {/* Botão de Gravação & Diagnóstico */}
          <div className="flex flex-col items-center justify-center p-5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleStartRecording}
              className={`rounded-full px-6 gap-2 text-sm font-bold shadow-md cursor-pointer transition-all ${
                isRecording ? "animate-pulse" : ""
              }`}
            >
              <Mic className="h-5 w-5" />
              {isRecording ? "Gravando voz... Fale agora" : "Aperte e Fale no Microfone"}
            </Button>

            {speakingText && (
              <div className="w-full text-center space-y-1">
                <span className="text-[11px] text-muted-foreground">Você falou:</span>
                <p className="text-sm font-semibold text-foreground">
                  &ldquo;{speakingText}&rdquo;
                </p>
              </div>
            )}

            {pronunciationEval && (
              <div className="w-full pt-2">
                <PronunciationScore
                  evaluation={pronunciationEval}
                  fullSentence={speakingExercise.phrase}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCorrect(true);
                toast.info("Pronúncia validada manualmente.");
              }}
              className="flex-1 text-xs cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Marcar como Lido
            </Button>
            <Button
              className="flex-1 text-xs font-bold cursor-pointer"
              disabled={!isCorrect}
              onClick={handleNext}
            >
              Concluir Treino Diário <Trophy className="h-3.5 w-3.5 ml-1 text-amber-400" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ETAPA 5: CONCLUÍDO / VITÓRIA RPG */}
      {/* ============================================================ */}
      {step === 5 && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-card p-6 text-center space-y-5 shadow-lg animate-in zoom-in-95">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg animate-bounce">
              <Trophy className="h-9 w-9 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Treino Diário Concluído!
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Você completou o sprint de 5 minutos e fortaleceu suas conexões sinápticas em {langDef.name}.
            </p>
          </div>

          {/* Recompensas RPG */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/10 text-center">
              <Zap className="h-5 w-5 text-violet-500 mx-auto mb-1" />
              <span className="text-[10px] text-violet-400 font-bold uppercase block">Recompensa XP</span>
              <span className="text-lg font-black text-foreground">+50 XP</span>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center">
              <Coins className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <span className="text-[10px] text-amber-400 font-bold uppercase block">Moedas RPG</span>
              <span className="text-lg font-black text-foreground">+100 🪙</span>
            </div>
          </div>

          {/* Avaliação da Lição */}
          <div className="pt-2 border-t border-border/40 space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground block">
              Como você avalia este treino?
            </span>
            <div className="flex justify-center">
              <Rating variant="emojis" value={userRating} onValueChange={(val) => setUserRating(val)} />
            </div>
          </div>

          {/* Ações Seguintes */}
          <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
            {onNavigateToTab && (
              <>
                <Button
                  onClick={() => onNavigateToTab("conversa")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer text-xs sm:text-sm h-10"
                >
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  Ir para Conversa com Tutor IA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigateToTab("avatar")}
                  className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold cursor-pointer text-xs sm:text-sm h-10"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Visitar Loja do Avatar RPG
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleResetSprint}
              className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Treinar Novamente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
