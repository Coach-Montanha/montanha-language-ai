import { SupportedLanguage } from "@/types/language";

export interface DailySprintExercise {
  reading: {
    title: string;
    passage: string;
    translationPt: string;
    question: string;
    options: { text: string; correct: boolean }[];
  };
  listening: {
    phraseToListen: string;
    translation: string;
    question: string;
    options: { text: string; correct: boolean }[];
  };
  speaking: {
    promptPt: string;
    phrase: string;
    phonetic: string;
    translationPt: string;
  };
}

export const DAILY_SPRINT_BY_LANGUAGE: Record<SupportedLanguage, DailySprintExercise> = {
  // ================= 🇩🇪 ALEMÃO =================
  de: {
    reading: {
      title: "Morgenroutine in Berlin",
      passage:
        "Lukas beginnt seinen Tag mit einem starken Kaffee und einer frischen Brezel in Berlin. Er fährt gern mit der U-Bahn zur Arbeit, weil er dort in Ruhe ein deutsches Buch lesen kann.",
      translationPt:
        "Lukas começa seu dia com um café forte e um pretzel fresco em Berlim. Ele gosta de ir de metrô para o trabalho, porque lá ele pode ler um livro em alemão com tranquilidade.",
      question: "Por que Lukas gosta de ir de metrô (U-Bahn) para o trabalho?",
      options: [
        { text: "Porque é de graça e muito rápido", correct: false },
        { text: "Porque ele pode ler um livro em alemão com tranquilidade", correct: true },
        { text: "Porque ele compra café dentro do trem", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Könnten Sie mir bitte sagen, um wie viel Uhr der nächste Zug nach München abfährt?",
      translation: "Você poderia por favor me dizer a que horas parte o próximo trem para Munique?",
      question: "O que a pessoa está perguntando no áudio?",
      options: [
        { text: "Onde fica a plataforma de embarque", correct: false },
        { text: "A que horas parte o próximo trem para Munique", correct: true },
        { text: "Quanto custa o bilhete de ida e volta", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em alemão com confiança:",
      phrase: "Ich möchte mein Deutsch jeden Tag verbessern.",
      phonetic: "[ ikh mêkh-te máin dóitsh iê-den ták fer-bé-sern ]",
      translationPt: "Quero melhorar meu alemão todos os dias.",
    },
  },

  // ================= 🇪🇸 ESPANHOL =================
  es: {
    reading: {
      title: "Mañana soleada en Madrid",
      passage:
        "Carlos comienza la mañana con un café con leche y churros en la Gran Vía. Siempre prefiere caminar por el centro de Madrid porque la ciudad está llena de vida y alegría.",
      translationPt:
        "Carlos começa a manhã com um café com leite e churros na Gran Vía. Ele sempre prefere caminhar pelo centro de Madrid porque a cidade é cheia de vida e alegria.",
      question: "Por que Carlos prefere caminhar pelo centro de Madrid?",
      options: [
        { text: "Porque não há transporte público disponível", correct: false },
        { text: "Porque a cidade está cheia de vida e alegria", correct: true },
        { text: "Porque ele quer comprar roupas novas", correct: false },
      ],
    },
    listening: {
      phraseToListen: "¿Podría decirme por favor a qué hora sale el próximo tren de alta velocidad hacia Barcelona?",
      translation: "Poderia por favor me dizer a que horas sai o próximo trem de alta velocidade para Barcelona?",
      question: "O que o passageiro está perguntando?",
      options: [
        { text: "Onde fica o vagão restaurante", correct: false },
        { text: "A que horas sai o próximo trem de alta velocidade para Barcelona", correct: true },
        { text: "Se há desconto para estudantes", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em espanhol:",
      phrase: "Quiero hablar español con total confianza y fluidez.",
      phonetic: "[ qui-ê-ro a-blár es-pa-nhól con to-tál con-fi-án-sa i flui-dês ]",
      translationPt: "Quero falar espanhol com total confiança e fluidez.",
    },
  },

  // ================= 🇮🇹 ITALIANO =================
  it: {
    reading: {
      title: "Mattina al bar a Roma",
      passage:
        "Marco prende un caffè espresso al banco e un cornetto caldo ogni mattina vicino a Piazza Navona. Adora salutare il barista e scambiare due chiacchiere prima di andare in ufficio.",
      translationPt:
        "Marco toma um café espresso no balcão e um croissant quentinho toda manhã perto da Piazza Navona. Ele adora cumprimentar o barista e bater um papo antes de ir para o escritório.",
      question: "O que Marco costuma fazer antes de ir para o trabalho?",
      options: [
        { text: "Fazer uma longa corrida pela cidade", correct: false },
        { text: "Tomar um café espresso no balcão e bater um papo com o barista", correct: true },
        { text: "Ler jornais em uma biblioteca", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Scusi, potrebbe dirmi da quale binario parte il treno Frecciarossa per Milano?",
      translation: "Com licença, você poderia me dizer de qual plataforma parte o trem Frecciarossa para Milão?",
      question: "O que o passageiro deseja saber?",
      options: [
        { text: "Quanto tempo dura a viagem até Milão", correct: false },
        { text: "De qual plataforma (binario) parte o trem Frecciarossa para Milão", correct: true },
        { text: "Onde comprar uma garrafa de água", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em italiano:",
      phrase: "Vorrei imparare l'italiano ogni giorno con passione.",
      phonetic: "[ vor-rêi im-pa-rá-re li-ta-liá-no ó-nhi djór-no con pas-sió-ne ]",
      translationPt: "Gostaria de aprender italiano todos os dias com paixão.",
    },
  },

  // ================= 🇫🇷 FRANCÊS =================
  fr: {
    reading: {
      title: "Matinée parisienne à Montmartre",
      passage:
        "Julien achète un croissant chaud et une baguette tradition dans sa boulangerie préférée à Montmartre. Il adore l'odeur du pain frais qui embaume toute la rue le matin.",
      translationPt:
        "Julien compra um croissant quente e uma baguete tradicional em sua padaria favorita em Montmartre. Ele adora o cheiro do pão fresco que perfuma toda a rua pela manhã.",
      question: "O que Julien mais aprecia na sua rotina matinal em Montmartre?",
      options: [
        { text: "O movimento de carros na avenida", correct: false },
        { text: "O cheiro do pão fresco da padaria que perfuma a rua", correct: true },
        { text: "Os museus que abrem cedo", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Pardon, pourriez-vous m'indiquer à quelle heure part le prochain TGV pour Lyon ?",
      translation: "Com licença, o senhor poderia me indicar a que horas parte o próximo TGV para Lyon?",
      question: "Qual é a dúvida do passageiro no áudio?",
      options: [
        { text: "Onde fica o guichê de bagagens", correct: false },
        { text: "A que horas parte o próximo TGV (trem rápido) para Lyon", correct: true },
        { text: "Se é permitido viajar com animais", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em francês:",
      phrase: "Je veux parler français avec élégance et clarté.",
      phonetic: "[ jê vô par-lê fran-sê a-vék ê-lê-gãns ê clar-tê ]",
      translationPt: "Quero falar francês com elegância e clareza.",
    },
  },

  // ================= 🇯🇵 JAPONÊS =================
  ja: {
    reading: {
      title: "Tokyo no asa (Manhã em Tóquio)",
      passage:
        "Kenji wa asa hayaku konbini de onigiri to ocha o kaimasu. Densha no naka de shizuka ni nihongo no hon o yomu no ga daisuki desu.",
      translationPt:
        "Kenji compra onigiri (bolinho de arroz) e chá verde bem cedo no konbini. Ele adora ler livros em japonês em silêncio dentro do trem.",
      question: "O que Kenji gosta de fazer dentro do trem?",
      options: [
        { text: "Dormir até chegar na estação final", correct: false },
        { text: "Ler livros em japonês em silêncio", correct: true },
        { text: "Conversar ao telefone", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Sumimasen, kono densha wa Shibuya-eki ni tomarimasu ka?",
      translation: "Com licença, este trem para na estação de Shibuya?",
      question: "O que a pessoa está perguntando?",
      options: [
        { text: "Qual é o valor do bilhete para Shibuya", correct: false },
        { text: "Se este trem para na estação de Shibuya", correct: true },
        { text: "A que horas o metrô encerra as atividades", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em japonês (Romaji ou Kana):",
      phrase: "Konnichiwa! Mainichi Nihongo o tanoshiku benkyou shimasu.",
      phonetic: "[ con-ni-tchi-ua! mái-ni-tchi ni-rôn-go o ta-no-chi-ku ben-kiô chi-mas ]",
      translationPt: "Olá! Estudo japonês todos os dias com alegria.",
    },
  },

  // ================= 🇬🇷 GREGO KOINÉ =================
  "el-koine": {
    reading: {
      title: "O Prólogo do Evangelho de João",
      passage:
        "Ἐν ἀρχῇ ἦν ὁ Λόγος, καὶ ὁ Λόγος ἦν πρὸς τὸν Θεόν. (En archêi ên ho Lógos, kaì ho Lógos ên pròs tòn Theón.) As palavras expressam o mistério da revelação divina desde a eternidade.",
      translationPt:
        "No princípio era o Verbo, e o Verbo estava com Deus. Estas palavras atemporais revelam a profundidade do texto bíblico em seu original grego.",
      question: "O que significa o termo grego 'ho Lógos' (ὁ Λόγος) nesta passagem célebre?",
      options: [
        { text: "A terra e as montanhas", correct: false },
        { text: "O Verbo / A Palavra", correct: true },
        { text: "O barco dos pescadores", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Cháris hymîn kaì eirênê apò Theou patròs hêmôn kaì Kyríou Iêsoû Christoû.",
      translation: "Graça e paz a vós da parte de Deus nosso Pai e do Senhor Jesus Cristo.",
      question: "O que representa a saudação ouvida no áudio?",
      options: [
        { text: "Um pedido de desculpas em uma viagem marítima", correct: false },
        { text: "A bênção bíblica tradicional apostólica: Graça e Paz", correct: true },
        { text: "Uma transação comercial no porto de Corinto", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em grego koiné:",
      phrase: "Cháirete! Cháris kaì eirênê hymîn.",
      phonetic: "[ khái-re-te! khá-ris cái ei-rê-nê ri-mîn ]",
      translationPt: "Alegrai-vos! Graça e paz a vós.",
    },
  },

  // ================= 🇺🇸 INGLÊS =================
  en: {
    reading: {
      title: "Morning Routine in Chicago",
      passage:
        "Sarah starts her day with a cup of black coffee and reads the news for ten minutes. She loves taking the morning train because it is quiet, comfortable, and relaxing.",
      translationPt:
        "Sarah começa o dia com uma xícara de café preto e lê as notícias por dez minutos. Ela adora pegar o trem da manhã porque é silencioso, confortável e relaxante.",
      question: "Why does Sarah like taking the morning train?",
      options: [
        { text: "Because it's fast and crowded", correct: false },
        { text: "Because it is quiet, comfortable, and relaxing", correct: true },
        { text: "Because she can buy coffee on the train", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Could you please tell me what time the flight departs?",
      translation: "Você poderia por favor me dizer a que horas o voo decola / parte?",
      question: "O que a pessoa está perguntando no áudio?",
      options: [
        { text: "Onde fica o portão de embarque", correct: false },
        { text: "Que horas o voo decola / parte", correct: true },
        { text: "Quanto custa a passagem de volta", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em inglês:",
      phrase: "I want to speak English fluently and naturally every day.",
      phonetic: "[ ái uónt tu spík ín-glish flu-ent-li énd né-tchu-ra-li év-ri dêi ]",
      translationPt: "Quero falar inglês fluentemente e naturalmente todos os dias.",
    },
  },

  // ================= 🇷🇺 RUSSO =================
  ru: {
    reading: {
      title: "Утренний чай в Санкт-Петербурге",
      passage:
        "Дмитрий начинает свой день с горячего чёрного чая с лимоном и свежего пирожка. Он любит гулять по Невскому проспекту утром, когда город только просыпается и улицы спокойные.",
      translationPt:
        "Dmitri começa o seu dia com um chá preto bem quente com limão e um pirozhok fresco. Ele adora caminhar pela Avenida Névski pela manhã, quando a cidade está apenas acordando e as ruas estão tranquilas.",
      question: "Por que Dmitri gosta de caminhar pela Avenida Névski pela manhã?",
      options: [
        { text: "Porque todas as lojas estão fechadas", correct: false },
        { text: "Porque a cidade está acordando e as ruas estão tranquilas", correct: true },
        { text: "Porque o metrô não funciona de manhã", correct: false },
      ],
    },
    listening: {
      phraseToListen: "Осторожно, двери закрываются. Следующая станция — Охотный Ряд.",
      translation: "Cuidado, as portas estão se fechando. Próxima estação: Okhotny Ryad.",
      question: "Qual aviso importante está sendo anunciado no metrô?",
      options: [
        { text: "O trem está sem energia e vai parar", correct: false },
        { text: "As portas estão se fechando e a próxima estação é Okhotny Ryad", correct: true },
        { text: "É proibido usar fones de ouvido no vagão", correct: false },
      ],
    },
    speaking: {
      promptPt: "Fale em voz alta ou digite em russo:",
      phrase: "Я хочу говорить по-русски красиво и уверенно каждый день.",
      phonetic: "[ ya kha-tchú ga-va-rít' pa-rús-ski kra-sí-va i u-vyé-ren-na kázh-dyy dyen' ]",
      translationPt: "Quero falar russo de forma bonita e confiante todos os dias.",
    },
  },
};

export function getDailySprintForLanguage(language: SupportedLanguage): DailySprintExercise {
  return DAILY_SPRINT_BY_LANGUAGE[language] || DAILY_SPRINT_BY_LANGUAGE.en;
}
