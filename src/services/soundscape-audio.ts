export type SoundscapeType = "cafe" | "airport" | "rain" | "office";

export interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  icon: string;
  description: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  {
    id: "cafe",
    label: "Café Bistrô",
    icon: "☕",
    description: "Murmúrio suave de bistrô europeu e tilintar aconchegante",
  },
  {
    id: "airport",
    label: "Aeroporto",
    icon: "✈️",
    description: "Saguão internacional com anúncio de embarque suave",
  },
  {
    id: "rain",
    label: "Chuva Suave",
    icon: "🌧️",
    description: "Chuva constante para máxima concentração e calma",
  },
  {
    id: "office",
    label: "Escritório",
    icon: "💼",
    description: "Ambiente calmo de negócios e foco profissional",
  },
];

class SoundscapeEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private intervalTimer: any = null;
  private currentType: SoundscapeType | null = null;
  private volume: number = 0.15; // Volume ambiente padrão discreto

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Gera buffer de ruído rosa suave para acústica orgânica
  private createPinkNoiseNode(ctx: AudioContext): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);
    return whiteNoise;
  }

  // Som procedural de tilintar de xícaras de café
  private playCupClink(ctx: AudioContext, destination: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    const freq = 1800 + Math.random() * 800;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Som procedural do chime de aeroporto ("Ding-Dong")
  private playAirportChime(ctx: AudioContext, destination: GainNode) {
    const notes = [587.33, 440.0]; // D5, A4
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.3;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  public start(type: SoundscapeType, volume: number = 0.15) {
    if (typeof window === "undefined") return;

    this.stop();
    this.currentType = type;
    this.volume = volume;

    try {
      const ctx = this.getContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 1.2); // Fade-in suave de 1.2s
      master.connect(ctx.destination);
      this.masterGain = master;

      const noise = this.createPinkNoiseNode(ctx);
      const filter = ctx.createBiquadFilter();

      switch (type) {
        case "cafe":
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.Q.setValueAtTime(1.2, ctx.currentTime);
          noise.connect(filter);
          filter.connect(master);

          // Efeitos aleatórios de xícaras a cada 6 a 12 segundos
          this.intervalTimer = setInterval(() => {
            if (this.currentType === "cafe") {
              this.playCupClink(ctx, master);
            }
          }, 8000);
          break;

        case "airport":
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          noise.connect(filter);
          filter.connect(master);

          // Chime de embarque ocasional a cada 18 segundos
          this.intervalTimer = setInterval(() => {
            if (this.currentType === "airport") {
              this.playAirportChime(ctx, master);
            }
          }, 18000);
          break;

        case "rain":
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1200, ctx.currentTime);
          noise.connect(filter);
          filter.connect(master);
          break;

        case "office":
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(320, ctx.currentTime);
          noise.connect(filter);
          filter.connect(master);
          break;
      }

      this.noiseNode = noise;
    } catch (e) {
      console.error("Falha ao inicializar Soundscape Audio:", e);
    }
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    if (this.masterGain && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6); // Fade-out suave de 600ms
        setTimeout(() => {
          try {
            if (this.noiseNode && "stop" in this.noiseNode) {
              (this.noiseNode as AudioScheduledSourceNode).stop();
            }
            this.noiseNode = null;
            this.masterGain = null;
          } catch (_) {}
        }, 650);
      } catch (_) {
        this.masterGain = null;
      }
    }

    this.currentType = null;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getCurrentType(): SoundscapeType | null {
    return this.currentType;
  }

  public isPlaying(): boolean {
    return this.currentType !== null;
  }
}

export const soundscape = new SoundscapeEngine();
