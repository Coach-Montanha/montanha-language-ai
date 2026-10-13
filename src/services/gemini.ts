// Integração com a API Gemini para processamento avançado de linguagem natural
// Fallback automático ao ecosystem-llm-router se a cota do Gemini for atingida.

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function callGeminiRaw(
  apiKey: string,
  prompt: string,
  systemInstruction?: string,
  preferredModel?: string
): Promise<string> {
  const normalizedPreferred =
    preferredModel === "pro"
      ? "gemini-2.5-pro"
      : preferredModel === "flash"
      ? "gemini-2.5-flash"
      : preferredModel || "gemini-2.5-pro";

  const allModels = [
    normalizedPreferred,
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ];
  const models = allModels.filter((m, idx) => allModels.indexOf(m) === idx);

  const body: {
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: { parts: Array<{ text: string }> };
    generationConfig?: { temperature: number; topP: number; maxOutputTokens: number };
  } = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.72, topP: 0.95, maxOutputTokens: 1200 },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Erro na API (${response.status})`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
    }
  }

  // Fallback ao ecosystem-llm-router (Groq, Cerebras, SambaNova, OpenRouter)
  try {
    const { generateEcosystemCompletion } = await import("./ecosystem-llm-router");
    const res = await generateEcosystemCompletion({
      prompt,
      systemInstruction,
      temperature: 0.72,
      maxTokens: 1200,
    });
    return res.text;
  } catch {
    // ignora erro do router e propaga o erro original do Gemini
  }

  throw lastError || new Error("Falha ao gerar resposta com o modelo Gemini.");
}
