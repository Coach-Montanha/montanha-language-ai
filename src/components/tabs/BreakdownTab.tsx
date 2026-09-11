import React, { useState, useEffect } from "react";
import { SentenceAnalysis, UserProgress, WordToken, SupportedLanguage } from "@/types/language";
import { getBreakdownPhrasesForLanguage } from "@/data/vocabulary";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import { breakdownSentence } from "@/services/ai-engine";
import { speakText } from "@/services/speech";
import { addXP, saveCustomFlashcard } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Split,
  Sparkles,
  Volume2,
  CheckCircle2,
  Lightbulb,
  Puzzle,
  BookmarkPlus,
} from "lucide-react";
import { SortableWords } from "@/components/ui/sortable-words";
import { Rating } from "@/components/ui/rating";
import { PillFilter } from "@/components/ui/pill-filter";
import { toast } from "sonner";

interface BreakdownTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const BreakdownTab: React.FC<BreakdownTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const activeLang: SupportedLanguage = progress.selectedLanguage || "en";
  const langDef = getLanguageById(activeLang);
  const activeTutors = getTutorsForLanguage(activeLang);
  const activeTutor =
    (progress.selectedTutorId ? activeTutors.find((t) => t.id === progress.selectedTutorId) : null) ||
    activeTutors[0] ||
    { name: "Tutor", gender: "male" as const, speechPitch: 1.0 };

  const samplePhrases = getBreakdownPhrasesForLanguage(activeLang);
  const [inputSentence, setInputSentence] = useState(samplePhrases[0] || "");
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToken, setActiveToken] = useState<WordToken | null>(null);
  const [activeMode, setActiveMode] = useState<"analysis" | "challenge">("analysis");
  const [difficultyRating, setDifficultyRating] = useState<number>(3);

  // Sincroniza exemplos e frase inicial quando o idioma é alterado
  useEffect(() => {
    const samples = getBreakdownPhrasesForLanguage(activeLang);
    setInputSentence(samples[0] || "");
    setAnalysis(null);
    setActiveToken(null);
  }, [activeLang]);

  // Recebe texto da Prancheta Inteligente via CustomEvent
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string }>).detail;
      if (detail?.text) {
        setInputSentence(detail.text);
        setAnalysis(null);
        setActiveToken(null);
        handleAnalyze(detail.text);
      }
    };
    window.addEventListener("smart-language-breakdown", handler);
    return () => window.removeEventListener("smart-language-breakdown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang, progress.geminiApiKey]);

  const handleAnalyze = async (textToUse?: string) => {
    const query = (textToUse || inputSentence).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    try {
      const result = await breakdownSentence(query, progress.geminiApiKey, activeLang);
      setAnalysis(result);
      setActiveToken(null);

      // Concede XP
      const updated = addXP(10);
      onUpdateProgress({
        ...updated,
        phrasesAnalyzedCount: progress.phrasesAnalyzedCount + 1,
      });

      toast.success(`Frase em ${langDef.name} destrinchada com sucesso!`);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao analisar a frase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (text: string, rate: number = progress.audioSpeed) => {
    speakText(text, {
      rate,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
      pitch: activeTutor.speechPitch,
    });
  };

  const handleSelectSample = (sample: string) => {
    setInputSentence(sample);
    handleAnalyze(sample);
  };

  const handleSaveWordToSRS = (token: WordToken) => {
    const card = {
      id: `breakdown_${Date.now()}_${token.word}`,
      front: token.word,
      back: token.literalTranslation,
      language: activeLang,
      category: token.posBadge || "Palavra",
    };
    saveCustomFlashcard(card);
    const updated = addXP(5);
    onUpdateProgress({ ...updated });
    toast.success(`"${token.word}" salvo nos Cartões SRS! +5 XP`);
  };

  const handleSavePhraseToSRS = (phrase: string, translation: string) => {
    const card = {
      id: `breakdown_phrase_${Date.now()}`,
      front: phrase,
      back: translation,
      language: activeLang,
      category: "Frase",
    };
    saveCustomFlashcard(card);
    const updated = addXP(10);
    onUpdateProgress({ ...updated });
    toast.success("Frase salva nos Cartões SRS! +10 XP");
  };

  const samplePillOptions = samplePhrases.slice(0, 6).map((s) => ({
    id: s,
    label: s.length > 28 ? s.slice(0, 26) + "..." : s,
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full p-3 space-y-3 overflow-y-auto">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Split className="h-4 w-4 text-primary" /> Destrinchar Frase • {langDef.flag} {langDef.name}
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Cole qualquer frase em {langDef.name} para analisar a classe gramatical e a tradução de cada palavra.
        </p>
      </div>

      {/* Entrada da Frase */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-2.5 shadow-xs">
        <Textarea
          value={inputSentence}
          onChange={(e) => setInputSentence(e.target.value)}
          placeholder={`Cole ou digite uma frase em ${langDef.name} aqui...`}
          rows={2}
          className="text-xs resize-none bg-background rounded-xl p-2.5"
        />

        <div className="flex items-center justify-between gap-2">
          {/* Frases rápidas para testar */}
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Exemplos rápidos em {langDef.name}
          </span>

          <Button
            size="sm"
            onClick={() => handleAnalyze()}
            disabled={!inputSentence.trim() || isLoading}
            className="h-8 px-3 text-xs gap-1.5 rounded-xl shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Destrinchar</span>
          </Button>
        </div>

        {/* ReUI PillFilter de frases de exemplo */}
        <PillFilter
          options={samplePillOptions}
          selectedId={inputSentence}
          onSelect={(s) => handleSelectSample(s)}
        />
      </div>

      {/* Exibição do Resultado da Análise */}
      {analysis && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Seletor de Modo: Análise Morfológica vs Desafio de Montar */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveMode("analysis")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === "analysis"
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Análise Palavra por Palavra</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("challenge")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === "challenge"
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Puzzle className="h-3.5 w-3.5 text-amber-500" />
              <span>Desafio de Montar</span>
            </button>
          </div>

          {activeMode === "challenge" ? (
            /* Modo 2: Desafio Gamificado ReUI SortableWords */
            <SortableWords
              originalSentence={analysis.original}
              tokens={analysis.tokens}
              speechLangCode={langDef.speechLangCode}
              speechGender={activeTutor.gender}
              speechPitch={activeTutor.speechPitch}
              onComplete={() => {
                const updated = addXP(15);
                onUpdateProgress({
                  ...progress,
                  ...updated,
                  phrasesAnalyzedCount: progress.phrasesAnalyzedCount + 1,
                });
                toast.success("🏆 Desafio vencido! +15 XP garantidos!");
              }}
            />
          ) : (
            /* Modo 1: Análise Morfológica Completa */
            <>
              {/* Áudio da Frase Completa */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Ouvir Frase:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlayAudio(analysis.original, progress.audioSpeed)}
                    className="h-7 text-xs gap-1 rounded-lg"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Normal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlayAudio(analysis.original, 0.75)}
                    className="h-7 text-xs gap-1 rounded-lg"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Lenta (0.75x)
                  </Button>
                </div>
              </div>

              {/* PALAVRA POR PALAVRA (Tokens) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Estrutura Palavra por Palavra
                </span>

                <div className="flex flex-wrap gap-2 p-1">
                  {analysis.tokens.map((token, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveToken(token);
                        handlePlayAudio(token.word);
                      }}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all duration-150 ${
                        token.posBadge === "Sinal"
                          ? "p-1 border-transparent self-center"
                          : "bg-card hover:border-primary/60 hover:shadow-xs min-w-[65px]"
                      }`}
                    >
                      {/* Palavra no idioma de estudo */}
                      <span className="text-xs font-bold text-foreground group-hover:text-primary">
                        {token.word}
                      </span>

                      {/* Badge da Função Gramatical */}
                      {token.posBadge !== "Sinal" && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-medium mt-1 px-1.5 py-0 border ${token.posColor}`}
                        >
                          {token.posBadge}
                        </Badge>
                      )}

                      {/* Tradução Literal */}
                      <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {token.literalTranslation}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalhe da palavra clicada */}
              {activeToken && activeToken.posBadge !== "Sinal" && (
                <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-1 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {activeToken.word} &bull; <span className="text-primary">{activeToken.partOfSpeech}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlayAudio(activeToken.word)}
                      className="h-6 text-[10px] gap-1 text-primary"
                    >
                      <Volume2 className="h-3 w-3" /> Ouvir
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tradução literal: <strong className="text-foreground">{activeToken.literalTranslation}</strong>
                  </p>
                  {activeToken.note && (
                    <p className="text-[10px] text-muted-foreground italic">
                      Nota: {activeToken.note}
                    </p>
                  )}
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveWordToSRS(activeToken)}
                      className="h-6 text-[10px] gap-1 text-violet-600 dark:text-violet-400 border-violet-300/50 hover:bg-violet-500/10"
                    >
                      <BookmarkPlus className="h-3 w-3" /> + Cartão SRS
                    </Button>
                  </div>
                </div>
              )}

              {/* TRADUÇÃO NATURAL & FLUIDA */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Tradução Natural &amp; Fluida</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSavePhraseToSRS(analysis.original, analysis.naturalTranslation)}
                    className="h-6 text-[10px] gap-1 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                  >
                    <BookmarkPlus className="h-3 w-3" /> + Cartão SRS
                  </Button>
                </div>
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  &ldquo;{analysis.naturalTranslation}&rdquo;
                </p>
              </div>

              {/* Dica Gramatical da Frase */}
              <div className="rounded-2xl border border-border bg-card p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-muted-foreground text-[11px]">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>Dica de Construção da Frase ({langDef.name})</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {analysis.explanation}
                </p>
              </div>

              {/* Avaliação de Dificuldade com ReUI Rating */}
              <div className="rounded-2xl border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Avaliar Dificuldade da Frase
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Ajuda o algoritmo a calibrar próximas frases
                  </span>
                </div>
                <Rating
                  variant="stars"
                  value={difficultyRating}
                  onValueChange={(val) => {
                    setDifficultyRating(val);
                    toast.success("Dificuldade avaliada com sucesso!");
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
