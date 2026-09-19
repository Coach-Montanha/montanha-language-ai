// Integração com a API Gemini para processamento avançado de linguagem natural

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function callGeminiRaw(
  apiKey: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const models = ["gemini-3.1-flash", "gemini-2.5-flash"];

  const body: {
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    systemInstruction?: { parts: Array<{ text: string }> };
    generationConfig?: {
      temperature: number;
      topP: number;
      maxOutputTokens: number;
    };
  } = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.72,
      topP: 0.95,
      maxOutputTokens: 1200,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
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
        const msg = errData?.error?.message || `Erro na API (${response.status})`;
        throw new Error(msg);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Falha ao gerar resposta com o modelo Gemini.");
}
