import { SupportedLanguage } from "@/types/language";

export interface PlacementQuestion {
  id: string;
  levelTarget: "A1" | "A2" | "B1" | "B2";
  type: "listening" | "reading" | "grammar";
  title: string;
  prompt: string;
  audioPhrase?: string | undefined;
  options: {
    id: string;
    text: string;
    correct: boolean;
    explanationPt: string;
  }[];
}

export interface CefrResult {
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  titlePt: string;
  descriptionPt: string;
  badgeIcon: string;
}

export const PLACEMENT_QUESTIONS: Record<SupportedLanguage, PlacementQuestion[]> = {
  en: [
    {
      id: "en-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Compreensão Auditiva Básica",
      prompt: "Escute com atenção a frase do áudio e selecione o significado exato:",
      audioPhrase: "Good morning, my name is Alex and I am from Canada.",
      options: [
        { id: "a", text: "Bom dia, meu nome é Alex e sou do Canadá.", correct: true, explanationPt: "Apresentação clássica A1: 'Good morning' (bom dia) e 'from Canada' (do Canadá)." },
        { id: "b", text: "Boa noite, me chamo Alex e viajo para o Canadá.", correct: false, explanationPt: "'Good morning' significa bom dia." },
        { id: "c", text: "Olá Alex, você gostaria de ir ao Canadá?", correct: false, explanationPt: "A frase é uma afirmativa de apresentação pessoal." },
      ],
    },
    {
      id: "en-q2",
      levelTarget: "A1",
      type: "grammar",
      title: "2. Verbo de Ligação no Presente",
      prompt: "Complete a oração corretamente: 'She _____ to work every single morning.'",
      options: [
        { id: "a", text: "goes", correct: true, explanationPt: "Na 3ª pessoa do singular (she), acrescenta-se -es ao verbo go (she goes)." },
        { id: "b", text: "go", correct: false, explanationPt: "'go' usa-se para I, you, we, they." },
        { id: "c", text: "going", correct: false, explanationPt: "O gerúndio exige o verbo to be antes (is going)." },
      ],
    },
    {
      id: "en-q3",
      levelTarget: "A2",
      type: "reading",
      title: "3. Situação Prática de Viagem",
      prompt: "No aeroporto você lê a placa: 'Flight 402 to London is now boarding at Gate B12'. O que os passageiros devem fazer?",
      options: [
        { id: "a", text: "Dirigir-se ao portão B12 para embarcar no voo 402.", correct: true, explanationPt: "'Boarding' significa embarque imediato." },
        { id: "b", text: "Aguardar o cancelamento do voo na área B12.", correct: false, explanationPt: "O voo não foi cancelado, está embarcando." },
        { id: "c", text: "Retirar as malas da esteira 402.", correct: false, explanationPt: "Trata-se de portão de embarque (Gate), não de esteira." },
      ],
    },
    {
      id: "en-q4",
      levelTarget: "A2",
      type: "grammar",
      title: "4. Passado Simples com Verbo Irregular",
      prompt: "Complete: 'Yesterday, we _____ a wonderful dinner with our friends.'",
      options: [
        { id: "a", text: "had", correct: true, explanationPt: "'Had' é o passado irregular de have (to have dinner = jantar)." },
        { id: "b", text: "have", correct: false, explanationPt: "'Have' está no presente simples." },
        { id: "c", text: "haved", correct: false, explanationPt: "Não existe a forma 'haved'." },
      ],
    },
    {
      id: "en-q5",
      levelTarget: "B1",
      type: "listening",
      title: "5. Interpretação de Intenção & Condicional",
      prompt: "Ouça a frase e descubra o que a pessoa realmente quer dizer:",
      audioPhrase: "If I were you, I would take the train instead of driving in this heavy storm.",
      options: [
        { id: "a", text: "Está dando um conselho prudente para preferir o trem ao carro na tempestade.", correct: true, explanationPt: "'If I were you, I would...' é a fórmula clássica de B1 para aconselhamento." },
        { id: "b", text: "Está convidando para dirigir juntos durante o temporal.", correct: false, explanationPt: "Ela desaconselha dirigir (instead of driving)." },
        { id: "c", text: "Está cancelando a viagem de trem por causa do tempo.", correct: false, explanationPt: "Ela recomenda justamente o trem." },
      ],
    },
    {
      id: "en-q6",
      levelTarget: "B2",
      type: "reading",
      title: "6. Conectivos Lógicos e Discurso Argumentativo",
      prompt: "Qual conectivo expressa contraste na frase: 'The project faced severe budget cuts; _____, the team managed to deliver exceptional results.'",
      options: [
        { id: "a", text: "nevertheless", correct: true, explanationPt: "'Nevertheless' (não obstante / apesar disso) introduz uma superação adversativa." },
        { id: "b", text: "therefore", correct: false, explanationPt: "'Therefore' indica consequência direta, não contraste." },
        { id: "c", text: "furthermore", correct: false, explanationPt: "'Furthermore' apenas adiciona uma nova informação equivalente." },
      ],
    },
  ],
  ru: [
    {
      id: "ru-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Cumprimento & Apresentação",
      prompt: "Escute com atenção e escolha a tradução correta:",
      audioPhrase: "Здравствуйте, меня зовут Анна. Я студентка.",
      options: [
        { id: "a", text: "Olá, meu nome é Anna. Eu sou estudante.", correct: true, explanationPt: "'Здравствуйте' é a saudação formal russa e 'студентка' é estudante (feminino)." },
        { id: "b", text: "Adeus, Anna vai para a universidade agora.", correct: false, explanationPt: "É uma saudação de chegada e apresentação." },
      ],
    },
    {
      id: "ru-q2",
      levelTarget: "A1",
      type: "grammar",
      title: "2. Gênero Gramatical dos Substantivos",
      prompt: "A palavra 'Книга' (Livro) pertence a qual gênero no russo?",
      options: [
        { id: "a", text: "Feminino (terminação em -a)", correct: true, explanationPt: "Palavras terminadas em -а/-я são tradicionalmente do gênero feminino no russo." },
        { id: "b", text: "Masculino", correct: false, explanationPt: "Substantivos masculinos terminam em consoante ou sinal brando." },
        { id: "c", text: "Neutro", correct: false, explanationPt: "Neutros terminam em -о ou -е." },
      ],
    },
    {
      id: "ru-q3",
      levelTarget: "A2",
      type: "reading",
      title: "3. Caso Prepositivo de Lugar",
      prompt: "Complete a oração: 'Сейчас я живу в _____.' (Moscou)",
      options: [
        { id: "a", text: "Москве", correct: true, explanationPt: "O caso prepositivo de lugar com 'в' muda a desinência -а para -е (в Москве)." },
        { id: "b", text: "Москва", correct: false, explanationPt: "'Москва' é a forma do caso nominativo (sujeito)." },
        { id: "c", text: "Москву", correct: false, explanationPt: "'Москву' é o caso acusativo usado para direção/movimento." },
      ],
    },
    {
      id: "ru-q4",
      levelTarget: "B1",
      type: "grammar",
      title: "4. Aspecto Verbal (Imperfectivo vs Perfectivo)",
      prompt: "Para indicar uma ação concluída com sucesso no passado ('Eu li todo o livro'), usa-se:",
      options: [
        { id: "a", text: "Я прочитал книгу.", correct: true, explanationPt: "'Прочитать' é o verbo no aspecto perfectivo, focado no resultado alcançado." },
        { id: "b", text: "Я читал книгу.", correct: false, explanationPt: "'Читал' é imperfectivo e foca apenas no processo, sem garantir que terminou." },
      ],
    },
  ],
  es: [
    {
      id: "es-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Saudação & Origem",
      prompt: "Escute a frase falada:",
      audioPhrase: "Hola, me llamo Carlos y soy de Madrid, España.",
      options: [
        { id: "a", text: "Olá, me chamo Carlos e sou de Madri, Espanha.", correct: true, explanationPt: "Apresentação básica A1 em espanhol." },
        { id: "b", text: "Olá, Carlos viajou para a Espanha ontem.", correct: false, explanationPt: "A frase está no presente de apresentação pessoal." },
      ],
    },
    {
      id: "es-q2",
      levelTarget: "A2",
      type: "grammar",
      title: "2. Pretérito Indefinido",
      prompt: "Complete: 'Ayer nosotros _____ una película maravillosa.'",
      options: [
        { id: "a", text: "vimos", correct: true, explanationPt: "'Vimos' é o pretérito indefinido do verbo ver." },
        { id: "b", text: "vemos", correct: false, explanationPt: "'Vemos' está no presente." },
      ],
    },
  ],
  fr: [
    {
      id: "fr-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Présentation Personnelle",
      prompt: "Écoutez la phrase:",
      audioPhrase: "Bonjour, je m'appelle Julien et j'habite à Paris.",
      options: [
        { id: "a", text: "Bom dia, meu nome é Julien e moro em Paris.", correct: true, explanationPt: "'J'habite à Paris' significa eu moro em Paris." },
        { id: "b", text: "Boa noite, Julien viaja para Paris hoje.", correct: false, explanationPt: "É uma apresentação no presente com o verbo habiter." },
      ],
    },
    {
      id: "fr-q2",
      levelTarget: "A2",
      type: "grammar",
      title: "2. Passé Composé avec Être",
      prompt: "Complétez: 'Elle _____ à la gare ce matin.'",
      options: [
        { id: "a", text: "est arrivée", correct: true, explanationPt: "Verbos de movimento usam o auxiliar être com concordância no feminino (-ée)." },
        { id: "b", text: "a arrivé", correct: false, explanationPt: "Arriver não se conjuga com avoir no passé composé." },
      ],
    },
  ],
  de: [
    {
      id: "de-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Begrüßung & Herkunft",
      prompt: "Hören Sie den Satz:",
      audioPhrase: "Guten Tag! Mein Name ist Lukas und ich lerne Deutsch.",
      options: [
        { id: "a", text: "Boa tarde! Meu nome é Lukas e estou aprendendo alemão.", correct: true, explanationPt: "'Ich lerne Deutsch' significa eu aprendo alemão." },
        { id: "b", text: "Bom dia, Lukas é professor de alemão na escola.", correct: false, explanationPt: "Ele diz que está aprendendo (lerne)." },
      ],
    },
  ],
  it: [
    {
      id: "it-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. Saluto & Città",
      prompt: "Ascolta la frase:",
      audioPhrase: "Ciao a tutti! Mi chiamo Marco e vivo a Roma.",
      options: [
        { id: "a", text: "Olá a todos! Me chamo Marco e moro em Roma.", correct: true, explanationPt: "'Vivo a Roma' significa moro em Roma." },
        { id: "b", text: "Tchau Marco, nos vemos em Roma amanhã.", correct: false, explanationPt: "Marco está se apresentando." },
      ],
    },
  ],
  ja: [
    {
      id: "ja-q1",
      levelTarget: "A1",
      type: "listening",
      title: "1. 基本的な自己紹介 (Autoapresentação)",
      prompt: "音声を聞いてください (Escute o áudio):",
      audioPhrase: "はじめまして、田中です。よろしくお願いします。 (Hajimemashite, Tanaka desu. Yoroshiku onegaishimasu.)",
      options: [
        { id: "a", text: "Muito prazer, sou o Tanaka. Conto com sua gentileza.", correct: true, explanationPt: "Fórmula clássica japonesa de autoapresentação (Hajimemashite)." },
        { id: "b", text: "Com licença, onde fica a casa do Tanaka?", correct: false, explanationPt: "É uma saudação de introdução cordial." },
      ],
    },
  ],
  "el-koine": [
    {
      id: "el-q1",
      levelTarget: "A1",
      type: "reading",
      title: "1. Vocabulário Fundamental",
      prompt: "Qual é a tradução clássica de 'ὁ λόγος' (ho logos)?",
      options: [
        { id: "a", text: "A palavra / O verbo", correct: true, explanationPt: "Significado clássico teológico e literário do termo grego." },
        { id: "b", text: "A casa", correct: false, explanationPt: "Casa é 'ὁ οἶκος'." },
      ],
    },
  ],
};

export function getPlacementQuestionsForLanguage(language: SupportedLanguage): PlacementQuestion[] {
  return PLACEMENT_QUESTIONS[language] || PLACEMENT_QUESTIONS.en;
}

export function evaluatePlacementTest(
  language: SupportedLanguage,
  correctCount: number,
  totalCount: number
): CefrResult {
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  let level: "A1" | "A2" | "B1" | "B2" | "C1" = "A1";
  let titlePt = "A1 - Iniciante Descoberta";
  let descriptionPt = "Você compreende saudações e frases cotidianas essenciais. Com a prática diária de 5 minutos, você logo desbloqueará a autonomia A2!";
  let badgeIcon = "🌱";

  if (percentage >= 90) {
    level = "B2";
    titlePt = "B2 - Intermediário Avançado / Independente";
    descriptionPt = "Excelente discernimento sintático e auditivo! Você é capaz de dialogar com fluência e entender nuances culturais com os tutores.";
    badgeIcon = "🦅";
  } else if (percentage >= 75) {
    level = "B1";
    titlePt = "B1 - Autonomia Prática & Conversação";
    descriptionPt = "Muito bom! Você consegue se virar em viagens, defender ideias e entender o fio condutor da conversa falada.";
    badgeIcon = "⚡";
  } else if (percentage >= 50) {
    level = "A2";
    titlePt = "A2 - Básico Consolidado";
    descriptionPt = "Você já domina estruturas essenciais do passado e presente. O treino de fala nos cenários acelerará seu salto para o B1!";
    badgeIcon = "🔥";
  }

  return {
    level,
    scorePercent: percentage,
    correctAnswers: correctCount,
    totalQuestions: totalCount,
    titlePt,
    descriptionPt,
    badgeIcon,
  };
}
