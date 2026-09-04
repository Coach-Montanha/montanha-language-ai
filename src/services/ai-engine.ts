import {
  GrammarCorrection,
  ChatMessage,
  Flashcard,
  SentenceAnalysis,
  WordToken,
  Scenario,
  SupportedLanguage,
  ContextualSuggestion,
  TutorChatResponse,
} from "@/types/language";
import { PRESET_THEMES, getPresetThemesForLanguage } from "@/data/vocabulary";
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

export function getDynamicSuggestions(
  language: SupportedLanguage,
  userInput: string = "",
  tutor?: TutorPersona
): ContextualSuggestion[] {
  const tutorName = tutor?.name || "Tutor";
  const lower = userInput.toLowerCase();

  switch (language) {
    case "de": {
      if (lower.includes("kaffee") || lower.includes("trinken") || lower.includes("essen")) {
        return [
          {
            category: "agree",
            label: "☕ Café de manhã",
            text: "Ich trinke meinen Kaffee am liebsten morgens nach dem Aufstehen.",
            phonetic: "Ikh trín-ke mái-nen Ka-fê am líps-ten môr-guens nakh dêm Áuf-chtê-en.",
            translationPt: "Eu tomo meu café preferencialmente de manhã após levantar.",
          },
          {
            category: "alternative",
            label: "🍵 Prefiro chá",
            text: "Eigentlich trinke ich lieber grünen Tee als Kaffee.",
            phonetic: "Ái-guent-likh trín-ke ikh lí-ber grú-nen Tê als Ka-fê.",
            translationPt: "Na verdade, prefiro beber chá verde a café.",
          },
          {
            category: "ask_back",
            label: "🔄 E você, tutor?",
            text: `Und wie trinkst du deinen Kaffee am liebsten, ${tutorName}?`,
            phonetic: `Unt vi trínkst du dái-nen Ka-fê am líps-ten, ${tutorName}?`,
            translationPt: `E como você prefere tomar seu café, ${tutorName}?`,
          },
          {
            category: "detail",
            label: "🥨 Com comida típica",
            text: "Eine frische Brezel dazu schmeckt einfach fantastisch!",
            phonetic: "Ái-ne frí-she Bré-tsel da-tsu shmêkt áin-fakh fan-tás-tish!",
            translationPt: "Um pretzel fresco acompanhando fica simplesmente fantástico!",
          },
          {
            category: "quick",
            label: "⚡ Curto & Natural",
            text: "Schwarz ohne Zucker, bitte!",
            phonetic: "Shvarts ô-ne Tsú-ker, bí-te!",
            translationPt: "Preto sem açúcar, por favor!",
          },
          {
            category: "general",
            label: "💬 Dica de pedido",
            text: "Wie bestellt man das am natürlichsten im Café?",
            phonetic: "Vi be-chtêlt man das am na-túr-likhs-ten im Ka-fê?",
            translationPt: "Como se pede isso da forma mais natural na cafeteria?",
          },
        ];
      }
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Ja, genau! Das sehe ich ganz genauso.",
          phonetic: "Iá, gue-náu! Das zê-e ikh gants gue-náu-zo.",
          translationPt: "Sim, exatamente! Eu vejo isso da mesma forma.",
        },
        {
          category: "alternative",
          label: "🤔 Outra perspectiva",
          text: "Eigentlich sehe ich das aus einem etwas anderen Blickwinkel.",
          phonetic: "Ái-guent-likh zê-e ikh das áus ái-nem ét-vas án-de-ren Blík-vin-kel.",
          translationPt: "Na verdade, vejo isso sob um outro ponto de vista.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `Und was denkst du persönlich darüber, ${tutorName}?`,
          phonetic: `Unt vas dênkst du per-zên-likh da-rú-ber, ${tutorName}?`,
          translationPt: `E o que você pensa pessoalmente sobre isso, ${tutorName}?`,
        },
        {
          category: "detail",
          label: "💬 Rotina de estudo",
          text: "In meinem Alltag versuche ich jeden Tag zehn Minuten Deutsch zu üben.",
          phonetic: "In mái-nem Áll-tak fer-zú-khe ikh iê-den Tak tsên Mi-nú-ten Dóitsh tsu ú-ben.",
          translationPt: "Na minha rotina, tento praticar dez minutos de alemão todos os dias.",
        },
        {
          category: "quick",
          label: "⚡ Rápida & Natural",
          text: "Das klingt wirklich sehr interessant!",
          phonetic: "Das clingt vírk-likh zêr in-te-re-sánt!",
          translationPt: "Isso soa realmente muito interessante!",
        },
        {
          category: "general",
          label: "❓ Exemplo prático",
          text: "Kannst du mir dafür ein praktisches Beispiel geben?",
          phonetic: "Kánst du mir da-fúr áin prák-ti-shes Bái-shpil guê-ben?",
          translationPt: "Pode me dar um exemplo prático disso?",
        },
      ];
    }
    case "es": {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "¡Sí, totalmente! Estoy completamente de acuerdo contigo.",
          phonetic: "Sí, to-tal-mén-te! Es-tói com-ple-ta-mén-te de a-cuêr-do con-tí-go.",
          translationPt: "Sim, totalmente! Estou completamente de acordo com você.",
        },
        {
          category: "alternative",
          label: "🤔 Outra opinião",
          text: "En realidad, yo tengo una preferencia un poco diferente.",
          phonetic: "En re-a-li-dád, yo tên-go ú-na pre-fe-rên-sia un pô-co di-fe-rên-te.",
          translationPt: "Na verdade, tenho uma preferência um pouco diferente.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `¿Y en tu ciudad cómo se suele hacer esto, ${tutorName}?`,
          phonetic: `I en tu siu-dád cô-mo se suê-le a-sér és-to, ${tutorName}?`,
          translationPt: `E na sua cidade como se costuma fazer isso, ${tutorName}?`,
        },
        {
          category: "detail",
          label: "💬 Falar da rotina",
          text: "Para mí lo más importante es ganar confianza y soltura al hablar.",
          phonetic: "Pá-ra mi lo mas im-por-tán-te es ga-nár con-fián-sa i sol-tú-ra al a-blár.",
          translationPt: "Para mim o mais importante é ganhar confiança e desenvoltura ao falar.",
        },
        {
          category: "quick",
          label: "⚡ Resposta casual",
          text: "¡Qué buena idea! Me parece genial.",
          phonetic: "Qué buê-na i-dê-a! Me pa-rê-se ge-niál.",
          translationPt: "Que boa ideia! Acho genial.",
        },
        {
          category: "general",
          label: "❓ Expressão nativa",
          text: "¿Cómo diría esto un hispanohablante nativo?",
          phonetic: "Cô-mo di-rí-a és-to un is-pa-no-a-blán-te na-tí-vo?",
          translationPt: "Como um nativo falante de espanhol diria isso?",
        },
      ];
    }
    case "it": {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Sì, assolutamente! La penso esattamente come te.",
          phonetic: "Sí, as-so-lu-ta-mên-te! La pên-so e-zat-ta-mên-te cô-me te.",
          translationPt: "Sim, com certeza! Penso exatamente como você.",
        },
        {
          category: "alternative",
          label: "🤔 Alternativa",
          text: "In realtà, per me è un po' diverso.",
          phonetic: "In re-al-tà, per me è un po di-vêr-so.",
          translationPt: "Na verdade, para mim é um pouco diferente.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `E tu cosa mi consigli di fare, ${tutorName}?`,
          phonetic: `E tu cô-za mi con-sí-lhi di fá-re, ${tutorName}?`,
          translationPt: `E você, o que me recomenda fazer, ${tutorName}?`,
        },
        {
          category: "detail",
          label: "💬 Rotina e planos",
          text: "Voglio fare pratica ogni giorno per parlare con disinvoltura.",
          phonetic: "Vô-lho fá-re prá-ti-ca ô-nhi djôr-no per par-lá-re con di-zin-vôl-tu-ra.",
          translationPt: "Quero praticar todos os dias para falar com naturalidade.",
        },
        {
          category: "quick",
          label: "⚡ Rápida & Calorosa",
          text: "Che meraviglia! Mi fa molto piacere.",
          phonetic: "Que me-ra-ví-lha! Mi fa môl-to pia-tchê-re.",
          translationPt: "Que maravilha! Fico muito contente.",
        },
        {
          category: "general",
          label: "❓ Modo de dizer",
          text: "C'è un modo di dire tipico per esprimere questo?",
          phonetic: "Tché un mô-do di dí-re tí-pi-co per es-prí-me-re quês-to?",
          translationPt: "Tem uma expressão típica para expressar isso?",
        },
      ];
    }
    case "fr": {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Oui, tout à fait ! Je partage tout à fait ton avis.",
          phonetic: "Uí, tu-ta-fê ! Jê par-táj tu-ta-fê tõn na-ví.",
          translationPt: "Sim, com certeza! Concordo plenamente com sua opinião.",
        },
        {
          category: "alternative",
          label: "🤔 Outro ponto de vista",
          text: "De mon côté, j'ai une approche un peu différente.",
          phonetic: "Dê mõ co-tê, jê ün a-prôch ẽn pôi di-fê-rãnt.",
          translationPt: "Do meu lado, tenho uma abordagem um pouco diferente.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `Et toi ${tutorName}, qu'en penses-tu personnellement ?`,
          phonetic: `E tuá ${tutorName}, cãn pãns-tu per-so-nêl-mã ?`,
          translationPt: `E você ${tutorName}, o que pensa pessoalmente sobre isso?`,
        },
        {
          category: "detail",
          label: "💬 Minha experiência",
          text: "J'essaie de pratiquer la prononciation à voix haute chaque jour.",
          phonetic: "Jê-sêi dê pra-ti-quê la pro-nõn-sia-siõ a vuá rôt chak júr.",
          translationPt: "Tento praticar a pronúncia em voz alta todos os dias.",
        },
        {
          category: "quick",
          label: "⚡ Resposta curta",
          text: "C'est tout à fait ça, merci beaucoup !",
          phonetic: "Sê tu-ta-fê sa, mer-sí bo-cú !",
          translationPt: "É exatamente isso, muito obrigado!",
        },
        {
          category: "general",
          label: "❓ Dica de nativo",
          text: "Comment un Français exprimerait cela naturellement ?",
          phonetic: "Co-mã ẽn frãn-sê eks-pri-mê-rê sê-la na-tu-rêl-mã ?",
          translationPt: "Como um francês expressaria isso naturalmente?",
        },
      ];
    }
    case "ja": {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Hai, watashi mo mattaku onaji iken desu. (はい、私も全く同じ意見です)",
          phonetic: "Rái, ua-tá-chi mo mat-ta-cu o-na-dji i-quên des.",
          translationPt: "Sim, eu também tenho exatamente a mesma opinião.",
        },
        {
          category: "alternative",
          label: "🤔 Outra preferência",
          text: "Watashi wa dochirakato ieba, betsu no hou ga suki desu. (私はどちらかと言えば、別の方が好きです)",
          phonetic: "Ua-tá-chi ua do-tchi-ra-ca-to i-ê-ba, bê-tsu no rróu ga su-qui des.",
          translationPt: "Se fosse para escolher, eu prefiro a outra opção.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar ao sensei",
          text: `${tutorName}-san wa dou omoimasu ka? (どう思いますか？)`,
          phonetic: `${tutorName}-san ua dô o-mo-i-mas ca?`,
          translationPt: `E você, ${tutorName}, o que pensa sobre isso?`,
        },
        {
          category: "detail",
          label: "💬 Falar da rotina",
          text: "Mainichi tanoshiku renshuu shite imasu. (毎日楽しく練習しています)",
          phonetic: "Mái-ni-tchi ta-no-chí-cu ren-chú-u chi-te i-mas.",
          translationPt: "Estou praticando com muita alegria todos os dias.",
        },
        {
          category: "quick",
          label: "⚡ Resposta rápida",
          text: "Naruhodo, yoku wakarimashita! (なるほど、よく分かりました！)",
          phonetic: "Na-ru-rro-do, io-cu ua-ca-rí-ma-chi-ta!",
          translationPt: "Entendi perfeitamente, faz todo sentido!",
        },
        {
          category: "general",
          label: "❓ Pedir exemplo",
          text: "Reibun o hitotsu oshiete kudasai. (例文を一つ教えてください)",
          phonetic: "Rêi-bun o rri-tô-tsu o-chi-ê-te cu-da-sái.",
          translationPt: "Poderia me ensinar uma frase de exemplo?",
        },
      ];
    }
    case "el-koine": {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Ναί, ἀληθῶς οὕτως ἔχει. (Nai, alēthōs houtōs echei)",
          phonetic: "Né, a-le-thôs rru-tôs é-rrêi.",
          translationPt: "Sim, verdadeiramente é assim.",
        },
        {
          category: "alternative",
          label: "🤔 Outro aspecto",
          text: "Ἕτερον δὲ τρόπον νοῶ τοῦτο. (Heteron de tropon noō touto)",
          phonetic: "Rré-te-ron de tró-pon no-ô tú-to.",
          translationPt: "Compreendo isto de uma outra maneira.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: "Τί δὲ σὺ λέγεις περὶ τούτου; (Ti de sy legeis peri toutou?)",
          phonetic: "Tí de si lé-guis pe-rí tú-tu?",
          translationPt: "E tu, o que dizes a respeito disto?",
        },
        {
          category: "detail",
          label: "💬 Meditação bíblica",
          text: "Ἐν τῷ λόγῳ μελετῶ καθ’ ἡμέραν. (En tōi logōi meletō kath' hēmeran)",
          phonetic: "En tôi ló-gôi me-le-tô cath' rre-mé-ran.",
          translationPt: "Medito na palavra todos os dias.",
        },
        {
          category: "quick",
          label: "⚡ Bênção e louvor",
          text: "Χάρις καὶ εἰρήνη πληθυνθείη! (Charis kai eirēnē plēthyntheiē!)",
          phonetic: "Ká-ris ke ei-rê-ne ple-thin-thêi-e!",
          translationPt: "Graça e paz vos sejam multiplicadas!",
        },
        {
          category: "general",
          label: "❓ Significado do termo",
          text: "Τί σημαίνει ὁ λόγος οὗτος; (Ti sēmainei ho logos houtos?)",
          phonetic: "Tí se-mê-ni rro ló-gos rru-tos?",
          translationPt: "O que significa esta palavra no texto original?",
        },
      ];
    }
    case "en":
    default: {
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Yes, exactly! I totally agree with what you said.",
          phonetic: "Iés, eg-zék-tli! Ái tô-ta-li a-grí uídh uót iú séd.",
          translationPt: "Sim, com certeza! Concordo totalmente com o que você disse.",
        },
        {
          category: "alternative",
          label: "🤔 Outro ponto de vista",
          text: "To be honest, I usually look at it from another angle.",
          phonetic: "Tu bi ó-nest, ái iú-ju-a-li lúk ét it frôm a-nâ-dher én-gel.",
          translationPt: "Para ser sincero, costumo ver isso de outro ângulo.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `And what about you, ${tutorName}? What's your take on this?`,
          phonetic: `Énd uót a-báut iú, ${tutorName}? Uóts iór têik on dhís?`,
          translationPt: `E quanto a você, ${tutorName}? Qual é a sua visão sobre isso?`,
        },
        {
          category: "detail",
          label: "💬 Falar da rotina",
          text: "In my daily routine, I try to practice speaking out loud.",
          phonetic: "In mái dêi-li ru-tín, ái trái tu prék-tis spí-king áut láud.",
          translationPt: "Na minha rotina diária, tento praticar a fala em voz alta.",
        },
        {
          category: "quick",
          label: "⚡ Resposta rápida",
          text: "That sounds awesome, thanks for sharing!",
          phonetic: "Dhét sáundz ó-sâm, thénks fôr chê-ring!",
          translationPt: "Isso parece incrível, obrigado por compartilhar!",
        },
        {
          category: "general",
          label: "❓ Dica de nativo",
          text: "Could you teach me a natural idiom for that?",
          phonetic: "Cúd iú títch mi ê né-tchu-ral í-di-âm fôr dhét?",
          translationPt: "Você poderia me ensinar uma expressão idiomática natural para isso?",
        },
      ];
    }
  }
}

export async function tutorChat(
  userInput: string,
  history: ChatMessage[],
  apiKey?: string,
  tutorPersona?: TutorPersona
): Promise<TutorChatResponse> {
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
      const systemPrompt = `You are "${activeTutor.name}", a charismatic, warm, friendly, and highly engaging native tutor teaching ${targetLangName} from ${activeTutor.city}, ${activeTutor.country} (${activeTutor.gender === "female" ? "female" : "male"}).
Target Language being taught and practiced: ${targetLangName}.

Your Persona & Conversational Style:
- Style: ${activeTutor.styleTitle} - ${activeTutor.styleDesc}
- Bio: ${activeTutor.bioPt}
- Goal: Make the dialogue feel GENUINELY ALIVE, NATURAL, ENGAGING, and CONVERSATIONAL — like two friends enjoying coffee, NOT a robotic exam or rigid grammar textbook.
- Interaction Guidelines:
  1. ALWAYS react authentically to what the user said first (empathy, enthusiasm, humor, warmth, or a relatable detail from ${activeTutor.city}).
  2. Speak in natural, modern, communicative ${targetLangName}. (For Japanese: include Kanji/Kana and Romaji. For Koine Greek: include Greek script with transliteration).
  3. Keep the conversation moving forward by asking an open, natural, engaging question that invites the student to reply!
  4. KIND & GENTLE CORRECTION: If the student made any mistake (grammar, spelling, missing article, agreement), gently provide the corrected sentence and a clear 1-line explanation in Brazilian Portuguese in the "explanationPt" field. Keep your conversational response "replyText" focused on the flow of thoughts, never embarrassing the student.
  5. USER READING & AUDIO ASSISTANCE:
     - "userPhonetic": Friendly phonetic transcription of what the student said (or the corrected version) in Brazilian Portuguese syllables (e.g. "[ rá-lo, ví guêt es... ]").
     - "userTranslationPt": Natural Brazilian Portuguese translation of what the student said.
  6. EXPANDED DYNAMIC SUGGESTIONS (PROVIDE 5 TO 6 VARIED OPTIONS):
     - Provide 5 to 6 varied, natural suggested replies in "suggestedReplies" that the student could use next to answer your question or continue the conversation!
     - Include diverse angles:
       * "agree": enthusiastic agreement / affirmation
       * "alternative": polite alternative preference or contrasting view
       * "ask_back": asking you (the tutor) a question in return
       * "detail": sharing a personal detail or habit
       * "quick": a concise, natural everyday reaction
       * "general": expressing curiosity or asking for your recommendation

Respond in strictly valid JSON format:
{
  "hasError": boolean,
  "corrected": "corrected sentence in ${targetLangName} or empty string",
  "explanationPt": "Explicação amigável e direta em português em exatamente 1 linha (ou vazio se perfeito)",
  "replyText": "${activeTutor.name}'s lively conversational response in ${targetLangName}",
  "phonetic": "Friendly phonetic pronunciation transcription in Portuguese syllables",
  "translationPt": "Tradução natural da resposta do tutor para o português brasileiro",
  "userPhonetic": "Friendly phonetic transcription in Portuguese syllables for the user's sentence",
  "userTranslationPt": "Tradução da frase do usuário para o português brasileiro",
  "suggestedReplies": [
    {
      "category": "agree",
      "label": "👍 Concordar",
      "text": "Full sentence in ${targetLangName}",
      "phonetic": "[ Fonética amigável em sílabas ]",
      "translationPt": "Tradução em português"
    }
  ]
}`;

      const historyFormatted = history
        .slice(-6)
        .map((m) => `${m.sender === "user" ? "User" : activeTutor.name}: ${m.text}`)
        .join("\n");

      const prompt = `Recent Conversation:\n${historyFormatted}\n\nUser said: "${userInput}"\n\nGenerate ${activeTutor.name}'s interactive response with 5-6 suggested replies:`;
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
        `That's wonderful! Tell me more about that, my friend.`;
      const phonetic = parsed.phonetic || generatePhoneticGuide(replyText, activeTutor.language);
      const translationPt = parsed.translationPt || "Isso é ótimo! Me conte mais sobre isso, meu amigo.";

      const userPhonetic =
        parsed.userPhonetic || generatePhoneticGuide(userInput, activeTutor.language);
      const userTranslationPt =
        parsed.userTranslationPt || getPortugueseTranslation(userInput, activeTutor.language);

      const rawSuggestions = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
      const suggestedReplies: ContextualSuggestion[] = rawSuggestions.length >= 3
        ? rawSuggestions.map((s: any) => ({
            category: s.category || "general",
            label: s.label || "💬 Sugestão",
            text: s.text || "",
            phonetic: s.phonetic || generatePhoneticGuide(s.text || "", activeTutor.language),
            translationPt: s.translationPt || getPortugueseTranslation(s.text || "", activeTutor.language),
          }))
        : getDynamicSuggestions(activeTutor.language, userInput, activeTutor);

      return {
        replyText,
        phonetic,
        translationPt,
        correction,
        userPhonetic,
        userTranslationPt,
        suggestedReplies,
      };
    } catch (e) {
      console.warn("Falha no Gemini, utilizando motor inteligente local:", e);
    }
  }

  // Motor Inteligente Local (Offline / Sem API Key) com detecção semântica contextual por idioma
  const localCorrection = checkGrammarLocal(userInput);
  const lower = userInput.toLowerCase().trim();
  const historyLen = history.length;

  let replyText = "";
  let translationPt = "";

  // ================= 🇩🇪 ALEMÃO =================
  if (activeTutor.language === "de") {
    if (
      lower.includes("verbessern") ||
      lower.includes("deutsch") ||
      lower.includes("lernen") ||
      lower.includes("üben") ||
      lower.includes("sprache") ||
      lower.includes("aprender") ||
      lower.includes("estudar")
    ) {
      replyText = `Das ist ein großartiges Ziel! Regelmäßiges Üben jeden Tag macht einen riesigen Unterschied. Worauf möchtest du dich heute konzentrieren: auf neue Wörter oder freies Sprechen?`;
      translationPt = `Esse é um grande objetivo! Praticar com regularidade todos os dias faz uma enorme diferença. No que você gostaria de focar hoje: palavras novas ou fala livre?`;
    } else if (
      lower.includes("mein tag") ||
      lower.includes("beschäftigt") ||
      lower.includes("müde") ||
      lower.includes("anstrengend") ||
      lower.includes("arbeit") ||
      lower.includes("feierabend")
    ) {
      replyText = `Ein intensiver Tag! Dann lass uns jetzt ganz entspannt plaudern und den Tag ausklingen lassen. Was war heute dein schönster Moment?`;
      translationPt = `Um dia intenso! Então vamos bater um papo bem relaxado agora para encerrar o dia. Qual foi o seu momento mais agradável hoje?`;
    } else if (
      lower.includes("kaffee") ||
      lower.includes("milch") ||
      lower.includes("brezel") ||
      lower.includes("bestellen") ||
      lower.includes("essen") ||
      lower.includes("trinken") ||
      lower.includes("croissant")
    ) {
      replyText = `Ein frischer Kaffee mit Milch und eine knusprige Brezel sind einfach unschlagbar! Trinkst du deinen Kaffee lieber morgens oder am Nachmittag?`;
      translationPt = `Um café fresco com leite e um pretzel crocante são simplesmente imbatíveis! Você prefere tomar seu café de manhã ou à tarde?`;
    } else if (
      lower.includes("freut mich") ||
      lower.includes("kennenzulernen") ||
      lower.includes("ich heiße") ||
      lower.includes("mein name")
    ) {
      replyText = `Die Freude ist ganz meinerseits! Ich bin ${activeTutor.name} aus ${activeTutor.city} und begleite dich Schritt für Schritt. Worüber möchtest du sprechen?`;
      translationPt = `O prazer é todo meu! Eu sou o ${activeTutor.name} de ${activeTutor.city} e vou te guiar passo a passo. Sobre o que você gostaria de conversar?`;
    } else if (
      lower.includes("wie geht") ||
      lower.includes("alles gut") ||
      lower.includes("wie steht")
    ) {
      replyText = `Mir geht es blendend, danke der Nachfrage! Ich freue mich sehr darauf, mit dir Deutsch zu üben. Und wie fühlst du dich heute?`;
      translationPt = `Estou ótimo, obrigado por perguntar! Fico muito feliz em praticar alemão com você. E como você está se sentindo hoje?`;
    } else if (
      lower.includes("woher") ||
      lower.includes("stadt") ||
      lower.includes("berlin") ||
      lower.includes("münchen") ||
      lower.includes("deutschland")
    ) {
      replyText = `Ich lebe in ${activeTutor.city}, einer wunderbaren Stadt voller Kultur und Charme! Warst du schon einmal hier oder möchtest du bald reisen?`;
      translationPt = `Eu moro em ${activeTutor.city}, uma cidade maravilhosa cheia de cultura e charme! Você já esteve aqui ou gostaria de viajar em breve?`;
    } else if (lower.includes("danke") || lower.includes("vielen dank")) {
      replyText = `Sehr gerne, mein Freund! Genau dafür bin ich da. Was möchtest du als Nächstes ausprobieren?`;
      translationPt = `De nada, meu amigo! É exatamente para isso que estou aqui. O que você gostaria de experimentar a seguir?`;
    } else if (/^\s*(hallo|hi|hey|guten tag|guten morgen|guten abend)[!.,]?\s*$/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `Hallo! Herzlich willkommen! Ich bin ${activeTutor.name}. Wie geht es dir heute?`;
        translationPt = `Olá! Boas-vindas! Eu sou o ${activeTutor.name}. Como você está hoje?`;
      } else {
        replyText = `Hallo nochmals! Schön, dass wir im Gespräch sind. Woran denkst du gerade?`;
        translationPt = `Olá novamente! Que bom continuarmos conversando. No que você está pensando agora?`;
      }
    } else {
      const deResponses = [
        {
          de: `Das ist wirklich sehr interessant! Erzähl mir gern noch ein bisschen mehr darüber auf Deutsch.`,
          pt: `Isso é realmente muito interessante! Fique à vontade para me contar um pouco mais sobre isso em alemão.`,
        },
        {
          de: `Du drückst dich schon richtig gut aus! Was ist deine Meinung dazu?`,
          pt: `Você já está se expressando muito bem! Qual é a sua opinião sobre isso?`,
        },
        {
          de: `Schritt für Schritt wird dein Deutsch immer sicherer. Wie siehst du das persönlich?`,
          pt: `Passo a passo o seu alemão está ficando cada vez mais seguro. Como você vê isso pessoalmente?`,
        },
      ];
      const picked = deResponses[Math.floor(Math.random() * deResponses.length)]!;
      replyText = picked.de;
      translationPt = picked.pt;
    }
  }

  // ================= 🇪🇸 ESPANHOL =================
  else if (activeTutor.language === "es") {
    if (
      lower.includes("aprender") ||
      lower.includes("español") ||
      lower.includes("mejorar") ||
      lower.includes("estudiar") ||
      lower.includes("practicar")
    ) {
      replyText = `¡Es un objetivo fantástico! Practicar español con constancia abre muchísimas puertas. ¿Qué parte te parece más interesante: hablar con soltura o ampliar vocabulario?`;
      translationPt = `É um objetivo fantástico! Praticar espanhol com constância abre muitas portas. Qual parte você acha mais interessante: falar com naturalidade ou ampliar o vocabulário?`;
    } else if (lower.includes("mi día") || lower.includes("cansado") || lower.includes("ocupado") || lower.includes("trabajo")) {
      replyText = `¡Un día muy productivo! Ahora tómate este momento para relajarte y disfrutar del español. ¿Qué fue lo más destacado de tu jornada?`;
      translationPt = `Um dia muito produtivo! Agora aproveite este momento para relaxar e curtir o espanhol. O que foi o ponto alto do seu dia?`;
    } else if (lower.includes("café") || lower.includes("tapas") || lower.includes("churros") || lower.includes("pedir")) {
      replyText = `¡Un café con leche templada y unas tapas siempre alegran el día! ¿Te gusta más el ambiente de las terrazas o el interior de los bares?`;
      translationPt = `Um café com leite morno e umas tapas sempre alegram o dia! Você gosta mais do ambiente das mesas na calçada ou do interior dos bares?`;
    } else if (lower.includes("mucho gusto") || lower.includes("encantado") || lower.includes("me llamo") || lower.includes("mi nombre")) {
      replyText = `¡El gusto es todo mío! Me llamo ${activeTutor.name}, de ${activeTutor.city}. Vamos a avanzar juntos sin miedo a equivocarte. ¿De qué te apetece hablar hoy?`;
      translationPt = `O prazer é todo meu! Meu nome é ${activeTutor.name}, de ${activeTutor.city}. Vamos avançar juntos sem medo de errar. Sobre o que você tem vontade de falar hoje?`;
    } else if (lower.includes("como estas") || lower.includes("cómo estás") || lower.includes("qué tal")) {
      replyText = `¡Estoy fenomenal, gracias por preguntar! Con toda la energía para charlar contigo. ¿Y tú, cómo te encuentras hoy?`;
      translationPt = `Estou fenomenal, obrigado por perguntar! Com toda a energia para conversar com você. E você, como está hoje?`;
    } else if (/^\s*(hola|buenos días|buenas tardes|buenas)\b/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `¡Hola! Me alegra muchísimo hablar contigo hoy. ¿Cómo te encuentras?`;
        translationPt = `Olá! Fico muito feliz em falar com você hoje. Como você está?`;
      } else {
        replyText = `¡Hola de nuevo! Qué bueno seguir charlando. ¿En qué estás pensando?`;
        translationPt = `Olá de novo! Que bom continuarmos conversando. No que você está pensando?`;
      }
    } else {
      replyText = `¡Eso suena muy interesante! Cuéntame un poco más sobre eso, amigo.`;
      translationPt = `Isso parece muito interessante! Me conte um pouco mais sobre isso, amigo.`;
    }
  }

  // ================= 🇮🇹 ITALIANO =================
  else if (activeTutor.language === "it") {
    if (lower.includes("imparare") || lower.includes("italiano") || lower.includes("migliorare") || lower.includes("studiare")) {
      replyText = `È un obiettivo meraviglioso! L'italiano è una lingua musicale e passionale. Cosa ti affascina di più: la cultura, i viaggi o la conversazione quotidiana?`;
      translationPt = `É um objetivo maravilhoso! O italiano é uma língua musical e apaixonante. O que mais te fascina: a cultura, viagens ou a conversa do dia a dia?`;
    } else if (lower.includes("caffè") || lower.includes("cappuccino") || lower.includes("mangiare") || lower.includes("pizza") || lower.includes("pasta")) {
      replyText = `Un buon caffè espresso al banco è il vero rito italiano! Lo preferisci amaro, macchiato o con un cornetto caldo?`;
      translationPt = `Um bom café espresso no balcão é o verdadeiro ritual italiano! Você prefere puro, com pingo de leite ou com um cornetto quentinho?`;
    } else if (lower.includes("piacere") || lower.includes("mi chiamo") || lower.includes("il mio nome")) {
      replyText = `Piacere mio! Sono ${activeTutor.name} da ${activeTutor.city}. Sarà una bellissima avventura linguistica. Di cosa ti va di parlare oggi?`;
      translationPt = `Prazer meu! Eu sou o(a) ${activeTutor.name} de ${activeTutor.city}. Será uma linda aventura linguística. Sobre o que você gostaria de falar hoje?`;
    } else if (lower.includes("come stai") || lower.includes("tutto bene")) {
      replyText = `Sto benissimo, grazie di cuore! Sempre pronto a fare due chiacchiere in italiano con te. E a te, com'è andata la giornata?`;
      translationPt = `Estou muito bem, de coração obrigado! Sempre pronto para bater um papo em italiano com você. E você, como foi seu dia?`;
    } else if (/^\s*(ciao|buongiorno|buonasera|salve)\b/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `Ciao! Che grandissimo piacere parlare con te. Come sta andando la tua giornata?`;
        translationPt = `Olá! Que enorme prazer falar com você. Como está indo o seu dia?`;
      } else {
        replyText = `Ciao di nuovo! Che bello continuare la nostra conversazione. A cosa stai pensando?`;
        translationPt = `Olá novamente! Que bom continuar nossa conversa. No que você está pensando?`;
      }
    } else {
      replyText = `È davvero molto interessante! Raccontami qualcosa in più su questo.`;
      translationPt = `É realmente muito interessante! Me conte algo mais a respeito disso.`;
    }
  }

  // ================= 🇫🇷 FRANCÊS =================
  else if (activeTutor.language === "fr") {
    if (lower.includes("apprendre") || lower.includes("français") || lower.includes("améliorer") || lower.includes("pratiquer")) {
      replyText = `C'est un magnifique projet ! La langue française est d'une grande élégance. Quel domaine vous attire le plus : la conversation de tous les jours, les voyages ou la culture ?`;
      translationPt = `É um projeto magnífico! A língua francesa é de grande elegância. Qual área mais te atrai: conversa cotidiana, viagens ou cultura?`;
    } else if (lower.includes("café") || lower.includes("croissant") || lower.includes("baguette") || lower.includes("boulangerie")) {
      replyText = `Ah, un café avec un croissant croustillant dans une terrasse parisienne ! C'est l'art de vivre à la française. Vous le prenez plutôt le matin ou l'après-midi ?`;
      translationPt = `Ah, um café com um croissant crocante numa mesa de calçada parisiense! É a arte de viver francesa. Você prefere de manhã ou à tarde?`;
    } else if (lower.includes("enchanté") || lower.includes("je m'appelle") || lower.includes("mon nom")) {
      replyText = `Enchanté ! Je suis ${activeTutor.name} de ${activeTutor.city}. C'est un réel plaisir de vous accompagner. De quoi aimeriez-vous parler aujourd'hui ?`;
      translationPt = `Muito prazer! Eu sou o(a) ${activeTutor.name} de ${activeTutor.city}. É um verdadeiro prazer te acompanhar. Sobre o que gostaria de conversar hoje?`;
    } else if (lower.includes("comment allez-vous") || lower.includes("ça va")) {
      replyText = `Je vais merveilleusement bien, merci de demander ! Je suis ravi d'échanger avec vous. Et vous, comment vous sentez-vous aujourd'hui ?`;
      translationPt = `Vou maravilhosamente bem, obrigado por perguntar! Estou encantado em conversar com você. E você, como se sente hoje?`;
    } else if (/^\s*(bonjour|salut|coucou|bonsoir)\b/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `Bonjour ! Quel grand plaisir d'échanger avec vous. Comment allez-vous aujourd'hui ?`;
        translationPt = `Bom dia! Que grande prazer conversar com você. Como vai você hoje?`;
      } else {
        replyText = `Rebonjour ! C'est un plaisir de poursuivre notre échange. À quoi pensez-vous en ce moment ?`;
        translationPt = `Olá de novo! É um prazer continuar nossa conversa. No que você está pensando no momento?`;
      }
    } else {
      replyText = `C'est vraiment très intéressant ! Racontez-moi un peu plus à ce sujet.`;
      translationPt = `Isso é realmente muito interessante! Me conte um pouco mais a esse respeito.`;
    }
  }

  // ================= 🇯🇵 JAPONÊS =================
  else if (activeTutor.language === "ja") {
    if (lower.includes("renshuu") || lower.includes("nihongo") || lower.includes("benkyou") || lower.includes("aprender")) {
      replyText = `Totemo subarashii mokuhyou desu ne! Mainichi sukoshizutsu hanashimashou. Donna koto ni kyoumi ga arimasu ka?`;
      translationPt = `Um objetivo maravilhoso! Vamos falar um pouco todos os dias. Em que tipo de assunto você tem interesse?`;
    } else if (lower.includes("hajimemashite") || lower.includes("namae")) {
      replyText = `Hajimemashite! ${activeTutor.name} desu. Douzo yoroshiku onegaishimasu! Issho ni tanoshiku Nihongo o manabimashou.`;
      translationPt = `Muito prazer! Eu sou ${activeTutor.name}. Encantado em conhecê-lo! Vamos aprender japonês juntos de forma divertida.`;
    } else if (/^\s*(konnichiwa|ohayou|konbanwa)\b/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `Konnichiwa! Issho ni Nihongo o renshuu shimashou. Kyou wa donna hi deshita ka?`;
        translationPt = `Olá! Vamos praticar japonês juntos. Como foi o seu dia hoje?`;
      } else {
        replyText = `Konnichiwa! Motto hanashimashou. Ima nani o kangaete imasu ka?`;
        translationPt = `Olá de novo! Vamos conversar mais. No que você está pensando agora?`;
      }
    } else {
      replyText = `Sore wa totemo omoshiroi desu ne! Motto oshiete kudasai.`;
      translationPt = `Isso é muito interessante! Por favor, me conte mais sobre isso.`;
    }
  }

  // ================= 🇬🇷 GREGO KOINÉ =================
  else if (activeTutor.language === "el-koine") {
    if (lower.includes("mathein") || lower.includes("koine") || lower.includes("logos") || lower.includes("aprender")) {
      replyText = `Makários ho zeton ten sophian! Anaginóskomen kai manthánomen toùs theíous lógous.`;
      translationPt = `Bem-aventurado o que busca a sabedoria! Lemos e aprendemos as santas palavras.`;
    } else if (/^\s*(chaire|chairete|eirene)\b/i.test(lower)) {
      replyText = `Cháirete! Cháris hymîn kaì eirênê apò Theou. Tí theleis matheîn sêmeron?`;
      translationPt = `Alegrai-vos! Graça e paz a vós da parte de Deus. O que desejas aprender hoje?`;
    } else {
      replyText = `Kálon kaì thaumastón estin! Anaginóskomen tàs graphás met' eunoías.`;
      translationPt = `Isso é belo e maravilhoso! Lemos os textos com dedicação e bom ânimo.`;
    }
  }

  // ================= 🇺🇸 INGLÊS =================
  else {
    if (
      lower.includes("improve") ||
      lower.includes("learn") ||
      lower.includes("english") ||
      lower.includes("speaking") ||
      lower.includes("pronunciation") ||
      lower.includes("aprender")
    ) {
      replyText = `That is an awesome goal! Consistency is everything in language learning: just 10 minutes a day makes a huge difference. Which skill do you want to conquer first: speaking freely or expanding your vocabulary?`;
      translationPt = `Esse é um objetivo incrível! A consistência é tudo no aprendizado de idiomas: apenas 10 minutos por dia fazem uma diferença enorme. Qual habilidade você quer conquistar primeiro: falar livremente ou expandir seu vocabulário?`;
    } else if (
      lower.includes("my day") ||
      lower.includes("busy") ||
      lower.includes("tired") ||
      lower.includes("exhausted") ||
      lower.includes("work")
    ) {
      replyText = `Sounds like quite a packed day! Take a deep breath — our chat is a safe space to unwind and practice. What was the most memorable part of your day?`;
      translationPt = `Parece que foi um dia bem cheio! Respire fundo — nossa conversa é um espaço seguro para relaxar e praticar. Qual foi a parte mais memorável do seu dia?`;
    } else if (
      lower.includes("coffee") ||
      lower.includes("latte") ||
      lower.includes("tea") ||
      lower.includes("breakfast")
    ) {
      replyText = `A hot coffee is always the right choice! How do you take yours: black, or with a splash of oat milk and sugar?`;
      translationPt = `Um café quente é sempre a escolha certa! Como você prefere o seu: puro, ou com um pouco de leite de aveia e açúcar?`;
    } else if (
      lower.includes("nice to meet") ||
      lower.includes("pleasure to meet") ||
      lower.includes("my name is") ||
      lower.includes("i am") ||
      lower.includes("i'm")
    ) {
      replyText = `The pleasure is all mine! I'm ${activeTutor.name} from ${activeTutor.city}. We're going to take this step by step with zero judgment. What would you love to talk about today?`;
      translationPt = `O prazer é todo meu! Eu sou ${activeTutor.name} de ${activeTutor.city}. Vamos passo a passo sem julgamentos. Sobre o que você adoraria conversar hoje?`;
    } else if (lower.includes("how are you") || lower.includes("how's it going")) {
      replyText = `I'm doing fantastic, thanks for asking! Ready and pumped to practice real-world communication with you. How are you feeling right now?`;
      translationPt = `Estou fantástico, obrigado por perguntar! Pronto e super animado para praticar conversas da vida real com você. Como você está se sentindo agora?`;
    } else if (lower.includes("where are you from") || lower.includes("city")) {
      replyText = `I'm from ${activeTutor.city}, ${activeTutor.country}! A vibrant city with incredible culture. Have you ever visited, or do you plan to travel here?`;
      translationPt = `Eu sou de ${activeTutor.city}, ${activeTutor.country}! Uma cidade vibrante com uma cultura incrível. Você já visitou, ou planeja viajar para cá?`;
    } else if (/^\s*(hello|hi|hey|good morning|good evening)\b/i.test(lower)) {
      if (historyLen <= 1) {
        replyText = `Hey there! Great to talk to you. How's your day treating you so far?`;
        translationPt = `E aí! Muito bom falar com você. Como está sendo o seu dia até agora?`;
      } else {
        replyText = `Hey again! Glad we're keeping the conversation going. What's on your mind?`;
        translationPt = `Olá de novo! Fico feliz que estamos continuando nossa conversa. No que você está pensando?`;
      }
    } else {
      const generalReplies = [
        {
          en: `That sounds really interesting! Could you tell me a little bit more about that?`,
          pt: `Isso parece muito interessante! Você poderia me contar um pouco mais sobre isso?`,
        },
        {
          en: `You expressed that clearly! What made you think of that today?`,
          pt: `Você expressou isso claramente! O que fez você pensar nisso hoje?`,
        },
        {
          en: `Step by step your confidence is growing. How do you feel about that?`,
          pt: `Passo a passo sua confiança está crescendo. Como você se sente sobre isso?`,
        },
      ];
      const picked = generalReplies[Math.floor(Math.random() * generalReplies.length)]!;
      replyText = picked.en;
      translationPt = picked.pt;
    }
  }

  const phonetic = generatePhoneticGuide(replyText, activeTutor.language);
  const userPhonetic = generatePhoneticGuide(userInput, activeTutor.language);
  const userTranslationPt = getPortugueseTranslation(userInput, activeTutor.language);
  const suggestedReplies = getDynamicSuggestions(activeTutor.language, userInput, activeTutor);

  return {
    replyText,
    phonetic,
    translationPt,
    correction: localCorrection.hasError ? localCorrection : undefined,
    userPhonetic,
    userTranslationPt,
    suggestedReplies,
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

export function generatePhoneticGuide(
  text: string,
  language: SupportedLanguage = "en"
): string {
  if (language === "de") {
    const deWords = text.replace(/[.,!?;:"'«»]/g, "").split(/\s+/);
    return deWords
      .map((w) => {
        const lower = w.toLowerCase();
        const deMap: Record<string, string> = {
          hallo: "rá-lo",
          wie: "vi",
          geht: "guêt",
          es: "es",
          dir: "dír",
          ihnen: "í-nen",
          heute: "rói-te",
          ich: "ikh",
          bin: "bin",
          schön: "chên",
          dich: "dikh",
          sie: "zí",
          kennenzulernen: "kên-nen-tsu-lêr-nen",
          möchte: "mêkh-te",
          mein: "máin",
          deutsch: "dóitsh",
          jeden: "iê-den",
          tag: "ták",
          verbessern: "fer-bé-sern",
          bitte: "bí-te",
          kaffee: "ca-fê",
          mit: "mit",
          milch: "mílkh",
          bestellen: "be-chtê-len",
          brezel: "bré-tsel",
          danke: "dán-ke",
          sehr: "zêr",
          gut: "gut",
          super: "zú-per",
          herzlich: "rêrts-likh",
          willkommen: "vil-kó-men",
          was: "vas",
          machst: "makhst",
          du: "du",
          woher: "vo-rêr",
          kommst: "komst",
          aus: "áus",
          stadt: "chtát",
          großartig: "grôss-ár-tikh",
          ziel: "tsíl",
          wunderbar: "vún-der-bar",
          freut: "fróit",
          mich: "mikh",
        };
        if (deMap[lower]) return deMap[lower];

        return lower
          .replace(/^h/g, "r")
          .replace(/sch/g, "ch")
          .replace(/^sp/g, "chp")
          .replace(/^st/g, "cht")
          .replace(/ch/g, "kh")
          .replace(/ei/g, "ái")
          .replace(/ie/g, "í")
          .replace(/eu|äu/g, "ói")
          .replace(/ä/g, "é")
          .replace(/ö/g, "ê")
          .replace(/ü/g, "ü")
          .replace(/ß/g, "ss")
          .replace(/w/g, "v")
          .replace(/^v/g, "f")
          .replace(/z/g, "ts")
          .replace(/^j/g, "i");
      })
      .join(" ");
  }

  if (language === "es") {
    return text
      .toLowerCase()
      .replace(/ll/g, "y")
      .replace(/ñ/g, "nh")
      .replace(/j/g, "r")
      .replace(/ge/g, "re")
      .replace(/gi/g, "ri")
      .replace(/z/g, "s")
      .replace(/ce/g, "se")
      .replace(/ci/g, "si")
      .replace(/v/g, "b");
  }

  if (language === "it") {
    return text
      .toLowerCase()
      .replace(/che/g, "que")
      .replace(/chi/g, "qui")
      .replace(/ce/g, "tche")
      .replace(/ci/g, "tchi")
      .replace(/ge/g, "dje")
      .replace(/gi/g, "dji")
      .replace(/gli/g, "lhi")
      .replace(/gn/g, "nh");
  }

  if (language === "fr") {
    return text
      .toLowerCase()
      .replace(/ou/g, "u")
      .replace(/oi/g, "uá")
      .replace(/eau|au/g, "ô")
      .replace(/ai|ei/g, "ê")
      .replace(/ch/g, "ch")
      .replace(/qu/g, "k");
  }

  const words = text.replace(/[.,!?;:"]/g, "").split(/\s+/);
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

export function getPortugueseTranslation(
  text: string,
  language: SupportedLanguage = "en"
): string {
  const lower = text.toLowerCase().trim();

  // Alemão
  if (language === "de" || lower.includes("deutsch") || lower.includes("hallo! ich bin max") || lower.includes("hannah")) {
    if (lower.includes("großartiges ziel") || lower.includes("ziel")) {
      return "Esse é um grande objetivo! Praticar com regularidade todos os dias faz uma enorme diferença. No que você gostaria de focar hoje: palavras novas ou fala livre?";
    }
    if (lower.includes("intensiver tag") || lower.includes("arbeit")) {
      return "Um dia intenso! Então vamos bater um papo bem relaxado agora para encerrar o dia. Qual foi o seu momento mais agradável hoje?";
    }
    if (lower.includes("frischer kaffee") || lower.includes("brezel")) {
      return "Um café fresco com leite e um pretzel crocante são simplesmente imbatíveis! Você prefere tomar seu café de manhã ou à tarde?";
    }
    if (lower.includes("freude ist ganz meinerseits")) {
      return "O prazer é todo meu! Eu sou o seu tutor e vou te guiar passo a passo. Sobre o que você gostaria de conversar?";
    }
    if (lower.includes("mir geht es blendend")) {
      return "Estou ótimo, obrigado por perguntar! Fico muito feliz em praticar alemão com você. E como você está se sentindo hoje?";
    }
    if (lower.includes("ich lebe in")) {
      return "Eu moro numa cidade maravilhosa cheia de cultura e charme! Você já esteve aqui na Alemanha ou gostaria de viajar em breve?";
    }
    if (lower.includes("sehr gerne, mein freund")) {
      return "De nada, meu amigo! É exatamente para isso que estou aqui. O que você gostaria de experimentar a seguir?";
    }
    if (lower.includes("herzlich willkommen") || lower.includes("schön, dich")) {
      return "Olá! Boas-vindas. Muito bom te conhecer! Como vai você hoje?";
    }
    return "Resposta de conversação do seu tutor em alemão.";
  }

  // Espanhol
  if (language === "es" || lower.includes("español")) {
    if (lower.includes("objetivo fantástico")) {
      return "É um objetivo fantástico! Praticar espanhol com constância abre muitas portas. Qual parte você acha mais interessante: falar com naturalidade ou ampliar o vocabulário?";
    }
    if (lower.includes("café con leche")) {
      return "Um café com leite morno e umas tapas sempre alegram o dia! Você gosta mais do ambiente das mesas na calçada ou do interior dos bares?";
    }
    if (lower.includes("gusto es todo mío")) {
      return "O prazer é todo meu! Vamos avançar juntos sem medo de errar. Sobre o que você tem vontade de falar hoje?";
    }
    return "Resposta de conversação do seu tutor em espanhol.";
  }

  // Saudações iniciais dos tutores em inglês
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
    return "Estou me sentindo fantástico! Pronto para praticar conversas da vida real com você. O que você está fazendo hoje?";
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
  if (lower.includes("sounds very interesting") || lower.includes("sounds really interesting")) {
    return "Isso parece muito interessante! Você poderia me contar um pouco mais sobre isso?";
  }
  if (lower.includes("completely understand what you mean")) {
    return "Eu entendo perfeitamente o que você quer dizer. Como isso costuma funcionar para você?";
  }
  if (lower.includes("expressed that very nicely") || lower.includes("expressed that clearly")) {
    return "Você expressou isso muito bem! O que fez você pensar nisso hoje?";
  }
  if (lower.includes("sounding clearer and clearer") || lower.includes("confidence is growing")) {
    return "Passo a passo você está soando cada vez mais claro e seguro. Como você se sente sobre isso?";
  }

  return "Resposta do tutor acompanhando nosso diálogo.";
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

// 3. CARTÕES: Geração temática de vocabulário multilíngue
export async function generateFlashcards(
  themeInput: string,
  apiKey?: string,
  language: SupportedLanguage = "en"
): Promise<Flashcard[]> {
  const langThemes = getPresetThemesForLanguage(language);
  const normalized = themeInput.toLowerCase().trim();

  // Verifica temas pré-definidos para o idioma
  for (const key of Object.keys(langThemes)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return langThemes[key]!;
    }
  }

  const langNames: Record<string, string> = {
    en: "English",
    de: "German (Deutsch)",
    es: "Spanish (Español)",
    it: "Italian (Italiano)",
    fr: "French (Français)",
    ja: "Japanese (日本語 with Romaji)",
    "el-koine": "Biblical Koine Greek (with transliteration)",
  };
  const targetLangName = langNames[language] || "English";

  if (apiKey) {
    try {
      const prompt = `Generate 5 high-quality ${targetLangName} vocabulary flashcards for the theme: "${themeInput}".
Return ONLY a valid JSON array of objects with this structure:
[
  {
    "word": "Word or expression in ${targetLangName}",
    "phonetic": "Accurate phonetic pronunciation transcribed into Brazilian Portuguese syllables, e.g. [ vil-kó-men ] or [ kon-ni-tchi-ua ]",
    "translation": "Tradução em Português",
    "exampleSentence": "A natural sentence in ${targetLangName} using the word",
    "exampleTranslation": "Tradução da frase em português"
  }
]`;
      const responseRaw = await callGeminiRaw(apiKey, prompt);
      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const items = JSON.parse(cleaned);

      if (Array.isArray(items) && items.length > 0) {
        return items.map((item, idx) => ({
          id: `custom-${language}-${Date.now()}-${idx}`,
          theme: themeInput,
          word: item.word || "Vocábulo",
          phonetic: item.phonetic || generatePhoneticGuide(item.word || "", language),
          translation: item.translation || "Palavra",
          exampleSentence: item.exampleSentence || item.word,
          exampleTranslation: item.exampleTranslation || "Exemplo de uso no idioma.",
        }));
      }
    } catch (e) {
      console.warn("Falha ao gerar cartões com Gemini, usando gerador contextual:", e);
    }
  }

  // Gerador dinâmico de cartões temáticos offline contextualizado por idioma
  if (language === "de") {
    return [
      {
        id: `gen-de-${Date.now()}-1`,
        theme: themeInput,
        word: `Das Konzept von ${themeInput}`,
        phonetic: "[ das con-tsêpt fon ... ]",
        translation: `O conceito de ${themeInput}`,
        exampleSentence: `Das Verständnis dieses Themas ist sehr nützlich für ${themeInput}.`,
        exampleTranslation: `A compreensão deste tema é muito útil para ${themeInput}.`,
      },
      {
        id: `gen-de-${Date.now()}-2`,
        theme: themeInput,
        word: "Der Fortschritt",
        phonetic: "[ dêr fórt-chrit ]",
        translation: "Progresso / Evolução",
        exampleSentence: "Wir sehen täglich großen Fortschritt im Deutschen.",
        exampleTranslation: "Vemos diariamente um grande progresso no alemão.",
      },
      {
        id: `gen-de-${Date.now()}-3`,
        theme: themeInput,
        word: "Die tägliche Übung",
        phonetic: "[ di têk-li-khe ü-bung ]",
        translation: "Prática diária",
        exampleSentence: "Tägliche Übung ist der Schlüssel zum Erfolg.",
        exampleTranslation: "A prática diária é a chave para o sucesso.",
      },
      {
        id: `gen-de-${Date.now()}-4`,
        theme: themeInput,
        word: "Ziele erreichen",
        phonetic: "[ tsí-le er-rái-khen ]",
        translation: "Alcançar objetivos",
        exampleSentence: "Mit Smart Language erreichst du deine sprachlichen Ziele.",
        exampleTranslation: "Com o Smart Language você alcança seus objetivos linguísticos.",
      },
    ];
  }

  if (language === "es") {
    return [
      {
        id: `gen-es-${Date.now()}-1`,
        theme: themeInput,
        word: `El concepto de ${themeInput}`,
        phonetic: "[ el con-sêp-to de ... ]",
        translation: `O conceito de ${themeInput}`,
        exampleSentence: `Entender este concepto es clave para dominar ${themeInput}.`,
        exampleTranslation: `Entender este conceito é fundamental para dominar ${themeInput}.`,
      },
      {
        id: `gen-es-${Date.now()}-2`,
        theme: themeInput,
        word: "El progreso",
        phonetic: "[ el pro-grê-so ]",
        translation: "Progresso",
        exampleSentence: "Notamos un progreso constante en tus conversaciones.",
        exampleTranslation: "Notamos um progresso constante nas suas conversas.",
      },
      {
        id: `gen-es-${Date.now()}-3`,
        theme: themeInput,
        word: "La práctica diaria",
        phonetic: "[ la prác-ti-ca diá-ria ]",
        translation: "Prática diária",
        exampleSentence: "La práctica diaria te da total soltura.",
        exampleTranslation: "A prática diária te dá total naturalidade.",
      },
      {
        id: `gen-es-${Date.now()}-4`,
        theme: themeInput,
        word: "Alcanzar metas",
        phonetic: "[ al-can-sár mê-tas ]",
        translation: "Alcançar metas",
        exampleSentence: "Con Smart Language alcanzarás tus metas rápidamente.",
        exampleTranslation: "Com o Smart Language você alcançará suas metas rapidamente.",
      },
    ];
  }

  return [
    {
      id: `gen-${Date.now()}-1`,
      theme: themeInput,
      word: `Key concept of ${themeInput}`,
      phonetic: "[ ki cón-sept ]",
      translation: `Conceito-chave de ${themeInput}`,
      exampleSentence: `Understanding this is essential when discussing ${themeInput}.`,
      exampleTranslation: `Compreender isso é essencial ao discutir sobre ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-2`,
      theme: themeInput,
      word: "Improvement",
      phonetic: "[ im-prúv-ment ]",
      translation: "Melhoria / Progresso",
      exampleSentence: `We are seeing great improvement in our ${themeInput} skills.`,
      exampleTranslation: `Estamos vendo uma grande melhoria em nossas habilidades em ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-3`,
      theme: themeInput,
      word: "Daily practice",
      phonetic: "[ dêi-li prác-tis ]",
      translation: "Prática diária",
      exampleSentence: `Consistent daily practice is the secret to mastering ${themeInput}.`,
      exampleTranslation: `A prática diária consistente é o segredo para dominar ${themeInput}.`,
    },
    {
      id: `gen-${Date.now()}-4`,
      theme: themeInput,
      word: "Achieve goals",
      phonetic: "[ a-tchív gouls ]",
      translation: "Alcançar metas / objetivos",
      exampleSentence: `With Smart Language, you will achieve your goals in no time.`,
      exampleTranslation: `Com o Smart Language, você alcançará suas metas rapidamente.`,
    },
  ];
}

// 4. DESTRINCHAR: Analisador morfológico e sintático multilíngue
const POS_LEXICON: Record<
  string,
  { pos: string; badge: string; color: string; trans: string }
> = {
  // --- INGLÊS ---
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
  learning: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprendendo" },
  english: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Inglês" },
  with: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "com" },
  today: { pos: "Advérbio de Tempo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "hoje" },
  daily: { pos: "Advérbio / Adjetivo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "diariamente" },
  the: { pos: "Artigo Definido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "o / a / os / as" },
  a: { pos: "Artigo Indefinido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "um / uma" },
  an: { pos: "Artigo Indefinido", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "um / uma" },
  in: { pos: "Preposição de Lugar/Tempo", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / dentro" },
  to: { pos: "Preposição / Marcador", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "para / a" },
  and: { pos: "Conjunção Aditiva", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "e" },
  very: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  well: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bem" },

  // --- 🇩🇪 ALEMÃO ---
  ich: { pos: "Pronome Pessoal (1ª pess.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Eu" },
  du: { pos: "Pronome Pessoal (2ª pess.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Você (informal)" },
  er: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ele" },
  wir: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Nós" },
  ihr: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Vocês" },
  lerne: { pos: "Verbo no Presente (1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprendo" },
  lernen: { pos: "Verbo no Infinitivo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprender" },
  deutsch: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Alemão" },
  heute: { pos: "Advérbio de Tempo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "hoje" },
  mit: { pos: "Preposição (rege Dativo)", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "com" },
  spricht: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  gut: { pos: "Adjetivo / Advérbio", badge: "Advérbio", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "bem / bom" },
  weil: { pos: "Conjunção Subordinativa", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "porque (verbo vai ao fim)" },
  übt: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "pratica" },
  jeden: { pos: "Adjetivo / Pronome", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "cada / todo" },
  tag: { pos: "Substantivo Masculino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "dia" },
  bitte: { pos: "Expressão de Cortesia", badge: "Cortesia", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "por favor" },
  der: { pos: "Artigo Definido Masculino", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "o" },
  die: { pos: "Artigo Definido Feminino/Plural", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "a / os / as" },
  das: { pos: "Artigo Definido Neutro", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "o / a (neutro)" },
  bahnhof: { pos: "Substantivo Masculino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação de trem" },
  wo: { pos: "Advérbio Interrogativo", badge: "Interrogativo", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", trans: "onde" },
  ist: { pos: "Verbo (sein - 3ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "é / está" },
  sind: { pos: "Verbo (sein - plural)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "são / estão" },

  // --- 🇪🇸 ESPANHOL ---
  estoy: { pos: "Verbo (estar - 1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "estou" },
  aprendiendo: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprendendo" },
  español: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Espanhol" },
  ella: { pos: "Pronome Pessoal", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ela" },
  habla: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  muy: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  bien: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bem" },
  porque: { pos: "Conjunção Causal", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "porque" },
  practica: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "pratica" },
  todos: { pos: "Pronome / Adjetivo", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "todos" },
  los: { pos: "Artigo Definido Plural", badge: "Artigo", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800", trans: "os" },
  días: { pos: "Substantivo Masculino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "dias" },
  dónde: { pos: "Advérbio Interrogativo", badge: "Interrogativo", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", trans: "onde" },
  está: { pos: "Verbo (estar)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "está / fica" },
  estación: { pos: "Substantivo Feminino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação" },
  favor: { pos: "Substantivo / Cortesia", badge: "Cortesia", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "favor" },

  // --- 🇮🇹 ITALIANO ---
  sto: { pos: "Verbo (stare - 1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "estou" },
  imparando: { pos: "Verbo no Gerúndio", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "aprendendo" },
  italiano: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Italiano" },
  parla: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  molto: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  bene: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bem" },
  perché: { pos: "Conjunção Causal", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "porque" },
  ogni: { pos: "Aggettivo Indefinito", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "cada / todo" },
  giorno: { pos: "Sostantivo Maschile", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "dia" },
  stazione: { pos: "Sostantivo Femminile", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação" },

  // --- 🇫🇷 FRANCÊS ---
  japprends: { pos: "Verbo (apprendre - 1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "eu aprendo" },
  français: { pos: "Substantivo Próprio", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "Francês" },
  parle: { pos: "Verbo (3ª pessoa)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  très: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  gare: { pos: "Substantivo Feminino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação ferroviária" },
};

export async function breakdownSentence(
  sentence: string,
  apiKey?: string,
  language: SupportedLanguage = "en"
): Promise<SentenceAnalysis> {
  const clean = sentence.trim();
  const langNames: Record<string, string> = {
    en: "English",
    de: "German (Deutsch)",
    es: "Spanish (Español)",
    it: "Italian (Italiano)",
    fr: "French (Français)",
    ja: "Japanese (日本語)",
    "el-koine": "Biblical Koine Greek",
  };
  const targetLangName = langNames[language] || "English";

  // Se houver chave Gemini, gerar análise detalhada com IA no idioma correto
  if (apiKey) {
    try {
      const prompt = `Break down this sentence in ${targetLangName} word by word: "${clean}".
Return ONLY a valid JSON object with this exact structure:
{
  "tokens": [
    {
      "word": "word",
      "partOfSpeech": "Função gramatical em português (ex: Substantivo, Verbo, Pronome, Preposição, Adjetivo, Advérbio, Artigo)",
      "posBadge": "Nome curto (ex: Verbo, Pronome, Substantivo, Preposição, Adjetivo, Advérbio, Artigo)",
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
          else if (badge.toLowerCase().includes("artigo")) color = "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";

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
          explanation: parsed.explanation || `Estrutura gramatical padrão em ${targetLangName}.`,
        };
      }
    } catch (e) {
      console.warn("Falha no Gemini ao destrinchar, utilizando motor léxico local:", e);
    }
  }

  // Motor Léxico Local Multilíngue
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

    return {
      word: w,
      partOfSpeech: "Vocábulo / Termo",
      posBadge: "Palavra",
      posColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      literalTranslation: `[${w}]`,
    };
  });

  // Tradução natural de frases padrão ou estimativa
  let naturalTranslation = "Tradução compreensiva em português.";
  const lowerSentence = clean.toLowerCase();

  // Alemão
  if (lowerSentence.includes("ich lerne heute deutsch mit smart language")) {
    naturalTranslation = "Estou aprendendo alemão com o Smart Language hoje.";
  } else if (lowerSentence.includes("sie spricht sehr gut, weil sie jeden tag übt")) {
    naturalTranslation = "Ela fala muito bem porque pratica todos os dias.";
  } else if (lowerSentence.includes("könnten sie mir bitte sagen, wo der bahnhof ist")) {
    naturalTranslation = "Você poderia, por favor, me dizer onde fica a estação de trem?";
  } else if (lowerSentence.includes("wir arbeiten seit heute morgen")) {
    naturalTranslation = "Trabalhamos neste novo projeto desde hoje de manhã.";
  } else if (lowerSentence.includes("heißen kaffee mit milch")) {
    naturalTranslation = "Eu gostaria de pedir um café quente com leite, por favor.";
  }
  // Espanhol
  else if (lowerSentence.includes("estoy aprendiendo español")) {
    naturalTranslation = "Estou aprendendo espanhol com o Smart Language hoje.";
  } else if (lowerSentence.includes("ella habla muy bien porque practica")) {
    naturalTranslation = "Ela fala muito bem porque pratica todos os dias.";
  } else if (lowerSentence.includes("dónde está la estación")) {
    naturalTranslation = "Poderia me dizer onde fica a estação de trem, por favor?";
  }
  // Italiano
  else if (lowerSentence.includes("sto imparando l'italiano")) {
    naturalTranslation = "Estou aprendendo italiano com o Smart Language hoje.";
  } else if (lowerSentence.includes("dove si trova la stazione")) {
    naturalTranslation = "Você poderia me dizer onde fica a estação, por favor?";
  }
  // Francês
  else if (lowerSentence.includes("j'apprends le français")) {
    naturalTranslation = "Estou aprendendo francês com o Smart Language hoje.";
  } else if (lowerSentence.includes("où se trouve la gare")) {
    naturalTranslation = "Você poderia me dizer onde fica a estação, por favor?";
  }
  // Inglês
  else if (lowerSentence.includes("i am learning english with smart language today")) {
    naturalTranslation = "Estou aprendendo inglês com o Smart Language hoje.";
  } else if (lowerSentence.includes("she speaks very well because she practices daily")) {
    naturalTranslation = "Ela fala muito bem porque pratica diariamente.";
  } else if (lowerSentence.includes("could you please tell me where the station is")) {
    naturalTranslation = "Você poderia, por favor, me dizer onde fica a estação?";
  } else if (lowerSentence.includes("i would like a cup of hot coffee with milk")) {
    naturalTranslation = "Eu gostaria de uma xícara de café quente com leite.";
  } else {
    naturalTranslation = tokens
      .filter((t) => t.posBadge !== "Sinal")
      .map((t) => t.literalTranslation.replace(/^\[|\]$/g, ""))
      .join(" ");
  }

  let explanation = `Análise morfológica de cada vocábulo em ${targetLangName}.`;
  if (language === "de") {
    explanation = "Em alemão, a estrutura básica coloca os verbos em posições fixas (posição 2 em orações principais, e no final em orações com conjunções como 'weil').";
  } else if (language === "es") {
    explanation = "Em espanhol, a ordem é Sujeito + Verbo + Objeto, com grande flexibilidade e rica conjugação verbal.";
  } else if (language === "it") {
    explanation = "Em italiano, a estrutura segue a musicalidade do idioma, com artigos definidos e contrações preposicionais expressivas.";
  } else if (language === "fr") {
    explanation = "Em francês, a clareza e elegância estrutural regem a união entre artigos, pronomes e verbos conjugados.";
  }

  return {
    original: clean,
    tokens,
    naturalTranslation,
    explanation,
  };
}
