import { WeeklyMission, SupportedLanguage } from "@/types/language";
import { getLanguageById } from "@/data/languages";
import { getTutorsForLanguage } from "@/data/tutors";

// Temas procedurais progressivos para semanas além da Semana 3
interface ProceduralTheme {
  titleSuffix: string;
  focus: string;
  missionsByLang: Record<
    SupportedLanguage,
    Array<{
      title: string;
      icon: string;
      situation: string;
      aiRole: string;
      userRole: string;
      opening: string;
      phonetic: string;
      pt: string;
      objective: string;
      tip: string;
      suggestions: Array<{ target: string; phonetic: string; pt: string }>;
      script: Array<{
        speaker: string;
        roleType: "ai" | "user";
        target: string;
        phonetic: string;
        pt: string;
      }>;
    }>
  >;
}

export const PROCEDURAL_THEMES: ProceduralTheme[] = [
  // SEMANA 4: Viagens, Aeroporto & Trânsito Urbano
  {
    titleSuffix: "Viagens & Deslocamento Urbano",
    focus: "Mobilidade, Aeroportos & Transporte Público",
    missionsByLang: {
      de: [
        {
          title: "Check-in no Aeroporto de Frankfurt",
          icon: "Compass",
          situation:
            "Você está no balcão da Lufthansa no Aeroporto de Frankfurt. Precisa despachar uma mala pesada e pedir assento no corredor.",
          aiRole: "Agente de Solo no Aeroporto de Frankfurt",
          userRole: "Passageiro internacional",
          opening: "Guten Tag! Ihren Reisepass und die Buchungsnummer bitte. Fliegen Sie heute nach München?",
          phonetic: "Gú-ten Ták! Í-ren Rái-ze-pass unt di Bú-khungs-nú-mer bí-te. Flí-guen zí rói-te nakh Mün-khen?",
          pt: "Bom dia! Seu passaporte e o código de reserva, por favor. O senhor(a) voa hoje para Munique?",
          objective: "Entregar o passaporte, despachar 1 mala e pedir assento no corredor (Gangplatz).",
          tip: "Use 'Ich möchte bitte einen Gangplatz' para assento no corredor, ou 'Fensterplatz' para janela.",
          suggestions: [
            {
              target: "Hier ist mein Reisepass. Ich möchte bitte einen Gangplatz.",
              phonetic: "Rír ist máin Rái-ze-pass. Ikh mêkh-te bí-te ái-nen Gáng-plats.",
              pt: "Aqui está meu passaporte. Gostaria de um assento no corredor, por favor.",
            },
            {
              target: "Ich habe einen Koffer zum Aufgeben.",
              phonetic: "Ikh rá-be ái-nen Kó-fer tsum Áuf-gue-ben.",
              pt: "Eu tenho uma mala para despachar.",
            },
            {
              target: "Zu welchem Gate muss ich gehen?",
              phonetic: "Tsu vél-khem Guêit muss ikh guê-en?",
              pt: "Para qual portão de embarque eu devo ir?",
            },
          ],
          script: [
            {
              speaker: "Agente",
              roleType: "ai",
              target: "Guten Tag! Ihren Reisepass bitte. Haben Sie Gepäck zum Aufgeben?",
              phonetic: "Gú-ten Ták! Í-ren Rái-ze-pass bí-te. Rá-ben zí Gue-pék tsum Áuf-gue-ben?",
              pt: "Bom dia! Seu passaporte, por favor. Tem bagagem para despachar?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Hier bitte. Ich habe einen Koffer und möchte gerne einen Gangplatz.",
              phonetic: "Rír bí-te. Ikh rá-be ái-nen Kó-fer unt mêkh-te guér-ne ái-nen Gáng-plats.",
              pt: "Aqui está. Tenho uma mala e gostaria de um assento no corredor.",
            },
            {
              speaker: "Agente",
              roleType: "ai",
              target: "Sehr gern! Platz 14C. Das Boarding beginnt um 10 Uhr am Gate A22.",
              phonetic: "Zêr guérn! Plats fír-tsên C. Das Bór-ding be-guínt um tsên Úr am Guêit A-tsván-tsikh.",
              pt: "Com prazer! Assento 14C. O embarque começa às 10h no portão A22.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Vielen Dank! Einen schönen Tag noch.",
              phonetic: "Fí-len Dank! Ái-nen chê-nen Ták nókh.",
              pt: "Muito obrigado! Tenha um ótimo dia.",
            },
          ],
        },
        {
          title: "Comprar Passe de Metrô (U-Bahn) em Berlim",
          icon: "Tag",
          situation:
            "Você está na estação Alexanderplatz em Berlim. A máquina automática travou e você pede ajuda ao funcionário da BVG.",
          aiRole: "Funcionário da BVG Berlim",
          userRole: "Turista em Berlim",
          opening: "Hallo! Kann ich Ihnen beim Ticketautomaten helfen?",
          phonetic: "Rá-lo! Kan ikh Í-nen báim Ti-két-au-to-má-ten rêl-fen?",
          pt: "Olá! Posso te ajudar com a máquina de passagens?",
          objective: "Comprar um passe diário para as zonas AB e perguntar se precisa validar (entwerten).",
          tip: "Em Berlim é fundamental validar o bilhete no carimbador vermelho antes de embarcar ('muss ich das Ticket entwerten?').",
          suggestions: [
            {
              target: "Ich brauche eine Tageskarte für den Bereich AB, bitte.",
              phonetic: "Ikh bráu-khe ái-ne Tá-gues-kár-te für den Be-ráikh A-B, bí-te.",
              pt: "Eu preciso de um passe diário para a zona AB, por favor.",
            },
            {
              target: "Kann ich hier mit Kreditkarte bezahlen?",
              phonetic: "Kan ikh rír mit Kre-dít-kár-te be-tsá-len?",
              pt: "Posso pagar com cartão de crédito aqui?",
            },
            {
              target: "Muss ich das Ticket vor der Fahrt entwerten?",
              phonetic: "Muss ikh das Ti-két for der Fárt ent-vêr-ten?",
              pt: "Preciso carimbar/validar a passagem antes da viagem?",
            },
          ],
          script: [
            {
              speaker: "Funcionário",
              roleType: "ai",
              target: "Hallo! Suchen Sie eine Einzelfahrt oder eine Tageskarte?",
              phonetic: "Rá-lo! Zú-khen zí ái-ne Áin-tsel-fárt ó-der ái-ne Tá-gues-kár-te?",
              pt: "Olá! Você procura uma passagem avulsa ou um passe diário?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Eine Tageskarte für AB bitte. Kann ich mit Karte zahlen?",
              phonetic: "Ái-ne Tá-gues-kár-te für A-B bí-te. Kan ikh mit Kár-te tsá-len?",
              pt: "Um passe diário para AB, por favor. Posso pagar com cartão?",
            },
            {
              speaker: "Funcionário",
              roleType: "ai",
              target: "Ja, kontaktlos geht es sofort. Vergessen Sie nicht, das Ticket dort abzustempeln!",
              phonetic: "Ia, kon-tákt-lôs guêt es zo-fórt. Fer-gué-sen zí nikht, das Ti-két dort áp-tsu-chtêm-peln!",
              pt: "Sim, por aproximação funciona na hora. Não se esqueça de carimbar a passagem ali!",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Perfekt, vielen Dank für die Hilfe!",
              phonetic: "Per-fékt, fí-len Dank für di Ríl-fe!",
              pt: "Perfeito, muito obrigado pela ajuda!",
            },
          ],
        },
      ],
      es: [
        {
          title: "Pedir un Taxi en el Aeropuerto de Madrid",
          icon: "Compass",
          situation:
            "Acabas de aterrizar en Barajas (Madrid) con dos maletas grandes y necesitas llegar a la Gran Vía.",
          aiRole: "Taxista madrileño",
          userRole: "Viajero recién llegado",
          opening: "¡Hola, buenas! ¿A dónde le llevo hoy? ¿Tiene equipaje?",
          phonetic: "O-la, bue-nas! A don-de le ye-vo oi? Tie-ne e-ki-pa-je?",
          pt: "Olá, boas! Para onde o levo hoje? Tem bagagem?",
          objective: "Informar o endereço no centro de Madrid e confirmar a tarifa fixa de aeroporto.",
          tip: "Em Madrid, corridas de táxi entre o aeroporto e o centro da cidade têm tarifa fixa de 30 euros ('tarifa fija').",
          suggestions: [
            {
              target: "Voy a un hotel en la Gran Vía, por favor.",
              phonetic: "Boi a un o-tel en la Gran Bi-a, por fa-bor.",
              pt: "Vou a um hotel na Gran Vía, por favor.",
            },
            {
              target: "¿Es la tarifa fija de treinta euros?",
              phonetic: "Es la ta-ri-fa fi-ja de trein-ta eu-ros?",
              pt: "É a tarifa fixa de trinta euros?",
            },
            {
              target: "¿Puedo pagar con tarjeta de crédito?",
              phonetic: "Pue-do pa-gar kon tar-je-ta de kre-di-to?",
              pt: "Posso pagar com cartão de crédito?",
            },
          ],
          script: [
            {
              speaker: "Taxista",
              roleType: "ai",
              target: "¡Buenas tardes! Ponga las maletas en el maletero. ¿A dónde vamos?",
              phonetic: "Bue-nas tar-des! Pon-ga las ma-le-tas en el ma-le-te-ro. A don-de ba-mos?",
              pt: "Boa tarde! Coloque as malas no porta-malas. Para onde vamos?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "A la Gran Vía, número 45, por favor. ¿Acepta tarjeta?",
              phonetic: "A la Gran Bi-a, nu-me-ro cua-ren-ta i sin-co, por fa-bor. A-sep-ta tar-je-ta?",
              pt: "Para a Gran Vía, número 45, por favor. Aceita cartão?",
            },
            {
              speaker: "Taxista",
              roleType: "ai",
              target: "Sí, claro, tarjeta o efectivo. La tarifa fija al centro son 30 euros exactos.",
              phonetic: "Si, kla-ro, tar-je-ta o e-fek-ti-bo. La ta-ri-fa fi-ja al sen-tro son trein-ta eu-ros ek-sak-tos.",
              pt: "Sim, claro, cartão ou dinheiro. A tarifa fixa para o centro é exatamente 30 euros.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Perfecto, muchas gracias por avisarme.",
              phonetic: "Per-fek-to, mu-tchas gra-sias por a-bi-sar-me.",
              pt: "Perfeito, muito obrigado por me avisar.",
            },
          ],
        },
      ],
      ja: [
        {
          title: "Comprar Bilhete Shinkansen em Tóquio",
          icon: "Compass",
          situation:
            "Você está no balcão da JR em Tóquio para comprar bilhete no trem-bala (Shinkansen) para Kyoto com assento reservado.",
          aiRole: "Atendente da JR Tóquio",
          userRole: "Viajante no Japão",
          opening: "いらっしゃいませ！どちらまで行かれますか？ (Irasshaimase! Dochira made ikaremasu ka?)",
          phonetic: "I-ras-shái-ma-sê! Dô-chi-ra ma-dé i-ka-re-má-su ka?",
          pt: "Seja bem-vindo! Até onde você vai viajar?",
          objective: "Pedir uma passagem para Kyoto no Shinkansen, assento reservado na janela com vista para o Monte Fuji.",
          tip: "No Shinkansen para Kyoto, peça o assento E (no lado direito) para ver o Monte Fuji: 'Fuji-san ga mieru seki'.",
          suggestions: [
            {
              target: "京都までの新幹線の指定席を一枚お願いします。(Kyōto made no shinkansen no shiteiseki o ichimai onegaishimasu.)",
              phonetic: "Kió-to ma-dé no chin-kán-sen no chi-têi-se-ki o i-chi-mái o-ne-gái-chi-mass.",
              pt: "Uma passagem com assento reservado no Shinkansen até Kyoto, por favor.",
            },
            {
              target: "窓側の席は空いていますか？ (Madogawa no seki wa aite imasu ka?)",
              phonetic: "Ma-do-ga-uá no se-ki uá ái-te i-má-su ka?",
              pt: "Tem assento na janela disponível?",
            },
            {
              target: "何番線から出発しますか？ (Nanbansen kara shuppatsu shimasu ka?)",
              phonetic: "Nán-ban-sen ka-ra chup-pá-tsu chi-má-su ka?",
              pt: "De qual plataforma o trem vai partir?",
            },
          ],
          script: [
            {
              speaker: "Atendente",
              roleType: "ai",
              target: "いらっしゃいませ！新幹線のご予約ですか？ (Irasshaimase! Shinkansen no goyoyaku desu ka?)",
              phonetic: "I-ras-shái-ma-sê! Chin-kán-sen no go-iô-iá-ku des ka?",
              pt: "Bem-vindo! É reserva para o Shinkansen?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "はい、京都まで大人一枚、窓側の席をお願いします。(Hai, Kyōto made otona ichimai, madogawa no seki o onegaishimasu.)",
              phonetic: "Rái, Kió-to ma-dé o-to-ná i-chi-mái, ma-do-ga-uá no se-ki o o-ne-gái-chi-mass.",
              pt: "Sim, um adulto para Kyoto, assento na janela por favor.",
            },
            {
              speaker: "Atendente",
              roleType: "ai",
              target: "10時30分発ののぞみ号、14番線のりばでございます。(Jūji sanjuppun hatsu no Nozomi-gō, jūyonbansen noriba de gozaimasu.)",
              phonetic: "Djiu-dji san-djup-pun rá-tsu no No-zô-mi-gou, djiu-iôn-ban-sen no-ri-ba de go-zái-mass.",
              pt: "Trem Nozomi saindo às 10h30, plataforma número 14.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "ありがとうございます！(Arigatō gozaimasu!)",
              phonetic: "A-ri-ga-tou go-zái-mass!",
              pt: "Muito obrigado!",
            },
          ],
        },
      ],
      "el-koine": [
        {
          title: "Viajar no Mundo Antigo: O Porto de Cencreia",
          icon: "Compass",
          situation:
            "Você é um viajante cristão no porto de Cencreia (porto leste de Corinto). Procura um navio mercante para Éfeso com irmãos na fé.",
          aiRole: "Comerciante no porto marítimo",
          userRole: "Viajante do século I",
          opening: "Χαῖρε, ξένε! Ποῦ πορεύῃ; Ζητεῖς πλοῖον εἰς τὴν Ἀσίαν; (Chaire, xene! Pou poreue; Zeteis ploion eis ten Asian?)",
          phonetic: "Khái-re, kse-ne! Pu po-rêu-e? Dze-têis plôi-on eis ten A-sí-an?",
          pt: "Alegra-te, estrangeiro! Para onde vais? Procuras navio para a Ásia?",
          objective: "Perguntar sobre a partida de navio para Éfeso e saudar o mestre do navio.",
          tip: "No grego koiné, 'poreuomai' expressa jornada ou peregrinação, e 'ploion' refere-se ao barco.",
          suggestions: [
            {
              target: "Ζητῶ πλοῖον εἰς Ἔφεσον. (Zeto ploion eis Epheson.)",
              phonetic: "Dze-tô plôi-on eis É-fe-son.",
              pt: "Procuro um navio para Éfeso.",
            },
            {
              target: "Πότε ἐκπλεῖ τὸ πλοῖον; (Pote ekplei to ploion?)",
              phonetic: "Pó-te ek-plêi to plôi-on?",
              pt: "Quando o navio parte mar afora?",
            },
          ],
          script: [
            {
              speaker: "Comerciante",
              roleType: "ai",
              target: "Χαῖρε! Τὸ πλοῖον ἡμῶν ἕτοιμόν ἐστιν. (Chaire! To ploion hemon hetoimon estin.)",
              phonetic: "Khái-re! To plôi-on rê-môn rê-toi-món es-tin.",
              pt: "Alegra-te! O nosso navio está pronto.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Εἰρήνη σοι! Θέλω πλεῖν μεθ' ὑμῶν. (Eirene soi! Thelo plein meth' hymon.)",
              phonetic: "Ei-rê-ne soi! Thé-lo plêin meth rü-môn.",
              pt: "Paz a ti! Quero navegar convosco.",
            },
          ],
        },
      ],
      it: [
        {
          title: "Biglietto Frecciarossa alla Stazione Termini",
          icon: "Compass",
          situation:
            "Sei alla Stazione Termini a Roma. Vuoi prendere il treno veloce per Firenze Santa Maria Novella nel pomeriggio.",
          aiRole: "Bigliettaio Trenitalia a Roma Termini",
          userRole: "Viaggiatore in Italia",
          opening: "Buongiorno! Dove desidera andare oggi? Ha già una prenotazione?",
          phonetic: "Buon-jiór-no! Dó-ve de-zí-de-ra an-dá-re ój-ji? A jià u-na pre-no-ta-tsió-ne?",
          pt: "Bom dia! Onde deseja ir hoje? Já tem uma reserva?",
          objective: "Pedir passagem no Frecciarossa com assento na janela e pagar por aproximação.",
          tip: "Na Itália, trens de alta velocidade exigem reserva obrigatória ('posto a sedere prenotato').",
          suggestions: [
            {
              target: "Vorrei un biglietto per Firenze sul prossimo Frecciarossa, per favore.",
              phonetic: "Vor-rêi un bi-gliét-to per Fi-rén-tse sul prós-si-mo Fret-cha-rós-sa, per fa-vó-re.",
              pt: "Gostaria de uma passagem para Florença no próximo Frecciarossa, por favor.",
            },
            {
              target: "C'è un posto vicino al finestrino?",
              phonetic: "Tchè un pós-to vi-tchí-no al fi-nes-trí-no?",
              pt: "Tem um assento perto da janela?",
            },
          ],
          script: [
            {
              speaker: "Bigliettaio",
              roleType: "ai",
              target: "Buongiorno! C'è un treno alle 14:15. Prima o seconda classe?",
              phonetic: "Buon-jiór-no! Tchè un trê-no al-le quat-tór-di-tchi e quín-di-tchi. Prí-ma o se-cón-da clás-se?",
              pt: "Bom dia! Há um trem às 14h15. Primeira ou segunda classe?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Seconda classe, con posto vicino al finestrino, per favore.",
              phonetic: "Se-cón-da clás-se, con pós-to vi-tchí-no al fi-nes-trí-no, per fa-vó-re.",
              pt: "Segunda classe, com lugar perto da janela, por favor.",
            },
          ],
        },
      ],
      fr: [
        {
          title: "Prendre le TGV à la Gare de Lyon",
          icon: "Compass",
          situation:
            "Vous êtes à Paris à la Gare de Lyon pour prendre le TGV vers Marseille. Vous devez trouver votre voie d'embarquement.",
          aiRole: "Agent d'accueil SNCF à Paris",
          userRole: "Voyageur",
          opening: "Bonjour ! Puis-je vous renseigner sur votre départ ?",
          phonetic: "Bôn-júr ! Puí-je vú rân-se-nhê sür vôt-re de-pár ?",
          pt: "Bom dia! Posso informá-lo sobre sua partida?",
          objective: "Pedir confirmação da plataforma (voie) e onde validar o bilhete digital.",
          tip: "Na França, as plataformas dos trens são chamadas de 'voies' (ex: Voie A, Voie 3).",
          suggestions: [
            {
              target: "De quelle voie part le TGV pour Marseille s'il vous plaît ?",
              phonetic: "De kél vuá pár le Tê-Jê-Vê pur Mar-sêi sil vu plê ?",
              pt: "De qual plataforma parte o TGV para Marselha, por favor?",
            },
            {
              target: "Dois-je composter mon billet sur mon téléphone ?",
              phonetic: "Duá-je côm-pos-tê môn bi-iê sür môn te-le-fôn ?",
              pt: "Preciso validar meu bilhete no celular?",
            },
          ],
          script: [
            {
              speaker: "Agent SNCF",
              roleType: "ai",
              target: "Bonjour ! Le train pour Marseille partira Voie Hall 1 à 15h28.",
              phonetic: "Bôn-júr ! Le trân pur Mar-sêi par-ti-rá Vuá Rôl ân a kânz êr vân-tüít.",
              pt: "Bom dia! O trem para Marselha partirá do Hall 1 às 15h28.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Merci beaucoup ! Bonne fin de journée.",
              phonetic: "Mêr-sí bô-cú ! Bôn fân de jur-nê.",
              pt: "Muito obrigado! Bom fim de tarde.",
            },
          ],
        },
      ],
      en: [
        {
          title: "Flight Check-in & Gate Navigation at O'Hare",
          icon: "Compass",
          situation:
            "You are at Chicago O'Hare International Airport checking in for a flight to London.",
          aiRole: "United Airlines Agent at O'Hare",
          userRole: "International Passenger",
          opening: "Hello! Welcome to United. Flying to London Heathrow today?",
          phonetic: "Ré-lóu! Uél-cam tu Iu-nái-téd. Flái-in tu Lân-dân Rí-trou tu-dêi?",
          pt: "Olá! Bem-vindo à United. Voando para Londres Heathrow hoje?",
          objective: "Check 1 bag, confirm window seat, and ask for terminal directions.",
          tip: "O'Hare is huge: always confirm your concourse letter (B, C, F) and gate number.",
          suggestions: [
            {
              target: "Yes, I'd like to check one suitcase and request a window seat.",
              phonetic: "Iés, áid láik tu tchék uân sút-kêis énd ri-kuést a uín-dou sít.",
              pt: "Sim, gostaria de despachar uma mala e pedir um assento na janela.",
            },
            {
              target: "How long does security usually take right now?",
              phonetic: "Ráo lông dâz se-kiú-ri-ti iú-ju-a-li têik ráit náu?",
              pt: "Quanto tempo a segurança costuma levar agora?",
            },
          ],
          script: [
            {
              speaker: "Agent",
              roleType: "ai",
              target: "Here is your boarding pass: Gate C18. Boarding starts at 5:15 PM.",
              phonetic: "Rír íz iór bór-din péss: Guêit C-éi-tín. Bór-din stárts ét fáiv fif-tín PM.",
              pt: "Aqui está seu cartão de embarque: Portão C18. O embarque começa às 17h15.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Awesome, thank you so much! Have a great shift.",
              phonetic: "Ó-sâm, ténk iú sou mâtch! Rév a grêit shíft.",
              pt: "Maravilha, muito obrigado! Tenha um ótimo turno.",
            },
          ],
        },
      ],
    },
  },

  // SEMANA 5: Gastronomia, Restaurantes Típicos & Reservas
  {
    titleSuffix: "Gastronomia & Restaurantes Típicos",
    focus: "Culinária Local, Pedidos Especiais & Experiências Gastronômicas",
    missionsByLang: {
      de: [
        {
          title: "Jantar em Restaurante Tradicional em Munique",
          icon: "Coffee",
          situation:
            "Você entra em uma estalagem bávara tradicional em Munique. Quer pedir um prato típico vegetariano ou Schnitzel com batatas.",
          aiRole: "Garçom Bávaro em Munique",
          userRole: "Cliente faminto",
          opening: "Grüß Gott! Haben Sie reserviert, oder suchen Sie einen Tisch für eine Person?",
          phonetic: "Grüss Got! Rá-ben zí re-zer-vírt, ó-der zú-khen zí ái-nen Tísh für ái-ne Per-zôn?",
          pt: "Saudações da Baviera! O senhor tem reserva, ou procura mesa para uma pessoa?",
          objective: "Pedir uma mesa agradável, escolher a comida e pedir a conta ao final.",
          tip: "Na Baviera a saudação tradicional é 'Grüß Gott'. Para pedir a conta: 'Die Rechnung, bitte!'.",
          suggestions: [
            {
              target: "Einen Tisch für eine Person, bitte. Was können Sie empfehlen?",
              phonetic: "Ái-nen Tísh für ái-ne Per-zôn, bí-te. Vas kên-nen zí em-pfê-len?",
              pt: "Uma mesa para uma pessoa, por favor. O que você recomenda?",
            },
            {
              target: "Ich hätte gerne das Wiener Schnitzel mit Kartoffelsalat.",
              phonetic: "Ikh rêt-te guér-ne das Ví-ner Chnít-tsel mit Kar-tó-fel-za-lat.",
              pt: "Eu gostaria do Wiener Schnitzel com salada de batatas.",
            },
            {
              target: "Könnte ich bitte die Rechnung haben? Zusammen, bitte.",
              phonetic: "Kên-te ikh bí-te di Rékh-nung rá-ben? Tsu-zám-men, bí-te.",
              pt: "Poderia me trazer a conta, por favor? Tudo junto.",
            },
          ],
          script: [
            {
              speaker: "Garçom",
              roleType: "ai",
              target: "Grüß Gott! Kommen Sie gern herein. Haben Sie schon etwas zu trinken ausgesucht?",
              phonetic: "Grüss Got! Kó-men zí guérn re-ráin. Rá-ben zí chôn ét-vas tsu trín-ken áus-gue-zúkht?",
              pt: "Saudações! Entre, por favor. Já escolheu algo para beber?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Ein alkoholfreies Weißbier und ein Schnitzel bitte.",
              phonetic: "Áin al-ko-rôl-frái-es Váiss-bír unt áin Chnít-tsel bí-te.",
              pt: "Uma cerveja de trigo sem álcool e um Schnitzel, por favor.",
            },
            {
              speaker: "Garçom",
              roleType: "ai",
              target: "Sehr wohl, kommt sofort! Guten Appetit schon einmal.",
              phonetic: "Zêr vôl, komt zo-fórt! Gú-ten A-pe-tít chôn áin-mál.",
              pt: "Com certeza, sai já! Bom apetite!",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Vielen Dank! Es riecht köstlich.",
              phonetic: "Fí-len Dank! Es ríkht kêst-likh.",
              pt: "Muito obrigado! O cheiro está maravilhoso.",
            },
          ],
        },
      ],
      es: [
        {
          title: "Tapear en el Barrio de La Latina en Madrid",
          icon: "Coffee",
          situation:
            "Estás en un concurrido bar de tapas en Madrid. Quieres pedir una ración de patatas bravas y tortilla de patatas.",
          aiRole: "Camarero en La Latina",
          userRole: "Amante de la gastronomía",
          opening: "¡Buenas! ¿Qué os pongo de beber para empezar?",
          phonetic: "Bue-nas! Ke os pon-go de be-ber pa-ra em-pe-zar?",
          pt: "Boas! O que sirvo de bebida para começar?",
          objective: "Pedir bebida, escolher duas tapas famosas e pedir a conta.",
          tip: "Na Espanha, peça 'una caña' para chope pequeno ou 'un vino tinto' da casa.",
          suggestions: [
            {
              target: "Una caña bien fría y una ración de bravas, por favor.",
              phonetic: "U-na ca-ña bien fri-a i u-na ra-sion de bra-bas, por fa-bor.",
              pt: "Um chope bem gelado e uma porção de batatas bravas, por favor.",
            },
          ],
          script: [
            {
              speaker: "Camarero",
              roleType: "ai",
              target: "¡Marchando una caña y una de bravas bien picantes!",
              phonetic: "Mar-tchan-do u-na ca-ña i u-na de bra-bas bien pi-can-tes!",
              pt: "Saindo um chope e uma porção de bravas bem picantes!",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "¡Genial, gracias! ¿Tienen tortilla recién hecha?",
              phonetic: "Je-nial, gra-sias! Tie-nen tor-ti-ya re-sien e-tcha?",
              pt: "Ótimo, obrigado! Vocês têm tortilha fresca?",
            },
          ],
        },
      ],
      ja: [
        {
          title: "Pedir num Restaurante Tradicional de Soba",
          icon: "Coffee",
          situation:
            "Você entra num aconchegante restaurante de soba em Asakusa. Quer experimentar tempura soba quente.",
          aiRole: "Dono do restaurante",
          userRole: "Cliente",
          opening: "いらっしゃい！何になさいますか？ (Irasshai! Nani ni nasaimasu ka?)",
          phonetic: "I-ras-shái! Ná-ni ni na-sái-ma-su ka?",
          pt: "Bem-vindo! O que vai desejar?",
          objective: "Pedir tempura soba quente e elogiar o sabor com 'oishii desu'.",
          tip: "No Japão, para pedir a conta diga 'O-kaikei onegaishimasu'.",
          suggestions: [
            {
              target: "天ぷらそばを温かいのでお願いします。(Tenpura soba o atatakai no de onegaishimasu.)",
              phonetic: "Ten-pú-ra so-bá o a-ta-ta-kái no de o-ne-gái-chi-mass.",
              pt: "Tempura soba quente, por favor.",
            },
          ],
          script: [
            {
              speaker: "Dono",
              roleType: "ai",
              target: "はい、天ぷらそば一丁！(Hai, tenpura soba itchō!)",
              phonetic: "Rái, ten-pú-ra so-bá it-tchôu!",
              pt: "Sim, saindo uma porção de tempura soba!",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "とても美味しいです！お会計をお願いします。(Totemo oishii desu! Okaikei o onegaishimasu.)",
              phonetic: "To-té-mo oi-shíi des! O-kai-kêi o o-ne-gái-chi-mass.",
              pt: "Está muito delicioso! A conta, por favor.",
            },
          ],
        },
      ],
      "el-koine": [
        {
          title: "O Pão da Vida: Diálogo sobre Alimento Espiritual",
          icon: "Coffee",
          situation:
            "Você estuda os ensinamentos dos Evangelhos sobre o Pão e a Ceia com seu tutor teológico.",
          aiRole: "Mestre de Escrituras",
          userRole: "Discípulo bíblico",
          opening: "Ἐγώ εἰμι ὁ ἄρτος τῆς ζωῆς. Τί νοεῖς περὶ τούτου; (Ego eimi ho artos tes zoes. Ti noeis peri toutou?)",
          phonetic: "E-gô êi-mi ro ár-tos tes dzo-ês. Ti no-êis pe-ri tú-tu?",
          pt: "Eu sou o pão da vida. O que compreendes a respeito disto?",
          objective: "Expressar a diferença entre o alimento perecível e a vida eterna em grego koiné.",
          tip: "O termo 'artos' significa pão comum, elevado nas Escrituras ao sentido de sustento vital.",
          suggestions: [
            {
              target: "Ὁ πιστεύων ἔχει ζωὴν αἰώνιον. (Ho pisteuon echei zoen aionion.)",
              phonetic: "Ro pis-têu-on é-khei dzo-ên ai-ô-ni-on.",
              pt: "Aquele que crê tem a vida eterna.",
            },
          ],
          script: [
            {
              speaker: "Mestre",
              roleType: "ai",
              target: "Καλῶς λέγεις. Ὁ ἄρτος οὗτός ἐστιν ἐκ τοῦ οὐρανοῦ. (Kalos legeis. Ho artos houtos estin ek tou ouranou.)",
              phonetic: "Ka-lôs lé-gueis. Ro ár-tos rû-tos es-tin ek tu u-ra-nú.",
              pt: "Bem dizes. Este pão desceu dos céus.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Κύριε, πάντοτε δὸς ἡμῖν τὸν ἄρτον τοῦτον. (Kyrie, pantote dos hemin ton arton touton.)",
              phonetic: "Kü-ri-e, pán-to-te dos rê-mîn ton ár-ton tû-ton.",
              pt: "Senhor, dá-nos sempre deste pão.",
            },
          ],
        },
      ],
      it: [
        {
          title: "Cena in Trattoria a Trastevere",
          icon: "Coffee",
          situation:
            "Sei in una splendida trattoria a Trastevere a Roma. Vuoi ordinare cacio e pepe e un calice di vino.",
          aiRole: "Cameriere romano",
          userRole: "Ospite affamato",
          opening: "Buonasera! Vi siete già accomodati? Volete dare un'occhiata al menù del giorno?",
          phonetic: "Buo-na-sê-ra! Vi siê-te jià ac-co-mo-dá-ti? Vo-lê-te dá-re un'ok-kiá-ta al me-nù del jiór-no?",
          pt: "Boa noite! Já se acomodaram? Querem dar uma olhada no cardápio do dia?",
          objective: "Pedir água com gás, cacio e pepe clássico e a conta.",
          tip: "Na Itália, peça água mineral dizendo 'naturale' (sem gás) ou 'frizzante' (com gás).",
          suggestions: [
            {
              target: "Per me una cacio e pepe e una bottiglia d'acqua frizzante, grazie.",
              phonetic: "Per me u-na cá-tcho e pé-pe e u-na bot-tí-glia d'ác-qua friz-zán-te, grá-tsie.",
              pt: "Para mim um cacio e pepe e uma garrafa de água com gás, obrigado.",
            },
          ],
          script: [
            {
              speaker: "Cameriere",
              roleType: "ai",
              target: "Ottima scelta! La nostra pasta è fresca fatta a mano ogni mattina.",
              phonetic: "Ót-ti-ma chél-ta! La nós-tra pás-ta è frés-ca fát-ta a má-no ó-gni mat-tí-na.",
              pt: "Excelente escolha! Nossa massa é fresca, feita à mão todas as manhãs.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Era delizioso! Il conto per favore, pago con carta.",
              phonetic: "É-ra de-li-tsió-zo! Il cón-to per fa-vó-re, pá-go con cár-ta.",
              pt: "Estava delicioso! A conta por favor, pago no cartão.",
            },
          ],
        },
      ],
      fr: [
        {
          title: "Dîner dans un Bistro Parisien",
          icon: "Coffee",
          situation:
            "Vous dînez dans un charmant bistro à Saint-Germain-des-Prés. Vous souhaitez commander un plat traditionnel.",
          aiRole: "Serveur parisien",
          userRole: "Client",
          opening: "Bonsoir ! Une table pour combien de personnes ?",
          phonetic: "Bôn-suár ! Ün tábl pur côm-biân de per-sôn ?",
          pt: "Boa noite! Uma mesa para quantas pessoas?",
          objective: "Pedir uma mesa, pedir água da casa (une carafe d'eau) e o prato do dia.",
          tip: "Em Paris, água da torneira filtrada é gratuita e servida com orgulho: peça 'une carafe d'eau, s'il vous plaît'.",
          suggestions: [
            {
              target: "Une table pour un s'il vous plaît. Quel est le plat du jour ?",
              phonetic: "Ün tábl pur ân sil vu plê. Kél é le plá dü júr ?",
              pt: "Uma mesa para um, por favor. Qual é o prato do dia?",
            },
          ],
          script: [
            {
              speaker: "Serveur",
              roleType: "ai",
              target: "Aujourd'hui nous avons un excellent bœuf bourguignon mijoté.",
              phonetic: "O-júr-duí nu za-vôn zun ek-se-lân bêf bur-gui-nhôn mi-jo-tê.",
              pt: "Hoje temos um excelente bœuf bourguignon cozido lentamente.",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Parfait ! J'en prends un, avec une carafe d'eau s'il vous plaît.",
              phonetic: "Par-fê ! Jân prân zun, a-vék ün ca-ráf dô sil vu plê.",
              pt: "Perfeito! Vou querer esse, com uma jarra de água por favor.",
            },
          ],
        },
      ],
      en: [
        {
          title: "Dinner & Custom Order at a Classic Chicago Diner",
          icon: "Coffee",
          situation:
            "You are at a bustling Chicago diner ordering dinner with specific dietary requests.",
          aiRole: "Friendly Chicago Diner Waiter",
          userRole: "Hungry Customer",
          opening: "Hey there! Ready to order, or do you need another minute with the menu?",
          phonetic: "Rêi dêr! Ré-di tu ór-dêr, ór du iú níd a-nâ-dêr mí-nit uíd da mé-niu?",
          pt: "Opa! Pronto para pedir, ou precisa de mais um minutinho com o cardápio?",
          objective: "Order a main dish, ask for dressing on the side, and request the check.",
          tip: "In American diners, 'on the side' means serving sauces or dressing in a separate small bowl.",
          suggestions: [
            {
              target: "Could I get the grilled chicken sandwich with dressing on the side, please?",
              phonetic: "Cûd ái guét da gríld tchí-kên sén-duitch uíd drés-sin ôn da sáid, plíz?",
              pt: "Poderia me ver o sanduíche de frango grelhado com o molho à parte, por favor?",
            },
          ],
          script: [
            {
              speaker: "Waiter",
              roleType: "ai",
              target: "You got it! Fries, sweet potato fries, or fresh fruit with that?",
              phonetic: "Iú gót it! Fráis, suít po-têi-tou fráis, ór frésh frút uíd dét?",
              pt: "Pode deixar! Fritas normais, fritas de batata-doce ou fruta fresca acompanhando?",
            },
            {
              speaker: "Você",
              roleType: "user",
              target: "Sweet potato fries, please! And could we also get the check when you have a moment?",
              phonetic: "Suít po-têi-tou fráis, plíz! Énd cûd uí ól-sou guét da tchék uén iú rév a môu-mênt?",
              pt: "Fritas de batata-doce, por favor! E você poderia nos trazer a conta quando tiver um momento?",
            },
          ],
        },
      ],
    },
  },
];

// Gerador procedural de novas semanas para qualquer idioma
export function generateProceduralWeek(
  language: SupportedLanguage,
  weekNumber: number
): WeeklyMission[] {
  const langDef = getLanguageById(language);
  const tutors = getTutorsForLanguage(language);
  const tutor = tutors[0] || { name: "Tutor", city: "Capital" };

  // Escolhe tema com base no número da semana
  const themeIndex = (weekNumber - 4) % PROCEDURAL_THEMES.length;
  const theme = PROCEDURAL_THEMES[Math.max(0, themeIndex)]!;

  const langMissions = theme.missionsByLang[language] || theme.missionsByLang.en;

  return langMissions.map((tpl, idx) => ({
    id: `${language}-w${weekNumber}-${idx + 1}-${Date.now().toString(36)}`,
    language,
    week: weekNumber,
    weekTitle: `Semana ${weekNumber}: ${theme.titleSuffix}`,
    title: tpl.title,
    icon: tpl.icon,
    focus: theme.focus,
    situationDescription: tpl.situation,
    aiRole: tpl.aiRole,
    userRole: tpl.userRole,
    openingAiDialogue: tpl.opening,
    openingAiPhonetic: tpl.phonetic,
    openingAiPortuguese: tpl.pt,
    survivalObjective: tpl.objective,
    survivalTipsPt: tpl.tip,
    sampleResponses: tpl.suggestions.map((s) => s.target),
    structuredSuggestions: tpl.suggestions.map((s) => ({
      english: s.target,
      phonetic: s.phonetic,
      portuguese: s.pt,
    })),
    script: tpl.script.map((sc, scIdx) => ({
      id: `${language}-w${weekNumber}-${idx + 1}-sc-${scIdx}`,
      speaker: sc.speaker,
      roleType: sc.roleType,
      english: sc.target,
      phonetic: sc.phonetic,
      portuguese: sc.pt,
    })),
  }));
}
