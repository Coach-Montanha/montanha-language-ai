import React, { useState, useRef, useEffect } from "react";
import { Scenario, ChatMessage, UserProgress } from "@/types/language";
import { PRESET_SCENARIOS } from "@/data/scenarios";
import { scenarioChat } from "@/services/ai-engine";
import { speakText, createSpeechRecognizer, isSpeechRecognitionSupported } from "@/services/speech";
import { addXP } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Building2,
  Briefcase,
  Plane,
  Utensils,
  Compass,
  Send,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ScenarioTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  Building2,
  Briefcase,
  Plane,
  Utensils,
  Compass,
};

export const ScenarioTab: React.FC<ScenarioTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [activeScenario, setActiveScenario] = useState<Scenario>(PRESET_SCENARIOS[0]!);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sc-init",
      sender: "tutor",
      text: PRESET_SCENARIOS[0]!.initialAiMessage,
      timestamp: Date.now(),
    },
  ]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>(
    PRESET_SCENARIOS[0]!.sampleReplies
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customRole, setCustomRole] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSelectScenario = (sc: Scenario) => {
    setActiveScenario(sc);
    setMessages([
      {
        id: `sc-init-${Date.now()}`,
        sender: "tutor",
        text: sc.initialAiMessage,
        timestamp: Date.now(),
      },
    ]);
    setSuggestedReplies(sc.sampleReplies);
    speakText(sc.initialAiMessage, { rate: progress.audioSpeed });
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
      setSuggestedReplies(res.suggestedReplies);
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
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setIsRecording(false);
        handleSend(transcript);
      },
      (err) => {
        console.error(err);
        setIsRecording(false);
        toast.error("Voz não capturada. Tente novamente.");
      },
      () => setIsRecording(false)
    );

    if (recognizer) {
      recognizer.start();
    }
  };

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const custom: Scenario = {
      id: `custom-sc-${Date.now()}`,
      title: customTitle,
      icon: "Compass",
      roleAi: customRole.trim() || "Atendente / Parceria",
      roleUser: "Você",
      description: `Simulação de: ${customTitle}`,
      context: `You are in a realistic roleplay about: ${customTitle}. Act naturally as ${customRole || "the other party"}.`,
      initialAiMessage: `Hello! Let's roleplay: ${customTitle}. How can I assist you today?`,
      sampleReplies: [
        "Hello, I would like more information about this, please.",
        "Could you help me with this process?",
        "Thank you for your assistance!",
      ],
    };

    setShowCustomModal(false);
    setCustomTitle("");
    setCustomRole("");
    handleSelectScenario(custom);
    toast.success("Cenário personalizado iniciado!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full">
      {/* Carrossel / Seletor de Cenários */}
      <div className="p-2 border-b border-border bg-card/60">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Escolha um Cenário Real
          </span>
          <button
            onClick={() => setShowCustomModal(true)}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Outra situação
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PRESET_SCENARIOS.map((sc) => {
            const Icon = ICON_MAP[sc.icon] || Compass;
            const isCurrent = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info do Cenário Atual */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border text-[11px]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-background">
            Papel IA: <strong className="ml-1 text-primary">{activeScenario.roleAi}</strong>
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-background">
            Seu Papel: <strong className="ml-1">{activeScenario.roleUser}</strong>
          </Badge>
        </div>
        <button
          onClick={() => handleSelectScenario(activeScenario)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px]"
          title="Reiniciar diálogo"
        >
          <RotateCcw className="h-3 w-3" /> Reiniciar
        </button>
      </div>

      {/* Histórico do Diálogo */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-muted-foreground px-1 mb-0.5">
                {isUser ? activeScenario.roleUser : activeScenario.roleAi}
              </span>
              <div
                className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] shadow-xs leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card border border-border text-foreground rounded-tl-xs"
                }`}
              >
                <p>{msg.text}</p>
                {!isUser && (
                  <button
                    onClick={() => speakText(msg.text, { rate: progress.audioSpeed })}
                    className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground pt-1"
                  >
                    <Volume2 className="h-3 w-3" /> Ouvir pronúncia
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

      {/* Sugestões de Respostas Rápidas */}
      {suggestedReplies.length > 0 && (
        <div className="p-2 border-t border-border/40 bg-background/90">
          <p className="text-[10px] text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Como você pode responder:
          </p>
          <div className="flex flex-col gap-1">
            {suggestedReplies.slice(0, 2).map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(reply)}
                className="text-left px-2.5 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted text-[11px] text-foreground font-medium transition-colors line-clamp-1"
              >
                &ldquo;{reply}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Entrada de Fala ou Digitação */}
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
            className="h-9 w-9 shrink-0 rounded-xl"
            title="Responder por voz"
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Fale ou digite como ${activeScenario.roleUser}...`}
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

      {/* Mini-modal para criar situação personalizada */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl p-5 w-full max-w-sm border border-border shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Criar Situação Personalizada
            </h3>
            <p className="text-xs text-muted-foreground">
              Diga qualquer situação que você queira simular em inglês:
            </p>
            <form onSubmit={handleCreateCustomScenario} className="space-y-3">
              <Input
                placeholder="Ex: Devolver um produto na loja da Apple"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="text-xs"
                required
              />
              <Input
                placeholder="Papel da IA (Ex: Vendedor da Apple Store)"
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
                  Começar Simulação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
