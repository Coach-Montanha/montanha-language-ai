import React, { useState } from "react";
import { Flashcard, UserProgress } from "@/types/language";
import { PRESET_THEMES } from "@/data/vocabulary";
import { generateFlashcards } from "@/services/ai-engine";
import { speakText } from "@/services/speech";
import { addXP, saveCustomFlashcard } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [themeInput, setThemeInput] = useState("");
  const [currentTheme, setCurrentTheme] = useState("Viagem");
  const [cards, setCards] = useState<Flashcard[]>(PRESET_THEMES["viagem"] || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const quickThemes = [
    { label: "✈️ Viagem", key: "viagem" },
    { label: "🍔 Comida", key: "comida" },
    { label: "💻 Tecnologia", key: "tecnologia" },
    { label: "💼 Trabalho", key: "trabalho" },
    { label: "❤️ Sentimentos", key: "emocoes" },
  ];

  const handleGenerate = async (targetTheme?: string) => {
    const query = (targetTheme || themeInput).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setIsFlipped(false);
    try {
      const generated = await generateFlashcards(query, progress.geminiApiKey);
      if (generated.length > 0) {
        setCards(generated);
        setCurrentTheme(query);
        setCurrentIndex(0);
        toast.success(`Cartões gerados para o tema: ${query}!`);

        // Salva os cartões gerados
        generated.forEach((card) => saveCustomFlashcard(card));
      } else {
        toast.error("Nenhum cartão gerado para este tema.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar cartões. Tente outro tema.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = cards[currentIndex];

  const handlePlayWordAudio = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    speakText(word, { rate: progress.audioSpeed });
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    const updated = addXP(15);
    onUpdateProgress({
      ...updated,
      cardsMasteredCount: progress.cardsMasteredCount + 1,
    });
    toast.success(`Palavra "${currentCard.word}" dominada! +15 XP`);
    handleNext();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full p-3 space-y-3">
      {/* Formulário de Busca / Geração por Tema */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" /> Cartões de Vocabulário
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {cards.length} cartões no tema
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex gap-1.5"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="Digite qualquer tema (ex: Futebol, Cinema, Medicina)..."
              className="text-xs h-9 pl-9 rounded-xl bg-background"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!themeInput.trim() || isLoading}
            className="h-9 px-3 text-xs gap-1 rounded-xl shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gerar</span>
          </Button>
        </form>

        {/* Atalhos Rápidos de Temas */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickThemes.map((t) => (
            <button
              key={t.key}
              onClick={() => handleGenerate(t.key)}
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

      {/* Cartão de Vocabulário Interativo com Virada 3D */}
      {currentCard ? (
        <div className="flex-1 flex flex-col justify-between py-1">
          {/* Status do carrossel */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1">
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
              Tema: {currentTheme}
            </Badge>
            <span>
              Cartão {currentIndex + 1} de {cards.length}
            </span>
          </div>

          {/* O Cartão (Flip Card) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative flex-1 min-h-[260px] cursor-pointer rounded-3xl border-2 border-border bg-card p-6 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col justify-between select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                <RotateCw className="h-3 w-3" /> Toque para virar
              </span>
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => handlePlayWordAudio(e, currentCard.word)}
                className="h-8 w-8 rounded-full shadow-xs text-primary"
                title="Ouvir palavra"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Conteúdo Frente / Verso */}
            {!isFlipped ? (
              <div className="my-auto text-center space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {currentCard.word}
                </h3>
                <p className="text-sm font-mono text-primary font-semibold">
                  {currentCard.phonetic}
                </p>
                <p className="text-xs text-muted-foreground pt-4">
                  (Toque no cartão para ver a tradução e frase de exemplo)
                </p>
              </div>
            ) : (
              <div className="my-auto text-center space-y-3 animate-in fade-in duration-200">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">Tradução:</span>
                  <h4 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currentCard.translation}
                  </h4>
                </div>

                <div className="rounded-2xl bg-muted/60 p-3.5 text-left space-y-1.5 border border-border/60">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      &ldquo;{currentCard.exampleSentence}&rdquo;
                    </p>
                    <button
                      onClick={(e) => handlePlayWordAudio(e, currentCard.exampleSentence)}
                      className="text-muted-foreground hover:text-primary shrink-0 p-1"
                      title="Ouvir frase completa"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1">
                    {currentCard.exampleTranslation}
                  </p>
                </div>
              </div>
            )}

            {/* Rodapé do cartão */}
            <div className="text-center pt-2 border-t border-border/40">
              <span className="text-[11px] font-medium text-muted-foreground">
                {isFlipped ? "Verso (Português & Exemplo)" : "Frente (Inglês & Fonética)"}
              </span>
            </div>
          </div>

          {/* Controles de Navegação e Aprendizado */}
          <div className="flex items-center justify-between gap-2 pt-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
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
              onClick={handleMarkMastered}
              className="flex-1 text-xs h-10 rounded-2xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Check className="h-4 w-4" />
              <span>Já Dominei</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-10 w-10 rounded-2xl"
              title="Próximo cartão"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
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
    </div>
  );
};
