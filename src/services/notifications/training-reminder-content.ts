import AsyncStorage from "@react-native-async-storage/async-storage";
import translations from "../../i18n/i18n.json";
import type { Locale, TranslationKey } from "../../i18n/types";
import type { TrainingReminderType } from "./types";

const LOCALE_STORAGE_KEY = "app_locale";

const readLocale = async (): Promise<Locale> => {
  const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "ga" || stored === "de" || stored === "en") {
    return stored;
  }
  return "en";
};

const translate = (key: TranslationKey, locale: Locale): string => {
  const entry = translations[key];
  if (!entry) {
    return key;
  }
  return entry[locale] ?? entry.en ?? key;
};

const TITLE_KEYS: Record<TrainingReminderType, TranslationKey> = {
  football: "notifications.football.title",
  hurling: "notifications.hurling.title",
};

const BODY_KEYS: Record<TrainingReminderType, TranslationKey> = {
  football: "notifications.football.body",
  hurling: "notifications.hurling.body",
};

export const getNotificationContent = async (
  type: TrainingReminderType,
): Promise<{ title: string; body: string }> => {
  const locale = await readLocale();
  return {
    title: translate(TITLE_KEYS[type], locale),
    body: translate(BODY_KEYS[type], locale),
  };
};
