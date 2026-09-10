import React, { useState, useRef, useEffect } from "react";
import {
  ChatMessage,
  UserProgress,
  TutorPersona,
  ContextualSuggestion,
  LearnerProfileMemory,
} from "@/types/language";
import {
  tutorChat,
  generatePhoneticGuide,
  getPortugueseTranslation,
  getDynamicSuggestions,
  isPortugueseText,
  translatePortugueseOffline,
} from "@/services/ai-engine";
import {
  speakText,
  stopSpeaking,
  bargeInInterrupt,
  registerBargeInListener,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/services/speech";
import {
  saveChatHistory,
  loadChatHistory,
  addXP,
  loadLearnerMemory,
  updateLearnerMemoryFromInteraction,
  clearLearnerMemory,
} from "@/services/storage";
import {
  playMessageSentSound,
  playOptionSelectSound,
  playSuccessSound,
  playCorrectionChime,
  playMicStartSound,
  playMicStopSound,
} from "@/services/audio-effects";
import { getTutorById } from "@/data/tutors";
import { getLanguageById } from "@/data/languages";
import { TutorSelectorModal } from "@/components/TutorSelectorModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Brain,
  CheckCircle2,
  MoreVertical,
  PhoneCall,
} from "lucide-react";
import { toast } from "sonner";

interface ConversationTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onOpenVoiceCall?: (() => void) | undefined;
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
  onOpenVoiceCall,
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

  // Estados para exibição progressiva sob demanda (Fonética e Tradução)
  const [expandedPhoneticIds, setExpandedPhoneticIds] = useState<Record<string, boolean>>({});
  const [expandedTranslationIds, setExpandedTranslationIds] = useState<Record<string, boolean>>({});

  const togglePhonetic = (id: string) => {
    setExpandedPhoneticIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTranslation = (id: string) => {
    setExpandedTranslationIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Memória Conversacional Tiered do Aluno
  const [learnerMemory, setLearnerMemory] = useState<LearnerProfileMemory>(() =>
    loadLearnerMemory(activeTutor.language)
  );
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  useEffect(() => {
    setLearnerMemory(loadLearnerMemory(activeTutor.language));
  }, [activeTutor.language]);

  // Registro do Listener de Barge-In (interrupção imediata de fala)
  useEffect(() => {
    const unregister = registerBargeInListener(() => {
      setSpeakingMessageId(null);
      setPreviewSpeakingText(null);
    });
    return unregister;
  }, []);

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
    const newMsgs = [...messages, tutorMsg];
    setMessages(newMsgs);
    saveChatHistory(newMsgs);

    if (autoSpeak && isSpeechSynthesisSupported()) {
      handleSpeakMessage(tutorMsg.id, tutor.initialGreeting, progress.audioSpeed, tutor);
    }

    toast.success(`Tutor alterado para ${tutor.name} (${tutor.city})!`);
  };

  // Ouvir mensagem individual
  const handleSpeakMessage = (
    msgId: string,
    text: string,
    overrideSpeed?: number,
    overrideTutor?: TutorPersona
  ) => {
    if (speakingMessageId === msgId) {
      bargeInInterrupt();
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

  // Envio de mensagem com gravação de som procedural e injeção de memória
  const handleSend = async (textToSend?: string, suggestionMeta?: ContextualSuggestion) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    bargeInInterrupt();
    setSpeakingMessageId(null);
    setPreviewSpeakingText(null);
    playMessageSentSound();

    setInput("");

    const hasTargetNativeScript =
      (activeTutor.language === "ru" && /[а-яА-ЯёЁ]/.test(query)) ||
      (activeTutor.language === "el-koine" && /[α-ωΑ-Ω]/.test(query)) ||
      (activeTutor.language === "ja" && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(query));

    // Apenas é traduzido do português se:
    // 1. NÃO for uma sugestão rápida pré-selecionada (já vem na língua alvo com tradução perfeita)
    // 2. NÃO contiver alfabeto nativo não-latino (cirílico, grego, japonês NUNCA são português)
    // 3. O modo tradução estiver ativo OU o texto for detectado como português
    const isPt = !suggestionMeta && !hasTargetNativeScript && (translateFromPt || isPortugueseText(query, activeTutor.language));
    const initialTrans = isPt ? translatePortugueseOffline(query, activeTutor.language) : null;
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: isPt ? (initialTrans ? initialTrans.translated : query) : query,
      originalPt: isPt ? query : undefined,
      wasTranslated: isPt,
      phonetic: suggestionMeta
        ? suggestionMeta.phonetic
        : (initialTrans
            ? initialTrans.phonetic
            : generatePhoneticGuide(query, activeTutor.language)),
      translationPt: suggestionMeta
        ? suggestionMeta.translationPt
        : (isPt
            ? query
            : getPortugueseTranslation(query, activeTutor.language)),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await tutorChat(
        query,
        messages,
        progress.geminiApiKey,
        activeTutor,
        learnerMemory,
        isPt
      );

      if (isPt) {
        if (response.userTranslatedText) {
          userMsg.text = response.userTranslatedText;
        }
        if (response.userPhonetic) {
          userMsg.phonetic = response.userPhonetic;
        }
        userMsg.originalPt = response.userOriginalPt || query;
        userMsg.wasTranslated = true;
        userMsg.translationPt = response.userTranslationPt || query;
      } else if (suggestionMeta) {
        // Preserva integralmente a fonética e a tradução oficial da sugestão escolhida
        userMsg.text = suggestionMeta.text;
        userMsg.phonetic = suggestionMeta.phonetic;
        userMsg.translationPt = suggestionMeta.translationPt;
        userMsg.wasTranslated = false;
        userMsg.originalPt = undefined;
      } else {
        if (response.userTranslatedText) {
          userMsg.text = response.userTranslatedText;
        }
        if (response.userPhonetic) {
          userMsg.phonetic = response.userPhonetic;
        }
        if (
          response.userTranslationPt &&
          !/[а-яА-ЯёЁ]/.test(response.userTranslationPt) &&
          !/[α-ωΑ-Ω]/.test(response.userTranslationPt) &&
          !/[\u3040-\u30ff]/.test(response.userTranslationPt)
        ) {
          userMsg.translationPt = response.userTranslationPt;
        }
        userMsg.wasTranslated = false;
        userMsg.originalPt = undefined;
      }
      if (response.suggestedReplies && response.suggestedReplies.length > 0) {
        setCurrentSuggestions(response.suggestedReplies);
      }

      // Atualiza a memória conversacional orgânica do aluno
      const updatedMem = updateLearnerMemoryFromInteraction(
        activeTutor.language,
        activeTutor.id,
        query,
        response.correction
      );
      setLearnerMemory(updatedMem);

      if (response.correction?.hasError) {
        playCorrectionChime();
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

  // Entrada por voz (STT) com Barge-In instantâneo e feedback sonoro
  const handleStartRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome ou Edge."
      );
      return;
    }

    bargeInInterrupt(); // Barge-in imediato
    setSpeakingMessageId(null);
    playMicStartSound();

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
            playMicStopSound();
            if (finalText.trim()) {
              handleSend(finalText.trim());
            }
          },
          onError: (err) => {
            setIsRecording(false);
            playMicStopSound();
            toast.error(err);
          },
          onEnd: () => {
            setIsRecording(false);
            playMicStopSound();
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
      playMicStopSound();
      toast.error("Não foi possível iniciar o microfone.");
    }
  };

  const handleStopRecording = () => {
    playMicStopSound();
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

  // Atualizar sugestões sempre que o tutor ou o idioma de estudo mudar
  useEffect(() => {
    setCurrentSuggestions(getDynamicSuggestions(activeTutor.language, "", activeTutor));
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
      {/* Topo do Chat Limpo com Perfil do Tutor, Áudio e Menu de Opções */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/40 rounded-t-xl gap-2">
        {/* Tutor Ativo (Clicável para abrir catálogo) */}
        <button
          type="button"
          onClick={() => setIsTutorModalOpen(true)}
          className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity group cursor-pointer min-h-[44px] py-1 active:scale-98 min-w-0"
          title="Clique para escolher outro tutor ou idioma"
          aria-label={`Tutor atual ${activeTutor.name} (${activeLanguage.name}). Toque para trocar`}
        >
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              {activeTutor.avatar}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                {activeTutor.name}
              </span>
              <span className="text-xs shrink-0">{activeTutor.flag}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
              {activeTutor.city} &bull; <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
            </p>
          </div>
        </button>

        {/* Controles de Áudio e Menu Expandido */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Botão de Chamada Hands-Free */}
          {onOpenVoiceCall && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenVoiceCall}
              className="h-9 w-9 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 cursor-pointer flex items-center justify-center relative"
              title="Iniciar Chamada de Voz com o Tutor (Hands-free)"
              aria-label="Iniciar chamada de voz com o tutor"
            >
              <PhoneCall className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            </Button>
          )}

          {/* Botão Rápido de Auto-Voz */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleAutoSpeak}
            className={`h-9 w-9 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              autoSpeak
                ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
            title={autoSpeak ? "Leitura automática ativada (clique para silenciar)" : "Leitura silenciada (clique para ativar)"}
            aria-label={autoSpeak ? "Desativar fala automática" : "Ativar fala automática"}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* Menu com Todas as Opções Avançadas (Sem poluição na tela) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer flex items-center justify-center"
                title="Mais opções da conversa"
                aria-label="Mais opções da conversa"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl">
              {onOpenVoiceCall && (
                <DropdownMenuItem
                  onClick={onOpenVoiceCall}
                  className="flex items-center gap-2.5 cursor-pointer py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <PhoneCall className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">Chamada de Voz</div>
                    <div className="text-[10px] opacity-80 truncate">Prática oral hands-free</div>
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => setShowMemoryModal(true)}
                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
              >
                <Brain className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">Memória do Aluno</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {learnerMemory.topicsDiscussed.length} tópicos registrados
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleCycleSpeed}
                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
              >
                <Gauge className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">Velocidade da Voz</div>
                  <div className="text-[10px] text-muted-foreground">{speedDisplay}</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsTutorModalOpen(true)}
                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
              >
                <Languages className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">Trocar Tutor / Idioma</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {activeTutor.name} ({activeLanguage.name})
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setIsSelecting(!isSelecting)}
                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs"
              >
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <span>{isSelecting ? "Sair do modo de seleção" : "Selecionar mensagens"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleClearAllChat}
                className="flex items-center gap-2.5 cursor-pointer py-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span>Limpar histórico do chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Área de Mensagens com Fonética, Tradução e Tamanho de Fonte Controlável */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSpeakingThis = speakingMessageId === msg.id;
          const isMsgSelected = selectedIds.includes(msg.id);

          const phoneticText = msg.phonetic || generatePhoneticGuide(msg.text, activeTutor.language);
          const translationText = msg.translationPt || getPortugueseTranslation(msg.text, activeTutor.language);

          // Validação estrita: uma mensagem só é "traduzida do português" se foi sinalizada como tal,
          // possuir texto original e o texto original NÃO contiver alfabetos não-latinos (cirílico, grego, japonês)
          const isActuallyTranslatedFromPt = Boolean(
            isUser &&
              msg.wasTranslated &&
              msg.originalPt &&
              !/[а-яА-ЯёЁ]/.test(msg.originalPt) &&
              !/[α-ωΑ-Ω]/.test(msg.originalPt) &&
              !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(msg.originalPt)
          );

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
                  {isActuallyTranslatedFromPt && (
                    <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold bg-black/25 dark:bg-black/40 text-primary-foreground/95 px-2 py-0.5 rounded-md w-fit border border-primary-foreground/20">
                      <span>🇧🇷 ➔ {activeLanguage.flag}</span>
                      <span>Traduzido</span>
                    </div>
                  )}

                  {/* Botão sutil para apagar esta mensagem individual */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSingleMessage(msg.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-70 hover:opacity-100 min-h-[32px] min-w-[32px] flex items-center justify-center p-1 text-muted-foreground hover:text-destructive active:scale-95 transition-all cursor-pointer"
                    title="Apagar esta mensagem"
                    aria-label="Apagar esta mensagem"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {/* Texto Principal da Mensagem */}
                  <p className={`${fontConfig.textClass} font-medium pr-3 leading-relaxed tracking-normal select-text`}>
                    {msg.text}
                  </p>

                  {/* 1. Elementos Interativos da Mensagem do Tutor */}
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-border/40 text-left">
                      {/* Barra de Ações Compacta: Ouvir + Pills de Fonética e Tradução */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          aria-label={isSpeakingThis ? "Pausar fala" : "Ouvir pronúncia"}
                          className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all active:scale-95 cursor-pointer ${
                            isSpeakingThis
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                          title={isSpeakingThis ? "Pausar fala" : `Ouvir pronúncia (${speedDisplay})`}
                        >
                          {isSpeakingThis ? (
                            <span className="flex items-center gap-0.5 h-3 px-0.5" aria-hidden="true">
                              <span className="w-0.5 bg-current rounded-full animate-wave-1" />
                              <span className="w-0.5 bg-current rounded-full animate-wave-2" />
                              <span className="w-0.5 bg-current rounded-full animate-wave-3" />
                            </span>
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span>{isSpeakingThis ? "Falando..." : "Ouvir"}</span>
                        </button>

                        {/* Botão Rápido de 0.75x no Balão */}
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg.id, msg.text, 0.75)}
                          aria-label="Ouvir em velocidade lenta (0.75x)"
                          className="flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer bg-muted/40 text-muted-foreground border border-border/40 hover:text-foreground hover:bg-muted"
                          title="Ouvir pronúncia pausada / lenta (0.75x)"
                        >
                          <span>🐢</span>
                          <span>0.75x</span>
                        </button>

                        {phoneticText && (
                          <button
                            type="button"
                            onClick={() => togglePhonetic(msg.id)}
                            className={`flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              expandedPhoneticIds[msg.id]
                                ? "bg-primary/20 text-primary border-primary/30 font-semibold"
                                : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted"
                            }`}
                            title="Ver ou ocultar pronúncia fonética"
                          >
                            <span>🗣️</span>
                            <span>{expandedPhoneticIds[msg.id] ? "Ocultar" : "Fonética"}</span>
                          </button>
                        )}

                        {translationText && (
                          <button
                            type="button"
                            onClick={() => toggleTranslation(msg.id)}
                            className={`flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              expandedTranslationIds[msg.id]
                                ? "bg-primary/20 text-primary border-primary/30 font-semibold"
                                : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted"
                            }`}
                            title="Ver ou ocultar tradução em português"
                          >
                            <span>🇧🇷</span>
                            <span>{expandedTranslationIds[msg.id] ? "Ocultar" : "Tradução"}</span>
                          </button>
                        )}
                      </div>

                      {/* Gaveta de Fonética (Exibida sob demanda) */}
                      {phoneticText && expandedPhoneticIds[msg.id] && (
                        <div className="mt-2 bg-primary/5 rounded-lg p-2 border border-primary/15 animate-in fade-in slide-in-from-top-1 text-left">
                          <span className="text-[9px] font-bold text-primary block leading-none mb-0.5">
                            Como Falar (Fonética):
                          </span>
                          <p className={`font-mono text-primary font-semibold tracking-wide py-0.5 select-text ${fontConfig.phoneticClass}`}>
                            [{phoneticText}]
                          </p>
                        </div>
                      )}

                      {/* Gaveta de Tradução (Exibida sob demanda) */}
                      {translationText && expandedTranslationIds[msg.id] && (
                        <div className="mt-2 bg-muted/40 rounded-lg p-2 border border-border/40 animate-in fade-in slide-in-from-top-1 text-left">
                          <span className="text-[9px] font-bold text-muted-foreground block leading-none mb-0.5">
                            Tradução em Português:
                          </span>
                          <p className={`text-foreground/90 font-medium py-0.5 select-text ${fontConfig.translationClass}`}>
                            {translationText}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Elementos Interativos da Mensagem do Usuário */}
                  {isUser && (
                    <div className="mt-2 pt-2 border-t border-primary-foreground/20 text-left">
                      {/* Barra de Ações Compacta: Ouvir Resposta + Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          aria-label={isSpeakingThis ? "Pausar fala" : "Ouvir minha resposta"}
                          className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all active:scale-95 cursor-pointer ${
                            isSpeakingThis
                              ? "bg-white/30 text-white font-bold"
                              : "bg-white/15 hover:bg-white/25 text-primary-foreground"
                          }`}
                          title={isSpeakingThis ? "Pausar fala" : "Ouvir minha resposta"}
                        >
                          {isSpeakingThis ? (
                            <span className="flex items-center gap-0.5 h-3 px-0.5" aria-hidden="true">
                              <span className="w-0.5 bg-current rounded-full animate-wave-1" />
                              <span className="w-0.5 bg-current rounded-full animate-wave-2" />
                              <span className="w-0.5 bg-current rounded-full animate-wave-3" />
                            </span>
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span>{isSpeakingThis ? "Falando..." : "Ouvir"}</span>
                        </button>

                        {phoneticText && (
                          <button
                            type="button"
                            onClick={() => togglePhonetic(msg.id)}
                            className={`flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              expandedPhoneticIds[msg.id]
                                ? "bg-white/30 text-white border-white/40 font-semibold"
                                : "bg-white/10 text-primary-foreground/90 border-white/20 hover:bg-white/20"
                            }`}
                            title="Ver ou ocultar fonética da sua fala"
                          >
                            <span>🗣️</span>
                            <span>{expandedPhoneticIds[msg.id] ? "Ocultar" : "Fonética"}</span>
                          </button>
                        )}

                        {(isActuallyTranslatedFromPt ? msg.originalPt : (translationText || msg.translationPt)) && (
                          <button
                            type="button"
                            onClick={() => toggleTranslation(msg.id)}
                            className={`flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              expandedTranslationIds[msg.id]
                                ? "bg-white/30 text-white border-white/40 font-semibold"
                                : "bg-white/10 text-primary-foreground/90 border-white/20 hover:bg-white/20"
                            }`}
                            title={isActuallyTranslatedFromPt ? "Ver o que você digitou em português" : "Ver significado em português"}
                          >
                            <span>🇧🇷</span>
                            <span>
                              {expandedTranslationIds[msg.id]
                                ? "Ocultar"
                                : isActuallyTranslatedFromPt
                                ? "Original 🇧🇷"
                                : "Tradução 🇧🇷"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Gaveta de Fonética Usuário */}
                      {phoneticText && expandedPhoneticIds[msg.id] && (
                        <div className="mt-2 bg-black/25 dark:bg-black/35 rounded-lg p-2 border border-primary-foreground/15 animate-in fade-in slide-in-from-top-1 text-left">
                          <span className="text-[9px] font-bold text-primary-foreground/90 block leading-none mb-0.5">
                            Como Falar (Sua Pronúncia em {activeLanguage.name}):
                          </span>
                          <p className={`font-mono text-primary-foreground font-semibold tracking-wide py-0.5 select-text ${fontConfig.phoneticClass}`}>
                            [{phoneticText}]
                          </p>
                        </div>
                      )}

                      {/* Gaveta de Original / Tradução Português */}
                      {(isActuallyTranslatedFromPt ? msg.originalPt : (translationText || msg.translationPt)) && expandedTranslationIds[msg.id] && (
                        <div className="mt-2 bg-black/20 dark:bg-black/30 rounded-lg p-2 border border-primary-foreground/10 animate-in fade-in slide-in-from-top-1 text-left">
                          <span className="text-[9px] font-bold text-primary-foreground/80 block leading-none mb-0.5">
                            {isActuallyTranslatedFromPt
                              ? "O que você falou / digitou em Português:"
                              : "Significado em Português:"}
                          </span>
                          <p className={`text-primary-foreground font-medium py-0.5 select-text ${fontConfig.translationClass}`}>
                            "{isActuallyTranslatedFromPt ? msg.originalPt : (translationText || msg.translationPt)}"
                          </p>
                        </div>
                      )}
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

              {/* Balão de Correção do Tutor */}
              {msg.correction && msg.correction.hasError && (
                <div className="mt-1.5 max-w-[92%] sm:max-w-[88%] rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-left space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Dica de {activeTutor.name}:</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Você disse: <span className="line-through text-destructive">{msg.correction.original}</span> &bull; Como falar: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{msg.correction.corrected}</span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 text-[10.5px] font-medium italic border-t border-amber-500/20 pt-1">
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

      {/* Sugestões de Respostas em Carrossel Horizontal Fluido */}
      {currentSuggestions && currentSuggestions.length > 0 && (
        <div className="px-3 py-1.5 border-t border-border/40 bg-card/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Sugestões rápidas
            </span>
            <button
              type="button"
              onClick={handleRefreshSuggestions}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded-md active:scale-95 transition-all cursor-pointer"
              title="Trazer novas sugestões de resposta"
              aria-label="Novas sugestões"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Novas</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth">
            {currentSuggestions.map((sug, idx) => {
              const isPreviewPlaying = previewSpeakingText === sug.text;

              return (
                <div
                  key={`${sug.text}-${idx}`}
                  className="flex items-center shrink-0 bg-card hover:bg-accent/40 border border-border/70 hover:border-primary/40 rounded-full pl-3 pr-1 py-1 transition-all shadow-2xs group"
                >
                  {/* Botão de Enviar Direto */}
                  <button
                    type="button"
                    onClick={() => handleSend(sug.text, sug)}
                    className="flex items-center gap-1.5 text-left cursor-pointer active:scale-95"
                    title={`Enviar: "${sug.text}" • Tradução: "${sug.translationPt}"`}
                    aria-label={`Enviar resposta: "${sug.text}"`}
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sug.label}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground max-w-[140px] truncate hidden xs:inline">
                      {sug.text}
                    </span>
                  </button>

                  {/* Botão de Ouvir Prévia em Áudio */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakPreview(sug.text);
                    }}
                    className={`h-6 w-6 ml-1 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isPreviewPlaying
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    title={isPreviewPlaying ? "Pausar prévia" : `Ouvir pronúncia de "${sug.text}"`}
                    aria-label={`Ouvir pronúncia de "${sug.text}"`}
                  >
                    {isPreviewPlaying ? (
                      <span className="flex items-center gap-0.5 h-2.5">
                        <span className="w-0.5 bg-current rounded-full animate-wave-1" />
                        <span className="w-0.5 bg-current rounded-full animate-wave-2" />
                      </span>
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicador Ativo de Turnos e Barge-In */}
      {(isRecording || speakingMessageId || isLoading) && (
        <div className="px-3 py-1 bg-muted/40 border-t border-border/40 flex items-center justify-between text-[11px] animate-in fade-in transition-all">
          {isRecording ? (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>
                Gravando voz em {translateFromPt ? "Português 🇧🇷" : activeLanguage.name}...
              </span>
            </div>
          ) : speakingMessageId ? (
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
              <span>{activeTutor.name} falando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <Bot className="h-3.5 w-3.5 animate-spin" />
              <span>{activeTutor.name} digitando...</span>
            </div>
          )}

          {speakingMessageId && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                bargeInInterrupt();
                setSpeakingMessageId(null);
              }}
              className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-1.5 underline cursor-pointer"
            >
              Parar
            </Button>
          )}
        </div>
      )}

      {/* Barra de Entrada com Tradução Integrada */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 border-t border-border/60 bg-card/60 flex items-center gap-2"
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
          aria-label={isRecording ? "Parar gravação de voz" : "Falar no microfone"}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-primary" />}
        </Button>

        <div className="relative flex-1 flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? translateFromPt
                  ? "Ouvindo em Português..."
                  : `Ouvindo em ${activeLanguage.name}...`
                : translateFromPt
                ? `Digite em Português (traduz p/ ${activeLanguage.name})...`
                : `Converse em ${activeLanguage.name}...`
            }
            disabled={isLoading}
            className="h-11 text-xs sm:text-sm rounded-2xl bg-background pl-3 pr-16 border-border/80"
            aria-label={
              translateFromPt
                ? `Mensagem em Português para traduzir para ${activeLanguage.name}`
                : `Mensagem em ${activeLanguage.name}`
            }
          />

          {/* Badge Interativo de Alternância de Idioma Embutido no Input */}
          <button
            type="button"
            onClick={handleToggleTranslateFromPt}
            className={`absolute right-1.5 px-2 py-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs ${
              translateFromPt
                ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
                : "bg-muted text-muted-foreground border-border hover:text-foreground hover:bg-muted/80"
            }`}
            title={
              translateFromPt
                ? `Modo Tradução Ativo: Responda em Português 🇧🇷 e traduziremos para ${activeLanguage.name}. Toque para falar direto no idioma.`
                : `Modo Direto Ativo: Você fala direto em ${activeLanguage.flag} ${activeLanguage.name}. Toque para responder em Português.`
            }
            aria-label={translateFromPt ? "Modo tradução ativo. Toque para alternar" : "Modo direto ativo. Toque para alternar"}
          >
            <span>{translateFromPt ? `🇧🇷➔${activeLanguage.flag}` : activeLanguage.flag}</span>
          </button>
        </div>

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

      {/* Modal de Memória Conversacional do Aluno */}
      <Dialog open={showMemoryModal} onOpenChange={setShowMemoryModal}>
        <DialogContent className="max-w-md w-[92vw] rounded-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Memória do Aluno • {activeLanguage.flag} {activeLanguage.name}</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Tópicos e histórico pedagógico contínuo lembrados por {activeTutor.name} entre sessões.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Tópicos Conversados */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>💬 Tópicos Visitados</span>
                <span className="text-[10px] bg-primary/15 text-primary px-1.5 rounded-full font-bold">
                  {learnerMemory.topicsDiscussed.length}
                </span>
              </span>
              {learnerMemory.topicsDiscussed.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-xl">
                  Nenhum tópico registrado ainda. Converse com {activeTutor.name} para construir sua memória!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {learnerMemory.topicsDiscussed.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 text-xs"
                    >
                      <span className="font-medium text-foreground">{t.topic}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {t.count}x discutido
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pontos Gramaticais Sob Fixação */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>🎯 Reforço Positivo & Gramática</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 rounded-full font-bold">
                  {learnerMemory.grammarSlips.length}
                </span>
              </span>
              {learnerMemory.grammarSlips.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-xl">
                  Sem deslizes gramaticais recentes. Parabéns pelo desempenho!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {learnerMemory.grammarSlips.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-0.5"
                    >
                      <p className="font-medium text-foreground">{s.explanationPt}</p>
                      <span className="text-[10px] text-muted-foreground">
                        Identificado {s.count}x durante as conversas
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anotação do Tutor */}
            {learnerMemory.tutorNotes[activeTutor.id] && (
              <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                  <span>📝 Nota de {activeTutor.name}:</span>
                </span>
                <p className="text-xs text-foreground">
                  {learnerMemory.tutorNotes[activeTutor.id]}
                </p>
              </div>
            )}

            {/* Ação de Limpeza */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const fresh = clearLearnerMemory(activeTutor.language);
                  setLearnerMemory(fresh);
                  toast.info("Memória do aluno reiniciada.");
                }}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Limpar memória
              </Button>

              <Button
                size="sm"
                onClick={() => setShowMemoryModal(false)}
                className="text-xs font-bold"
              >
                Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
