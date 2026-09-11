import React, { useState } from "react";
import { SentenceAnalysis, UserProgress, SupportedLanguage } from "@/types/language";
import { breakdownSentence } from "@/services/ai-engine";
import { speakText } from "@/services/speech";
import { addXP, saveCustomFlashcard } from "@/services/storage";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  NotebookPen,
  Sparkles,
  Volume2,
  BookmarkPlus,
  ExternalLink,
  Loader2,
  Split,
} from "lucide-react";
import { toast } from "sonner";

interface SmartScratchpadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onOpenBreakdown?: (text: string) => void;
}

export const SmartScratchpadModal: React.FC<SmartScratchpadModalProps> = ({
  open,
  onOpenChange,
  progress,
  onUpdateProgress,
  onOpenBreakdown,
}) => {
  const activeLang: SupportedLanguage = progress.selectedLanguage || "en";
  const langDef = getLanguageById(activeLang);
  const activeTutors = getTutorsForLanguage(activeLang);
  const activeTutor =
    (progress.selectedTutorId
      ? activeTutors.find((t) => t.id === progress.selectedTutorId)
      : null) ||
    activeTutors[0] ||
    { name: "Tutor", gender: "male" as const, speechPitch: 1.0 };

  const [inputText, setInputText] = useState("");
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    const query = inputText.trim();
    if (!query || isLoading) return;
    setIsLoading(true);
    try {
      const result = await breakdownSentence(query, progress.geminiApiKey, activeLang);
      setAnalysis(result);
      const updated = addXP(5);
      onUpdateProgress({ ...updated });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao analisar o texto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayWord = (word: string) => {
    speakText(word, {
      rate: progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
      pitch: activeTutor.speechPitch,
    });
  };

  const handlePlayPhrase = () => {
    if (!analysis) return;
    speakText(analysis.original, {
      rate: progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
      pitch: activeTutor.speechPitch,
    });
  };

  const handleSaveWordToSRS = (word: string, translation: string, badge: string) => {
    const card = {
      id: `scratchpad_${Date.now()}_${word}`,
      word,
      phonetic: "",
      translation,
      exampleSentence: "",
      exampleTranslation: "",
      theme: badge || "Palavra",
    };
    saveCustomFlashcard(card);
    const updated = addXP(5);
    onUpdateProgress({ ...updated });
    toast.success(`"${word}" salvo nos Cartões SRS! +5 XP`);
  };

  const handleOpenInBreakdown = () => {
    if (!analysis) return;
    onOpenBreakdown?.(analysis.original);
    onOpenChange(false);
    toast.success("Texto enviado para o Destrinchar!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <NotebookPen className="h-4 w-4 text-primary" />
            Prancheta Inteligente
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cole qualquer texto em {langDef.flag} {langDef.name} para análise gramatical instantânea.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Área de texto livre */}
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Cole ou digite texto em ${langDef.name}...`}
            rows={4}
            className="text-xs resize-none rounded-xl bg-background"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isLoading}
              className="flex-1 h-9 text-xs gap-1.5 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isLoading ? "Analisando..." : "Analisar"}
            </Button>
            {analysis && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPhrase}
                  className="h-9 px-3 text-xs gap-1 rounded-xl"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Ouvir
                </Button>
                {onOpenBreakdown && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInBreakdown}
                    className="h-9 px-3 text-xs gap-1 rounded-xl text-primary border-primary/30"
                  >
                    <Split className="h-3.5 w-3.5" />
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Resultado da análise palavra por palavra */}
          {analysis && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Análise Palavra por Palavra
              </span>

              <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-muted/40 border border-border">
                {analysis.tokens.map((token, i) => (
                  <div
                    key={i}
                    className={`group relative flex flex-col items-center gap-0.5 rounded-xl border bg-card text-center transition-all duration-150 ${
                      token.posBadge === "Sinal"
                        ? "p-1 border-transparent self-center"
                        : "p-2 hover:border-primary/60 hover:shadow-xs min-w-[60px]"
                    }`}
                  >
                    {/* Palavra */}
                    <button
                      onClick={() => handlePlayWord(token.word)}
                      className="text-xs font-bold text-foreground hover:text-primary cursor-pointer"
                      title={`Ouvir "${token.word}"`}
                    >
                      {token.word}
                    </button>

                    {/* Badge POS colorido */}
                    {token.posBadge !== "Sinal" && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-medium px-1.5 py-0 border ${token.posColor}`}
                      >
                        {token.posBadge}
                      </Badge>
                    )}

                    {/* Tradução literal */}
                    {token.posBadge !== "Sinal" && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {token.literalTranslation}
                      </span>
                    )}

                    {/* Botão + SRS por palavra */}
                    {token.posBadge !== "Sinal" && (
                      <button
                        onClick={() => handleSaveWordToSRS(token.word, token.literalTranslation, token.posBadge)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                        title={`Salvar "${token.word}" nos Cartões SRS`}
                      >
                        <BookmarkPlus className="h-3 w-3 text-violet-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tradução natural */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Tradução Natural
                </span>
                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  &ldquo;{analysis.naturalTranslation}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
