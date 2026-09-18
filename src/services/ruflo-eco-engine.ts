import { SupportedLanguage, ChatMessage, UserProgress } from "@/types/language";
import { getCachedAnalysis, setCachedAnalysis } from "./ai-cache";

/**
 * Interface do Motor Ruflo + /eco para Economia e Otimização de Tokens
 */
export interface RufloEcoConfig {
  maxContextMessages: number;
  enableSemanticCache: boolean;
  modelTier: "flash_lite" | "flash" | "pro";
}

export interface TokenSavingsStats {
  totalPromptsProcessed: number;
  tokensSavedByCache: number;
  tokensSavedByCompression: number;
  estimatedCostReductionPercentage: number;
}

const DEFAULT_ECO_CONFIG: RufloEcoConfig = {
  maxContextMessages: 6,
  enableSemanticCache: true,
  modelTier: "flash",
};

/**
 * 1. Compressão Inteligente de Contexto (/eco Context Pruning)
 * Remove mensagens antigas/redundantes mantendo a intenção do aluno e perfil de aprendizado.
 */
export function compressContextForAgent(
  messages: ChatMessage[],
  maxMessages = DEFAULT_ECO_CONFIG.maxContextMessages
): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;

  // Mantém a primeira mensagem (boas-vindas/contexto) e as últimas `maxMessages - 1`
  const firstMessage = messages[0];
  const recentMessages = messages.slice(- (maxMessages - 1));

  if (firstMessage && !recentMessages.some((m) => m.id === firstMessage.id)) {
    return [firstMessage, ...recentMessages];
  }

  return recentMessages;
}

/**
 * 2. Seleção Dinâmica do Nível do Modelo (Model Tiering)
 * Define se a tarefa exige um modelo leve (flash) ou denso (pro).
 */
export function selectOptimalModelTier(taskType: "simple_correction" | "tutor_chat" | "complex_analysis" | "voice_call"): "flash_lite" | "flash" | "pro" {
  switch (taskType) {
    case "simple_correction":
      return "flash_lite";
    case "tutor_chat":
      return "flash";
    case "voice_call":
      return "flash";
    case "complex_analysis":
      return "pro";
    default:
      return "flash";
  }
}

/**
 * 3. Enxame de Agentes Ruflo com Cache Semântico /eco
 * Executa tarefas reutilizando o cache local de 0 tokens sempre que possível.
 */
export async function runRufloEcoAgentTask<T>(
  agentRole: string,
  language: SupportedLanguage,
  promptText: string,
  fallbackExecutor: () => Promise<T>
): Promise<{ data: T; cached: boolean; tokensSaved: number }> {
  const cacheKey = `${agentRole}:${language}:${promptText.trim().toLowerCase()}`;
  
  // Verifica se o resultado existe no cache de 0 tokens
  const existing = getCachedAnalysis(language, cacheKey);
  if (existing) {
    // Estimativa de tokens economizados no prompt + resposta
    const estimatedTokensSaved = Math.round((promptText.length + JSON.stringify(existing).length) / 4);
    return {
      data: existing as unknown as T,
      cached: true,
      tokensSaved: estimatedTokensSaved,
    };
  }

  // Executa o agente caso não esteja em cache
  const result = await fallbackExecutor();

  // Salva no cache semântico local
  if (typeof result === "object" && result !== null) {
    setCachedAnalysis(language, cacheKey, result as any);
  }

  return {
    data: result,
    cached: false,
    tokensSaved: 0,
  };
}

/**
 * 4. Monitoramento de Economia de Tokens em Tempo Real
 */
const STATS_KEY = "smart_language_ruflo_eco_stats";

export function getRufloEcoStats(): TokenSavingsStats {
  if (typeof window === "undefined") {
    return { totalPromptsProcessed: 0, tokensSavedByCache: 0, tokensSavedByCompression: 0, estimatedCostReductionPercentage: 0 };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { totalPromptsProcessed: 0, tokensSavedByCache: 0, tokensSavedByCompression: 0, estimatedCostReductionPercentage: 0 };
    return JSON.parse(raw);
  } catch {
    return { totalPromptsProcessed: 0, tokensSavedByCache: 0, tokensSavedByCompression: 0, estimatedCostReductionPercentage: 0 };
  }
}

export function recordTokenSavings(cacheSaved: number, compressionSaved: number): void {
  if (typeof window === "undefined") return;
  const current = getRufloEcoStats();
  const updated: TokenSavingsStats = {
    totalPromptsProcessed: current.totalPromptsProcessed + 1,
    tokensSavedByCache: current.tokensSavedByCache + cacheSaved,
    tokensSavedByCompression: current.tokensSavedByCompression + compressionSaved,
    estimatedCostReductionPercentage: Math.min(85, Math.round(((current.tokensSavedByCache + cacheSaved) / Math.max(1, (current.totalPromptsProcessed + 1) * 350)) * 100)),
  };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch {}
}
