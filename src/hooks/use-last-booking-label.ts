import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { LastBooking } from "../components/card/implementations/last-booking/types";
import { useLocale } from "../i18n";
import type { TranslationKey } from "../i18n/types";
import { formatTimeAgo } from "../utils";
import { SPORTS } from "./use-booking";

export const useLastBookingLabel = (
  bookingOverride?: LastBooking | null,
): string | null => {
  const { locale, t } = useLocale();
  const useAsyncStorage = bookingOverride === undefined;
  const [asyncBooking, setAsyncBooking] = useState<LastBooking | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (useAsyncStorage) {
      AsyncStorage.getItem("hsp_last_booking").then((raw) => {
        if (raw) {
          try {
            setAsyncBooking(JSON.parse(raw));
          } catch {}
        }
      });
    }
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [useAsyncStorage]);

  const booking = useAsyncStorage ? asyncBooking : (bookingOverride ?? null);
  if (!booking) {
    return null;
  }

  const match = SPORTS.find((s) => s.key === booking.sport);
  if (!match) {
    return null;
  }
  const sportLabel = t(match.translationKey as TranslationKey);
  return `${sportLabel} · ${formatTimeAgo(booking.bookedAt, locale)}`;
};
