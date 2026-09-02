import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorPersona, SupportedLanguage } from "@/types/language";
import { TUTORS, getTutorById } from "@/data/tutors";
import { SUPPORTED_LANGUAGES, getLanguageById } from "@/data/languages";
import { speakText, stopSpeaking } from "@/services/speech";
import { Volume2, Check, Sparkles, HeartHandshake, Globe } from "lucide-react";
import { toast } from "sonner";

interface TutorSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTutorId?: string | undefined;
  audioSpeed: number;
  onSelectTutor: (tutor: TutorPersona) => void;
  currentLanguage?: SupportedLanguage;
}

export const TutorSelectorModal: React.FC<TutorSelectorModalProps> = ({
  open,
  onOpenChange,
  selectedTutorId,
  audioSpeed,
  onSelectTutor,
  currentLanguage,
}) => {
  const currentTutor = getTutorById(selectedTutorId);
  const [filterLang, setFilterLang] = useState<string>(currentLanguage || "all");

  const filteredTutors = TUTORS.filter((t) => {
    if (filterLang === "all") return true;
    return t.language === filterLang;
  });

  const handleTestVoice = (e: React.MouseEvent, tutor: TutorPersona) => {
    e.stopPropagation();
    stopSpeaking();
    const langDef = getLanguageById(tutor.language);
    speakText(tutor.samplePhrase, {
      rate: audioSpeed,
      gender: tutor.gender,
      pitch: tutor.speechPitch,
      lang: langDef.speechLangCode,
    });
  };

  const handleChoose = (tutor: TutorPersona) => {
    stopSpeaking();
    onSelectTutor(tutor);
    toast.success(`Tutor alterado para ${tutor.name} (${tutor.city} ${tutor.flag})!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1.5 pb-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Escolha seu Tutor ou Tutora
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tutores homens e mulheres para cada língua. Todos são gentis, pacientes e corrigem pequenos desvios.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filtro por Idioma */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterLang("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterLang === "all"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({TUTORS.length})
          </button>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setFilterLang(lang.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterLang === lang.id
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>

        {/* Regra de Ouro Compartilhada */}
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
          <HeartHandshake className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="leading-snug">
            <strong>Padrão de Qualidade:</strong> Todos os tutores corrigem até o menor dos erros na hora com explicação carinhosa em 1 linha em português.
          </p>
        </div>

        {/* Grade de Tutores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {filteredTutors.map((tutor) => {
            const isSelected = tutor.id === currentTutor.id;

            return (
              <div
                key={tutor.id}
                onClick={() => handleChoose(tutor)}
                className={`relative rounded-2xl border p-3.5 flex flex-col justify-between text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                    : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="space-y-2">
                  {/* Topo do Card do Tutor */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tutor.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-foreground">{tutor.name}</h4>
                          <span className="text-xs">{tutor.flag}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {tutor.city} &bull; {tutor.gender === "female" ? "Tutora" : "Tutor"}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <Badge className="h-5 px-1.5 text-[9px] bg-primary text-primary-foreground gap-0.5">
                        <Check className="h-3 w-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 px-1.5 text-[9px] text-muted-foreground">
                        Selecionar
                      </Badge>
                    )}
                  </div>

                  {/* Título de Estilo e Descrição */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-primary leading-tight">
                      {tutor.styleTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      {tutor.bioPt}
                    </p>
                  </div>
                </div>

                {/* Rodapé com botão de ouvir voz de exemplo */}
                <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleTestVoice(e, tutor)}
                    className="h-7 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 rounded-lg"
                    title="Ouvir voz e pronúncia"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Ouvir Voz</span>
                  </Button>

                  <span className="text-[10px] text-muted-foreground font-mono">
                    {audioSpeed}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
