// Serviço de Áudio (TTS) e Reconhecimento de Fala (STT) usando Web Speech API nativa

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis não é suportada neste navegador.");
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Para qualquer áudio em andamento

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || "en-US";
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // Tentar selecionar uma voz nativa em inglês de qualidade
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) => (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) && v.name.includes("Natural")
    ) || voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en"));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Erro ao reproduzir voz:", error);
    if (options.onError) options.onError(error);
  }
}

// Reconhecimento de fala para prática de pronúncia
export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  recognizer.lang = "en-US";
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognizer.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognizer.onerror = (event: any) => {
    if (onError) onError(event.error || "Erro no microfone");
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}
