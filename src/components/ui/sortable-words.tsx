import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw, HelpCircle, Volume2, Sparkles } from "lucide-react";
import { playOptionSelectSound, playSuccessSound, playCorrectionChime } from "@/services/audio-effects";
import { speakText } from "@/services/speech";

export interface SortableWordsProps {
  originalSentence: string;
  tokens: { word: string; posBadge?: string; literalTranslation?: string }[];
  speechLangCode: string;
  speechGender?: ("male" | "female") | undefined;
  speechPitch?: number | undefined;
  onComplete?: (() => void) | undefined;
  className?: string | undefined;
}

interface ScrambleItem {
  id: string;
  word: string;
  correctIndex: number;
}

export const SortableWords: React.FC<SortableWordsProps> = ({
  originalSentence,
  tokens,
  speechLangCode,
  speechGender = "male",
  speechPitch = 1.0,
  onComplete,
  className,
}) => {
  // Filtra sinais de pontuação para o banco de palavras móveis, mantendo apenas palavras reais
  const wordTokens = React.useMemo(() => {
    return tokens.filter((t) => !/^[.,!?;:«»"—"()¿¡]$/.test(t.word));
  }, [tokens]);

  const [availableWords, setAvailableWords] = useState<ScrambleItem[]>([]);
  const [placedWords, setPlacedWords] = useState<ScrambleItem[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Inicializa e embaralha as palavras
  const initGame = React.useCallback(() => {
    const items: ScrambleItem[] = wordTokens.map((t, index) => ({
      id: `${t.word}-${index}-${Math.random()}`,
      word: t.word,
      correctIndex: index,
    }));

    // Embaralha com Fisher-Yates garantindo que não fique idêntico ao original
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setPlacedWords([]);
    setIsSuccess(false);
    setHasError(false);
  }, [wordTokens]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleWordClick = (item: ScrambleItem) => {
    if (isSuccess) return;
    playOptionSelectSound();
    setHasError(false);

    // Remove do banco de palavras disponíveis e adiciona às colocadas
    setAvailableWords((prev) => prev.filter((w) => w.id !== item.id));
    const nextPlaced = [...placedWords, item];
    setPlacedWords(nextPlaced);

    // Toca o áudio da palavra individual colocada para reforço auditivo
    speakText(item.word, {
      lang: speechLangCode,
      gender: speechGender,
      pitch: speechPitch,
    });

    // Se preencheu todos os slots, verifica automaticamente
    if (nextPlaced.length === wordTokens.length) {
      checkResult(nextPlaced);
    }
  };

  const handleRemovePlaced = (item: ScrambleItem) => {
    if (isSuccess) return;
    playOptionSelectSound();
    setHasError(false);

    setPlacedWords((prev) => prev.filter((w) => w.id !== item.id));
    setAvailableWords((prev) => [...prev, item]);
  };

  const checkResult = (placed: ScrambleItem[]) => {
    const isCorrectOrder = placed.every((p, idx) => p.correctIndex === idx);

    if (isCorrectOrder) {
      setIsSuccess(true);
      setHasError(false);
      playSuccessSound();
      // Toca a frase completa na voz nativa
      speakText(originalSentence, {
        lang: speechLangCode,
        gender: speechGender,
        pitch: speechPitch,
      });
      onComplete?.();
    } else {
      setHasError(true);
      playCorrectionChime();
    }
  };

  const handleHint = () => {
    if (isSuccess) return;
    const nextCorrectIndex = placedWords.length;
    if (nextCorrectIndex >= wordTokens.length) return;

    // Encontra a palavra correta para a próxima posição
    const needed = availableWords.find((w) => w.correctIndex === nextCorrectIndex);
    if (needed) {
      handleWordClick(needed);
    }
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 space-y-3.5 shadow-xs", className)}>
      {/* Cabeçalho do Desafio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs font-bold text-foreground">
            Desafio: Ordene as Palavras
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleHint}
            disabled={isSuccess || availableWords.length === 0}
            className="h-7 text-[11px] px-2 gap-1 text-primary hover:bg-primary/10"
            title="Preencher próxima palavra"
          >
            <HelpCircle className="h-3 w-3" /> Dica
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={initGame}
            className="h-7 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
            title="Reiniciar ordem"
          >
            <RotateCcw className="h-3 w-3" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Área dos Slots (Frase sendo montada) */}
      <div
        className={cn(
          "min-h-[58px] p-2.5 rounded-xl border border-dashed transition-all flex flex-wrap gap-1.5 items-center",
          isSuccess
            ? "border-emerald-500/60 bg-emerald-500/10 shadow-xs ring-2 ring-emerald-500/20"
            : hasError
            ? "border-rose-500/60 bg-rose-500/5 animate-shake"
            : placedWords.length === 0
            ? "border-muted-foreground/30 bg-muted/20 justify-center"
            : "border-primary/40 bg-background"
        )}
      >
        {placedWords.length === 0 ? (
          <span className="text-[11px] text-muted-foreground italic select-none">
            Toque nas palavras abaixo na ordem correta...
          </span>
        ) : (
          placedWords.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleRemovePlaced(item)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs select-none cursor-pointer flex items-center gap-1 group",
                isSuccess
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-95"
              )}
            >
              <span>{item.word}</span>
              {!isSuccess && (
                <span className="text-[9px] opacity-70 group-hover:opacity-100">
                  &times;
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Feedback de Conclusão */}
      {isSuccess && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ordem correta! +15 XP</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              speakText(originalSentence, {
                lang: speechLangCode,
                gender: speechGender,
                pitch: speechPitch,
              })
            }
            className="h-6 text-[10px] px-2 gap-1 rounded-md"
          >
            <Volume2 className="h-3 w-3" /> Ouvir Completa
          </Button>
        </div>
      )}

      {/* Banco de Palavras Disponíveis (Embaralhadas) */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Banco de Vocábulos:
        </span>
        <div className="flex flex-wrap gap-1.5 p-1">
          {availableWords.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleWordClick(item)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background hover:border-primary/60 hover:bg-primary/5 active:scale-95 text-xs font-semibold text-foreground transition-all select-none cursor-pointer shadow-2xs"
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
