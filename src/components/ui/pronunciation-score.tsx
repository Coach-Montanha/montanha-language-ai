import React, { useState } from "react";
import { PronunciationEvaluation, WordScore } from "@/services/pronunciation-scorer";
import { speakText, stopSpeaking } from "@/services/speech";
import { Volume2, Sparkles, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PronunciationScoreProps {
  evaluation: PronunciationEvaluation;
  fullSentence: string;
  langCode?: string;
  speechPitch?: number | undefined;
  gender?: "male" | "female" | undefined;
  onRetry?: () => void;
  className?: string;
}

export const PronunciationScore: React.FC<PronunciationScoreProps> = ({
  evaluation,
  fullSentence,
  langCode = "en-US",
  speechPitch,
  gender,
  onRetry,
  className = "",
}) => {
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  const handleWordClick = (wordItem: WordScore) => {
    setActiveWordId(wordItem.id);
    stopSpeaking();
    speakText(wordItem.word, {
      rate: 0.75, // Fala em câmera lenta para melhor percepção
      pitch: speechPitch,
      gender: gender,
      lang: langCode,
      onEnd: () => setActiveWordId(null),
      onError: () => setActiveWordId(null),
    });
  };

  const handleListenFullSlow = () => {
    stopSpeaking();
    speakText(fullSentence, {
      rate: 0.75,
      pitch: speechPitch,
      gender: gender,
      lang: langCode,
    });
  };

  const { overallScore, gradeLabelPt, feedbackPt, words } = evaluation;

  const scoreBadgeColor =
    overallScore >= 85
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : overallScore >= 60
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      {/* Cabeçalho do Score */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avaliador de Pronúncia
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{gradeLabelPt}</span>
            </div>
          </div>
        </div>

        <Badge variant="outline" className={`px-2.5 py-1 text-xs font-bold border ${scoreBadgeColor}`}>
          {overallScore}% de Precisão
        </Badge>
      </div>

      {/* Frase com Palavras Coloridas e Clicáveis */}
      <div className="mb-3.5">
        <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
          <span>Toque em qualquer palavra para ouvir a pronúncia correta em câmera lenta (0.75x):</span>
        </p>

        <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/50">
          {words.map((w) => {
            const isPlayingThis = activeWordId === w.id;

            let tokenStyle =
              "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20";
            let icon = <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />;

            if (w.status === "close") {
              tokenStyle =
                "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20";
              icon = <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />;
            } else if (w.status === "missed") {
              tokenStyle =
                "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20";
              icon = <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />;
            }

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleWordClick(w)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer ${tokenStyle} ${
                  isPlayingThis ? "ring-2 ring-primary ring-offset-1 animate-pulse" : ""
                }`}
                title={`${w.word}: ${w.feedbackPt} (Clique para ouvir 0.75x)`}
              >
                {icon}
                <span>{w.word}</span>
                <Volume2 className="h-2.5 w-2.5 opacity-60 ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Dica Pedagógica e Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1 text-xs">
        <p className="text-muted-foreground leading-relaxed flex-1">
          💡 <span className="font-medium text-foreground">{feedbackPt}</span>
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleListenFullSlow}
            className="flex-1 sm:flex-initial h-8 text-xs font-semibold gap-1.5 cursor-pointer active:scale-95"
            title="Ouvir a frase inteira a 0.75x"
          >
            <span>🐢</span>
            <span>Ouvir 0.75x</span>
          </Button>

          {onRetry && (
            <Button
              size="sm"
              variant="default"
              onClick={onRetry}
              className="flex-1 sm:flex-initial h-8 text-xs font-semibold gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Tentar Novamente</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
