import { SupportedLanguage } from "../../types/language";
import { TopWordCard } from "./types";
import { TOP_200_GERMAN } from "./de";
import { TOP_200_SPANISH } from "./es";
import { TOP_200_ITALIAN } from "./it";
import { TOP_200_FRENCH } from "./fr";
import { TOP_200_ENGLISH } from "./en";
import { TOP_200_JAPANESE } from "./ja";
import { TOP_200_KOINE_GREEK } from "./el";
import { TOP_200_RUSSIAN } from "./ru";

export * from "./types";
export {
  TOP_200_GERMAN,
  TOP_200_SPANISH,
  TOP_200_ITALIAN,
  TOP_200_FRENCH,
  TOP_200_ENGLISH,
  TOP_200_JAPANESE,
  TOP_200_KOINE_GREEK,
  TOP_200_RUSSIAN,
};

const LANGUAGE_TOP_200_MAP: Record<SupportedLanguage, TopWordCard[]> = {
  de: TOP_200_GERMAN,
  es: TOP_200_SPANISH,
  it: TOP_200_ITALIAN,
  fr: TOP_200_FRENCH,
  en: TOP_200_ENGLISH,
  ja: TOP_200_JAPANESE,
  "el-koine": TOP_200_KOINE_GREEK,
  ru: TOP_200_RUSSIAN,
};

export const getTop200Words = (language: SupportedLanguage): TopWordCard[] => {
  return LANGUAGE_TOP_200_MAP[language] || TOP_200_GERMAN;
};
