import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserProgress } from "@/types/language";
import { tutorChat } from "@/services/ai-engine";
import { speakText, createSpeechRecognizer, isSpeechRecognitionSupported } from "@/services/speech";
import { saveChatHistory, loadChatHistory, addXP } from "@/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  Trash2,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    saveChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await tutorChat(query, messages, progress.geminiApiKey);

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: "tutor",
        text: response.replyText,
        correction: response.correction,
        timestamp: Date.now(),
      };

      const updatedHistory = [...newHistory, tutorMsg];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);

      // Toca áudio automaticamente da resposta do tutor
      speakText(response.replyText, { rate: progress.audioSpeed });

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

  const handleMicToggle = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error("Reconhecimento de fala não suportado neste navegador.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setInput(transcript);
        setIsRecording(false);
        handleSend(transcript);
      },
      (err) => {
        console.error(err);
        setIsRecording(false);
        toast.error("Não foi possível captar a voz. Tente falar mais perto do microfone.");
      },
      () => setIsRecording(false)
    );

    if (recognizer) {
      recognizer.start();
    }
  };

  const handleClearChat = () => {
    if (confirm("Deseja limpar as mensagens da conversa?")) {
      const reset = [
        {
          id: "intro-reset",
          sender: "tutor" as const,
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
              Correção imediata com explicação em 1 linha
            </p>
          </div>
        </div>

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

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
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
                  className={`rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-card border border-border text-foreground rounded-tl-xs"
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>

                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, { rate: progress.audioSpeed })}
                      className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-medium pt-1"
                    >
                      <Volume2 className="h-3 w-3" /> Ouvir pronúncia
                    </button>
                  )}
                </div>
                {isUser && (
                  <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Balão de Correção em 1 Linha (se houver erro na fala anterior) */}
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
            <span>Alex está pensando e digitando...</span>
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

      {/* Barra de Entrada de Mensagem */}
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
            title={isRecording ? "Parar gravação" : "Falar por voz em inglês"}
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
            placeholder="Digite em inglês ou fale no mic..."
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
    </div>
  );
};
