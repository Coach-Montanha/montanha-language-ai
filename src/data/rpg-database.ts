import {
  CharacterBase,
  ShopItem,
  AvatarEquipment,
  SlotType,
} from "@/types/avatar";

// =========================================================================
// 1. BANCO DE DADOS DE PERSONAGENS & ARQUÉTIPOS RPG
// =========================================================================
export const CHARACTERS_DATABASE: CharacterBase[] = [
  {
    id: "valerius",
    name: "Valerius, o Escriba Errante",
    title: "Escriba Errante dos Manuscritos Sagrados",
    category: "HUMAN_MALE",
    lore: "Erudito itinerante que viajou pelos mosteiros e bibliotecas da Europa latina, transcrevendo códices raros e decifrando a gramática profunda das línguas latinas.",
    nativeLanguageBonus: "Romance_Languages",
    supportedLanguageBonusIds: ["es", "fr", "it"],
    baseSpriteAsset: "valerius_scribe",
    avatarGreeting: "Salve, estudioso! Os códices latinos iluminarão sua pronúncia hoje.",
  },
  {
    id: "kazan",
    name: "Kazan, a Lâmina Rúnica",
    title: "Guardião das Runas da Floresta Negra",
    category: "HUMAN_MALE",
    lore: "Guerreiro-sábio que gravou poemas épicos na lâmina de sua espada. Compreende a precisão cirúrgica e a cadência enérgica dos idiomas germânicos.",
    nativeLanguageBonus: "Germanic_Languages",
    supportedLanguageBonusIds: ["de", "en"],
    baseSpriteAsset: "kazan_runic_blade",
    avatarGreeting: "Erga sua voz com a firmeza do aço rúnico! Cada frase dominada é uma vitória.",
  },
  {
    id: "lyra",
    name: "Lyra, Tecelã de Ecos",
    title: "Mestra das Cordas Celestiais",
    category: "HUMAN_FEMALE",
    lore: "Artista mística capaz de sintonizar a ressonância das línguas tonais e pictográficas do oriente. Transforma fonemas complexos em pura melodia harmônica.",
    nativeLanguageBonus: "Asian_Languages",
    supportedLanguageBonusIds: ["ja"],
    baseSpriteAsset: "lyra_echo_weaver",
    avatarGreeting: "Ouça os ecos sutis de cada entonação. Deixe a harmonia guiar sua fala.",
  },
  {
    id: "astrid",
    name: "Valkíria Astrid",
    title: "Campeã dos Céus Boreais",
    category: "HUMAN_FEMALE",
    lore: "Donzela guerreira que entoa canções de glória sob as luzes da aurora boreal. Incute determinação férrea e destemor para falar línguas do norte com autoridade nativa.",
    nativeLanguageBonus: "Nordic_Languages",
    supportedLanguageBonusIds: ["de", "en"],
    baseSpriteAsset: "astrid_valkyrie",
    avatarGreeting: "Pelos ventos boreais! Avance sem hesitação — a coragem é a chave da fluência!",
  },
  {
    id: "anubis_shadow",
    name: "Sombra de Anúbis",
    title: "Guardião do Papiro Eterno",
    category: "MYTHIC_BEAST",
    lore: "Entidade ancestral canina das areias do Nilo, guardiã dos dialetos sagrados e mistérios funerários do Oriente Médio e línguas semíticas e clássicas.",
    nativeLanguageBonus: "Semitic_Languages",
    supportedLanguageBonusIds: ["el-koine"],
    baseSpriteAsset: "anubis_shadow_beast",
    avatarGreeting: "As areias do tempo sussurram os segredos dos ancestrais. Decifre a palavra.",
  },
  {
    id: "tengu_kurama",
    name: "Tengu Kurama",
    title: "Soberano dos Ventos de Kyoto",
    category: "MYTHIC_BEAST",
    lore: "Espírito alado das montanhas japonesas de Kurama. Mestre da oratória veloz, kanjis profundos e corte afiado na hesitação da fala.",
    nativeLanguageBonus: "East_Asian_Languages",
    supportedLanguageBonusIds: ["ja"],
    baseSpriteAsset: "tengu_kurama_beast",
    avatarGreeting: "Corte a hesitação com o vento das montanhas! Pronuncie com a velocidade do raio!",
  },
];

export const DEFAULT_CHARACTER_ID = "valerius";

export function getCharacterById(id: string): CharacterBase | undefined {
  return CHARACTERS_DATABASE.find((c) => c.id === id);
}

// =========================================================================
// 2. CATÁLOGO DA LOJA VIRTUAL RPG (SHOP_ITEMS_CATALOG)
// =========================================================================
export const SHOP_ITEMS_CATALOG: ShopItem[] = [
  // -------------------------------------------------------------
  // HEAD (Cabeça)
  // -------------------------------------------------------------
  {
    id: "head_tiara_aprendiz",
    name: "Tiara de Aprendiz",
    slot: "HEAD",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.02 },
    visualAsset: "head_tiara_aprendiz",
    description: "Tiara delicada de prata concedida a todo aspirante poliglota.",
    inspiration: "Academia Arcana Clássica",
  },
  {
    id: "head_bandana_caminhante",
    name: "Bandana do Caminhante",
    slot: "HEAD",
    rarity: "COMMON",
    costCoins: 40,
    requiredLevel: 1,
    statBonus: { coinBonus: 0.05 },
    visualAsset: "head_bandana_caminhante",
    description: "Bandana vermelha usada por viajantes experientes que cruzam fronteiras.",
    inspiration: "Aventureiros Nômades",
  },
  {
    id: "head_elmo_astora",
    name: "Elmo de Astora",
    slot: "HEAD",
    rarity: "RARE",
    costCoins: 160,
    requiredLevel: 2,
    statBonus: { xpMultiplier: 0.10, streakProtection: 1 },
    visualAsset: "head_elmo_astora",
    description: "Elmo de ferro polido que reflete a luz solar. Concede fé e determinação inabalável.",
    inspiration: "Dark Souls (Solaire de Astora - Praise the Sun!)",
  },
  {
    id: "head_chapeu_vivi",
    name: "Chapéu Pontudo de Vivi",
    slot: "HEAD",
    rarity: "EPIC",
    costCoins: 240,
    requiredLevel: 3,
    statBonus: { xpMultiplier: 0.15, coinBonus: 0.10 },
    visualAsset: "head_chapeu_vivi",
    description: "Chapéu cônico de abas largas que sombreia o rosto com mistério arcano e faíscas mágicas.",
    inspiration: "Final Fantasy IX (Vivi Ornitier)",
  },
  {
    id: "head_coroa_louros_sangue",
    name: "Coroa de Louros de Sangue",
    slot: "HEAD",
    rarity: "LEGENDARY",
    costCoins: 420,
    requiredLevel: 5,
    statBonus: { xpMultiplier: 0.25, coinBonus: 0.20, streakProtection: 1 },
    visualAsset: "head_coroa_louros_sangue",
    description: "Coroa vegetal em chamas carmesim forjada no coração do Tártaro. Concede eloquência e fúria retórica.",
    inspiration: "Hades (Zagreus, Príncipe do Submundo)",
  },

  // -------------------------------------------------------------
  // CHEST (Peitoral / Armadura / Manto)
  // -------------------------------------------------------------
  {
    id: "chest_tunica_novico",
    name: "Túnica de Linho do Noviço",
    slot: "CHEST",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.02 },
    visualAsset: "chest_tunica_novico",
    description: "Vestimenta simples e confortável para longas horas de estudo e conversação.",
    inspiration: "Mosteiros Renascentistas",
  },
  {
    id: "chest_gibao_couro",
    name: "Gibão de Couro de Explorador",
    slot: "CHEST",
    rarity: "COMMON",
    costCoins: 50,
    requiredLevel: 1,
    statBonus: { streakProtection: 1 },
    visualAsset: "chest_gibao_couro",
    description: "Gibão resistente com bolsos reforçados para anotações de vocabulário de campo.",
    inspiration: "Patrulheiros Florestais",
  },
  {
    id: "chest_manto_dalaran",
    name: "Manto de Dalaran",
    slot: "CHEST",
    rarity: "RARE",
    costCoins: 180,
    requiredLevel: 2,
    statBonus: { xpMultiplier: 0.12, coinBonus: 0.10 },
    visualAsset: "chest_manto_dalaran",
    description: "Manto cerimonial violeta e dourado tecido pelos arquimagos do Kirin Tor.",
    inspiration: "World of Warcraft (Kirin Tor de Dalaran)",
  },
  {
    id: "chest_armadura_lobo_branco",
    name: "Armadura do Lobo Branco",
    slot: "CHEST",
    rarity: "EPIC",
    costCoins: 300,
    requiredLevel: 4,
    statBonus: { xpMultiplier: 0.15, streakProtection: 2 },
    visualAsset: "chest_armadura_lobo_branco",
    description: "Armadura de couro batido com rebites de prata e medalhão de lobo. Imune ao desânimo.",
    inspiration: "The Witcher (Geralt de Rívia)",
  },

  // -------------------------------------------------------------
  // LEGS (Pernas / Grevas / Botas)
  // -------------------------------------------------------------
  {
    id: "legs_botas_rusticas",
    name: "Botas de Couro Rústicas",
    slot: "LEGS",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { coinBonus: 0.02 },
    visualAsset: "legs_botas_rusticas",
    description: "Botas duráveis capazes de resistir a incontáveis jornadas de aprendizado.",
    inspiration: "Caminhantes Rurais",
  },
  {
    id: "legs_calcas_reforcadas",
    name: "Calças Reforçadas de Linho",
    slot: "LEGS",
    rarity: "COMMON",
    costCoins: 45,
    requiredLevel: 1,
    statBonus: { coinBonus: 0.05 },
    visualAsset: "legs_calcas_reforcadas",
    description: "Calças utilitárias com costuras duplas para expedicionários nômades.",
    inspiration: "Viajantes da Estrada",
  },
  {
    id: "legs_grevas_hyrule",
    name: "Grevas do Andarilho de Hyrule",
    slot: "LEGS",
    rarity: "RARE",
    costCoins: 150,
    requiredLevel: 2,
    statBonus: { coinBonus: 0.15, streakProtection: 1 },
    visualAsset: "legs_grevas_hyrule",
    description: "Grevas leves projetadas para escalar montanhas e cruzar estepes sem perder o fôlego.",
    inspiration: "The Legend of Zelda: Breath of the Wild",
  },

  // -------------------------------------------------------------
  // MAIN_HAND (Mão Principal / Armas & Cajados)
  // -------------------------------------------------------------
  {
    id: "main_hand_pena_prata",
    name: "Pena de Prata do Escriba",
    slot: "MAIN_HAND",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.03 },
    visualAsset: "main_hand_pena_prata",
    description: "Instrumento de escrita ancestral com ponta de prata que nunca perde o fio.",
    inspiration: "Scriptoriums Clássicos",
  },
  {
    id: "main_hand_cajado_carvalho",
    name: "Cajado de Carvalho dos Bosques",
    slot: "MAIN_HAND",
    rarity: "COMMON",
    costCoins: 55,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.06 },
    visualAsset: "main_hand_cajado_carvalho",
    description: "Cajado esculpido de carvalho antigo coroado por um cristal verde cintilante.",
    inspiration: "Druidas Antigos",
  },
  {
    id: "main_hand_espada_selo_arcano",
    name: "Espada do Selo Arcano",
    slot: "MAIN_HAND",
    rarity: "RARE",
    costCoins: 190,
    requiredLevel: 2,
    statBonus: { xpMultiplier: 0.12, coinBonus: 0.10 },
    visualAsset: "main_hand_espada_selo_arcano",
    description: "Lâmina forjada em aço etéreo gravada com inscrições arcanas de foco linguístico.",
    inspiration: "RPGs Clássicos de Alta Fantasia & Runas de Poder",
  },
  {
    id: "main_hand_lamina_colossal_aco",
    name: "Lâmina Colossal de Aço",
    slot: "MAIN_HAND",
    rarity: "LEGENDARY",
    costCoins: 450,
    requiredLevel: 5,
    statBonus: { xpMultiplier: 0.30, streakProtection: 1 },
    visualAsset: "main_hand_lamina_colossal_aco",
    description: "Uma imensa massa de ferro cru que ultrapassa as dimensões de qualquer espada. Esmaga todo bloqueio mental.",
    inspiration: "Berserk (Dragon Slayer de Guts)",
  },

  // -------------------------------------------------------------
  // OFF_HAND (Mão Secundária / Grimórios & Escudos)
  // -------------------------------------------------------------
  {
    id: "off_hand_adaga_precisao",
    name: "Adaga da Precisão Gramatical",
    slot: "OFF_HAND",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.03 },
    visualAsset: "off_hand_adaga_precisao",
    description: "Adaga com gume afiado para dissecar orações subordinadas e concordâncias complexas.",
    inspiration: "Duelistas da Linguagem",
  },
  {
    id: "off_hand_lanterna_ecos",
    name: "Lanterna dos Ecos Arcanos",
    slot: "OFF_HAND",
    rarity: "RARE",
    costCoins: 160,
    requiredLevel: 2,
    statBonus: { xpMultiplier: 0.10, coinBonus: 0.08 },
    visualAsset: "off_hand_lanterna_ecos",
    description: "Lanterna de latão encantada cuja chama ilumina nuances fonéticas escondidas.",
    inspiration: "Faróis Celestiais",
  },
  {
    id: "off_hand_escudo_perseveranca",
    name: "Escudo Rúnico da Perseverança",
    slot: "OFF_HAND",
    rarity: "RARE",
    costCoins: 170,
    requiredLevel: 2,
    statBonus: { streakProtection: 2 },
    visualAsset: "off_hand_escudo_perseveranca",
    description: "Escudo forjado com ligas mágicas que protege a ofensiva diária contra distrações.",
    inspiration: "Escudos Medievais de Cruzadas",
  },
  {
    id: "off_hand_grimorio_idiomas",
    name: "Grimório dos Idiomas Perdidos",
    slot: "OFF_HAND",
    rarity: "EPIC",
    costCoins: 280,
    requiredLevel: 3,
    statBonus: { xpMultiplier: 0.15, coinBonus: 0.10 },
    visualAsset: "off_hand_grimorio_idiomas",
    description: "Tomo encadernado em couro com runas flutuantes que revelam etimologias esquecidas.",
    inspiration: "Grimórios Herméticos Antigos",
  },

  // -------------------------------------------------------------
  // BACK (Costas / Capas & Asas)
  // -------------------------------------------------------------
  {
    id: "back_capa_viajante",
    name: "Capa Simples de Viajante",
    slot: "BACK",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.02 },
    visualAsset: "back_capa_viajante",
    description: "Capa de lã que protege o explorador contra intempéries e climas severos.",
    inspiration: "Viajantes Medievais",
  },
  {
    id: "back_mochila_escriba",
    name: "Mochila do Escriba Expedicionário",
    slot: "BACK",
    rarity: "COMMON",
    costCoins: 75,
    requiredLevel: 1,
    statBonus: { coinBonus: 0.10, xpMultiplier: 0.05 },
    visualAsset: "back_mochila_escriba",
    description: "Mochila utilitária contendo mapas, dicionários de bolso, tinteiros e penas sobressalentes.",
    inspiration: "Diários de Viagem e Cartografia de Exploração",
  },
  {
    id: "back_asas_eter_noturno",
    name: "Asas do Éter Noturno",
    slot: "BACK",
    rarity: "LEGENDARY",
    costCoins: 480,
    requiredLevel: 6,
    statBonus: { xpMultiplier: 0.25, coinBonus: 0.25, streakProtection: 2 },
    visualAsset: "back_asas_eter_noturno",
    description: "Asas astrais compostas por luz estelar condensada. Elevam o aprendiz a patamares cósmicos de fluência.",
    inspiration: "Asas Celestiais e Mitologias Estelares",
  },

  // -------------------------------------------------------------
  // ACCESSORY (Acessório / Relíquias & Amuletos)
  // -------------------------------------------------------------
  {
    id: "accessory_amuleto_concentracao",
    name: "Amuleto da Concentração Diária",
    slot: "ACCESSORY",
    rarity: "COMMON",
    costCoins: 0,
    requiredLevel: 1,
    statBonus: { xpMultiplier: 0.03 },
    visualAsset: "accessory_amuleto_concentracao",
    description: "Pingente de jade esculpido para estabilizar o foco mental durante a prática de fala.",
    inspiration: "Meditação Zen",
  },
  {
    id: "accessory_anel_eloquente",
    name: "Anel do Eloquente",
    slot: "ACCESSORY",
    rarity: "RARE",
    costCoins: 140,
    requiredLevel: 2,
    statBonus: { coinBonus: 0.15 },
    visualAsset: "accessory_anel_eloquente",
    description: "Anel de ouro lapidado com rubi concedido aos mestres das artes da persuasão.",
    inspiration: "Diplomatas Venezianos",
  },
  {
    id: "accessory_ampulheta_disciplina",
    name: "Ampulheta da Disciplina",
    slot: "ACCESSORY",
    rarity: "EPIC",
    costCoins: 260,
    requiredLevel: 4,
    statBonus: { streakProtection: 2, xpMultiplier: 0.10 },
    visualAsset: "accessory_ampulheta_disciplina",
    description: "Ampulheta em miniatura contendo areias temporais que preservam o ritmo dos estudos diários.",
    inspiration: "Relógios de Areia Alquímicos",
  },
  {
    id: "accessory_pedra_roseta",
    name: "Fragmento da Pedra de Roseta",
    slot: "ACCESSORY",
    rarity: "MYTHIC",
    costCoins: 600,
    requiredLevel: 7,
    statBonus: { xpMultiplier: 0.35, coinBonus: 0.30, streakProtection: 3 },
    visualAsset: "accessory_pedra_roseta",
    description: "Pedaço da lendária estela trilingue de pedra negra. A relíquia máxima da decifração linguística mundial.",
    inspiration: "A Histórica Pedra de Roseta decifrada por Jean-François Champollion",
  },
];

export const STARTER_EQUIPMENT: AvatarEquipment = {
  HEAD: "head_tiara_aprendiz",
  CHEST: "chest_tunica_novico",
  LEGS: "legs_botas_rusticas",
  MAIN_HAND: "main_hand_pena_prata",
  OFF_HAND: "off_hand_adaga_precisao",
  BACK: "back_capa_viajante",
  ACCESSORY: "accessory_amuleto_concentracao",
};

export const STARTER_SHOP_ITEM_IDS: string[] = [
  "head_tiara_aprendiz",
  "chest_tunica_novico",
  "legs_botas_rusticas",
  "main_hand_pena_prata",
  "off_hand_adaga_precisao",
  "back_capa_viajante",
  "accessory_amuleto_concentracao",
];

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS_CATALOG.find((item) => item.id === id);
}

export function getShopItemsBySlot(slot: SlotType): ShopItem[] {
  return SHOP_ITEMS_CATALOG.filter((item) => item.slot === slot);
}

export function getShopItemsByRarity(rarity: ShopItem["rarity"]): ShopItem[] {
  return SHOP_ITEMS_CATALOG.filter((item) => item.rarity === rarity);
}
