import React, { useState, useRef, useEffect } from "react";
import {
  Scenario,
  ChatMessage,
  UserProgress,
  WeeklyMission,
  ScriptSuggestion,
  DialogueScriptLine,
  SupportedLanguage,
} from "@/types/language";
import {
  getMissionsByWeek,
  getAvailableWeeksForLanguage,
  getMissionsForLanguage,
  missionToScenario,
} from "@/data/missions";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";
import { generateProceduralWeek } from "@/services/procedural-missions";
import { scenarioChat, generatePhoneticGuide } from "@/services/ai-engine";
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/services/speech";
import { addXP } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Tag,
  Compass,
  Building2,
  Briefcase,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  ShieldAlert,
  TrendingUp,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  BookOpen,
  X,
  Play,
  Layers,
  Sparkle,
  Headphones,
  Luggage,
} from "lucide-react";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { Rating } from "@/components/ui/rating";
import { toast } from "sonner";
import { soundscape, SoundscapeType } from "@/services/soundscape-audio";

interface ScenarioTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  selectedMission?: WeeklyMission | null;
  onOpenTravelPack?: (() => void) | undefined;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  Tag,
  Compass,
  Building2,
  Briefcase,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  ShieldAlert,
  TrendingUp,
  BookOpen,
};

export const ScenarioTab: React.FC<ScenarioTabProps> = ({
  progress,
  onUpdateProgress,
  selectedMission,
  onOpenTravelPack,
}) => {
  const currentLanguage: SupportedLanguage = progress.selectedLanguage || "en";
  const langDef = getLanguageById(currentLanguage);
  const tutors = getTutorsForLanguage(currentLanguage);
  const activeTutor = tutors[0] || { name: "Tutor", gender: "male" };

  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType | null>(null);

  useEffect(() => {
    return () => {
      soundscape.stop();
    };
  }, []);

  const handleToggleSoundscape = (type: SoundscapeType) => {
    if (activeSoundscape === type) {
      soundscape.stop();
      setActiveSoundscape(null);
      toast.info("Áudio ambiente desativado");
    } else {
      soundscape.start(type, 0.2);
      setActiveSoundscape(type);
      const names: Record<SoundscapeType, string> = {
        cafe: "Café movimentado ☕",
        airport: "Aeroporto internacional ✈️",
        rain: "Chuva na janela 🌧️",
        office: "Escritório & Coworking 💼",
      };
      toast.success(`Áudio imersivo ativado: ${names[type]}`);
    }
  };

  const availableWeeks = getAvailableWeeksForLanguage(
    currentLanguage,
    progress.customMissions
  );

  const initialWeek = selectedMission
    ? selectedMission.week
    : progress.currentWeek && availableWeeks.includes(progress.currentWeek)
    ? progress.currentWeek
    : availableWeeks[0] || 1;

  const [activeWeek, setActiveWeek] = useState<number>(initialWeek);

  // Missão ativa inicial
  const missionsForWeek = getMissionsByWeek(
    activeWeek,
    currentLanguage,
    progress.customMissions
  );

  const initialMission =
    selectedMission ||
    missionsForWeek[0] ||
    getMissionsForLanguage(currentLanguage, progress.customMissions)[0]!;

  const [activeMission, setActiveMission] = useState<WeeklyMission>(initialMission);
  const [activeScenario, setActiveScenario] = useState<Scenario>(
    missionToScenario(initialMission)
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sc-init",
      sender: "tutor",
      text: initialMission.openingAiDialogue,
      phonetic: initialMission.openingAiPhonetic,
      translationPt: initialMission.openingAiPortuguese,
      timestamp: Date.now(),
    },
  ]);

  const [structuredSuggestions, setStructuredSuggestions] = useState<ScriptSuggestion[]>(
    initialMission.structuredSuggestions || []
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [scenarioRating, setScenarioRating] = useState<number>(5);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Se o idioma for alterado no cabeçalho ou por fora
  useEffect(() => {
    const langWeeks = getAvailableWeeksForLanguage(
      currentLanguage,
      progress.customMissions
    );
    const targetW = langWeeks[0] || 1;
    setActiveWeek(targetW);

    const weekMissions = getMissionsByWeek(
      targetW,
      currentLanguage,
      progress.customMissions
    );
    const firstOfLang =
      weekMissions[0] ||
      getMissionsForLanguage(currentLanguage, progress.customMissions)[0];

    if (firstOfLang) {
      handleSelectMission(firstOfLang);
    }
  }, [currentLanguage]);

  // Se uma missão específica foi passada como prop
  useEffect(() => {
    if (selectedMission) {
      setActiveWeek(selectedMission.week);
      handleSelectMission(selectedMission);
    }
  }, [selectedMission]);

  const handleSelectWeek = (week: number) => {
    setActiveWeek(week);
    const missions = getMissionsByWeek(
      week,
      currentLanguage,
      progress.customMissions
    );
    if (missions.length > 0) {
      handleSelectMission(missions[0]!);
    }
  };

  const handleSelectMission = (mission: WeeklyMission) => {
    setActiveMission(mission);
    const sc = missionToScenario(mission);
    setActiveScenario(sc);
    setMessages([
      {
        id: `sc-init-${Date.now()}`,
        sender: "tutor",
        text: mission.openingAiDialogue,
        phonetic: mission.openingAiPhonetic,
        translationPt: mission.openingAiPortuguese,
        timestamp: Date.now(),
      },
    ]);
    setStructuredSuggestions(mission.structuredSuggestions || []);
    speakText(mission.openingAiDialogue, {
      rate: progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
    });
  };

  // Gerador procedural de mais semanas com 1 clique
  const handleCreateMoreWeeks = () => {
    const currentWeeks = getAvailableWeeksForLanguage(
      currentLanguage,
      progress.customMissions
    );
    const maxWeek = Math.max(...currentWeeks, 3);
    const nextWeekNumber = maxWeek + 1;

    try {
      const generatedMissions = generateProceduralWeek(
        currentLanguage,
        nextWeekNumber
      );

      const updatedCustom = [
        ...(progress.customMissions || []),
        ...generatedMissions,
      ];

      onUpdateProgress({
        ...progress,
        customMissions: updatedCustom,
        currentWeek: nextWeekNumber,
      });

      setActiveWeek(nextWeekNumber);
      if (generatedMissions[0]) {
        handleSelectMission(generatedMissions[0]);
      }

      toast.success(
        `🎉 Semana ${nextWeekNumber} gerada para ${langDef.name}! ${generatedMissions.length} novas situações adicionadas.`,
        { duration: 4000 }
      );
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar mais semanas no momento.");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput("");
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await scenarioChat(
        activeScenario,
        query,
        newHistory,
        progress.geminiApiKey
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "tutor",
        text: res.replyText,
        phonetic: generatePhoneticGuide(res.replyText),
        timestamp: Date.now(),
      };

      setMessages([...newHistory, aiMsg]);
      speakText(res.replyText, {
        rate: progress.audioSpeed,
        lang: langDef.speechLangCode,
        gender: activeTutor.gender,
      });

      if (res.structuredSuggestions && res.structuredSuggestions.length > 0) {
        setStructuredSuggestions(res.structuredSuggestions);
      } else if (res.suggestedReplies && res.suggestedReplies.length > 0) {
        setStructuredSuggestions(
          res.suggestedReplies.map((r) => ({
            english: r,
            phonetic: generatePhoneticGuide(r),
            portuguese: "Sugestão de resposta rápida",
          }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar conversa no cenário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecord = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Reconhecimento de fala não suportado neste navegador.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      stopSpeaking();
      return;
    }

    const recognizer = createSpeechRecognizer(
      {
        onFinal: (text) => {
          setIsRecording(false);
          handleSend(text);
        },
        onError: (err: string) => {
          setIsRecording(false);
          toast.error(`Erro no microfone: ${err}`);
        },
        onEnd: () => setIsRecording(false),
      },
      undefined,
      undefined,
      langDef.speechLangCode
    );

    if (recognizer) {
      setIsRecording(true);
      recognizer.start();
    }
  };

  const handleCompleteMission = () => {
    const completed = progress.completedMissionIds || [];
    if (!completed.includes(activeMission.id)) {
      const updatedMissions = [...completed, activeMission.id];
      const withXp = addXP(30);
      onUpdateProgress({
        ...progress,
        ...withXp,
        completedMissionIds: updatedMissions,
      });
      toast.success(
        `🎉 Sobreviveu à situação! +30 XP na ${activeMission.weekTitle}`
      );
    } else {
      toast.info("Situação já concluída anteriormente!");
    }
  };

  const handlePlaySound = (e: React.MouseEvent, text: string, speedOverride?: number) => {
    e.stopPropagation();
    speakText(text, {
      rate: speedOverride ?? progress.audioSpeed,
      lang: langDef.speechLangCode,
      gender: activeTutor.gender,
    });
  };

  const missionsInCurrentWeek = getMissionsByWeek(
    activeWeek,
    currentLanguage,
    progress.customMissions
  );

  const isMissionCompleted = (progress.completedMissionIds || []).includes(
    activeMission.id
  );

  const scenarioSteps: StepItem[] = [
    { label: "Abertura" },
    { label: "Sua Resposta" },
    { label: "Diálogo Ativo" },
    { label: "Sobreviveu!" },
  ];

  const currentScenarioStep = isMissionCompleted
    ? 4
    : messages.length <= 1
    ? 1
    : messages.length === 2
    ? 2
    : 3;

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-lg mx-auto w-full">
      {/* 1. CABEÇALHO DA TRILHA DE SITUAÇÕES REAIS */}
      <div className="p-2 border-b border-border bg-card/70 space-y-2">
        {/* Barra superior: Idioma, Ações e Botão Procedural */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{langDef.flag}</span>
            <div>
              <span className="text-[11px] font-extrabold text-foreground tracking-tight block">
                Situações da Vida Real
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                {langDef.name} • Tutor {activeTutor.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão Procedural: Criar Mais Semanas */}
            <Button
              size="sm"
              variant="default"
              onClick={handleCreateMoreWeeks}
              className="h-7 text-[10px] px-2.5 gap-1 rounded-lg font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
              title="Gerar nova semana procedural com situações reais"
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>+ Criar Semana</span>
            </Button>

            {activeMission.script && (
              <button
                type="button"
                onClick={() => setShowScriptModal(true)}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md"
                title="Ver roteiro completo com fonética e tradução"
              >
                <BookOpen className="h-3 w-3" /> Roteiro
              </button>
            )}
          </div>
        </div>

        {/* Barra Imersiva: Áudio Ambiente e Guia de Viagem */}
        <div className="flex items-center justify-between gap-1.5 px-1 py-1 bg-background/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px] min-w-0">
            <span className="font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
              <Headphones className={`h-3 w-3 ${activeSoundscape ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <span className="hidden xs:inline">Ambiente:</span>
            </span>
            {(
              [
                { type: "cafe" as const, label: "Café ☕" },
                { type: "airport" as const, label: "Aeroporto ✈️" },
                { type: "rain" as const, label: "Chuva 🌧️" },
                { type: "office" as const, label: "Escritório 💼" },
              ]
            ).map((item) => {
              const isActive = activeSoundscape === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleToggleSoundscape(item.type)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background hover:bg-muted/70 text-muted-foreground border-border/80"
                  }`}
                  title={`Ativar som imersivo de ${item.label}`}
                >
                  {item.label}
                </button>
              );
            })}
            {activeSoundscape && (
              <button
                type="button"
                onClick={() => {
                  soundscape.stop();
                  setActiveSoundscape(null);
                }}
                className="text-[10px] text-destructive hover:underline font-bold px-1 shrink-0"
                title="Desligar som ambiente"
              >
                ✕ Parar
              </button>
            )}
          </div>

          {onOpenTravelPack && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenTravelPack}
              className="h-6 text-[10px] px-2 gap-1 rounded-md font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
              title="Abrir Pacote de Sobrevivência para Viagem Offline"
            >
              <Luggage className="h-3 w-3" />
              <span>Viagem</span>
            </Button>
          )}
        </div>

        {/* Seletor Dinâmico de Semanas (Rolagem horizontal para semanas infinitas) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          {availableWeeks.map((w) => {
            const isSel = activeWeek === w;
            const weekMissionsList = getMissionsByWeek(
              w,
              currentLanguage,
              progress.customMissions
            );
            const weekDoneCount = weekMissionsList.filter((m) =>
              (progress.completedMissionIds || []).includes(m.id)
            ).length;

            return (
              <button
                key={w}
                onClick={() => handleSelectWeek(w)}
                className={`shrink-0 py-1 px-2.5 rounded-lg text-left transition-all border ${
                  isSel
                    ? "bg-background text-primary border-primary shadow-xs font-bold"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border-transparent font-medium"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-extrabold uppercase">
                    Semana {w}
                  </span>
                  {weekDoneCount > 0 && (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-600 px-1 py-0.2 rounded font-bold">
                      {weekDoneCount}/{weekMissionsList.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Carrossel de Situações da Semana Escolhida */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {missionsInCurrentWeek.map((m) => {
            const Icon = ICON_MAP[m.icon] || Coffee;
            const isSelected = activeMission.id === m.id;
            const isDone = (progress.completedMissionIds || []).includes(m.id);

            return (
              <button
                key={m.id}
                onClick={() => handleSelectMission(m)}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs font-bold"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{m.title}</span>
                {isDone && (
                  <CheckCircle2
                    className={`h-3 w-3 ${
                      isSelected ? "text-white" : "text-emerald-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BRIEFING DA SITUAÇÃO (História, Objetivo e Dica do Tutor) */}
      <div className="px-3 py-2 bg-muted/40 border-b border-border text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[9px] bg-background font-semibold">
              Papel IA: <strong className="ml-1 text-primary">{activeScenario.roleAi}</strong>
            </Badge>
            <Badge variant="outline" className="text-[9px] bg-background">
              Você: <strong className="ml-1">{activeScenario.roleUser}</strong>
            </Badge>
          </div>

          <Button
            size="sm"
            variant={isMissionCompleted ? "secondary" : "outline"}
            onClick={handleCompleteMission}
            className={`h-6 text-[10px] px-2 gap-1 rounded-md ${
              isMissionCompleted
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : "border-primary/40 text-primary hover:bg-primary/10 font-bold"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>{isMissionCompleted ? "Concluída!" : "Concluir Situação"}</span>
          </Button>
        </div>

        {/* Indicador de Progresso da Situação com ReUI Stepper */}
        <Stepper
          steps={scenarioSteps}
          currentStep={currentScenarioStep}
          variant="compact"
          className="pt-0.5"
        />

        {/* Avaliação ao Sobreviver com ReUI Rating */}
        {isMissionCompleted && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center justify-between animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                🎉 Situação Sobrevivida!
              </span>
              <span className="text-[9px] text-muted-foreground">
                Como foi seu domínio neste diálogo?
              </span>
            </div>
            <Rating
              variant="stars"
              size="sm"
              value={scenarioRating}
              onValueChange={(val) => {
                setScenarioRating(val);
                toast.success("Feedback registrado! Prática consolidada.");
              }}
            />
          </div>
        )}

        {/* História e contexto realista */}
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
          {activeMission.situationDescription}
        </p>

        {/* Objetivo de Sobrevivência */}
        <div className="text-[10px] text-foreground flex items-center gap-1 truncate font-medium">
          <Target className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">
            <strong>Meta:</strong> {activeMission.survivalObjective}
          </span>
        </div>
      </div>

      {/* 3. HISTÓRICO DO DIÁLOGO DE SOBREVIVÊNCIA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const isFirstAi = !isUser && index === 0 && activeMission.openingAiPhonetic;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-muted-foreground px-1 mb-0.5">
                {isUser ? activeScenario.roleUser : activeScenario.roleAi}
              </span>
              <div
                className={`rounded-2xl px-3.5 py-2.5 max-w-[88%] shadow-xs leading-relaxed space-y-1 ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card border border-border text-foreground rounded-tl-xs"
                }`}
              >
                {/* 1. Frase no Idioma Nativo */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-xs sm:text-sm">{msg.text}</p>
                  {!isUser && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handlePlaySound(e, msg.text)}
                        className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                        title="Ouvir pronúncia"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handlePlaySound(e, msg.text, 0.75)}
                        className="text-[9.5px] font-semibold text-muted-foreground hover:text-primary px-1 py-0.5 rounded bg-muted/50 border border-border/40 transition-colors"
                        title="Ouvir em velocidade pausada (0.75x)"
                      >
                        0.75x
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Escrita Fonética em Português */}
                {(msg.phonetic || (isFirstAi && activeMission.openingAiPhonetic)) && (
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-tight opacity-90 border-t border-border/20 pt-0.5 text-emerald-600 dark:text-emerald-400">
                    [ {msg.phonetic || activeMission.openingAiPhonetic} ]
                  </p>
                )}

                {/* 3. Tradução para o Português */}
                {(msg.translationPt || (isFirstAi && activeMission.openingAiPortuguese)) && (
                  <p className="text-[10px] opacity-75 italic border-t border-border/20 pt-0.5">
                    {msg.translationPt || activeMission.openingAiPortuguese}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs p-2 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{activeScenario.roleAi} está respondendo...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. SUGESTÕES RÁPIDAS DE RESPOSTA */}
      {structuredSuggestions && structuredSuggestions.length > 0 && !isLoading && (
        <div className="px-3 py-1.5 bg-muted/40 border-t border-border space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold px-0.5">
            <span className="flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              O que responder agora ({langDef.name}):
            </span>
            <span className="text-[9px] opacity-75">Toque para enviar com fonética</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {structuredSuggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug.english)}
                className="shrink-0 max-w-[240px] text-left p-2 rounded-xl bg-background border border-border/80 hover:border-primary/60 hover:bg-primary/5 transition-all text-xs group shadow-2xs space-y-0.5"
              >
                <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  &ldquo;{sug.english}&rdquo;
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  [ {sug.phonetic} ]
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  {sug.portuguese}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. ÁREA DE DIGITAÇÃO & MICROFONE */}
      <div className="p-2.5 border-t border-border bg-card/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleToggleRecord}
            className={`h-9 w-9 shrink-0 rounded-xl transition-all ${
              isRecording ? "bg-red-500 text-white animate-pulse" : ""
            }`}
            title={`Responder por voz em ${langDef.name}`}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4 text-primary" />
            )}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Fale ou responda como ${activeScenario.roleUser} em ${langDef.name}...`}
            className="text-xs h-9 rounded-xl flex-1 bg-background"
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 shrink-0 rounded-xl shadow-xs"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* MODAL DO ROTEIRO COMPLETO COM FONÉTICA E TRADUÇÃO */}
      {showScriptModal && activeMission.script && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-background rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col border border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">
                  Roteiro de Fala: {activeMission.title} ({langDef.name})
                </h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 overflow-y-auto space-y-3 divide-y divide-border/40 text-xs">
              {activeMission.script.map((line: DialogueScriptLine) => {
                const isUser = line.roleType === "user";
                return (
                  <div key={line.id} className="pt-2.5 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isUser
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        {line.speaker}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handlePlaySound(e, line.english)}
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Ouvir
                      </button>
                    </div>

                    {/* Frase no idioma nativo */}
                    <p className="text-xs font-bold text-foreground">
                      &ldquo;{line.english}&rdquo;
                    </p>

                    {/* Fonética */}
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                      [ {line.phonetic} ]
                    </p>

                    {/* Tradução */}
                    <p className="text-[11px] text-muted-foreground">
                      {line.portuguese}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-border bg-card/60 flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowScriptModal(false)}
                className="text-xs font-bold h-8"
              >
                Entendido, voltar à conversa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
