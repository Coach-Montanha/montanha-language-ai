// Serviço de Efeitos Sonoros Procedurais usando Web Audio API nativa
// 0 KB de downloads, zero latência, 100% offline e sem dependências externas

const SFX_STORAGE_KEY = "smart_language_sfx_enabled";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn("Web Audio API não inicializada:", e);
    return null;
  }
}

export function isAudioEffectsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem(SFX_STORAGE_KEY);
    return saved !== null ? saved === "true" : true;
  } catch {
    return true;
  }
}

export function setAudioEffectsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SFX_STORAGE_KEY, String(enabled));
  } catch {
    // ignora
  }
}

/**
 * Efeito de virar cartão / flashcard (som de estalo sutil e suave)
 */
export function playCardFlipSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // silencia se bloqueado pelo browser
  }
}

/**
 * Efeito de acerto / resposta correta / cartão dominado (arpejo brilhante C5 -> E5 -> G5)
 */
export function playSuccessSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      const noteStart = now + idx * 0.06;
      const noteDuration = 0.22;

      gain.gain.setValueAtTime(0.15, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration);
    });
  } catch {
    // silencia
  }
}

/**
 * Efeito de conclusão de treino ou sprint diário (fanfarra festiva de vitória)
 */
export function playSprintCompleteSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 523.25, d: 0.1, delay: 0 },
      { f: 659.25, d: 0.1, delay: 0.09 },
      { f: 783.99, d: 0.1, delay: 0.18 },
      { f: 1046.5, d: 0.35, delay: 0.27 },
      { f: 1318.51, d: 0.45, delay: 0.38 },
    ];
    const now = ctx.currentTime;

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const start = now + note.delay;
      osc.frequency.setValueAtTime(note.f, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + note.d);
    });
  } catch {
    // silencia
  }
}

/**
 * Efeito de abertura do microfone (blip agudo sutil informando início de escuta)
 */
export function playMicStartSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // silencia
  }
}

/**
 * Efeito de encerramento do microfone (blip descendente sutil)
 */
export function playMicStopSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.07);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // silencia
  }
}

/**
 * Efeito de clique de seleção de opção tátil
 */
export function playOptionSelectSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // silencia
  }
}

/**
 * Efeito sonoro suave de orientação de correção gramatical (não punitivo)
 */
export function playCorrectionChime(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(392, now); // G4
    osc.frequency.setValueAtTime(349.23, now + 0.08); // F4

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // silencia
  }
}

/**
 * Efeito de mensagem enviada (swoosh suave)
 */
export function playMessageSentSound(): void {
  if (!isAudioEffectsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // silencia
  }
}
