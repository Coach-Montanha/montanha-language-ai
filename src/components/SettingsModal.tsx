import React, { useState, useEffect } from "react";
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
import { UserProgress, SupportedLanguage } from "@/types/language";
import { TUTORS, getTutorById, getTutorsByLanguage, getDefaultTutorForLanguage } from "@/data/tutors";
import { SUPPORTED_LANGUAGES, getLanguageById } from "@/data/languages";
import { speakText, stopSpeaking } from "@/services/speech";
import { exportFullBackupData, importFullBackupData } from "@/services/storage";
import { clearAnalysisCache } from "@/services/ai-cache";
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
  Globe,
  Palette,
  Sun,
  GraduationCap,
  Download,
  Upload,
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
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    progress.selectedLanguage || "en"
  );
  const [selectedTutorId, setSelectedTutorId] = useState(
    progress.selectedTutorId || getDefaultTutorForLanguage(progress.selectedLanguage || "en").id
  );
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(progress.fontSize || "md");
  const [design, setDesign] = useState<"classic" | "midnight" | "focus">(
    progress.design ||
      (typeof window !== "undefined"
        ? (localStorage.getItem("smart_language_design") as "classic" | "midnight" | "focus")
        : null) ||
      "classic"
  );

  // Sincroniza o design quando o modal é aberto
  useEffect(() => {
    if (open) {
      setDesign(
        progress.design ||
          (typeof window !== "undefined"
            ? (localStorage.getItem("smart_language_design") as "classic" | "midnight" | "focus")
            : null) ||
          "classic"
      );
    }
  }, [open, progress.design]);

  const currentTutor = getTutorById(selectedTutorId);
  const currentLang = getLanguageById(selectedLanguage);
  const availableTutors = getTutorsByLanguage(selectedLanguage);

  const handleLanguageChange = (langId: SupportedLanguage) => {
    setSelectedLanguage(langId);
    const defTutor = getDefaultTutorForLanguage(langId);
    setSelectedTutorId(defTutor.id);
  };

  const handleDesignChange = (newDesign: "classic" | "midnight" | "focus") => {
    setDesign(newDesign);
    // Aplicação instantânea com preview em tempo real
    document.documentElement.setAttribute("data-design", newDesign);
    if (newDesign === "midnight") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleCancel = () => {
    // Reverte o preview em tempo real para o design salvo anteriormente
    const savedDesign = progress.design || "classic";
    document.documentElement.setAttribute("data-design", savedDesign);
    if (savedDesign === "midnight") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    onOpenChange(false);
  };

  const handleSave = () => {
    const updated: UserProgress = {
      ...progress,
      geminiApiKey: apiKey.trim() ? apiKey.trim() : undefined,
      audioSpeed: speed,
      selectedLanguage,
      selectedTutorId,
      fontSize,
      design,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_language_design", design);
    }
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
      lang: currentLang.speechLangCode,
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
        selectedLanguage: "en",
        selectedTutorId: "leo",
        fontSize: "md",
        design: "classic",
      };
      document.documentElement.setAttribute("data-design", "classic");
      document.documentElement.classList.remove("dark");
      if (typeof window !== "undefined") {
        localStorage.setItem("smart_language_design", "classic");
      }
      onUpdateProgress(reset);
      toast.info("Progresso reiniciado com sucesso.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="max-w-lg w-[94vw] rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Configurações do Smart Language
          </DialogTitle>
          <DialogDescription className="text-xs">
            Escolha o idioma de estudo, seu tutor(a), velocidade de fala e tamanho da fonte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. Escolha do Idioma de Estudo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Idioma de Estudo
              </Label>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {currentLang.name} {currentLang.flag}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.id === selectedLanguage;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`rounded-xl border p-2 text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                        : "border-border bg-card/60 hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{lang.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{lang.nativeName}</p>
                    </div>
                    {isSelected && (
                      <span className="h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] shrink-0">
                        <Check className="h-2 w-2" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Escolha do Tutor / Tutora do Idioma */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Seu Tutor ou Tutora ({currentLang.name})
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {currentTutor.name} ({currentTutor.city} {currentTutor.flag})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableTutors.map((tutor) => {
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

          {/* 3. Estilo Visual & Design (Seletor de Design) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Palette className="h-4 w-4 text-primary" />
                Estilo Visual & Design
              </Label>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {design === "midnight"
                  ? "Midnight Glow (Fintech Void)"
                  : design === "focus"
                  ? "Focus Academy (Edu AI)"
                  : "Clássico (Smart Studio)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Opção 1: Clássico (Smart Studio) */}
              <button
                type="button"
                onClick={() => handleDesignChange("classic")}
                aria-label="Selecionar tema Clássico Smart Studio"
                className={`rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between active:scale-95 min-h-[44px] ${
                  design === "classic"
                    ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-xs font-semibold"
                    : "border-border bg-card/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
                      <Sun className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Clássico</div>
                      <div className="text-[10px] text-muted-foreground">Smart Studio Padrão</div>
                    </div>
                  </div>
                  {design === "classic" && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground font-bold">
                      Ativo
                    </Badge>
                  )}
                </div>

                {/* Mini preview de cores e tags */}
                <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-5 rounded-full bg-[#2563eb]" title="Azul Studio" />
                    <div className="h-3 w-5 rounded-full bg-[#f8fafc] border border-slate-300 dark:border-slate-600" title="Branco Suave" />
                    <div className="h-3 w-5 rounded-full bg-[#10b981]" title="Verde Sucesso" />
                  </div>
                  <span className="text-[9.5px] text-muted-foreground font-medium">Equilibrado</span>
                </div>
              </button>

              {/* Opção 2: Midnight Glow (Fintech Void) */}
              <button
                type="button"
                onClick={() => handleDesignChange("midnight")}
                aria-label="Selecionar tema Midnight Glow"
                className={`rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between active:scale-95 min-h-[44px] ${
                  design === "midnight"
                    ? "border-[#6958e2] bg-[#0d1424] ring-2 ring-[#6958e2]/60 shadow-md shadow-[#6958e2]/20 font-semibold"
                    : "border-border bg-card/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-r from-[#6958e2] to-[#7317d5] flex items-center justify-center text-white shadow-xs shrink-0">
                      <Sparkles className="h-4 w-4 text-amber-200" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        Midnight Glow
                      </div>
                      <div className="text-[10px] text-muted-foreground">Dark Void & Radial</div>
                    </div>
                  </div>
                  {design === "midnight" && (
                    <Badge className="text-[9px] px-1.5 py-0 h-4 bg-gradient-to-r from-[#6958e2] to-[#7317d5] text-white font-bold border-none">
                      Ativo
                    </Badge>
                  )}
                </div>

                {/* Mini preview de cores e tags */}
                <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-5 rounded-full bg-[#050a14] border border-[#171e2c]" title="Ink-Navy Canvas #050a14" />
                    <div className="h-3 w-5 rounded-full bg-gradient-to-r from-[#6958e2] to-[#7317d5]" title="Violet to Magenta CTA" />
                    <div className="h-3 w-5 rounded-full bg-[#3898ec]" title="Cool Blue Accent" />
                  </div>
                  <span className="text-[9.5px] text-muted-foreground font-medium">Vidro Escuro</span>
                </div>
              </button>

              {/* Opção 3: Focus Academy (Educational + AI Native) */}
              <button
                type="button"
                onClick={() => handleDesignChange("focus")}
                aria-label="Selecionar tema Focus Academy"
                className={`rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between active:scale-95 min-h-[44px] ${
                  design === "focus"
                    ? "border-[#4f46e5] bg-[#eef2ff] dark:bg-[#1e1b4b]/50 ring-2 ring-[#4f46e5]/50 shadow-md font-semibold"
                    : "border-border bg-card/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-[#4f46e5] flex items-center justify-center text-white shadow-xs shrink-0">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        Focus Academy
                        <span className="text-[8px] bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-1 rounded font-bold">
                          PRO
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Foco & Gamificação</div>
                    </div>
                  </div>
                  {design === "focus" && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-[#4f46e5] text-white font-bold border-none">
                      Ativo
                    </Badge>
                  )}
                </div>

                {/* Mini preview de cores e tags */}
                <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-5 rounded-full bg-[#4f46e5]" title="Indigo Acadêmico #4f46e5" />
                    <div className="h-3 w-5 rounded-full bg-[#f97316]" title="Laranja Streak #f97316" />
                    <div className="h-3 w-5 rounded-full bg-[#10b981]" title="Verde Sucesso #10b981" />
                  </div>
                  <span className="text-[9.5px] text-muted-foreground font-medium">Claro / Foco</span>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Velocidade da Fala / Comunicação */}
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

          {/* 5. Tamanho da Fonte para Leitura Facilitada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Type className="h-4 w-4 text-primary" />
                Tamanho da Fonte Global (Acessibilidade)
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {fontSize === "sm"
                  ? "Pequena (14px)"
                  : fontSize === "md"
                  ? "Padrão (16px)"
                  : fontSize === "lg"
                  ? "Grande (19px)"
                  : "Extra Grande (22px)"}
              </span>
            </div>
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

          {/* 6. Modo de Inteligência Artificial */}
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
              Todos os tutores dos 6 idiomas contam com correção instantânea e explicação em português, funcionando tanto com o motor embutido quanto com o Google Gemini.
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

          {/* 7. Instalação no Celular (PWA) */}
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
              Instale o <strong>Smart Language</strong> na tela inicial do seu smartphone para praticar conversação diária em tela cheia com áudio nativo.
            </p>
          </div>


          {/* 8. Backup & Portabilidade Local-First */}
          <div className="space-y-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Download className="h-4 w-4 text-violet-500" />
                Backup &amp; Portabilidade
              </label>
              <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                Local-First
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exporte todo seu progresso, cartões, histórico e memória do tutor para um arquivo JSON. Restaure em qualquer dispositivo.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 text-violet-600 dark:text-violet-400 border-violet-300/50 hover:bg-violet-500/10"
                onClick={() => {
                  const json = exportFullBackupData();
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `smart-language-backup-${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Backup exportado com sucesso!");
                }}
              >
                <Download className="h-3.5 w-3.5" /> Exportar Backup
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-300/50 hover:bg-emerald-500/10"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".json,application/json";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const text = ev.target?.result as string;
                      const ok = importFullBackupData(text);
                      if (ok) {
                        toast.success("Backup restaurado! Recarregue a página para ver as mudanças.");
                      } else {
                        toast.error("Falha ao restaurar backup. Verifique o arquivo.");
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
              >
                <Upload className="h-3.5 w-3.5" /> Restaurar Backup
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                clearAnalysisCache();
                toast.success("Cache semântico limpo!");
              }}
            >
              <RotateCcw className="h-3 w-3" /> Limpar Cache de Análises
            </Button>
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
          <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1 sm:flex-none">
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
