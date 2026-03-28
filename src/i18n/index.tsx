import AsyncStorage from "@react-native-async-storage/async-storage";
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
  setLocale: (l: Locale) => void;
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
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "en" || val === "ga" || val === "de") {
        setLocaleState(val);
      }
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (Platform.OS !== "web") {
      AsyncStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const entry = translations[key];
      if (!entry) {
        return key;
      }
      let str = entry[locale] ?? entry[DEFAULT_LOCALE] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`\${${k}}`, String(v));
        }
      }
      return str;
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
