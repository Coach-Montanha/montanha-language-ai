import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProgress, TutorPersona, ContextualSuggestion } from "@/types/language";
import {
  tutorChat,
  generatePhoneticGuide,
  getPortugueseTranslation,
  getDynamicSuggestions,
  isPortugueseText,
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
import { getLanguageById } from "@/data/languages";
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
  CheckSquare,
  Square,
  X,
  RotateCcw,
  Languages,
} from "lucide-react";
import { toast } from "sonner";

interface ConversationTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

// Configurações dos tamanhos de fonte sincronizadas com a acessibilidade global
const FONT_LEVELS = {
  sm: {
    label: "P",
    name: "Pequena",
    textClass: "text-sm sm:text-base",
    phoneticClass: "text-xs sm:text-sm",
    translationClass: "text-xs sm:text-sm",
    px: "14px",
  },
  md: {
    label: "M",
    name: "Padrão",
    textClass: "text-base sm:text-lg",
    phoneticClass: "text-sm sm:text-base",
    translationClass: "text-sm sm:text-base",
    px: "16px",
  },
  lg: {
    label: "G",
    name: "Grande",
    textClass: "text-lg sm:text-xl",
    phoneticClass: "text-base sm:text-lg",
    translationClass: "text-base sm:text-lg",
    px: "19px",
  },
  xl: {
    label: "GG",
    name: "Extra Grande",
    textClass: "text-xl sm:text-2xl",
    phoneticClass: "text-lg sm:text-xl",
    translationClass: "text-lg sm:text-xl",
    px: "22px",
  },
};

type FontKey = keyof typeof FONT_LEVELS;

export const ConversationTab: React.FC<ConversationTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const activeTutor = getTutorById(progress.selectedTutorId);
  const activeLanguage = getLanguageById(activeTutor.language);
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
  const [previewSpeakingText, setPreviewSpeakingText] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("smart_language_autospeak");
    return saved !== null ? saved === "true" : true;
  });

  // Modo de resposta: responder em português (com tradução automática e pronúncia nativa) vs falar direto no idioma
  const [translateFromPt, setTranslateFromPt] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("smart_language_translate_pt");
    return saved !== null ? saved === "true" : true;
  });

  const handleToggleTranslateFromPt = () => {
    const next = !translateFromPt;
    setTranslateFromPt(next);
    try {
      localStorage.setItem("smart_language_translate_pt", String(next));
    } catch {
      // ignora
    }
  };

  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer>>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isRecording]);

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
      selectedLanguage: tutor.language,
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
    const tutorLang = getLanguageById(tutorToUse.language);
    const speedToUse = overrideSpeed ?? progress.audioSpeed ?? 0.85;

    setSpeakingMessageId(msgId);
    speakText(text, {
      rate: speedToUse,
      gender: tutorToUse.gender,
      pitch: tutorToUse.speechPitch,
      lang: tutorLang.speechLangCode,
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
    setPreviewSpeakingText(null);

    setInput("");
    const isPt = translateFromPt || isPortugueseText(query, activeTutor.language);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      originalPt: isPt ? query : undefined,
      wasTranslated: isPt,
      phonetic: isPt ? undefined : generatePhoneticGuide(query, activeTutor.language),
      translationPt: isPt ? query : getPortugueseTranslation(query, activeTutor.language),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await tutorChat(query, messages, progress.geminiApiKey, activeTutor);

      if (response.userTranslatedText) {
        userMsg.text = response.userTranslatedText;
        userMsg.originalPt = response.userOriginalPt || query;
        userMsg.wasTranslated = true;
      }
      if (response.userPhonetic) {
        userMsg.phonetic = response.userPhonetic;
      }
      if (response.userTranslationPt) {
        userMsg.translationPt = response.userTranslationPt;
      }
      if (response.suggestedReplies && response.suggestedReplies.length > 0) {
        setCurrentSuggestions(response.suggestedReplies);
      }

      const tutorMsgId = `tutor-${Date.now()}`;
      const tutorMsg: ChatMessage = {
        id: tutorMsgId,
        sender: "tutor",
        text: response.replyText,
        phonetic:
          response.phonetic ||
          generatePhoneticGuide(response.replyText, activeTutor.language),
        translationPt:
          response.translationPt ||
          getPortugueseTranslation(response.replyText, activeTutor.language),
        correction: response.correction,
        timestamp: Date.now(),
      };

      const updatedHistory = [...newHistory.slice(0, -1), userMsg, tutorMsg];
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

      const speechLang = translateFromPt ? "pt-BR" : activeLanguage.speechLangCode;
      const recognizer = createSpeechRecognizer(
        {
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
        },
        undefined,
        undefined,
        speechLang
      );

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

  // Sugestões contextuais de resposta (dinâmicas, variadas e interativas: de 5 a 8 opções)
  const [currentSuggestions, setCurrentSuggestions] = useState<ContextualSuggestion[]>(() =>
    getDynamicSuggestions(activeTutor.language, "", activeTutor)
  );
  const [expandedSuggestionIndex, setExpandedSuggestionIndex] = useState<number | null>(null);

  // Atualizar sugestões sempre que o tutor ou o idioma de estudo mudar
  useEffect(() => {
    setCurrentSuggestions(getDynamicSuggestions(activeTutor.language, "", activeTutor));
    setExpandedSuggestionIndex(null);
  }, [activeTutor.id, activeTutor.language]);

  // Função para renovar / trazer sugestões frescas a qualquer momento
  const handleRefreshSuggestions = () => {
    const lastTutorMsg = [...messages].reverse().find((m) => m.sender === "tutor");
    const fresh = getDynamicSuggestions(
      activeTutor.language,
      lastTutorMsg?.text || "",
      activeTutor
    );
    setCurrentSuggestions(fresh);
    setExpandedSuggestionIndex(null);
    toast.info("Sugestões de resposta renovadas!");
  };

  // Reproduzir áudio de prévia de uma sugestão antes de enviar
  const handleSpeakPreview = (text: string) => {
    if (previewSpeakingText === text) {
      stopSpeaking();
      setPreviewSpeakingText(null);
      return;
    }
    stopSpeaking();
    setSpeakingMessageId(null);
    setPreviewSpeakingText(text);
    speakText(text, {
      rate: progress.audioSpeed || 0.85,
      gender: activeTutor.gender,
      pitch: activeTutor.speechPitch,
      lang: activeLanguage.speechLangCode,
      onEnd: () => setPreviewSpeakingText(null),
      onError: () => setPreviewSpeakingText(null),
    });
    setTimeout(() => {
      setPreviewSpeakingText((prev) => (prev === text ? null : prev));
    }, 2500);
  };

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
          className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity group cursor-pointer min-h-[44px] active:scale-95"
          title="Clique para escolher outro tutor ou tutora"
          aria-label={`Tutor atual ${activeTutor.name} (${activeLanguage.name}). Clique para trocar de tutor ou idioma`}
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
          {/* 1. CONTROLE DIRETO DE VELOCIDADE (0.7x, 0.85x, 1.0x, 1.2x) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCycleSpeed}
            className={`h-8 min-h-[40px] px-2 text-[10px] gap-1 rounded-xl border font-mono transition-all active:scale-95 cursor-pointer ${
              (progress.audioSpeed || 0.85) <= 0.75
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold"
                : (progress.audioSpeed || 0.85) === 0.85
                ? "border-primary/40 bg-primary/10 text-primary font-bold"
                : "border-border text-foreground"
            }`}
            title="Ajustar velocidade de fala (0.7x Lento, 0.85x Confortável, 1.0x Normal, 1.2x Rápido)"
            aria-label="Ajustar velocidade da fala"
          >
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{speedDisplay}</span>
          </Button>

          {/* 3. BOTÃO DE AUTO-VOZ */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleAutoSpeak}
            className={`h-8 w-8 min-h-[40px] min-w-[40px] rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              autoSpeak
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground bg-muted/40"
            }`}
            title={autoSpeak ? "Leitura automática ativada" : "Leitura automática pausada"}
            aria-label={autoSpeak ? "Desativar leitura automática da voz" : "Ativar leitura automática da voz"}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* 4. BOTÃO PARA GERENCIAR / LIMPAR MENSAGENS */}
          <Button
            variant={isSelecting ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsSelecting(!isSelecting)}
            className={`h-8 w-8 min-h-[40px] min-w-[40px] rounded-xl active:scale-95 cursor-pointer flex items-center justify-center ${
              isSelecting ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            title={isSelecting ? "Sair do modo de seleção" : "Selecionar mensagens para apagar"}
            aria-label={isSelecting ? "Sair da seleção de mensagens" : "Selecionar mensagens para apagar"}
          >
            {isSelecting ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearAllChat}
            className="h-8 w-8 min-h-[40px] min-w-[40px] rounded-xl text-muted-foreground hover:text-destructive active:scale-95 cursor-pointer flex items-center justify-center"
            title="Apagar todas as mensagens da conversa"
            aria-label="Limpar todas as mensagens da conversa"
          >
            <Trash2 className="h-4 w-4" />
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
            <span>
              {translateFromPt
                ? `Ouvindo em Português... Traduziremos automaticamente para ${activeLanguage.name}`
                : `Ouvindo sua voz... Fale direto em ${activeLanguage.name}`}
            </span>
          </div>
          <button
            onClick={handleStopRecording}
            className="text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
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

          const phoneticText = msg.phonetic || generatePhoneticGuide(msg.text, activeTutor.language);
          const translationText = msg.translationPt || getPortugueseTranslation(msg.text, activeTutor.language);

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
                  {/* Badge sutil quando a mensagem foi traduzida do português */}
                  {isUser && msg.wasTranslated && (
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold bg-black/25 dark:bg-black/40 text-primary-foreground/95 px-2 py-0.5 rounded-md w-fit border border-primary-foreground/20">
                      <span>🇧🇷</span>
                      <span>Traduzido para {activeLanguage.name}</span>
                    </div>
                  )}

                  {/* Botão sutil para apagar esta mensagem individual */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSingleMessage(msg.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 text-muted-foreground hover:text-destructive active:scale-95 transition-all cursor-pointer"
                    title="Apagar esta mensagem"
                    aria-label="Apagar esta mensagem"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Texto Principal da Mensagem com Linha Confortável e Escala Controlável */}
                  <p className={`${fontConfig.textClass} font-medium pr-3 leading-relaxed tracking-normal max-w-prose select-text`}>
                    {msg.text}
                  </p>

                  {/* 1. Elementos da Mensagem do Tutor: Fonética & Tradução */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-border/50 space-y-1.5 text-left">
                      {phoneticText && (
                        <div className="flex items-start gap-1.5 bg-primary/5 rounded-lg px-2 py-1.5 border border-primary/15">
                          <span className="text-xs select-none">🗣️</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-primary block leading-none mb-0.5">
                              Como Falar (Fonética):
                            </span>
                            <p className={`font-mono text-primary font-semibold tracking-wide leading-relaxed py-0.5 select-text ${fontConfig.phoneticClass}`}>
                              [{phoneticText}]
                            </p>
                          </div>
                        </div>
                      )}

                      {translationText && (
                        <div className="flex items-start gap-1.5 bg-muted/40 rounded-lg px-2 py-1.5 border border-border/40">
                          <span className="text-xs select-none">🇧🇷</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-muted-foreground block leading-none mb-0.5">
                              Tradução em Português:
                            </span>
                            <p className={`text-foreground/90 font-medium leading-relaxed py-0.5 select-text ${fontConfig.translationClass}`}>
                              {translationText}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Botão de Ouvir Tutor com Soundwave Animado */}
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        aria-label={isSpeakingThis ? "Pausar fala do tutor" : `Ouvir pronúncia oficial (${speedDisplay})`}
                        className={`mt-1.5 flex items-center gap-2 text-[11px] font-semibold transition-all px-2.5 py-1.5 rounded-xl active:scale-95 min-h-[38px] cursor-pointer ${
                          isSpeakingThis
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        title={isSpeakingThis ? "Pausar fala" : `Ouvir pronúncia (${speedDisplay})`}
                      >
                        {isSpeakingThis ? (
                          <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden="true">
                            <span className="w-1 bg-current rounded-full animate-wave-1" />
                            <span className="w-1 bg-current rounded-full animate-wave-2" />
                            <span className="w-1 bg-current rounded-full animate-wave-3" />
                          </span>
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                        <span>
                          {isSpeakingThis ? "Falando pronúncia nativa..." : `Ouvir pronúncia (${speedDisplay})`}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* 2. Elementos da Mensagem do Usuário: Ler Fonética, Ler Tradução / Original PT e Ouvir Minha Resposta */}
                  {isUser && (phoneticText || translationText || msg.originalPt) && (
                    <div className="mt-2.5 pt-2 border-t border-primary-foreground/20 space-y-1.5 text-left">
                      {phoneticText && (
                        <div className="flex items-start gap-1.5 bg-black/20 dark:bg-black/30 rounded-lg px-2 py-1.5 border border-primary-foreground/15">
                          <span className="text-xs select-none">🗣️</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-primary-foreground/90 block leading-none mb-0.5">
                              Como Falar (Sua Pronúncia em {activeLanguage.name}):
                            </span>
                            <p className={`font-mono text-primary-foreground font-semibold tracking-wide leading-relaxed py-0.5 select-text ${fontConfig.phoneticClass}`}>
                              [{phoneticText}]
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Exibir o que o usuário falou/digitou originalmente em português */}
                      {msg.originalPt ? (
                        <div className="flex items-start gap-1.5 bg-black/15 dark:bg-black/25 rounded-lg px-2 py-1.5 border border-primary-foreground/10">
                          <span className="text-xs select-none">🇧🇷</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-primary-foreground/80 block leading-none mb-0.5">
                              O que você falou / digitou em Português:
                            </span>
                            <p className={`text-primary-foreground font-medium leading-relaxed py-0.5 select-text ${fontConfig.translationClass}`}>
                              "{msg.originalPt}"
                            </p>
                          </div>
                        </div>
                      ) : translationText ? (
                        <div className="flex items-start gap-1.5 bg-black/15 dark:bg-black/25 rounded-lg px-2 py-1.5 border border-primary-foreground/10">
                          <span className="text-xs select-none">🇧🇷</span>
                          <div className="flex-1">
                            <span className="text-[9px] font-bold text-primary-foreground/80 block leading-none mb-0.5">
                              Significado em Português:
                            </span>
                            <p className={`text-primary-foreground font-medium leading-relaxed py-0.5 select-text ${fontConfig.translationClass}`}>
                              {translationText}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {/* Botão de Ouvir Minha Resposta em Pronúncia Nativa com Soundwave Animado */}
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        aria-label={isSpeakingThis ? "Pausar fala da sua resposta" : `Ouvir pronúncia da minha resposta em ${activeLanguage.name} (${speedDisplay})`}
                        className={`mt-1.5 flex items-center gap-2 text-[11px] font-semibold transition-all px-2.5 py-1.5 rounded-xl active:scale-95 min-h-[38px] cursor-pointer ${
                          isSpeakingThis
                            ? "bg-white/30 text-white font-bold"
                            : "bg-white/15 hover:bg-white/25 text-primary-foreground"
                        }`}
                        title={isSpeakingThis ? "Pausar fala" : `Ouvir pronúncia da minha resposta em ${activeLanguage.name} (${speedDisplay})`}
                      >
                        {isSpeakingThis ? (
                          <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden="true">
                            <span className="w-1 bg-current rounded-full animate-wave-1" />
                            <span className="w-1 bg-current rounded-full animate-wave-2" />
                            <span className="w-1 bg-current rounded-full animate-wave-3" />
                          </span>
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                        <span>
                          {isSpeakingThis
                            ? `Ouvindo sua resposta em ${activeLanguage.name}...`
                            : `Ouvir minha resposta em ${activeLanguage.name} (${speedDisplay})`}
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

      {/* Sugestões de Respostas Ricas & Contextuais (com Fonética, Tradução e Áudio de Prévia) */}
      <div className="p-2 border-t border-border/50 bg-background/95 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-foreground font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Sugestões de Resposta ({currentSuggestions.length} opções):
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefreshSuggestions}
            className="h-7 min-h-[36px] text-[10px] px-2.5 gap-1 text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
            title="Trazer novas sugestões de fala"
            aria-label="Trazer novas sugestões de resposta"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Novas Sugestões</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
          {currentSuggestions.map((sug, idx) => {
            const isExpanded = expandedSuggestionIndex === idx;
            const isPreviewPlaying = previewSpeakingText === sug.text;

            return (
              <div
                key={`${sug.text}-${idx}`}
                className={`flex flex-col rounded-xl border transition-all ${
                  isExpanded
                    ? "w-full border-primary/40 bg-primary/5 p-2 shadow-xs"
                    : "border-border/70 bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-1 p-0.5 sm:p-1">
                  {/* Botão de Enviar Direto */}
                  <button
                    type="button"
                    onClick={() => handleSend(sug.text)}
                    className="text-[11px] font-medium text-foreground hover:text-primary transition-colors text-left px-2 py-1.5 min-h-[38px] rounded-lg hover:bg-primary/10 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    title={`Enviar resposta: "${sug.text}"`}
                    aria-label={`Enviar resposta rápida: "${sug.text}"`}
                  >
                    <span className="font-semibold text-xs">{sug.label}</span>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[140px]">
                      {sug.text}
                    </span>
                  </button>

                  {/* Botão de Ouvir Prévia em Áudio com Soundwave */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakPreview(sug.text);
                    }}
                    className={`h-8 w-8 min-h-[36px] min-w-[36px] p-1.5 rounded-lg active:scale-95 transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                      isPreviewPlaying
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                    }`}
                    title={isPreviewPlaying ? "Pausar prévia" : "Ouvir pronúncia desta frase antes de enviar"}
                    aria-label={isPreviewPlaying ? "Pausar prévia da pronúncia" : `Ouvir prévia de pronúncia de "${sug.text}"`}
                  >
                    {isPreviewPlaying ? (
                      <span className="flex items-center gap-0.5 h-3 px-0.5" aria-hidden="true">
                        <span className="w-0.5 bg-current rounded-full animate-wave-1" />
                        <span className="w-0.5 bg-current rounded-full animate-wave-2" />
                        <span className="w-0.5 bg-current rounded-full animate-wave-3" />
                      </span>
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Botão de Ver Fonética e Tradução */}
                  <button
                    type="button"
                    onClick={() => setExpandedSuggestionIndex(isExpanded ? null : idx)}
                    className={`text-[9.5px] px-2 py-1 min-h-[36px] rounded-lg border transition-all active:scale-95 shrink-0 font-medium flex items-center cursor-pointer ${
                      isExpanded
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-muted text-muted-foreground border-border/50 hover:text-foreground"
                    }`}
                    title="Ver pronúncia fonética e tradução em português"
                    aria-label={isExpanded ? "Ocultar fonética e tradução" : "Ver fonética e tradução da sugestão"}
                  >
                    {isExpanded ? "Ocultar" : "Fonética"}
                  </button>
                </div>

                {/* Bloco Expandido de Fonética e Tradução */}
                {isExpanded && (
                  <div className="mt-1 pt-1.5 border-t border-border/40 text-left text-[11px] space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground leading-relaxed max-w-prose select-text">{sug.text}</p>
                      <Button
                        size="sm"
                        onClick={() => handleSend(sug.text)}
                        className="h-8 min-h-[36px] text-[10px] px-2.5 gap-1 rounded-xl shrink-0 active:scale-95 cursor-pointer"
                        aria-label={`Enviar resposta: "${sug.text}"`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Enviar</span>
                      </Button>
                    </div>
                    <div className="flex items-start gap-1 bg-primary/10 rounded-lg px-2 py-1 border border-primary/20">
                      <span className="text-[10px] select-none">🗣️</span>
                      <p className="text-primary font-mono text-[10px] font-semibold leading-relaxed select-text">
                        [{sug.phonetic}]
                      </p>
                    </div>
                    <div className="flex items-start gap-1 bg-muted/60 rounded-lg px-2 py-1 border border-border/40">
                      <span className="text-[10px] select-none">🇧🇷</span>
                      <p className="text-muted-foreground text-[10px] leading-relaxed select-text">
                        {sug.translationPt}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Seletor de Modo de Resposta (Português com Tradução Automática vs Falar Direto no Idioma) */}
      <div className="px-3 py-1.5 bg-muted/40 border-t border-border/70 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Languages className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">
            {translateFromPt ? (
              <>
                <span className="font-semibold text-foreground">Modo Tradução Ativo:</span> responda em Português 🇧🇷
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">Modo Direto:</span> fale/digite direto em {activeLanguage.flag} {activeLanguage.name}
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleTranslateFromPt}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
            translateFromPt
              ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
              : "bg-background text-muted-foreground border-border hover:text-foreground"
          }`}
          title={
            translateFromPt
              ? `Clique para alternar: Falar/digitar direto em ${activeLanguage.name}`
              : `Clique para alternar: Responder em Português com tradução automática para ${activeLanguage.name}`
          }
          aria-label={
            translateFromPt
              ? `Desativar tradução e falar direto em ${activeLanguage.name}`
              : `Ativar tradução de Português para ${activeLanguage.name}`
          }
        >
          {translateFromPt ? (
            <>
              <span>🇧🇷 ➔ {activeLanguage.flag}</span>
              <span className="hidden sm:inline">Traduzir p/ {activeLanguage.name}</span>
              <span className="sm:hidden">Traduzir</span>
            </>
          ) : (
            <>
              <span>{activeLanguage.flag}</span>
              <span className="hidden sm:inline">Falar direto em {activeLanguage.name}</span>
              <span className="sm:hidden">Direto</span>
            </>
          )}
        </button>
      </div>

      {/* Barra de Entrada (Texto + Microfone) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 border-t border-border bg-card/60 flex items-center gap-2"
      >
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
            isRecording ? "animate-pulse ring-2 ring-red-400 shadow-md shadow-red-500/20" : ""
          }`}
          title={isRecording ? "Parar gravação" : "Falar no microfone (Reconhecimento de fala)"}
          aria-label={isRecording ? "Parar gravação de voz" : "Falar no microfone (reconhecimento de fala)"}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-primary" />}
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isRecording
              ? translateFromPt
                ? "Ouvindo sua fala em Português..."
                : `Ouvindo sua fala em ${activeLanguage.name}...`
              : translateFromPt
              ? `Digite em Português ou em ${activeLanguage.name}...`
              : `Converse em ${activeLanguage.name} com ${activeTutor.name}...`
          }
          disabled={isLoading}
          className="flex-1 h-11 text-xs sm:text-sm rounded-2xl bg-background px-3 border-border/80"
          aria-label={
            translateFromPt
              ? `Mensagem em Português para traduzir para ${activeLanguage.name}`
              : `Mensagem em ${activeLanguage.name}`
          }
        />

        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 rounded-2xl active:scale-95 cursor-pointer flex items-center justify-center transition-transform"
          title="Enviar mensagem"
          aria-label="Enviar mensagem"
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
        currentLanguage={activeLanguage.id}
      />
    </div>
  );
};
