import React, { useState, useRef, useEffect } from "react";
import {
  Scenario,
  ChatMessage,
  UserProgress,
  WeeklyMission,
  ScriptSuggestion,
  DialogueScriptLine,
} from "@/types/language";
import {
  WEEKLY_MISSIONS,
  getMissionsByWeek,
  missionToScenario,
} from "@/data/missions";
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
} from "lucide-react";
import { toast } from "sonner";

interface ScenarioTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  selectedMission?: WeeklyMission | null;
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
};

export const ScenarioTab: React.FC<ScenarioTabProps> = ({
  progress,
  onUpdateProgress,
  selectedMission,
}) => {
  const currentWeek = progress.currentWeek || 1;
  const [activeWeek, setActiveWeek] = useState<1 | 2 | 3>(
    selectedMission ? selectedMission.week : currentWeek
  );

  const initialMission = selectedMission || getMissionsByWeek(activeWeek)[0]!;
  const [activeMission, setActiveMission] = useState<WeeklyMission>(initialMission);
  const [activeScenario, setActiveScenario] = useState<Scenario>(
    missionToScenario(initialMission)
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sc-init",
      sender: "tutor",
      text: initialMission.openingAiDialogue,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Se uma missão foi selecionada vinda do banner inicial
  useEffect(() => {
    if (selectedMission) {
      setActiveWeek(selectedMission.week);
      setActiveMission(selectedMission);
      const sc = missionToScenario(selectedMission);
      setActiveScenario(sc);
      setMessages([
        {
          id: `sc-init-${Date.now()}`,
          sender: "tutor",
          text: selectedMission.openingAiDialogue,
          timestamp: Date.now(),
        },
      ]);
      setStructuredSuggestions(selectedMission.structuredSuggestions || []);
      speakText(selectedMission.openingAiDialogue, { rate: progress.audioSpeed });
    }
  }, [selectedMission]);

  const handleSelectWeek = (week: 1 | 2 | 3) => {
    setActiveWeek(week);
    const firstOfTargetWeek = getMissionsByWeek(week)[0]!;
    handleSelectMission(firstOfTargetWeek);
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
        timestamp: Date.now(),
      },
    ]);
    setStructuredSuggestions(mission.structuredSuggestions || []);
    speakText(mission.openingAiDialogue, { rate: progress.audioSpeed });
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
        timestamp: Date.now(),
      };

      setMessages([...newHistory, aiMsg]);
      if (res.structuredSuggestions && res.structuredSuggestions.length > 0) {
        setStructuredSuggestions(res.structuredSuggestions);
      } else {
        setStructuredSuggestions(
          res.suggestedReplies.map((r) => ({
            english: r,
            phonetic: generatePhoneticGuide(r),
            portuguese: "Toque para responder",
          }))
        );
      }

      speakText(res.replyText, { rate: progress.audioSpeed });

      const updated = addXP(10);
      onUpdateProgress(updated);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao simular resposta do cenário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const recognizer = createSpeechRecognizer({
      onInterim: (text) => setInput(text),
      onFinal: (transcript) => {
        setIsRecording(false);
        handleSend(transcript);
      },
      onError: (err) => {
        setIsRecording(false);
        toast.error(err);
      },
      onEnd: () => setIsRecording(false),
    });

    if (recognizer) {
      recognizer.start();
    }
  };

  const handleCompleteMission = () => {
    const currentCompleted = progress.completedMissionIds || [];
    if (!currentCompleted.includes(activeMission.id)) {
      const updatedList = [...currentCompleted, activeMission.id];
      const updated = addXP(30);
      onUpdateProgress({
        ...updated,
        completedMissionIds: updatedList,
      });
      toast.success(`🎉 Sobreviveu à conversa! +30 XP na ${activeMission.weekTitle}`);
    } else {
      toast.info("Situação já concluída anteriormente!");
    }
  };

  const handlePlaySound = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text, { rate: progress.audioSpeed });
  };

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const custom: Scenario = {
      id: `custom-sc-${Date.now()}`,
      title: customTitle,
      icon: "Compass",
      roleAi: customRole.trim() || "Atendente",
      roleUser: "Você",
      description: `Simulação de: ${customTitle}`,
      context: `You are in a realistic survival roleplay about: ${customTitle}. Act naturally as ${customRole || "the other party"}. Challenge the user to survive the conversation.`,
      initialAiMessage: `Hey there! Ready to practice: ${customTitle}. What's your first move?`,
      sampleReplies: [
        "Hello! I would like more information about this, please.",
        "Could you help me resolve this issue?",
        "Thank you for your help!",
      ],
      structuredSuggestions: [
        {
          english: "Hello! I would like more information about this, please.",
          phonetic: "ré-lou! ái uûd láik mór in-fór-mêi-shân a-báut dís, plíz.",
          portuguese: "Olá! Gostaria de mais informações sobre isso, por favor.",
        },
        {
          english: "Could you help me resolve this issue?",
          phonetic: "cûd iú rélp mi ri-zólv dís í-shu?",
          portuguese: "Você poderia me ajudar a resolver esse problema?",
        },
      ],
    };

    setShowCustomModal(false);
    setCustomTitle("");
    setCustomRole("");
    setActiveScenario(custom);
    setMessages([
      {
        id: `sc-init-${Date.now()}`,
        sender: "tutor",
        text: custom.initialAiMessage,
        timestamp: Date.now(),
      },
    ]);
    setStructuredSuggestions(custom.structuredSuggestions || []);
    toast.success("Situação personalizada iniciada com o Leo!");
  };

  const missionsInCurrentWeek = getMissionsByWeek(activeWeek);
  const isMissionCompleted = (progress.completedMissionIds || []).includes(
    activeMission.id
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full">
      {/* 1. SELETOR DE SEMANAS (Sobrevivência, Contexto, Opinião) */}
      <div className="p-2 border-b border-border bg-card/60 space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Trilha de Sobrevivência Real
          </span>
          <div className="flex items-center gap-2">
            {activeMission.script && (
              <button
                type="button"
                onClick={() => setShowScriptModal(true)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md"
              >
                <BookOpen className="h-3.5 w-3.5" /> Roteiro Completo
              </button>
            )}
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-0.5"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Outro
            </button>
          </div>
        </div>

        {/* Abas das 3 Semanas */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-muted/60 rounded-xl border border-border/40">
          {[
            { week: 1 as const, label: "Semana 1", desc: "Sobrevivência" },
            { week: 2 as const, label: "Semana 2", desc: "Teu Contexto" },
            { week: 3 as const, label: "Semana 3", desc: "Opinião" },
          ].map((w) => (
            <button
              key={w.week}
              onClick={() => handleSelectWeek(w.week)}
              className={`py-1 px-1.5 rounded-lg text-center transition-all ${
                activeWeek === w.week
                  ? "bg-background text-primary shadow-xs border border-border font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className="text-[10px] font-extrabold uppercase">{w.label}</div>
              <div className="text-[9px] truncate">{w.desc}</div>
            </button>
          ))}
        </div>

        {/* Carrossel de Situações da Semana */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar pt-0.5">
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
                  <CheckCircle2 className={`h-3 w-3 ${isSelected ? "text-white" : "text-emerald-500"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA DE METAS DA SITUAÇÃO (Objetivo & Dica do Leo) */}
      <div className="px-3 py-2 bg-muted/40 border-b border-border text-[11px] space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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

        {activeMission && (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
            <Target className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">
              <strong>Meta:</strong> {activeMission.survivalObjective}
            </span>
          </div>
        )}
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
                {/* 1. Frase em Inglês */}
                <p className="font-medium text-xs">{msg.text}</p>

                {/* 2. Escrita Fonética no Diálogo Inicial */}
                {isFirstAi && activeMission.openingAiPhonetic && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                    [ {activeMission.openingAiPhonetic} ]
                  </p>
                )}

                {/* 3. Tradução em Português no Diálogo Inicial */}
                {isFirstAi && activeMission.openingAiPortuguese && (
                  <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-0.5">
                    {activeMission.openingAiPortuguese}
                  </p>
                )}

                {!isUser && (
                  <button
                    onClick={() => speakText(msg.text, { rate: progress.audioSpeed })}
                    className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground pt-0.5"
                  >
                    <Volume2 className="h-3 w-3 text-primary" /> Ouvir pronúncia
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>{activeScenario.roleAi} está respondendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. SUGESTÕES DE RESPOSTAS ESTRUTURADAS COM FONÉTICA E TRADUÇÃO */}
      {structuredSuggestions.length > 0 && (
        <div className="p-2 border-t border-border/50 bg-background/95 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-amber-500" /> Sugestões de Fala (com Fonética & Tradução):
            </p>
            <span className="text-[9px] text-muted-foreground">Toque para responder</span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-0.5">
            {structuredSuggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSend(item.english)}
                className="group relative flex flex-col p-2 rounded-xl border border-border/70 bg-card hover:border-primary/60 hover:bg-primary/5 transition-all text-left cursor-pointer shadow-2xs"
              >
                <div className="flex items-start justify-between gap-1.5">
                  {/* 1. Frase em Inglês */}
                  <span className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    &ldquo;{item.english}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handlePlaySound(e, item.english)}
                    className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-primary flex items-center justify-center shrink-0 transition-colors"
                    title="Ouvir como falar"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 2. Escrita Fonética Acessível para falar */}
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono italic leading-tight mt-0.5">
                  [ {item.phonetic} ]
                </span>

                {/* 3. Tradução em Português */}
                <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {item.portuguese}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ENTRADA DE VOZ (STT) OU DIGITAÇÃO */}
      <div className="p-2 border-t border-border bg-card/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5"
        >
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleMicToggle}
            className={`h-9 w-9 shrink-0 rounded-xl transition-all ${
              isRecording ? "bg-red-500 text-white animate-pulse" : ""
            }`}
            title="Responder por voz em inglês"
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
            placeholder={`Fale ou responda como ${activeScenario.roleUser}...`}
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
                  Roteiro de Fala: {activeMission.title}
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

                    {/* Inglês */}
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

      {/* Modal para criar situação personalizada */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl p-5 w-full max-w-sm border border-border shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Criar Situação Personalizada
            </h3>
            <p className="text-xs text-muted-foreground">
              Diga qualquer situação do seu dia a dia para praticar sobrevivência com o Leo:
            </p>
            <form onSubmit={handleCreateCustomScenario} className="space-y-3">
              <Input
                placeholder="Ex: Alugar um carro e negociar o seguro"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="text-xs"
                required
              />
              <Input
                placeholder="Papel da IA (Ex: Atendente da Hertz/Avis)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomModal(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="text-xs">
                  Começar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
