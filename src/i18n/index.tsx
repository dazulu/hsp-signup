import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import translations from "./i18n.json";
import type { Locale, TranslationKey } from "./types";

const STORAGE_KEY = "app_locale";
const DEFAULT_LOCALE: Locale = "en";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => translations[key]?.[DEFAULT_LOCALE] ?? key,
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(Platform.OS === "web");

  // On native, load persisted locale from AsyncStorage
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY).then((storedLocale) => {
      if (
        storedLocale === "en" ||
        storedLocale === "ga" ||
        storedLocale === "de"
      ) {
        setLocaleState(storedLocale);
      } else {
        const deviceLang = getLocales()[0]?.languageCode ?? "en";
        const detected: Locale =
          deviceLang === "ga" || deviceLang === "de" ? deviceLang : "en";
        setLocaleState(detected);
        AsyncStorage.setItem(STORAGE_KEY, detected);
      }
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (Platform.OS !== "web") {
      AsyncStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const entry = translations[key];
      if (!entry) {
        return key;
      }
      let translation = entry[locale] ?? entry[DEFAULT_LOCALE] ?? key;
      if (vars) {
        for (const [variableKey, variableValue] of Object.entries(vars)) {
          translation = translation.replace(
            `\${${variableKey}}`,
            String(variableValue),
          );
        }
      }
      return translation;
    },
    [locale],
  );

  // On native, don't render children until locale is loaded to avoid flash
  if (!ready) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};
