import type translations from "./i18n.json";

export type Locale = "en" | "ga" | "de";

export const LOCALES: Locale[] = ["en", "ga", "de"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ga: "Gaeilge",
  de: "Deutsch",
};

export type TranslationKey = keyof typeof translations;
