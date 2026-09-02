// Serviço de Áudio (TTS) e Reconhecimento de Fala (STT) usando Web Speech API nativa

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

// Cache de vozes carregadas pelo navegador
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
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

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

export function getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.filter((v) => v.lang.startsWith("en-") || v.lang === "en");
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis não é suportada neste navegador.");
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Para qualquer áudio anterior

    // Pequeno delay para garantir que cancelamento anterior foi processado
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || "en-US";
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;

      // Buscar voz de alta qualidade em inglês
      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      
      const enVoice =
        voices.find(
          (v) =>
            (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) &&
            (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium"))
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (enVoice) {
        utterance.voice = enVoice;
      }

      if (options.onStart) utterance.onstart = options.onStart;
      if (options.onEnd) utterance.onend = options.onEnd;
      if (options.onError) utterance.onerror = options.onError;

      // Evita travamento de fala em alguns navegadores Chrome no Windows
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }, 40);
  } catch (error) {
    console.error("Erro ao reproduzir voz:", error);
    if (options.onError) options.onError(error);
  }
}

export interface SpeechRecognizerHandlers {
  onInterim?: ((text: string) => void) | undefined;
  onFinal: (text: string) => void;
  onError?: ((errorMsg: string) => void) | undefined;
  onStart?: (() => void) | undefined;
  onEnd?: (() => void) | undefined;
}

// Reconhecimento de fala avançado com suporte a transcrição em tempo real
export function createSpeechRecognizer(
  handlersOrOnFinal: SpeechRecognizerHandlers | ((text: string) => void),
  legacyOnError?: (err: string) => void,
  legacyOnEnd?: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const handlers: SpeechRecognizerHandlers =
    typeof handlersOrOnFinal === "function"
      ? {
          onFinal: handlersOrOnFinal,
          onError: legacyOnError,
          onEnd: legacyOnEnd,
        }
      : handlersOrOnFinal;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  recognizer.lang = "en-US";
  recognizer.continuous = false;
  recognizer.interimResults = true; // Transcrição em tempo real
  recognizer.maxAlternatives = 1;

  let finalTranscript = "";

  recognizer.onstart = () => {
    finalTranscript = "";
    if (handlers.onStart) handlers.onStart();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognizer.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const item = event.results[i];
      if (item.isFinal) {
        finalTranscript += item[0].transcript;
      } else {
        interim += item[0].transcript;
      }
    }

    if (interim && handlers.onInterim) {
      handlers.onInterim(interim);
    }
    if (finalTranscript && handlers.onFinal) {
      handlers.onFinal(finalTranscript);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognizer.onerror = (event: any) => {
    // Erros benignos como no-speech não devem alarmar o usuário
    if (event.error === "no-speech") {
      if (handlers.onEnd) handlers.onEnd();
      return;
    }

    let userFriendlyError = "Erro no reconhecimento de voz.";
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      userFriendlyError = "Permissão do microfone negada. Permita o microfone no navegador.";
    } else if (event.error === "network") {
      userFriendlyError = "Falha de conexão com o serviço de voz do navegador.";
    }

    if (handlers.onError) {
      handlers.onError(userFriendlyError);
    }
  };

  recognizer.onend = () => {
    if (handlers.onEnd) handlers.onEnd();
  };

  return recognizer;
}
