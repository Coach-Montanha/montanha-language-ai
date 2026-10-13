/**
 * Gemini Live API — Full-Duplex Voice Session Service
 * Substitui a cadeia: Web Speech ASR → tutorChat() → speakText() por um único WebSocket.
 * Latência: ~200-400ms. Suporta barge-in nativo e legendas em tempo real.
 */
import { GoogleGenAI } from "@google/genai";

// Vozes suportadas pelo Gemini Live API
export type LiveVoiceName = "Aoede" | "Puck" | "Charon" | "Fenrir" | "Kore" | "Charis" | "River";

// Mapeia idioma + gênero do tutor para a voz mais adequada
export function selectLiveVoice(
  lang: string,
  gender: "male" | "female" | "neutral"
): LiveVoiceName {
  if (gender === "female") {
    return lang === "en" ? "Aoede" : lang === "fr" ? "Kore" : "Aoede";
  }
  return lang === "en" ? "Puck" : lang === "de" ? "Fenrir" : "Charon";
}

export interface LiveSessionCallbacks {
  onAudioChunk: (base64Pcm: string) => void;   // PCM 24kHz para reprodução
  onUserTranscript: (text: string) => void;     // legenda do aluno (interim)
  onTutorTranscript: (text: string) => void;    // legenda do tutor
  onInterrupted: () => void;                    // aluno interrompeu → limpar fila de áudio
  onConnected: () => void;
  onError: (err: Error) => void;
  onClosed: () => void;
}

export type LiveSession = Awaited<ReturnType<typeof createLiveSession>>;

/**
 * Abre uma sessão full-duplex com o Gemini Live API.
 * @param apiKey  Chave Gemini do usuário (ou ephemeral token do servidor)
 * @param systemInstruction  Persona completa do tutor
 * @param voiceName  Voz selecionada para o tutor
 * @param callbacks  Handlers de eventos da sessão
 */
export async function createLiveSession(
  apiKey: string,
  systemInstruction: string,
  voiceName: LiveVoiceName,
  callbacks: LiveSessionCallbacks
) {
  const ai = new GoogleGenAI({ apiKey });

  const session = await ai.live.connect({
    model: "gemini-3.8-live",
    config: {
      responseModalities: ["audio"],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
      inputAudioTranscription: {},   // habilita legenda do aluno
      outputAudioTranscription: {},  // habilita legenda do tutor
    },
    callbacks: {
      onopen: callbacks.onConnected,
      onmessage: (response: any) => {
        const c = response?.serverContent;
        if (!c) return;

        // Áudio do tutor (chunks PCM base64)
        if (c.modelTurn?.parts) {
          for (const part of c.modelTurn.parts) {
            if (part?.inlineData?.data) {
              callbacks.onAudioChunk(part.inlineData.data);
            }
          }
        }

        // Legendas em tempo real
        if (c.inputTranscription?.text) {
          callbacks.onUserTranscript(c.inputTranscription.text);
        }
        if (c.outputTranscription?.text) {
          callbacks.onTutorTranscript(c.outputTranscription.text);
        }

        // Barge-in: aluno interrompeu o tutor
        if (c.interrupted === true) {
          callbacks.onInterrupted();
        }
      },
      onerror: (e: any) => callbacks.onError(e instanceof Error ? e : new Error(String(e))),
      onclose: callbacks.onClosed,
    },
  });

  return session;
}

/**
 * Envia chunk de áudio do microfone (PCM 16kHz, base64).
 */
export function sendAudioChunk(session: any, base64Chunk: string): void {
  try {
    session.sendRealtimeInput({
      audio: { data: base64Chunk, mimeType: "audio/pcm;rate=16000" },
    });
  } catch (e) {
    // sessão pode ter sido encerrada; ignora silenciosamente
  }
}

/**
 * Sinaliza fim de fala do aluno (Hybrid VAD — reduz latência de resposta).
 */
export function signalSpeechEnd(session: any): void {
  try {
    session.sendRealtimeInput({ audioStreamEnd: true });
  } catch (_) {}
}

/**
 * Encerra a sessão.
 */
export function closeLiveSession(session: any): void {
  try {
    session.close();
  } catch (_) {}
}

// ─── AudioWorklet helper ──────────────────────────────────────────────────────

/**
 * Abre o microfone e inicia captura de PCM 16kHz via AudioWorklet.
 * Retorna { stream, audioContext, stop }.
 */
export async function startMicCapture(
  onChunk: (base64: string) => void
): Promise<{ stop: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const audioCtx = new AudioContext({ sampleRate: 16000 });

  // Worklet inline — converte Float32 → Int16 PCM e envia em chunks
  const workletCode = `
    class PcmCapture extends AudioWorkletNode {
      constructor() { super(...arguments); }
    }
    class PcmCaptureProcessor extends AudioWorkletProcessor {
      process(inputs) {
        const ch = inputs[0]?.[0];
        if (!ch?.length) return true;
        const int16 = new Int16Array(ch.length);
        for (let i = 0; i < ch.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, ch[i] * 32768));
        }
        this.port.postMessage(int16.buffer, [int16.buffer]);
        return true;
      }
    }
    registerProcessor('pcm-capture', PcmCaptureProcessor);
  `;

  const blob = new Blob([workletCode], { type: "application/javascript" });
  const workletUrl = URL.createObjectURL(blob);
  await audioCtx.audioWorklet.addModule(workletUrl);
  URL.revokeObjectURL(workletUrl);

  const source = audioCtx.createMediaStreamSource(stream);
  const workletNode = new AudioWorkletNode(audioCtx, "pcm-capture");

  workletNode.port.onmessage = (e: MessageEvent) => {
    const int16Buffer: ArrayBuffer = e.data;
    // Converte para base64
    const bytes = new Uint8Array(int16Buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
    const base64 = btoa(binary);
    onChunk(base64);
  };

  source.connect(workletNode);
  workletNode.connect(audioCtx.destination);

  return {
    stop: () => {
      workletNode.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      audioCtx.close();
    },
  };
}

// ─── PCM Playback helper ──────────────────────────────────────────────────────

/**
 * Reproduz chunk de áudio PCM 24kHz (base64) via AudioContext.
 * Usa fila sequencial para evitar sobreposição de chunks.
 */
export function createAudioPlayer() {
  const ctx = new AudioContext({ sampleRate: 24000 });
  let nextStartTime = 0;
  let currentSource: AudioBufferSourceNode | null = null;

  function play(base64Pcm: string): void {
    const binary = atob(base64Pcm);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i]! / 32768;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextStartTime);
    source.start(startAt);
    nextStartTime = startAt + buffer.duration;
    currentSource = source;
  }

  function stop(): void {
    try {
      currentSource?.stop();
    } catch (_) {}
    nextStartTime = 0;
    currentSource = null;
  }

  function close(): void {
    stop();
    ctx.close();
  }

  return { play, stop, close };
}
