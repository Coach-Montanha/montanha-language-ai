import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PillFilter } from "@/components/ui/pill-filter";
import { SupportedLanguage } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage, getDefaultTutorForLanguage } from "@/data/tutors";
import {
  TRAVEL_CATEGORIES,
  TravelCategory,
  getTravelPhrasesForLanguage,
  TravelPhrase,
} from "@/data/travel-pack";
import { speakText, stopSpeaking } from "@/services/speech";
import {
  Volume2,
  Search,
  Copy,
  Check,
  Compass,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

interface TravelPackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: SupportedLanguage;
}

export const TravelPackModal: React.FC<TravelPackModalProps> = ({
  open,
  onOpenChange,
  language,
}) => {
  const langDef = getLanguageById(language);
  const activeTutors = getTutorsForLanguage(language);
  const activeTutor = activeTutors[0] || getDefaultTutorForLanguage(language);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const phrases = useMemo(() => {
    return getTravelPhrasesForLanguage(language, selectedCategory as TravelCategory | "all");
  }, [language, selectedCategory]);

  const filteredPhrases = useMemo(() => {
    if (!searchQuery.trim()) return phrases;
    const q = searchQuery.toLowerCase();
    return phrases.filter(
      (p) =>
        p.original.toLowerCase().includes(q) ||
        p.translationPt.toLowerCase().includes(q) ||
        p.phoneticPt.toLowerCase().includes(q)
    );
  }, [phrases, searchQuery]);

  const handlePlayAudio = (phrase: TravelPhrase, slow: boolean = false) => {
    stopSpeaking();
    setPlayingId(phrase.id);
    speakText(phrase.original, {
      rate: slow ? 0.75 : 1.0,
      pitch: activeTutor.speechPitch,
      gender: activeTutor.gender,
      lang: langDef.speechLangCode,
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  };

  const handleCopy = (phrase: TravelPhrase) => {
    navigator.clipboard.writeText(phrase.original);
    setCopiedId(phrase.id);
    toast.success("Frase copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-4 sm:p-6 max-h-[88vh] flex flex-col">
        <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">
                🧳
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <span>Guia de Viagem & Sobrevivência</span>
                  <span className="text-xs">{langDef.flag}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Frases essenciais com pronúncia fonética e áudio offline
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 shrink-0"
            >
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </Badge>
          </div>
        </DialogHeader>

        {/* Barra de Busca e Categorias */}
        <div className="space-y-2.5 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em português ou no idioma (ex: bagagem, conta, médico)..."
              className="pl-9 h-9 text-xs rounded-xl bg-muted/40 border-border/70"
            />
          </div>

          <PillFilter
            options={TRAVEL_CATEGORIES}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
            size="sm"
          />
        </div>

        {/* Lista de Frases */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pt-2 my-1">
          {filteredPhrases.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Nenhuma frase encontrada para &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredPhrases.map((phrase) => {
              const isPlayingThis = playingId === phrase.id;

              return (
                <div
                  key={phrase.id}
                  className="p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground leading-snug select-text">
                      {phrase.original}
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground active:scale-95"
                        onClick={() => handleCopy(phrase)}
                        title="Copiar frase"
                      >
                        {copiedId === phrase.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      <Button
                        size="icon"
                        variant={isPlayingThis ? "default" : "secondary"}
                        className="h-7 w-7 rounded-lg active:scale-95"
                        onClick={() => handlePlayAudio(phrase, false)}
                        title="Ouvir pronúncia normal"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-1.5 text-[10px] font-semibold gap-0.5 rounded-lg active:scale-95"
                        onClick={() => handlePlayAudio(phrase, true)}
                        title="Ouvir em câmera lenta (0.75x)"
                      >
                        <span>🐢</span>
                        <span>0.75x</span>
                      </Button>
                    </div>
                  </div>

                  {/* Fonética em Português */}
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    [ {phrase.phoneticPt} ]
                  </p>

                  {/* Tradução e Dica de Viagem */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                    <span className="text-muted-foreground font-medium select-text">
                      {phrase.translationPt}
                    </span>
                    {phrase.tipPt && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold hidden sm:inline truncate max-w-[200px]">
                        💡 {phrase.tipPt}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs"
          >
            Fechar Guia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
