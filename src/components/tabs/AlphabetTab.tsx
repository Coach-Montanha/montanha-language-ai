import React, { useState } from "react";
import { ALPHABET_DATA, SPECIAL_SOUNDS } from "@/data/alphabet";
import { AlphabetItem, UserProgress } from "@/types/language";
import { speakText } from "@/services/speech";
import { addXP } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

interface AlphabetTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const AlphabetTab: React.FC<AlphabetTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [filter, setFilter] = useState<"all" | "vowel" | "consonant" | "sound">("all");
  const [selectedItem, setSelectedItem] = useState<AlphabetItem | null>(null);

  const allItems = [...ALPHABET_DATA, ...SPECIAL_SOUNDS];

  const filteredItems = allItems.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const handlePlayAudio = (text: string) => {
    speakText(text, { rate: progress.audioSpeed });
  };

  const handleSelectItem = (item: AlphabetItem) => {
    setSelectedItem(item);
    // Toca o áudio da letra/som imediatamente ao clicar
    const audioText = item.category === "sound" ? item.exampleWord : item.letter.split(" ")[0] || item.letter;
    handlePlayAudio(audioText);

    // Dá XP de descoberta
    const updated = addXP(2);
    onUpdateProgress(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full p-3 space-y-3">
      {/* Cabeçalho explicativo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" /> Alfabeto & Sons do Inglês
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Toque em qualquer letra ou som para ouvir e ver a pronúncia escrita.
          </p>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/60 rounded-xl">
        {[
          { id: "all", label: "Todas (32)" },
          { id: "vowel", label: "Vogais" },
          { id: "consonant", label: "Consoantes" },
          { id: "sound", label: "Sons Chave" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
              filter === tab.id
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid de Letras e Sons */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filteredItems.map((item) => {
            const isSound = item.category === "sound";
            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:shadow-sm transition-all duration-150 text-center"
              >
                <div className="w-full flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono text-primary font-bold">{item.phoneticIpa}</span>
                  <Volume2 className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
                </div>

                <div className="my-1">
                  <span
                    className={`font-extrabold tracking-tight ${
                      isSound ? "text-sm text-purple-600 dark:text-purple-400" : "text-xl text-foreground"
                    }`}
                  >
                    {item.letter}
                  </span>
                </div>

                <div className="w-full pt-1 border-t border-border/40">
                  <p className="text-[10px] font-medium text-muted-foreground truncate">
                    Som: <strong className="text-foreground">{item.phoneticPt}</strong>
                  </p>
                  <p className="text-[9px] text-primary/80 truncate">
                    Ex: {item.exampleWord.split(" ")[0]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhe da Letra Selecionada (Drawer / Card Inferior Fixo) */}
      {selectedItem && (
        <div className="rounded-2xl border-2 border-primary/40 bg-card p-4 shadow-lg space-y-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-black">
                {selectedItem.letter.split(" ")[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {selectedItem.letter}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                    {selectedItem.phoneticIpa}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pronúncia aproximada: <strong className="text-foreground">{selectedItem.phoneticPt}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedItem(null)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-xl bg-muted/50 p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="text-foreground font-medium flex items-center gap-1.5">
                <span>Exemplo:</span>
                <strong className="text-primary text-sm">{selectedItem.exampleWord}</strong>
                <span className="text-muted-foreground">({selectedItem.exampleTranslation})</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handlePlayAudio(selectedItem.exampleWord)}
                className="h-7 text-xs gap-1 rounded-lg"
              >
                <Volume2 className="h-3.5 w-3.5" /> Ouvir Exemplo
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
              💡 {selectedItem.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
