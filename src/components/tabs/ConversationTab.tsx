import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProgress, TutorPersona } from "@/types/language";
import {
  tutorChat,
  generatePhoneticGuide,
  getPortugueseTranslation,
} from "@/services/ai-engine";
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/services/speech";
import { saveChatHistory, loadChatHistory, addXP } from "@/services/storage";
import { getTutorById } from "@/data/tutors";
import { TutorSelectorModal } from "@/components/TutorSelectorModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  Trash2,
  Radio,
  ChevronDown,
  Gauge,
  Type,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ConversationTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

// Configurações dos tamanhos de fonte para acessibilidade visual
const FONT_LEVELS = {
  sm: {
    label: "P",
    name: "Pequena",
    textClass: "text-xs",
    phoneticClass: "text-[11px]",
    translationClass: "text-[11px]",
    px: "13px",
  },
  md: {
    label: "M",
    name: "Padrão",
    textClass: "text-sm",
    phoneticClass: "text-xs",
    translationClass: "text-xs",
    px: "15px",
  },
  lg: {
    label: "G",
    name: "Grande",
    textClass: "text-base",
    phoneticClass: "text-sm",
    translationClass: "text-sm",
    px: "17px",
  },
  xl: {
    label: "GG",
    name: "Extra Grande",
    textClass: "text-lg",
    phoneticClass: "text-base",
    translationClass: "text-base",
    px: "19px",
  },
};

type FontKey = keyof typeof FONT_LEVELS;

export const ConversationTab: React.FC<ConversationTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const activeTutor = getTutorById(progress.selectedTutorId);
  const currentFontSize: FontKey = (progress.fontSize as FontKey) || "md";
  const fontConfig = FONT_LEVELS[currentFontSize] || FONT_LEVELS.md;

  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  // Estados de exclusão e seleção de mensagens
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) return saved;
    const initialTutor = getTutorById(progress.selectedTutorId);
    return [
      {
        id: "intro",
        sender: "tutor",
        text: initialTutor.initialGreeting,
        phonetic: initialTutor.initialGreetingPhonetic,
        translationPt: initialTutor.initialGreetingPt,
        timestamp: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("smart_language_autospeak");
    return saved !== null ? saved === "true" : true;
  });

  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer>>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isRecording]);

  // Alternância do tamanho da fonte (P -> M -> G -> GG -> P)
  const handleCycleFontSize = () => {
    const order: FontKey[] = ["sm", "md", "lg", "xl"];
    const currentIndex = order.indexOf(currentFontSize);
    const nextIndex = (currentIndex + 1) % order.length;
    const nextKey = order[nextIndex]!;

    const updated: UserProgress = {
      ...progress,
      fontSize: nextKey,
    };
    onUpdateProgress(updated);
    toast.success(`Fonte: ${FONT_LEVELS[nextKey].name} (${FONT_LEVELS[nextKey].px})`);
  };

  // Salva preferência de auto-fala
  const handleToggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_language_autospeak", String(next));
    }
    if (!next) {
      stopSpeaking();
      setSpeakingMessageId(null);
      toast.info("Leitura automática desativada.");
    } else {
      toast.success(`Leitura automática ativada! ${activeTutor.name} falará as respostas.`);
    }
  };

  // Alterna velocidade de fala com 1 clique (0.7x -> 0.85x -> 1.0x -> 1.2x)
  const speeds = [0.7, 0.85, 1.0, 1.2];
  const handleCycleSpeed = () => {
    const currentSpeed = progress.audioSpeed || 0.85;
    const currentIndex = speeds.findIndex((s) => Math.abs(s - currentSpeed) < 0.05);
    const nextIndex = currentIndex === -1 || currentIndex === speeds.length - 1 ? 0 : currentIndex + 1;
    const nextSpeed = speeds[nextIndex]!;

    const updated: UserProgress = {
      ...progress,
      audioSpeed: nextSpeed,
    };
    onUpdateProgress(updated);

    const labels: Record<number, string> = {
      0.7: "🐢 0.7x (Lenta - fala bem calma e pausada)",
      0.85: "🎧 0.85x (Confortável - ritmo ideal)",
      1.0: "🗣️ 1.0x (Normal - velocidade nativa)",
      1.2: "🚀 1.2x (Rápida - modo desafio)",
    };

    toast.success(`Velocidade de ${activeTutor.name}: ${labels[nextSpeed] || `${nextSpeed}x`}`);

    if (speakingMessageId) {
      const msg = messages.find((m) => m.id === speakingMessageId);
      if (msg) {
        stopSpeaking();
        handleSpeakMessage(msg.id, msg.text, nextSpeed);
      }
    }
  };

  // Troca de tutor
  const handleSelectTutor = (tutor: TutorPersona) => {
    const updated: UserProgress = {
      ...progress,
      selectedTutorId: tutor.id,
    };
    onUpdateProgress(updated);

    const tutorMsg: ChatMessage = {
      id: `tutor-switch-${Date.now()}`,
      sender: "tutor",
      text: tutor.initialGreeting,
      phonetic: tutor.initialGreetingPhonetic,
      translationPt: tutor.initialGreetingPt,
      timestamp: Date.now(),
    };
    const newHistory = [...messages, tutorMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);

    if (autoSpeak && isSpeechSynthesisSupported()) {
      handleSpeakMessage(tutorMsg.id, tutor.initialGreeting, progress.audioSpeed || 0.85, tutor);
    }
  };

  // Reproduz áudio de uma mensagem específica
  const handleSpeakMessage = (
    msgId: string,
    text: string,
    overrideSpeed?: number,
    overrideTutor?: TutorPersona
  ) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    const tutorToUse = overrideTutor || activeTutor;
    const speedToUse = overrideSpeed ?? progress.audioSpeed ?? 0.85;

    setSpeakingMessageId(msgId);
    speakText(text, {
      rate: speedToUse,
      gender: tutorToUse.gender,
      pitch: tutorToUse.speechPitch,
      lang: "en-US",
      onStart: () => setSpeakingMessageId(msgId),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  // Envio de mensagem
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    setSpeakingMessageId(null);

    setInput("");
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await tutorChat(query, messages, progress.geminiApiKey, activeTutor);

      const tutorMsgId = `tutor-${Date.now()}`;
      const tutorMsg: ChatMessage = {
        id: tutorMsgId,
        sender: "tutor",
        text: response.replyText,
        phonetic: response.phonetic || generatePhoneticGuide(response.replyText),
        translationPt: response.translationPt || getPortugueseTranslation(response.replyText),
        correction: response.correction,
        timestamp: Date.now(),
      };

      const updatedHistory = [...newHistory, tutorMsg];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);

      if (autoSpeak && isSpeechSynthesisSupported()) {
        handleSpeakMessage(tutorMsgId, response.replyText);
      }

      const updated = addXP(10);
      onUpdateProgress({
        ...updated,
        messagesSentCount: progress.messagesSentCount + 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("Houve uma falha ao obter a resposta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Entrada por voz (STT)
  const handleStartRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome ou Edge."
      );
      return;
    }

    stopSpeaking();
    setSpeakingMessageId(null);

    try {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignora
        }
      }

      const recognizer = createSpeechRecognizer({
        onStart: () => {
          setIsRecording(true);
        },
        onInterim: (interimText) => {
          setInput(interimText);
        },
        onFinal: (finalText) => {
          setInput(finalText);
          setIsRecording(false);
          if (finalText.trim()) {
            handleSend(finalText.trim());
          }
        },
        onError: (err) => {
          setIsRecording(false);
          toast.error(err);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
      }
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      toast.error("Não foi possível iniciar o microfone.");
    }
  };

  const handleStopRecording = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignora
      }
    }
    setIsRecording(false);
  };

  // 1. APAGAR UMA ÚNICA MENSAGEM ESPECÍFICA
  const handleDeleteSingleMessage = (msgId: string) => {
    stopSpeaking();
    setSpeakingMessageId(null);
    const updated = messages.filter((m) => m.id !== msgId);
    setMessages(updated);
    saveChatHistory(updated);
    toast.success("Mensagem apagada com sucesso.");
  };

  // 2. MODO SELEÇÃO: Alternar mensagem na lista
  const handleToggleSelectMessage = (msgId: string) => {
    setSelectedIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  // 3. APAGAR MENSAGENS SELECIONADAS
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.info("Nenhuma mensagem selecionada.");
      return;
    }

    stopSpeaking();
    setSpeakingMessageId(null);

    const count = selectedIds.length;
    const updated = messages.filter((m) => !selectedIds.includes(m.id));
    setMessages(updated);
    saveChatHistory(updated);
    setSelectedIds([]);
    setIsSelecting(false);
    toast.success(`${count} mensagem(ns) apagada(s)!`);
  };

  // 4. LIMPAR TODA A CONVERSA
  const handleClearAllChat = () => {
    if (confirm("Tem certeza de que deseja apagar todas as mensagens da conversa?")) {
      stopSpeaking();
      setSpeakingMessageId(null);
      const resetMessages: ChatMessage[] = [
        {
          id: `intro-${Date.now()}`,
          sender: "tutor",
          text: activeTutor.initialGreeting,
          phonetic: activeTutor.initialGreetingPhonetic,
          translationPt: activeTutor.initialGreetingPt,
          timestamp: Date.now(),
        },
      ];
      setMessages(resetMessages);
      saveChatHistory(resetMessages);
      setSelectedIds([]);
      setIsSelecting(false);
      toast.info("Histórico de conversa limpo.");
    }
  };

  // Sugestões práticas de fala
  const suggestions = [
    {
      label: "Apresentar-se",
      english: `Hello ${activeTutor.name}, nice to meet you!`,
      phonetic: `Ré-lóu ${activeTutor.name}, náis tu mít iú!`,
      portuguese: `Olá ${activeTutor.name}, prazer em conhecer você!`,
    },
    {
      label: "Planos de línguas",
      english: "I want to improve my speaking and pronunciation skills.",
      phonetic: "Ái uónt tu im-prúv mái spí-kin énd pro-nân-si-êi-shên skíls.",
      portuguese: "Quero melhorar minha fala e habilidades de pronúncia.",
    },
    {
      label: "Falar do dia",
      english: "My day was pretty busy, but I'm ready to learn.",
      phonetic: "Mái dêi uóz prí-ti bí-zi, bât áim ré-di tu lûrn.",
      portuguese: "Meu dia foi bem corrido, mas estou pronto para aprender.",
    },
    {
      label: "Testar erro: Faltou 'a'",
      english: "I have dog and car.",
      phonetic: "Ái rév dóg énd cár.",
      portuguese: "Eu tenho cachorro e carro. (Faltou 'a')",
    },
    {
      label: "Testar erro: In the bus",
      english: "I am in the bus going home.",
      phonetic: "Ái ém in da bâs góu-in róum.",
      portuguese: "Estou no ônibus indo para casa. (O correto é 'on')",
    },
  ];

  const [expandedSuggestionIndex, setExpandedSuggestionIndex] = useState<number | null>(null);

  const speedDisplay =
    (progress.audioSpeed || 0.85) <= 0.75
      ? "🐢 0.7x"
      : (progress.audioSpeed || 0.85) === 0.85
      ? "🎧 0.85x"
      : (progress.audioSpeed || 0.85) === 1.0
      ? "🗣️ 1.0x"
      : "🚀 1.2x";

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full">
      {/* Topo do Chat com Seletor de Tutor, Fonte, Velocidade e Limpeza */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/40 rounded-t-xl gap-1">
        {/* Tutor Ativo (Clicável para abrir catálogo) */}
        <button
          type="button"
          onClick={() => setIsTutorModalOpen(true)}
          className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity group cursor-pointer"
          title="Clique para escolher outro tutor ou tutora"
        >
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              {activeTutor.avatar}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-0.5">
                {activeTutor.name}
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </span>
              <span className="text-[10px] bg-primary/15 text-primary font-bold px-1.5 py-0.2 rounded-full">
                {activeTutor.city} {activeTutor.flag}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px] xs:max-w-[160px]">
              {activeTutor.gender === "female" ? "Tutora" : "Tutor"} &bull;{" "}
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Gentil & Corrige!</span>
            </p>
          </div>
        </button>

        {/* Controles de Leitura, Áudio e Limpeza */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 1. CONTROLE DE TAMANHO DA FONTE (P, M, G, GG) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCycleFontSize}
            className="h-7 px-1.5 text-[10px] gap-1 rounded-lg border font-bold"
            title={`Tamanho da fonte: ${fontConfig.name} (${fontConfig.px}). Clique para alterar tamanho da leitura.`}
          >
            <Type className="h-3 w-3 text-primary" />
            <span>{fontConfig.label}</span>
          </Button>

          {/* 2. CONTROLE DIRETO DE VELOCIDADE (0.7x, 0.85x, 1.0x, 1.2x) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCycleSpeed}
            className={`h-7 px-1.5 text-[10px] gap-1 rounded-lg border font-mono transition-all ${
              (progress.audioSpeed || 0.85) <= 0.75
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold"
                : (progress.audioSpeed || 0.85) === 0.85
                ? "border-primary/40 bg-primary/10 text-primary font-bold"
                : "border-border text-foreground"
            }`}
            title="Ajustar velocidade de fala (0.7x Lento, 0.85x Confortável, 1.0x Normal, 1.2x Rápido)"
          >
            <Gauge className="h-3 w-3 text-primary" />
            <span>{speedDisplay}</span>
          </Button>

          {/* 3. BOTÃO DE AUTO-VOZ */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAutoSpeak}
            className={`h-7 px-1.5 text-[10px] gap-1 rounded-lg border transition-all ${
              autoSpeak
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground bg-muted/40"
            }`}
            title={autoSpeak ? "Leitura automática ativada" : "Leitura automática pausada"}
          >
            {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </Button>

          {/* 4. BOTÃO PARA GERENCIAR / LIMPAR MENSAGENS */}
          <Button
            variant={isSelecting ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsSelecting(!isSelecting)}
            className={`h-7 w-7 ${isSelecting ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title={isSelecting ? "Sair do modo de seleção" : "Selecionar mensagens para apagar"}
          >
            {isSelecting ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearAllChat}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Apagar todas as mensagens da conversa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Barra de Ação quando o modo de seleção de mensagens estiver ativo */}
      {isSelecting && (
        <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.length} selecionada(s)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(messages.map((m) => m.id))}
              className="h-6 text-[10px] px-2"
            >
              Marcar Todas
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={handleDeleteSelected}
              className="h-6 text-[10px] px-2 gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>Apagar ({selectedIds.length})</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsSelecting(false);
                setSelectedIds([]);
              }}
              className="h-6 text-[10px] px-1.5"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Indicador quando o microfone estiver gravando */}
      {isRecording && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-red-500/15 border-b border-red-500/30 text-red-600 dark:text-red-400 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 font-medium">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Ouvindo sua voz... Fale em inglês</span>
          </div>
          <button
            onClick={handleStopRecording}
            className="text-[11px] font-bold underline hover:opacity-80"
          >
            Concluir Fala
          </button>
        </div>
      )}

      {/* Área de Mensagens com Fonética, Tradução e Tamanho de Fonte Controlável */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSpeakingThis = speakingMessageId === msg.id;
          const isMsgSelected = selectedIds.includes(msg.id);

          const phoneticText = msg.phonetic || (!isUser ? generatePhoneticGuide(msg.text) : undefined);
          const translationText = msg.translationPt || (!isUser ? getPortugueseTranslation(msg.text) : undefined);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} group relative`}
            >
              <div className="flex items-start gap-1.5 max-w-[92%] sm:max-w-[88%]">
                {/* Checkbox de seleção quando em modo de apagar mensagens */}
                {isSelecting && (
                  <button
                    type="button"
                    onClick={() => handleToggleSelectMessage(msg.id)}
                    className="mt-1 p-0.5 text-primary hover:scale-110 transition-transform shrink-0"
                  >
                    {isMsgSelected ? (
                      <CheckSquare className="h-4 w-4 fill-primary text-primary-foreground" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )}

                {/* Avatar do Tutor */}
                {!isUser && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    {activeTutor.avatar}
                  </div>
                )}

                {/* Balão da Mensagem */}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed transition-all relative ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : isSpeakingThis
                      ? "bg-card border-2 border-emerald-500/70 shadow-md text-foreground rounded-tl-xs ring-2 ring-emerald-500/20"
                      : "bg-card border border-border text-foreground rounded-tl-xs"
                  }`}
                >
                  {/* Botão sutil para apagar esta mensagem individual */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSingleMessage(msg.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    title="Apagar esta mensagem"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {/* Texto Principal da Mensagem com Tamanho de Fonte Controlável */}
                  <p className={`${fontConfig.textClass} font-medium pr-3`}>{msg.text}</p>

                  {/* Elementos Exclusivos das Mensagens do Tutor: Fonética & Tradução */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-border/50 space-y-1.5 text-left">
                      {/* 1. Forma Fonética de Ler */}
                      {phoneticText && (
                        <div className="flex items-start gap-1.5 bg-primary/5 rounded-lg px-2 py-1 border border-primary/15">
                          <span className="text-xs select-none">🗣️</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-primary block leading-none mb-0.5">
                              Como Falar (Fonética):
                            </span>
                            <p className={`font-mono text-primary font-semibold tracking-wide leading-relaxed ${fontConfig.phoneticClass}`}>
                              [{phoneticText}]
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2. Tradução para o Português */}
                      {translationText && (
                        <div className="flex items-start gap-1.5 bg-muted/40 rounded-lg px-2 py-1 border border-border/40">
                          <span className="text-xs select-none">🇧🇷</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-muted-foreground block leading-none mb-0.5">
                              Tradução em Português:
                            </span>
                            <p className={`text-foreground/90 font-medium leading-relaxed ${fontConfig.translationClass}`}>
                              {translationText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Botão de Ouvir Voz */}
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                          isSpeakingThis
                            ? "text-emerald-600 dark:text-emerald-400 animate-pulse"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={isSpeakingThis ? "Pausar fala" : `Ouvir pronúncia (${speedDisplay})`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>
                          {isSpeakingThis ? "Falando..." : `Ouvir pronúncia (${speedDisplay})`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar do Usuário */}
                {isUser && (
                  <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Balão de Correção em 1 Linha com Explicação em Português */}
              {msg.correction && msg.correction.hasError && (
                <div className="mt-1.5 max-w-[92%] sm:max-w-[88%] rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-left space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Dica de {activeTutor.name} ({activeTutor.city}):</span>
                  </div>
                  <div className={`text-muted-foreground ${fontConfig.translationClass}`}>
                    Você disse: <span className="line-through text-destructive font-medium">{msg.correction.original}</span>
                  </div>
                  <div className={`text-foreground font-semibold flex items-center gap-1 ${fontConfig.textClass}`}>
                    Como falar: <span className="text-emerald-600 dark:text-emerald-400">{msg.correction.corrected}</span>
                  </div>
                  <p className={`text-amber-700 dark:text-amber-300 font-medium italic border-t border-amber-500/20 pt-1 ${fontConfig.translationClass}`}>
                    💡 {msg.correction.explanationPt}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
            <Bot className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>{activeTutor.name} está respondendo com carinho...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões de Respostas com Fonética e Tradução */}
      <div className="p-2 border-t border-border/50 bg-background/95 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Sugestões de Fala (com Fonética & Tradução):
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {suggestions.map((sug, idx) => {
            const isExpanded = expandedSuggestionIndex === idx;

            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSend(sug.english)}
                    className="text-[10px] bg-muted hover:bg-primary hover:text-primary-foreground text-foreground px-2 py-1 rounded-lg border border-border/60 transition-colors text-left"
                    title={`Enviar frase: "${sug.english}"`}
                  >
                    💬 {sug.label}
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedSuggestionIndex(isExpanded ? null : idx)}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                      isExpanded
                        ? "bg-primary/20 text-primary border-primary/40 font-bold"
                        : "bg-muted/60 text-muted-foreground border-border/40 hover:text-foreground"
                    }`}
                    title="Ver pronúncia fonética escrita e tradução"
                  >
                    {isExpanded ? "Ocultar" : "Fonética"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="w-full text-left bg-card border border-primary/20 rounded-lg p-2 text-[10px] space-y-0.5 animate-in fade-in">
                    <p className="font-semibold text-foreground">{sug.english}</p>
                    <p className="text-primary font-mono text-[9px] bg-primary/5 px-1 py-0.2 rounded inline-block">
                      🗣️ [{sug.phonetic}]
                    </p>
                    <p className="text-muted-foreground text-[9px]">🇧🇷 {sug.portuguese}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Entrada (Texto + Microfone) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 border-t border-border bg-card/60 flex items-center gap-1.5"
      >
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`h-9 w-9 shrink-0 rounded-xl transition-all ${
            isRecording ? "animate-pulse ring-2 ring-red-400" : ""
          }`}
          title={isRecording ? "Parar gravação" : "Falar no microfone (Reconhecimento de fala)"}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-primary" />}
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Ouvindo sua fala..." : `Converse em inglês com ${activeTutor.name}...`}
          disabled={isLoading}
          className="flex-1 h-9 text-xs rounded-xl bg-background"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-9 w-9 shrink-0 rounded-xl"
          title="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Modal de Escolha de Tutores (Homens e Mulheres) */}
      <TutorSelectorModal
        open={isTutorModalOpen}
        onOpenChange={setIsTutorModalOpen}
        selectedTutorId={activeTutor.id}
        audioSpeed={progress.audioSpeed || 0.85}
        onSelectTutor={handleSelectTutor}
      />
    </div>
  );
};
