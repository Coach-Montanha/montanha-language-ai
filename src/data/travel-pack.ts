import { SupportedLanguage } from "@/types/language";

export type TravelCategory = "airport" | "hotel" | "food" | "health" | "transport";

export interface TravelPhrase {
  id: string;
  category: TravelCategory;
  original: string;
  phoneticPt: string;
  translationPt: string;
  tipPt?: string | undefined;
}

export const TRAVEL_CATEGORIES = [
  { id: "all", label: "Todas", icon: "🌐" },
  { id: "airport", label: "Aeroporto", icon: "✈️" },
  { id: "hotel", label: "Hotel", icon: "🏨" },
  { id: "food", label: "Restaurante", icon: "🍽️" },
  { id: "transport", label: "Transporte", icon: "🚕" },
  { id: "health", label: "Emergência & Saúde", icon: "🚑" },
];

export const TRAVEL_PACK_DATA: Record<SupportedLanguage, TravelPhrase[]> = {
  en: [
    {
      id: "en-air-1",
      category: "airport",
      original: "Where is the baggage claim area?",
      phoneticPt: "uér is de béguedj kleim éria?",
      translationPt: "Onde fica a área de restituição de bagagens?",
      tipPt: "Use assim que desembarcar para encontrar as esteiras.",
    },
    {
      id: "en-air-2",
      category: "airport",
      original: "I am here on vacation for ten days.",
      phoneticPt: "ai ém hír on veiquêichan fór tén dêis.",
      translationPt: "Estou aqui de férias por dez dias.",
      tipPt: "Frase padrão clássica para a entrevista de imigração.",
    },
    {
      id: "en-hot-1",
      category: "hotel",
      original: "I have a reservation under the name of Silva.",
      phoneticPt: "ai rév a rezervêichan ânder de nêim óv Silva.",
      translationPt: "Tenho uma reserva no nome de Silva.",
      tipPt: "Apresente o passaporte junto com esta frase.",
    },
    {
      id: "en-hot-2",
      category: "hotel",
      original: "Could you please give me the Wi-Fi password?",
      phoneticPt: "kud iu pliz guív mi de uai-fai péssuôrd?",
      translationPt: "Você poderia me dar a senha do Wi-Fi, por favor?",
    },
    {
      id: "en-foo-1",
      category: "food",
      original: "A table for two, please.",
      phoneticPt: "a têibol fór tu, pliz.",
      translationPt: "Uma mesa para dois, por favor.",
    },
    {
      id: "en-foo-2",
      category: "food",
      original: "Could we have the check, please?",
      phoneticPt: "kud uí rév de tchék, pliz?",
      translationPt: "Poderia trazer a conta, por favor?",
      tipPt: "Nos EUA usa-se 'check'; no Reino Unido usa-se 'bill'.",
    },
    {
      id: "en-tra-1",
      category: "transport",
      original: "How much does it cost to go to downtown?",
      phoneticPt: "ráu mâtch dâz it kóst tu gou tu dauntáun?",
      translationPt: "Quanto custa para ir ao centro da cidade?",
    },
    {
      id: "en-hea-1",
      category: "health",
      original: "I need a doctor urgently. Where is the nearest pharmacy?",
      phoneticPt: "ai níd a dóctor ârdjentli. uér is de nírest fármaci?",
      translationPt: "Preciso de um médico urgente. Onde fica a farmácia mais próxima?",
    },
  ],
  ru: [
    {
      id: "ru-air-1",
      category: "airport",
      original: "Где находится выдача багажа?",
      phoneticPt: "Gdie nakhôditsa vídatcha bagajá?",
      translationPt: "Onde fica a retirada de bagagens?",
    },
    {
      id: "ru-air-2",
      category: "airport",
      original: "Я приехал как турист на две недели.",
      phoneticPt: "Ya priyékhal kak turíst na dvie niedéli.",
      translationPt: "Vim a turismo por duas semanas.",
    },
    {
      id: "ru-hot-1",
      category: "hotel",
      original: "У меня забронирован номер на имя Силва.",
      phoneticPt: "U meniá zabronírovan nómer na ímia Silva.",
      translationPt: "Tenho um quarto reservado em nome de Silva.",
    },
    {
      id: "ru-foo-1",
      category: "food",
      original: "Столик на двоих, пожалуйста. Принесите меню.",
      phoneticPt: "Stôlik na dvaíkh, pajálusta. Prinesíti meniú.",
      translationPt: "Uma mesa para dois, por favor. Traga o cardápio.",
    },
    {
      id: "ru-foo-2",
      category: "food",
      original: "Счёт, пожалуйста. Можно оплатить картой?",
      phoneticPt: "Schot, pajálusta. Môjna oplatít kártai?",
      translationPt: "A conta, por favor. Posso pagar com cartão?",
    },
    {
      id: "ru-tra-1",
      category: "transport",
      original: "Где ближайшая станция метро?",
      phoneticPt: "Gdie blijáishaia stantsia metró?",
      translationPt: "Onde fica a estação de metrô mais próxima?",
    },
    {
      id: "ru-hea-1",
      category: "health",
      original: "Помогите, пожалуйста! Мне нужна аптека или врач.",
      phoneticPt: "Pamaguíti, pajálusta! Mnie nujná aptiéka íli vratch.",
      translationPt: "Ajude, por favor! Preciso de uma farmácia ou médico.",
    },
  ],
  es: [
    {
      id: "es-air-1",
      category: "airport",
      original: "¿Dónde está la recogida de equipajes?",
      phoneticPt: "Dônde está la recohída de equipáhes?",
      translationPt: "Onde fica a esteira de retirada de bagagens?",
    },
    {
      id: "es-hot-1",
      category: "hotel",
      original: "Tengo una reserva a nombre de Silva.",
      phoneticPt: "Téngo úna resérba a nómbre de Silva.",
      translationPt: "Tenho uma reserva em nome de Silva.",
    },
    {
      id: "es-foo-1",
      category: "food",
      original: "La cuenta, por favor. ¿Está incluido el servicio?",
      phoneticPt: "La kuénta, por fabôr. ¿Está inkluído el serbício?",
      translationPt: "A conta, por favor. O serviço está incluído?",
    },
    {
      id: "es-tra-1",
      category: "transport",
      original: "¿Cuánto cuesta llegar al centro?",
      phoneticPt: "¿Kuánto kuésta yegar al tsêntro?",
      translationPt: "Quanto custa chegar ao centro?",
    },
    {
      id: "es-hea-1",
      category: "health",
      original: "No me siento bien, ¿dónde hay una farmacia cerca?",
      phoneticPt: "No me siênto biên, ¿dônde ái úna farmácia tsérka?",
      translationPt: "Não estou me sentindo bem, onde há uma farmácia por perto?",
    },
  ],
  fr: [
    {
      id: "fr-air-1",
      category: "airport",
      original: "Où se trouve la livraison des bagages?",
      phoneticPt: "U sê trúve la livrêzon dê bagáje?",
      translationPt: "Onde fica a esteira de bagagens?",
    },
    {
      id: "fr-hot-1",
      category: "hotel",
      original: "J'ai une réservation au nom de Silva.",
      phoneticPt: "Jê ün rezêrvasion ô non dê Silva.",
      translationPt: "Tenho uma reserva no nome de Silva.",
    },
    {
      id: "fr-foo-1",
      category: "food",
      original: "Une table pour deux s'il vous plaît, et l'addition ensuite.",
      phoneticPt: "Ün táble pur dâ sil vu plê, ê ladissión ansuíte.",
      translationPt: "Uma mesa para dois por favor, e a conta em seguida.",
    },
    {
      id: "fr-tra-1",
      category: "transport",
      original: "Où est la station de métro la plus proche?",
      phoneticPt: "U ê la stassión dê metrô la plü prôche?",
      translationPt: "Onde fica a estação de metrô mais próxima?",
    },
    {
      id: "fr-hea-1",
      category: "health",
      original: "J'ai besoin d'un médecin d'urgence, s'il vous plaît.",
      phoneticPt: "Jê bezuan dãn medessãn dürjãnce, sil vu plê.",
      translationPt: "Preciso de um médico com urgência, por favor.",
    },
  ],
  de: [
    {
      id: "de-air-1",
      category: "airport",
      original: "Wo ist die Gepäckausgabe bitte?",
      phoneticPt: "Vô ist di guepék-ausgábe bîte?",
      translationPt: "Onde fica a retirada de bagagens, por favor?",
    },
    {
      id: "de-hot-1",
      category: "hotel",
      original: "Ich habe ein Zimmer auf den Namen Silva reserviert.",
      phoneticPt: "Ikh rábe ain tsíma auf den námen Silva rezervírt.",
      translationPt: "Reservei um quarto em nome de Silva.",
    },
    {
      id: "de-foo-1",
      category: "food",
      original: "Die Rechnung bitte. Kann ich mit Karte bezahlen?",
      phoneticPt: "Di rékhnung bîte. Kan ikh mit kárte betsálen?",
      translationPt: "A conta, por favor. Posso pagar com cartão?",
    },
    {
      id: "de-tra-1",
      category: "transport",
      original: "Wie komme ich zum Bahnhof?",
      phoneticPt: "Vi kôme ikh tsum bán-hôf?",
      translationPt: "Como chego à estação ferroviária?",
    },
    {
      id: "de-hea-1",
      category: "health",
      original: "Ich brauche dringend einen Arzt. Wo ist eine Apotheke?",
      phoneticPt: "Ikh bráukhe drínguent áinen artst. Vô ist áine apotéke?",
      translationPt: "Preciso urgentemente de um médico. Onde tem uma farmácia?",
    },
  ],
  it: [
    {
      id: "it-air-1",
      category: "airport",
      original: "Dove si trova il ritiro bagagli?",
      phoneticPt: "Dôve si trôva il ritíro bagályi?",
      translationPt: "Onde fica a esteira de bagagens?",
    },
    {
      id: "it-hot-1",
      category: "hotel",
      original: "Ho una prenotazione a nome Silva.",
      phoneticPt: "Ô úna prenotatsióne a nôme Silva.",
      translationPt: "Tenho uma reserva em nome de Silva.",
    },
    {
      id: "it-foo-1",
      category: "food",
      original: "Il conto, per favore. Era tutto squisito!",
      phoneticPt: "Il kônto, per favôre. Éra túto skuizíto!",
      translationPt: "A conta, por favor. Estava tudo delicioso!",
    },
    {
      id: "it-tra-1",
      category: "transport",
      original: "Dov'è la stazione dei treni più vicina?",
      phoneticPt: "Dov-ê la statsión dêi tréni piú vitchína?",
      translationPt: "Onde fica a estação de trem mais próxima?",
    },
    {
      id: "it-hea-1",
      category: "health",
      original: "Ho bisogno di un dottore. C'è una farmacia qui vicino?",
      phoneticPt: "Ô bizônyo di un dotôre. Tchê úna farmatchía kui vitchíno?",
      translationPt: "Preciso de um médico. Tem uma farmácia aqui perto?",
    },
  ],
  ja: [
    {
      id: "ja-air-1",
      category: "airport",
      original: "手荷物受取所はどこですか？ (Tenimotsu uketorijo wa doko desu ka?)",
      phoneticPt: "Tenimôtsu uketôrijo ua dôko dêssu ka?",
      translationPt: "Onde fica a esteira de bagagens?",
    },
    {
      id: "ja-hot-1",
      category: "hotel",
      original: "シルバの名前で予約しています。 (Silva no namae de yoyaku shite imasu.)",
      phoneticPt: "Shiruba no namaê de yoiáku shtê imássu.",
      translationPt: "Tenho uma reserva no nome de Silva.",
    },
    {
      id: "ja-foo-1",
      category: "food",
      original: "お会計をお願いします。 (O-kaikei o onegai shimasu.)",
      phoneticPt: "Ô-kaikêi o onegái shimássu.",
      translationPt: "A conta, por favor.",
    },
    {
      id: "ja-tra-1",
      category: "transport",
      original: "一番近い駅はどこですか？ (Ichiban chikai eki wa doko desu ka?)",
      phoneticPt: "Itchibán tchíkai êki ua dôko dêssu ka?",
      translationPt: "Onde fica a estação mais próxima?",
    },
    {
      id: "ja-hea-1",
      category: "health",
      original: "病院に行きたいです。助けてください。 (Byōin ni ikitai desu. Tasukete kudasai.)",
      phoneticPt: "Bióin ni ikitái dêssu. Tassukêtê kudassái.",
      translationPt: "Preciso ir ao hospital. Por favor, me ajude.",
    },
  ],
  "el-koine": [
    {
      id: "el-foo-1",
      category: "food",
      original: "Δὸς ἡμῖν ἄρτον καὶ ὕδωρ. (Dos hemin arton kai hydor.)",
      phoneticPt: "Dós remín árton kai rídor.",
      translationPt: "Dá-nos pão e água.",
    },
    {
      id: "el-hot-1",
      category: "hotel",
      original: "Ποῦ ἐστιν ὁ τόπος τῆς καταλύσεως; (Pou estin ho topos tes katalyseos?)",
      phoneticPt: "Pu éstin ro tópos tês katalísseos?",
      translationPt: "Onde é o lugar de hospedagem / pousada?",
    },
    {
      id: "el-hea-1",
      category: "health",
      original: "Κύριε, βοήθει μοι! (Kyrie, boethei moi!)",
      phoneticPt: "Kírie, boêthei moi!",
      translationPt: "Senhor, ajude-me!",
    },
  ],
};

export function getTravelPhrasesForLanguage(
  language: SupportedLanguage,
  category?: TravelCategory | "all"
): TravelPhrase[] {
  const phrases = TRAVEL_PACK_DATA[language] || TRAVEL_PACK_DATA.en;
  if (!category || category === "all") {
    return phrases;
  }
  return phrases.filter((p) => p.category === category);
}
