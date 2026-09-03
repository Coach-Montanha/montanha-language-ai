import { WeeklyMission } from "@/types/language";

export const MULTILINGUAL_MISSIONS: WeeklyMission[] = [
  // =========================================================================
  // 🇩🇪 ALEMÃO (DEUTSCH) - SEMANAS 1, 2 E 3
  // =========================================================================
  {
    id: "de-w1-coffee",
    language: "de",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Berlim",
    title: "Pedir Café & Pretzel em Berlim",
    icon: "Coffee",
    focus: "Cafeteria, comida & bebidas",
    situationDescription:
      "Você entra no Café Mitte em Berlim. O barista te cumprimenta em alemão e você quer pedir um cappuccino com leite de aveia, um pretzel fresco e para viagem.",
    aiRole: "Barista no Café Mitte Berlin",
    userRole: "Cliente em Berlim",
    openingAiDialogue: "Hallo! Willkommen im Café Mitte. Was darf ich dir heute bringen?",
    openingAiPhonetic: "Rá-lo! Vil-kó-men im Ca-fé Mí-te. Vas dárf ikh dír rói-te bríng-en?",
    openingAiPortuguese: "Olá! Bem-vindo ao Café Mitte. O que posso te trazer hoje?",
    survivalObjective: "Pedir um cappuccino grande com leite de aveia (Hafermilch), um pretzel (Brezel) e pedir para viagem (zum Mitnehmen).",
    survivalTipsPt: "Diga 'Ich hätte gerne einen Cappuccino mit Hafermilch zum Mitnehmen, bitte'. Para pedir a conta: 'Was macht das zusammen?'.",
    sampleResponses: [
      "Ich hätte gerne einen großen Cappuccino mit Hafermilch, bitte.",
      "Haben Sie noch frische Brezeln da?",
      "Das ist zum Mitnehmen, bitte. Kann ich mit Karte zahlen?",
    ],
    structuredSuggestions: [
      {
        english: "Ich hätte gerne einen großen Cappuccino mit Hafermilch zum Mitnehmen, bitte.",
        phonetic: "Ikh rêt-te guér-ne ái-nen grô-ssen Ca-pu-tchí-no mit Rá-fer-mílkh tsum Mit-nê-men, bí-te.",
        portuguese: "Eu gostaria de um cappuccino grande com leite de aveia para viagem, por favor.",
      },
      {
        english: "Haben Sie noch frische Brezeln da?",
        phonetic: "Rá-ben zí nókh frí-she Bré-tseln da?",
        portuguese: "Vocês ainda têm pretzels frescos aí?",
      },
      {
        english: "Kann ich kontaktlos mit Karte bezahlen?",
        phonetic: "Kan ikh kon-tákt-lôs mit Kár-te be-tsá-len?",
        portuguese: "Posso pagar por aproximação com cartão?",
      },
    ],
    script: [
      {
        id: "de-w1c-1",
        speaker: "Barista",
        roleType: "ai",
        english: "Hallo! Willkommen im Café Mitte. Was darf ich dir heute bringen?",
        phonetic: "Rá-lo! Vil-kó-men im Ca-fé Mí-te. Vas dárf ikh dír rói-te bríng-en?",
        portuguese: "Olá! Bem-vindo ao Café Mitte. O que posso te trazer hoje?",
      },
      {
        id: "de-w1c-2",
        speaker: "Você",
        roleType: "user",
        english: "Hallo! Ich hätte gerne einen Cappuccino mit Hafermilch und eine Brezel, bitte.",
        phonetic: "Rá-lo! Ikh rêt-te guér-ne ái-nen Ca-pu-tchí-no mit Rá-fer-mílkh unt ái-ne Bré-tsel, bí-te.",
        portuguese: "Olá! Gostaria de um cappuccino com leite de aveia e um pretzel, por favor.",
      },
      {
        id: "de-w1c-3",
        speaker: "Barista",
        roleType: "ai",
        english: "Sehr gern! Hier trinken oder zum Mitnehmen?",
        phonetic: "Zêr guérn! Rír trín-ken ó-der tsum Mit-nê-men?",
        portuguese: "Com prazer! Para beber aqui ou para viagem?",
      },
      {
        id: "de-w1c-4",
        speaker: "Você",
        roleType: "user",
        english: "Zum Mitnehmen bitte. Wie viel kostet das?",
        phonetic: "Tsum Mit-nê-men bí-te. Vi fíl kós-tet das?",
        portuguese: "Para viagem por favor. Quanto custa?",
      },
      {
        id: "de-w1c-5",
        speaker: "Barista",
        roleType: "ai",
        english: "Das macht genau sechs Euro zwanzig. Bitte schön!",
        phonetic: "Das mákht gue-náu zêks Ói-ro tsván-tsikh. Bí-te chên!",
        portuguese: "Dá exatamente seis euros e vinte. Aqui está!",
      },
    ],
  },
  {
    id: "de-w1-train",
    language: "de",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Berlim",
    title: "Comprar Bilhete de Trem na Estação Central",
    icon: "Compass",
    focus: "Transporte, estações & direções",
    situationDescription:
      "Você está na central de atendimento da Deutsche Bahn na Berlin Hauptbahnhof. Precisa comprar uma passagem de trem ICE para Munique para amanhã de manhã.",
    aiRole: "Atendente da Deutsche Bahn",
    userRole: "Viajante",
    openingAiDialogue: "Guten Tag! Wohin soll die Reise gehen? Suchen Sie einen Fernzug?",
    openingAiPhonetic: "Gú-ten Ták! Vo-rín zol di Rái-ze guê-en? Zú-khen zí ái-nen Fêrn-tsuk?",
    openingAiPortuguese: "Bom dia! Para onde será a viagem? Procura um trem de longa distância?",
    survivalObjective: "Pedir passagem de ida (einfache Fahrt) para Munique, assento na janela e horário da manhã.",
    survivalTipsPt: "Diga 'Eine Fahrkarte nach München für morgen früh, bitte'. Para confirmar o assento: 'Mit Sitzplatzreservierung am Fenster'.",
    sampleResponses: [
      "Ich möchte eine Fahrkarte nach München für morgen früh kaufen.",
      "Gibt es einen ICE ohne Umsteigen?",
      "Bitte mit Sitzplatzreservierung am Fenster im Ruhebereich.",
    ],
    structuredSuggestions: [
      {
        english: "Ich möchte eine Fahrkarte nach München für morgen früh kaufen, bitte.",
        phonetic: "Ikh mêkh-te ái-ne Fár-kár-te nakh Mün-khen für mór-guen frü káu-fen, bí-te.",
        portuguese: "Eu gostaria de comprar uma passagem para Munique para amanhã cedo, por favor.",
      },
      {
        english: "Fährt der ICE direkt ohne Umsteigen?",
        phonetic: "Fêrt dêr I-C-E di-rékt ó-ne Um-chtái-guen?",
        portuguese: "O trem ICE vai direto sem baldeação?",
      },
      {
        english: "Ich möchte bitte einen Sitzplatz am Fenster reservieren.",
        phonetic: "Ikh mêkh-te bí-te ái-nen Zíts-plats am Féns-ter re-zer-ví-ren.",
        portuguese: "Gostaria de reservar um assento na janela, por favor.",
      },
    ],
    script: [
      {
        id: "de-w1t-1",
        speaker: "Atendente",
        roleType: "ai",
        english: "Guten Tag! Wohin soll die Reise gehen?",
        phonetic: "Gú-ten Ták! Vo-rín zol di Rái-ze guê-en?",
        portuguese: "Bom dia! Para onde será a viagem?",
      },
      {
        id: "de-w1t-2",
        speaker: "Você",
        roleType: "user",
        english: "Guten Tag! Eine Fahrkarte nach München für morgen früh bitte.",
        phonetic: "Gú-ten Ták! Ái-ne Fár-kár-te nakh Mün-khen für mór-guen frü bí-te.",
        portuguese: "Bom dia! Uma passagem para Munique para amanhã de manhã por favor.",
      },
      {
        id: "de-w1t-3",
        speaker: "Atendente",
        roleType: "ai",
        english: "Wir haben den ICE um 08:30 Uhr. Möchten Sie einen Sitzplatz reservieren?",
        phonetic: "Vír rá-ben den I-C-E um ákht Úr drái-ssikh. Mêkh-ten zí ái-nen Zíts-plats re-zer-ví-ren?",
        portuguese: "Temos o trem ICE às 08h30. O senhor(a) deseja reservar um assento?",
      },
      {
        id: "de-w1t-4",
        speaker: "Você",
        roleType: "user",
        english: "Ja bitte, am Fenster. Von welchem Gleis fährt der Zug ab?",
        phonetic: "Ia bí-te, am Féns-ter. Fon vél-khem Gláis fêrt dêr Tsuk áp?",
        portuguese: "Sim por favor, na janela. De qual plataforma o trem parte?",
      },
      {
        id: "de-w1t-5",
        speaker: "Atendente",
        roleType: "ai",
        english: "Von Gleis 6 tief. Gute Reise!",
        phonetic: "Fon Gláis zêks tíf. Gú-te Rái-ze!",
        portuguese: "Da plataforma 6 subterrânea. Boa viagem!",
      },
    ],
  },
  {
    id: "de-w1-pharmacy",
    language: "de",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Berlim",
    title: "Na Farmácia (Apotheke)",
    icon: "AlertTriangle",
    focus: "Saúde, farmácia & sintomas",
    situationDescription:
      "Você acordou com dor de cabeça forte e febre em Hamburgo. Entra numa Apotheke procurando um analgésico e orientações de dosagem.",
    aiRole: "Farmacêutico alemão",
    userRole: "Cliente indisposto",
    openingAiDialogue: "Guten Tag! Wie kann ich Ihnen helfen? Haben Sie Schmerzen?",
    openingAiPhonetic: "Gú-ten Ták! Vi kan ikh Í-nen rêl-fen? Rá-ben zí Chmér-tsen?",
    openingAiPortuguese: "Bom dia! Como posso te ajudar? Está sentindo dores?",
    survivalObjective: "Explicar dor de cabeça (Kopfschmerzen), febre (Fieber) e perguntar quantas vezes tomar ao dia.",
    survivalTipsPt: "Diga 'Ich habe starke Kopfschmerzen'. Para a dosagem pergunte: 'Wie oft soll ich das einnehmen?'.",
    sampleResponses: [
      "Ich habe seit gestern starke Kopfschmerzen und leichtes Fieber.",
      "Haben Sie Ibuprofen oder Paracetamol rezeptfrei da?",
      "Wie oft am Tag soll ich die Tabletten einnehmen?",
    ],
    structuredSuggestions: [
      {
        english: "Ich habe seit heute Morgen starke Kopfschmerzen.",
        phonetic: "Ikh rá-be záit rói-te Mór-guen chtár-ke Kóp-fshmer-tsen.",
        portuguese: "Estou com fortes dores de cabeça desde hoje cedo.",
      },
      {
        english: "Haben Sie ein Schmerzmittel ohne Rezept?",
        phonetic: "Rá-ben zí áin Chmérts-mít-tel ó-ne Re-tsépt?",
        portuguese: "Você tem um analgésico sem receita?",
      },
      {
        english: "Wie oft am Tag soll ich die Tablette nehmen?",
        phonetic: "Vi oft am Ták zol ikh di Ta-blé-te nê-men?",
        portuguese: "Quantas vezes por dia devo tomar o comprimido?",
      },
    ],
    script: [
      {
        id: "de-w1p-1",
        speaker: "Farmacêutico",
        roleType: "ai",
        english: "Guten Tag! Was für Beschwerden haben Sie denn?",
        phonetic: "Gú-ten Ták! Vas für Be-chvêr-den rá-ben zí den?",
        portuguese: "Bom dia! Que tipo de sintomas você está sentindo?",
      },
      {
        id: "de-w1p-2",
        speaker: "Você",
        roleType: "user",
        english: "Ich habe starke Kopfschmerzen und Halsschmerzen. Haben Sie etwas dagegen?",
        phonetic: "Ikh rá-be chtár-ke Kóp-fshmer-tsen unt Rálss-shmer-tsen. Rá-ben zí ét-vas da-guê-guen?",
        portuguese: "Tenho fortes dores de cabeça e dor de garganta. Tem algo para isso?",
      },
      {
        id: "de-w1p-3",
        speaker: "Farmacêutico",
        roleType: "ai",
        english: "Ich empfehle Ihnen Ibuprofen 400. Nehmen Sie maximal drei Tabletten am Tag mit Wasser.",
        phonetic: "Ikh em-pfê-le Í-nen I-bu-pro-fên fír-rún-dert. Nê-men zí mak-si-mál drái Ta-blé-ten am Ták mit Vás-ser.",
        portuguese: "Recomendo Ibuprofeno 400. Tome no máximo três comprimidos ao dia com água.",
      },
      {
        id: "de-w1p-4",
        speaker: "Você",
        roleType: "user",
        english: "Vielen Dank! Ich nehme eine Packung mit.",
        phonetic: "Fí-len Dank! Ikh nê-me ái-ne Pá-kung mit.",
        portuguese: "Muito obrigado! Vou levar uma caixa.",
      },
    ],
  },
  {
    id: "de-w2-hotel",
    language: "de",
    week: 2,
    weekTitle: "Semana 2: Cotidiano & Conexões na Alemanha",
    title: "Check-in no Hotel em Munique",
    icon: "Building2",
    focus: "Hospedagem, turismo & estadias",
    situationDescription:
      "Você chega ao hotel em Munique após uma longa viagem. Precisa fazer check-in, perguntar a senha do Wi-Fi e os horários do café da manhã.",
    aiRole: "Recepcionista do Hotel em Munique",
    userRole: "Hóspede",
    openingAiDialogue: "Guten Abend! Herzlich willkommen im Hotel Bavaria. Haben Sie reserviert?",
    openingAiPhonetic: "Gú-ten Á-bent! Rêrts-likh vil-kó-men im Ro-tél Ba-vá-ria. Rá-ben zí re-zer-vírt?",
    openingAiPortuguese: "Boa noite! Bem-vindo ao Hotel Bavaria. Você tem reserva?",
    survivalObjective: "Dar o nome da reserva, perguntar o horário do café da manhã e pedir a senha do Wi-Fi.",
    survivalTipsPt: "Diga 'Ich habe ein Zimmer auf den Namen... reserviert'. Para café da manhã: 'Wann gibt es Frühstück?'.",
    sampleResponses: [
      "Guten Abend! Ich habe eine Reservierung auf den Namen Müller.",
      "Um wie viel Uhr gibt es morgens Frühstück?",
      "Wie lautet das Passwort für das WLAN?",
    ],
    structuredSuggestions: [
      {
        english: "Guten Abend! Ich habe ein Zimmer reserviert.",
        phonetic: "Gú-ten Á-bent! Ikh rá-be áin Tsím-mer re-zer-vírt.",
        portuguese: "Boa noite! Eu reservei um quarto.",
      },
      {
        english: "Wann und wo gibt es das Frühstück?",
        phonetic: "Van unt vo guípt es das Frü-chtük?",
        portuguese: "Quando e onde é servido o café da manhã?",
      },
    ],
    script: [
      {
        id: "de-w2h-1",
        speaker: "Recepcionista",
        roleType: "ai",
        english: "Guten Abend! Auf welchen Namen läuft die Buchung?",
        phonetic: "Gú-ten Á-bent! Áuf vél-khen Ná-men lôift di Bú-khung?",
        portuguese: "Boa noite! Em qual nome está a reserva?",
      },
      {
        id: "de-w2h-2",
        speaker: "Você",
        roleType: "user",
        english: "Guten Abend! Auf meinen Namen. Hier ist mein Reisepass.",
        phonetic: "Gú-ten Á-bent! Áuf mái-nen Ná-men. Rír ist máin Rái-ze-pass.",
        portuguese: "Boa noite! Em meu nome. Aqui está meu passaporte.",
      },
      {
        id: "de-w2h-3",
        speaker: "Recepcionista",
        roleType: "ai",
        english: "Gefunden! Zimmer 304 im dritten Stock. Frühstück gibt es von 7 bis 10 Uhr.",
        phonetic: "Gue-fún-den! Tsím-mer drái-rún-dert-fír im drít-ten Chtók. Frü-chtük guípt es fon zí-ben bis tsên Úr.",
        portuguese: "Encontrado! Quarto 304 no terceiro andar. Café da manhã das 7h às 10h.",
      },
    ],
  },
  {
    id: "de-w3-flat",
    language: "de",
    week: 3,
    weekTitle: "Semana 3: Desafios & Autonomia na Alemanha",
    title: "Visita para Alugar um Apartamento (WG) em Berlim",
    icon: "Building2",
    focus: "Moradia, negociação & contratos",
    situationDescription:
      "Você participa de uma entrevista para alugar um quarto em uma república estudantil/profissional (WG) em Berlim Kreuzberg.",
    aiRole: "Morador atual da WG em Berlim",
    userRole: "Candidato a morador",
    openingAiDialogue: "Hi! Komm rein! Wir suchen jemanden, der ordentlich und unkompliziert ist. Erzähl mal ein bisschen über dich!",
    openingAiPhonetic: "Rái! Kom ráin! Vír zú-khen iê-man-den, dêr ór-dent-likh unt un-kom-pli-tsírt ist. Er-tsêl mal áin bís-khen ü-ber dikh!",
    openingAiPortuguese: "Oi! Entra aí! Procuramos alguém organizado e tranquilo. Me conta um pouco sobre você!",
    survivalObjective: "Apresentar sua rotina, perguntar se a internet está inclusa no aluguel (Warmmiete) e a data de entrada.",
    survivalTipsPt: "Em alemão, 'Warmmiete' é o aluguel com aquecimento e despesas inclusas. 'Kaltmiete' é só o imóvel sem despesas.",
    sampleResponses: [
      "Ich arbeite im Bereich Technologie und koche sehr gerne abends.",
      "Ist die Miete warm, also inklusive Heizung und Internet?",
      "Ab wann wäre das Zimmer denn bezugsfrei?",
    ],
    structuredSuggestions: [
      {
        english: "Ich bin sehr zuverlässig, ordentlich und habe geregelte Arbeitszeiten.",
        phonetic: "Ikh bin zêr tsu-ver-lés-sikh, ór-dent-likh unt rá-be gue-rê-guel-te Ár-bai-tsêi-ten.",
        portuguese: "Sou muito confiável, organizado e tenho horários fixos de trabalho.",
      },
      {
        english: "Sind die Nebenkosten in der Warmmiete enthalten?",
        phonetic: "Zint di Nê-ben-kós-ten in der Várm-mí-te ent-rál-ten?",
        portuguese: "As despesas adicionais estão inclusas no valor total do aluguel?",
      },
    ],
    script: [
      {
        id: "de-w3f-1",
        speaker: "Morador",
        roleType: "ai",
        english: "Hi! Freut mich sehr. Wie gefällt dir das Zimmer?",
        phonetic: "Rái! Fróit mikh zêr. Vi gue-fêlt dír das Tsím-mer?",
        portuguese: "Oi! Muito prazer. O que achou do quarto?",
      },
      {
        id: "de-w3f-2",
        speaker: "Você",
        roleType: "user",
        english: "Es ist super hell und gemütlich! Ist das Zimmer ab nächstem Monat frei?",
        phonetic: "Es ist zú-per rel unt gue-müt-likh! Ist das Tsím-mer áp nêkhs-tem Mô-nat frái?",
        portuguese: "É super claro e aconchegante! O quarto fica livre a partir do próximo mês?",
      },
    ],
  },

  // =========================================================================
  // 🇪🇸 ESPANHOL (ESPAÑOL)
  // =========================================================================
  {
    id: "es-w1-coffee",
    language: "es",
    week: 1,
    weekTitle: "Semana 1: Sobrevivencia en Madrid",
    title: "Pedir Café con Leche y Churros",
    icon: "Coffee",
    focus: "Cafetería y comidas",
    situationDescription:
      "Estás en una típica cafetería madrileña cerca de la Puerta del Sol. Quieres pedir un café con leche templada y una ración de churros.",
    aiRole: "Camarero madrileño",
    userRole: "Cliente",
    openingAiDialogue: "¡Hola, buenos días! ¿Qué le pongo para empezar el día?",
    openingAiPhonetic: "O-la, bue-nos di-as! Ke le pon-go pa-ra em-pe-zar el di-a?",
    openingAiPortuguese: "Olá, bom dia! O que sirvo para começar o dia?",
    survivalObjective: "Pedir café con leche templada (morno), churros e pedir a conta (la cuenta).",
    survivalTipsPt: "Na Espanha, diga 'café con leche templada' para leite morno. Para pedir a conta: 'La cuenta, cuando puedas, por favor'.",
    sampleResponses: [
      "Un café con leche templada y una ración de churros, por favor.",
      "¿Tienen leche vegetal o desnatada?",
      "¿Cuánto es en total? Pago con tarjeta.",
    ],
    structuredSuggestions: [
      {
        english: "Un café con leche templada y unos churros, por favor.",
        phonetic: "Un ca-fe con le-tche tem-pla-da i u-nos tchu-rros, por fa-bor.",
        portuguese: "Um café com leite morno e churros, por favor.",
      },
    ],
    script: [
      {
        id: "es-w1c-1",
        speaker: "Camarero",
        roleType: "ai",
        english: "¡Buenos días! ¿Qué desea tomar?",
        phonetic: "Bue-nos di-as! Ke de-se-a to-mar?",
        portuguese: "Bom dia! O que deseja tomar?",
      },
      {
        id: "es-w1c-2",
        speaker: "Você",
        roleType: "user",
        english: "Un café con leche y una porción de churros, por favor.",
        phonetic: "Un ca-fe con le-tche i u-na por-sion de tchu-rros, por fa-bor.",
        portuguese: "Um café com leite e uma porção de churros, por favor.",
      },
    ],
  },

  // =========================================================================
  // 🇯🇵 JAPONÊS (NIHONGO)
  // =========================================================================
  {
    id: "ja-w1-konbini",
    language: "ja",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Tóquio",
    title: "Compras no Konbini (7-Eleven / Lawson)",
    icon: "Coffee",
    focus: "Compras do dia a dia, conveniência",
    situationDescription:
      "Você entra num konbini em Shinjuku para comprar um onigiri e um chá verde. O atendente pergunta se quer esquentar e se precisa de sacola.",
    aiRole: "Atendente do Konbini em Tóquio",
    userRole: "Cliente no Japão",
    openingAiDialogue: "いらっしゃいませ！温めますか？袋はご利用ですか？ (Irasshaimase! Atatamemasu ka? Fukuro wa goriyō desu ka?)",
    openingAiPhonetic: "I-ras-shái-ma-sê! A-ta-ta-mê-ma-su ka? Fu-ku-ro uá go-ri-iô des ka?",
    openingAiPortuguese: "Seja bem-vindo! Deseja esquentar? Vai precisar de sacola?",
    survivalObjective: "Responder se deseja esquentar (atatamenakute daijoubu desu) e se quer sacola (kekkou desu).",
    survivalTipsPt: "Diga 'Daijōbu desu' para dizer gentilmente 'está tudo bem/não precisa'. Para pagar com cartão: 'Kādo de onegaishimasu'.",
    sampleResponses: [
      "温めなくて大丈夫です。(Atatamenakute daijōbu desu.)",
      "袋は結構です。(Fukuro wa kekkō desu.)",
      "カードで払えますか？ (Kādo de haraemasu ka?)",
    ],
    structuredSuggestions: [
      {
        english: "袋は結構です、カードでお願いします。(Fukuro wa kekkō desu, kādo de onegaishimasu.)",
        phonetic: "Fu-ku-ro uá kek-kou des, ká-do de o-ne-gái-chi-mass.",
        portuguese: "Não precisa de sacola, pago no cartão por favor.",
      },
    ],
    script: [
      {
        id: "ja-w1k-1",
        speaker: "Atendente",
        roleType: "ai",
        english: "いらっしゃいませ！お弁当は温めますか？ (Irasshaimase! Obentō wa atatamemasu ka?)",
        phonetic: "I-ras-shái-ma-sê! O-ben-tôu uá a-ta-ta-mê-ma-su ka?",
        portuguese: "Bem-vindo! Deseja esquentar a marmita/lanche?",
      },
      {
        id: "ja-w1k-2",
        speaker: "Você",
        roleType: "user",
        english: "はい、お願いします。袋はいりません。(Hai, onegaishimasu. Fukuro wa irimasen.)",
        phonetic: "Rái, o-ne-gái-chi-mass. Fu-ku-ro uá i-ri-ma-sen.",
        portuguese: "Sim, por favor. Não preciso de sacola.",
      },
    ],
  },

  // =========================================================================
  // 🇮🇹 ITALIANO
  // =========================================================================
  {
    id: "it-w1-bar",
    language: "it",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Roma",
    title: "Caffè Espresso e Cornetto al Banco",
    icon: "Coffee",
    focus: "Café clássico e gastronomia italiana",
    situationDescription:
      "Você entra em um bar histórico em Roma perto do Panteão. Na Itália, você pede e toma seu espresso em pé no balcão (al banco).",
    aiRole: "Barista romano",
    userRole: "Cliente",
    openingAiDialogue: "Buongiorno! Cosa ti preparo oggi? Un bel caffè al banco?",
    openingAiPhonetic: "Buon-jiór-no! Có-za ti pre-pá-ro ój-ji? Un bèl caf-fè al bán-co?",
    openingAiPortuguese: "Bom dia! O que preparo para você hoje? Um bom café no balcão?",
    survivalObjective: "Pedir um espresso duplo ou macchiato e um cornetto alla crema.",
    survivalTipsPt: "Na Itália, pedir no balcão se diz 'al banco'. Para café com pingo de leite: 'caffè macchiato caldo'.",
    sampleResponses: [
      "Un caffè espresso e un cornetto alla crema, per favore.",
      "Posso avere anche un bicchiere d'acqua naturale?",
      "Quant'è? Pago con la carta.",
    ],
    structuredSuggestions: [
      {
        english: "Un caffè macchiato caldo e un cornetto, per favore.",
        phonetic: "Un caf-fè mak-kiá-to cál-do e un cor-nét-to, per fa-vó-re.",
        portuguese: "Um café com um pingo de leite quente e um croissant italiano, por favor.",
      },
    ],
    script: [
      {
        id: "it-w1b-1",
        speaker: "Barista",
        roleType: "ai",
        english: "Buongiorno! Desidera un caffè?",
        phonetic: "Buon-jiór-no! De-zí-de-ra un caf-fè?",
        portuguese: "Bom dia! Deseja um café?",
      },
      {
        id: "it-w1b-2",
        speaker: "Você",
        roleType: "user",
        english: "Sì, un caffè macchiato e un cornetto alla crema per favore.",
        phonetic: "Si, un caf-fè mak-kiá-to e un cor-nét-to al-la crê-ma per fa-vó-re.",
        portuguese: "Sim, um café com leite espumado e um cornetto de creme por favor.",
      },
    ],
  },

  // =========================================================================
  // 🇫🇷 FRANCÊS (FRANÇAIS)
  // =========================================================================
  {
    id: "fr-w1-boulangerie",
    language: "fr",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência em Paris",
    title: "Croissant e Baguette na Boulangerie",
    icon: "Coffee",
    focus: "Padaria tradicional e compras cotidianas",
    situationDescription:
      "Você entra em uma boulangerie tradicional em Montmartre com cheiro inebriante de manteiga e pão fresco.",
    aiRole: "Boulangère em Paris",
    userRole: "Cliente",
    openingAiDialogue: "Bonjour ! Qu'est-ce qui vous ferait plaisir aujourd'hui ?",
    openingAiPhonetic: "Bôn-júr ! Kes-ki vú fe-rê ple-zír o-júr-duí ?",
    openingAiPortuguese: "Bom dia! O que lhe agradaria hoje?",
    survivalObjective: "Pedir uma baguete tradicional bem assada (bien cuite) e dois croissants.",
    survivalTipsPt: "Sempre comece com 'Bonjour Madame/Monsieur' ao entrar em qualquer loja francesa antes de pedir qualquer coisa.",
    sampleResponses: [
      "Bonjour ! Une baguette tradition bien cuite et deux croissants s'il vous plaît.",
      "C'est tout, merci. Combien je vous dois ?",
      "Puis-je payer par carte bancaire sans contact ?",
    ],
    structuredSuggestions: [
      {
        english: "Une baguette tradition et deux croissants, s'il vous plaît.",
        phonetic: "Ün ba-guét tra-di-siôn é dê crua-sân, sil vu plê.",
        portuguese: "Uma baguete tradicional e dois croissants, por favor.",
      },
    ],
    script: [
      {
        id: "fr-w1b-1",
        speaker: "Boulangère",
        roleType: "ai",
        english: "Bonjour ! Et avec ceci ?",
        phonetic: "Bôn-júr ! É a-vék se-sí ?",
        portuguese: "Bom dia! E mais alguma coisa além disto?",
      },
      {
        id: "fr-w1b-2",
        speaker: "Você",
        roleType: "user",
        english: "Une baguette tradition bien cuite s'il vous plaît.",
        phonetic: "Ün ba-guét tra-di-siôn biân cuít sil vu plê.",
        portuguese: "Uma baguete tradicional bem crocante/assada, por favor.",
      },
    ],
  },

  // =========================================================================
  // 🇬🇷 GREGO KOINÉ (ΚΟΙΝΗ ΕΛΛΗΝΙΚΗ)
  // =========================================================================
  {
    id: "el-w1-reading",
    language: "el-koine",
    week: 1,
    weekTitle: "Semana 1: Sobrevivência Textual e Saudações",
    title: "Leitura do Evangelho de João 1:1 no Scriptórium",
    icon: "BookOpen",
    focus: "Leitura de manuscritos e pronúncia koiné",
    situationDescription:
      "Você está no scriptórium com seu tutor de grego koiné antigo. Ele abre o códice em João 1:1 e pede para você ler e analisar o texto.",
    aiRole: "Mestre e escriba cristão",
    userRole: "Estudioso dos manuscritos",
    openingAiDialogue: "Ἐν ἀρχῇ ἦν ὁ λόγος. Ἀνάγνωθι τὸν στίχον, ἀγαπητέ. (En arche en ho logos. Anagnothi ton stichon, agapete.)",
    openingAiPhonetic: "En ar-khê ên ro ló-gos. A-nág-no-thi ton stí-khon, a-ga-pe-té.",
    openingAiPortuguese: "No princípio era o Verbo. Lê o versículo, amado(a).",
    survivalObjective: "Ler a passagem em grego koiné, identificar 'Lógos' e confessar a divindade do Verbo.",
    survivalTipsPt: "O termo 'Logos' em João 1:1 carrega tanto a ideia bíblica da Palavra criadora quanto a razão divina eterna.",
    sampleResponses: [
      "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.",
      "Τί δηλοῖ τὸ 'πρὸς τὸν θεόν';",
      "Χάρις καὶ εἰρήνη ἀπὸ θεοῦ πατρὸς ἡμῶν.",
    ],
    structuredSuggestions: [
      {
        english: "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ θεὸς ἦν ὁ λόγος. (En arche en ho logos, kai theos en ho logos.)",
        phonetic: "En ar-khê ên ro ló-gos, kai the-ós ên ro ló-gos.",
        portuguese: "No princípio era o Verbo, e o Verbo era Deus.",
      },
    ],
    script: [
      {
        id: "el-w1r-1",
        speaker: "Mestre",
        roleType: "ai",
        english: "Εἰρήνη σοι! Τί ἀναγινώσκεις ἐν τῷ βιβλίῳ; (Eirene soi! Ti anaginoskeis en to biblio?)",
        phonetic: "Ei-rê-ne soi! Ti a-na-gui-nôs-keis en tô bi-blí-ô?",
        portuguese: "Paz a ti! O que estás lendo no livro?",
      },
      {
        id: "el-w1r-2",
        speaker: "Você",
        roleType: "user",
        english: "Τὸ εὐαγγέλιον κατὰ Ἰωάννην ἀναγινώσκω. (To euangelion kata Ioannen anaginosko.)",
        phonetic: "To eu-an-gué-li-on ka-tá I-ô-án-nen a-na-gui-nôs-ko.",
        portuguese: "Estou lendo o evangelho segundo João.",
      },
    ],
  },
];
