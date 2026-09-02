import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProgress } from "@/types/language";
import { tutorChat } from "@/services/ai-engine";
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from "@/services/speech";
import { saveChatHistory, loadChatHistory, addXP } from "@/services/storage";
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
} from "lucide-react";
import { toast } from "sonner";

interface ConversationTabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const ConversationTab: React.FC<ConversationTabProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) return saved;
    return [
      {
        id: "intro",
        sender: "tutor",
        text: "Hi there! I'm Alex, your English tutor. What would you like to talk about today? Tell me about your day or ask any question!",
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
      toast.info("Leitura automática em voz alta desativada.");
    } else {
      toast.success("Leitura automática em voz alta ativada! O Alex falará as respostas.");
    }
  };

  // Reproduz áudio de uma mensagem específica
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    speakText(text, {
      rate: progress.audioSpeed,
      lang: "en-US",
      onStart: () => setSpeakingMessageId(msgId),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Para qualquer voz em reprodução quando o usuário enviar mensagem
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
      const response = await tutorChat(query, messages, progress.geminiApiKey);

      const tutorMsgId = `tutor-${Date.now()}`;
      const tutorMsg: ChatMessage = {
        id: tutorMsgId,
        sender: "tutor",
        text: response.replyText,
        correction: response.correction,
        timestamp: Date.now(),
      };

      const updatedHistory = [...newHistory, tutorMsg];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);

      // LEITURA AUTOMÁTICA EM VOZ ALTA (TTS) DA RESPOSTA DO TUTOR NO IDIOMA ALVO
      if (autoSpeak && isSpeechSynthesisSupported()) {
        handleSpeakMessage(tutorMsgId, response.replyText);
      }

      // Atualiza XP e mensagens
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

  // ENTRADA POR VOZ (SPEECH-TO-TEXT) COM TRANSCRIÇÃO EM TEMPO REAL
  const handleStartRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Seu navegador não suporta a API de reconhecimento de voz. Tente usar o Google Chrome ou Edge."
      );
      return;
    }

    // Interrompe qualquer áudio que estiver tocando
    stopSpeaking();
    setSpeakingMessageId(null);

    try {
      const recognizer = createSpeechRecognizer({
        onStart: () => {
          setIsRecording(true);
        },
        onInterim: (interimText) => {
          // Transcrição em tempo real: exibe as palavras conforme o usuário fala
          setInput(interimText);
        },
        onFinal: (finalText) => {
          setInput(finalText);
          setIsRecording(false);
          toast.success("Voz capturada e transcrita!");
        },
        onError: (errMsg) => {
          setIsRecording(false);
          toast.error(errMsg);
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
      toast.error("Erro ao inicializar o microfone.");
    }
  };

  const handleStopRecording = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleClearChat = () => {
    if (confirm("Deseja limpar as mensagens da conversa?")) {
      stopSpeaking();
      setSpeakingMessageId(null);
      const reset: ChatMessage[] = [
        {
          id: "intro-reset",
          sender: "tutor",
          text: "Let's start fresh! What would you like to chat about?",
          timestamp: Date.now(),
        },
      ];
      setMessages(reset);
      saveChatHistory(reset);
      toast.info("Histórico limpo.");
    }
  };

  const quickPrompts = [
    { label: "Cumprimentar", text: "Hello Alex! How are you doing today?" },
    { label: "Testar erro: Idade", text: "I have 25 years old." },
    { label: "Testar erro: 3ª pessoa", text: "She have a blue car." },
    { label: "Falar de hobbies", text: "I really enjoy watching movies and reading books." },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-lg mx-auto w-full">
      {/* Topo do Chat */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Bot className="h-4 w-4" />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">Alex</span>
              <span className="text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.2 rounded-full">
                Tutor Nativo
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Voz e correção em 1 linha
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botão para Ligar / Desligar Leitura Automática em Voz Alta */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAutoSpeak}
            className={`h-7 px-2 text-[10px] gap-1 rounded-lg border transition-all ${
              autoSpeak
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground bg-muted/40"
            }`}
            title={autoSpeak ? "Leitura automática ativada" : "Leitura automática pausada"}
          >
            {autoSpeak ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span>Voz Auto</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span>Mudo</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Limpar conversa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

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

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSpeakingThis = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-start gap-1.5 max-w-[88%]">
                {!isUser && (
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed transition-all ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : isSpeakingThis
                      ? "bg-card border-2 border-emerald-500/70 shadow-md text-foreground rounded-tl-xs ring-2 ring-emerald-500/20"
                      : "bg-card border border-border text-foreground rounded-tl-xs"
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>

                  {!isUser && (
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.text)}
                      className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                        isSpeakingThis
                          ? "text-emerald-600 dark:text-emerald-400 animate-pulse"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={isSpeakingThis ? "Pausar fala" : "Ouvir em voz alta"}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{isSpeakingThis ? "Falando..." : "Ouvir pronúncia"}</span>
                    </button>
                  )}
                </div>
                {isUser && (
                  <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Balão de Correção em 1 Linha */}
              {msg.correction && msg.correction.hasError && (
                <div className="mt-1.5 max-w-[88%] rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-left text-[11px] space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>Dica do Alex:</span>
                  </div>
                  <div className="text-muted-foreground">
                    Você disse: <span className="line-through text-destructive font-medium">{msg.correction.original}</span>
                  </div>
                  <div className="text-foreground font-semibold flex items-center gap-1">
                    Como falar: <span className="text-emerald-600 dark:text-emerald-400">{msg.correction.corrected}</span>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium italic border-t border-amber-500/20 pt-1">
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
            <span>Alex está pensando e respondendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões rápidas de teste */}
      <div className="px-2 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-border/40">
        <span className="text-[10px] text-muted-foreground shrink-0 font-medium flex items-center gap-0.5">
          <Sparkles className="h-2.5 w-2.5 text-amber-500" /> Sugestões:
        </span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.text)}
            className="shrink-0 px-2 py-1 rounded-full bg-muted/80 hover:bg-muted text-[10px] text-foreground font-medium border border-border/60 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Barra de Entrada com Botão de Microfone & Envio */}
      <div className="p-2 border-t border-border bg-card/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5"
        >
          {/* BOTÃO DE MICROFONE NATIVO (STT) */}
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleMicToggle}
            className={`h-9 w-9 shrink-0 rounded-xl transition-all ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400/40"
                : "hover:border-primary/60"
            }`}
            title={isRecording ? "Parar gravação de voz" : "Gravar e transcrever sua voz em inglês"}
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
            placeholder={
              isRecording
                ? "Transcrevendo sua fala..."
                : "Digite ou clique no mic para falar..."
            }
            className={`text-xs h-9 rounded-xl flex-1 bg-background transition-all ${
              isRecording ? "border-red-400 ring-1 ring-red-400" : ""
            }`}
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 shrink-0 rounded-xl shadow-xs"
            title="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
