import translations from "./i18n/i18n.json";
import type { Locale } from "./i18n/types";

const PLACEHOLDER = "$" + "{n}";

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
