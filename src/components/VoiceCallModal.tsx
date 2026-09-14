import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProgress, ChatMessage, SupportedLanguage } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage, getTutorById } from "@/data/tutors";
import {
  speakText,
  stopSpeaking,
  bargeInInterrupt,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/services/speech";
import { tutorChat } from "@/services/ai-engine";
import { addXP } from "@/services/storage";
import {
  playMicStartSound,
  playMicStopSound,
  playSuccessSound,
} from "@/services/audio-effects";
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Subtitles,
  Activity,
} from "lucide-react";
import { AudioWaveform } from "@/components/ui/AudioWaveform";
import { toast } from "sonner";

interface VoiceCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  open,
  onOpenChange,
  progress,
  onUpdateProgress,
}) => {
  const activeLang: SupportedLanguage = progress.selectedLanguage || "en";
  const langDef = getLanguageById(activeLang);
  const activeTutors = getTutorsForLanguage(activeLang);
  const activeTutor =
    (progress.selectedTutorId ? activeTutors.find((t) => t.id === progress.selectedTutorId) : null) ||
    activeTutors[0] ||
    getTutorById(progress.selectedTutorId);

  const [callState, setCallState] = useState<"speaking" | "listening" | "processing" | "idle">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState<number>(progress.audioSpeed || 1.0);
  const [callDuration, setCallDuration] = useState(0);

  const [lastTutorText, setLastTutorText] = useState("");
  const [lastUserText, setLastUserText] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  const recognizerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const activeCallRef = useRef<boolean>(false);

  // Inicia ou encerra a chamada
  useEffect(() => {
    if (open) {
      activeCallRef.current = true;
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Inicia com a saudação do tutor
      const greeting = activeTutor.initialGreeting;
      setLastTutorText(greeting);
      setCallState("speaking");

      const initialHistory: ChatMessage[] = [
        {
          id: `tutor-init-${Date.now()}`,
          sender: "tutor",
          text: greeting,
          timestamp: Date.now(),
        },
      ];
      setConversationHistory(initialHistory);

      speakText(greeting, {
        rate: audioSpeed,
        pitch: activeTutor.speechPitch,
        gender: activeTutor.gender,
        lang: langDef.speechLangCode,
        onEnd: () => {
          if (activeCallRef.current && !isMuted) {
            startListeningSession(initialHistory);
          } else {
            setCallState("idle");
          }
        },
        onError: () => {
          if (activeCallRef.current) startListeningSession(initialHistory);
        },
      });
    } else {
      activeCallRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (_) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      activeCallRef.current = false;
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (_) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, activeTutor]);

  // Função para ouvir a voz do usuário continuamente
  const startListeningSession = (historyContext: ChatMessage[]) => {
    if (!activeCallRef.current) return;

    if (!isSpeechRecognitionSupported()) {
      setCallState("idle");
      return;
    }

    bargeInInterrupt();
    setCallState("listening");
    playMicStartSound();

    const recognizer = createSpeechRecognizer(
      async (spokenText) => {
        playMicStopSound();
        setLastUserText(spokenText);
        setCallState("processing");

        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          sender: "user",
          text: spokenText,
          timestamp: Date.now(),
        };

        const updatedHistory = [...historyContext, userMsg];
        setConversationHistory(updatedHistory);

        // Concede XP de conversação falada
        const updatedProg = addXP(5);
        onUpdateProgress({
          ...updatedProg,
          messagesSentCount: progress.messagesSentCount + 1,
        });

        try {
          // IA responde diretamente ao contexto falado
          const tutorResult = await tutorChat(
            spokenText,
            updatedHistory,
            progress.geminiApiKey,
            activeTutor
          );
          const responseText = tutorResult.replyText;

          if (!activeCallRef.current) return;

          setLastTutorText(responseText);
          setCallState("speaking");

          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "tutor",
            text: responseText,
            timestamp: Date.now(),
          };
          const nextHistory = [...updatedHistory, aiMsg];
          setConversationHistory(nextHistory);

          // Tutor fala a resposta
          speakText(responseText, {
            rate: audioSpeed,
            pitch: activeTutor.speechPitch,
            gender: activeTutor.gender,
            lang: langDef.speechLangCode,
            onEnd: () => {
              if (activeCallRef.current && !isMuted) {
                startListeningSession(nextHistory);
              } else {
                setCallState("idle");
              }
            },
            onError: () => {
              if (activeCallRef.current) startListeningSession(nextHistory);
            },
          });
        } catch (e) {
          console.error("Erro no processamento da chamada:", e);
          if (activeCallRef.current) {
            setCallState("idle");
          }
        }
      },
      (err) => {
        playMicStopSound();
        if (activeCallRef.current) {
          setCallState("idle");
        }
      },
      () => {
        if (activeCallRef.current && callState === "listening") {
          setCallState("idle");
        }
      },
      langDef.speechLangCode
    );

    recognizerRef.current = recognizer;
    if (recognizer) {
      try {
        recognizer.start();
      } catch (_) {}
    }
  };

  const handleEndCall = () => {
    activeCallRef.current = false;
    stopSpeaking();
    if (recognizerRef.current) {
      try {
        recognizerRef.current.abort();
      } catch (_) {}
    }
    toast.success(`Chamada com ${activeTutor.name} finalizada! Prática oral concluída.`);
    onOpenChange(false);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (callState === "idle") {
        startListeningSession(conversationHistory);
      }
    } else {
      setIsMuted(true);
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (_) {}
      }
      setCallState("idle");
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleEndCall()}>
      <DialogContent className="max-w-md w-full h-[92vh] sm:h-[85vh] rounded-3xl p-0 overflow-hidden border-zinc-800 bg-zinc-950 text-white flex flex-col justify-between select-none shadow-2xl">
        {/* Topo da Chamada: Tutor e Duração */}
        <div className="p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">{langDef.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {activeTutor.name}
                <span className="text-xs text-zinc-400 font-normal">({activeTutor.city})</span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {formatTime(callDuration)} &bull; Chamada HD de Voz
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-900/80 text-[10px] text-zinc-300 font-mono"
          >
            {audioSpeed}x
          </Badge>
        </div>

        {/* Centro da Chamada: Avatar com Animação de Onda Sonora */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 relative">
          {/* Anéis pulsantes de áudio */}
          <div className="relative flex items-center justify-center">
            {callState === "speaking" && (
              <>
                <div className="absolute h-48 w-48 rounded-full bg-primary/20 animate-ping opacity-40" />
                <div className="absolute h-40 w-40 rounded-full bg-primary/30 animate-pulse" />
              </>
            )}

            {callState === "listening" && (
              <>
                <div className="absolute h-48 w-48 rounded-full bg-emerald-500/20 animate-ping opacity-40" />
                <div className="absolute h-40 w-40 rounded-full bg-emerald-500/30 animate-pulse" />
              </>
            )}

            {/* Avatar do Tutor */}
            <div className="relative h-28 w-28 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-6xl shadow-2xl z-10">
              {activeTutor.avatar}
            </div>
          </div>

          {/* Bencho UI Audio Waveform Component */}
          <AudioWaveform
            isActive={callState === "speaking" || callState === "listening"}
            color={callState === "listening" ? "emerald" : callState === "speaking" ? "teal" : "amber"}
            barCount={14}
            label={callState === "speaking" ? "Tutor Áudio" : callState === "listening" ? "Seu Microfone" : "Bencho Audio"}
          />

          {/* Status dinâmico da chamada */}
          <div className="text-center space-y-1 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900/90 border border-zinc-800">
              {callState === "speaking" && (
                <>
                  <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span className="text-primary font-bold">{activeTutor.name} está falando...</span>
                </>
              )}
              {callState === "listening" && (
                <>
                  <Mic className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                  <span className="text-emerald-400 font-bold">Ouvindo você... (Fale agora)</span>
                </>
              )}
              {callState === "processing" && (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-400">Processando resposta...</span>
                </>
              )}
              {callState === "idle" && (
                <span className="text-zinc-400">Toque no microfone para falar</span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              {activeTutor.styleTitle} &bull; Fale com pronúncia natural
            </p>
          </div>

          {/* Legenda Opcional ao Vivo */}
          {showSubtitles && (
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-3.5 text-center space-y-1.5 animate-in fade-in z-10">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">
                Transcrição ao Vivo
              </span>
              <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                &ldquo;{callState === "listening" && lastUserText ? lastUserText : lastTutorText || activeTutor.samplePhrase}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Rodapé: Controles da Chamada */}
        <div className="p-6 bg-zinc-900/60 border-t border-zinc-800/60 flex items-center justify-around z-10">
          {/* Alternar Legendas */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`h-12 w-12 rounded-full transition-all ${
              showSubtitles
                ? "bg-zinc-800 text-primary border border-primary/30"
                : "bg-zinc-800/60 text-zinc-400"
            }`}
            title="Alternar legendas"
          >
            <Subtitles className="h-5 w-5" />
          </Button>

          {/* Botão de Encerrar Chamada */}
          <Button
            type="button"
            onClick={handleEndCall}
            className="h-16 w-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Encerrar chamada"
          >
            <PhoneOff className="h-7 w-7" />
          </Button>

          {/* Botão de Microfone Mudo / Falar */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleMute}
            className={`h-12 w-12 rounded-full transition-all ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : callState === "listening"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-2 ring-emerald-500/30"
                : "bg-zinc-800 text-white"
            }`}
            title={isMuted ? "Desmutar microfone" : "Mutar microfone"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
