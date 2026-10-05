import { WeeklyMission, SupportedLanguage } from "@/types/language";

export const RPG_AVATAR_MISSIONS: WeeklyMission[] = [
  // ==========================================
  // MISSÃO RPG 1: A GUILDA DOS AVENTUREIROS
  // ==========================================
  {
    id: "rpg-guild-registration",
    week: 101, // Marcador de semana RPG
    weekTitle: "Missões do Avatar: Jornada Rúnica",
    title: "Registro na Guilda dos Aventureiros",
    icon: "ShieldAlert",
    language: "en",
    category: "rpg",
    focus: "Apresentação pessoal, classe de herói e escolha de contrato",
    situationDescription:
      "Você chega à movimentada Guilda dos Aventureiros. O Mestre da Guilda te recebe no balcão e pergunta seu nome, sua especialidade de combate e qual missão você busca.",
    aiRole: "Mestre da Guilda (Guildmaster Kaelen)",
    userRole: "Aventureiro Recém-Chegado",
    openingAiDialogue:
      "Welcome to the Grand Adventurers' Guild! I see determination in your eyes. What is your name, traveler, and what quest brings you to our hall?",
    openingAiPhonetic:
      "Uél-kam tu da Grénd Éd-vên-tchur-erz Guíld! Ái sí di-têr-mi-nêi-shân in iór áiz. Uót íz iór nêim, tré-vê-ler, énd uót kuést bríngz iú tu áu-er hól?",
    openingAiPortuguese:
      "Bem-vindo à Grande Guilda dos Aventureiros! Vejo determinação em seus olhos. Qual é o seu nome, viajante, e qual missão o traz ao nosso salão?",
    survivalObjective:
      "Dizer seu nome, sua classe ou habilidade e solicitar uma missão de nível aprendiz ou intermediário.",
    survivalTipsPt:
      "Use 'My name is...', 'I specialize in...' e 'Do you have any bounties or quests available?' para soar natural.",
    sampleResponses: [
      "Hello! I am a traveling linguist and swordsman looking for exploration quests.",
      "Do you have any beginner bounties or escort missions available today?",
      "What rewards can an adventurer earn upon completing a contract here?",
    ],
    structuredSuggestions: [
      {
        english: "Hello! I am an adventurer looking for exploration quests.",
        phonetic: "re-lóu! ái ém én éd-vên-tchur-er lú-kin fór éks-plo-rêi-shân kuésts.",
        portuguese: "Olá! Sou um aventureiro procurando por missões de exploração.",
      },
      {
        english: "Do you have any bounties or scouting missions available today?",
        phonetic: "du iú rév é-ni báun-tiz ór skáu-tin mí-shênz a-vêi-la-bêl tu-dêi?",
        portuguese: "Você tem alguma recompensa ou missão de reconhecimento disponível hoje?",
      },
      {
        english: "What kind of rewards can I earn for completing these tasks?",
        phonetic: "uót káind óv ri-uórds kén ái ârn fór kôm-plí-tin díz tésks?",
        portuguese: "Que tipo de recompensas posso ganhar por concluir essas tarefas?",
      },
    ],
    script: [
      {
        id: "rg1-1",
        speaker: "Mestre da Guilda",
        roleType: "ai",
        english: "Welcome to the Guild! What is your name and specialty?",
        phonetic: "Uél-kam tu da Guíld! Uót íz iór nêim énd spe-shiál-ti?",
        portuguese: "Bem-vindo à Guilda! Qual é o seu nome e sua especialidade?",
      },
      {
        id: "rg1-2",
        speaker: "Você",
        roleType: "user",
        english: "Hello! I am an adventurer ready to take on my first quest.",
        phonetic: "Re-lóu! Ái ém én éd-vên-tchur-er ré-di tu têik ón mái fârst kuést.",
        portuguese: "Olá! Sou um aventureiro pronto para assumir minha primeira missão.",
      },
      {
        id: "rg1-3",
        speaker: "Mestre da Guilda",
        roleType: "ai",
        english: "Impressive! We have a scouting mission in the Whispering Woods. Are you prepared?",
        phonetic: "Im-pré-siv! Uí rév a skáu-tin mí-shân in da Uís-pe-rin Uúdz. Ár iú pri-pêrd?",
        portuguese: "Impressionante! Temos uma missão de patrulha nos Bosques Sussurrantes. Está preparado?",
      },
      {
        id: "rg1-4",
        speaker: "Você",
        roleType: "user",
        english: "Yes, I am well-equipped and ready to depart immediately.",
        phonetic: "Iés, ái ém uél-i-kuípt énd ré-di tu di-párt i-mí-di-êt-li.",
        portuguese: "Sim, estou bem equipado e pronto para partir imediatamente.",
      },
    ],
  },

  // ==========================================
  // MISSÃO RPG 2: A TAVERNA DOS TRÊS REINOS
  // ==========================================
  {
    id: "rpg-tavern-rumors",
    week: 101,
    weekTitle: "Missões do Avatar: Jornada Rúnica",
    title: "Na Taverna dos Três Reinos",
    icon: "Coffee",
    language: "en",
    category: "rpg",
    focus: "Pedir poções/refeições e ouvir rumores sobre tesouros",
    situationDescription:
      "Após uma longa caminhada, você entra na Taverna dos Três Reinos. O taberneiro elfo limpa uma caneca e pergunta o que você vai beber e comer para recarregar sua energia.",
    aiRole: "Taberneiro Élfico (Barkeep Elena)",
    userRole: "Viajante Cansado e Curioso",
    openingAiDialogue:
      "Rest your boots by the hearth, wanderer! We have spiced cider, roasted dragon-fowl, and energy elixirs. What can I pour for you?",
    openingAiPhonetic:
      "Rést iór búts bái da hárth, uán-de-rer! Uí rév spáist sái-der, róus-téd dré-gôn-fául, énd é-ner-dji i-lík-sirz. Uót kén ái pór fór iú?",
    openingAiPortuguese:
      "Descanse suas botas junto à lareira, viajante! Temos cidra temperada, ave-dragão assada e elixires de energia. O que posso servir para você?",
    survivalObjective:
      "Pedir uma refeição, pedir um elixir de recuperação e perguntar sobre rumores recentes na região.",
    survivalTipsPt:
      "Peça a comida com 'I would like the...', pergunte o preço com 'How many coins is that?' e pergunte sobre boatos com 'Have you heard any interesting rumors lately?'.",
    sampleResponses: [
      "I'll have the spiced cider and a hot stew, please.",
      "How much does a flask of energy elixir cost?",
      "Have you heard any travelers talking about ancient ruins nearby?",
    ],
    structuredSuggestions: [
      {
        english: "I will take a bowl of hot stew and a mug of spiced cider, please.",
        phonetic: "ái uíl têik a bóul óv rót stiú énd a mâg óv spáist sái-der, plíz.",
        portuguese: "Vou querer uma tigela de ensopado quente e uma caneca de cidra temperada, por favor.",
      },
      {
        english: "How much are your health elixirs and stamina potions?",
        phonetic: "ráo mâtch ár iór rélt i-lík-sirz énd sté-mi-na póu-shênz?",
        portuguese: "Quanto custam seus elixires de vida e poções de energia?",
      },
      {
        english: "Have you heard any rumors about the dragon's lair in the mountains?",
        phonetic: "rév iú rêrd é-ni rú-morz a-báut da dré-gônz lér in da máun-tens?",
        portuguese: "Você ouviu algum rumor sobre o covil do dragão nas montanhas?",
      },
    ],
    script: [
      {
        id: "rt1-1",
        speaker: "Taberneiro",
        roleType: "ai",
        english: "Welcome! A cold night outside. What shall I bring to warm your spirits?",
        phonetic: "Uél-kam! A côuld náit áut-sáid. Uót shél ái bríng tu uórm iór spí-rits?",
        portuguese: "Bem-vindo! Noite fria lá fora. O que devo trazer para aquecer seus ânimos?",
      },
      {
        id: "rt1-2",
        speaker: "Você",
        roleType: "user",
        english: "A hot stew and a mug of spiced cider would be wonderful.",
        phonetic: "A rót stiú énd a mâg óv spáist sái-der uûd bí uân-der-ful.",
        portuguese: "Um ensopado quente e uma caneca de cidra temperada seriam maravilhosos.",
      },
      {
        id: "rt1-3",
        speaker: "Taberneiro",
        roleType: "ai",
        english: "Coming right up! You look like a scholar from afar. Seeking adventure?",
        phonetic: "Kâ-min ráit âp! Iú lûk láik a skó-lar frâm a-fár. Sí-kin éd-vên-tchur?",
        portuguese: "Saindo já! Você parece um sábio de terras distantes. Em busca de aventura?",
      },
      {
        id: "rt1-4",
        speaker: "Você",
        roleType: "user",
        english: "Indeed! Tell me, what rumors are the bards singing about tonight?",
        phonetic: "In-díd! Tél mí, uót rú-morz ár da bárdz sín-gin a-báut tu-náit?",
        portuguese: "Com certeza! Diga-me, quais rumores os bardos estão cantando esta noite?",
      },
    ],
  },

  // ==========================================
  // MISSÃO RPG 3: O BAZAR DO MERCADOR ARCANO
  // ==========================================
  {
    id: "rpg-arcane-bazaar",
    week: 102,
    weekTitle: "Missões do Avatar: Artefatos & Mistérios",
    title: "No Bazar do Mercador Arcano",
    icon: "Tag",
    language: "en",
    category: "rpg",
    focus: "Negociar preços de grimórios, anéis rúnicos e pechinchar moedas",
    situationDescription:
      "Você visita as tendas iluminadas por chamas mágicas do Bazar Arcano. Um mercador excêntrico com óculos de lentes prismáticas te apresenta artefatos e pergaminhos raros.",
    aiRole: "Mercador Arcano (Trixie the Relic Trader)",
    userRole: "Comprador e Estudioso de Relíquias",
    openingAiDialogue:
      "Click-whir! Step closer, esteemed collector! I have scrolls from ancient Valyria, runic rings, and glowing feathers. What treasure catches your eye?",
    openingAiPhonetic:
      "Klík-uâr! Stép klóu-ser, es-tímd ko-lék-tor! Ái rév skrôulz frâm êin-shent Va-lí-ria, rú-nik ríngz, énd glóu-in fé-derz. Uót tré-jur kétch-ez iór ái?",
    openingAiPortuguese:
      "Clique-zumbido! Aproxime-se, ilustre colecionador! Tenho pergaminhos da antiga Valíria, anéis rúnicos e penas brilhantes. Qual tesouro chama sua atenção?",
    survivalObjective:
      "Perguntar sobre as propriedades de um item mágico, pedir desconto e fechar a compra por moedas de ouro.",
    survivalTipsPt:
      "Use 'What does this artifact do?', 'Is the price negotiable?' e 'I can offer you 300 coins for both'.",
    sampleResponses: [
      "What magical properties does this ancient lexicon possess?",
      "That price is quite steep! Would you accept 400 gold coins?",
      "I'll take the runic amulet if you include the translation scroll.",
    ],
    structuredSuggestions: [
      {
        english: "What are the special properties of this runic lexicon?",
        phonetic: "uót ár da spé-shal pró-per-tiz óv dís rú-nik lé-ksi-kon?",
        portuguese: "Quais são as propriedades especiais deste léxico rúnico?",
      },
      {
        english: "That is a bit expensive. Can you offer a discount for a fellow scholar?",
        phonetic: "dét íz a bít eks-pén-siv. kén iú ó-fer a dís-kaunt fór a fê-lou skó-lar?",
        portuguese: "Isso está um pouco caro. Pode me oferecer um desconto de colega estudioso?",
      },
      {
        english: "Deal! Here are 350 gold coins for the enchanted amulet.",
        phonetic: "díl! ríer ár trí rân-dred fífti gôuld kóinz fór di en-tchén-téd é-miu-lêt.",
        portuguese: "Fechado! Aqui estão 350 moedas de ouro pelo amuleto encantado.",
      },
    ],
    script: [
      {
        id: "rb1-1",
        speaker: "Mercador",
        roleType: "ai",
        english: "Look at this glowing quill! It writes translations on its own. Only 500 gold coins!",
        phonetic: "Lûk ét dís glóu-in kuíl! It ráits trens-lêi-shênz ón its ôun. Óun-li fáiv rân-dred gôuld kóinz!",
        portuguese: "Olhe para esta pena brilhante! Ela escreve traduções por conta própria. Apenas 500 moedas de ouro!",
      },
      {
        id: "rb1-2",
        speaker: "Você",
        roleType: "user",
        english: "That sounds fascinating, but 500 coins is beyond my current purse.",
        phonetic: "Dét sáundz fé-si-nêi-tin, bât fáiv rân-dred kóinz íz bi-iónd mái kâ-rent pârs.",
        portuguese: "Isso soa fascinante, mas 500 moedas está além do que tenho no bolso agora.",
      },
      {
        id: "rb1-3",
        speaker: "Mercador",
        roleType: "ai",
        english: "Hmm! You have good taste. If you buy the ink flask too, I can do 400 for both!",
        phonetic: "Râm! Iú rév gûd têist. If iú bái di ínk flésk tú, ái kén du fór rân-dred fór bóut!",
        portuguese: "Hmm! Você tem bom gosto. Se levar o frasco de tinta também, faço 400 pelos dois!",
      },
      {
        id: "rb1-4",
        speaker: "Você",
        roleType: "user",
        english: "Excellent! We have a deal. Here are the 400 gold coins.",
        phonetic: "Ék-se-lent! Uí rév a díl. Ríer ár da fór rân-dred gôuld kóinz.",
        portuguese: "Excelente! Temos um acordo. Aqui estão as 400 moedas de ouro.",
      },
    ],
  },

  // ==========================================
  // MISSÃO RPG 4: A FORJA DO FERREIRO RÚNICO
  // ==========================================
  {
    id: "rpg-runic-forge",
    week: 102,
    weekTitle: "Missões do Avatar: Artefatos & Mistérios",
    title: "Na Forja do Mestre Ferreiro",
    icon: "ShieldAlert",
    language: "en",
    category: "rpg",
    focus: "Descrever melhorias de armadura, armas e encomendar equipamento",
    situationDescription:
      "Faíscas mágicas voam na forja subterrânea. O grande mestre ferreiro examina sua espada e manto para gravar runas de proteção e agilidade verbal.",
    aiRole: "Mestre Forjador (Blacksmith Kazan)",
    userRole: "Guerreiro Estudioso",
    openingAiDialogue:
      "The anvil is singing! Show me your gear, polyglot warrior. Do you want to reinforce your blade with syntax runes or weave defensive wards into your mantle?",
    openingAiPhonetic:
      "Di én-vil íz sín-gin! Shóu mí iór guíar, pó-li-glót uó-ri-or. Du iú uónt tu ri-in-fórs iór blêid uíd sín-teks rúnz ór uív di-fén-siv uórdz ín-tu iór mén-tel?",
    openingAiPortuguese:
      "A bigorna está cantando! Mostre-me seu equipamento, guerreiro poliglota. Deseja reforçar sua lâmina com runas de sintaxe ou tecer proteções defensivas em seu manto?",
    survivalObjective:
      "Descrever a melhoria desejada, perguntar quanto tempo leva e negociar o minério ou preço.",
    survivalTipsPt:
      "Diga 'I would like to upgrade my...', 'How long will the forging take?' e 'Can you add lightning runes?'.",
    sampleResponses: [
      "I want to etch runes of clarity onto my twin blades.",
      "How many hours will it take to forge this armor upgrade?",
      "Can you reinforce the leather pauldrons with dragon scales?",
    ],
    structuredSuggestions: [
      {
        english: "I would like to upgrade my runic blades to increase precision.",
        phonetic: "ái uûd láik tu âp-grêid mái rú-nik blêidz tu in-krís pri-sí-jên.",
        portuguese: "Eu gostaria de aprimorar minhas lâminas rúnicas para aumentar a precisão.",
      },
      {
        english: "How long will the blacksmithing take, and what materials do you require?",
        phonetic: "ráo lón uíl da blék-smí-ting têik, énd uót ma-tí-ri-alz du iú ri-kuáir?",
        portuguese: "Quanto tempo levará a forja e quais materiais você necessita?",
      },
      {
        english: "Please reinforce the armor seams with enchanted mithril thread.",
        phonetic: "plíz ri-in-fórs di ár-mor símz uíd en-tchén-téd mí-thril thréd.",
        portuguese: "Por favor reforce as costuras da armadura com fio de mithril encantado.",
      },
    ],
    script: [
      {
        id: "rf1-1",
        speaker: "Ferreiro",
        roleType: "ai",
        english: "Your weapon has served you well, but the edge is dull. What runes shall we engrave?",
        phonetic: "Iór ué-pôn réz sêrvd iú uél, bât di édj íz dâl. Uót rúnz shél uí en-grêiv?",
        portuguese: "Sua arma te serviu bem, mas o fio está gasto. Quais runas devemos gravar?",
      },
      {
        id: "rf1-2",
        speaker: "Você",
        roleType: "user",
        english: "I want runes of swift speech and sharp precision engraved on both sides.",
        phonetic: "Ái uónt rúnz óv suíft spítch énd shárp pri-sí-jên en-grêivd ón bóut sáidz.",
        portuguese: "Quero runas de fala rápida e precisão afiada gravadas em ambos os lados.",
      },
      {
        id: "rf1-3",
        speaker: "Ferreiro",
        roleType: "ai",
        english: "A worthy choice! I need three mithril ingots and two hours at the forge.",
        phonetic: "A uôr-di tchóiz! Ái níd trí mí-thril ín-gôts énd tú áu-erz ét da fórdj.",
        portuguese: "Uma escolha valorosa! Preciso de três lingotes de mithril e duas horas na forja.",
      },
      {
        id: "rf1-4",
        speaker: "Você",
        roleType: "user",
        english: "Here are the ingots. I will wait by the tavern while you work your craft.",
        phonetic: "Ríer ár di ín-gôts. Ái uíl uêit bái da té-vern uáil iú uôrk iór kréft.",
        portuguese: "Aqui estão os lingotes. Esperarei na taverna enquanto você executa sua arte.",
      },
    ],
  },

  // ==========================================
  // MISSÃO RPG 5: A GRANDE BIBLIOTECA DOS CÓDICES
  // ==========================================
  {
    id: "rpg-grand-archives",
    week: 103,
    weekTitle: "Missões do Avatar: Códices dos Reinos",
    title: "Na Grande Biblioteca dos Manuscritos",
    icon: "BookOpen",
    language: "en",
    category: "rpg",
    focus: "Interpretar textos antigos, fazer perguntas acadêmicas e decifrar enigmas",
    situationDescription:
      "Você caminha pelos corredores infinitos da Grande Biblioteca dos Manuscritos. A Alta Arquivista te convida a examinar um códice selado com símbolos misteriosos.",
    aiRole: "Alta Arquivista (High Archivist Elena)",
    userRole: "Pesquisador Poliglota",
    openingAiDialogue:
      "Silence and wonder dwell here, scholar. We have discovered a tablet inscribed with forgotten idioms. Will you help me translate the third stanza?",
    openingAiPhonetic:
      "Sái-lens énd uân-der duél ríer, skó-lar. Uí rév dis-kâ-verd a té-blêt in-skráibd uíd fór-gó-ten í-di-omz. Uíl iú rélp mí trens-lêit da thêrd stén-za?",
    openingAiPortuguese:
      "Silêncio e maravilhamento habitam aqui, estudioso. Descobrimos uma tábua gravada com expressões esquecidas. Você me ajudará a traduzir a terceira estrofe?",
    survivalObjective:
      "Analisar o significado das palavras antigas, propor uma tradução e debater a etimologia.",
    survivalTipsPt:
      "Use 'According to the context...', 'This word derives from...' e 'The hidden meaning seems to be...'.",
    sampleResponses: [
      "Let me examine the root of this ancient verb carefully.",
      "The inscription seems to speak of courage in the face of the unknown.",
      "What references do the older scrolls have on this specific dialect?",
    ],
    structuredSuggestions: [
      {
        english: "Let us examine the root of this verb to find its true meaning.",
        phonetic: "lét âs eg-zé-min da rút óv dís vêrb tu fáind its trú mí-nin.",
        portuguese: "Vamos examinar a raiz deste verbo para encontrar seu verdadeiro significado.",
      },
      {
        english: "The inscription appears to describe a legendary voyage across the western sea.",
        phonetic: "di in-skríp-shân a-píers tu dis-kráib a lé-djen-dé-ri vói-adj a-krós da ués-tern sí.",
        portuguese: "A inscrição parece descrever uma viagem lendária através do mar ocidental.",
      },
      {
        english: "I believe this sentence is an ancient proverb about perseverance.",
        phonetic: "ái bi-lív dís sén-tens íz én êin-shent pró-vêrb a-báut per-se-ví-rens.",
        portuguese: "Acredito que esta frase seja um antigo provérbio sobre perseverança.",
      },
    ],
    script: [
      {
        id: "ga1-1",
        speaker: "Arquivista",
        roleType: "ai",
        english: "Look at the glowing symbols here. How do you interpret this passage?",
        phonetic: "Lûk ét da glóu-in sím-bôlz ríer. Ráo du iú in-têr-prêt dís pé-sedj?",
        portuguese: "Olhe para os símbolos brilhantes aqui. Como você interpreta esta passagem?",
      },
      {
        id: "ga1-2",
        speaker: "Você",
        roleType: "user",
        english: "The glyphs seem to describe a trial that requires wisdom rather than brute strength.",
        phonetic: "Da glífs sím tu dis-kráib a trái-al dét ri-kuáirz uís-dôm ré-der dên brút strénght.",
        portuguese: "Os glifos parecem descrever uma provação que requer sabedoria em vez de força bruta.",
      },
      {
        id: "ga1-3",
        speaker: "Arquivista",
        roleType: "ai",
        english: "Brilliant deduction! Your linguistic instincts are truly sharp.",
        phonetic: "Brí-liant di-dâk-shân! Iór lin-guís-tik ín-stinkts ár trú-li shárp.",
        portuguese: "Dedução brilhante! Seus instintos linguísticos são verdadeiramente aguçados.",
      },
      {
        id: "ga1-4",
        speaker: "Você",
        roleType: "user",
        english: "Thank you, Elena. Let us record this translation in our grand lexicon.",
        phonetic: "Thénk iú, E-lê-na. Lét âs ri-kórd dís trens-lêi-shân in áu-er grénd lé-ksi-kon.",
        portuguese: "Obrigado, Elena. Vamos registrar esta tradução em nosso grande léxico.",
      },
    ],
  },
];
