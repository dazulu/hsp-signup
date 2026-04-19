import * as ExpoCrypto from "expo-crypto";
import translations from "./i18n/i18n.json";
import type { Locale } from "./i18n/types";
import { getItemAsync, setItemAsync } from "./secure-store";

const USER_ID_KEY = "app_user_id";

export const getOrCreateUserId = async (): Promise<string> => {
  const existing = await getItemAsync(USER_ID_KEY);
  if (existing) {
    return existing;
  }
  const newId = ExpoCrypto.randomUUID();
  await setItemAsync(USER_ID_KEY, newId);
  return newId;
};

const PLACEHOLDER = "$" + "{n}";

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Parses "April 18 2026" — stored as English full month name, day, year.
// Using an explicit lookup avoids Hermes's non-standard date string behaviour.
export const parseStoredEventDate = (dateString: string): Date | null => {
  const parts = dateString.trim().split(/\s+/);
  if (parts.length !== 3) {
    return null;
  }
  const [monthStr, dayStr, yearStr] = parts;
  const monthIndex = EN_MONTHS.indexOf(monthStr);
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);
  if (monthIndex === -1 || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }
  return new Date(year, monthIndex, day);
};

const LOCALE_MAP: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
  ga: "ga-IE",
};

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const formatEventDate = (dateString: string, locale: Locale): string => {
  const date = parseStoredEventDate(dateString);
  if (!date) {
    return dateString;
  }
  const showYear = date.getFullYear() !== new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    ...(showYear && { year: "numeric" }),
  };
  const formatted = date.toLocaleDateString(LOCALE_MAP[locale], options);

  // English: replace plain day number with ordinal ("18" → "18th")
  if (locale === "en") {
    const day = date.getDate();
    return formatted.replace(
      new RegExp(`\\b${day}\\b`),
      `${day}${getOrdinalSuffix(day)}`,
    );
  }
  return formatted;
};

export const isValidEventDate = (dateString: string): boolean =>
  parseStoredEventDate(dateString) !== null;

export const sortContentfulEventsByDate = <T extends { value: string }>(
  items: T[],
): T[] =>
  [...items].sort((a, b) => {
    const dateA = parseStoredEventDate(a.value);
    const dateB = parseStoredEventDate(b.value);
    if (!dateA && !dateB) {
      return 0;
    }
    if (!dateA) {
      return 1;
    }
    if (!dateB) {
      return -1;
    }
    return dateA.getTime() - dateB.getTime();
  });

export const isDateInPast = (dateString: string): boolean => {
  const date = parseStoredEventDate(dateString);
  if (!date) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const COUNTDOWN_THRESHOLD_DAYS = 7;

export const getEventCountdownDays = (dateString: string): number | null => {
  const date = parseStoredEventDate(dateString);
  if (!date) {
    return null;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0 || diffDays > COUNTDOWN_THRESHOLD_DAYS) {
    return null;
  }
  return diffDays;
};

export const formatTimeAgo = (
  timestamp: number,
  locale: Locale = "en",
): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) {
    return translations["time.justNow"][locale];
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return translations["time.minutesAgo"][locale].replace(
      PLACEHOLDER,
      String(minutes),
    );
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return translations["time.hoursAgo"][locale].replace(
      PLACEHOLDER,
      String(hours),
    );
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return translations["time.yesterday"][locale];
  }
  if (days < 30) {
    return translations["time.daysAgo"][locale].replace(
      PLACEHOLDER,
      String(days),
    );
  }
  return new Date(timestamp).toLocaleDateString();
};
