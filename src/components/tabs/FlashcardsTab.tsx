import React, { useState, useEffect } from "react";
import { Flashcard, UserProgress, SupportedLanguage } from "@/types/language";
import { getPresetThemesForLanguage } from "@/data/vocabulary";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import { generateFlashcards } from "@/services/ai-engine";
import { speakText } from "@/services/speech";
import {
  addXP,
  saveCustomFlashcard,
  loadTop200Progress,
  saveTop200Progress,
  markTop200WordMastered,
  toggleTop200ReviewQueue,
} from "@/services/storage";
import { getTop200Words, TopWordCard, Top200Progress } from "@/data/top200";
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
} from "lucide-react";
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

  // ================= ESTADOS DE TEMAS & IA =================
  const [themeInput, setThemeInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState("Viagem");
  const [customCards, setCustomCards] = useState<Flashcard[]>(() => {
    const langThemes = getPresetThemesForLanguage(activeLang);
    return langThemes["viagem"] || Object.values(langThemes)[0] || [];
  });
  const [customIndex, setCustomIndex] = useState(0);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  // Estado compartilhado de virada do card
  const [isFlipped, setIsFlipped] = useState(false);

  // Sincronização ao trocar idioma
  useEffect(() => {
    const p = loadTop200Progress(activeLang);
    setTopProgress(p);
    setTopIndex(Math.min(p.currentIndex, 199));
    setIsReviewCard(false);
    setInterleavedCounter(0);

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

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text, {
      rate: progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
    });
  };

  // ================= NAVEGAÇÃO E REPETIÇÃO DO TOP 200 =================
  const advanceTopSequence = (nextTargetIndex?: number) => {
    setIsFlipped(false);

    // Mecanismo de Repetição Espaçada Intercalada:
    // A cada 4 passos na trilha, se houver palavras na fila de revisão, puxa uma da fila!
    const nextCounter = interleavedCounter + 1;
    setInterleavedCounter(nextCounter);

    if (nextCounter >= 4 && topProgress.reviewQueue.length > 0 && !isReviewCard) {
      // Pega uma palavra da fila de repetição para fixação
      const reviewWordId = topProgress.reviewQueue[0];
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
      ...topProgress,
      currentIndex: nextIdx,
    };
    setTopProgress(updatedProg);
    saveTop200Progress(activeLang, updatedProg);
  };

  const handlePrevTop = () => {
    setIsFlipped(false);
    setIsReviewCard(false);
    const prevIdx = topIndex > 0 ? topIndex - 1 : top200List.length - 1;
    setTopIndex(prevIdx);
  };

  const handleToggleReviewQueue = () => {
    if (!currentTopWord) return;
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
    const updated = markTop200WordMastered(activeLang, currentTopWord.id);
    setTopProgress(updated);

    const updatedUser = addXP(15);
    onUpdateProgress({
      ...updatedUser,
      cardsMasteredCount: progress.cardsMasteredCount + 1,
    });

    toast.success(`Palavra #${currentTopWord.rank} "${currentTopWord.word}" dominada! +15 XP`, {
      description: "Excelente! Você está cada vez mais próximo da fluência.",
    });

    advanceTopSequence();
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
    setIsFlipped(false);
    if (customIndex < customCards.length - 1) {
      setCustomIndex(customIndex + 1);
    } else {
      setCustomIndex(0);
    }
  };

  const handleCustomPrev = () => {
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
      <div className="flex items-center justify-between gap-1 p-1 bg-muted/70 rounded-2xl border border-border/80">
        <button
          onClick={() => {
            setActiveMode("top200");
            setIsFlipped(false);
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === "top200"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          <span>🔥 Top 200 Mais Usadas</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("themes");
            setIsFlipped(false);
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === "themes"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4 text-primary" />
          <span>📂 Temas & IA</span>
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

            {/* Seletor rápido de posição / info da palavra */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>
                Sequência: <strong className="text-foreground">#{topIndex + 1}</strong> de 200
              </span>
              <span className="text-[10px] uppercase font-bold text-primary">
                Categoria: {currentTopWord?.category || "Comunicação"}
              </span>
            </div>
          </div>

          {/* Banner de Aviso de Repetição Espaçada */}
          {isReviewCard && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-semibold animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span>Fixação de Pronúncia: Repita em voz alta 3 vezes!</span>
              </div>
            </div>
          )}

          {/* O CARTÃO TOP 200 (Flip Card 3D) */}
          {currentTopWord && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`group relative flex-1 min-h-[250px] cursor-pointer rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-all duration-300 flex flex-col justify-between select-none ${
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
                    className="h-9 w-9 rounded-full shadow-xs text-primary hover:scale-105 transition-transform"
                    title={`Ouvir pronúncia oficial em ${langDef.name}`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo Frente vs Verso */}
              {!isFlipped ? (
                <div className="my-auto text-center space-y-2.5 py-4">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {currentTopWord.word}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">
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
                    <h4 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {currentTopWord.translation}
                    </h4>
                  </div>

                  {/* Frase Comunicativa de Exemplo */}
                  <div className="rounded-2xl bg-muted/60 p-3.5 text-left space-y-1.5 border border-border/70">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        &ldquo;{currentTopWord.exampleSentence}&rdquo;
                      </p>
                      <button
                        onClick={(e) => handlePlayAudio(e, currentTopWord.exampleSentence)}
                        className="text-muted-foreground hover:text-primary shrink-0 p-1"
                        title="Ouvir frase em ritmo natural"
                      >
                        <Volume2 className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1">
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
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevTop}
              className="h-10 w-10 rounded-2xl shrink-0"
              title="Palavra anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Botão Repetir para Fixar */}
            <Button
              variant={isInReviewQueue ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleReviewQueue}
              className={`flex-1 text-xs h-10 rounded-2xl gap-1.5 ${
                isInReviewQueue
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                  : ""
              }`}
              title="Adicionar esta palavra à fila de repetição periódica para fixação da pronúncia"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{isInReviewQueue ? "Na Repetição" : "Repetir p/ Fixar"}</span>
            </Button>

            {/* Botão Já Dominei */}
            <Button
              size="sm"
              onClick={handleMarkTopMastered}
              className="flex-1 text-xs h-10 rounded-2xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              title="Marcar como aprendida e ganhar +15 XP"
            >
              <Check className="h-4 w-4" />
              <span>Já Dominei</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => advanceTopSequence()}
              className="h-10 w-10 rounded-2xl shrink-0"
              title="Próxima palavra na sequência"
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
              className="flex gap-1.5"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder={`Digite tema em ${langDef.name} (ex: Aeroporto, Restaurante)...`}
                  className="text-xs h-9 pl-9 rounded-xl bg-background"
                  disabled={isLoadingTheme}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={!themeInput.trim() || isLoadingTheme}
                className="h-9 px-3 text-xs gap-1 rounded-xl shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gerar</span>
              </Button>
            </form>

            {/* Atalhos Rápidos */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickThemes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleGenerateTheme(t.key)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    currentTheme.toLowerCase().includes(t.key)
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cartão de Tema */}
          {customCards[customIndex] ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="group relative flex-1 min-h-[250px] cursor-pointer rounded-3xl border-2 border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between select-none"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                  Tema: {currentTheme} • #{customIndex + 1}/{customCards.length}
                </Badge>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => handlePlayAudio(e, customCards[customIndex].word)}
                  className="h-8 w-8 rounded-full shadow-xs text-primary"
                  title={`Ouvir palavra em ${langDef.name}`}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              {!isFlipped ? (
                <div className="my-auto text-center space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {customCards[customIndex].word}
                  </h3>
                  <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {customCards[customIndex].phonetic}
                  </p>
                  <p className="text-xs text-muted-foreground pt-4">
                    (Toque para ver a tradução e frase)
                  </p>
                </div>
              ) : (
                <div className="my-auto text-center space-y-3 animate-in fade-in duration-200">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Tradução:</span>
                    <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {customCards[customIndex].translation}
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-muted/60 p-3.5 text-left space-y-1.5 border border-border/60">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        &ldquo;{customCards[customIndex].exampleSentence}&rdquo;
                      </p>
                      <button
                        onClick={(e) => handlePlayAudio(e, customCards[customIndex].exampleSentence)}
                        className="text-muted-foreground hover:text-primary shrink-0 p-1"
                        title="Ouvir frase completa"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1">
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
              className="h-10 w-10 rounded-2xl"
              title="Cartão anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 text-xs h-10 rounded-2xl gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>{isFlipped ? "Ver Frente" : "Ver Tradução"}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleCustomMastered}
              className="flex-1 text-xs h-10 rounded-2xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Check className="h-4 w-4" />
              <span>Já Dominei</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleCustomNext}
              className="h-10 w-10 rounded-2xl"
              title="Próximo cartão"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
