import { LanguageDefinition, SupportedLanguage } from "@/types/language";

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    id: "en",
    name: "Inglês",
    nativeName: "English",
    flag: "🇺🇸",
    speechLangCode: "en-US",
    description: "Idioma global para viagens, trabalho, tecnologia e conversas cotidianas.",
    welcomeMessage: "Welcome! Let's practice conversational English together.",
    defaultTutorId: "leo",
  },
  {
    id: "es",
    name: "Espanhol",
    nativeName: "Español",
    flag: "🇪🇸",
    speechLangCode: "es-ES",
    description: "Idioma falado em mais de 20 países, rico em cultura, caloroso e dinâmico.",
    welcomeMessage: "¡Bienvenido! Vamos a practicar español conversacional juntos.",
    defaultTutorId: "mateo",
  },
  {
    id: "ja",
    name: "Japonês",
    nativeName: "日本語 (Nihongo)",
    flag: "🇯🇵",
    speechLangCode: "ja-JP",
    description: "Hiragana, Katakana, polidez (Keigo) e conversas da cultura japonesa moderna e tradicional.",
    welcomeMessage: "ようこそ！ 一緒に日本語を練習しましょう。(Bem-vindo! Vamos praticar japonês juntos.)",
    defaultTutorId: "kenji",
  },
  {
    id: "el-koine",
    name: "Grego Koiné",
    nativeName: "Κοινή Ελληνική",
    flag: "🇬🇷",
    speechLangCode: "el-GR",
    description: "Grego bíblico do Novo Testamento e manuscritos antigos. Foco em leitura, raízes e termos teológicos.",
    welcomeMessage: "Χαῖρε! Μαθητεύσωμεν τὴν κοινὴν διάλεκτον. (Graça e paz! Aprendamos o grego koiné.)",
    defaultTutorId: "teofilo",
  },
  {
    id: "it",
    name: "Italiano",
    nativeName: "Italiano",
    flag: "🇮🇹",
    speechLangCode: "it-IT",
    description: "Língua musical da arte, gastronomia, história e expressão apaixonada.",
    welcomeMessage: "Benvenuto! Impariamo a parlare un italiano naturale insieme.",
    defaultTutorId: "matteo",
  },
  {
    id: "fr",
    name: "Francês",
    nativeName: "Français",
    flag: "🇫🇷",
    speechLangCode: "fr-FR",
    description: "Elegância, sons nasais sofisticados, literatura e conversação autêntica.",
    welcomeMessage: "Bienvenue ! Pratiquons ensemble un français élégant et vivant.",
    defaultTutorId: "antoine",
  },
  {
    id: "de",
    name: "Alemão",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    speechLangCode: "de-DE",
    description: "Língua germânica de precisão, lógica gramatical rica, literatura e conversação autêntica.",
    welcomeMessage: "Herzlich willkommen! Lass uns zusammen Deutsch üben. (Boas-vindas! Vamos praticar alemão juntos.)",
    defaultTutorId: "max",
  },
  {
    id: "ru",
    name: "Russo",
    nativeName: "Русский",
    flag: "🇷🇺",
    speechLangCode: "ru-RU",
    description: "Rico alfabeto cirílico, fonética expressiva, grande literatura clássica e conversação cotidiana.",
    welcomeMessage: "Добро пожаловать! Давайте вместе учить русский язык. (Boas-vindas! Vamos praticar russo juntos.)",
    defaultTutorId: "dmitri",
  },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]!;

export function getLanguageById(id?: string): LanguageDefinition {
  if (!id) return DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || DEFAULT_LANGUAGE;
}
