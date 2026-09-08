// Serviço de Áudio (TTS) e Reconhecimento de Fala (STT) usando Web Speech API nativa

export interface SpeakOptions {
  rate?: number | undefined;
  pitch?: number | undefined;
  lang?: string | undefined;
  voiceName?: string | undefined;
  gender?: ("male" | "female") | undefined;
  onStart?: (() => void) | undefined;
  onEnd?: (() => void) | undefined;
  onError?: ((err: unknown) => void) | undefined;
}

// Cache de vozes carregadas pelo navegador
let cachedVoices: SpeechSynthesisVoice[] = [];

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

// Pré-carrega vozes do navegador
export function initVoices(): void {
  if (!isSpeechSynthesisSupported()) return;

  const update = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };

  update();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = update;
  }
}

export function getAvailableVoices(targetLang?: string): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  if (!targetLang) return cachedVoices;
  const prefix = targetLang.split("-")[0] || targetLang;
  return cachedVoices.filter((v) => v.lang.startsWith(prefix) || v.lang === targetLang);
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis não é suportada neste navegador.");
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Para qualquer áudio anterior

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = options.lang || "en-US";
      utterance.lang = targetLang;
      // Taxa de velocidade segura (padrão 0.85x para clareza ideal do aluno)
      utterance.rate = Math.max(0.5, Math.min(1.5, options.rate ?? 0.85));
      utterance.pitch = options.pitch ?? 1.0;

      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      const langPrefix = targetLang.split("-")[0]?.toLowerCase() || "en";
      const langVoices = voices.filter(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase() === targetLang.toLowerCase()
      );

      const gender = options.gender;
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (langVoices.length > 0) {
        if (gender === "female") {
          // Heurística de vozes femininas para inglês, espanhol, japonês, grego, italiano, francês e alemão
          matchedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes("female") ||
              name.includes("zira") ||
              name.includes("samantha") ||
              name.includes("victoria") ||
              name.includes("karen") ||
              name.includes("helena") ||
              name.includes("laura") ||
              name.includes("monica") ||
              name.includes("sabina") ||
              name.includes("nanami") ||
              name.includes("ayumi") ||
              name.includes("haruka") ||
              name.includes("kyoko") ||
              name.includes("athina") ||
              name.includes("elsa") ||
              name.includes("alice") ||
              name.includes("hortense") ||
              name.includes("julie") ||
              name.includes("celine") ||
              name.includes("katja") ||
              name.includes("hedda") ||
              name.includes("marlene") ||
              name.includes("vicki") ||
              name.includes("gisela") ||
              name.includes("anna")
            );
          });
        } else if (gender === "male") {
          // Heurística de vozes masculinas
          matchedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes("male") ||
              name.includes("david") ||
              name.includes("alex") ||
              name.includes("george") ||
              name.includes("daniel") ||
              name.includes("pablo") ||
              name.includes("raul") ||
              name.includes("jorge") ||
              name.includes("keita") ||
              name.includes("naoki") ||
              name.includes("ichiro") ||
              name.includes("stefanos") ||
              name.includes("diego") ||
              name.includes("cosimo") ||
              name.includes("paul") ||
              name.includes("henri") ||
              name.includes("stefan") ||
              name.includes("hans") ||
              name.includes("conrad") ||
              name.includes("bernd") ||
              name.includes("martin") ||
              name.includes("florian")
            );
          });
        }

        if (!matchedVoice) {
          matchedVoice =
            langVoices.find(
              (v) =>
                v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("Premium")
            ) || langVoices[0];
        }
      }

      // Se não encontrou voz no idioma exato, usa a primeira voz do idioma ou padrão
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      if (options.onStart) utterance.onstart = options.onStart;
      if (options.onEnd) utterance.onend = options.onEnd;
      if (options.onError) utterance.onerror = options.onError;

      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }, 40);
  } catch (e) {
    console.error("Erro ao reproduzir fala com SpeechSynthesis:", e);
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    return window.speechSynthesis.speaking || window.speechSynthesis.pending;
  } catch {
    return false;
  }
}

// Listeners de interrupção (Barge-in)
type BargeInListener = () => void;
const bargeInListeners: Set<BargeInListener> = new Set();

export function registerBargeInListener(listener: BargeInListener): () => void {
  bargeInListeners.add(listener);
  return () => {
    bargeInListeners.delete(listener);
  };
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.error("Erro ao interromper áudio:", e);
  }
}

/**
 * Interrupção de fala com Barge-in limpo:
 * Cancela imediatamente o TTS e avisa componentes que o usuário assumiu o turno da conversa.
 */
export function bargeInInterrupt(): void {
  stopSpeaking();
  bargeInListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignora
    }
  });
}

export interface SpeechRecognizerHandlers {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export function createSpeechRecognizer(
  handlersOrOnFinal: SpeechRecognizerHandlers | ((text: string) => void),
  legacyOnError?: (err: string) => void,
  legacyOnEnd?: () => void,
  langCode: string = "en-US"
) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const handlers: SpeechRecognizerHandlers =
    typeof handlersOrOnFinal === "function"
      ? {
          onFinal: handlersOrOnFinal,
          ...(legacyOnError ? { onError: legacyOnError } : {}),
          ...(legacyOnEnd ? { onEnd: legacyOnEnd } : {}),
        }
      : handlersOrOnFinal;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  recognizer.lang = langCode;
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
