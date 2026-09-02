import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserProgress } from "@/types/language";
import { TUTORS, getTutorById } from "@/data/tutors";
import { speakText, stopSpeaking } from "@/services/speech";
import {
  Volume2,
  Key,
  RotateCcw,
  CheckCircle2,
  Bot,
  Smartphone,
  Sparkles,
  Gauge,
  Check,
  Type,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  progress,
  onUpdateProgress,
}) => {
  const [apiKey, setApiKey] = useState(progress.geminiApiKey || "");
  const [speed, setSpeed] = useState(progress.audioSpeed || 0.85);
  const [selectedTutorId, setSelectedTutorId] = useState(progress.selectedTutorId || "leo");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(progress.fontSize || "md");

  const currentTutor = getTutorById(selectedTutorId);

  const handleSave = () => {
    const updated: UserProgress = {
      ...progress,
      geminiApiKey: apiKey.trim() ? apiKey.trim() : undefined,
      audioSpeed: speed,
      selectedTutorId,
      fontSize,
    };
    onUpdateProgress(updated);
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const handleTestAudio = () => {
    stopSpeaking();
    speakText(currentTutor.samplePhrase, {
      rate: speed,
      gender: currentTutor.gender,
      pitch: currentTutor.speechPitch,
    });
  };

  const handleResetProgress = () => {
    if (confirm("Tem certeza que deseja zerar seu progresso e histórico?")) {
      const reset: UserProgress = {
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split("T")[0] || "",
        xp: 0,
        cardsMasteredCount: 0,
        phrasesAnalyzedCount: 0,
        messagesSentCount: 0,
        dailySprintDone: false,
        audioSpeed: 0.85,
        selectedTutorId: "leo",
      };
      onUpdateProgress(reset);
      toast.info("Progresso reiniciado com sucesso.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Configurações do Smart Language
          </DialogTitle>
          <DialogDescription className="text-xs">
            Escolha seu tutor(a), controle a velocidade de fala e ajuste a inteligência artificial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Escolha do Tutor / Tutora */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Seu Tutor ou Tutora
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {currentTutor.name} ({currentTutor.city} {currentTutor.flag})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TUTORS.map((tutor) => {
                const isSelected = tutor.id === selectedTutorId;
                return (
                  <button
                    key={tutor.id}
                    type="button"
                    onClick={() => setSelectedTutorId(tutor.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                        : "border-border bg-card/60 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{tutor.avatar}</span>
                        <div>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1">
                            {tutor.name}
                            <span className="text-[10px]">{tutor.flag}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {tutor.gender === "female" ? "Tutora" : "Tutor"} &bull; {tutor.city}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">
                      {tutor.styleTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Velocidade da Fala / Comunicação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-primary" />
                Velocidade da Fala ({speed}x)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestAudio}
                className="h-7 text-xs gap-1"
                title="Testar voz do tutor na velocidade selecionada"
              >
                <Volume2 className="h-3 w-3" /> Testar Voz
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se você acha que eles falam rápido demais, escolha a velocidade <strong>0.7x (Lenta)</strong> ou <strong>0.85x (Confortável)</strong>:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { val: 0.7, label: "🐢 0.7x Lenta", desc: "Bem pausada" },
                { val: 0.85, label: "🎧 0.85x Confortável", desc: "Ritmo ideal" },
                { val: 1.0, label: "🗣️ 1.0x Normal", desc: "Nativa" },
                { val: 1.2, label: "🚀 1.2x Rápida", desc: "Desafio" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSpeed(item.val)}
                  className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    speed === item.val
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border-border bg-card/60 text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div>{item.label}</div>
                  <div
                    className={`text-[9px] mt-0.5 ${
                      speed === item.val ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho da Fonte para Leitura Facilitada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Type className="h-4 w-4 text-primary" />
                Tamanho da Fonte (Leitura)
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {fontSize === "sm"
                  ? "Pequena (13px)"
                  : fontSize === "md"
                  ? "Padrão (15px)"
                  : fontSize === "lg"
                  ? "Grande (17px)"
                  : "Extra Grande (19px)"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ajuste para facilitar a leitura das mensagens, fonética e tradução:
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: "sm", label: "P", desc: "Pequena" },
                { val: "md", label: "M", desc: "Padrão" },
                { val: "lg", label: "G", desc: "Grande" },
                { val: "xl", label: "GG", desc: "Muito Grande" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setFontSize(item.val as "sm" | "md" | "lg" | "xl")}
                  className={`py-2 px-1 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    fontSize === item.val
                      ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border-border bg-card/60 text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div
                    className={`text-[9px] mt-0.5 ${
                      fontSize === item.val ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Modo de Inteligência Artificial */}
          <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-emerald-500" />
                Motor de IA
              </Label>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {apiKey.trim() ? "Gemini Conectado" : "Motor Inteligente Nativo"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todos os tutores contam com correção instantânea em português, conduzem cenários e corrigem até os menores erros tanto com o motor embutido quanto com o Google Gemini.
            </p>
            <div className="relative mt-2">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Cole sua Gemini API Key (opcional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Instalação no Celular (PWA) */}
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Smartphone className="h-4 w-4 text-primary" />
                Instalar no Celular (PWA)
              </Label>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                App Nativo
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você pode instalar o <strong>Smart Language</strong> na tela inicial do seu celular (iPhone ou Android) para usar em tela cheia com treino de 5 minutos diário.
            </p>
          </div>

          {/* Zerar progresso */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quer recomeçar do zero?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProgress}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Zerar Progresso
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} className="flex-1 sm:flex-none">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
