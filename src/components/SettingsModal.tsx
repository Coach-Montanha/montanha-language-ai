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
import { UserProgress } from "@/types/language";
import { speakText } from "@/services/speech";
import { Volume2, Key, RotateCcw, CheckCircle2, Bot } from "lucide-react";
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
  const [speed, setSpeed] = useState(progress.audioSpeed || 1.0);

  const handleSave = () => {
    const updated: UserProgress = {
      ...progress,
      geminiApiKey: apiKey.trim() ? apiKey.trim() : undefined,
      audioSpeed: speed,
    };
    onUpdateProgress(updated);
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const handleTestAudio = () => {
    speakText("Welcome to Smart Language! Your personalized English learning journey.", {
      rate: speed,
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
        audioSpeed: 1.0,
      };
      onUpdateProgress(reset);
      toast.info("Progresso reiniciado com sucesso.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Configurações
          </DialogTitle>
          <DialogDescription className="text-xs">
            Ajuste a velocidade do áudio, voz e o motor de inteligência artificial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Velocidade da Fala */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-primary" />
                Velocidade do Áudio ({speed}x)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestAudio}
                className="h-7 text-xs gap-1"
              >
                <Volume2 className="h-3 w-3" /> Testar Som
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.75, 1.0, 1.25].map((val) => (
                <Button
                  key={val}
                  type="button"
                  size="sm"
                  variant={speed === val ? "default" : "outline"}
                  onClick={() => setSpeed(val)}
                  className="h-8 text-xs font-medium"
                >
                  {val === 0.75 ? "Lenta (0.75x)" : val === 1.0 ? "Normal (1.0x)" : "Rápida (1.25x)"}
                </Button>
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
                {apiKey.trim() ? "Gemini Pro Conectado" : "Motor Inteligente Nativo Ativo"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O app já conta com um <strong>motor inteligente embutido</strong> que corrige gramática na hora, conduz cenários e destrincha frases sem precisar de chaves. Se preferir respostas 100% livres, insira sua API Key do Google Gemini:
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
