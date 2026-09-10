import { SupportedLanguage } from "@/types/language";

export interface StreetTalkItem {
  id: string;
  formalBook: string;
  streetNative: string;
  phoneticPt: string;
  translationPt: string;
  explanationPt: string;
  category: "contraction" | "slang" | "expression";
  sampleDialogPt?: string | undefined;
}

export const STREET_TALK_DATA: Record<SupportedLanguage, StreetTalkItem[]> = {
  en: [
    {
      id: "en-st-1",
      formalBook: "What are you going to do?",
      streetNative: "Whatcha gonna do?",
      phoneticPt: "uátcha gôna du?",
      translationPt: "O que você vai fazer?",
      explanationPt: "Nativos fundem 'What are you' em 'Whatcha' e 'going to' em 'gonna'. Quase ninguém fala a versão formal na rua.",
      category: "contraction",
    },
    {
      id: "en-st-2",
      formalBook: "I do not know.",
      streetNative: "Dunno.",
      phoneticPt: "dã-nôu.",
      translationPt: "Sei lá / Não sei.",
      explanationPt: "Contração ultra comum e informal para expressar dúvida ou indiferença.",
      category: "contraction",
    },
    {
      id: "en-st-3",
      formalBook: "It is not a problem.",
      streetNative: "No biggie! / No sweat!",
      phoneticPt: "nôu bígui! / nôu suét!",
      translationPt: "Sem estresse / De boa!",
      explanationPt: "Expressão amigável e descontraída em resposta a um agradecimento ou pedido de desculpas.",
      category: "slang",
    },
    {
      id: "en-st-4",
      formalBook: "I am very tired.",
      streetNative: "I am beat! / I'm exhausted.",
      phoneticPt: "ai ém bít!",
      translationPt: "Tô só o pó / Acabado!",
      explanationPt: "No dia a dia, 'beat' é muito mais comum do que 'very tired'.",
      category: "expression",
    },
  ],
  ru: [
    {
      id: "ru-st-1",
      formalBook: "До свидания / Всего хорошего.",
      streetNative: "Давай! / Пока-пока!",
      phoneticPt: "Davái! / Paká-paká!",
      translationPt: "Valeu, até mais! / Tchau!",
      explanationPt: "Entre amigos e conhecidos, 'Давай' é a despedida mais ouvida no dia a dia em Moscou e São Petersburgo.",
      category: "expression",
    },
    {
      id: "ru-st-2",
      formalBook: "Это не имеет значения / Забудьте.",
      streetNative: "Забей! / Да ладно тебе.",
      phoneticPt: "Zabêi! / Da lúdna tibie.",
      translationPt: "Deixa pra lá! / Esquece isso.",
      explanationPt: "'Забей' (ao pé da letra: martele/pregue) significa 'esquece, não esquenta a cabeça'.",
      category: "slang",
    },
    {
      id: "ru-st-3",
      formalBook: "Очень хорошо / Замечательно.",
      streetNative: "Круто! / Офигенно!",
      phoneticPt: "Krúto! / Afiguiên-na!",
      translationPt: "Massa! / Demais! / Muito top!",
      explanationPt: "'Круто' é a gíria universal russa para algo incrível ou legal.",
      category: "slang",
    },
  ],
  es: [
    {
      id: "es-st-1",
      formalBook: "¿Cómo estás? / ¿Qué tal?",
      streetNative: "¿Qué onda? / ¿Qué pasa, tío?",
      phoneticPt: "¿Ké ônda? / ¿Ké pása, tío?",
      translationPt: "E aí, beleza? / Qual é a boa?",
      explanationPt: "'¿Qué onda?' é rei no México e América Latina; '¿Qué pasa, tío?' é muito comum na Espanha.",
      category: "expression",
    },
    {
      id: "es-st-2",
      formalBook: "Eso es muy bueno.",
      streetNative: "¡Está genial! / ¡Mola un montón!",
      phoneticPt: "¡Está re buêno! / ¡Môla un montón!",
      translationPt: "É muito legal! / É o bicho!",
      explanationPt: "O verbo 'molar' é gíria clássica na Espanha; na Argentina usa-se o prefixo 're-bueno'.",
      category: "slang",
    },
  ],
  fr: [
    {
      id: "fr-st-1",
      formalBook: "Je ne sais pas.",
      streetNative: "Chais pas.",
      phoneticPt: "Chê pá.",
      translationPt: "Sei não / Nem ideia.",
      explanationPt: "Ouvir a negação completa 'ne... pas' no dia a dia é raro. Nativos engolem o 'ne' e fundem 'je sais' em 'chais'.",
      category: "contraction",
    },
    {
      id: "fr-st-2",
      formalBook: "C'est ennuyeux / difficile.",
      streetNative: "C'est relou!",
      phoneticPt: "Sê relú!",
      translationPt: "Que saco! / Coisa chata!",
      explanationPt: "Gíria do 'Verlan' (inversão da palavra 'lourd' ➔ 'relou'). Todos os jovens franceses usam.",
      category: "slang",
    },
  ],
  de: [
    {
      id: "de-st-1",
      formalBook: "Wie geht es Ihnen?",
      streetNative: "Na, alles gut?",
      phoneticPt: "Ná, áles gut?",
      translationPt: "E aí, tudo certo?",
      explanationPt: "'Na?' é a pergunta mais eficiente do alemão: serve como oi, como vai e tudo bem ao mesmo tempo.",
      category: "expression",
    },
    {
      id: "de-st-2",
      formalBook: "Ich habe keine Lust.",
      streetNative: "Kein Bock drauf!",
      phoneticPt: "Káin bôk dráuf!",
      translationPt: "Não tô afim / Tô com preguiça.",
      explanationPt: "'Bock haben' significa ter vontade ou ânimo. 'Kein Bock' é super coloquial.",
      category: "slang",
    },
  ],
  it: [
    {
      id: "it-st-1",
      formalBook: "Va bene / D'accordo.",
      streetNative: "Dai! / Ci sta!",
      phoneticPt: "Dái! / Tchi stá!",
      translationPt: "Bora! / Fechou! / Beleza!",
      explanationPt: "'Dai' é a palavra mais versátil do italiano: pode significar 'vamos lá', 'qual é', 'não brinca' ou 'fechado'.",
      category: "expression",
    },
    {
      id: "it-st-2",
      formalBook: "Non lo so.",
      streetNative: "Boh!",
      phoneticPt: "Bô!",
      translationPt: "Sei lá! (com o típico gesto de ombro italiano)",
      explanationPt: "Expressão sonora universal italiana que dispensa qualquer outra frase para dizer 'não faço ideia'.",
      category: "slang",
    },
  ],
  ja: [
    {
      id: "ja-st-1",
      formalBook: "本当ですか？ (Hontou desu ka?)",
      streetNative: "マジで？！ (Maji de?!)",
      phoneticPt: "Maji dê?!",
      translationPt: "Sério mesmo?! / Não brinca?!",
      explanationPt: "A expressão informal mais repetida no Japão para demonstrar surpresa.",
      category: "slang",
    },
    {
      id: "ja-st-2",
      formalBook: "すごいですね。 (Sugoi desu ne.)",
      streetNative: "ヤバい！ (Yabai!)",
      phoneticPt: "Yabái!",
      translationPt: "Caramba! / Que loucura! (para o bem ou para o mal)",
      explanationPt: "'Yabai' originalmente significava perigoso, mas hoje expressa qualquer emoção extrema: bom demais ou ruim demais.",
      category: "slang",
    },
  ],
  "el-koine": [
    {
      id: "el-st-1",
      formalBook: "Εἰρήνη ὑμῖν. (Eirene hymin.)",
      streetNative: "Χαῖρε! (Chaire!)",
      phoneticPt: "Kháire!",
      translationPt: "Alegra-te! / Salve! / Olá!",
      explanationPt: "Saudação viva e afetuosa popular nas ruas e praças da Grécia antiga e do Novo Testamento.",
      category: "expression",
    },
  ],
};

export function getStreetTalkForLanguage(language: SupportedLanguage): StreetTalkItem[] {
  return STREET_TALK_DATA[language] || STREET_TALK_DATA.en;
}
