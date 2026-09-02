import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorPersona, UserProgress } from "@/types/language";
import { TUTORS, getTutorById } from "@/data/tutors";
import { speakText, stopSpeaking } from "@/services/speech";
import { Volume2, Check, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface TutorSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTutorId?: string | undefined;
  audioSpeed: number;
  onSelectTutor: (tutor: TutorPersona) => void;
}

export const TutorSelectorModal: React.FC<TutorSelectorModalProps> = ({
  open,
  onOpenChange,
  selectedTutorId,
  audioSpeed,
  onSelectTutor,
}) => {
  const currentTutor = getTutorById(selectedTutorId);

  const handleTestVoice = (e: React.MouseEvent, tutor: TutorPersona) => {
    e.stopPropagation();
    stopSpeaking();
    speakText(tutor.samplePhrase, {
      rate: audioSpeed,
      gender: tutor.gender,
      pitch: tutor.speechPitch,
    });
  };

  const handleChoose = (tutor: TutorPersona) => {
    stopSpeaking();
    onSelectTutor(tutor);
    toast.success(`Tutor alterado para ${tutor.name} de ${tutor.city}!`);
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
                Homens e mulheres com estilos próprios. Todos são gentis, pacientes e corrigem até pequenos erros.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Regra de Ouro Compartilhada */}
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
          <HeartHandshake className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="leading-snug">
            <strong>Padrão de Qualidade:</strong> Não importa quem você escolher, seu tutor sempre será educado, acolhedor e apontará qualquer deslize com uma explicação clara em português.
          </p>
        </div>

        {/* Grade de Tutores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {TUTORS.map((tutor) => {
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
