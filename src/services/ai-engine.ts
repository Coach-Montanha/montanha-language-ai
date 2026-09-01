import {
  GrammarCorrection,
  ChatMessage,
  Flashcard,
  SentenceAnalysis,
  WordToken,
  Scenario,
} from "@/types/language";
import { PRESET_THEMES } from "@/data/vocabulary";
import { callGeminiRaw } from "./gemini";

// Base de regras de correção instantânea com explicação de 1 linha em português
interface CorrectionRule {
  pattern: RegExp;
  fix: (match: string) => string;
  explanation: string;
}

const GRAMMAR_RULES: CorrectionRule[] = [
  {
    pattern: /\b(he|she|it)\s+have\b/i,
    fix: (m) => m.replace(/have/i, "has"),
    explanation: "Na 3ª pessoa do singular (he/she/it), usa-se 'has' e não 'have'.",
  },
  {
    pattern: /\b(he|she|it)\s+don't\b/i,
    fix: (m) => m.replace(/don't/i, "doesn't"),
    explanation: "Para negar com he/she/it no presente simples, usa-se 'doesn't'.",
  },
  {
    pattern: /\bi\s+have\s+(\d+)\s+years(\s+old)?\b/i,
    fix: (_m) => "I am [idade] years old",
    explanation: "Para dizer idade em inglês, usamos o verbo 'to be' (I am... years old), não o verbo 'have'.",
  },
  {
    pattern: /\bi('m| am)\s+agree\b/i,
    fix: () => "I agree",
    explanation: "'Agree' já é um verbo de ação. Diga apenas 'I agree', sem o verbo 'to be'.",
  },
  {
    pattern: /\bpeople\s+is\b/i,
    fix: () => "people are",
    explanation: "'People' é substantivo plural em inglês e exige o verbo no plural ('people are').",
  },
  {
    pattern: /\b(i|we|they|you)\s+has\b/i,
    fix: (m) => m.replace(/has/i, "have"),
    explanation: "Os pronomes I, you, we e they usam a forma 'have'.",
  },
  {
    pattern: /\blose\s+the\s+(bus|train|flight|plane)\b/i,
    fix: (m) => m.replace(/lose/i, "miss"),
    explanation: "Para transportes que partem sem você, usamos o verbo 'miss', não 'lose'.",
  },
  {
    pattern: /\bexplain\s+me\b/i,
    fix: () => "explain to me",
    explanation: "O verbo 'explain' exige a preposição 'to' antes do ouvinte ('explain to me').",
  },
  {
    pattern: /\bmake\s+a\s+question\b/i,
    fix: () => "ask a question",
    explanation: "Em inglês dizemos 'ask a question' (fazer uma pergunta), e não 'make'.",
  },
  {
    pattern: /\bmuch\s+(people|friends|cars|books|items)\b/i,
    fix: (m) => m.replace(/much/i, "many"),
    explanation: "Para coisas contáveis no plural, usamos 'many' e não 'much'.",
  },
  {
    pattern: /\bdepend\s+of\b/i,
    fix: () => "depend on",
    explanation: "A regência de 'depend' em inglês usa a preposição 'on', e não 'of'.",
  },
  {
    pattern: /\bcongratulations\s+for\b/i,
    fix: () => "congratulations on",
    explanation: "Dizemos 'congratulations on (your wedding/new job)', e não 'for'.",
  },
  {
    pattern: /\bi\s+very\s+like\b/i,
    fix: () => "I really like",
    explanation: "Em inglês usamos 'I really like' ou colocamos 'very much' no final da oração.",
  },
  {
    pattern: /\beverybody\s+are\b/i,
    fix: () => "everybody is",
    explanation: "'Everybody' e 'everyone' são tratados gramaticalmente como singular ('is').",
  },
];

// Analisa e detecta erros comuns
export function checkGrammarLocal(input: string): GrammarCorrection {
  for (const rule of GRAMMAR_RULES) {
    if (rule.pattern.test(input)) {
      const match = input.match(rule.pattern)?.[0] || "";
      const corrected = input.replace(rule.pattern, rule.fix(match));
      return {
        hasError: true,
        original: input,
        corrected: corrected,
        explanationPt: rule.explanation,
      };
    }
  }

  return {
    hasError: false,
    original: input,
    corrected: input,
    explanationPt: "",
  };
}

// 1. CONVERSA: Tutor "Alex"
export async function tutorChat(
  userInput: string,
  history: ChatMessage[],
  apiKey?: string
): Promise<{ replyText: string; correction?: GrammarCorrection }> {
  // Se houver chave Gemini configurada, usar IA avançada
  if (apiKey) {
    try {
      const systemPrompt = `You are "Alex", an enthusiastic, patient, and friendly native English tutor in an app called Smart Language.
Your tasks:
1. Always converse primarily in natural English suited for learners.
2. Check the user's input for grammatical mistakes, spelling, or unnatural phrasing.
3. If there is a mistake, explain the correction in Portuguese in EXACTLY ONE short line.
4. Respond in strictly valid JSON format with this structure:
{
  "hasError": boolean,
  "corrected": "corrected sentence in English or empty string",
  "explanationPt": "Explicação em português em exatamente UMA linha (ou vazio)",
  "replyText": "Your friendly English response to keep the conversation going"
}`;

      const historyFormatted = history
        .slice(-6)
        .map((m) => `${m.sender === "user" ? "User" : "Alex"}: ${m.text}`)
        .join("\n");

      const prompt = `Recent Conversation:\n${historyFormatted}\n\nUser just said: "${userInput}"\n\nGenerate the JSON output:`;
      const responseRaw = await callGeminiRaw(apiKey, prompt, systemPrompt);

      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const correction: GrammarCorrection | undefined = parsed.hasError
        ? {
            hasError: true,
            original: userInput,
            corrected: parsed.corrected || userInput,
            explanationPt: parsed.explanationPt || "Ajuste na estrutura da frase.",
          }
        : undefined;

      return {
        replyText: parsed.replyText || "Great job! Tell me more about that.",
        correction,
      };
    } catch (e) {
      console.warn("Falha no Gemini, utilizando motor inteligente local:", e);
    }
  }

  // Motor Inteligente Local (Offline / Sem API Key)
  const localCorrection = checkGrammarLocal(userInput);
  const lower = userInput.toLowerCase();

  let replyText = "";
  if (lower.includes("hello") || lower.includes("hi ") || lower.startsWith("hi")) {
    replyText = "Hello! It's fantastic to talk with you today. How was your day so far?";
  } else if (lower.includes("my name is") || lower.includes("i am ") || lower.includes("i'm ")) {
    replyText = "Nice to meet you! Learning a new language takes courage, and you're doing great. What would you like to practice today?";
  } else if (lower.includes("how are you")) {
    replyText = "I'm doing wonderful, thank you! Ready to practice some English with you. What are you up to today?";
  } else if (lower.includes("good morning")) {
    replyText = "Good morning! Wishing you an energized and productive day. What are your plans for today?";
  } else if (lower.includes("good night")) {
    replyText = "Good night! Sleep well and recharge for another day of learning tomorrow!";
  } else if (lower.includes("help") || lower.includes("dúvida") || lower.includes("portugues")) {
    replyText = "I'm right here to help you! Feel free to ask me anything about grammar, vocabulary, or pronunciation.";
  } else if (userInput.split(" ").length < 3) {
    replyText = "I understand! Could you try to expand that into a full sentence? For example, add why or when it happens!";
  } else {
    const conversationalReplies = [
      "That is very interesting! How do you usually handle that in your daily routine?",
      "I see what you mean. Could you tell me more details about it in English?",
      "That makes total sense! Have you always felt that way, or is it something recent?",
      "Awesome! You are expressing yourself clearly. What else happened after that?",
      "I love that topic! What is the most exciting part about it for you?",
    ];
    replyText = conversationalReplies[Math.floor(Math.random() * conversationalReplies.length)]!;
  }

  return {
    replyText,
    correction: localCorrection.hasError ? localCorrection : undefined,
  };
}

// 2. CENÁRIO: Roleplay em situações reais
export async function scenarioChat(
  scenario: Scenario,
  userInput: string,
  history: ChatMessage[],
  apiKey?: string
): Promise<{ replyText: string; suggestedReplies: string[] }> {
  if (apiKey) {
    try {
      const systemPrompt = `You are playing the role of "${scenario.roleAi}" in the following situation: "${scenario.context}".
The user is playing the role of "${scenario.roleUser}".
Keep your answers realistic, helpful, in conversational English.
Provide your response strictly in JSON:
{
  "replyText": "Your in-character dialogue",
  "suggestedReplies": ["Option 1 in English", "Option 2 in English", "Option 3 in English"]
}`;

      const historyFormatted = history
        .slice(-6)
        .map((m) => `${m.sender === "user" ? scenario.roleUser : scenario.roleAi}: ${m.text}`)
        .join("\n");

      const prompt = `Context: ${scenario.description}\n${historyFormatted}\n${scenario.roleUser}: "${userInput}"\n\nGenerate in-character response:`;
      const responseRaw = await callGeminiRaw(apiKey, prompt, systemPrompt);

      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        replyText: parsed.replyText || "Certainly! Let me help you with that.",
        suggestedReplies: Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : scenario.sampleReplies,
      };
    } catch (e) {
      console.warn("Falha no roleplay Gemini, utilizando motor local:", e);
    }
  }

  // Motor Local de Cenário
  const lower = userInput.toLowerCase();
  let replyText = "";
  const suggestedReplies = [...scenario.sampleReplies];

  if (scenario.id === "coffee-shop") {
    if (lower.includes("latte") || lower.includes("cappuccino") || lower.includes("coffee") || lower.includes("americano")) {
      replyText = "Great choice! Would you like that iced or hot? And what size: small, medium, or large?";
    } else if (lower.includes("hot") || lower.includes("iced") || lower.includes("medium") || lower.includes("large") || lower.includes("small")) {
      replyText = "Perfect. Would you like regular whole milk, skim, oat milk, or almond milk with that?";
    } else if (lower.includes("oat") || lower.includes("almond") || lower.includes("milk")) {
      replyText = "Got it! That will be $4.75. Will you be paying with cash or card today?";
    } else {
      replyText = "Sure thing! Anything else to eat with that, like a croissant or blueberry muffin?";
    }
  } else if (scenario.id === "hotel-checkin") {
    if (lower.includes("reservation") || lower.includes("name") || lower.includes("check")) {
      replyText = "Thank you! May I please see an official photo ID and a credit card for incidental charges?";
    } else if (lower.includes("breakfast") || lower.includes("wifi")) {
      replyText = "Breakfast is served on the 1st floor from 7 AM to 10 AM, and Wi-Fi is completely free throughout the hotel.";
    } else {
      replyText = "Here are your key cards for room 402. The elevators are right around the corner to your left. Enjoy your stay!";
    }
  } else if (scenario.id === "job-interview") {
    if (lower.includes("developer") || lower.includes("experience") || lower.includes("work")) {
      replyText = "That sounds like a solid foundation. Can you tell me about a challenging situation you faced at work and how you overcame it?";
    } else {
      replyText = "That is a great perspective. Where do you see your professional career developing over the next three to five years?";
    }
  } else {
    replyText = `Thank you for sharing that. As the ${scenario.roleAi}, let's keep going: what is your next step in this situation?`;
  }

  return { replyText, suggestedReplies };
}

// 3. CARTÕES: Geração temática de vocabulário
export async function generateFlashcards(
  themeInput: string,
  apiKey?: string
): Promise<Flashcard[]> {
  const normalized = themeInput.toLowerCase().trim();

  // Verifica temas pré-definidos
  for (const key of Object.keys(PRESET_THEMES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return PRESET_THEMES[key]!;
    }
  }

  if (apiKey) {
    try {
      const prompt = `Generate 5 high-quality English vocabulary flashcards for the theme: "${themeInput}".
Return ONLY a valid JSON array of objects with this structure:
[
  {
    "word": "English word or phrase",
    "phonetic": "/IPA/",
    "translation": "Tradução em Português",
    "exampleSentence": "A natural English sentence using the word",
    "exampleTranslation": "Tradução da frase em português"
  }
]`;
      const responseRaw = await callGeminiRaw(apiKey, prompt);
      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const items = JSON.parse(cleaned);

      if (Array.isArray(items) && items.length > 0) {
        return items.map((item, idx) => ({
          id: `custom-${Date.now()}-${idx}`,
          theme: themeInput,
          word: item.word || "Word",
          phonetic: item.phonetic || "/wɜːrd/",
          translation: item.translation || "Palavra",
          exampleSentence: item.exampleSentence || "This is an example.",
          exampleTranslation: item.exampleTranslation || "Este é um exemplo.",
        }));
      }
    } catch (e) {
      console.warn("Falha ao gerar cartões com Gemini, usando gerador contextual:", e);
    }
  }

  // Gerador dinâmico de cartões temáticos offline
  return [
    {
      id: `gen-${Date.now()}-1`,
      theme: themeInput,
      word: `Key concept of ${themeInput}`,
      phonetic: "/kiː ˈkɑːn.sept/",
      translation: `Conceito-chave de ${themeInput}`,
      exampleSentence: `Understanding this is essential when discussing ${themeInput}.`,
      exampleTranslation: `Compreender isso é essencial ao discutir sobre ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-2`,
      theme: themeInput,
      word: "Improvement",
      phonetic: "/ɪmˈpruːv.mənt/",
      translation: "Melhoria / Progresso",
      exampleSentence: `We are seeing great improvement in our ${themeInput} skills.`,
      exampleTranslation: `Estamos vendo uma grande melhoria em nossas habilidades em ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-3`,
      theme: themeInput,
      word: "Daily practice",
      phonetic: "/ˈdeɪ.li ˈpræk.tɪs/",
      translation: "Prática diária",
      exampleSentence: `Consistent daily practice is the secret to mastering ${themeInput}.`,
      exampleTranslation: `A prática diária consistente é o segredo para dominar ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-4`,
      theme: themeInput,
      word: "Achieve goals",
      phonetic: "/əˈtʃiːv ɡoʊlz/",
      translation: "Alcançar metas / objetivos",
      exampleSentence: `With Smart Language, you will achieve your goals in no time.`,
      exampleTranslation: `Com o Smart Language, você alcançará suas metas rapidamente.`,
    },
  ];
}

// 4. DESTRINCHAR: Analisador morfológico e sintático palavra por palavra
const POS_LEXICON: Record<
  string,
  { pos: string; badge: string; color: string; trans: string }
> = {
  i: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Eu" },
  you: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Você / Vocês" },
  he: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ele" },
  she: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ela" },
  it: { pos: "Pronome Neutro", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ele / Ela (coisas/animais)" },
  we: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Nós" },
  they: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Eles / Elas" },
  am: { pos: "Verbo (to be)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "sou / estou" },
  is: { pos: "Verbo (to be)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "é / está" },
  are: { pos: "Verbo (to be)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "são / estão" },
  was: { pos: "Verbo (passado)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "era / estava" },
  were: { pos: "Verbo (passado)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "eram / estavam" },
  have: { pos: "Verbo Principal/Auxiliar", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "ter / ter havido" },
  has: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "tem" },
  had: { pos: "Verbo (passado)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "tinha / teve" },
  can: { pos: "Verbo Modal", badge: "Modal", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", trans: "poder / conseguir" },
  could: { pos: "Verbo Modal", badge: "Modal", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", trans: "poderia" },
  would: { pos: "Verbo Modal", badge: "Modal", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", trans: "(condicional -ia)" },
  should: { pos: "Verbo Modal", badge: "Modal", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", trans: "deveria" },
  will: { pos: "Verbo Auxiliar", badge: "Auxiliar", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800", trans: "(marca o futuro)" },
  learning: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprendendo" },
  english: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Inglês" },
  smart: { pos: "Adjetivo", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "Inteligente" },
  language: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Língua / Idioma" },
  with: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "com" },
  today: { pos: "Advérbio de Tempo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "hoje" },
  daily: { pos: "Advérbio / Adjetivo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "diariamente / diário" },
  the: { pos: "Artigo Definido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "o / a / os / as" },
  a: { pos: "Artigo Indefinido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "um / uma" },
  an: { pos: "Artigo Indefinido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "um / uma (antes de som de vogal)" },
  in: { pos: "Preposição de Lugar/Tempo", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / dentro de" },
  on: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "sobre / em cima de" },
  at: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / no(a)" },
  to: { pos: "Preposição / Marcador", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "para / a" },
  for: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "para / por" },
  of: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "de / do / da" },
  and: { pos: "Conjunção Aditiva", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "e" },
  but: { pos: "Conjunção Adversativa", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "mas / porém" },
  because: { pos: "Conjunção Causal", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "porque" },
  very: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  well: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bem" },
  good: { pos: "Adjetivo", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "bom / boa" },
  speaks: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  speak: { pos: "Verbo no Infinitivo/Presente", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "falar / falo" },
  practices: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "pratica" },
  practice: { pos: "Verbo / Substantivo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "praticar / prática" },
  please: { pos: "Advérbio de Cortesia", badge: "Cortesia", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "por favor" },
  tell: { pos: "Verbo de Ação", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "dizer / contar" },
  me: { pos: "Pronome Objeto", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "me / para mim" },
  where: { pos: "Advérbio Interrogativo", badge: "Interrogativo", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", trans: "onde" },
  station: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação" },
  coffee: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "café" },
  cup: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "xícara" },
  hot: { pos: "Adjetivo", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "quente" },
  milk: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "leite" },
  like: { pos: "Verbo / Preposição", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "gostar / como" },
  always: { pos: "Advérbio de Frequência", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "sempre" },
  believe: { pos: "Verbo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "acreditar" },
  yourself: { pos: "Pronome Reflexivo", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "em você mesmo(a)" },
  keep: { pos: "Verbo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "manter / continuar" },
  going: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "indo / em frente" },
  project: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "projeto" },
  working: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "trabalhando" },
  since: { pos: "Preposição / Conjunção", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "desde" },
  morning: { pos: "Substantivo", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "manhã" },
  been: { pos: "Particípio Passado (to be)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "sido / estado" },
};

export async function breakdownSentence(
  sentence: string,
  apiKey?: string
): Promise<SentenceAnalysis> {
  const clean = sentence.trim();

  // Se houver chave Gemini, gerar análise detalhada com IA
  if (apiKey) {
    try {
      const prompt = `Break down this English sentence word by word: "${clean}".
Return ONLY a valid JSON object with this exact structure:
{
  "tokens": [
    {
      "word": "word",
      "partOfSpeech": "Função gramatical em português (ex: Substantivo, Verbo auxiliar)",
      "posBadge": "Nome curto (ex: Verbo, Pronome, Substantivo, Preposição, Adjetivo, Advérbio)",
      "literalTranslation": "Tradução literal em português",
      "note": "Breve nota de uso (opcional)"
    }
  ],
  "naturalTranslation": "Tradução natural e idiomática em português",
  "explanation": "Explicação da estrutura da frase em português"
}`;
      const responseRaw = await callGeminiRaw(apiKey, prompt);
      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && Array.isArray(parsed.tokens)) {
        const tokens: WordToken[] = parsed.tokens.map((t: { word: string; partOfSpeech?: string; posBadge?: string; literalTranslation?: string; note?: string }) => {
          const badge = t.posBadge || "Palavra";
          let color = "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";
          if (badge.toLowerCase().includes("verbo")) color = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
          else if (badge.toLowerCase().includes("pronome")) color = "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
          else if (badge.toLowerCase().includes("substantivo")) color = "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
          else if (badge.toLowerCase().includes("adjetivo")) color = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
          else if (badge.toLowerCase().includes("preposi")) color = "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
          else if (badge.toLowerCase().includes("advérb")) color = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";

          return {
            word: t.word,
            partOfSpeech: t.partOfSpeech || "Vocábulo",
            posBadge: badge,
            posColor: color,
            literalTranslation: t.literalTranslation || t.word,
            ...(t.note ? { note: t.note } : {}),
          };
        });

        return {
          original: clean,
          tokens,
          naturalTranslation: parsed.naturalTranslation || "Tradução da frase",
          explanation: parsed.explanation || "Estrutura padrão da língua inglesa.",
        };
      }
    } catch (e) {
      console.warn("Falha no Gemini ao destrinchar, utilizando motor léxico local:", e);
    }
  }

  // Motor Léxico Local
  // Divide a frase em palavras preservando contrações e hífens
  const words = clean.match(/[\w'-]+|[.,!?;]/g) || [clean];
  const tokens: WordToken[] = words.map((w) => {
    const isPunctuation = /^[.,!?;]$/.test(w);
    if (isPunctuation) {
      return {
        word: w,
        partOfSpeech: "Pontuação",
        posBadge: "Sinal",
        posColor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
        literalTranslation: w,
      };
    }

    const lower = w.toLowerCase().replace(/['’]s$/, "");
    const info = POS_LEXICON[lower];
    if (info) {
      return {
        word: w,
        partOfSpeech: info.pos,
        posBadge: info.badge,
        posColor: info.color,
        literalTranslation: info.trans,
      };
    }

    // Heurísticas morfológicas
    if (lower.endsWith("ing")) {
      return {
        word: w,
        partOfSpeech: "Verbo (forma contínua/gerúndio)",
        posBadge: "Verbo",
        posColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        literalTranslation: `${w.replace(/ing$/, "")}ando/endo`,
      };
    }
    if (lower.endsWith("ed")) {
      return {
        word: w,
        partOfSpeech: "Verbo no Passado / Particípio",
        posBadge: "Verbo",
        posColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        literalTranslation: `${w.replace(/ed$/, "")}ou / passado`,
      };
    }
    if (lower.endsWith("ly")) {
      return {
        word: w,
        partOfSpeech: "Advérbio de Modo",
        posBadge: "Advérbio",
        posColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        literalTranslation: `${w.replace(/ly$/, "")}mente`,
      };
    }

    return {
      word: w,
      partOfSpeech: "Substantivo / Vocábulo",
      posBadge: "Vocábulo",
      posColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      literalTranslation: `[${w}]`,
    };
  });

  // Tradução natural de frases padrão ou tradução concatenada
  let naturalTranslation = "Tradução compreensiva em português.";
  const lowerSentence = clean.toLowerCase();

  if (lowerSentence.includes("i am learning english with smart language today")) {
    naturalTranslation = "Estou aprendendo inglês com o Smart Language hoje.";
  } else if (lowerSentence.includes("she speaks very well because she practices daily")) {
    naturalTranslation = "Ela fala muito bem porque pratica diariamente.";
  } else if (lowerSentence.includes("could you please tell me where the station is")) {
    naturalTranslation = "Você poderia, por favor, me dizer onde fica a estação?";
  } else if (lowerSentence.includes("they have been working on this project since morning")) {
    naturalTranslation = "Eles têm trabalhado neste projeto desde de manhã.";
  } else if (lowerSentence.includes("i would like a cup of hot coffee with milk")) {
    naturalTranslation = "Eu gostaria de uma xícara de café quente com leite.";
  } else if (lowerSentence.includes("you should always believe in yourself and keep going")) {
    naturalTranslation = "Você deve sempre acreditar em si mesmo e seguir em frente.";
  } else {
    // Estimativa natural combinando as palavras
    naturalTranslation = tokens
      .filter((t) => t.posBadge !== "Sinal")
      .map((t) => t.literalTranslation.replace(/^\[|\]$/g, ""))
      .join(" ");
  }

  return {
    original: clean,
    tokens,
    naturalTranslation,
    explanation: "Em inglês, a ordem típica é Sujeito + Verbo + Objeto (SVO), com adjetivos posicionados antes dos substantivos.",
  };
}
