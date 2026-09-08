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

      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      const langPrefix = targetLang.split("-")[0]?.toLowerCase() || "en";
      const langVoices = voices.filter(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase() === targetLang.toLowerCase()
      );

      const gender = options.gender;
      let matchedVoice: SpeechSynthesisVoice | undefined;
      let isConfirmedMaleVoice = false;

      // Palavras-chave inequívocas de nomes e marcadores femininos
      const FEMALE_VOICE_KEYWORDS = [
        "female", "woman", "femme", "donna", "mujer", "feminina", "weiblich", "женский",
        "zira", "samantha", "victoria", "karen", "helena", "laura", "monica", "sabina",
        "nanami", "ayumi", "haruka", "kyoko", "athina", "elsa", "alice", "hortense",
        "julie", "celine", "katja", "hedda", "marlene", "vicki", "gisela", "anna",
        "elena", "irina", "svetlana", "tatyana", "milena", "dariya", "olga", "natasha",
        "yulia", "katya", "mariya", "oksana", "alena", "alona", "eva", "sofia",
        "clara", "chloe", "emma", "marie", "valentina", "camila", "giulia", "camille",
        "sophie", "sakura", "hannah"
      ];

      // Palavras-chave abrangentes de nomes e marcadores masculinos (incluindo Russo e todos os idiomas suportados)
      const MALE_VOICE_KEYWORDS = [
        "male", "masculin", "hombre", "uomo", "homme", "man", "boy", "männlich", "мужской",
        // Russo (Dmitri e vozes masculinas russas no Android, Windows, Mac e navegadores)
        "pavel", "dmitry", "dmitri", "maxim", "maksim", "yuri", "iuri", "boris", "sergey",
        "sergei", "filipp", "ermil", "zahar", "ivan", "vladimir", "mikhail", "andrey",
        "artem", "aleksandr", "alexandr", "nikolai", "igor", "gleb", "roman", "konstantin",
        "anton", "denis", "daniil", "oleg", "viktor",
        // Inglês (Leo, Lucas, etc.)
        "david", "alex", "george", "daniel", "mark", "james", "john", "paul", "guy",
        "oliver", "richard", "tom", "brian", "leo", "lucas",
        // Espanhol (Mateo, etc.)
        "pablo", "raul", "jorge", "diego", "miguel", "mateo", "alvaro", "carlos", "enrique", "manuel", "alberto",
        // Alemão (Max, etc.)
        "stefan", "hans", "conrad", "bernd", "martin", "florian", "lukas", "michael", "max",
        // Francês (Antoine, etc.)
        "henri", "paul", "jean", "pierre", "lucas", "thomas", "nicolas", "antoine",
        // Italiano (Matteo, etc.)
        "cosimo", "diego", "marco", "luca", "matteo", "alessandro", "roberto",
        // Japonês (Kenji, etc.)
        "keita", "naoki", "ichiro", "kenji", "takumi", "daiki", "ren", "taro",
        // Grego Koiné (Teófilo, etc.)
        "stefanos", "eleftherios", "nikos", "giorgos", "kostas", "dimitris", "theophilos", "teofilo"
      ];

      if (langVoices.length > 0) {
        if (gender === "female") {
          // Heurística de vozes femininas
          matchedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
          });
        } else if (gender === "male") {
          // 1. Tentar encontrar voz com nome explicitamente masculino
          matchedVoice = langVoices.find((v) => {
            const name = v.name.toLowerCase();
            return MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
          });

          if (matchedVoice) {
            isConfirmedMaleVoice = true;
          } else {
            // 2. Se não encontrou nome explicitamente masculino, preferir voz que NÃO seja feminina
            matchedVoice = langVoices.find((v) => {
              const name = v.name.toLowerCase();
              return !FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
            });

            // 3. Em celulares Android com Google TTS, a Voz 2 ou 3 costuma ser a variante masculina
            if (!matchedVoice && langVoices.length > 1) {
              matchedVoice = langVoices[1];
            }
          }
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

      // Ajuste acústico inteligente de pitch para garantir tom masculino ou feminino autêntico
      if (gender === "male") {
        // Se a voz encontrada é confirmadamente masculina, usa pitch de barítono (~0.78 - 0.82).
        // Se o dispositivo só tem uma voz genérica/feminina instalada (comum em celulares Android),
        // o pitch 0.72-0.74 faz o formante ressoar com clareza e autoridade no registro masculino.
        utterance.pitch = isConfirmedMaleVoice
          ? Math.min(options.pitch ?? 0.80, 0.85)
          : Math.min(options.pitch ?? 0.74, 0.75);
      } else if (gender === "female") {
        utterance.pitch = Math.max(options.pitch ?? 1.05, 1.05);
      } else {
        utterance.pitch = options.pitch ?? 1.0;
      }

      // Se encontrou voz compatível, associa à utterance
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
