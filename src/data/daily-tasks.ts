import { SupportedLanguage } from "@/types/language";

export interface MiniLessonKnowledgeCheckOption {
  text: string;
  correct: boolean;
  explanationPt: string;
}

export interface PedagogicalMiniLesson {
  objective: string;
  concept: string;
  goldTip: string;
  examplePhrase: string;
  examplePhonetic: string;
  examplePt: string;
  knowledgeCheck: {
    question: string;
    options: MiniLessonKnowledgeCheckOption[];
  };
}

export interface DailySprintExercise {
  miniLesson: PedagogicalMiniLesson;
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
    miniLesson: {
      objective: "Dominar a estrutura de orações causais com a conjunção subordinativa 'weil'.",
      concept: "Em alemão, conectivos subordinativos como 'weil' (porque/pois) deslocam o verbo conjugado para o final exato da oração subordinada.",
      goldTip: "Regra de ouro: 'weil' chuta o verbo conjugado para o final da frase (...weil ich jeden Tag Deutsch lerne).",
      examplePhrase: "Ich lerne jeden Tag Deutsch, weil ich in Berlin arbeiten möchte.",
      examplePhonetic: "[ ikh lér-ne iê-den ták dóitsh, vail ikh in bêr-lín ár-bai-ten mêkh-te ]",
      examplePt: "Estudo alemão todos os dias porque quero trabalhar em Berlim.",
      knowledgeCheck: {
        question: "Qual das opções abaixo segue a ordem correta das palavras após a conjunção 'weil'?",
        options: [
          {
            text: "...weil ich trinke morgens gerne Kaffee",
            correct: false,
            explanationPt: "Incorreto: com a conjunção 'weil', o verbo conjugado não pode permanecer na segunda posição.",
          },
          {
            text: "...weil ich morgens gerne Kaffee trinke",
            correct: true,
            explanationPt: "Perfeito! O verbo conjugado 'trinke' foi enviado com precisão para a última posição da oração subordinada.",
          },
          {
            text: "...weil Kaffee morgens ich trinke gerne",
            correct: false,
            explanationPt: "Incorreto: o pronome sujeito 'ich' deve suceder imediatamente a conjunção subordinativa.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Diferenciar com precisão e naturalidade o uso dos verbos 'ser' e 'estar'.",
      concept: "O verbo 'ser' expressa essência, identidade, profissão e características permanentes. O verbo 'estar' expressa localização espacial, humor e estados temporários.",
      goldTip: "Regra de ouro: Essência e traços permanentes = 'ser'. Estado passageiro ou localização = 'estar'.",
      examplePhrase: "Soy de Brasil y trabajo mucho, pero hoy estoy muy tranquilo en Madrid.",
      examplePhonetic: "[ sói de bra-síl i tra-bá-rho mú-tcho, pê-ro ói es-tói mui tran-quí-lo en ma-dríd ]",
      examplePt: "Sou do Brasil e trabalho muito, mas hoje estou muito tranquilo em Madrid.",
      knowledgeCheck: {
        question: "Para dizer que alguém está temporariamente ocupado neste momento, qual é a opção correta?",
        options: [
          {
            text: "Mi amigo es muy ocupado en este momento",
            correct: false,
            explanationPt: "Incorreto: 'ser ocupado' soaria como uma característica permanente e intrínseca da pessoa.",
          },
          {
            text: "Mi amigo está muy ocupado en este momento",
            correct: true,
            explanationPt: "¡Excelente! O verbo 'estar' expressa com precisão o estado temporário no momento presente.",
          },
          {
            text: "Mi amigo tiene muy ocupado en este momento",
            correct: false,
            explanationPt: "Incorreto: em espanhol não se utiliza o verbo 'tener' para estados momentâneos de ocupação.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Dominar a concordância do verbo 'piacere' com substantivos no singular e no plural.",
      concept: "Em italiano, a estrutura do verbo 'piacere' funciona como 'agrada a mim'. Por isso, concorda com a coisa apreciada: 'mi piace' (singular) e 'mi piacciono' (plural).",
      goldTip: "Regra de ouro: Se a coisa for uma só: 'mi piace'. Se forem duas ou mais: 'mi piacciono' (ex: 'mi piace la pasta' vs 'mi piacciono i musei')!",
      examplePhrase: "Mi piace molto viaggiare in treno e mi piacciono le città storiche italiane.",
      examplePhonetic: "[ mi piá-tche mól-to vi-a-djar in trê-no e mi piá-tchô-no le tchi-tá stó-ri-ke i-ta-liá-ne ]",
      examplePt: "Eu gosto muito de viajar de trem e gosto das cidades históricas italianas.",
      knowledgeCheck: {
        question: "Como dizer 'Eu gosto dos cafés italianos' (cafés no plural) de forma correta?",
        options: [
          {
            text: "Io piaccio molto i caffè italiani",
            correct: false,
            explanationPt: "Incorreto: não se conjuga 'piacere' com 'io' para expressar aquilo que você aprecia.",
          },
          {
            text: "Mi piacciono molto i caffè italiani",
            correct: true,
            explanationPt: "Bravissimo! Como 'i caffè' é um elemento no plural, a forma correta é 'mi piacciono'.",
          },
          {
            text: "Mi piace molto i caffè italiani",
            correct: false,
            explanationPt: "Incorreto: 'mi piace' é restrito exclusivamente a elementos no singular.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Usar com precisão os artigos partitivos ('du', 'de la', 'de l'', 'des') ao falar de consumo.",
      concept: "O francês sempre exige o artigo partitivo para expressar porções indeterminadas de alimentos e bebidas: 'du' (masculino), 'de la' (feminino), 'de l'' (antes de vogal) e 'des' (plural).",
      goldTip: "Regra de ouro: Em francês nunca se diz 'comer pão' solto; diz-se 'manger du pain' (comer uma parte do pão)!",
      examplePhrase: "Le matin, je prends du café chaud avec du lait et de la bonne brioche.",
      examplePhonetic: "[ lê ma-tãn, jê prran diu ca-fê chô a-vék diu lé e dê la bón bri-ósh ]",
      examplePt: "Pela manhã, tomo café quente com leite e um bom brioche.",
      knowledgeCheck: {
        question: "Como pedir 'água mineral' (eau é palavra feminina iniciada por vogal) de forma correta?",
        options: [
          {
            text: "Je voudrais le eau minérale, s'il vous plaît",
            correct: false,
            explanationPt: "Incorreto: 'le' é masculino e causa choque fonético com 'eau'.",
          },
          {
            text: "Je voudrais de l'eau minérale, s'il vous plaît",
            correct: true,
            explanationPt: "Parfait! O partitivo elidido 'de l'' é a forma correta antes de palavras iniciadas por vogal.",
          },
          {
            text: "Je voudrais un de eau minérale, s'il vous plaît",
            correct: false,
            explanationPt: "Incorreto: essa estrutura sintática não existe na língua francesa.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Compreender o funcionamento das partículas fundamentais 'は' (wa - tópico) e 'を' (o - objeto).",
      concept: "Em japonês, partículas pós-posicionais determinam a função gramatical: 'は' introduz o grande tópico do enunciado, enquanto 'を' marca o objeto direto que recebe a ação do verbo.",
      goldTip: "Regra de ouro: A estrutura básica é sempre Tópico (wa) + Objeto (o) + Verbo conjugado no final da oração!",
      examplePhrase: "わたしは まいにち 日本語を べんきょうします (Watashi wa mainichi Nihongo o benkyou shimasu).",
      examplePhonetic: "[ ua-ta-shi ua mái-ni-tchi ni-rôn-go o ben-kiô chi-mass ]",
      examplePt: "Eu estudo japonês todos os dias.",
      knowledgeCheck: {
        question: "Qual partícula conecta a palavra 'chá verde' (おちゃ - ocha) ao verbo 'beber' (のみます - nomimasu)?",
        options: [
          {
            text: "おちゃ は のみます (Ocha wa nomimasu)",
            correct: false,
            explanationPt: "'は' marcaria o chá como tópico geral ('quanto ao chá...'), não como objeto direto que está sendo bebido.",
          },
          {
            text: "おちゃ を のみます (Ocha o nomimasu)",
            correct: true,
            explanationPt: "Sugoi! A partícula 'を' (lida como 'o') indica especificamente o objeto que sofre a ação verbal de beber.",
          },
          {
            text: "おちゃ に のみます (Ocha ni nomimasu)",
            correct: false,
            explanationPt: "'に' expressa direção, destino ou horário, não o objeto de consumo.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Identificar o Sujeito (Nominativo) e o Objeto Direto (Acusativo) pelas desinências casuais.",
      concept: "No Grego do Novo Testamento, a ordem das palavras é livre porque o papel de cada vocábulo é determinado por sua desinência: terminação em '-ος' (sujeito) e '-ον' (objeto direto).",
      goldTip: "Regra de ouro: Quem pratica a ação tem desinência nominativa (ὁ λόγος); quem sofre a ação tem desinência acusativa (τὸν λόγον)!",
      examplePhrase: "ὁ μαθητὴς γινώσκει τὴν ἀλήθειαν (Ho mathetés ginóskei tèn alétheian).",
      examplePhonetic: "[ ro ma-tê-tês gui-nós-kei tên a-lê-têi-an ]",
      examplePt: "O discípulo conhece a verdade.",
      knowledgeCheck: {
        question: "Na oração 'ὁ ποιμὴν φυλάσσει τὸ ποίμνιον', quem está realizando a ação de guardar?",
        options: [
          {
            text: "O rebanho (τὸ ποίμνιον)",
            correct: false,
            explanationPt: "O rebanho recebe a ação, figurando como objeto direto.",
          },
          {
            text: "O pastor (ὁ ποιμὴν)",
            correct: true,
            explanationPt: "Exato! 'ὁ ποιμὴν' está no caso nominativo (artigo 'ὁ'), sendo o sujeito ativo que protege e guarda.",
          },
          {
            text: "Os lobos da floresta",
            correct: false,
            explanationPt: "A oração não cita lobos; o sujeito expresso é o pastor.",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Dominar o contraste entre Present Simple (fatos/hábitos) e Present Continuous (ações neste instante).",
      concept: "Use o Present Simple para hábitos e fatos constantes ('I work', 'I drink coffee'). Use o Present Continuous para ações que estão em andamento no exato momento da fala ('I am practicing right now').",
      goldTip: "Regra de ouro: Ação no instante presente sempre usa 'to be' + verbo terminado em '-ing' (am/is/are + -ing)!",
      examplePhrase: "I usually study at night, but right now I am practicing with my native tutor.",
      examplePhonetic: "[ ai iú-ju-a-li stâ-di ét náit, bât ráit náu ai ém prék-ti-sing uíd mai nêi-tiv tiú-tor ]",
      examplePt: "Eu costumo estudar à noite, mas agora estou praticando com meu tutor nativo.",
      knowledgeCheck: {
        question: "Qual das frases expressa com perfeição o que você está realizando neste exato momento?",
        options: [
          {
            text: "I study new vocabulary words every single morning",
            correct: false,
            explanationPt: "Esta frase descreve sua rotina habitual das manhãs, não a ação em andamento agora.",
          },
          {
            text: "I am learning English with my private tutor right now",
            correct: true,
            explanationPt: "Spot on! 'Am learning' combina o verbo auxiliar to be com '-ing' indicando a ação no instante presente.",
          },
          {
            text: "I am learn English with my private tutor right now",
            correct: false,
            explanationPt: "Incorreto: após 'am', o verbo principal deve obrigatoriamente levar o sufixo '-ing' ('learning').",
          },
        ],
      },
    },
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
    miniLesson: {
      objective: "Usar o caso Preposicional (местный падеж) para indicar localização em cidades e edifícios.",
      concept: "Para responder à pergunta 'Onde?' (Где?), substantivos russos recebem a preposição 'в' (dentro de) ou 'на' (na superfície/evento) e a terminação '-е'.",
      goldTip: "Regra de ouro: Para dizer 'em um lugar': preposição 'в' + trocar a terminação por '-е' (Москва -> в Москве, театр -> в театре)!",
      examplePhrase: "Я сейчас нахожусь в уютном кафе в центре Санкт-Петербурга.",
      examplePhonetic: "[ ya sei-tchás na-kha-jús' v u-yút-nam ka-fê v tsên-tryê sankt-pi-tir-búr-ga ]",
      examplePt: "Eu estou agora em um café aconchegante no centro de São Petersburgo.",
      knowledgeCheck: {
        question: "Como se diz corretamente 'no museu' (museu = музей) em russo?",
        options: [
          {
            text: "в музей (v muzey)",
            correct: false,
            explanationPt: "Incorreto: esta forma é acusativo de movimento ('para o museu'), não localização estática.",
          },
          {
            text: "в музее (v muzeye)",
            correct: true,
            explanationPt: "Отлично! A terminação final muda para '-e' no caso preposicional de localização estática.",
          },
          {
            text: "на музей (na muzey)",
            correct: false,
            explanationPt: "Incorreto: museu é um edifício fechado, exigindo a preposição 'в' com a terminação '-е'.",
          },
        ],
      },
    },
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
