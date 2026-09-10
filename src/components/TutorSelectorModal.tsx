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
import { PillFilter } from "@/components/ui/pill-filter";
import { IconTile } from "@/components/ui/icon-tile";
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

        {/* Filtro por Idioma com ReUI PillFilter */}
        <PillFilter
          options={[
            { id: "all", label: `Todos (${TUTORS.length})` },
            ...SUPPORTED_LANGUAGES.map((lang) => ({
              id: lang.id,
              label: `${lang.flag} ${lang.name}`,
            })),
          ]}
          selectedId={filterLang}
          onSelect={(id) => setFilterLang(id)}
        />

        {/* Regra de Ouro Compartilhada */}
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
          <HeartHandshake className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <strong>Padrão de Qualidade:</strong> Correção instantânea com explicação carinhosa em 1 linha em português.
          </p>
        </div>

        {/* Grade de Tutores com ReUI IconTile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {filteredTutors.map((tutor) => {
            const isSelected = tutor.id === currentTutor.id;

            return (
              <IconTile
                key={tutor.id}
                icon={<span className="text-2xl p-1">{tutor.avatar}</span>}
                title={`${tutor.name} ${tutor.flag}`}
                subtitle={`${tutor.city} • ${tutor.styleTitle}`}
                selected={isSelected}
                onClick={() => handleChoose(tutor)}
                actionSlot={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleTestVoice(e, tutor)}
                    className="h-7 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 rounded-lg shrink-0"
                    title="Ouvir voz e pronúncia"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Ouvir</span>
                  </Button>
                }
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
