import React, { useState, useEffect, useMemo } from "react";
import { Flashcard, UserProgress, SupportedLanguage } from "@/types/language";
import { getPresetThemesForLanguage } from "@/data/vocabulary";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import { generateFlashcards } from "@/services/ai-engine";
import { speakText, stopSpeaking } from "@/services/speech";
import {
  addXP,
  saveCustomFlashcard,
  loadTop200Progress,
  saveTop200Progress,
  markTop200WordMastered,
  toggleTop200ReviewQueue,
} from "@/services/storage";
import { getTop200Words, TopWordCard, Top200Progress } from "@/data/top200";
import {
  playCardFlipSound,
  playSuccessSound,
  playOptionSelectSound,
} from "@/services/audio-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Sparkles,
  Search,
  RotateCw,
  Check,
  BookMarked,
  ArrowLeft,
  ArrowRight,
  Layers,
  Flame,
  RefreshCw,
  Award,
  CheckCircle2,
  HelpCircle,
  Undo2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { PillFilter } from "@/components/ui/pill-filter";
import { toast } from "sonner";

interface FlashcardsTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const activeLang: SupportedLanguage = progress.selectedLanguage || "en";
  const langDef = getLanguageById(activeLang);
  const activeTutors = getTutorsForLanguage(activeLang);
  const activeTutor = activeTutors[0] || { name: "Tutor", gender: "male" };

  // Modo ativo: 'top200' (200 Mais Usadas) ou 'themes' (Temas & IA)
  const [activeMode, setActiveMode] = useState<"top200" | "themes">("top200");

  // ================= ESTADOS DO TOP 200 =================
  const top200List: TopWordCard[] = getTop200Words(activeLang);
  const [topProgress, setTopProgress] = useState<Top200Progress>(() =>
    loadTop200Progress(activeLang)
  );
  const [topIndex, setTopIndex] = useState<number>(0);
  const [isReviewCard, setIsReviewCard] = useState<boolean>(false);
  const [interleavedCounter, setInterleavedCounter] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showCategoryChart, setShowCategoryChart] = useState<boolean>(false);

  // Estado compartilhado de virada do card
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    playCardFlipSound();
    setIsFlipped((prev) => !prev);
  };

  // ================= ESTADOS DE TEMAS & IA =================
  const [themeInput, setThemeInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState("Viagem");
  const [customCards, setCustomCards] = useState<Flashcard[]>(() => {
    const langThemes = getPresetThemesForLanguage(activeLang);
    return langThemes["viagem"] || Object.values(langThemes)[0] || [];
  });
  const [customIndex, setCustomIndex] = useState(0);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  // Sincronização ao trocar idioma
  useEffect(() => {
    const p = loadTop200Progress(activeLang);
    setTopProgress(p);
    setTopIndex(Math.min(p.currentIndex, 199));
    setIsReviewCard(false);
    setInterleavedCounter(0);
    setIsPlayingAudio(false);

    const langThemes = getPresetThemesForLanguage(activeLang);
    const newCards = langThemes["viagem"] || Object.values(langThemes)[0] || [];
    setCustomCards(newCards);
    setCurrentTheme("Viagem");
    setCustomIndex(0);
    setIsFlipped(false);
  }, [activeLang]);

  // Cartão atual do Top 200
  const currentTopWord: TopWordCard | undefined = top200List[topIndex] || top200List[0];
  const isMastered = currentTopWord ? topProgress.masteredIds.includes(currentTopWord.id) : false;
  const isInReviewQueue = currentTopWord ? topProgress.reviewQueue.includes(currentTopWord.id) : false;

  // Estatísticas do Top 200
  const masteredCount = topProgress.masteredIds.length;
  const reviewQueueCount = topProgress.reviewQueue.length;
  const masteredPercent = Math.min(Math.round((masteredCount / 200) * 100), 100);

  // Estatísticas e progresso por categoria das 200 palavras
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; mastered: number; firstIndex: number }> = {};
    top200List.forEach((w, idx) => {
      const cat = w.category || "Comunicação";
      if (!stats[cat]) {
        stats[cat] = { total: 0, mastered: 0, firstIndex: idx };
      }
      stats[cat].total += 1;
      if (topProgress.masteredIds.includes(w.id)) {
        stats[cat].mastered += 1;
      }
    });
    return Object.entries(stats).map(([cat, val]) => ({
      name: cat,
      total: val.total,
      mastered: val.mastered,
      firstIndex: val.firstIndex,
      percentage: Math.round((val.mastered / val.total) * 100),
    }));
  }, [top200List, topProgress.masteredIds]);

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakText(text, {
      rate: progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
    });
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2200);
  };

  // ================= NAVEGAÇÃO E REPETIÇÃO DO TOP 200 =================
  const advanceTopSequence = (baseProgress?: Top200Progress, nextTargetIndex?: number) => {
    playCardFlipSound();
    setIsFlipped(false);
    const activeProg = baseProgress || topProgress;

    // Mecanismo de Repetição Espaçada Intercalada:
    // A cada 4 passos na trilha, se houver palavras na fila de revisão, puxa uma da fila!
    const nextCounter = interleavedCounter + 1;
    setInterleavedCounter(nextCounter);

    if (nextCounter >= 4 && activeProg.reviewQueue.length > 0 && !isReviewCard) {
      // Pega uma palavra da fila de repetição para fixação
      const reviewWordId = activeProg.reviewQueue[0];
      const reviewCardIdx = top200List.findIndex((w) => w.id === reviewWordId);
      if (reviewCardIdx !== -1 && reviewCardIdx !== topIndex) {
        setIsReviewCard(true);
        setTopIndex(reviewCardIdx);
        setInterleavedCounter(0);
        toast.info("🔄 Hora da repetição para fixar pronúncia!", {
          description: "Pratique em voz alta esta palavra para gravar na memória.",
        });
        return;
      }
    }

    // Se já estava em cartão de revisão ou não tem fila, volta à sequência normal
    setIsReviewCard(false);
    let nextIdx = nextTargetIndex !== undefined ? nextTargetIndex : topIndex + 1;
    if (nextIdx >= top200List.length) {
      nextIdx = 0; // recomeça do início do ciclo
      toast.success("🎉 Você percorreu todas as 200 palavras! Recomeçando ciclo de fixação.");
    }

    setTopIndex(nextIdx);
    const updatedProg: Top200Progress = {
      ...activeProg,
      currentIndex: nextIdx,
    };
    setTopProgress(updatedProg);
    saveTop200Progress(activeLang, updatedProg);
  };

  const handlePrevTop = () => {
    playCardFlipSound();
    setIsFlipped(false);
    setIsReviewCard(false);
    const prevIdx = topIndex > 0 ? topIndex - 1 : top200List.length - 1;
    setTopIndex(prevIdx);
    const updatedProg: Top200Progress = {
      ...topProgress,
      currentIndex: prevIdx,
    };
    setTopProgress(updatedProg);
    saveTop200Progress(activeLang, updatedProg);
  };

  const handleToggleReviewQueue = () => {
    if (!currentTopWord) return;
    playOptionSelectSound();
    const updated = toggleTop200ReviewQueue(activeLang, currentTopWord.id);
    setTopProgress(updated);
    if (updated.reviewQueue.includes(currentTopWord.id)) {
      toast.info(`"${currentTopWord.word}" adicionada para repetição e fixação!`, {
        description: "Reaparecerá periodicamente durante o estudo para treinar pronúncia.",
      });
    } else {
      toast.success(`"${currentTopWord.word}" removida da repetição.`);
    }
  };

  const handleMarkTopMastered = () => {
    if (!currentTopWord) return;
    playSuccessSound();
    const isAlready = topProgress.masteredIds.includes(currentTopWord.id);
    const updated = markTop200WordMastered(activeLang, currentTopWord.id);
    setTopProgress(updated);

    if (!isAlready) {
      const updatedUser = addXP(15);
      onUpdateProgress({
        ...updatedUser,
        cardsMasteredCount: progress.cardsMasteredCount + 1,
      });

      toast.success(`Palavra #${currentTopWord.rank} "${currentTopWord.word}" dominada! +15 XP`, {
        description: "Excelente! Contador de dominadas atualizado.",
      });
    } else {
      toast.info(`Palavra #${currentTopWord.rank} "${currentTopWord.word}" já estava dominada.`);
    }

    advanceTopSequence(updated);
  };

  // ================= TEMA & IA (MODO LEGADO / EXPANSÃO) =================
  const quickThemes = [
    { label: "✈️ Viagem", key: "viagem" },
    { label: "🍔 Comida", key: "comida" },
    { label: "💻 Tecnologia", key: "tecnologia" },
    { label: "💼 Trabalho", key: "trabalho" },
    { label: "❤️ Sentimentos", key: "emocoes" },
  ];

  const handleGenerateTheme = async (targetTheme?: string) => {
    const query = (targetTheme || themeInput).trim();
    if (!query || isLoadingTheme) return;

    setIsLoadingTheme(true);
    setIsFlipped(false);
    try {
      const generated = await generateFlashcards(query, progress.geminiApiKey, activeLang);
      if (generated.length > 0) {
        setCustomCards(generated);
        setCurrentTheme(query);
        setCustomIndex(0);
        toast.success(`Cartões de ${langDef.name} gerados para o tema: ${query}!`);
        generated.forEach((card) => saveCustomFlashcard(card));
      } else {
        toast.error("Nenhum cartão gerado para este tema.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar cartões. Tente outro tema.");
    } finally {
      setIsLoadingTheme(false);
    }
  };

  const handleCustomNext = () => {
    playCardFlipSound();
    setIsFlipped(false);
    if (customIndex < customCards.length - 1) {
      setCustomIndex(customIndex + 1);
    } else {
      setCustomIndex(0);
    }
  };

  const handleCustomPrev = () => {
    playCardFlipSound();
    setIsFlipped(false);
    if (customIndex > 0) {
      setCustomIndex(customIndex - 1);
    } else {
      setCustomIndex(customCards.length - 1);
    }
  };

  const handleCustomMastered = () => {
    const c = customCards[customIndex];
    if (!c) return;
    playSuccessSound();
    const updated = addXP(15);
    onUpdateProgress({
      ...updated,
      cardsMasteredCount: progress.cardsMasteredCount + 1,
    });
    toast.success(`Palavra "${c.word}" dominada! +15 XP`);
    handleCustomNext();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full p-3 space-y-3">
      {/* SELETOR DE MODO: TOP 200 vs TEMAS & IA */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-muted/70 rounded-2xl border border-border/80">
        <button
          type="button"
          onClick={() => {
            setActiveMode("top200");
            setIsFlipped(false);
          }}
          aria-label="Modo Top 200 Palavras Mais Usadas"
          className={`flex-1 py-2 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === "top200"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          <span>Top 200 Mais Usadas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode("themes");
            setIsFlipped(false);
          }}
          aria-label="Modo Temas e Vocabulário com Inteligência Artificial"
          className={`flex-1 py-2 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === "themes"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4 text-primary" />
          <span>Temas & IA</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: TOP 200 PALAVRAS MAIS USADAS (SEQUENCIAL & FIXAÇÃO DE PRONÚNCIA) */}
      {/* ========================================================================= */}
      {activeMode === "top200" && (
        <div className="flex-1 flex flex-col justify-between space-y-2.5">
          {/* Painel Superior de Progresso do Top 200 */}
          <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{langDef.flag}</span>
                <span className="text-xs font-bold text-foreground">
                  200 Mais Usadas em {langDef.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {reviewQueueCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  >
                    🔄 {reviewQueueCount} p/ fixar
                  </Badge>
                )}
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {masteredCount}/200 dominadas ({masteredPercent}%)
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <Progress value={masteredPercent} className="h-2 rounded-full" />

            {/* Seletor rápido de posição / info da palavra / botão de categorias */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>
                Sequência: <strong className="text-foreground">#{topIndex + 1}</strong> de 200
              </span>
              <button
                type="button"
                onClick={() => setShowCategoryChart(!showCategoryChart)}
                className="text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-1 py-1 px-1.5 rounded-md hover:bg-primary/10 transition-colors cursor-pointer active:scale-95"
                aria-expanded={showCategoryChart}
                aria-label="Alternar painel de categorias e progresso"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{showCategoryChart ? "Ocultar Categorias" : `Cat: ${currentTopWord?.category || "Comunicação"}`}</span>
                {showCategoryChart ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Painel Expansível de Progresso por Categoria */}
            {showCategoryChart && (
              <div className="pt-2 border-t border-border/60 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Domínio por Área ({categoryStats.length} categorias):</span>
                  <span>Toque para saltar</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {categoryStats.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        advanceTopSequence(topProgress, c.firstIndex);
                        toast.info(`Saltou para a categoria: ${c.name}`);
                      }}
                      className="text-left p-2 rounded-xl border border-border/70 bg-card hover:border-primary/50 transition-all text-[10px] space-y-1 active:scale-95 cursor-pointer"
                      title={`Ir para ${c.name} (Começa na palavra #${c.firstIndex + 1})`}
                      aria-label={`Categoria ${c.name}: ${c.mastered} de ${c.total} dominadas, ${c.percentage}% concluído`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold truncate text-foreground">{c.name}</span>
                        <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.percentage}%
                        </span>
                      </div>
                      <Progress value={c.percentage} className="h-1.5 rounded-full" />
                      <div className="text-[8.5px] text-muted-foreground flex justify-between">
                        <span>{c.mastered}/{c.total} dominadas</span>
                        <span>#{c.firstIndex + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Banner de Aviso de Repetição Espaçada */}
          {isReviewCard && (
            <div className="flex items-center justify-between px-3 py-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-semibold animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span>Fixação de Pronúncia: Repita em voz alta 3 vezes!</span>
              </div>
            </div>
          )}

          {/* O CARTÃO TOP 200 (Flip Card 3D Acessível) */}
          {currentTopWord && (
            <div
              role="button"
              tabIndex={0}
              onClick={toggleFlip}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFlip();
                }
              }}
              aria-label="Virar cartão de estudo. Toque ou pressione Enter para alternar entre palavra e tradução."
              className={`group relative flex-1 min-h-[260px] cursor-pointer rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-all duration-300 flex flex-col justify-between select-none active:scale-[0.99] ${
                isReviewCard
                  ? "border-amber-500/60 bg-gradient-to-b from-amber-500/5 to-card hover:border-amber-500"
                  : isMastered
                  ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/5 to-card"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              {/* Topo do Cartão */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      isReviewCard
                        ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                        : "border-primary/40 text-primary bg-primary/10"
                    }`}
                  >
                    #{currentTopWord.rank} mais usada
                  </Badge>
                  {isMastered && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold border-emerald-500 text-emerald-600 bg-emerald-500/10 flex items-center gap-0.5"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Dominada
                    </Badge>
                  )}
                  {isInReviewQueue && !isMastered && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold border-amber-500 text-amber-600 bg-amber-500/10"
                    >
                      🔄 Na fila de fixação
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => handlePlayAudio(e, currentTopWord.word)}
                    className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full shadow-xs text-primary hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    aria-label={isPlayingAudio ? "Pausar pronúncia" : `Ouvir pronúncia oficial em ${langDef.name}`}
                    title={`Ouvir pronúncia oficial em ${langDef.name}`}
                  >
                    {isPlayingAudio ? (
                      <span className="flex items-center gap-0.5 h-4 px-1" aria-hidden="true">
                        <span className="w-1 bg-primary rounded-full animate-wave-1" />
                        <span className="w-1 bg-primary rounded-full animate-wave-2" />
                        <span className="w-1 bg-primary rounded-full animate-wave-3" />
                      </span>
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Conteúdo Frente vs Verso */}
              {!isFlipped ? (
                <div className="my-auto text-center space-y-2.5 py-4">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-relaxed py-1 select-text">
                    {currentTopWord.word}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold leading-relaxed py-0.5 select-text">
                      {currentTopWord.phonetic}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pt-3 flex items-center justify-center gap-1">
                    <RotateCw className="h-3 w-3" /> Toque no cartão para ver a tradução e frase prática
                  </p>
                </div>
              ) : (
                <div className="my-auto text-center space-y-3 py-2 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Tradução em Português:
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-normal py-1">
                      {currentTopWord.translation}
                    </h4>
                  </div>

                  {/* Frase Comunicativa de Exemplo */}
                  <div className="rounded-2xl bg-muted/60 p-3.5 text-left space-y-1.5 border border-border/70">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed max-w-prose">
                        &ldquo;{currentTopWord.exampleSentence}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(e, currentTopWord.exampleSentence)}
                        className="text-muted-foreground hover:text-primary shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title="Ouvir frase em ritmo natural"
                        aria-label="Ouvir frase de exemplo"
                      >
                        <Volume2 className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground italic border-t border-border/40 pt-1 leading-relaxed">
                      {currentTopWord.exampleTranslation}
                    </p>
                  </div>
                </div>
              )}

              {/* Rodapé do Cartão */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                <span>{isFlipped ? "Verso: Português & Contexto" : "Frente: Fonética & Fala"}</span>
                <span className="font-semibold text-primary">{activeTutor.name} ({langDef.name})</span>
              </div>
            </div>
          )}

          {/* Barra de Controles e Treino */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevTop}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl shrink-0 active:scale-95 cursor-pointer"
              title="Palavra anterior"
              aria-label="Palavra anterior na sequência"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Botão Repetir para Fixar */}
            <Button
              variant={isInReviewQueue ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleReviewQueue}
              className={`flex-1 text-xs h-11 min-h-[44px] rounded-2xl gap-1.5 active:scale-95 cursor-pointer ${
                isInReviewQueue
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                  : ""
              }`}
              title="Adicionar esta palavra à fila de repetição periódica para fixação da pronúncia"
              aria-label="Adicionar esta palavra à fila de repetição periódica para fixação da pronúncia"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{isInReviewQueue ? "Na Repetição" : "Repetir p/ Fixar"}</span>
            </Button>

            {/* Botão Já Dominei */}
            <Button
              size="sm"
              onClick={handleMarkTopMastered}
              className={`flex-1 text-xs h-11 min-h-[44px] rounded-2xl gap-1.5 font-bold shadow-xs active:scale-95 cursor-pointer transition-colors ${
                isMastered
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              title={isMastered ? "Palavra já dominada! Clique para avançar" : "Marcar como dominada e ganhar +15 XP"}
              aria-label={isMastered ? "Palavra já dominada! Clique para avançar" : "Marcar como dominada e ganhar +15 XP"}
            >
              <Check className="h-4 w-4" />
              <span>{isMastered ? "✓ Dominada" : "Já Dominei"}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => advanceTopSequence()}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl shrink-0 active:scale-95 cursor-pointer"
              title="Próxima palavra na sequência"
              aria-label="Próxima palavra na sequência"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: TEMAS PERSONALIZADOS & IA (MODO EXPANDIDO / GERADOR) */}
      {/* ========================================================================= */}
      {activeMode === "themes" && (
        <div className="flex-1 flex flex-col justify-between space-y-2.5">
          {/* Formulário de Busca / Geração por Tema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Temas em {langDef.flag} {langDef.name}
              </h2>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {customCards.length} cartões no tema
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateTheme();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder={`Digite tema em ${langDef.name} (ex: Aeroporto, Restaurante)...`}
                  className="text-xs h-11 pl-9 rounded-xl bg-background"
                  disabled={isLoadingTheme}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!themeInput.trim() || isLoadingTheme}
                className="h-11 min-h-[44px] px-3.5 text-xs gap-1 rounded-xl shadow-xs active:scale-95 cursor-pointer"
                aria-label="Gerar cartões por inteligência artificial"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gerar</span>
              </Button>
            </form>

            {/* Atalhos Rápidos com ReUI PillFilter */}
            <PillFilter
              options={quickThemes.map((t) => ({ id: t.key, label: t.label }))}
              selectedId={quickThemes.find((t) => currentTheme.toLowerCase().includes(t.key))?.key || ""}
              onSelect={(key) => handleGenerateTheme(key)}
            />
          </div>

          {/* Cartão de Tema */}
          {customCards[customIndex] ? (
            <div
              role="button"
              tabIndex={0}
              onClick={toggleFlip}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleFlip();
                }
              }}
              aria-label="Virar cartão de estudo. Toque ou pressione Enter para ver a tradução."
              className="group relative flex-1 min-h-[260px] cursor-pointer rounded-3xl border-2 border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between select-none active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                  Tema: {currentTheme} • #{customIndex + 1}/{customCards.length}
                </Badge>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => handlePlayAudio(e, customCards[customIndex]?.word || "")}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full shadow-xs text-primary active:scale-95 cursor-pointer flex items-center justify-center"
                  title={`Ouvir palavra em ${langDef.name}`}
                  aria-label={`Ouvir palavra em ${langDef.name}`}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>

              {!isFlipped ? (
                <div className="my-auto text-center space-y-2 py-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-relaxed py-1 select-text">
                    {customCards[customIndex].word}
                  </h3>
                  <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold leading-relaxed py-0.5 select-text">
                    {customCards[customIndex].phonetic}
                  </p>
                  <p className="text-xs text-muted-foreground pt-3 flex items-center justify-center gap-1">
                    <RotateCw className="h-3 w-3" /> Toque no cartão para ver a tradução e frase
                  </p>
                </div>
              ) : (
                <div className="my-auto text-center space-y-3 py-2 animate-in fade-in duration-200">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tradução:</span>
                    <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-normal py-1">
                      {customCards[customIndex].translation}
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-muted/60 p-3.5 text-left space-y-1.5 border border-border/60">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed max-w-prose">
                        &ldquo;{customCards[customIndex].exampleSentence}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(e, customCards[customIndex]?.exampleSentence || "")}
                        className="text-muted-foreground hover:text-primary shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                        title="Ouvir frase completa"
                        aria-label="Ouvir frase completa"
                      >
                        <Volume2 className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground italic border-t border-border/40 pt-1 leading-relaxed">
                      {customCards[customIndex].exampleTranslation}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center pt-2 border-t border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {isFlipped ? "Verso (Tradução & Exemplo)" : `Frente (${langDef.name} & Fonética)`}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <BookMarked className="h-12 w-12 text-muted-foreground opacity-40" />
              <p className="text-xs text-muted-foreground">
                Nenhum cartão encontrado. Digite um tema acima para gerar!
              </p>
            </div>
          )}

          {/* Controles de Navegação de Temas */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCustomPrev}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl active:scale-95 cursor-pointer"
              title="Cartão anterior"
              aria-label="Cartão anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlip}
              className="flex-1 text-xs h-11 min-h-[44px] rounded-2xl gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Alternar entre frente e verso do cartão"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>{isFlipped ? "Ver Frente" : "Ver Tradução"}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleCustomMastered}
              className="flex-1 text-xs h-11 min-h-[44px] rounded-2xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 cursor-pointer"
              aria-label="Marcar palavra do tema como dominada"
            >
              <Check className="h-4 w-4" />
              <span>Já Dominei</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleCustomNext}
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl active:scale-95 cursor-pointer"
              title="Próximo cartão"
              aria-label="Próximo cartão"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
