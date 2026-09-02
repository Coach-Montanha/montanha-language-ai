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
  // Regras para erros sutis e pequenos
  {
    pattern: /\blisten\s+music\b/i,
    fix: () => "listen to music",
    explanation: "Depois do verbo 'listen', é obrigatório usar a preposição 'to' ('listen to music').",
  },
  {
    pattern: /\bin\s+the\s+(bus|train|plane|subway|flight)\b/i,
    fix: (m) => m.replace(/in\s+the/i, "on the"),
    explanation: "Para transportes públicos grandes onde você fica em pé, usamos 'on', não 'in'.",
  },
  {
    pattern: /\bgood\s+in\s+(english|math|sports|cooking|playing|coding)\b/i,
    fix: (m) => m.replace(/good\s+in/i, "good at"),
    explanation: "Para expressar habilidade em algo, a preposição correta é 'good at', não 'good in'.",
  },
  {
    pattern: /\blook\s+to\s+(me|you|him|her|it|them|us|the\s+mirror|the\s+sky)\b/i,
    fix: (m) => m.replace(/look\s+to/i, "look at"),
    explanation: "Para olhar para algo ou alguém, usamos o phrasal verb 'look at', não 'look to'.",
  },
  {
    pattern: /\binformations\b/i,
    fix: () => "information",
    explanation: "'Information' é substantivo incontável em inglês e nunca vai para o plural com 's'.",
  },
  {
    pattern: /\bi\s+have\s+a\s+doubt\b/i,
    fix: () => "I have a question",
    explanation: "Para tirar uma dúvida em inglês, dizemos 'I have a question' ('doubt' soa como desconfiança).",
  },
  {
    pattern: /\bpay\s+attention\s+in\b/i,
    fix: () => "pay attention to",
    explanation: "A regência de prestar atenção em inglês usa a preposição 'to' ('pay attention to').",
  },
  {
    pattern: /\bwait\s+(me|you|him|her|them|us)\b/i,
    fix: (m) => m.replace(/wait\s+/i, "wait for "),
    explanation: "O verbo 'wait' exige a preposição 'for' antes da pessoa que você está esperando.",
  },
  {
    pattern: /\b(he|she|it)\s+(like|want|need|work|live|say|play|know|think)\b/i,
    fix: (m) => {
      const parts = m.split(/\s+/);
      return `${parts[0]} ${parts[1]}s`;
    },
    explanation: "Na 3ª pessoa do singular (he/she/it) no presente, o verbo recebe 's' no final.",
  },
  {
    pattern: /\bi\s+have\s+(car|dog|cat|computer|phone|house|job|problem)\b/i,
    fix: (m) => m.replace(/have\s+/i, "have a "),
    explanation: "Faltou o artigo indefinido 'a' antes do substantivo contável singular ('have a...').",
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

// 1. CONVERSA: Tutor "Leo de Chicago"
import { TutorPersona } from "@/types/language";
import { DEFAULT_TUTOR } from "@/data/tutors";

export async function tutorChat(
  userInput: string,
  history: ChatMessage[],
  apiKey?: string,
  tutorPersona?: TutorPersona
): Promise<{
  replyText: string;
  phonetic?: string | undefined;
  translationPt?: string | undefined;
  correction?: GrammarCorrection | undefined;
}> {
  const activeTutor = tutorPersona || DEFAULT_TUTOR;
  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish (Español)",
    ja: "Japanese (日本語 - with Romaji & Hiragana/Kanji)",
    "el-koine": "Biblical Koine Greek (Ancient Greek of the New Testament)",
    it: "Italian (Italiano)",
    fr: "French (Français)",
    de: "German (Deutsch)",
  };
  const targetLangName = langNames[activeTutor.language] || "English";

  // Se houver chave Gemini configurada, usar IA com a personalidade completa do tutor escolhido
  if (apiKey) {
    try {
      const systemPrompt = `You are "${activeTutor.name}", a native/expert tutor teaching ${targetLangName} from ${activeTutor.city}, ${activeTutor.country} (${activeTutor.gender === "female" ? "female" : "male"}).
Target Language being taught and practiced: ${targetLangName}.
Your background & personality:
- Style: ${activeTutor.styleTitle} - ${activeTutor.styleDesc}
- Bio: ${activeTutor.bioPt}
- Demeanor: You are always exceedingly polite, gentle, encouraging, and kind. You make the student feel completely safe, valued, and motivated.
- The conversation MUST be in ${targetLangName}. For Japanese, include Romaji alongside Japanese text. For Koine Greek, write in Greek script with transliteration.

CRITICAL RULES (INVIOLABLE):
- You ALWAYS catch and correct EVERY mistake in ${targetLangName}, even tiny ones! (missing articles, gender agreement, conjugation, particles, spelling slips).
- Never let small mistakes slip! Point them out with great kindness, patience, and politeness.
- Whenever there is any mistake, provide a crystal-clear explanation in Brazilian Portuguese in EXACTLY ONE line.
- Always provide friendly phonetic pronunciation in Portuguese syllables (phonetic).
- Always provide a natural Brazilian Portuguese translation of replyText (translationPt).

Respond in strictly valid JSON format:
{
  "hasError": boolean,
  "corrected": "corrected sentence in ${targetLangName} or empty string",
  "explanationPt": "Explicação amigável e direta em português em exatamente UMA linha (ou vazio se perfeito)",
  "replyText": "${activeTutor.name}'s conversational response in ${targetLangName}, keeping the dialogue flowing",
  "phonetic": "Friendly phonetic pronunciation transcription in Portuguese syllables, for example: [ Réi! Áim Lú-cas... ]",
  "translationPt": "Tradução natural da resposta para o português brasileiro"
}`;

      const historyFormatted = history
        .slice(-6)
        .map((m) => `${m.sender === "user" ? "User" : activeTutor.name}: ${m.text}`)
        .join("\n");

      const prompt = `Recent Conversation:\n${historyFormatted}\n\nUser said: "${userInput}"\n\nGenerate ${activeTutor.name}'s response:`;
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

      const replyText =
        parsed.replyText ||
        `That's great! Tell me more about that, my friend.`;
      const phonetic = parsed.phonetic || generatePhoneticGuide(replyText);
      const translationPt = parsed.translationPt || "Isso é ótimo! Me conte mais sobre isso, meu amigo.";

      return {
        replyText,
        phonetic,
        translationPt,
        correction,
      };
    } catch (e) {
      console.warn("Falha no Gemini, utilizando motor inteligente local:", e);
    }
  }

  // Motor Inteligente Local (Offline / Sem API Key) com suporte a múltiplos idiomas e personalidade
  const localCorrection = checkGrammarLocal(userInput);
  const lower = userInput.toLowerCase();

  let replyText = "";
  let translationPt = "";

  if (activeTutor.language === "es") {
    if (lower.includes("hola") || lower.includes("buenos") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `¡Hola! Me alegra muchísimo hablar contigo hoy. ¿Cómo te encuentras?`;
      translationPt = `Olá! Fico muito feliz em falar com você hoje. Como você está?`;
    } else if (lower.includes("como estas") || lower.includes("cómo estás") || lower.includes("que tal")) {
      replyText = `¡Estoy muy bien, gracias por preguntar! Con muchas ganas de practicar español contigo. ¿Qué planes tienes hoy?`;
      translationPt = `Estou muito bem, obrigado por perguntar! Com muita vontade de praticar espanhol com você. Que planos você tem hoje?`;
    } else {
      replyText = `¡Eso suena muy interesante! Cuéntame un poco más sobre eso, amigo.`;
      translationPt = `Isso parece muito interessante! Me conte um pouco mais sobre isso, amigo.`;
    }
  } else if (activeTutor.language === "ja") {
    if (lower.includes("konnichiwa") || lower.includes("ohayou") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `Konnichiwa! Issho ni Nihongo o renshuu shimashou. Kyou wa donna hi deshita ka?`;
      translationPt = `Olá! Vamos praticar japonês juntos. Como foi o seu dia hoje?`;
    } else {
      replyText = `Sore wa totemo omoshiroi desu ne! Motto oshiete kudasai.`;
      translationPt = `Isso é muito interessante! Por favor, me conte mais sobre isso.`;
    }
  } else if (activeTutor.language === "el-koine") {
    if (lower.includes("chaire") || lower.includes("paz") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `Cháirete! Cháris hymîn kaì eirênê apò Theou. Tí theleis matheîn sêmeron?`;
      translationPt = `Alegrai-vos! Graça e paz a vós da parte de Deus. O que desejas aprender hoje?`;
    } else {
      replyText = `Kálon kaì thaumastón estin! Anaginóskomen tàs graphás met' eunoías.`;
      translationPt = `Isso é belo e maravilhoso! Lemos os textos sagrados com dedicação.`;
    }
  } else if (activeTutor.language === "it") {
    if (lower.includes("ciao") || lower.includes("buongiorno") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `Ciao! Che grandissimo piacere parlare con te. Come sta andando la tua giornata?`;
      translationPt = `Olá! Que enorme prazer falar com você. Como está indo o seu dia?`;
    } else {
      replyText = `È davvero molto interessante! Raccontami qualcosa in più.`;
      translationPt = `É realmente muito interessante! Me conte algo mais a respeito.`;
    }
  } else if (activeTutor.language === "fr") {
    if (lower.includes("bonjour") || lower.includes("salut") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `Bonjour ! Quel grand plaisir d'échanger avec vous. Comment allez-vous aujourd'hui ?`;
      translationPt = `Bom dia! Que grande prazer conversar com você. Como vai você hoje?`;
    } else {
      replyText = `C'est vraiment très intéressant ! Racontez-moi un peu plus.`;
      translationPt = `Isso é realmente muito interessante! Me conte um pouco mais.`;
    }
  } else if (activeTutor.language === "de") {
    if (lower.includes("hallo") || lower.includes("guten") || lower.includes("tag") || lower.includes("morgen") || lower.includes("oi") || lower.includes("ola")) {
      replyText = `Hallo! Herzlich willkommen. Schön, dich kennenzulernen! Wie geht es dir heute?`;
      translationPt = `Olá! Boas-vindas. Muito bom te conhecer! Como vai você hoje?`;
    } else if (lower.includes("wie geht") || lower.includes("alles gut")) {
      replyText = `Mir geht es super, danke der Nachfrage! Ich freue mich sehr darauf, mit dir Deutsch zu üben.`;
      translationPt = `Estou ótimo, obrigado por perguntar! Fico muito feliz em praticar alemão com você.`;
    } else {
      replyText = `Das ist wirklich sehr interessant! Erzähl mir gern noch ein bisschen mehr darüber.`;
      translationPt = `Isso é realmente muito interessante! Fique à vontade para me contar um pouco mais sobre isso.`;
    }
  } else

  if (lower.includes("hello") || lower.includes("hi ") || lower.startsWith("hi")) {
    if (activeTutor.id === "emma") {
      replyText = `Hello darling! Emma here from London. It is a true delight to speak with you! How has your day been so far?`;
      translationPt = `Olá querido(a)! Aqui é a Emma de Londres. É uma alegria falar com você! Como tem sido o seu dia até agora?`;
    } else if (activeTutor.id === "sophia") {
      replyText = `Hi there! Sophia here from New York! So excited to practice with you today. How is everything going?`;
      translationPt = `Oi! Aqui é a Sophia de Nova York! Muito animada para praticar com você hoje. Como estão as coisas?`;
    } else if (activeTutor.id === "lucas") {
      replyText = `Hey! Lucas here from Toronto. Really glad you're here. How has your day been treating you?`;
      translationPt = `Oi! Aqui é o Lucas de Toronto. Muito feliz de você estar aqui. Como o seu dia está te tratando?`;
    } else {
      replyText = `Hey there! Leo here, straight out of Chicago! Great to talk to you. How's your day treating you so far?`;
      translationPt = `E aí! Aqui é o Leo, direto de Chicago! Muito bom falar com você. Como está sendo o seu dia até agora?`;
    }
  } else if (lower.includes("where are you from") || lower.includes("city")) {
    replyText = `I'm from ${activeTutor.city}, ${activeTutor.country}! ${activeTutor.bioPt.split(".")[0]}. Have you ever visited?`;
    translationPt = `Eu sou de ${activeTutor.city}, ${activeTutor.country}! Você já visitou algum dia?`;
  } else if (lower.includes("my name is") || lower.includes("i am ") || lower.includes("i'm ")) {
    if (activeTutor.id === "emma") {
      replyText = `It is such a pleasure to meet you! Never worry about making mistakes with me — we'll gently polish every phrase together.`;
      translationPt = `É um grande prazer te conhecer! Nunca se preocupe em errar comigo — vamos polir cada frase gentilmente juntos.`;
    } else if (activeTutor.id === "sophia") {
      replyText = `Awesome to meet you! I love your motivation. Speak freely — I'll catch every little detail and help you sound confident!`;
      translationPt = `Incrível te conhecer! Adorei sua motivação. Fale à vontade — vou notar cada detalhe e te ajudar a falar com confiança!`;
    } else if (activeTutor.id === "lucas") {
      replyText = `Great to meet you! There's absolutely zero rush here. We'll take our time and master this step by step.`;
      translationPt = `Muito bom te conhecer! Não há pressa alguma aqui. Vamos no seu tempo e dominar isso passo a passo.`;
    } else {
      replyText = `Nice to meet you, my friend! Love the energy. Don't worry about slips with me — I'll catch every little mistake so you speak like a local!`;
      translationPt = `Prazer em te conhecer, meu amigo! Adorei a energia. Não se preocupe com deslizes — vou pegar cada errinho para você falar como um nativo!`;
    }
  } else if (lower.includes("how are you")) {
    if (activeTutor.id === "emma") {
      replyText = `I'm doing splendidly, thank you! Just enjoying a lovely cup of tea. What would you like to explore today?`;
      translationPt = `Estou esplendidamente bem, obrigada! Apenas aproveitando uma deliciosa xícara de chá. O que gostaria de explorar hoje?`;
    } else if (activeTutor.id === "sophia") {
      replyText = `I'm feeling great and energized! Ready to practice real-world communication with you. What are you up to today?`;
      translationPt = `Estou me sentindo ótima e cheia de energia! Pronta para praticar conversas da vida real com você. O que vai fazer hoje?`;
    } else if (activeTutor.id === "lucas") {
      replyText = `Doing really well, thanks for asking! Ready to practice whenever you are. What's on your mind?`;
      translationPt = `Indo muito bem, obrigado por perguntar! Pronto para praticar quando você quiser. No que você está pensando?`;
    } else {
      replyText = `I'm doing fantastic! Just grabbed a hot coffee, ready to practice some real-world English with you. What are you working on today?`;
      translationPt = `Estou fantástico! Acabei de pegar um café quente, pronto para praticar inglês da vida real com você. Em que você está trabalhando hoje?`;
    }
  } else if (lower.includes("good morning")) {
    replyText = `Good morning! Hope your morning is off to a peaceful start. What is on your agenda for today?`;
    translationPt = `Bom dia! Espero que sua manhã tenha começado com tranquilidade. O que está na sua agenda hoje?`;
  } else if (lower.includes("good night")) {
    replyText = `Good night! Rest well and sleep peacefully. We will continue our practice tomorrow!`;
    translationPt = `Boa noite! Descanse bem e durma em paz. Continuaremos nosso treino amanhã!`;
  } else if (lower.includes("help") || lower.includes("dúvida") || lower.includes("portugues")) {
    replyText = `I am right here with you! Feel free to ask anything, no matter how small. I am happy to help!`;
    translationPt = `Estou bem aqui ao seu lado! Sinta-se à vontade para perguntar qualquer coisa, por menor que seja. Fico feliz em ajudar!`;
  } else if (userInput.split(" ").length < 3) {
    replyText = `Short and sweet! Let's challenge yourself: try making a full sentence explaining why! What do you think?`;
    translationPt = `Curto e direto! Vamos se desafiar: tente montar uma frase completa explicando o porquê! O que você acha?`;
  } else {
    const generalReplies = [
      {
        en: `That sounds very interesting! Could you tell me a little bit more about that?`,
        pt: `Isso parece muito interessante! Você poderia me contar um pouco mais sobre isso?`,
      },
      {
        en: `I completely understand what you mean. How does that usually work out for you?`,
        pt: `Eu entendo perfeitamente o que você quer dizer. Como isso geralmente funciona para você?`,
      },
      {
        en: `You expressed that very nicely! What was the most exciting part of it for you?`,
        pt: `Você expressou isso muito bem! Qual foi a parte mais emocionante disso para você?`,
      },
      {
        en: `Step by step you are sounding clearer and clearer. What happened next?`,
        pt: `Passo a passo você está soando cada vez mais claro. O que aconteceu depois?`,
      },
      {
        en: `I really appreciate you sharing that with me! How did that make you feel?`,
        pt: `Agradeço muito por você compartilhar isso comigo! Como isso fez você se sentir?`,
      },
    ];
    const picked = generalReplies[Math.floor(Math.random() * generalReplies.length)]!;
    replyText = picked.en;
    translationPt = picked.pt;
  }

  const phonetic = generatePhoneticGuide(replyText);

  return {
    replyText,
    phonetic,
    translationPt,
    correction: localCorrection.hasError ? localCorrection : undefined,
  };
}

export interface ScenarioChatResult {
  replyText: string;
  suggestedReplies: string[];
  structuredSuggestions?: {
    english: string;
    phonetic: string;
    portuguese: string;
  }[];
}

const PHONETIC_MAP: Record<string, string> = {
  the: "da",
  a: "a",
  an: "én",
  i: "ái",
  you: "iú",
  he: "rí",
  she: "shí",
  we: "uí",
  they: "dêi",
  it: "it",
  my: "mái",
  your: "iór",
  is: "íz",
  are: "ar",
  am: "ém",
  have: "rév",
  has: "réz",
  can: "kén",
  could: "cûd",
  would: "uûd",
  should: "shûd",
  get: "guét",
  take: "têik",
  like: "láik",
  want: "uónt",
  need: "níd",
  help: "rélp",
  please: "plíz",
  to: "tu",
  go: "gou",
  with: "uíd",
  for: "fór",
  from: "frâm",
  where: "uér",
  what: "uót",
  when: "uén",
  why: "uái",
  how: "ráo",
  much: "mâtch",
  cost: "cóst",
  price: "práis",
  discount: "dís-cáunt",
  cash: "késh",
  card: "cárd",
  coffee: "có-fi",
  large: "lárdji",
  latte: "lá-tei",
  milk: "mílk",
  hotel: "rou-tél",
  room: "rúm",
  subway: "sâb-uei",
  train: "trêin",
  station: "stêi-shân",
  work: "uôrk",
  day: "dêi",
  today: "tu-dêi",
  tomorrow: "tu-mó-rou",
  issue: "í-shu",
  problem: "pró-blêm",
  agree: "a-grí",
  think: "tĩnk",
  because: "bi-cóz",
  risk: "rísk",
  launch: "lón-tch",
  test: "tést",
  safe: "sêif",
  sure: "shûr",
  good: "gúd",
  great: "grêit",
  awesome: "ó-sâm",
  thanks: "ténks",
  thank: "ténk",
  one: "uân",
  two: "tú",
  three: "trí",
  four: "fór",
  five: "fáiv",
  hello: "ré-lou",
  hi: "rái",
  hey: "rêi",
  excuse: "éks-kiúz",
  me: "mi",
  yes: "iés",
  no: "nóu",
};

export function generatePhoneticGuide(english: string): string {
  const words = english.replace(/[.,!?;:"]/g, "").split(/\s+/);
  return words
    .map((w) => {
      const lower = w.toLowerCase();
      if (PHONETIC_MAP[lower]) return PHONETIC_MAP[lower];
      // Regras fonéticas aproximadas
      return lower
        .replace(/th/g, "t")
        .replace(/ph/g, "f")
        .replace(/ch/g, "tch")
        .replace(/sh/g, "sh")
        .replace(/ee|ea/g, "i")
        .replace(/oo/g, "u")
        .replace(/w/g, "u")
        .replace(/r\b/g, "r");
    })
    .join(" ");
}

export function getPortugueseTranslation(english: string): string {
  const lower = english.toLowerCase().trim();

  // Saudações iniciais dos tutores
  if (lower.includes("straight out of chicago") || (lower.includes("leo") && lower.includes("chicago"))) {
    return "Olá! Eu sou o Leo de Chicago. Super animado para conversar com você! Não se preocupe em errar — vou corrigir com carinho cada deslize para você soar natural. Como tem sido o seu dia?";
  }
  if (lower.includes("emma from london") || (lower.includes("emma") && lower.includes("london"))) {
    return "Olá querido(a)! Eu sou a Emma de Londres. É um prazer absoluto te conhecer. Vá no seu ritmo, não há pressa alguma, e vamos polir o seu inglês juntos. Sobre o que você gostaria de conversar hoje?";
  }
  if (lower.includes("sophia here from new york") || (lower.includes("sophia") && lower.includes("new york"))) {
    return "Oi! Aqui é a Sophia de Nova York! Você tem um potencial incrível e estou aqui para te apoiar 100%. Fale à vontade — vou notar qualquer errinho e te orientar. O que você está fazendo hoje?";
  }
  if (lower.includes("lucas from toronto") || (lower.includes("lucas") && lower.includes("toronto"))) {
    return "Olá! Eu sou o Lucas de Toronto. É muito bom ter você aqui. Não há pressão alguma na nossa conversa — cada pequeno erro é apenas um passo adiante. Como estão as coisas com você hoje?";
  }

  // Respostas comuns de diálogo
  if (lower.includes("day been treating you") || lower.includes("day treating you")) {
    return "Como o seu dia está te tratando até agora?";
  }
  if (lower.includes("pleasure to meet you") || lower.includes("nice to meet you")) {
    return "É um enorme prazer te conhecer! Não se preocupe com erros, vamos praticar juntos com calma.";
  }
  if (lower.includes("splendidly, thank you") || lower.includes("doing splendidly")) {
    return "Estou esplendidamente bem, muito obrigada! O que gostaria de explorar hoje?";
  }
  if (lower.includes("doing fantastic")) {
    return "Estou me sentindo fantástico! Pronto para praticar inglês da vida real com você. O que você está fazendo hoje?";
  }
  if (lower.includes("doing really well")) {
    return "Estou muito bem, obrigado por perguntar! Pronto para praticar quando você quiser. No que você está pensando?";
  }
  if (lower.includes("good morning")) {
    return "Bom dia! Espero que seu dia tenha começado com tranquilidade e boas energias. O que você tem planejado para hoje?";
  }
  if (lower.includes("good night")) {
    return "Boa noite! Descanse bem e durma em paz. Amanhã continuamos nosso aprendizado!";
  }
  if (lower.includes("right here with you") || lower.includes("happy to help")) {
    return "Estou bem aqui ao seu lado! Fique à vontade para perguntar qualquer coisa, por menor que seja.";
  }
  if (lower.includes("sounds very interesting")) {
    return "Isso parece muito interessante! Você poderia me contar um pouco mais sobre isso?";
  }
  if (lower.includes("completely understand what you mean")) {
    return "Eu entendo perfeitamente o que você quer dizer. Como isso costuma funcionar para você?";
  }
  if (lower.includes("expressed that very nicely")) {
    return "Você expressou isso muito bem! Qual foi a parte mais emocionante disso para você?";
  }
  if (lower.includes("sounding clearer and clearer")) {
    return "Passo a passo você está soando cada vez mais claro. O que aconteceu depois?";
  }

  return "Resposta do tutor acompanhando nossa conversa em inglês.";
}

// 2. CENÁRIO: Roleplay em situações reais
export async function scenarioChat(
  scenario: Scenario,
  userInput: string,
  history: ChatMessage[],
  apiKey?: string
): Promise<ScenarioChatResult> {
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

  const structuredSuggestions = suggestedReplies.map((reply) => {
    const existing = scenario.structuredSuggestions?.find(
      (s) => s.english.toLowerCase() === reply.toLowerCase()
    );
    if (existing) return existing;
    return {
      english: reply,
      phonetic: generatePhoneticGuide(reply),
      portuguese: "Toque para responder",
    };
  });

  return { replyText, suggestedReplies, structuredSuggestions };
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
