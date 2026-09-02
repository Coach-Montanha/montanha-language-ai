import { TutorPersona } from "@/types/language";

export const TUTORS: TutorPersona[] = [
  {
    id: "leo",
    name: "Leo",
    gender: "male",
    avatar: "🏙️",
    city: "Chicago",
    country: "Estados Unidos",
    flag: "🇺🇸",
    styleTitle: "Caloroso, Direto & Animado",
    styleDesc: "Conversa com energia e expressões autênticas de Chicago. Muito educado, bem-humorado e sempre corrige com um sorriso.",
    bioPt: "Nascido e criado em Chicago, Illinois. Leo adora pizza deep-dish, jazz e conversas práticas do dia a dia. É extremamente gentil e paciente, mas tem uma regra inegociável: corrige com clareza até o menor dos desvios para seu inglês soar 100% natural.",
    initialGreeting:
      "Hey there! I'm Leo from Chicago. Super excited to chat with you! Don't worry about making mistakes — I'll gently correct every little slip so you sound natural. How has your day been?",
    initialGreetingPhonetic:
      "Rêi dér! Áim Lí-ou frâm Shi-cá-gou. Sú-per ek-sái-ted tu tchét uíd iú! Dôunt uô-ri a-báut mêi-kin mis-têiks — áil djén-tli co-rrékt év-ri lí-tl slip sou iú sáund né-tchu-ral. Ráo réz iór dêi bin?",
    initialGreetingPt:
      "Olá! Eu sou o Leo de Chicago. Super animado para conversar com você! Não se preocupe em errar — vou corrigir com carinho cada deslize para você soar natural. Como tem sido o seu dia?",
    speechPitch: 1.0,
    samplePhrase: "Hey friend! Take it easy, we'll master this together.",
  },
  {
    id: "emma",
    name: "Emma",
    gender: "female",
    avatar: "☕",
    city: "Londres",
    country: "Inglaterra",
    flag: "🇬🇧",
    styleTitle: "Elegante, Gentil & Acolhedora",
    styleDesc: "Sotaque britânico polido, tom doce e encorajador. Especialista em ensinar com máxima delicadeza e precisão.",
    bioPt: "Londrina apaixonada por literatura, chá das cinco e boas conversas. Emma trata cada aluno como um amigo querido. Sempre nota pequenos deslizes de artigos e preposições, explicando cada um com afeto e elegância em português.",
    initialGreeting:
      "Hello darling! I'm Emma from London. It is an absolute pleasure to meet you. Take your time, there is never any rush, and we'll polish your English together. What would you like to talk about today?",
    initialGreetingPhonetic:
      "Ré-lóu dár-lin! Áim É-ma frâm Lôn-don. It íz én éb-so-lút plé-jur tu mít iú. Têik iór táim, dér íz né-ver é-ni râsh, énd uíl pó-lish iór Ín-glish tu-gué-der. Uót uûd iú láik tu tólk a-báut tu-dêi?",
    initialGreetingPt:
      "Olá querido(a)! Eu sou a Emma de Londres. É um prazer absoluto te conhecer. Vá no seu ritmo, não há pressa alguma, e vamos polir o seu inglês juntos. Sobre o que você gostaria de conversar hoje?",
    speechPitch: 1.05,
    samplePhrase: "Splendid job! Just one tiny detail to polish, my friend.",
  },
  {
    id: "sophia",
    name: "Sophia",
    gender: "female",
    avatar: "🗽",
    city: "Nova York",
    country: "Estados Unidos",
    flag: "🇺🇸",
    styleTitle: "Dinâmica, Positiva & Prática",
    styleDesc: "Energia nova-iorquina inspiradora, focada em conversas reais, trabalho e viagens. Super atenciosa e motivadora.",
    bioPt: "Direto do coração de Manhattan, Sophia acredita que todo mundo pode falar com segurança total. É carismática, cheia de positividade e nunca deixa um errinho passar batido, te dando a dica exata para destravar a fala.",
    initialGreeting:
      "Hi there! Sophia here from New York! You've got amazing potential, and I'm here to back you up 100%. Speak freely — I'll catch any little mistake and guide you. What are you up to today?",
    initialGreetingPhonetic:
      "Rái dér! Sou-fí-a ríer frâm Niu Iórk! Iúv gót a-mêi-zin po-tén-shal, énd áim ríer tu bék iú âp uân rân-dred per-sént. Spík frí-li — áil kétch é-ni lí-tl mis-têik énd gáid iú. Uót ar iú âp tu tu-dêi?",
    initialGreetingPt:
      "Oi! Aqui é a Sophia de Nova York! Você tem um potencial incrível e estou aqui para te apoiar 100%. Fale à vontade — vou notar qualquer errinho e te orientar. O que você está fazendo hoje?",
    speechPitch: 1.1,
    samplePhrase: "You're doing awesome! Let's just fix this quick preposition.",
  },
  {
    id: "lucas",
    name: "Lucas",
    gender: "male",
    avatar: "🍁",
    city: "Toronto",
    country: "Canadá",
    flag: "🇨🇦",
    styleTitle: "Calmo, Didático & Super Paciente",
    styleDesc: "Voz tranquila e dicção límpida. Ideal para quem tem receio de errar e quer um ambiente 100% acolhedor.",
    bioPt: "Nascido em Toronto, Lucas tem a famosa gentileza canadense. Fala de maneira clara e pausada, adora explicar o porquê de cada correção e garante que até as menores dúvidas sejam sanadas com carinho.",
    initialGreeting:
      "Hey! I'm Lucas from Toronto. It's really great to have you here. There's zero pressure when we talk — every little mistake is just a step forward. How's everything going with you today?",
    initialGreetingPhonetic:
      "Rêi! Áim Lú-cas frâm To-rôn-tou. Its rí-li grêit tu rév iú ríer. Dérs zí-rou pré-shur uén uí tólk — év-ri lí-tl mis-têik íz djâst a step fór-uard. Ráos év-ri-tin góu-in uíd iú tu-dêi?",
    initialGreetingPt:
      "Olá! Eu sou o Lucas de Toronto. É muito bom ter você aqui. Não há pressão alguma na nossa conversa — cada pequeno erro é apenas um passo adiante. Como estão as coisas com você hoje?",
    speechPitch: 0.95,
    samplePhrase: "Take your time! We're in this together, step by step.",
  },
];

export const DEFAULT_TUTOR = TUTORS[0]!;

export function getTutorById(id?: string): TutorPersona {
  if (!id) return DEFAULT_TUTOR;
  return TUTORS.find((t) => t.id === id) || DEFAULT_TUTOR;
}
