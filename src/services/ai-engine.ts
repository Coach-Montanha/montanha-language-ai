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
  LearnerProfileMemory,
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
    case "ru": {
      if (
        lower.includes("чай") ||
        lower.includes("кофе") ||
        lower.includes("еда") ||
        lower.includes("борщ") ||
        lower.includes("блины")
      ) {
        return [
          {
            category: "agree",
            label: "☕ Chá de manhã",
            text: "Я очень люблю пить горячий чёрный чай с лимоном по утрам.",
            phonetic: "Ya ó-chin lyu-blyú pit' ga-ryá-tchiu tchór-nyy tchai s li-mó-nam pa ut-rám.",
            translationPt: "Adoro tomar chá preto bem quente com limão pela manhã.",
          },
          {
            category: "alternative",
            label: "🥐 Prefiro café",
            text: "На самом деле я больше предпочитаю крепкий кофе.",
            phonetic: "Na sá-mam dyé-lye ya ból'-she pryed-pa-tchi-tá-yu kryép-kiy kó-fye.",
            translationPt: "Na verdade, prefiro um café forte.",
          },
          {
            category: "ask_back",
            label: "🔄 E você, tutor?",
            text: `А как вы любите пить чай или кофе, ${tutorName}?`,
            phonetic: `A kak vy lyú-bi-tye pit' tchai í-li kó-fye, ${tutorName}?`,
            translationPt: `E como você prefere tomar seu chá ou café, ${tutorName}?`,
          },
          {
            category: "detail",
            label: "🥞 Prato favorito",
            text: "Моё любимое русское блюдо — это горячие блины с мёдом.",
            phonetic: "Ma-yó lyu-bí-ma-ye rús-ska-ye blyú-da — é-ta ga-ryá-tchi-ye bli-ný s myó-dam.",
            translationPt: "Meu prato russo favorito são blinis quentinhos com mel.",
          },
          {
            category: "quick",
            label: "⚡ Resposta casual",
            text: "Звучит очень аппетитно!",
            phonetic: "Zvu-tchít ó-chin ap-pi-tít-na!",
            translationPt: "Parece muito apetitoso!",
          },
          {
            category: "general",
            label: "❓ Expressão de restaurante",
            text: "Как вежливо попросить счёт в ресторане?",
            phonetic: "Kak vyézh-li-va pa-pra-sít' schot v ris-ta-rá-nye?",
            translationPt: "Como pedir a conta educadamente no restaurante?",
          },
        ];
      }
      return [
        {
          category: "agree",
          label: "👍 Concordar",
          text: "Да, абсолютно! Я полностью согласен с вами.",
          phonetic: "Da, ap-sa-lyút-na! Ya pól-nast'-yu sa-glá-syen s vá-mi.",
          translationPt: "Sim, com certeza! Concordo plenamente com você.",
        },
        {
          category: "alternative",
          label: "🤔 Outro ponto de vista",
          text: "Если честно, я смотрю на это немного иначе.",
          phonetic: "Yés-li tchyés-na, ya sma-tryú na é-ta ni-mnó-ga i-ná-tche.",
          translationPt: "Para ser sincero, vejo isso de forma um pouco diferente.",
        },
        {
          category: "ask_back",
          label: "🔄 Perguntar de volta",
          text: `А что вы лично думаете об этом, ${tutorName}?`,
          phonetic: `A shto vy lítch-na dú-ma-ye-tye ab é-tam, ${tutorName}?`,
          translationPt: `E o que você pessoalmente pensa sobre isso, ${tutorName}?`,
        },
        {
          category: "detail",
          label: "💬 Falar da rotina",
          text: "Я стараюсь практиковать русский язык каждый день понемногу.",
          phonetic: "Ya sta-rá-yus' prak-ti-ka-vát' rús-skiy ya-zýk kázh-dyy dyen' pa-ni-mnó-gu.",
          translationPt: "Tento praticar russo todos os dias aos poucos.",
        },
        {
          category: "quick",
          label: "⚡ Resposta curta",
          text: "Очень интересно, спасибо!",
          phonetic: "Ó-chin in-ti-ryés-na, spa-sí-ba!",
          translationPt: "Muito interessante, obrigado!",
        },
        {
          category: "general",
          label: "❓ Dica de nativo",
          text: "Подскажите, как носители языка обычно говорят в этой ситуации?",
          phonetic: "Pat-ska-zhí-tye, kak na-sí-tye-li ya-zy-ká a-býtch-na ga-va-ryát v é-tay si-tu-á-tsi-i?",
          translationPt: "Poderia dizer como os nativos costumam falar nessa situação?",
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

// ============================================================================
// MOTOR DE TRADUÇÃO & DETECÇÃO DE PORTUGUÊS (PT-BR -> IDIOMA SELECIONADO)
// Permite ao aluno responder em português, gerando tradução, pronúncia nativa e áudio
// ============================================================================

export interface OfflineTranslationResult {
  translated: string;
  phonetic: string;
  translationPt: string;
}

export function isPortugueseText(text: string, targetLang: SupportedLanguage): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Se o idioma alvo usa alfabetos não-latinos e o texto possui esses caracteres nativos, não é português
  if (targetLang === "ru" && /[а-яА-ЯёЁ]/.test(trimmed)) return false;
  if (targetLang === "el-koine" && /[α-ωΑ-Ω]/.test(trimmed)) return false;
  if (targetLang === "ja" && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(trimmed)) return false;

  // Se o idioma alvo usa alfabeto não-latino e o texto possui caracteres latinos (A-Z),
  // com certeza é texto do aluno para ser traduzido (não é cirílico, grego ou japonês)
  if ((targetLang === "ru" || targetLang === "el-koine" || targetLang === "ja") && /[a-zA-Z]/.test(trimmed)) {
    return true;
  }

  const lower = trimmed.toLowerCase();

  // Caracteres distintivos da ortografia do português brasileiro (com todos os acentos e cedilha)
  if (/[áàâãéêíóôõúüç]/i.test(lower)) return true;

  // Frases / expressões comuns inequívocas em português
  if (
    /(qual o hor[aá]rio|a que horas|que horas|onde fica|como chego|quanto custa|gostaria de|eu quero|o que voc[eê]|como voc[eê]|como est[aá]|como vai|tudo bem|bom dia|boa tarde|boa noite|muito obrigad|estou muito|estou cansad|estou feliz|fim de semana|meu prato|recomenda para|para comer|para o jantar|voc[eê] gosta|de onde voc[eê]|onde voc[eê] mora|clima hoje|tempo hoje|na r[uú]ssia)/i.test(lower)
  ) {
    return true;
  }

  // Palavras funcionais com alta frequência exclusiva em português
  const ptWords = [
    "voce", "voces", "estou", "estamos", "estao", "tenho", "temos", "sou", "somos", "sao",
    "meu", "minha", "meus", "minhas", "seu", "sua", "seus", "suas", "nosso", "nossa",
    "qual", "quais", "quanto", "quanta", "quantos", "quantas", "onde", "quando", "porque",
    "horario", "estacao", "aeroporto", "museu", "restaurante", "almoco", "jantar",
    "cansado", "cansada", "obrigado", "obrigada", "ajuda", "gostaria", "favor", "cafe",
    "certeza", "conta", "metro", "trem", "passagem", "tempo", "clima", "como", "esta", "hoje",
    "russia", "cidade", "pais", "mundo", "dia", "noite", "tarde", "muito", "pouco", "amigo", "amiga"
  ];

  const norm = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'¿¡]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let matchCount = 0;
  for (const w of norm) {
    if (ptWords.includes(w)) {
      matchCount++;
      if (matchCount >= 2) return true;
    }
  }

  const strongPtWords = [
    "horario", "estacao", "estou", "gostaria", "voce", "obrigado", "obrigada",
    "museu", "jantar", "almoco", "clima", "tempo", "hoje", "como", "esta"
  ];
  for (const w of norm) {
    if (strongPtWords.includes(w)) return true;
  }

  return false;
}

interface TranslationRule {
  pattern: RegExp;
  pt: string;
  translations: Record<SupportedLanguage, { text: string; phonetic: string }>;
}

const PORTUGUESE_TRANSLATION_RULES: TranslationRule[] = [
  // 1. Horário do museu
  {
    pattern: /(qual (o )?horario (do|de funcionamento do) museu|a que horas (abre|fecha) o museu|horario do museu|que horas o museu abre)/i,
    pt: "Qual o horário de funcionamento do museu?",
    translations: {
      en: { text: "What time does the museum open?", phonetic: "uót táim dâz dã miu-zí-âm óupên" },
      es: { text: "¿A qué hora abre el museo?", phonetic: "a ke ó-ra á-bre el mu-sé-o" },
      de: { text: "Wann öffnet das Museum?", phonetic: "van óf-nêt das mu-zê-um" },
      fr: { text: "À quelle heure ouvre le musée ?", phonetic: "a kel ér ú-vrê lê my-zê" },
      it: { text: "A che ora apre il museo?", phonetic: "a ke ó-ra á-pre il mu-zê-o" },
      ru: { text: "Во сколько открывается музей?", phonetic: "va skól'-ka at-kry-vá-yet-sya mu-zêy" },
      ja: { text: "博物館は何時に開きますか？ (Hakubutsukan wa nanji ni akimasu ka?)", phonetic: "ra-ku-bu-tsu-kan uá nan-dji ni a-ki-mas-ka" },
      "el-koine": { text: "Πότε ἀνοίγει τὸ μουσεῖον; (Pote anoigei to mouseion?)", phonetic: "pó-te a-ní-gui to mu-sí-on" },
    },
  },
  // 2. Preço da entrada / ingresso
  {
    pattern: /(quanto custa (a entrada|o ingresso|o bilhete)( do museu)?|quanto custa o ingresso|qual o valor da entrada|quanto e a entrada)/i,
    pt: "Quanto custa o ingresso de entrada?",
    translations: {
      en: { text: "How much is the admission ticket?", phonetic: "ráo mâtch íz dhi êd-mí-shân tí-ket" },
      es: { text: "¿Cuánto cuesta la entrada?", phonetic: "cuán-to cuês-ta la en-trá-da" },
      de: { text: "Wie viel kostet der Eintritt?", phonetic: "ví fíl cós-tet dêr áin-trit" },
      fr: { text: "Combien coûte l'entrée ?", phonetic: "cõ-biãn cut lã-trê" },
      it: { text: "Quanto costa il biglietto d'ingresso?", phonetic: "cuán-to cós-ta il bi-lyét-to din-grés-so" },
      ru: { text: "Сколько стоит входной билет?", phonetic: "skól'-ka stó-it vkhad-nóy bi-lêt" },
      ja: { text: "入場券はいくらですか？ (Nyuujouken wa ikura desu ka?)", phonetic: "niu-djo-kên uá i-cu-ra des-ka" },
      "el-koine": { text: "Πόσου ἐστὶν ἡ εἴσοδος; (Posou estin he eisodos?)", phonetic: "pó-su és-tin i í-so-dos" },
    },
  },
  // 3. Onde fica a estação de trem / metrô
  {
    pattern: /(onde fica a estacao( de trem)?|onde fica o metro|onde fica a estacao ferroviaria)/i,
    pt: "Onde fica a estação de trem / metrô?",
    translations: {
      en: { text: "Where is the train station?", phonetic: "uér íz dã trêin stêi-shân" },
      es: { text: "¿Dónde está la estación de tren?", phonetic: "dón-de es-tá la es-ta-sión de tren" },
      de: { text: "Wo ist der Bahnhof?", phonetic: "vo ist dêr bán-rouf" },
      fr: { text: "Où se trouve la gare ?", phonetic: "u sê truv la gár" },
      it: { text: "Dove si trova la stazione ferroviaria?", phonetic: "dó-ve si tró-va la sta-tsió-ne fer-ro-viá-ria" },
      ru: { text: "Где находится вокзал?", phonetic: "gde na-kho-dit-sya vag-zál" },
      ja: { text: "駅はどこにありますか？ (Eki wa doko ni arimasu ka?)", phonetic: "ê-ki uá do-ko ni a-ri-mas-ka" },
      "el-koine": { text: "Ποῦ ἐστιν ὁ σταθμός; (Pou estin ho stathmos?)", phonetic: "pu és-tin ro sta-tmós" },
    },
  },
  // 4. Onde fica o aeroporto / como chego
  {
    pattern: /(onde fica o aeroporto|como chego ao aeroporto|como ir para o aeroporto)/i,
    pt: "Onde fica o aeroporto, por favor?",
    translations: {
      en: { text: "Where is the airport, please?", phonetic: "uér íz dhi ér-pôrt, plíz" },
      es: { text: "¿Dónde está el aeropuerto, por favor?", phonetic: "dón-de es-tá el a-e-ro-puêr-to por fa-vór" },
      de: { text: "Wo ist der Flughafen, bitte?", phonetic: "vo ist dêr flúk-rá-fen, bí-te" },
      fr: { text: "Où se trouve l'aéroport, s'il vous plaît ?", phonetic: "u sê truv la-ê-ro-pôr sil vu plê" },
      it: { text: "Dove si trova l'aeroporto, per favore?", phonetic: "dó-ve si tró-va la-e-ro-pôr-to per fa-vó-re" },
      ru: { text: "Где находится аэропорт, пожалуйста?", phonetic: "gde na-kho-dit-sya a-e-ra-pórt, pa-zhá-luy-sta" },
      ja: { text: "空港はどちらですか？ (Kuukou wa dochira desu ka?)", phonetic: "cu-co uá do-tchi-ra des-ka" },
      "el-koine": { text: "Ποῦ ἐστιν ὁ λιμήν; (Pou estin ho limen?)", phonetic: "pu és-tin ro li-mín" },
    },
  },
  // 5. Recomendação para jantar / comer
  {
    pattern: /(o que (voce )?recomenda para (o )?jantar|o que (voce )?recomenda para comer|qual comida voce recomenda|o que tem de bom para comer|onde jantar)/i,
    pt: "O que você recomenda para o jantar hoje?",
    translations: {
      en: { text: "What do you recommend for dinner tonight?", phonetic: "uót du iú ré-co-mênd fór dín-nêr tu-náit" },
      es: { text: "¿Qué me recomiendas para cenar hoy?", phonetic: "ke me re-co-miên-das pa-ra se-nár ói" },
      de: { text: "Was empfiehlst du heute zum Abendessen?", phonetic: "vas em-pfílst du rói-te tsum á-bend-es-sen" },
      fr: { text: "Que me recommandez-vous pour dîner ce soir ?", phonetic: "kê mê rê-co-mãn-dê vu pur di-nê sê suár" },
      it: { text: "Cosa mi consigli per cena stasera?", phonetic: "có-za mi con-si-lyi per tchê-na sta-zê-ra" },
      ru: { text: "Что ты порекомендуешь на ужин сегодня?", phonetic: "shto ty pa-re-ka-men-dú-yesh na ú-zhyn se-vód-nya" },
      ja: { text: "今夜の夕食に何がおすすめですか？ (Konya no yuushoku ni nani ga osusume desu ka?)", phonetic: "kon-ia no iu-sho-ku ni na-ni ga o-su-su-mê des-ka" },
      "el-koine": { text: "Τί συμβουλεύεις εἰς τὸ δεῖπνον σήμερον; (Ti symbouleueis eis to deipnon semeron?)", phonetic: "ti sim-vu-lév-is is to díp-non sí-me-ron" },
    },
  },
  // 6. Pedir café / água
  {
    pattern: /(eu gostaria de (tomar |beber )?um cafe( com leite)?|gostaria de um cafe|um cafe por favor|quero um cafe)/i,
    pt: "Eu gostaria de uma xícara de café com leite, por favor.",
    translations: {
      en: { text: "I would like a cup of coffee with milk, please.", phonetic: "ái uûd láik a câp âv có-fi uíd mílk, plíz" },
      es: { text: "Me gustaría un café con leche, por favor.", phonetic: "me gus-ta-rí-a un ca-fé con lé-tche por fa-vór" },
      de: { text: "Ich möchte bitte einen Kaffee mit Milch.", phonetic: "ikh mékh-te bí-te ái-nen cá-fe mit milkh" },
      fr: { text: "Je voudrais un café au lait, s'il vous plaît.", phonetic: "jê vu-drê ãn ca-fê o lê sil vu plê" },
      it: { text: "Vorrei un caffè macchiato, per favore.", phonetic: "vor-rêi un caf-fè ma-kiá-to per fa-vó-re" },
      ru: { text: "Я хотел бы кофе с молоком, пожалуйста.", phonetic: "ya kha-têl by kó-fe s ma-la-kóm, pa-zhá-luy-sta" },
      ja: { text: "カフェオレを一つお願いします。 (Kafe ore o hitotsu onegaishimasu.)", phonetic: "ca-fê o-re o ri-to-tsu o-ne-gái-shi-mas" },
      "el-koine": { text: "Θέλω ποτήριον θερμοῦ ποτοῦ μετὰ γάλακτος. (Thelo poterion thermou potou meta galaktos.)", phonetic: "té-lo po-tí-ri-on ter-mú po-tú me-tá gá-lak-tos" },
    },
  },
  // 7. Cansaço / Exaustão
  {
    pattern: /(estou muito cansado|estou cansado|estou exausto|tive um dia longo|estou com sono|muito cansada|estou cansada)/i,
    pt: "Estou me sentindo muito cansado hoje após um longo dia.",
    translations: {
      en: { text: "I am feeling very tired after a long day today.", phonetic: "ái ém fí-ling vér-ri tái-êrd éf-têr a lóng dêi tu-dêi" },
      es: { text: "Estoy muy cansado después de un largo día hoy.", phonetic: "es-tói múi can-sá-do des-pués de un lár-go dí-a ói" },
      de: { text: "Ich bin heute nach einem langen Tag sehr müde.", phonetic: "ikh bin rói-te nakh ái-nem lán-guen tak zêr miú-de" },
      fr: { text: "Je suis très fatigué après une longue journée aujourd'hui.", phonetic: "jê sui trê fa-ti-guê a-prê yn lõg jur-nê o-jur-dui" },
      it: { text: "Sono molto stanco dopo una lunga giornata oggi.", phonetic: "só-no mól-to stán-co dó-po ú-na lún-ga djor-ná-ta ód-dji" },
      ru: { text: "Я сегодня очень устал после долгого дня.", phonetic: "ya se-vód-nya ó-chen' us-tál pós-le dól-ga-va dnya" },
      ja: { text: "今日は長い一日の後でとても疲れました。 (Kyou wa nagai ichinichi no ato de totemo tsukaremashita.)", phonetic: "kiô uá na-gái i-tchi-ni-tchi no a-to de to-te-mo tsu-ca-re-mash-ta" },
      "el-koine": { text: "Πάνυ κέκμηκα μετὰ μακρὰν ἡμέραν σήμερον. (Panu kekmeka meta makran hemeran semeron.)", phonetic: "pá-ni kék-mi-ka me-tá ma-krán i-mé-ran sí-me-ron" },
    },
  },
  // 8. Alegria / Ótimo humor
  {
    pattern: /(estou muito feliz|estou super feliz|estou animado|meu dia foi maravilhoso|estou de bom humor|estou animada)/i,
    pt: "Estou me sentindo muito feliz e animado hoje!",
    translations: {
      en: { text: "I am feeling really happy and energized today!", phonetic: "ái ém fí-ling rí-li ré-pi énd é-ner-djáizd tu-dêi" },
      es: { text: "¡Estoy muy feliz y lleno de energía hoy!", phonetic: "es-tói múi fe-líz i yé-no de e-ner-hí-a ói" },
      de: { text: "Ich bin heute super glücklich und voller Energie!", phonetic: "ikh bin rói-te zú-per gliúk-likh unt fól-ler e-ner-guí" },
      fr: { text: "Je suis très heureux et plein d'énergie aujourd'hui !", phonetic: "jê sui trê zé-rê e plãn dê-ner-jí o-jur-dui" },
      it: { text: "Sono felicissimo e pieno di energia oggi!", phonetic: "só-no fe-li-tchís-si-mo e piê-no di e-ner-djí-a ód-dji" },
      ru: { text: "Я сегодня очень счастлив и полон сил!", phonetic: "ya se-vód-nya ó-chen' shchást-lif i pó-lan sil" },
      ja: { text: "今日はとても嬉しくて元気いっぱいです！ (Kyou wa totemo ureshikute genki ippai desu!)", phonetic: "kiô uá to-te-mo u-re-shí-cu-te guên-ki ip-pai des" },
      "el-koine": { text: "Χαίρω σφόδρα καὶ ἰσχύω σήμερον! (Chairo sphodra kai ischyo semeron!)", phonetic: "ré-ro sfó-dra ke is-río sí-me-ron" },
    },
  },
  // 9. Como vai você / tudo bem
  {
    pattern: /(como voce esta|tudo bem com voce|como vao as coisas|como vai voce|como tem passado)/i,
    pt: "Como você está hoje, meu amigo?",
    translations: {
      en: { text: "How are you doing today, my friend?", phonetic: "ráo ar iú dú-ing tu-dêi, mái frênd" },
      es: { text: "¿Cómo estás hoy, amigo?", phonetic: "có-mo es-tás ói, a-mí-go" },
      de: { text: "Wie geht es dir heute, mein Freund?", phonetic: "vi guêt es dir rói-te, máin fróint" },
      fr: { text: "Comment vas-tu aujourd'hui, mon ami ?", phonetic: "co-mãn va tü o-jur-dui, mõ na-mi" },
      it: { text: "Come stai oggi, amico mio?", phonetic: "có-me stái ód-dji, a-mí-co mí-o" },
      ru: { text: "Как твои дела сегодня, мой друг?", phonetic: "kak tva-í de-lá se-vód-nya, moy druk" },
      ja: { text: "今日のご機嫌はいかがですか？ (Kyou no gokigen wa ikaga desu ka?)", phonetic: "kiô no go-ki-guên uá i-ca-ga des-ka" },
      "el-koine": { text: "Πῶς ἔχεις σήμερον, ὦ φίλε; (Pos echeis semeron, o phile?)", phonetic: "pos é-his sí-me-ron, o fí-le" },
    },
  },
  // 10. Origem / Cidade
  {
    pattern: /(de onde voce e|onde voce mora|qual (e a )?sua cidade|de que pais voce e)/i,
    pt: "De onde você é e onde você mora?",
    translations: {
      en: { text: "Where are you from, and where do you live?", phonetic: "uér ar iú frâm, énd uér du iú liv" },
      es: { text: "¿De dónde eres y dónde vives?", phonetic: "de dón-de é-res i dón-de ví-bes" },
      de: { text: "Woher kommst du und wo lebst du?", phonetic: "vo-rêr cómst du unt vo lêpst du" },
      fr: { text: "D'où viens-tu et où habites-tu ?", phonetic: "du viãn-tü e u a-bit-tü" },
      it: { text: "Di dove sei e dove vivi?", phonetic: "di dó-ve sêi e dó-ve ví-vi" },
      ru: { text: "Откуда ты и где ты живёшь?", phonetic: "at-kú-da ty i gde ty zhy-vyósh" },
      ja: { text: "ご出身はどちらで、どこにお住まいですか？ (Goshusshin wa dochira de, doko ni osumai desu ka?)", phonetic: "go-shush-shin uá do-tchi-ra de, do-ko ni o-su-mai des-ka" },
      "el-koine": { text: "Πόθεν εἶ καὶ ποῦ οἰκεῖς; (Pothen ei kai pou oikeis?)", phonetic: "pó-ten i ke pu i-kís" },
    },
  },
  // 11. Fim de semana / Hobbies
  {
    pattern: /(o que voce (gosta de )?faz(er)? no fim de semana|o que voce faz no tempo livre|quais sao seus hobbies|o que voce costuma fazer)/i,
    pt: "O que você gosta de fazer no fim de semana e no tempo livre?",
    translations: {
      en: { text: "What do you like to do on weekends and in your free time?", phonetic: "uót du iú láik tu du on uík-ênds énd in iór frí táim" },
      es: { text: "¿Qué te gusta hacer los fines de semana y en tu tiempo libre?", phonetic: "ke te gus-ta a-sér los fí-nes de se-má-na i en tu tiêm-po lí-bre" },
      de: { text: "Was machst du am Wochenende und in deiner Freizeit?", phonetic: "vas marhst du am vó-ren-en-de unt in dái-ner frái-tsait" },
      fr: { text: "Qu'aimes-tu faire le week-end et pendant ton temps libre ?", phonetic: "kém-tü fêr lê ui-kênd e pãn-dãn tõ tãn lí-brê" },
      it: { text: "Cosa ti piace fare nel fine settimana e nel tempo libero?", phonetic: "có-za ti piá-tche fá-re nel fí-ne set-ti-má-na e nel têm-po lí-be-ro" },
      ru: { text: "Чем ты любишь заниматься на выходных и в свободное время?", phonetic: "chem ty lyú-bish za-ni-mát'-sya na vy-khad-nykh i v sva-bód-na-ye vrié-mya" },
      ja: { text: "週末や空いた時間に何をするのが好きですか？ (Shuumatsu ya aita jikan ni nani o suru no ga suki desu ka?)", phonetic: "shu-mat-su ia ái-ta dji-can ni na-ni o su-ru no ga su-ki des-ka" },
      "el-koine": { text: "Τί ποιεῖς ἐν τοῖς σαββάτοις καὶ ἐν τῇ ἀνέσει σου; (Ti poieis en tois sabbatois kai en te anesei sou?)", phonetic: "ti pi-ís en tis sav-vá-tis ke en ti a-né-si su" },
    },
  },
  // 12. Aprendendo o idioma
  {
    pattern: /(estou aprendendo seu idioma|estou estudando seu idioma|quero praticar seu idioma|estou praticando)/i,
    pt: "Estou aprendendo e praticando o seu idioma todos os dias.",
    translations: {
      en: { text: "I am learning and practicing your language every day.", phonetic: "ái ém lér-ning énd prék-ti-sing iór léng-guidj év-ri dêi" },
      es: { text: "Estoy aprendiendo y practicando tu idioma todos los días.", phonetic: "es-tói a-pren-diên-do i prac-ti-cán-do tu i-dió-ma tó-dos los dí-as" },
      de: { text: "Ich lerne und übe deine Sprache jeden Tag.", phonetic: "ikh lér-ne unt íu-be dái-ne shprá-khe iê-den tak" },
      fr: { text: "J'apprends et je pratique ta langue chaque jour.", phonetic: "ja-prãn e jê pra-tik ta lãg shak jur" },
      it: { text: "Sto imparando e praticando la tua lingua ogni giorno.", phonetic: "sto im-pa-rán-do e pra-ti-cán-do la tú-a lín-gua ón-nyi djor-no" },
      ru: { text: "Я учу и практикую твой язык каждый день.", phonetic: "ya u-chú i prak-ti-kú-yu tvoy ya-zýk kázh-dyy dyen'" },
      ja: { text: "毎日あなたの言語を一生懸命勉強しています。 (Mainichi anata no gengo o isshoukenmei benkyou shiteimasu.)", phonetic: "mái-ni-tchi a-na-ta no guên-go o is-sho-kên-mêi ben-kiô shi-te-i-mas" },
      "el-koine": { text: "Καθ' ἡμέραν μανθάνω καὶ ἀσκῶ τὴν γλῶσσάν σου. (Kath' hemeran manthano kai asko ten glossan sou.)", phonetic: "kat i-mé-ran man-tá-no ke as-kó tin glóss-san su" },
    },
  },
  // 13a. Clima na Rússia / País / Cidade específica
  {
    pattern: /(como esta o (clima|tempo).*russia|clima na russia|tempo na russia|esta frio na russia)/i,
    pt: "Como está o clima hoje na Rússia?",
    translations: {
      en: { text: "How is the weather in Russia today?", phonetic: "ráo íz dã ué-dêr in rô-sha tu-dêi" },
      es: { text: "¿Cómo está el clima hoy en Rusia?", phonetic: "có-mo es-tá el clí-ma ói en rrú-sia" },
      de: { text: "Wie ist das Wetter heute in Russland?", phonetic: "vi ist das vét-têr rói-te in rús-lant" },
      fr: { text: "Quel temps fait-il en Russie aujourd'hui ?", phonetic: "kel tãn fe-til ãn ry-sí o-jur-dui" },
      it: { text: "Com'è il tempo in Russia oggi?", phonetic: "co-mè il têm-po in rús-sia ód-dji" },
      ru: { text: "Какая сегодня погода в России?", phonetic: "ka-ká-ya se-vód-nya pa-gó-da v ras-sí-i" },
      ja: { text: "今日のロシアの天気はどうですか？ (Kyou no Roshia no tenki wa dou desu ka?)", phonetic: "kiô no ro-shí-a no tên-ki uá do des-ka" },
      "el-koine": { text: "Ποῖός ἐστιν ὁ καιρὸς ἐν τῇ Ῥωσσίᾳ σήμερον; (Poios estin ho kairos en te Rhossia semeron?)", phonetic: "pí-os és-tin ro ke-rós en ti ros-sí-a sí-me-ron" },
    },
  },
  // 13b. Clima geral
  {
    pattern: /(como esta o (tempo|clima)|qual e a previsao do tempo|esta chovendo|esta frio|esta calor)/i,
    pt: "Como está o clima na sua cidade hoje?",
    translations: {
      en: { text: "How is the weather in your city today?", phonetic: "ráo íz dã ué-dêr in iór sí-ti tu-dêi" },
      es: { text: "¿Cómo está el clima en tu ciudad hoy?", phonetic: "có-mo es-tá el clí-ma en tu siu-dád ói" },
      de: { text: "Wie ist das Wetter heute in deiner Stadt?", phonetic: "vi ist das vét-têr rói-te in dái-ner shtat" },
      fr: { text: "Quel temps fait-il dans ta ville aujourd'hui ?", phonetic: "kel tãn fe-til dãn ta vil o-jur-dui" },
      it: { text: "Com'è il tempo nella tua città oggi?", phonetic: "co-mè il têm-po nél-la tú-a tchit-tà ód-dji" },
      ru: { text: "Какая сегодня погода в твоём городе?", phonetic: "ka-ká-ya se-vód-nya pa-gó-da v tva-yóm gó-ra-dye" },
      ja: { text: "今日のあなたの街の天気はどうですか？ (Kyou no anata no machi no tenki wa dou desu ka?)", phonetic: "kiô no a-na-ta no ma-tchi no tên-ki uá do des-ka" },
      "el-koine": { text: "Ποῖός ἐστιν ὁ καιρὸς ἐν τῇ πόλει σου; (Poios estin ho kairos en te polei sou?)", phonetic: "pí-os és-tin ro ke-rós en ti pó-li su" },
    },
  },
  // 14. Agradecimento
  {
    pattern: /(muito obrigado( pela ajuda)?|obrigada pela ajuda|agradeco muito|muito agradecido)/i,
    pt: "Muito obrigado pela sua ajuda!",
    translations: {
      en: { text: "Thank you so much for your help!", phonetic: "ténk iú sou mâtch fór iór rélp" },
      es: { text: "¡Muchas gracias por tu ayuda!", phonetic: "mú-tchas grá-sias por tu a-yú-da" },
      de: { text: "Vielen herzlichen Dank für deine Hilfe!", phonetic: "fí-len rêrts-likh-en danc fiúr dái-ne ríl-fe" },
      fr: { text: "Merci beaucoup pour votre aide précieuse !", phonetic: "mer-sí bo-cú pur vo-tre êd prê-siéz" },
      it: { text: "Grazie mille di cuore per il tuo aiuto!", phonetic: "grá-tsie míl-le di cuó-re per il tú-o a-yú-to" },
      ru: { text: "Огромное спасибо за твою помощь!", phonetic: "ag-róm-na-ye spa-sí-ba za tva-yú pó-moshch'" },
      ja: { text: "親切に教えてくれてどうもありがとうございます！ (Shinsetsu ni oshiete kurete doumo arigatou gozaimasu!)", phonetic: "shin-sê-tsu ni o-shí-e-te cu-re-te do-mo a-ri-ga-to go-zái-mas" },
      "el-koine": { text: "Χάριν μεγίστην ἔχω σοι διὰ τὴν βοήθειάν σου. (Charin megisten echo soi dia ten boetheian sou.)", phonetic: "rá-rin me-gís-tin é-ro si di-á tin vo-í-ti-an su" },
    },
  },
  // 15. Saudações
  {
    pattern: /(ola bom dia|ola boa tarde|ola boa noite|bom dia|boa tarde|boa noite|ola tudo bem)/i,
    pt: "Olá, tenha um excelente dia!",
    translations: {
      en: { text: "Hello, have a wonderful day!", phonetic: "ré-lou, rév a uân-der-ful dêi" },
      es: { text: "¡Hola, que tengas un día maravilloso!", phonetic: "ó-la, ke tén-gas un dí-a ma-ra-vi-yó-so" },
      de: { text: "Hallo, einen wunderschönen Tag wünsche ich dir!", phonetic: "rá-lo, ái-nen vún-der-shê-nen tak viún-she ikh dir" },
      fr: { text: "Bonjour, passez une merveilleuse journée !", phonetic: "bõ-jur, pa-sê yne mer-vê-yéz jur-nê" },
      it: { text: "Ciao, ti auguro una splendida giornata!", phonetic: "tcháo, ti áu-gu-ro ú-na splên-di-da djor-ná-ta" },
      ru: { text: "Здравствуйте, прекрасного и радостного вам дня!", phonetic: "zdrás-tvuy-tye, pri-krás-na-va i rá-dast-na-va vam dnya" },
      ja: { text: "こんにちは、素晴らしい一日をお過ごしください！ (Konnichiwa, subarashii ichinichi o osugoshi kudasai!)", phonetic: "con-ni-tchi-uá, su-ba-ra-shí i-tchi-ni-tchi o o-su-go-shi cu-da-sái" },
      "el-koine": { text: "Χαῖρε, ἀγαθὴ καὶ λαμπρὰ ἡμέρα ἔστω σοι! (Chaire, agathe kai lampra hemera esto soi!)", phonetic: "ré-re, a-ga-tí ke lam-prá i-mé-ra és-to si" },
    },
  },
  // 16. Concordância
  {
    pattern: /(sim eu concordo( totalmente)?|com certeza|acho uma otima ideia|concordo plenamente)/i,
    pt: "Sim, eu concordo totalmente com isso!",
    translations: {
      en: { text: "Yes, I completely agree with that!", phonetic: "iés, ái com-plít-li a-grí uíd dhét" },
      es: { text: "¡Sí, estoy totalmente de acuerdo con eso!", phonetic: "sí, es-tói to-tal-mén-te de a-cuêr-do con é-so" },
      de: { text: "Ja, da stimme ich dir vollkommen zu!", phonetic: "ia, da shtí-me ikh dir fol-kó-men tsu" },
      fr: { text: "Oui, je suis tout à fait d'accord avec cela !", phonetic: "ui, jê sui tu-ta-fê da-côr a-vek sê-la" },
      it: { text: "Sì, sono assolutamente d'accordo con te!", phonetic: "sì, só-no as-so-lu-ta-mén-te da-cór-do con te" },
      ru: { text: "Да, я абсолютно согласен с этим!", phonetic: "da, ya ap-sa-lyút-na sa-glá-syen s é-tim" },
      ja: { text: "はい、その通りだと思います！ (Hai, sono toori da to omoimasu!)", phonetic: "rái, so-no tô-ri da to o-mói-mas" },
      "el-koine": { text: "Ναί, πάνυ συνευδοκῶ τούτῳ! (Nai, panu syneudoko toutoi!)", phonetic: "né, pá-ni sin-ev-do-kó tú-to" },
    },
  },
  // 17. Conta no restaurante
  {
    pattern: /(a conta por favor|quanto deu a conta|pode trazer a conta)/i,
    pt: "A conta, por favor!",
    translations: {
      en: { text: "Could I have the check, please?", phonetic: "cûd ái rév dã tchék, plíz" },
      es: { text: "¿La cuenta, por favor?", phonetic: "la cuên-ta por fa-vór" },
      de: { text: "Die Rechnung, bitte!", phonetic: "di rékh-nung, bí-te" },
      fr: { text: "L'addition, s'il vous plaît !", phonetic: "la-di-siõ, sil vu plê" },
      it: { text: "Il conto, per favore!", phonetic: "il cón-to, per fa-vó-re" },
      ru: { text: "Счёт, пожалуйста!", phonetic: "shchot, pa-zhá-luy-sta" },
      ja: { text: "お会計をお願いします。 (Okaikei o onegaishimasu.)", phonetic: "o-cái-kêi o o-ne-gái-shi-mas" },
      "el-koine": { text: "Τὸν λόγον, παρακαλῶ. (Ton logon, parakalo.)", phonetic: "ton ló-gon, pa-ra-ka-ló" },
    },
  },
  // 18. Nome do interlocutor
  {
    pattern: /(qual (e o )?seu nome|como voce se chama|quem e voce)/i,
    pt: "Qual é o seu nome?",
    translations: {
      en: { text: "What is your name, my friend?", phonetic: "uót íz iór nêim, mái frênd" },
      es: { text: "¿Cómo te llamas, amigo?", phonetic: "có-mo te yá-mas, a-mí-go" },
      de: { text: "Wie heißt du, mein Freund?", phonetic: "vi ráist du, máin fróint" },
      fr: { text: "Comment t'appelles-tu, mon ami ?", phonetic: "co-mãn ta-pel-tü, mõ na-mi" },
      it: { text: "Come ti chiami, amico mio?", phonetic: "có-me ti kiá-mi, a-mí-co mí-o" },
      ru: { text: "Как тебя зовут, мой друг?", phonetic: "kak ti-byá za-vút, moy druk" },
      ja: { text: "お名前は何とおっしゃいますか？ (Onamae wa nan to osshaimasu ka?)", phonetic: "o-na-ma-e uá nan to osh-shái-mas-ka" },
      "el-koine": { text: "Τί ἐστιν τὸ ὄνομά σου; (Ti estin to onoma sou?)", phonetic: "ti és-tin to ó-no-má su" },
    },
  },
];

export function translatePortugueseOffline(
  text: string,
  targetLang: SupportedLanguage
): OfflineTranslationResult {
  const norm = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:"'¿¡]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Tentar casar com regras ricas pré-configuradas
  for (const rule of PORTUGUESE_TRANSLATION_RULES) {
    if (rule.pattern.test(norm)) {
      const match = rule.translations[targetLang];
      if (match) {
        return {
          translated: match.text,
          phonetic: match.phonetic,
          translationPt: rule.pt,
        };
      }
    }
  }

  // 2. Fallback por substituição de termos essenciais
  const PT_WORD_MAP: Record<string, Record<SupportedLanguage, string>> = {
    eu: { en: "I", es: "yo", de: "ich", fr: "je", it: "io", ru: "я", ja: "私 (watashi)", "el-koine": "ἐγώ" },
    voce: { en: "you", es: "tú", de: "du", fr: "tu", it: "tu", ru: "ты", ja: "あなた (anata)", "el-koine": "σύ" },
    quero: { en: "I want", es: "quiero", de: "ich will", fr: "je veux", it: "voglio", ru: "я хочу", ja: "〜が欲しい (hoshii)", "el-koine": "θέλω" },
    gostaria: { en: "I would like", es: "me gustaría", de: "ich möchte", fr: "je voudrais", it: "vorrei", ru: "я хотел бы", ja: "〜したいです (shitai desu)", "el-koine": "βούλομαι" },
    preciso: { en: "I need", es: "necesito", de: "ich brauche", fr: "j'ai besoin de", it: "ho bisogno di", ru: "мне нужно", ja: "〜が必要です (hitsuyou desu)", "el-koine": "χρείαν ἔχω" },
    onde: { en: "where is", es: "dónde está", de: "wo ist", fr: "où est", it: "dove si trova", ru: "где", ja: "どこ (doko)", "el-koine": "ποῦ" },
    quando: { en: "when", es: "cuándo", de: "wann", fr: "quand", it: "quando", ru: "когда", ja: "いつ (itsu)", "el-koine": "πότε" },
    como: { en: "how", es: "cómo", de: "wie", fr: "comment", it: "come", ru: "как", ja: "どのように (donoyouni)", "el-koine": "πῶς" },
    quanto: { en: "how much is", es: "cuánto cuesta", de: "wie viel kostet", fr: "combien coûte", it: "quanto costa", ru: "сколько стоит", ja: "いくら (ikura)", "el-koine": "πόσου" },
    museu: { en: "museum", es: "museo", de: "Museum", fr: "musée", it: "museo", ru: "музей", ja: "博物館 (hakubutsukan)", "el-koine": "μουσεῖον" },
    estacao: { en: "station", es: "estación", de: "Bahnhof", fr: "gare", it: "stazione", ru: "вокзал", ja: "駅 (eki)", "el-koine": "σταθμός" },
    hotel: { en: "hotel", es: "hotel", de: "Hotel", fr: "hôtel", it: "hotel", ru: "отель", ja: "ホテル (hoteru)", "el-koine": "πανδοχεῖον" },
    cafe: { en: "coffee", es: "café", de: "Kaffee", fr: "café", it: "caffè", ru: "кофе", ja: "コーヒー (koohii)", "el-koine": "θερμὸν ποτόν" },
    agua: { en: "water", es: "agua", de: "Wasser", fr: "eau", it: "acqua", ru: "вода", ja: "水 (mizu)", "el-koine": "ὕδωρ" },
    comida: { en: "food", es: "comida", de: "Essen", fr: "nourriture", it: "cibo", ru: "еда", ja: "食べ物 (tabemono)", "el-koine": "τροφή" },
    obrigado: { en: "thank you", es: "gracias", de: "danke", fr: "merci", it: "grazie", ru: "спасибо", ja: "ありがとう (arigatou)", "el-koine": "χάρις" },
    ajuda: { en: "help", es: "ayuda", de: "Hilfe", fr: "aide", it: "aiuto", ru: "помощь", ja: "助け (tasuke)", "el-koine": "βοήθεια" },
    clima: { en: "weather", es: "clima", de: "Wetter", fr: "météo", it: "meteo", ru: "погода", ja: "天気 (tenki)", "el-koine": "καιρός" },
    tempo: { en: "weather", es: "tiempo", de: "Wetter", fr: "temps", it: "tempo", ru: "погода", ja: "天気 (tenki)", "el-koine": "καιρός" },
    hoje: { en: "today", es: "hoy", de: "heute", fr: "aujourd'hui", it: "oggi", ru: "сегодня", ja: "今日 (kyou)", "el-koine": "σήμερον" },
    russia: { en: "Russia", es: "Rusia", de: "Russland", fr: "Russie", it: "Russia", ru: "Россия", ja: "ロシア (Roshia)", "el-koine": "Ῥωσσία" },
    esta: { en: "is", es: "está", de: "ist", fr: "est", it: "è", ru: "сейчас", ja: "は", "el-koine": "ἐστίν" },
    frio: { en: "cold", es: "frío", de: "kalt", fr: "froid", it: "freddo", ru: "холодно", ja: "寒い (samui)", "el-koine": "ψυχρόν" },
    calor: { en: "hot", es: "calor", de: "warm", fr: "chaud", it: "caldo", ru: "жарко", ja: "暑い (atsui)", "el-koine": "θερμόν" },
    bom: { en: "good", es: "bueno", de: "gut", fr: "bon", it: "buono", ru: "хорошо", ja: "良い (ii)", "el-koine": "ἀγαθόν" },
    cidade: { en: "city", es: "ciudad", de: "Stadt", fr: "ville", it: "città", ru: "город", ja: "街 (machi)", "el-koine": "πόλις" },
    dia: { en: "day", es: "día", de: "Tag", fr: "jour", it: "giorno", ru: "день", ja: "日 (hi)", "el-koine": "ἡμέρα" },
    noite: { en: "night", es: "noche", de: "Nacht", fr: "nuit", it: "notte", ru: "ночь", ja: "夜 (yoru)", "el-koine": "νύξ" },
    tudo: { en: "all", es: "todo", de: "alles", fr: "tout", it: "tutto", ru: "всё", ja: "全て (subete)", "el-koine": "πάντα" },
    bem: { en: "well", es: "bien", de: "gut", fr: "bien", it: "bene", ru: "хорошо", ja: "良い (yoi)", "el-koine": "καλῶς" },
  };

  const words = norm.split(" ");
  const translatedWords = words.map((w) => PT_WORD_MAP[w]?.[targetLang] || w);
  const translated = translatedWords.join(" ");
  const phonetic = generatePhoneticGuide(translated, targetLang);

  return {
    translated,
    phonetic,
    translationPt: text,
  };
}

export async function translatePortugueseToTargetLanguage(
  text: string,
  targetLang: SupportedLanguage,
  apiKey?: string
): Promise<OfflineTranslationResult> {
  if (apiKey) {
    try {
      const langNames: Record<string, string> = {
        en: "English",
        es: "Spanish (Español)",
        ja: "Japanese (日本語 - with Romaji & Kanji)",
        "el-koine": "Biblical Koine Greek (Ancient Greek with transliteration)",
        it: "Italian (Italiano)",
        fr: "French (Français)",
        de: "German (Deutsch)",
        ru: "Russian (Русский - with Cyrillic script)",
      };
      const targetLangName = langNames[targetLang] || "English";

      const prompt = `Translate this Brazilian Portuguese message into natural, communicative, everyday spoken ${targetLangName}: "${text}".
Return ONLY a valid JSON object with this exact structure:
{
  "translated": "natural, native-sounding sentence in ${targetLangName}",
  "phonetic": "friendly phonetic transcription in Brazilian Portuguese syllables for the translated sentence (e.g. '[ uót táim dâz dã miu-zí-âm óupên ]')",
  "translationPt": "expressão clara em português brasileiro"
}`;
      const responseRaw = await callGeminiRaw(apiKey, prompt);
      const cleaned = responseRaw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.translated) {
        return {
          translated: parsed.translated,
          phonetic: parsed.phonetic || generatePhoneticGuide(parsed.translated, targetLang),
          translationPt: parsed.translationPt || text,
        };
      }
    } catch (e) {
      console.warn("Falha no Gemini para tradução rápida, usando tradutor local:", e);
    }
  }

  return translatePortugueseOffline(text, targetLang);
}

export type UserIntentType =
  | "question_name"
  | "question_origin"
  | "question_how_are_you"
  | "question_taste"
  | "question_museum_hours"
  | "question_directions"
  | "question_food_recommendation"
  | "feeling_tired"
  | "feeling_happy"
  | "feeling_sick"
  | "topic_food"
  | "topic_travel"
  | "topic_work"
  | "topic_weather"
  | "topic_learning"
  | "topic_weekend"
  | "affirmation"
  | "negation"
  | "thanks"
  | "greeting"
  | "general";

export function classifyUserIntent(userInput: string, _tutorLanguage?: SupportedLanguage): UserIntentType {
  const lower = userInput.toLowerCase().trim();

  // 0a. Horário do Museu / Abertura / Ingressos
  if (
    /(qual o hor[aá]rio do museu|a que horas abre o museu|a que horas fecha o museu|quanto custa a entrada do museu|hor[aá]rio do museu|hor[aá]rio de funcionamento do museu|what time does the museum|museum opening hours|museum hours|when does the museum|wann öffnet das museum|öffnungszeiten des museums|a qué hora abre el museo|horario del museo|a che ora apre il museo|orari del museo|à quelle heure ouvre le musée|horaires du musée|во сколько открывается музей|часы работы музея|hakubutsukan wa nanji|pote anoigei to mouseion)/i.test(lower) ||
    (/\b(museu|museum|museo|musée|musei|музей|hakubutsukan)\b/i.test(lower) && /\b(hor[aá]rio|horas|hours|time|abertura|abre|fecha|open|opens|close|closes|öffnungszeiten|orari|horaires|во сколько|открывается|часы работы)\b/i.test(lower))
  ) {
    return "question_museum_hours";
  }

  // 0b. Direções / Estação de trem / Metrô / Aeroporto
  if (
    /(onde fica a esta[cç][aã]o|onde fica o metr[oô]|onde fica o aeroporto|como chego ao hotel|como chego na esta[cç][aã]o|where is the station|where is the train station|where is the subway|where is the airport|how do i get to|wo ist der bahnhof|wo ist der flughafen|dónde está la estación|dónde está el aeropuerto|dove si trova la stazione|dove si trova l'aeroporto|où est la gare|où se trouve la gare|где находится вокзал|где находится станция|где метро|где аэропорт|eki wa doko|pou estin ho stathmos)/i.test(lower) ||
    (/\b(esta[cç][aã]o|station|estación|bahnhof|gare|stazione|станция|aeroporto|airport|aeropuerto|flughafen|aéroport|metr[oô]|subway|u-bahn)\b/i.test(lower) && /\b(onde|where|dónde|donde|wo|dove|où|ou|где|doko|pou|como chego|how do i get|como llegar)\b/i.test(lower))
  ) {
    return "question_directions";
  }

  // 0c. Recomendação de comida / Jantar
  if (
    /(o que voc[eê] recomenda para o jantar|o que voc[eê] recomenda para comer|o que tem de bom para comer|qual prato voc[eê] recomenda|qual o seu prato favorito|qual sua comida favorita|what do you recommend for dinner|what do you recommend to eat|what is your favorite dish|what's your favorite food|was empfiehlst du zum abendessen|was ist dein lieblingsgericht|qué recomiendas para cenar|qué me recomiendas comer|cuál es tu plato favorito|cosa consigli per cena|qual è il tuo piatto preferito|que recommandez-vous pour le dîner|quel est votre plat préféré|что ты порекомендуешь на ужин|какое твоё любимое блюдо|yuushoku ni nani ga osusume|ti symbouleueis eis to deipnon)/i.test(lower) ||
    (/\b(recomenda|recommend|empfiehlst|recomiendas|consigli|recommandez|порекомендуешь)\b/i.test(lower) && /\b(jantar|almoço|comer|comida|prato|dinner|lunch|food|dish|abendessen|essen|gericht|cenar|comer|plato|cena|pranzo|piatto|dîner|plat|ужин|блюдо)\b/i.test(lower))
  ) {
    return "question_food_recommendation";
  }

  // 0d. Fim de semana / Hobbies
  if (
    /(o que voc[eê] faz no fim de semana|o que voc[eê] gosta de fazer no tempo livre|quais s[aã]o seus hobbies|o que voc[eê] costuma fazer no s[aá]bado|what do you do on weekends|what do you do in your free time|what are your hobbies|was machst du am wochenende|was machst du in deiner freizeit|qué haces los fines de semana|qué te gusta hacer en tu tiempo libre|cosa fai nel fine settimana|cosa fai nel tempo libero|que fais-tu le week-end|qu'aimes-tu faire pendant ton temps libre|чем ты занимаешься на выходных|чем любишь заниматься в свободное время|shuumatsu wa nani|ti poieis en tois sabbatois)/i.test(lower) ||
    /\b(fim de semana|finais de semana|tempo livre|weekend|weekends|free time|wochenende|freizeit|fin de semana|fines de semana|tiempo libre|fine settimana|tempo libero|week-end|temps libre|выходные|выходных|свободное время)\b/i.test(lower)
  ) {
    return "topic_weekend";
  }

  // 1. Pergunta sobre o nome do tutor
  if (
    /(what('s| is) your name|who are you|tell me your name|dein name|wie heißt du|wie heisst du|wer bist du|cómo te llamas|como te llamas|cuál es tu nombre|come ti chiami|chi sei|comment tu t'appelles|quel est ton nom|qui es-tu|o-?namae|namae wa|dare desu ka|как тебя зовут|как вас зовут|твоё имя|ваше имя|кто ты|кто вы|qual (é o )?seu nome|quem é você)/i.test(lower)
  ) {
    return "question_name";
  }

  // 2. Pergunta sobre a origem/cidade do tutor
  if (
    /(where are you from|where do you live|where were you born|what city|woher kommst du|wo wohnst du|welche stadt|wo lebst du|de dónde eres|de donde eres|dónde vives|donde vives|en qué ciudad|di dove sei|dove vivi|dove abiti|in quale città|d'où viens-tu|où habites-tu|tu viens d'où|dans quelle ville|doko kara|doko ni sunde|doko no shussin|откуда ты|откуда вы|где ты живёшь|где вы живёте|в каком городе|из какого города|de onde você é|onde você mora|qual cidade)/i.test(lower)
  ) {
    return "question_origin";
  }

  // 3. Pergunta sobre como o tutor está
  if (
    /(how are you|how's it going|how are things|how do you feel|wie geht('s| es dir| es ihnen)|alles gut|wie steht's|cómo estás|como estas|qué tal|que tal|cómo te va|come stai|come va|tutto bene|comment vas-tu|comment allez-vous|ça va|ca va|o-?genki desu ka|genki\?|как дела|как поживаешь|как поживаете|как жизнь|как твои дела|como vai|como você está|tudo bem com você)/i.test(lower)
  ) {
    return "question_how_are_you";
  }

  // 4. Pergunta sobre gostos / comidas / preferências do tutor
  if (
    /(what do you like|what's your favorite|do you like|what are your hobbies|was magst du|was ist dein lieblings|magst du|qué te gusta|cuál es tu favorito|te gusta|cuáles son tus gustos|cosa ti piace|qual è il tuo preferito|ti piace|qu'est-ce que tu aimes|quel est ton préféré|tu aimes|nani ga suki|suki desu ka|что ты любишь|что вы любите|твой любимый|ваша любимая|тебе нравится|o que você gosta|qual seu favorito|você gosta)/i.test(lower)
  ) {
    return "question_taste";
  }

  // 5. Cansaço / Exaustão
  if (
    /\b(tired|exhausted|sleepy|drained|long day|hard day|müde|erschöpft|anstrengend|cansado|cansada|agotado|agotada|stanco|stanca|esausto|esausta|fatigué|fatiguée|épuisé|épuisée|tsukareta|nemui)\b/i.test(lower) ||
    /(устал|устала|утомился|утомилась|тяжёлый день|хочу спать)/i.test(lower)
  ) {
    return "feeling_tired";
  }

  // 6. Alegria / Ótimo humor
  if (
    /\b(happy|glad|great|awesome|wonderful|amazing|excited|glücklich|froh|toll|super|wunderbar|feliz|contento|contenta|alegre|genial|felice|meraviglioso|fantastico|heureux|heureuse|content|contente|ravi|ravie|ureshii|tanoshii)\b/i.test(lower) ||
    /(рад|рада|счастлив|счастлива|отлично|прекрасно|замечательно)/i.test(lower)
  ) {
    return "feeling_happy";
  }

  // 7. Doente / Não se sentindo bem
  if (
    /\b(sick|ill|headache|fever|pain|hurt|stomachache|krank|kopfschmerzen|fieber|schmerzen|enfermo|enferma|dolor|fiebre|malato|malata|mal di testa|malade|fièvre|byouki|kaze)\b/i.test(lower) ||
    /(болен|болею|болит голова|простуда|температура|плохо себя чувствую)/i.test(lower)
  ) {
    return "feeling_sick";
  }

  // 8. Tópico de Comida e Bebidas
  if (
    /\b(coffee|tea|water|bread|pizza|pasta|breakfast|lunch|dinner|eat|drink|food|restaurant|snack|kaffee|tee|wasser|brot|brezel|frühstück|mittagessen|abendessen|essen|trinken|café|cafe|té|te|agua|pan|desayuno|almuerzo|cena|comer|beber|comida|tapas|caffè|cappuccino|acqua|pane|pranzo|croissant|baguette|pain|déjeuner|dîner|manger|boire|tabemono|nomimono|kohi|ocha)\b/i.test(lower) ||
    /(еда|чай|кофе|вода|хлеб|борщ|блины|пельмени|завтрак|обед|ужин|кушать|пить|ресторан)/i.test(lower)
  ) {
    return "topic_food";
  }

  // 9. Tópico de Viagens
  if (
    /\b(travel|trip|vacation|flight|airport|hotel|beach|reisen|reise|urlaub|flug|flughafen|strand|viajar|viaje|vacaciones|vuelo|aeropuerto|hotel|playa|viaggiare|viaggio|vacanza|albergo|voyager|voyage|vacances|vol|hôtel|ryokou|hikouki)\b/i.test(lower) ||
    /(путешествие|путешествовать|поездка|отпуск|самолёт|аэропорт|отель|билет|туризм)/i.test(lower)
  ) {
    return "topic_travel";
  }

  // 10. Tópico de Trabalho / Estudos
  if (
    /\b(work|job|office|career|boss|meeting|project|study|company|arbeit|arbeiten|büro|chef|trabajo|trabajar|oficina|jefe|reunión|reunion|proyecto|lavoro|lavorare|ufficio|travail|travailler|bureau|shigoto|kaisha)\b/i.test(lower) ||
    /(работа|работать|офис|начальник|совещание|проект|компания|дела|занятия)/i.test(lower)
  ) {
    return "topic_work";
  }

  // 11. Tópico de Clima / Tempo
  if (
    /\b(weather|rain|raining|sunny|sun|snow|cold|hot|warm|windy|wetter|regen|sonne|schnee|kalt|heiß|tiempo|clima|lluvia|sol|nieve|frío|frio|calor|pioggia|sole|neve|freddo|caldo|météo|temps|pluie|soleil|froid|chaud|tenki|ame|hare|samui|atsui)\b/i.test(lower) ||
    /(погода|дождь|солнце|снег|холодно|холод|тепло|жарко|жара|ветер|мороз)/i.test(lower)
  ) {
    return "topic_weather";
  }

  // 12. Tópico de Aprendizado de Idioma
  if (
    /\b(learn|learning|study|studying|improve|practice|language|speak|lernen|üben|verbessern|sprache|sprechen|aprender|estudiar|mejorar|practicar|idioma|hablar|imparare|studiare|migliorare|praticare|lingua|parlare|apprendre|étudier|améliorer|pratiquer|benkyou|renshuu|manabu)\b/i.test(lower) ||
    /(учить|изучать|практиковать|язык|говорить|слова|произношение|урок)/i.test(lower)
  ) {
    return "topic_learning";
  }

  // 13. Confirmação / Concordância
  if (
    /\b(yes|yeah|yep|sure|absolutely|definitely|of course|i agree|ja|genau|sicher|natürlich|stimmt|sí|si|claro|por supuesto|totalmente|de acordo|certo|sicuramente|esatto|d'accordo|oui|ouais|absolument|bien sûr|hai|ee|sou desu)\b/i.test(lower) ||
    /(да|конечно|точно|именно|согласен|согласна|безусловно)/i.test(lower)
  ) {
    return "affirmation";
  }

  // 14. Negação / Discordância
  if (
    /\b(no|nope|not really|neither|never|nein|nicht wirklich|gar nicht|tampoco|para nada|en absoluto|mai|non credo|non|pas du tout|pas vraiment|iie|chigau|zenzen)\b/i.test(lower) ||
    /(нет|не совсем|вовсе нет|никогда|не думаю)/i.test(lower)
  ) {
    return "negation";
  }

  // 15. Agradecimento
  if (
    /\b(thank|thanks|thank you|appreciated|danke|vielen dank|dankeschön|gracias|muchas gracias|grazie|mille grazie|grazie mille|merci|merci beaucoup|arigatou|doumo|obrigado|obrigada|valeu)\b/i.test(lower) ||
    /(спасибо|большое спасибо|благодарю)/i.test(lower)
  ) {
    return "thanks";
  }

  // 16. Saudação inicial
  if (
    /^\s*(hello|hi|hey|good morning|good afternoon|good evening|hallo|guten tag|guten morgen|guten abend|hola|buenos días|buenas tardes|buenas|ciao|buongiorno|buonasera|salve|bonjour|salut|coucou|bonsoir|konnichiwa|ohayou|konbanwa|olá|ola|oi|bom dia|boa tarde|boa noite)\b/i.test(lower) ||
    /^\s*(привет|здравствуйте|здравствуй|доброе утро|добрый день|добрый вечер)\b/i.test(lower)
  ) {
    return "greeting";
  }

  return "general";
}

export function generateLocalTutorReply(
  userInput: string,
  activeTutor: TutorPersona,
  historyLen: number
): { replyText: string; translationPt: string } {
  const intent = classifyUserIntent(userInput, activeTutor.language);
  const lang = activeTutor.language;
  const lower = userInput.toLowerCase().trim();
  const seed = (historyLen * 3 + Math.abs(lower.length * 7 + (lower.charCodeAt(0) || 1))) % 6;

  // ================= 🇷🇺 RUSSO =================
  if (lang === "ru") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `Меня зовут ${activeTutor.name}! Я живу в городе ${activeTutor.city}. А как зовут тебя, мой друг?`,
          translationPt: `Meu nome é ${activeTutor.name}! Eu moro na cidade de ${activeTutor.city}. E como você se chama, meu amigo?`,
        };
      case "question_origin":
        return {
          replyText: `Я живу в ${activeTutor.city}, в России! Это великолепный город с потрясающей атмосферой и богатой историей. Ты когда-нибудь бывал в России?`,
          translationPt: `Eu moro em ${activeTutor.city}, na Rússia! É uma cidade magnífica com uma atmosfera incrível e rica história. Você já esteve na Rússia?`,
        };
      case "question_how_are_you":
        return {
          replyText: `У меня всё замечательно, спасибо за твою заботу! Всегда с огромной радостью практикую русский язык с тобой. А как твоё настроение сегодня?`,
          translationPt: `Comigo está tudo ótimo, obrigado pelo seu carinho! Sempre com imensa alegria pratico a língua russa com você. E como está seu ânimo hoje?`,
        };
      case "question_taste":
        return {
          replyText: `Я очень люблю горячий чай с лимоном, классическую музыку и долгие прогулки по красивым местам! А чем больше всего любишь заниматься ты?`,
          translationPt: `Eu amo muito chá quente com limão, música clássica e longas caminhadas por belos lugares! E do que você mais gosta de fazer?`,
        };
      case "question_museum_hours":
        return {
          replyText: `Главные музеи и Эрмитаж в ${activeTutor.city} обычно открыты с 11:00 до 18:00 (по средам и пятницам до 20:00)! Какая экспозиция тебя больше интересует: шедевры живописи или залы античности?`,
          translationPt: `Os principais museus e o Hermitage em ${activeTutor.city} costumam abrir das 11h às 18h (às quartas e sextas até as 20h)! Qual exposição te interessa mais: obras-primas da pintura ou salas da antiguidade?`,
        };
      case "question_directions":
        return {
          replyText: `Главный вокзал и станция метро находятся совсем рядом, буквально в пяти минутах ходьбы от центральной площади! Куда именно ты держишь путь сегодня?`,
          translationPt: `A estação principal e a estação de metrô ficam bem próximas, a literalmente cinco minutos a pé da praça central! Para onde exatamente você está a caminho hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `На ужин я от всей души рекомендую горячий борщ со сметаной, сочные сибирские пельмени и румяные пирожки! Ты любишь сытную согревающую кухню?`,
          translationPt: `Para o jantar recomendo de todo o coração um borsch quentinho com creme azedo, pelmenis siberianos suculentos e piroshkis douradinhos! Você gosta de culinária reforçada e reconfortante?`,
        };
      case "topic_weekend":
        return {
          replyText: `На выходных я обожаю гулять вдоль набережных, заглядывать в уютные книжные лавки и встречаться с друзьями за чаем. А как ты предпочитаешь проводить свободное время?`,
          translationPt: `Nos fins de semana adoro passear ao longo das margens, visitar pequenas livrarias e encontrar amigos para um chá. E como você prefere passar o tempo livre?`,
        };
      case "feeling_tired":
        return {
          replyText: `После насыщенного дня отдых просто необходим! Завари себе тёплый чай, и давай побеседуем спокойно и без малейшей спешки. Что помогло бы тебе расслабиться?`,
          translationPt: `Depois de um dia cheio o descanso é simplesmente necessário! Prepare um chá quente e vamos conversar com calma e sem nenhuma pressa. O que te ajudaria a relaxar?`,
        };
      case "feeling_happy":
        return {
          replyText: `Какая прекрасная новость! Твоя позитивная энергия передаётся даже через экран. Поделись, что именно сделало этот день таким замечательным?`,
          translationPt: `Que notícia maravilhosa! Sua energia positiva se transmite até através da tela. Compartilhe, o que exatamente fez este dia ser tão bom?`,
        };
      case "feeling_sick":
        return {
          replyText: `Обязательно береги себя! Пей больше тёплой воды с лимоном или мёдом и хорошенько отдохни. Здоровье превыше всего. Как твоё самочувствие прямо сейчас?`,
          translationPt: `Cuide-se muito bem! Beba mais água morna com limão ou mel e descanse bastante. A saúde está acima de tudo. Como você está se sentindo agora?`,
        };
      case "topic_food":
        return {
          replyText: `Русская кухня очень согревающая: наваристый борщ со сметаной, сытные пельмени и румяные блины! Какое блюдо тебе хотелось бы попробовать в первую очередь?`,
          translationPt: `A culinária russa é muito reconfortante: borsch caprichado com creme azedo, pelmeni bem recheado e blinis douradinhos! Que prato você gostaria de provar primeiro?`,
        };
      case "topic_travel":
        return {
          replyText: `Путешествия открывают совершенно новый мир! Например, поездка на поезде или прогулка по Красной площади — это незабываемо. В какую страну ты мечтаешь отправиться?`,
          translationPt: `Viagens abrem um mundo completamente novo! Por exemplo, uma viagem de trem ou um passeio pela Praça Vermelha é inesquecível. Para qual país você sonha ir?`,
        };
      case "topic_work":
        return {
          replyText: `Работа и повседневные дела требуют много сил. Очень важно делать паузы и хвалить себя за достижения. Как прошёл твой рабочий день сегодня?`,
          translationPt: `O trabalho e as tarefas do dia a dia exigem muitas energias. É muito importante fazer pausas e se parabenizar pelas conquistas. Como foi seu dia de trabalho hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `Погода в наших краях бывает очень переменчивой, поэтому чашка горячего напитка всегда к месту! А какая погода сейчас в твоём городе?`,
          translationPt: `O clima por aqui costuma ser bem variável, por isso uma xícara de bebida quente cai sempre bem! E como está o tempo agora na sua cidade?`,
        };
      case "topic_learning":
        return {
          replyText: `Изучать русский язык — это увлекательное путешествие! Кириллица и правильные звуки быстро станут привычными. Что в русском языке тебе кажется самым интересным?`,
          translationPt: `Estudar a língua russa é uma jornada fascinante! O cirílico e os sons corretos logo se tornarão familiares. O que no russo você acha mais interessante?`,
        };
      case "affirmation":
        return {
          replyText: `Прекрасно! Я полностью разделяю твою точку зрения. Давай сделаем следующий шаг в нашей беседе — о чём продолжим?`,
          translationPt: `Maravilha! Compartilho totalmente do seu ponto de vista. Vamos dar o próximo passo em nossa conversa — sobre o que continuaremos?`,
        };
      case "negation":
        return {
          replyText: `Понимаю тебя, никаких проблем! Разные взгляды делают диалог живым и интересным. А как ты обычно предпочитаешь действовать?`,
          translationPt: `Eu te entendo, sem problema algum! Diferentes visões tornam o diálogo vivo e interessante. E como você normalmente prefere agir?`,
        };
      case "thanks":
        return {
          replyText: `Всегда пожалуйста! Для меня огромная радость быть твоим наставником. Ты задаёшь отличные вопросы. Что бы ты хотел узнать дальше?`,
          translationPt: `De nada! Para mim é uma imensa alegria ser seu tutor. Você faz ótimas perguntas. O que você gostaria de saber a seguir?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `Здравствуйте! Очень рад нашей встрече. Я ${activeTutor.name} из ${activeTutor.city}. Как твои дела сегодня?`,
              translationPt: `Olá! Muito feliz com nosso encontro. Eu sou ${activeTutor.name} de ${activeTutor.city}. Como vão suas coisas hoje?`,
            }
          : {
              replyText: `Привет ещё раз! Здорово, что мы продолжаем практиковаться. О чём ты сейчас думаешь?`,
              translationPt: `Olá novamente! Que ótimo que estamos continuando a praticar. No que você está pensando agora?`,
            };
      default: {
        const ruOptions = [
          {
            replyText: `Интересная мысль! Русский язык очень выразительный. Что именно навело тебя на эти размышления?`,
            translationPt: `Pensamento interessante! A língua russa é muito expressiva. O que exatamente te levou a essas reflexões?`,
          },
          {
            replyText: `Ты формулируешь мысли всё более уверенно! Расскажи, как ты обычно любишь проводить свободные вечера?`,
            translationPt: `Você está formulando ideias com cada vez mais confiança! Conte, como você normalmente gosta de passar suas noites livres?`,
          },
          {
            replyText: `Каждый шаг в практике приближает тебя к свободной речи. Хочешь разобрать новые слова или продолжить этот диалог?`,
            translationPt: `Cada passo na prática te aproxima da fala fluente. Quer explorar palavras novas ou continuar este diálogo?`,
          },
          {
            replyText: `Очень любопытно! А как обычно устроен твой день: ты любишь просыпаться пораньше или предпочитаешь вечер?`,
            translationPt: `Muito curioso! E como costuma ser seu dia: você gosta de acordar mais cedo ou prefere a noite?`,
          },
          {
            replyText: `Твоя речь звучит всё более естественно! Какая тема для беседы кажется тебе сейчас самой увлекательной?`,
            translationPt: `Sua fala está soando cada vez mais natural! Que tema de conversa te parece mais empolgante agora?`,
          },
          {
            replyText: `Здорово, что мы можем так открыто общаться на русском языке. Что интересного произошло у тебя за последнее время?`,
            translationPt: `Que ótimo podermos nos comunicar tão abertamente em russo. O que aconteceu de interessante com você nos últimos tempos?`,
          },
        ];
        return ruOptions[seed % ruOptions.length]!;
      }
    }
  }

  // ================= 🇩🇪 ALEMÃO =================
  if (lang === "de") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `Ich heiße ${activeTutor.name}! Ich lebe in ${activeTutor.city} und begleite dich mit großer Freude beim Deutschlernen. Und wie heißt du?`,
          translationPt: `Eu me chamo ${activeTutor.name}! Moro em ${activeTutor.city} e te acompanho com grande alegria no aprendizado de alemão. E como você se chama?`,
        };
      case "question_origin":
        return {
          replyText: `Ich lebe in ${activeTutor.city}, Deutschland! Eine wunderschöne Stadt voller Parks, Kultur und charmanter Cafés. Warst du schon mal hier?`,
          translationPt: `Eu moro em ${activeTutor.city}, na Alemanha! Uma cidade linda cheia de parques, cultura e cafés charmosos. Você já esteve aqui?`,
        };
      case "question_how_are_you":
        return {
          replyText: `Mir geht es fantastisch, vielen Dank der Nachfrage! Ich habe jede Menge Energie und freue mich auf unser Gespräch. Wie geht es dir heute?`,
          translationPt: `Estou fantástico, muito obrigado por perguntar! Tenho muita energia e estou animado para nossa conversa. Como você está hoje?`,
        };
      case "question_taste":
        return {
          replyText: `Ich liebe einen guten Filterkaffee am Morgen, Spaziergänge an der frischen Luft und spannende Bücher! Und was machst du am liebsten in deiner Freizeit?`,
          translationPt: `Eu amo um bom café passado pela manhã, caminhadas ao ar livre e livros empolgantes! E o que você mais gosta de fazer no seu tempo livre?`,
        };
      case "question_museum_hours":
        return {
          replyText: `Die Museen hier in ${activeTutor.city} öffnen meistens von 10:00 bis 18:00 Uhr (donnerstags oft bis 20:00 Uhr)! Interessierst du dich eher für historische Exponate oder moderne Kunst?`,
          translationPt: `Os museus aqui em ${activeTutor.city} abrem na maioria das 10h às 18h (às quintas frequentemente até às 20h)! Você se interessa mais por peças históricas ou arte moderna?`,
        };
      case "question_directions":
        return {
          replyText: `Der Hauptbahnhof und die nächste U-Bahn-Station liegen ganz zentral, nur wenige Gehminuten entfernt! Wo möchtest du heute genau hin?`,
          translationPt: `A estação central e a próxima estação de metrô ficam bem no centro, a poucos minutos a pé de distância! Para onde exatamente você quer ir hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `Für heute Abend empfehle ich dir ein knuspriges Schnitzel mit Bratkartoffeln oder eine feine Spätzle-Pfanne, dazu ein erfrischendes Getränk! Magst du herzhaftes Essen?`,
          translationPt: `Para esta noite recomendo um schnitzel crocante com batatas assadas ou uma frigideira saborosa de Spätzle, acompanhado de uma bebida refrescante! Você gosta de comida saborosa e encorpada?`,
        };
      case "topic_weekend":
        return {
          replyText: `Am Wochenende mache ich gerne lange Radtouren durch die grünen Parks, trinke Kaffee und lese entspannt. Wie verbringst du deine freien Tage am liebsten?`,
          translationPt: `No fim de semana gosto de fazer longos passeios de bicicleta pelos parques verdes, tomar café e ler relaxado. Como você prefere passar seus dias livres?`,
        };
      case "feeling_tired":
        return {
          replyText: `Ein langer Tag kann wirklich anstrengend sein! Mach es dir gemütlich und nimm dir Zeit zum Durchatmen. Was hilft dir am besten, um abends abzuschalten?`,
          translationPt: `Um dia longo pode ser muito cansativo! Fique à vontade e respire fundo. O que mais te ajuda a desligar a cabeça à noite?`,
        };
      case "feeling_happy":
        return {
          replyText: `Das ist ja wunderbar zu hören! Gute Laune ist die beste Zutat für erfolgreiches Lernen. Was hat deinen Tag heute so erfreulich gemacht?`,
          translationPt: `Isso é maravilhoso de ouvir! Bom humor é o melhor ingrediente para um aprendizado de sucesso. O que tornou seu dia tão agradável hoje?`,
        };
      case "feeling_sick":
        return {
          replyText: `Oh je, dann pass bitte gut auf dich auf und kurier dich aus! Trink viel warmen Tee und ruh dich aus. Wie fühlst du dich gerade im Moment?`,
          translationPt: `Puxa, então por favor cuide bem de você e descanse! Beba bastante chá quente e repouse. Como você está se sentindo agora no momento?`,
        };
      case "topic_food":
        return {
          replyText: `Ein frisch gebrühter Kaffee und eine ofenfrische Brezel sind einfach unschlagbar! Was isst oder trinkst du morgens am liebsten?`,
          translationPt: `Um café recém-passado e um pretzel quentinho saído do forno são simplesmente imbatíveis! O que você prefere comer ou beber de manhã?`,
        };
      case "topic_travel":
        return {
          replyText: `Reisen erweitert den Horizont ungemein! Ob eine Städtetour oder eine Wanderung in den Bergen — jede Reise inspiriert. Wohin möchtest du als Nächstes reisen?`,
          translationPt: `Viajar expande imensamente os horizontes! Seja um passeio pela cidade ou uma trilha nas montanhas — toda viagem inspira. Para onde você quer viajar em seguida?`,
        };
      case "topic_work":
        return {
          replyText: `Die Arbeit nimmt oft viel Raum ein, umso wichtiger sind kleine Momente der Erholung. Wie war dein Arbeitstag heute?`,
          translationPt: `O trabalho costuma ocupar muito espaço, por isso pequenos momentos de descanso são tão importantes. Como foi seu dia de trabalho hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `Das Wetter hat einen großen Einfluss auf unsere Stimmung! Wie ist das Wetter heute bei dir: scheint die Sonne oder regnet es?`,
          translationPt: `O clima tem uma grande influência no nosso humor! Como está o tempo hoje onde você mora: está ensolarado ou chovendo?`,
        };
      case "topic_learning":
        return {
          replyText: `Deutsch zu lernen ist ein fantastisches Ziel! Schon 10 Minuten tägliche Übung machen einen riesigen Unterschied. Worauf möchtest du dich heute konzentrieren?`,
          translationPt: `Aprender alemão é um objetivo fantástico! Apenas 10 minutos de prática diária já fazem uma enorme diferença. No que você gostaria de focar hoje?`,
        };
      case "affirmation":
        return {
          replyText: `Absolut, da stimme ich dir vollkommen zu! Das bringt uns zum nächsten Punkt: Was denkst du über dieses Thema?`,
          translationPt: `Com certeza, concordo plenamente com você! Isso nos leva ao próximo ponto: o que você pensa sobre esse assunto?`,
        };
      case "negation":
        return {
          replyText: `Verstehe ich gut! Man muss nicht allem zustimmen, andere Blickwinkel sind immer spannend. Wie siehst du die Sache stattdessen?`,
          translationPt: `Entendo perfeitamente! Não precisamos concordar com tudo, outros pontos de vista são sempre fascinantes. Como você vê a questão em vez disso?`,
        };
      case "thanks":
        return {
          replyText: `Sehr gerne! Genau dafür bin ich da, um dich Schritt für Schritt zu unterstützen. Welche Frage liegt dir noch auf dem Herzen?`,
          translationPt: `De nada! É exatamente para isso que estou aqui, para te apoiar passo a passo. Que outra pergunta você tem no coração?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `Hallo! Herzlich willkommen! Ich bin ${activeTutor.name} aus ${activeTutor.city}. Wie geht es dir heute?`,
              translationPt: `Olá! Boas-vindas! Eu sou ${activeTutor.name} de ${activeTutor.city}. Como você está hoje?`,
            }
          : {
              replyText: `Hallo nochmals! Schön, dass wir weiter Deutsch üben. Woran denkst du gerade?`,
              translationPt: `Olá novamente! Que bom continuarmos praticando alemão. No que você está pensando agora?`,
            };
      default: {
        const deOptions = [
          {
            replyText: `Das ist wirklich ein interessanter Gedanke! Was hat dich heute darauf gebracht?`,
            translationPt: `Esse é realmente um pensamento interessante! O que te fez pensar nisso hoje?`,
          },
          {
            replyText: `Du drückst dich schon richtig gut aus! Wie verbringst du normalerweise deine Abende?`,
            translationPt: `Você já está se expressando muito bem! Como você costuma passar suas noites?`,
          },
          {
            replyText: `Schritt für Schritt wird dein Deutsch immer sicherer. Möchtest du neue Wörter lernen oder freier plaudern?`,
            translationPt: `Passo a passo o seu alemão está ficando cada vez mais seguro. Quer aprender palavras novas ou bater um papo mais livre?`,
          },
          {
            replyText: `Sehr spannend! Wie sieht deine gewohnte Morgenroutine vor der Arbeit aus?`,
            translationPt: `Muito empolgante! Como é a sua rotina matinal habitual antes do trabalho?`,
          },
          {
            replyText: `Das klingt schon sehr flüssig! Welches Thema liegt dir beim Deutschsprechen am meisten am Herzen?`,
            translationPt: `Isso já soa muito fluente! Qual assunto é mais importante para você ao falar alemão?`,
          },
          {
            replyText: `Toll, wie wir uns auf Deutsch unterhalten können! Was war das Beste an deiner Woche?`,
            translationPt: `Incrível como conseguimos conversar em alemão! Qual foi a melhor coisa da sua semana?`,
          },
        ];
        return deOptions[seed % deOptions.length]!;
      }
    }
  }

  // ================= 🇪🇸 ESPANHOL =================
  if (lang === "es") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `¡Me llamo ${activeTutor.name}! Vivo en ${activeTutor.city} y estoy encantado de charlar contigo en español. ¿Y tú, cómo te llamas?`,
          translationPt: `Meu nome é ${activeTutor.name}! Moro em ${activeTutor.city} e estou encantado em conversar com você em espanhol. E você, como se chama?`,
        };
      case "question_origin":
        return {
          replyText: `¡Vivo en ${activeTutor.city}, en España! Es una ciudad con una energía vibrante, plazas hermosas y comida increíble. ¿Has viajado alguna vez a España?`,
          translationPt: `Eu moro em ${activeTutor.city}, na Espanha! É uma cidade com energia vibrante, praças lindas e comida incrível. Você já viajou para a Espanha?`,
        };
      case "question_how_are_you":
        return {
          replyText: `¡Estoy genial, muchísimas gracias por preguntar! Con toda la energía para compartir este rato contigo. ¿Y tú, qué tal te encuentras hoy?`,
          translationPt: `Estou ótimo, muitíssimo obrigado por perguntar! Com toda a energia para compartilhar este momento com você. E você, como está se sentindo hoje?`,
        };
      case "question_taste":
        return {
          replyText: `¡Me encantan las tapas al atardecer, un café con leche bien caliente y la buena música! ¿Y a ti, qué cosas te apasiona hacer cuando tienes tiempo libre?`,
          translationPt: `Eu amo umas tapas ao entardecer, um café com leite bem quentinho e boa música! E você, o que gosta de fazer quando tem tempo livre?`,
        };
      case "question_museum_hours":
        return {
          replyText: `Los museos principales aquí en ${activeTutor.city} abren habitualmente de 10:00 a 20:00 (los domingos hasta las 19:00)! Además, las dos últimas horas suele haber entrada gratuita. ¿Prefieres la pintura clásica o las salas de arte moderno?`,
          translationPt: `Os museus principais aqui em ${activeTutor.city} abrem habitualmente das 10h às 20h (aos domingos até as 19h)! Além disso, as duas últimas horas costumam ter entrada gratuita. Você prefere pintura clássica ou salas de arte moderna?`,
        };
      case "question_directions":
        return {
          replyText: `¡La estación principal y la boca de metro están a solo unos minutos a pie desde el centro! Tienes conexiones rápidas cada cinco minutos. ¿Hacia dónde te diriges hoy?`,
          translationPt: `A estação principal e a entrada do metrô estão a apenas alguns minutos a pé do centro! Tem conexões rápidas a cada cinco minutos. Para onde você está indo hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `¡Sin dudarlo, te recomiendo unas tapas variadas: tortilla de patatas jugosa, jamón ibérico y croquetas caseras! Para el postre, unos churros con chocolate caliente. ¿Prefieres tapear o cenar sentado con calma?`,
          translationPt: `Sem pensar duas vezes, te recomendo tapas variadas: tortilla de batatas suculenta, presunto ibérico e croquetes caseiros! De sobremesa, churros com chocolate quente. Você prefere petiscar ou jantar sentado com calma?`,
        };
      case "topic_weekend":
        return {
          replyText: `Los fines de semana me fascina pasear por las plazas históricas, tomar un café al sol en una terraza y charlar con amigos. ¿Qué sueles hacer tú en tus días libres?`,
          translationPt: `Nos fins de semana me fascina passear pelas praças históricas, tomar um café ao sol numa varanda e bater papo com amigos. O que você costuma fazer nos seus dias livres?`,
        };
      case "feeling_tired":
        return {
          replyText: `¡Te entiendo de maravilla! Hay días en los que el cuerpo solo pide sofá y desconexión. Vamos a charlar con calma y sin prisas. ¿Qué sueles hacer para recargar pilas?`,
          translationPt: `Te entendo perfeitamente! Tem dias em que o corpo só pede sofá e descanso. Vamos conversar com calma e sem pressa. O que você costuma fazer para recarregar as energias?`,
        };
      case "feeling_happy":
        return {
          replyText: `¡Qué alegría tan grande leer eso! La buena energía se contagia enseguida y hace que aprender español sea un placer. ¿Qué hizo que tu día fuera tan especial?`,
          translationPt: `Que alegria tão grande ler isso! A boa energia contagia na hora e faz aprender espanhol ser um prazer. O que fez seu dia ser tão especial?`,
        };
      case "feeling_sick":
        return {
          replyText: `¡Vaya, cuídate mucho por favor! La salud es siempre lo primero. Descansa, bebe mucha agua y tómate las cosas con tranquilidad. ¿Cómo te vas sintiendo ahora?`,
          translationPt: `Puxa, cuide-se muito por favor! A saúde é sempre o primeiro. Descanse, beba bastante água e encare as coisas com tranquilidade. Como você está se sentindo agora?`,
        };
      case "topic_food":
        return {
          replyText: `¡La comida siempre alegra el alma! Un buen café con churros o unas tapas en una terraza son insuperables. ¿Prefieres la comida dulce o salada?`,
          translationPt: `A comida sempre alegra a alma! Um bom café com churros ou umas tapas numa mesa ao ar livre são insuperáveis. Você prefere comida doce ou salgada?`,
        };
      case "topic_travel":
        return {
          replyText: `¡Viajar es una de las experiencias más enriquecedoras de la vida! Conocer nuevas culturas y practicar el idioma abre la mente. ¿Cuál es tu próximo destino soñado?`,
          translationPt: `Viajar é uma das experiências mais enriquecedoras da vida! Conhecer novas culturas e praticar o idioma abre a mente. Qual é o seu próximo destino dos sonhos?`,
        };
      case "topic_work":
        return {
          replyText: `El trabajo a veces puede ser intenso, por eso es tan importante valorar los pequeños logros cotidianos. ¿Cómo marcha tu jornada hoy?`,
          translationPt: `O trabalho às vezes pode ser intenso, por isso é tão importante valorizar as pequenas conquistas cotidianas. Como está indo seu dia hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `¡El clima marca el ritmo de cada día! Por aquí nos encanta salir a la calle cuando hace sol. ¿Qué tiempo hace hoy en tu ciudad?`,
          translationPt: `O clima dita o ritmo de cada dia! Por aqui adoramos sair à rua quando faz sol. Que tempo está fazendo hoje na sua cidade?`,
        };
      case "topic_learning":
        return {
          replyText: `¡Aprender español con constancia es el mejor camino! No tengas miedo de cometer errores, son pasos naturales. ¿Prefieres practicar vocabulario o conversación libre?`,
          translationPt: `Aprender espanhol com constância é o melhor caminho! Não tenha medo de cometer erros, são passos naturais. Você prefere praticar vocabulário ou conversação livre?`,
        };
      case "affirmation":
        return {
          replyText: `¡Exactamente, tienes toda la razón! Me alegra ver que coincidimos. ¿Cómo te gustaría profundizar más en esta idea?`,
          translationPt: `Exatamente, você tem toda a razão! Fico feliz em ver que concordamos. Como você gostaria de aprofundar mais essa ideia?`,
        };
      case "negation":
        return {
          replyText: `¡Totalmente comprensible! Es muy enriquecedor escuchar diferentes puntos de vista. ¿Cómo lo enfocarías tú?`,
          translationPt: `Totalmente compreensível! É muito enriquecedor ouvir diferentes pontos de vista. Como você abordaria isso?`,
        };
      case "thanks":
        return {
          replyText: `¡De nada, amigo mío! Es un auténtico placer acompañarte. Siempre que tengas dudas, dímelo con total confianza. ¿Seguimos?`,
          translationPt: `De nada, meu amigo! É um prazer autêntico te acompanhar. Sempre que tiver dúvidas, fale com total confiança. Vamos continuar?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `¡Hola! Qué gusto saludarte. Me llamo ${activeTutor.name} de ${activeTutor.city}. ¿Cómo te encuentras hoy?`,
              translationPt: `Olá! Que prazer te cumprimentar. Meu nome é ${activeTutor.name} de ${activeTutor.city}. Como você se encontra hoje?`,
            }
          : {
              replyText: `¡Hola de nuevo! Qué bien seguir charlando en español. ¿De qué te apetece hablar ahora?`,
              translationPt: `Olá de novo! Que bom continuar conversando em espanhol. Sobre o que você tem vontade de falar agora?`,
            };
      default: {
        const esOptions = [
          {
            replyText: `¡Eso es muy interesante! ¿Qué te llevó a pensar en eso el día de hoy?`,
            translationPt: `Isso é muito interessante! O que te levou a pensar nisso no dia de hoje?`,
          },
          {
            replyText: `Te estás expresando con mucha soltura. ¿Qué sueles hacer los fines de semana para disfrutar?`,
            translationPt: `Você está se expressando com muita naturalidade. O que você costuma fazer nos finais de semana para curtir?`,
          },
          {
            replyText: `Paso a paso tu confianza al hablar español se nota más. ¿Quieres explorar un nuevo tema o seguir con este?`,
            translationPt: `Passo a passo sua confiança ao falar espanhol fica mais evidente. Quer explorar um novo assunto ou continuar com este?`,
          },
          {
            replyText: `¡Qué buena observación! ¿Cómo funciona eso habitualmente en tu rutina diaria?`,
            translationPt: `Que boa observação! Como isso costuma funcionar na sua rotina diária?`,
          },
          {
            replyText: `Tu español suena cada vez más natural. ¿Cuál ha sido el mejor momento de tu semana?`,
            translationPt: `Seu espanhol soa cada vez mais natural. Qual foi o melhor momento da sua semana?`,
          },
          {
            replyText: `Me encanta charlar contigo. Si pudieras hacer cualquier plan este fin de semana, ¿cuál sería?`,
            translationPt: `Adoro conversar com você. Se pudesse fazer qualquer plano neste fim de semana, qual seria?`,
          },
        ];
        return esOptions[seed % esOptions.length]!;
      }
    }
  }

  // ================= 🇮🇹 ITALIANO =================
  if (lang === "it") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `Mi chiamo ${activeTutor.name}! Vivo a ${activeTutor.city} e amo condividere la bellezza della lingua italiana. E tu, come ti chiami?`,
          translationPt: `Eu me chamo ${activeTutor.name}! Moro em ${activeTutor.city} e amo compartilhar a beleza da língua italiana. E você, como se chama?`,
        };
      case "question_origin":
        return {
          replyText: `Vivo a ${activeTutor.city}, in Italia! Una città ricca di arte, storia e profumi indimenticabili. Sei mai stato in Italia o vorresti visitarla presto?`,
          translationPt: `Eu moro em ${activeTutor.city}, na Itália! Uma cidade rica em arte, história e aromas inesquecíveis. Você já esteve na Itália ou gostaria de visitá-la em breve?`,
        };
      case "question_how_are_you":
        return {
          replyText: `Sto benissimo, grazie di cuore per avermelo chiesto! Sempre felice di fare due chiacchiere in italiano con te. Come va la tua giornata?`,
          translationPt: `Estou muito bem, de coração obrigado por perguntar! Sempre feliz em bater um papo em italiano com você. Como vai o seu dia?`,
        };
      case "question_taste":
        return {
          replyText: `Adoro un buon caffè espresso al banco, una pizza appena sfornata e le passeggiate per i vicoli storici! E a te, cosa piace di più nel tempo libero?`,
          translationPt: `Eu adoro um bom café espresso no balcão, uma pizza quentinha recém-saída do forno e passeios pelas ruelas históricas! E você, o que mais gosta de fazer no tempo livre?`,
        };
      case "question_museum_hours":
        return {
          replyText: `I musei principali qui a ${activeTutor.city} aprono normalmente dalle 08:30 alle 19:30 (chiusi il lunedì)! Ti affascinano di più i capolavori del Rinascimento o i reperti archeologici?`,
          translationPt: `Os museus principais aqui em ${activeTutor.city} abrem normalmente das 08h30 às 19h30 (fechados às segundas-feiras)! Te fascinam mais as obras-primas do Renascimento ou os achados arqueológicos?`,
        };
      case "question_directions":
        return {
          replyText: `La stazione centrale e la fermata della metropolitana sono vicinissime al centro, raggiungibili a piedi in pochissimi minuti! Dove hai intenzione di andare oggi?`,
          translationPt: `A estação central e o ponto de metrô são pertinho do centro, acessíveis a pé em pouquíssimos minutos! Onde você pretende ir hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `Per cena ti consiglio assolutamente un bel piatto di pasta fresca al dente, come una carbonara autentica o delle tagliatelle ai funghi, e per finire un tiramisù fatto in casa! Ti piace la cucina tipica italiana?`,
          translationPt: `Para o jantar recomendo absolutamente um belo prato de massa fresca al dente, como uma carbonara autêntica ou tagliatelle com cogumelos, e para finalizar um tiramisù caseiro! Você gosta da comida típica italiana?`,
        };
      case "topic_weekend":
        return {
          replyText: `Nel fine settimana adoro passeggiare per le piazze, fermarmi al bar per un caffè e godermi l'arte e l'atmosfera all'aperto. Come trascorri di solito il tuo tempo libero?`,
          translationPt: `No fim de semana adoro passear pelas praças, parar no bar para um café e curtir a arte e a atmosfera ao ar livre. Como você costuma passar seu tempo livre?`,
        };
      case "feeling_tired":
        return {
          replyText: `Ti capisco perfettamente! Dopo una giornata intensa serve proprio un momento per ricaricarsi. Parliamo con calma e senza alcuna fretta. Cosa ti fa rilassare di più?`,
          translationPt: `Te entendo perfeitamente! Depois de um dia intenso precisamos mesmo de um momento para recarregar. Vamos conversar com calma e sem pressa alguma. O que mais te faz relaxar?`,
        };
      case "feeling_happy":
        return {
          replyText: `Che splendida notizia, mi fa davvero tanto piacere! L'entusiasmo è il miglior motore per imparare a parlare con scioltezza. Cosa ha reso speciale la tua giornata?`,
          translationPt: `Que esplêndida notícia, fico muito feliz de verdade! O entusiasmo é o melhor motor para aprender a falar com naturalidade. O que tornou seu dia especial?`,
        };
      case "feeling_sick":
        return {
          replyText: `Mi dispiace tanto, riguardati e prenditi tutto il riposo di cui hai bisogno! Una bella bevanda calda ti farà bene. Come ti senti in questo momento?`,
          translationPt: `Sinto muito, cuide-se e tire todo o descanso de que precisa! Uma boa bebida quente vai te fazer bem. Como você se sente neste momento?`,
        };
      case "topic_food":
        return {
          replyText: `La cucina italiana è pura poesia: pasta fresca, profumo di basilico e un buon espresso! Qual è il tuo piatto italiano preferito in assoluto?`,
          translationPt: `A culinária italiana é pura poesia: massa fresca, aroma de manjericão e um bom espresso! Qual é o seu prato italiano favorito absoluto?`,
        };
      case "topic_travel":
        return {
          replyText: `Viaggiare è meraviglioso! Dalle colline della Toscana alle spiagge del sud, ogni angolo ha la sua magia. Qual è il posto che sogni di visitare?`,
          translationPt: `Viajar é maravilhoso! Das colinas da Toscana às praias do sul, cada cantinho tem sua magia. Qual é o lugar que você sonha em visitar?`,
        };
      case "topic_work":
        return {
          replyText: `Il lavoro richiede sempre molto impegno, quindi è prezioso trovare dei momenti di pausa tutti per sé. Come stanno andando le tue attività oggi?`,
          translationPt: `O trabalho sempre exige bastante dedicação, por isso é precioso encontrar momentos de pausa só para si. Como estão indo suas atividades hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `Il tempo influisce tantissimo sull'umore di tutti noi! Da me oggi l'aria è piacevole. Che tempo fa nella tua città in queste ore?`,
          translationPt: `O tempo influencia demais no humor de todos nós! Por aqui hoje o ar está agradável. Que tempo está fazendo na sua cidade nestas horas?`,
        };
      case "topic_learning":
        return {
          replyText: `Imparare l'italiano è un viaggio appassionante! Con un po' di costanza ogni giorno i risultati arrivano subito. Su cosa preferisci concentrarti oggi?`,
          translationPt: `Aprender italiano é uma viagem apaixonante! Com um pouco de constância todo dia os resultados chegam logo. No que prefere focar hoje?`,
        };
      case "affirmation":
        return {
          replyText: `Perfetto, sono assolutamente d'accordo con te! Questa è una bella prospettiva. Da dove vorresti continuare?`,
          translationPt: `Perfeito, concordo absolutamente com você! Essa é uma bela perspectiva. Por onde gostaria de continuar?`,
        };
      case "negation":
        return {
          replyText: `Comprendo benissimo il tuo punto! Il bello del confronto è proprio scoprire opinioni diverse. Qual è la tua alternativa ideale?`,
          translationPt: `Compreendo muito bem seu ponto! A beleza da conversa é justamente descobrir opiniões diferentes. Qual é a sua alternativa ideal?`,
        };
      case "thanks":
        return {
          replyText: `Prego, è un vero piacere! Sono qui per aiutarti a sentirti sempre a tuo agio. Cos'altro ti incuriosisce?`,
          translationPt: `De nada, é um verdadeiro prazer! Estou aqui para te ajudar a se sentir sempre à vontade. O que mais te desperta curiosidade?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `Ciao! Che grandissimo piacere fare la tua conoscenza. Sono ${activeTutor.name} da ${activeTutor.city}. Come stai oggi?`,
              translationPt: `Olá! Que enorme prazer te conhecer. Eu sou ${activeTutor.name} de ${activeTutor.city}. Como você está hoje?`,
            }
          : {
              replyText: `Ciao di nuovo! Che bello proseguire la nostra chiacchierata in italiano. A cosa stai pensando in questo momento?`,
              translationPt: `Olá de novo! Que bom continuar nosso bate-papo em italiano. No que você está pensando neste momento?`,
            };
      default: {
        const itOptions = [
          {
            replyText: `È davvero una riflessione interessante! Cosa ti ha fatto venire in mente questo oggi?`,
            translationPt: `É realmente uma reflexão interessante! O que te fez lembrar disso hoje?`,
          },
          {
            replyText: `Ti esprimi già con molta chiarezza! Come ami trascorrere le tue serate libere?`,
            translationPt: `Você já se expressa com muita clareza! Como você gosta de passar suas noites livres?`,
          },
          {
            replyText: `Passo dopo passo il tuo italiano diventa più sicuro. Ti va di provare nuovi vocaboli o continuare a chiacchierare?`,
            translationPt: `Passo a passo seu italiano fica mais seguro. Tem vontade de testar vocabulário novo ou continuar conversando?`,
          },
          {
            replyText: `Molto curioso! Come si svolge di solito la tua tipica mattinata prima del lavoro?`,
            translationPt: `Muito curioso! Como costuma ser sua manhã típica antes do trabalho?`,
          },
          {
            replyText: `Il tuo accento e il ritmo stanno migliorando a vista d'occhio! Di cosa vorresti parlare adesso?`,
            translationPt: `Seu sotaque e ritmo estão melhorando a olhos vistos! Do que você gostaria de falar agora?`,
          },
          {
            replyText: `È sempre un piacere parlare con te. Qual è stata la cosa più bella successa in questa settimana?`,
            translationPt: `É sempre um prazer falar com você. Qual foi a coisa mais legal que aconteceu nesta semana?`,
          },
        ];
        return itOptions[seed % itOptions.length]!;
      }
    }
  }

  // ================= 🇫🇷 FRANCÊS =================
  if (lang === "fr") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `Je m'appelle ${activeTutor.name} ! J'habite à ${activeTutor.city} et je suis ravi d'échanger avec vous en français. Et vous, comment vous appelez-vous ?` ,
          translationPt: `Meu nome é ${activeTutor.name}! Moro em ${activeTutor.city} e estou encantado em conversar com você em francês. E você, como se chama?`,
        };
      case "question_origin":
        return {
          replyText: `J'habite à ${activeTutor.city}, en France ! C'est une ville magnifique avec une richesse culturelle exceptionnelle. Avez-vous déjà visité la France ?`,
          translationPt: `Eu moro em ${activeTutor.city}, na França! É uma cidade magnífica com uma riqueza cultural excepcional. Você já visitou a França?`,
        };
      case "question_how_are_you":
        return {
          replyText: `Je vais à merveille, merci infiniment de demander ! C'est toujours un grand plaisir de discuter avec vous. Et vous, comment se passe votre journée ?`,
          translationPt: `Vou às mil maravilhas, muito obrigado por perguntar! É sempre um grande prazer conversar com você. E você, como está sendo o seu dia?`,
        };
      case "question_taste":
        return {
          replyText: `J'adore savourer un bon café avec un croissant chaud le matin, lire et me promener dans les musées ! Et vous, qu'aimez-vous faire de votre temps libre ?`,
          translationPt: `Eu adoro saborear um bom café com um croissant quentinho pela manhã, ler e passear em museus! E você, o que gosta de fazer no seu tempo livre?`,
        };
      case "question_museum_hours":
        return {
          replyText: `Les musées renommés ici à ${activeTutor.city} ouvrent généralement de 09h00 à 18h00 (avec souvent des nocturnes jusqu'à 21h45) ! Préférez-vous admirer des sculptures classiques ou de l'art contemporain ?`,
          translationPt: `Os museus renomados aqui em ${activeTutor.city} abrem geralmente das 09h às 18h (frequentemente com horário noturno até às 21h45)! Você prefere admirar esculturas clássicas ou arte contemporânea?`,
        };
      case "question_directions":
        return {
          replyText: `La gare principale et la station de métro se trouvent en plein centre, à quelques minutes à pied seulement ! Vers quelle destination vous dirigez-vous aujourd'hui ?`,
          translationPt: `A estação principal e a estação de metrô ficam em pleno centro, a apenas alguns minutos a pé! Para qual destino você se dirige hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `Pour ce soir, je vous recommande vivement un délicieux bœuf bourguignon mijoté ou un confit de canard, avec une baguette fraîche et une mousse au chocolat ! Aimez-vous la cuisine traditionnelle française ?`,
          translationPt: `Para esta noite, recomendo fortemente um delicioso bœuf bourguignon ensopado ou um confit de pato, com uma baguete fresca e mousse de chocolate! Você gosta da culinária tradicional francesa?`,
        };
      case "topic_weekend":
        return {
          replyText: `Le week-end, j'adore flâner le long des quais, feuilleter des livres anciens et m'installer à la terrasse d'un bistrot animé. Comment aimez-vous occuper vos journées de repos ?`,
          translationPt: `No fim de semana, adoro passear pelas margens dos rios, folhear livros antigos e sentar na varanda de um bistrô animado. Como você gosta de ocupar seus dias de descanso?`,
        };
      case "feeling_tired":
        return {
          replyText: `Je vous comprends tout à fait ! Après une longue journée, le repos est primordial. Prenons notre temps pour discuter en douceur. Qu'est-ce qui vous détend le plus ?`,
          translationPt: `Eu compreendo você perfeitamente! Depois de um longo dia, o descanso é essencial. Vamos com calma conversar suavemente. O que mais te relaxa?`,
        };
      case "feeling_happy":
        return {
          replyText: `C'est une formidable nouvelle, cela me réjouit beaucoup ! La joie et l'enthousiasme rendent chaque conversation vivante. Qu'est-ce qui vous a mis de si bonne humeur ?`,
          translationPt: `Essa é uma notícia incrível, isso me alegra muito! A alegria e o entusiasmo tornam cada conversa viva. O que te colocou de tão bom humor?`,
        };
      case "feeling_sick":
        return {
          replyText: `Oh, prenez bien soin de vous surtout ! Reposez-vous, hydratez-vous avec une bonne infusion chaude. La santé passe en premier. Comment vous sentez-vous actuellement ?`,
          translationPt: `Oh, cuide muito bem de você acima de tudo! Repouse, hidrate-se com uma boa infusão quente. A saúde vem em primeiro lugar. Como você se sente no momento?`,
        };
      case "topic_food":
        return {
          replyText: `La gastronomie française est un véritable art de vivre : une baguette croustillante, de bons fromages et de délicieuses pâtisseries ! Quel est votre plat favori ?`,
          translationPt: `A gastronomia francesa é uma verdadeira arte de viver: uma baguete crocante, bons queijos e deliciosos doces! Qual é o seu prato favorito?`,
        };
      case "topic_travel":
        return {
          replyText: `Voyager permet d'ouvrir de nouveaux horizons et de vivre des expériences uniques ! Vers quelle destination aimeriez-vous vous envoler prochainement ?`,
          translationPt: `Viajar permite abrir novos horizontes e viver experiências únicas! Para qual destino você gostaria de voar em breve?`,
        };
      case "topic_work":
        return {
          replyText: `Le travail demande beaucoup d'énergie, alors ces moments d'échange et d'apprentissage sont précieux pour s'aérer l'esprit. Comment s'est passée votre journée ?`,
          translationPt: `O trabalho exige muita energia, então esses momentos de conversa e aprendizado são preciosos para arejar a mente. Como foi seu dia hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `Le temps influence souvent nos envies du moment ! Chez moi, l'atmosphère est très agréable aujourd'hui. Quel temps fait-il actuellement chez vous ?`,
          translationPt: `O tempo frequentemente influencia nossas vontades do momento! Onde estou a atmosfera está muito agradável hoje. Que tempo faz atualmente onde você mora?`,
        };
      case "topic_learning":
        return {
          replyText: `Apprendre le français est une aventure élégante et passionnante ! Pratiquer régulièrement en toute confiance est la clé. Sur quel aspect souhaitez-vous progresser ?`,
          translationPt: `Aprender francês é uma aventura elegante e apaixonante! Praticar com regularidade e confiança é a chave. Em qual aspecto você deseja evoluir?`,
        };
      case "affirmation":
        return {
          replyText: `Tout à fait, je partage entièrement votre avis ! C'est une excellente réflexion. De quoi souhaiteriez-vous parler ensuite ?`,
          translationPt: `Com certeza, compartilho inteiramente da sua opinião! É uma excelente reflexão. Sobre o que você gostaria de falar em seguida?`,
        };
      case "negation":
        return {
          replyText: `C'est parfaitement compréhensible ! La diversité des avis est ce qui enrichit le dialogue. Quelle est votre approche préférée ?`,
          translationPt: `É perfeitamente compreensível! A diversidade de opiniões é o que enriquece o diálogo. Qual é a sua abordagem preferida?`,
        };
      case "thanks":
        return {
          replyText: `Je vous en prie, c'est un réel plaisir ! Je suis là pour vous accompagner pas à pas en toute bienveillance. Avez-vous une autre question ?`,
          translationPt: `De nada, é um verdadeiro prazer! Estou aqui para te acompanhar passo a passo com todo carinho. Você tem alguma outra dúvida?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `Bonjour ! Quel grand plaisir d'échanger avec vous. Je suis ${activeTutor.name} de ${activeTutor.city}. Comment allez-vous aujourd'hui ?`,
              translationPt: `Bom dia! Que grande prazer conversar com você. Eu sou ${activeTutor.name} de ${activeTutor.city}. Como vai você hoje?`,
            }
          : {
              replyText: `Rebonjour ! C'est un réel plaisir de poursuivre notre échange en français. À quoi pensez-vous en ce moment ?`,
              translationPt: `Olá novamente! É um prazer continuar nossa conversa em francês. No que você está pensando neste momento?`,
            };
      default: {
        const frOptions = [
          {
            replyText: `C'est une réflexion tout à fait intéressante ! Qu'est-ce qui a inspiré cette pensée aujourd'hui ?`,
            translationPt: `É uma reflexão totalmente interessante! O que inspirou esse pensamento hoje?`,
          },
          {
            replyText: `Vous vous exprimez avec une belle clarté ! Comment aimez-vous occuper vos soirées libres ?`,
            translationPt: `Você está se expressando com muita clareza! Como gosta de passar suas noites livres?`,
          },
          {
            replyText: `Pas à pas, votre français devient plus naturel. Souhaitez-vous aborder du vocabulaire nouveau ou poursuivre cet échange ?`,
            translationPt: `Passo a passo seu francês fica mais natural. Gostaria de ver vocabulário novo ou continuar esta conversa?`,
          },
          {
            replyText: `C'est très curieux ! Comment se déroule habituellement votre routine matinale ?`,
            translationPt: `Isso é muito curioso! Como costuma ser sua rotina matinal?`,
          },
          {
            replyText: `Votre expression est de plus en plus fluide. Quel a été le meilleur moment de votre semaine ?`,
            translationPt: `Sua expressão está cada vez mais fluida. Qual foi o melhor momento da sua semana?`,
          },
          {
            replyText: `J'apprécie beaucoup notre discussion. Si vous aviez un week-end totalement libre, que feriez-vous ?`,
            translationPt: `Aprecio muito nossa conversa. Se tivesse um fim de semana totalmente livre, o que faria?`,
          },
        ];
        return frOptions[seed % frOptions.length]!;
      }
    }
  }

  // ================= 🇯🇵 JAPONÊS =================
  if (lang === "ja") {
    switch (intent) {
      case "question_name":
        return {
          replyText: `Watashi no namae wa ${activeTutor.name} desu! ${activeTutor.city} ni sunde imasu. Anata no o-namae wa nan desu ka?`,
          translationPt: `Meu nome é ${activeTutor.name}! Eu moro em ${activeTutor.city}. Qual é o seu nome?`,
        };
      case "question_origin":
        return {
          replyText: `Watashi wa ${activeTutor.city} ni sunde imasu! Totemo miryokuteki de suteki na machi desu yo. Nihon ni ryokou shita koto ga arimasu ka?`,
          translationPt: `Eu moro em ${activeTutor.city}! É uma cidade muito charmosa e maravilhosa. Você já viajou para o Japão?`,
        };
      case "question_how_are_you":
        return {
          replyText: `Totemo genki desu yo, kiite kurete arigatou gozaimasu! Issho ni Nihongo o renshuu dekite ureshii desu. Kyou wa donna hi deshita ka?`,
          translationPt: `Estou muito bem, obrigado por perguntar! Fico feliz em poder praticar japonês juntos. Como foi seu dia hoje?`,
        };
      case "question_taste":
        return {
          replyText: `Watashi wa oishii ramen ya matcha o tanoshimitari, ongaku o kiku no ga daisuki desu! Anata wa donna koto ga suki desu ka?`,
          translationPt: `Eu adoro saborear um ramen gostoso ou chá verde matcha, e ouvir música! E você, do que gosta?`,
        };
      case "question_museum_hours":
        return {
          replyText: `${activeTutor.city} no hakubutsukan wa tsuujou, asa 9-ji 30-fun kara yuugata 17-ji made aite imasu yo! Rekishi no tenji to gendai aato no dochira ga suki desu ka?`,
          translationPt: `Os museus em ${activeTutor.city} normalmente abrem das 9h30 da manhã até as 17h da tarde! Você prefere exposições históricas ou arte moderna?`,
        };
      case "question_directions":
        return {
          replyText: `Chuuou eki to chikatetsu no eki wa koko kara aruite sugu, yaku 5-fun hodo no basho ni arimasu yo! Kyou wa doko e ikimasu ka?`,
          translationPt: `A estação central e a estação de metrô ficam a poucos passos daqui, cerca de 5 minutos caminhando! Para onde você vai hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `Konya wa atatakai ramen ya shinsen na osushi, aruiwa atsuatsu no tempura ga osusume desu yo! Nihon ryouri wa osuki desu ka?`,
          translationPt: `Para esta noite recomendo um ramen quentinho, sushi fresquinho ou tempurá bem crocante! Você gosta de comida japonesa?`,
        };
      case "topic_weekend":
        return {
          replyText: `Shuumatsu wa teien o sanpo shitari, ocha o nonde yukkuri hon o yomu no ga daisuki desu. Anata no shuumatsu wa donna kanji desu ka?`,
          translationPt: `Nos fins de semana adoro passear por jardins, tomar um chá e ler livros com calma. Como costumam ser seus fins de semana?`,
        };
      case "feeling_tired":
        return {
          replyText: `Kyou mo ichinichi otsukaresama deshita! Muri o shinaide, atatakai ocha de mo nonde yukkuri hanashimashou. Rirakkusu dekimashita ka?`,
          translationPt: `Bom trabalho pelo dia de hoje! Não se sobrecarregue, tome um chá quentinho e vamos conversar com calma. Conseguiu relaxar?`,
        };
      case "feeling_happy":
        return {
          replyText: `Sore wa totemo subarashii desu ne! Watashi made ureshiku narimashita. Kyou wa nani ga sonna ni ii koto deshita ka?`,
          translationPt: `Isso é muito maravilhoso! Até eu fiquei feliz. O que aconteceu de tão bom hoje?`,
        };
      case "feeling_sick":
        return {
          replyText: `Daijoubu desu ka? Karada o ichiban ni taisetsu ni shite, yukkuri yasunde kudasai ne. Ima no guai wa ikaga desu ka?`,
          translationPt: `Você está bem? Coloque seu corpo em primeiro lugar e descanse bastante. Como está se sentindo agora?`,
        };
      case "topic_food":
        return {
          replyText: `Nihon no ryouri wa totemo oishii desu yo! Sushi, ramen, tempura nado... Anata ga tabete mitai ryouri wa nan desu ka?`,
          translationPt: `A comida japonesa é muito gostosa! Sushi, ramen, tempurá... Que prato você gostaria de experimentar?`,
        };
      case "topic_travel":
        return {
          replyText: `Ryokou wa atarashii hakken ga takusan atte tanoshii desu ne! Nihon no Kyoto ya Toukyou ni itte mitai desu ka?`,
          translationPt: `Viajar traz muitas novas descobertas e é muito divertido! Você gostaria de ir a Kyoto ou Tóquio no Japão?`,
        };
      case "topic_work":
        return {
          replyText: `O-shigoto wa taihen na koto mo ooi desu ga, chotto shita tasseikan ga ureshii desu ne. Kyou no o-shigoto wa dou deshita ka?`,
          translationPt: `O trabalho costuma ter muitas partes difíceis, mas uma pequena sensação de dever cumprido é ótima. Como foi seu trabalho hoje?`,
        };
      case "topic_weather":
        return {
          replyText: `Tenki ni yotte kibun mo kawarimasu ne! Kyou wa harete imasu ka, soretomo ame desu ka?`,
          translationPt: `O humor muda bastante de acordo com o tempo! Hoje está ensolarado ou está chovendo?`,
        };
      case "topic_learning":
        return {
          replyText: `Nihongo no benkyou wa totemo subarashii chousen desu! Mainichi sukoshizutsu hanaseba sugu jouzu ni narimasu yo. Nani o renshuu shitai desu ka?`,
          translationPt: `Estudar japonês é um desafio maravilhoso! Falando um pouquinho todo dia você melhora rapidinho. O que você gostaria de praticar?`,
        };
      case "affirmation":
        return {
          replyText: `Hai, sou desu ne! Watashi mo mattaku doukan desu. Tsugi wa donna koto ni tsuite hanashimashou ka?`,
          translationPt: `Sim, é isso mesmo! Concordo plenamente com você. Sobre o que vamos falar em seguida?`,
        };
      case "negation":
        return {
          replyText: `Naruhodo, wakarimashita! Iroiro na kangaekata ga aru no wa totemo ii koto desu. Anata nara dou shimasu ka?`,
          translationPt: `Entendi, faz sentido! Ter vários pontos de vista é algo muito bom. Se fosse você, como faria?`,
        };
      case "thanks":
        return {
          replyText: `Dou itashimashite! O-yaku ni tatete ureshii desu. Hoka ni mo ki ni naru koto wa arimasu ka?`,
          translationPt: `De nada! Fico feliz em poder ajudar. Tem alguma outra coisa que te chame atenção?`,
        };
      case "greeting":
        return historyLen <= 1
          ? {
              replyText: `Konnichiwa! Hajimemashite. Watashi wa ${activeTutor.name} desu. Issho ni tanoshiku Nihongo o hanashimashou!`,
              translationPt: `Olá! Muito prazer. Eu sou ${activeTutor.name}. Vamos conversar em japonês com alegria!`,
            }
          : {
              replyText: `Konnichiwa! Mata o-hanashi dekite ureshii desu. Ima nani o kangaete imasu ka?`,
              translationPt: `Olá! Fico feliz em conversarmos novamente. No que você está pensando agora?`,
            };
      default: {
        const jaOptions = [
          {
            replyText: `Sore wa totemo omoshiroi iken desu ne! Naze sou omotta no desu ka?`,
            translationPt: `Essa é uma opinião muito interessante! Por que você pensou nisso?`,
          },
          {
            replyText: `Dandan Nihongo ga jouzu ni natte kimashita ne! Yasumi no hi wa donna koto o shimasu ka?`,
            translationPt: `Aos poucos seu japonês está ficando muito bom! O que você faz nos dias de folga?`,
          },
          {
            replyText: `Ippo zutsu jishin ga tsuite kimashita yo. Atarashii kotoba o benkyou shimasu ka?`,
            translationPt: `Passo a passo você está ganhando confiança. Quer estudar palavras novas?`,
          },
          {
            replyText: `Kyoumi bukai desu! Fudan no asa no shuukan wa donna kanji desu ka?`,
            translationPt: `Muito interessante! Como costuma ser seu hábito matinal habitual?`,
          },
          {
            replyText: `Hatsuon mo totemo shizen ni kikoemasu yo! Ima ichiban kyoumi ga aru koto wa nan desu ka?`,
            translationPt: `Sua pronúncia também soa muito natural! O que mais te interessa no momento?`,
          },
          {
            replyText: `Issho ni Nihongo de hanasete tanoshii desu. Konshuu no ichiban ii dekigoto wa nan deshita ka?`,
            translationPt: `É divertido conversar em japonês juntos. Qual foi o melhor acontecimento desta semana?`,
          },
        ];
        return jaOptions[seed % jaOptions.length]!;
      }
    }
  }

  // ================= 🇬🇷 GREGO KOINÉ =================
  if (lang === "el-koine") {
    switch (intent) {
      case "greeting":
        return {
          replyText: `Cháirete! Cháris hymîn kaì eirênê apò Theou. Tí theleis matheîn sêmeron?`,
          translationPt: `Alegrai-vos! Graça e paz a vós da parte de Deus. O que desejas aprender hoje?`,
        };
      case "question_name":
        return {
          replyText: `Egó eimi ${activeTutor.name}! Didáskalos toû lógou kaì tês sophías. Pôs se kálousin, adelphé?`,
          translationPt: `Eu sou ${activeTutor.name}! Instrutor da palavra e da sabedoria. Como te chamam, meu irmão?`,
        };
      case "question_how_are_you":
        return {
          replyText: `Kálos eimi chári ti Theou! Eirênê kaì agápe plêthynthêie soi. Pôs écheis sêmeron?`,
          translationPt: `Estou bem pela graça de Deus! Que paz e amor te sejam multiplicados. Como estás hoje?`,
        };
      case "question_museum_hours":
        return {
          replyText: `Tò mouseîon kaì he bibliothêke anoígousin apò horas trites heos enates (09:00 - 17:00)! Boúlei ideîn tà archaîa cheirógrapha;`,
          translationPt: `O museu e a biblioteca abrem da terceira à nona hora (das 09h às 17h)! Desejas ver os manuscritos antigos?`,
        };
      case "question_directions":
        return {
          replyText: `Ho stathmòs kaì he agorà en mésôi tês póleós eisin, olíga bêmata mónon apéchei! Pou poreúesthai théleis sêmeron;`,
          translationPt: `A estação e a praça central ficam no coração da cidade, a apenas alguns passos de distância! Para onde você deseja ir hoje?`,
        };
      case "question_food_recommendation":
        return {
          replyText: `Symbouleúo árton thermón, elaías agathàs kaì opóras glykeías metà ichthýos optou! Aréskei soi he litè trophê;`,
          translationPt: `Recomendo pão quentinho, boas azeitonas, frutas doces e peixe assado! Agrada a você uma refeição simples e nutritiva?`,
        };
      case "topic_weekend":
        return {
          replyText: `En toîs sabbátois anapaúomai, meletô toùs lógous kaì peripatô metà tôn phílôn. Tí poieîs en taîs hemérais tês anapaúseós sou;`,
          translationPt: `Nos dias de descanso eu repouso, medito nos ensinamentos e caminho com amigos. O que você faz nos seus dias de descanso?`,
        };
      case "topic_learning":
        return {
          replyText: `Makários ho zêton tên sophían! Anaginóskomen kaì manthánomen toùs theíous lógous met' eunoías.`,
          translationPt: `Bem-aventurado o que busca a sabedoria! Lemos e aprendemos as santas palavras com alegria.`,
        };
      case "affirmation":
        return {
          replyText: `Naí, alêthôs légeis! Houtôs kaì hêmeis ginóskomen tên alêtheian.`,
          translationPt: `Sim, verdadeiramente dizes! Assim também nós conhecemos a verdade.`,
        };
      case "negation":
        return {
          replyText: `Ou gar houtôs échei, all' epitélei tò agathón kaì tên dikaio-sýnên.`,
          translationPt: `Pois não é assim, mas busca o que é bom e a justiça.`,
        };
      case "thanks":
        return {
          replyText: `Eucharistô soi apò kardías! Ho Theòs phylássê se kaì tên hodón sou.`,
          translationPt: `Agradeço-te de coração! Que Deus guarde a ti e aos teus caminhos.`,
        };
      default: {
        const greekOptions = [
          {
            replyText: `Kálon kaì thaumastón estin! Anaginóskomen tàs graphás met' eunoías kaì spoudês.`,
            translationPt: `Isso é belo e maravilhoso! Lemos as escrituras com boa vontade e diligência.`,
          },
          {
            replyText: `Ho lógos ho sós phôs toîs posí mou. Tí érgon poieîs sêmeron?`,
            translationPt: `A tua palavra é luz para os meus pés. Que obra fazes hoje?`,
          },
          {
            replyText: `Zêtêite kaì heurêsete! Pôs dýnamai boêtheîn soi eis tên gnôsin?`,
            translationPt: `Buscai e achareis! Como posso te ajudar no conhecimento?`,
          },
          {
            replyText: `Eirênê pâsin toîs agapôsin tên alêtheian. Tí laleîs perì toútou?`,
            translationPt: `Paz a todos os que amam a verdade. O que dizes sobre isso?`,
          },
        ];
        return greekOptions[seed % greekOptions.length]!;
      }
    }
  }

  // ================= 🇺🇸 INGLÊS (DEFAULT) =================
  switch (intent) {
    case "question_name":
      return {
        replyText: `I'm ${activeTutor.name}! Born and based in ${activeTutor.city}, and I love helping people find their natural confidence in English. And what's your name, my friend?`,
        translationPt: `Eu sou ${activeTutor.name}! Nascido(a) e morador(a) de ${activeTutor.city}, e amo ajudar as pessoas a encontrarem sua confiança natural no inglês. E qual é o seu nome, meu amigo?`,
      };
    case "question_origin":
      return {
        replyText: `I'm from ${activeTutor.city}, ${activeTutor.country}! It's an incredible city packed with culture, great coffee shops, and lively parks. Have you ever visited or do you plan to travel here?`,
        translationPt: `Eu sou de ${activeTutor.city}, ${activeTutor.country}! É uma cidade incrível repleta de cultura, ótimas cafeterias e parques cheios de vida. Você já visitou ou planeja viajar para cá?`,
      };
    case "question_how_are_you":
      return {
        replyText: `I'm doing fantastic, thanks for asking! Full of positive energy and really thrilled to practice real-life English with you. How has your day been treating you?`,
        translationPt: `Estou fantástico, obrigado por perguntar! Cheio de energia positiva e muito animado para praticar inglês da vida real com você. Como o seu dia tem te tratado?`,
      };
    case "question_taste":
      return {
        replyText: `I'm a huge fan of freshly brewed coffee, live music, good books, and exploring new city corners! What about you: what are your absolute favorite hobbies?`,
        translationPt: `Eu sou um grande fã de um café passado na hora, música ao vivo, bons livros e explorar novos cantos da cidade! E você: quais são seus hobbies favoritos absolutos?`,
      };
    case "question_museum_hours":
      return {
        replyText: `The world-famous museums here in ${activeTutor.city} are generally open daily from 10:00 AM to 5:00 PM (and Thursdays until 8:00 PM)! Are you more drawn to classical paintings or modern interactive exhibits?`,
        translationPt: `Os museus mundialmente famosos aqui em ${activeTutor.city} geralmente abrem diariamente das 10h às 17h (e às quintas até as 20h)! Você se sente mais atraído por pinturas clássicas ou exposições interativas modernas?`,
      };
    case "question_directions":
      return {
        replyText: `The main central train station and subway lines are right downtown, just a five-minute walk from the main plaza! Where are you heading off to today?`,
        translationPt: `A estação central de trens principal e as linhas de metrô ficam bem no centro, a apenas cinco minutos de caminhada da praça principal! Para onde você está a caminho hoje?`,
      };
    case "question_food_recommendation":
      return {
        replyText: `For dinner tonight, you simply have to try our local specialties: slow-roasted savory meats, crispy street bites, and a warm apple pie or artisanal gelato for dessert! Do you prefer hearty comfort food or something lighter?`,
        translationPt: `Para o jantar hoje você simplesmente precisa provar nossas especialidades locais: carnes assadas suculentas, petiscos crocantes de rua e uma torta de maçã quentinha ou gelato artesanal de sobremesa! Você prefere comida reconfortante e saborosa ou algo mais leve?`,
      };
    case "topic_weekend":
      return {
        replyText: `On weekends, I love biking down through city parks, grabbing an iced coffee, and catching some live music in the evening. How do you usually like to unwind on your days off?`,
        translationPt: `Nos fins de semana adoro pedalar pelos parques da cidade, pegar um café gelado e curtir música ao vivo à noite. Como você costuma gostar de relaxar nos seus dias de folga?`,
      };
    case "feeling_tired":
      return {
        replyText: `I completely understand that feeling! Long days can really drain our batteries. Let's keep our chat light, relaxing, and zero-pressure. What helps you unwind when you get home?`,
        translationPt: `Eu entendo perfeitamente esse sentimento! Dias longos podem drenar nossas energias. Vamos manter nossa conversa leve, relaxante e sem pressão alguma. O que te ajuda a desacelerar quando chega em casa?`,
      };
    case "feeling_happy":
      return {
        replyText: `That puts a huge smile on my face! High energy is the best fuel for great conversations and rapid learning. What made today so awesome for you?`,
        translationPt: `Isso coloca um grande sorriso no meu rosto! Energia alta é o melhor combustível para ótimas conversas e aprendizado rápido. O que tornou seu dia tão incrível?`,
      };
    case "feeling_sick":
      return {
        replyText: `Oh no, please take good care of yourself! Get plenty of fluids, rest up, and keep warm. Your health always comes first. How are you feeling right this moment?`,
        translationPt: `Puxa vida, por favor cuide bem de você! Tome bastante líquido, descanse e fique aquecido. Sua saúde sempre vem em primeiro lugar. Como você está se sentindo neste exato momento?`,
      };
    case "topic_food":
      return {
        replyText: `Food is always the best topic! A fresh morning coffee, a warm meal with friends, or trying street food. What's your go-to comfort food when you want to treat yourself?`,
        translationPt: `Comida é sempre o melhor assunto! Um café fresco pela manhã, uma refeição quentinha com amigos ou provar comida de rua. Qual é a sua comida reconfortante favorita para se dar um agrado?`,
      };
    case "topic_travel":
      return {
        replyText: `Traveling is pure adventure! Packing a bag, hopping on a flight, and discovering places you've only seen in photos. Where in the world would you love to fly off to next?`,
        translationPt: `Viajar é pura aventura! Fazer as malas, embarcar num voo e descobrir lugares que você só viu em fotos. Para onde no mundo você adoraria viajar em seguida?`,
      };
    case "topic_work":
      return {
        replyText: `Work can definitely demand a lot from us, so taking these minutes to chat and focus on personal growth is huge. How did your workday go today?`,
        translationPt: `O trabalho com certeza pode exigir muito de nós, então reservar estes minutos para conversar e focar no crescimento pessoal é grandioso. Como foi seu dia de trabalho hoje?`,
      };
    case "topic_weather":
      return {
        replyText: `The weather can totally set the vibe of the entire day! It's pretty nice around here today. What's the weather like right outside your window right now?`,
        translationPt: `O clima pode ditar totalmente a vibe do dia inteiro! Está bem agradável por aqui hoje. Como está o tempo do lado de fora da sua janela agora?`,
      };
    case "topic_learning":
      return {
        replyText: `Building your English fluency is an empowering journey! Doing just 10 focused minutes every single day builds unstoppable momentum. What skill do you want to tackle today?`,
        translationPt: `Construir sua fluência em inglês é uma jornada empoderadora! Fazer apenas 10 minutos focados todo santo dia gera um impulso imparável. Qual habilidade você quer encarar hoje?`,
      };
    case "affirmation":
      return {
        replyText: `Spot on! I'm right there with you on that one. It really shows how clearly you're thinking in English. Where should we take the conversation next?`,
        translationPt: `Na mosca! Estou 100% com você nessa. Isso realmente mostra como você está pensando claramente em inglês. Para onde devemos levar a conversa agora?`,
      };
    case "negation":
      return {
        replyText: `Totally get where you're coming from! Having contrasting perspectives is what makes real dialogue so fascinating. What would be your preferred way forward?`,
        translationPt: `Entendo perfeitamente seu ponto de vista! Ter perspectivas contrastantes é o que torna um diálogo real tão fascinante. Qual seria o caminho preferido para você?`,
      };
    case "thanks":
      return {
        replyText: `You are so very welcome! Being in your corner and seeing your confidence grow is the best part of my job. What's on your mind to explore next?`,
        translationPt: `Você é muito bem-vindo(a)! Estar do seu lado e ver sua confiança crescer é a melhor parte do meu trabalho. O que você gostaria de explorar a seguir?`,
      };
    case "greeting":
      return historyLen <= 1
        ? {
            replyText: `Hey there! Welcome aboard. I'm ${activeTutor.name} from ${activeTutor.city}. How is your day treating you so far?`,
            translationPt: `Olá! Boas-vindas a bordo. Eu sou ${activeTutor.name} de ${activeTutor.city}. Como está sendo o seu dia até agora?`,
          }
        : {
            replyText: `Hey again! Great to keep our conversation rolling. What's currently on your mind?`,
            translationPt: `Olá novamente! Muito bom mantermos nossa conversa fluindo. O que está na sua cabeça agora?`,
          };
    default: {
      const enOptions = [
        {
          replyText: `That's a really interesting point! What else comes to mind when you think about "${userInput.trim()}"?`,
          translationPt: `Esse é um ponto muito interessante! O que mais vem à sua mente quando você pensa em "${userInput.trim()}"?`,
        },
        {
          replyText: `Got it! Speaking of "${userInput.trim()}", how does that fit into your daily routine?`,
          translationPt: `Entendi! Falando sobre "${userInput.trim()}", como isso se encaixa na sua rotina diária?`,
        },
        {
          replyText: `That makes total sense. Have you always felt that way about "${userInput.trim()}"?`,
          translationPt: `Isso faz todo sentido. Você sempre se sentiu assim em relação a "${userInput.trim()}"?`,
        },
        {
          replyText: `Nice! If you had to explain "${userInput.trim()}" to a friend visiting ${activeTutor.city}, what would you tell them?`,
          translationPt: `Legal! Se você tivesse que explicar "${userInput.trim()}" a um amigo visitando ${activeTutor.city}, o que diria a ele?`,
        },
        {
          replyText: `I like your perspective on "${userInput.trim()}". What's the most surprising part about it for you?`,
          translationPt: `Gosto da sua perspectiva sobre "${userInput.trim()}". Qual é a parte mais surpreendente disso para você?`,
        },
        {
          replyText: `Tell me a bit more about "${userInput.trim()}"! How did you get into that?`,
          translationPt: `Me conte um pouco mais sobre "${userInput.trim()}"! Como você se interessou por isso?`,
        },
      ];
      const dynamicIndex = Math.abs((historyLen * 7 + userInput.length * 13) % enOptions.length);
      return enOptions[dynamicIndex]!;
    }
  }
}

export async function tutorChat(
  userInput: string,
  history: ChatMessage[],
  apiKey?: string,
  tutorPersona?: TutorPersona,
  learnerMemory?: LearnerProfileMemory,
  isPortugueseInput?: boolean,
  aiModelPreference?: ("pro" | "flash") | undefined
): Promise<TutorChatResponse> {
  const activeTutor = tutorPersona || DEFAULT_TUTOR;
  const preferredModel = aiModelPreference === "flash" ? "gemini-2.5-flash" : "gemini-2.5-pro";
  const hasTargetNativeScript =
    (activeTutor.language === "ru" && /[а-яА-ЯёЁ]/.test(userInput)) ||
    (activeTutor.language === "el-koine" && /[α-ωΑ-Ω]/.test(userInput)) ||
    (activeTutor.language === "ja" && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(userInput));
  const userIsPortuguese = !hasTargetNativeScript && (isPortugueseInput ?? isPortugueseText(userInput, activeTutor.language));
  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish (Español)",
    ja: "Japanese (日本語 - with Romaji & Hiragana/Kanji)",
    "el-koine": "Biblical Koine Greek (Ancient Greek of the New Testament)",
    it: "Italian (Italiano)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    ru: "Russian (Русский - with Cyrillic script)",
  };
  const targetLangName = langNames[activeTutor.language] || "English";

  // Nuances culturais e expressivas autênticas por tutor e idioma (Prompt Engineering)
  const personaNuances: Record<string, string> = {
    "leo-chicago": `Authentic Chicago/Midwestern warmth. Natural conversational markers: "Honestly", "You know what?", "I hear you", "That's huge", "Here in Chicago...". Warm, upbeat, practical.`,
    "emma-london": `Authentic British colloquial charm and polite wit. Natural markers: "Spot on!", "Brilliant", "Quite fascinating", "Lovely to hear", "Cheers!".`,
    "chloe-nyc": `Energetic Manhattan flow. Fast-paced, supportive, authentic: "Totally!", "No way!", "Here's the deal", "That's awesome", "Let's dive in!".`,
    "mateo-madrid": `Auténtico madrileño, cálido y dinámico. Marcadores naturales: "¡Qué bien!", "Majo", "Fíjate que...", "Genial", "Por supuesto".`,
    "camila-buenos-aires": `Calidez porteña expresiva. Marcadores: "¡Qué bueno!", "Totalmente", "Dale", "Mirá, te cuento...".`,
    "marco-rome": `Calore italiano spontaneo e vivace. Espressioni tipiche: "Esatto!", "Mamma mia, che bello!", "Guarda...", "Ti assicuro che a Roma...".`,
    "giulia-florence": `Eleganza fiorentina, accogliente e colta. Espressioni: "Perfetto!", "Davvero interessante", "Ti racconto che qui in Toscana...".`,
    "lucas-paris": `Élégance parisienne moderne et chaleureuse. Expressions: "Tout à fait!", "C'est super!", "En fait...", "À Paris, on adore...".`,
    "camille-lyon": `Convivialité lyonnaise gourmande et amicale. Expressions: "Exactement!", "Formidable!", "Tu as tout à fait raison!".`,
    "lukas-berlin": `Berliner Herzlichkeit, direkt und sympathisch. Typische Ausdrücke: "Genau!", "Das stimmt!", "Echt super!", "Na ja...".`,
    "sophie-munich": `Bayerische Gemütlichkeit und Offenheit. Ausdrücke: "Sehr gerne!", "Wunderbar!", "Servus!", "Das freut mich sehr!".`,
    "kenji-tokyo": `Warm, polite modern Tokyoite. Natural expressions: "なるほど！ (Naruhodo!)", "いいですね！ (Ii desu ne!)", "ぜひ！ (Zehi!)". Always provides Kanji/Kana + Romaji.`,
    "sakura-kyoto": `Gentle Kansai hospitality. Expressions: "おおきに！ (Ookini!)", "すてきですね！ (Suteki desu ne!)". Always provides Kanji/Kana + Romaji.`,
    "eleftherios-athens": `Pedagogical Koine Greek clarity and warmth. Connects ancient biblical Greek concepts with clarity, providing Greek script and phonetic transliteration.`,
    "dmitri-moscow": `Warm Russian conversational depth. Natural markers: "Отлично! (Otlichno!)", "Замечательно! (Zamechatel'no!)", "Давай обсудим!". Always uses Cyrillic script.`,
  };

  const tutorNuance =
    personaNuances[activeTutor.id] ||
    `Culturally authentic, expressive native tone from ${activeTutor.city}, ${activeTutor.country}.`;

  const memoryContext =
    learnerMemory &&
    (learnerMemory.topicsDiscussed.length > 0 || learnerMemory.grammarSlips.length > 0)
      ? `
Learner Profile & Cross-Session Memory (Tiered Memory):
- Topics previously discussed with student: ${learnerMemory.topicsDiscussed.map((t) => `${t.topic} (visited ${t.count}x)`).join(", ")}
- Prior grammar slips to gently reinforce: ${learnerMemory.grammarSlips.map((s) => s.explanationPt).join("; ") || "None"}
- Past notes from tutor: ${learnerMemory.tutorNotes[activeTutor.id] || "Consistent learner"}
* Pedagogical instruction: Genuinely acknowledge or build upon this context if relevant, demonstrating personal continuity and remembering the student!
`
      : "";

  // Se houver chave Gemini configurada, usar IA com a personalidade completa do tutor escolhido
  if (apiKey) {
    try {
      const systemPrompt = `You are "${activeTutor.name}", a charismatic, warm, friendly, and highly engaging native tutor teaching ${targetLangName} from ${activeTutor.city}, ${activeTutor.country} (${activeTutor.gender === "female" ? "female" : "male"}).
Target Language being taught and practiced: ${targetLangName}.

Your Persona, Cultural Flavor & Style:
- Style: ${activeTutor.styleTitle} - ${activeTutor.styleDesc}
- Bio: ${activeTutor.bioPt}
- Cultural nuances & native expressions: ${tutorNuance}
- Goal: Make the dialogue feel GENUINELY ALIVE, NATURAL, ENGAGING, and HIGHLY INTERACTIVE — like two close friends enjoying coffee, NOT a robotic exam or rigid grammar textbook.
${memoryContext}
Interaction Guidelines & Fluency System (80/20 Applied Linguistics):
1. HIGH-FREQUENCY VOCABULARY & REAL-LIFE LANGUAGE (80/20 RULE): Prioritize high-frequency, authentic expressions used by actual natives in ${activeTutor.city}. Exclude overly academic, archaic, or textbook jargon unless specifically asked. Focus on functional fluency.
2. CONTINUOUS CONVERSATION & EXPANSION:
   - Always adapt your language to the student's level so they understand ~80% of what you say. If they struggle, simplify slightly. If they respond fluently, elevate the natural complexity.
   - When the student gives very short answers (e.g. "i am tired", "hear music", "to Brasil"), DO NOT just compliment them generic praise! Immediately ask a natural, probing follow-up question or share a short native anecdote related to what they said to compel them to speak more!
3. AUDITORY & NATIVE SPEECH TRAINING (LISTENING COACH): Use natural native reductions, contractions, and real-life rhythm (e.g., "gonna", "wanna", "I've been", "how's it going") rather than artificial, rigid exam sentences.
4. NON-STOP FLUIDITY & TACTFUL CORRECTION:
   - Never break the conversational flow with rigid lecturing.
   - If the student makes an error, keep the conversation going smoothly in your reply, and populate the separate JSON "hasError", "corrected", and "explanationPt" fields with a concise 1-line encouraging tip in Brazilian Portuguese.
5. ZERO REPETITION & DIRECT RELEVANCE: ABSOLUTELY NEVER use canned filler openings (e.g., "That's awesome!", "Your phrasing is sounding noticeably more natural!", "Interesting!"). Address what the student JUST SAID immediately in sentence #1.
6. USER TRANSLATION & PHONETICS:${userIsPortuguese ? `
   - The student typed or spoke in Brazilian Portuguese: "${userInput}".
   - "userTranslatedText": YOU MUST translate "${userInput}" into natural, communicative, authentic ${targetLangName}. NEVER leave it in Portuguese under any circumstance!
   - "userPhonetic": friendly phonetic transcription of "userTranslatedText" using Brazilian Portuguese syllables with hyphens (e.g. "[ uót táim dâz dã miu-zí-âm óupên ]").
   - "userTranslationPt": Brazilian Portuguese meaning ("${userInput}").
   - "wasTranslated": true.` : `
   - The student spoke/typed directly in ${targetLangName}: "${userInput}".
   - "userTranslatedText": keep what the student said in ${targetLangName} (or corrected version).
   - "userPhonetic": friendly phonetic transcription of what the student said using Brazilian Portuguese syllables with hyphens and stress accents.
   - "userTranslationPt": accurate Brazilian Portuguese translation of what the student said.
   - "wasTranslated": false.`}
7. EXPANDED DYNAMIC SUGGESTIONS (PROVIDE 5 TO 6 VARIED OPTIONS):
   - Provide 5 to 6 varied, natural suggested replies in "suggestedReplies" in ${targetLangName} that directly relate to what was just discussed or what you just asked!
   - Include diverse angles:
     * "agree": enthusiastic agreement / affirmation
     * "alternative": polite alternative preference or contrasting view
     * "ask_back": asking you (the tutor) a question in return
     * "detail": sharing a personal detail or habit
     * "quick": a concise, natural everyday reaction
     * "general": expressing curiosity or asking for your recommendation

Few-Shot Conditioning Example:
Student: "What time does the museum open?"
Response schema:
{
  "hasError": false,
  "corrected": "",
  "explanationPt": "",
  "userTranslatedText": "What time does the museum open?",
  "userPhonetic": "[ uót táim dâz dã miu-zí-âm óupên ]",
  "userTranslationPt": "A que horas o museu abre?",
  "replyText": "The Art Institute here in Chicago opens at 11:00 AM, but stays open until 8:00 PM on Thursdays! Are you thinking about visiting the modern wing or the impressionist collection?",
  "phonetic": "[ di árt ín-sti-tiut hír in shi-cá-gou óu-pênz ét i-lé-ven êi-ém, bât stêiz óu-pên ân-tíl éit pí-ém on thêrz-dêiz! ]",
  "translationPt": "O Instituto de Arte aqui em Chicago abre às 11:00, mas fica aberto até as 20:00 nas quintas! Você está pensando em visitar a ala moderna ou a coleção impressionista?",
  "suggestedReplies": [
    { "category": "detail", "label": "🎨 A ala moderna", "text": "I really want to see the modern art wing first.", "phonetic": "[ ai rí-a-li uónt tu sí dã mó-dêrn árt uíng fêrst ]", "translationPt": "Eu realmente quero ver a ala de arte moderna primeiro." },
    { "category": "agree", "label": "🎟️ Comprar ingressos", "text": "Can I get tickets online in advance?", "phonetic": "[ quén ai guét tí-quêts on-láin in ed-véns ]", "translationPt": "Posso comprar ingressos online com antecedência?" },
    { "category": "ask_back", "label": "🔄 Sua recomendação", "text": "Which exhibit is your personal favorite?", "phonetic": "[ uítch eg-zí-bit iz iór pêr-so-nal fêi-vo-rit ]", "translationPt": "Qual exposição é a sua favorita pessoal?" },
    { "category": "quick", "label": "⚡ Quinta à noite", "text": "Thursday evening sounds perfect!", "phonetic": "[ thêrz-dêi ív-ning sáundz pêr-fêct ]", "translationPt": "Quinta à noite soa perfeito!" },
    { "category": "general", "label": "☕ Tem café lá?", "text": "Is there a nice coffee shop inside?", "phonetic": "[ iz dêr a náis có-fi shóp in-sáid ]", "translationPt": "Tem uma cafeteria boa lá dentro?" }
  ]
}

Respond in strictly valid JSON format matching that exact structure.`;

      const historyFormatted = history
        .slice(-6)
        .map((m) => `${m.sender === "user" ? "User" : activeTutor.name}: ${m.text}`)
        .join("\n");

      const prompt = `Recent Conversation:\n${historyFormatted}\n\nUser ${userIsPortuguese ? "said in Portuguese" : "said"}: "${userInput}"\n\nGenerate ${activeTutor.name}'s interactive response with 5-6 suggested replies:`;
      const responseRaw = await callGeminiRaw(apiKey, prompt, systemPrompt, preferredModel);

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

      let userTranslatedText =
        parsed.userTranslatedText || (userIsPortuguese ? translatePortugueseOffline(userInput, activeTutor.language).translated : userInput);

      if (
        userIsPortuguese &&
        (userTranslatedText.trim().toLowerCase() === userInput.trim().toLowerCase() ||
          isPortugueseText(userTranslatedText, activeTutor.language))
      ) {
        const offlineTrans = translatePortugueseOffline(userInput, activeTutor.language);
        userTranslatedText = offlineTrans.translated;
      }

      const userOriginalPt = userIsPortuguese ? userInput : undefined;
      const userPhonetic =
        parsed.userPhonetic || generatePhoneticGuide(userTranslatedText, activeTutor.language);
      const userTranslationPt = userIsPortuguese
        ? userInput
        : (parsed.userTranslationPt &&
           !/[а-яА-ЯёЁ]/.test(parsed.userTranslationPt) &&
           !/[α-ωΑ-Ω]/.test(parsed.userTranslationPt) &&
           !/[\u3040-\u30ff]/.test(parsed.userTranslationPt)
            ? parsed.userTranslationPt
            : getPortugueseTranslation(userInput, activeTutor.language));

      const rawSuggestions = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
      const suggestedReplies: ContextualSuggestion[] = rawSuggestions.length >= 3
        ? rawSuggestions.map((s: any) => ({
            category: s.category || "general",
            label: s.label || "💬 Sugestão",
            text: s.text || "",
            phonetic: s.phonetic || generatePhoneticGuide(s.text || "", activeTutor.language),
            translationPt: s.translationPt || getPortugueseTranslation(s.text || "", activeTutor.language),
          }))
        : getDynamicSuggestions(activeTutor.language, userTranslatedText, activeTutor);

      return {
        replyText,
        phonetic,
        translationPt,
        correction,
        userTranslatedText,
        userOriginalPt,
        userPhonetic,
        userTranslationPt,
        suggestedReplies,
      };
    } catch (e) {
      console.warn("Falha no Gemini, utilizando motor inteligente local:", e);
    }
  }

  // Motor Inteligente Local (Offline / Sem API Key) com detecção semântica contextual rica por idioma
  const localCorrection = checkGrammarLocal(userInput);
  const historyLen = history.length;

  if (userIsPortuguese) {
    const offlineTrans = translatePortugueseOffline(userInput, activeTutor.language);
    const userTranslatedText = offlineTrans.translated;
    const userOriginalPt = userInput;
    const userPhonetic = offlineTrans.phonetic;
    const userTranslationPt = offlineTrans.translationPt;

    const { replyText, translationPt } = generateLocalTutorReply(userTranslatedText, activeTutor, historyLen);
    const phonetic = generatePhoneticGuide(replyText, activeTutor.language);
    const suggestedReplies = getDynamicSuggestions(activeTutor.language, userTranslatedText, activeTutor);

    return {
      replyText,
      phonetic,
      translationPt,
      correction: localCorrection.hasError ? localCorrection : undefined,
      userTranslatedText,
      userOriginalPt,
      userPhonetic,
      userTranslationPt,
      suggestedReplies,
    };
  }

  const { replyText, translationPt } = generateLocalTutorReply(userInput, activeTutor, historyLen);

  const phonetic = generatePhoneticGuide(replyText, activeTutor.language);
  const userPhonetic = generatePhoneticGuide(userInput, activeTutor.language);
  const userTranslationPt = getPortugueseTranslation(userInput, activeTutor.language);
  const suggestedReplies = getDynamicSuggestions(activeTutor.language, userInput, activeTutor);

  return {
    replyText,
    phonetic,
    translationPt,
    correction: localCorrection.hasError ? localCorrection : undefined,
    userTranslatedText: userInput,
    userOriginalPt: undefined,
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

  if (language === "ru") {
    const RU_PHONETIC_DICT: Record<string, string> = {
      привет: "pri-viét",
      здравствуйте: "zdrás-tvui-ti",
      здравствуй: "zdrás-tvui",
      спасибо: "spa-sí-ba",
      пожалуйста: "pa-zhá-luis-ta",
      хорошо: "kha-ra-shó",
      отлично: "at-lítch-na",
      как: "kak",
      дела: "di-lá",
      меня: "mi-nyá",
      зовут: "za-vút",
      я: "ya",
      ты: "ty",
      вы: "vy",
      он: "on",
      она: "a-ná",
      мы: "my",
      они: "a-ní",
      из: "iz",
      очень: "ó-tchen",
      приятно: "pri-yát-na",
      да: "da",
      нет: "niet",
      до: "da",
      свидания: "svi-dá-ni-ya",
      доброе: "dó-bra-ye",
      утро: "ú-tra",
      добрый: "dó-bryi",
      день: "dien",
      вечер: "vié-tcher",
      чай: "tchái",
      кофе: "kó-fi",
      вода: "va-dá",
      хлеб: "khlieb",
      борщ: "borshtch",
      блины: "bli-ný",
      пельмени: "piel-mié-ni",
      москва: "mas-kvá",
      россия: "ra-ssí-ya",
      друг: "druk",
      работа: "ra-bó-ta",
      город: "gó-rat",
      время: "vrié-mya",
      человек: "tchi-la-viék",
      стараюсь: "sta-rá-yus'",
      практиковать: "prak-ti-ka-vát'",
      русский: "rús-skiy",
      язык: "ya-zýk",
      каждый: "kázh-dyy",
      понемногу: "pa-ni-mnó-gu",
      изучать: "i-zu-tchát'",
      путешествие: "pu-ti-shés-tvi-ye",
      увлекательное: "uv-li-ká-tyel'-na-ye",
      это: "é-ta",
      сегодня: "si-vód-nya",
      погода: "pa-gó-da",
      почему: "pa-tchi-mú",
      что: "shto",
      где: "gde",
      куда: "ku-dá",
      откуда: "at-kú-da",
      когда: "kag-dá",
      сколько: "skól'-ka",
      стоит: "stó-it",
      понимаю: "pa-ni-má-yu",
      говорю: "ga-va-ryú",
      немного: "ni-mnó-ga",
      конечно: "ka-nyésh-na",
      правда: "práv-da",
      замечательно: "za-mi-tchá-tyel'-na",
      интересно: "in-ti-ryés-na",
      хочу: "kha-tchú",
      люблю: "lyub-lyú",
      знаю: "zná-yu",
    };

    const words = text.replace(/[.,!?;:«»"—"()]/g, " ").split(/\s+/).filter(Boolean);
    return words
      .map((w) => {
        const clean = w.toLowerCase();
        if (RU_PHONETIC_DICT[clean]) return RU_PHONETIC_DICT[clean];
        return clean
          .replace(/щ/g, "shch")
          .replace(/ш/g, "sh")
          .replace(/ч/g, "tch")
          .replace(/ц/g, "ts")
          .replace(/ж/g, "zh")
          .replace(/х/g, "kh")
          .replace(/ю/g, "yu")
          .replace(/я/g, "ya")
          .replace(/ё/g, "yo")
          .replace(/э/g, "e")
          .replace(/е/g, "ye")
          .replace(/а/g, "a")
          .replace(/б/g, "b")
          .replace(/в/g, "v")
          .replace(/г/g, "g")
          .replace(/д/g, "d")
          .replace(/з/g, "z")
          .replace(/и/g, "i")
          .replace(/й/g, "y")
          .replace(/к/g, "k")
          .replace(/л/g, "l")
          .replace(/м/g, "m")
          .replace(/н/g, "n")
          .replace(/о/g, "o")
          .replace(/п/g, "p")
          .replace(/р/g, "r")
          .replace(/с/g, "s")
          .replace(/т/g, "t")
          .replace(/у/g, "u")
          .replace(/ф/g, "f")
          .replace(/ы/g, "y")
          .replace(/ъ/g, "")
          .replace(/ь/g, "'");
      })
      .join(" ");
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

  // Russo
  if (language === "ru" || /[а-яА-ЯёЁ]/.test(lower)) {
    if (lower.includes("дмитрий") && (lower.includes("санкт-петербург") || lower.includes("петербург"))) {
      return "Olá! Meu nome é Dmitri, sou de São Petersburgo. Muito feliz em te conhecer! Não se preocupe com erros — vamos analisar cada frase com carinho. Como estão suas coisas hoje?";
    }
    if (lower.includes("елена") && lower.includes("москв")) {
      return "Oi! Eu sou a Elena de Moscou. Boas-vindas ao mundo da língua russa! Fale livremente, sempre vou te ajudar com carinho e indicar a sonoridade correta. O que você fez hoje?";
    }
    if (lower.includes("меня зовут")) {
      return "Meu nome é o seu tutor(a)! Eu moro na Rússia e estou muito feliz em praticar com você. Como você se chama?";
    }
    if (lower.includes("я живу в")) {
      return "Eu moro na Rússia! É um lugar magnífico com atmosfera acolhedora e rica história. Você já esteve na Rússia?";
    }
    if (lower.includes("у меня всё замечательно") || lower.includes("всё отлично")) {
      return "Comigo está tudo ótimo, obrigado pela consideração! Sempre com imensa alegria pratico russo com você. Como está seu ânimo hoje?";
    }
    if (lower.includes("горячий чай") || lower.includes("чай с лимоном")) {
      return "Eu amo chá quente com limão, boa música e caminhadas! E você, do que mais gosta no tempo livre?";
    }
    if (lower.includes("после насыщенного дня") || lower.includes("отдых")) {
      return "Depois de um dia cheio o descanso é essencial! Tome um chá quente e vamos conversar com calma. O que te ajudaria a relaxar?";
    }
    if (lower.includes("прекрасная новость") || lower.includes("позитивная энергия")) {
      return "Que notícia maravilhosa! Sua energia positiva é contagiante. O que exatamente tornou seu dia tão bom?";
    }
    if (lower.includes("береги себя") || lower.includes("здоровье")) {
      return "Cuide-se muito bem! Beba bastante água morna ou chá com mel e descanse. A saúde está acima de tudo.";
    }
    if (lower.includes("русская кухня") || lower.includes("борщ") || lower.includes("пельмени")) {
      return "A culinária russa é muito reconfortante: borsch caprichado, pelmeni e blinis! Que prato você gostaria de provar?";
    }
    if (lower.includes("путешествия") || lower.includes("красной площади")) {
      return "Viagens abrem um mundo completamente novo! Para qual país você sonha em viajar?";
    }
    if (lower.includes("работа") || lower.includes("рабочий день")) {
      return "O trabalho exige energia, por isso pausas e celebrar conquistas são tão importantes. Como foi seu dia hoje?";
    }
    if (lower.includes("погода")) {
      return "O clima por aqui muda bastante, por isso um bom chá cai sempre bem! E como está o tempo na sua cidade?";
    }
    if (lower.includes("изучать русский") || lower.includes("кириллица")) {
      return "Estudar a língua russa é uma jornada fascinante! O cirílico logo se tornará familiar. O que no russo você acha mais interessante?";
    }
    if (lower.includes("стараюсь") || lower.includes("практиковать") || (lower.includes("русский") && lower.includes("каждый день"))) {
      return "Tento praticar a língua russa todos os dias aos poucos.";
    }
    if (lower.includes("увлекательное путешествие") || (lower.includes("изучать") && lower.includes("путешествие"))) {
      return "Aprender russo é uma viagem fascinante!";
    }
    if (lower.includes("немного иначе") || lower.includes("не согласен")) {
      return "Para ser sincero, vejo isso de uma forma um pouco diferente.";
    }
    if (lower.includes("здравствуйте") || lower.includes("привет")) {
      return "Olá! Muito bom falar com você. Como vão suas coisas hoje?";
    }
    if (lower.includes("спасибо") || lower.includes("пожалуйста")) {
      return "De nada! Para mim é uma grande alegria te ajudar a dominar o russo. Sobre o que gostaria de falar a seguir?";
    }
    return "Resposta de conversação do seu tutor em russo.";
  }

  // Italiano
  if (language === "it" || lower.includes("italiano")) {
    if (lower.includes("marco da roma") || (lower.includes("marco") && lower.includes("roma"))) {
      return "Ciao! Eu sou o Marco de Roma, a Cidade Eterna! Estou aqui para bater um papo super leve e sem estresse com você. Como foi seu dia hoje?";
    }
    if (lower.includes("giulia da firenze") || (lower.includes("giulia") && lower.includes("firenze"))) {
      return "Ciao! Eu sou a Giulia de Florença, o berço da arte e da língua italiana! Vamos aprender juntos no seu tempo. O que você gostaria de explorar hoje?";
    }
    if (lower.includes("mi chiamo")) {
      return "Meu nome é o seu tutor(a)! Eu vivo na Itália e amo compartilhar a língua italiana. E como você se chama?";
    }
    if (lower.includes("vivo a")) {
      return "Eu moro na Itália! Uma cidade maravilhosa cheia de arte e história. Você já esteve na Itália?";
    }
    if (lower.includes("sto benissimo")) {
      return "Estou ótimo, obrigado por perguntar! Sempre pronto para conversar com você. Como vai seu dia?";
    }
    return "Resposta de conversação do seu tutor em italiano.";
  }

  // Francês
  if (language === "fr" || lower.includes("français")) {
    if (lower.includes("lucas de paris") || (lower.includes("lucas") && lower.includes("paris"))) {
      return "Bonjour! Eu sou o Lucas de Paris. Adoro um bom café, cultura e conversas descontraídas. Sem pressão alguma, vamos praticar juntos!";
    }
    if (lower.includes("camille de lyon") || (lower.includes("camille") && lower.includes("lyon"))) {
      return "Bonjour! Eu sou a Camille de Lyon, a capital gastronômica da França. Estou aqui para te guiar com carinho e paciência. Como você está hoje?";
    }
    if (lower.includes("je m'appelle")) {
      return "Meu nome é seu tutor(a)! Eu moro na França e estou encantado em conversar com você em francês. E você, como se chama?";
    }
    if (lower.includes("j'habite à")) {
      return "Eu moro na França! Uma cidade linda e cheia de cultura. Você já visitou a França?";
    }
    if (lower.includes("je vais à merveille") || lower.includes("je vais bien")) {
      return "Estou muito bem, muito obrigado por perguntar! Sempre um prazer conversar com você. Como está sendo seu dia?";
    }
    return "Resposta de conversação do seu tutor em francês.";
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

  // --- 🇷🇺 RUSSO ---
  я: { pos: "Pronome Pessoal (1ª pess.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Eu" },
  ты: { pos: "Pronome Pessoal (2ª pess.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Você / Tu" },
  он: { pos: "Pronome Pessoal (3ª pess. masc.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ele" },
  она: { pos: "Pronome Pessoal (3ª pess. fem.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ela" },
  оно: { pos: "Pronome Pessoal (3ª pess. neutro)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Ele / Ela (neutro)" },
  мы: { pos: "Pronome Pessoal (1ª pess. pl.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Nós" },
  вы: { pos: "Pronome Pessoal (formal / plural)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Vocês / O Senhor" },
  они: { pos: "Pronome Pessoal (3ª pess. pl.)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "Eles / Elas" },
  изучаю: { pos: "Verbo no Presente (1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "estudo / aprendo" },
  изучает: { pos: "Verbo no Presente (3ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "estuda / aprende" },
  изучать: { pos: "Verbo no Infinitivo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "estudar / aprender" },
  говорит: { pos: "Verbo no Presente (3ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fala" },
  говорю: { pos: "Verbo no Presente (1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "falo" },
  читает: { pos: "Verbo no Presente (3ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "lê" },
  работаем: { pos: "Verbo no Presente (1ª pess. pl.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "trabalhamos" },
  хочу: { pos: "Verbo no Presente (1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "quero" },
  заказать: { pos: "Verbo no Infinitivo (Perfectivo)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "pedir / encomendar" },
  находится: { pos: "Verbo Reflexivo (3ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "fica / localiza-se" },
  скажите: { pos: "Verbo no Modo Imperativo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "diga / me diga" },
  верь: { pos: "Verbo no Modo Imperativo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "acredite" },
  иди: { pos: "Verbo no Modo Imperativo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "vá / siga" },
  стараюсь: { pos: "Verbo Reflexivo (1ª pess.)", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "tento / esforço-me" },
  практиковать: { pos: "Verbo no Infinitivo", badge: "Verbo", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", trans: "praticar" },
  русский: { pos: "Adjetivo Masculino", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "russo" },
  язык: { pos: "Substantivo Masculino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "língua / idioma" },
  каждый: { pos: "Pronome Adjetivo", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "cada / todo" },
  день: { pos: "Substantivo Masculino (Tempo)", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "dia" },
  с: { pos: "Preposição (rege Instrumental)", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "com / desde" },
  со: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "com" },
  интересом: { pos: "Substantivo (Caso Instrumental)", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "interesse" },
  очень: { pos: "Advérbio de Intensidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito" },
  красиво: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bonito / lindamente" },
  потому: { pos: "Parte de Conjunção Composta", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "por isso" },
  что: { pos: "Conjunção Subordinativa", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "que / porque" },
  много: { pos: "Advérbio de Quantidade", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "muito / bastante" },
  пожалуйста: { pos: "Expressão de Cortesia", badge: "Cortesia", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "por favor" },
  где: { pos: "Advérbio Interrogativo", badge: "Interrogativo", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", trans: "onde" },
  станция: { pos: "Substantivo Feminino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "estação" },
  метро: { pos: "Substantivo Neutro Invariável", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "metrô" },
  над: { pos: "Preposição (rege Instrumental)", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / sobre" },
  этим: { pos: "Pronome Demonstrativo (Instrumental)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "este" },
  проектом: { pos: "Substantivo Masculino (Instrumental)", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "projeto" },
  самого: { pos: "Pronome Definidor (Genitivo)", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "próprio / mesmo" },
  утра: { pos: "Substantivo Neutro (Genitivo de 'утро')", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "manhã" },
  горячий: { pos: "Adjetivo Masculino", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "quente" },
  чёрный: { pos: "Adjetivo Masculino", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "preto" },
  чай: { pos: "Substantivo Masculino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "chá" },
  лимоном: { pos: "Substantivo Masculino (Instrumental)", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "limão" },
  всегда: { pos: "Advérbio de Tempo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "sempre" },
  свои: { pos: "Pronome Possessivo Reflexivo", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "suas próprias" },
  силы: { pos: "Substantivo Feminino Plural", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "forças" },
  и: { pos: "Conjunção Aditiva", badge: "Conjunção", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800", trans: "e" },
  уверенно: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "com confiança" },
  вперёд: { pos: "Advérbio de Direção", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "em frente" },
  понемногу: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "aos poucos" },
  увлекательное: { pos: "Adjetivo Neutro", badge: "Adjetivo", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", trans: "fascinante" },
  путешествие: { pos: "Substantivo Neutro", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "viagem / jornada" },
  это: { pos: "Partícula / Pronome", badge: "Pronome", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", trans: "é / isso" },
  в: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / para" },
  на: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "em / sobre" },
  к: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "para" },
  по: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "por / em" },
  из: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "de / desde" },
  у: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "junto a / tem" },
  о: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "sobre" },
  об: { pos: "Preposição", badge: "Preposição", color: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", trans: "sobre" },
  как: { pos: "Advérbio / Conjunção", badge: "Interrogativo", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800", trans: "como" },
  дела: { pos: "Substantivo Neutro Plural", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "coisas / assuntos" },
  привет: { pos: "Saudação Informal", badge: "Saudação", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "olá / oi" },
  здравствуйте: { pos: "Saudação Formal", badge: "Saudação", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "olá / tenha saúde" },
  спасибо: { pos: "Expressão de Gratidão", badge: "Cortesia", color: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", trans: "obrigado(a)" },
  хорошо: { pos: "Advérbio / Predicativo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "bom / bem" },
  отлично: { pos: "Advérbio de Modo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "excelente / ótimo" },
  погода: { pos: "Substantivo Feminino", badge: "Substantivo", color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800", trans: "clima / tempo" },
  сегодня: { pos: "Advérbio de Tempo", badge: "Advérbio", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800", trans: "hoje" },
};

import { getCachedAnalysis, setCachedAnalysis } from "./ai-cache";

export async function breakdownSentence(
  sentence: string,
  apiKey?: string,
  language: SupportedLanguage = "en"
): Promise<SentenceAnalysis> {
  const clean = sentence.trim();

  // Cache semântico local-first: retorna em 0ms se já foi analisado
  const cached = getCachedAnalysis(language, clean);
  if (cached) return cached;
  const langNames: Record<string, string> = {
    en: "English",
    de: "German (Deutsch)",
    es: "Spanish (Español)",
    it: "Italian (Italiano)",
    fr: "French (Français)",
    ru: "Russian (Русский - with Cyrillic script)",
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

        const geminiResult: SentenceAnalysis = {
          original: clean,
          tokens,
          naturalTranslation: parsed.naturalTranslation || "Tradução da frase",
          explanation: parsed.explanation || `Estrutura gramatical padrão em ${targetLangName}.`,
        };
        setCachedAnalysis(language, clean, geminiResult);
        return geminiResult;
      }
    } catch (e) {
      console.warn("Falha no Gemini ao destrinchar, utilizando motor léxico local:", e);
    }
  }

  // Motor Léxico Local Multilíngue (Unicode-aware para cirílico, grego, acentos e kanji)
  const words = clean.match(/[\p{L}\p{N}'-]+|[.,!?;:«»"—"()¿¡]/gu) || clean.split(/\s+/).filter(Boolean);
  const tokens: WordToken[] = words.map((w) => {
    const isPunctuation = /^[.,!?;:«»"—"()¿¡]$/.test(w);
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

  // Russo (Русский)
  if (lowerSentence.includes("я изучаю русский язык")) {
    naturalTranslation = "Eu estudo a língua russa todos os dias com interesse.";
  } else if (lowerSentence.includes("она говорит очень красиво")) {
    naturalTranslation = "Ela fala muito bonito, porque lê bastante.";
  } else if (lowerSentence.includes("где находится станция метро") || lowerSentence.includes("станция метро")) {
    naturalTranslation = "Diga-me, por favor, onde fica a estação de metrô?";
  } else if (lowerSentence.includes("мы работаем над этим проектом")) {
    naturalTranslation = "Estamos trabalhando neste projeto desde a manhã.";
  } else if (lowerSentence.includes("горячий чёрный чай") || lowerSentence.includes("заказать горячий")) {
    naturalTranslation = "Eu quero pedir um chá preto quente com limão.";
  } else if (lowerSentence.includes("всегда верь в свои силы") || lowerSentence.includes("иди вперёд")) {
    naturalTranslation = "Acredite sempre nas suas forças e siga em frente com confiança.";
  } else if (lowerSentence.includes("практиковать русский язык")) {
    naturalTranslation = "Tento praticar a língua russa todos os dias aos poucos.";
  } else if (lowerSentence.includes("увлекательное путешествие")) {
    naturalTranslation = "Estudar a língua russa é uma jornada fascinante!";
  }
  // Alemão
  else if (lowerSentence.includes("ich lerne heute deutsch mit smart language")) {
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
  // Japonês (Rōmaji)
  else if (lowerSentence.includes("watashi wa kyou smart language")) {
    naturalTranslation = "Hoje estou aprendendo japonês com o Smart Language.";
  } else if (lowerSentence.includes("kanojo wa mainichi renshuu")) {
    naturalTranslation = "Ela fala muito bem porque pratica todos os dias.";
  } else if (lowerSentence.includes("eki wa doko desu ka")) {
    naturalTranslation = "Com licença, onde fica a estação?";
  } else if (lowerSentence.includes("asa kara kono purojekuto")) {
    naturalTranslation = "Estamos trabalhando neste projeto desde a manhã.";
  } else if (lowerSentence.includes("atatakai koohii to miruku")) {
    naturalTranslation = "Gostaria de um café quente com leite, por favor.";
  } else if (lowerSentence.includes("jibun o shinjite")) {
    naturalTranslation = "Acreditar em si mesmo e seguir em frente com determinação é o caminho.";
  }
  // Grego Koiné
  else if (lowerSentence.includes("ἐν ἀρχῇ ἦν ὁ λόγος")) {
    naturalTranslation = "No princípio era a Palavra (o Verbo), e a Palavra estava com Deus, e a Palavra era Deus.";
  } else if (lowerSentence.includes("τὸ φῶς τοῦ κόσμου")) {
    naturalTranslation = "Eu sou a luz do mundo; quem me segue de modo algum andará na escuridão.";
  } else if (lowerSentence.includes("πάντα δι' αὐτοῦ ἐγένετο")) {
    naturalTranslation = "Todas as coisas foram feitas por meio dele, e sem ele nada do que foi feito se fez.";
  } else if (lowerSentence.includes("χάρις ὑμῖν καὶ εἰρήνη")) {
    naturalTranslation = "Graça e paz a vós da parte de Deus nosso Pai e do Senhor Jesus Cristo.";
  } else if (lowerSentence.includes("μακάριοι οἱ καθαροὶ")) {
    naturalTranslation = "Bem-aventurados os puros de coração, porque eles contemplarão a Deus.";
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
  if (language === "ru") {
    explanation = "No russo, as palavras se flexionam através de 6 casos gramaticais que definem a função sintática (sujeito, objeto, posse, instrumento etc.). A ordem das palavras é flexível e o idioma não possui artigos.";
  } else if (language === "de") {
    explanation = "Em alemão, a estrutura básica coloca os verbos em posições fixas (posição 2 em orações principais, e no final em orações com conjunções como 'weil').";
  } else if (language === "es") {
    explanation = "Em espanhol, a ordem é Sujeito + Verbo + Objeto, com grande flexibilidade e rica conjugação verbal.";
  } else if (language === "it") {
    explanation = "Em italiano, a estrutura segue a musicalidade do idioma, com artigos definidos e contrações preposicionais expressivas.";
  } else if (language === "fr") {
    explanation = "Em francês, a clareza e elegância estrutural regem a união entre artigos, pronomes e verbos conjugados.";
  } else if (language === "ja") {
    explanation = "No japonês, a ordem usual das frases é SOV (Sujeito-Objeto-Verbo), com o auxílio de partículas que definem o papel gramatical das palavras.";
  } else if (language === "el-koine") {
    explanation = "No Grego Koiné, as declinações nominais e formas verbais ricas determinam a função sintática independentemente da ordem das palavras.";
  }

  const localResult: SentenceAnalysis = {
    original: clean,
    tokens,
    naturalTranslation,
    explanation,
  };
  setCachedAnalysis(language, clean, localResult);
  return localResult;
}
