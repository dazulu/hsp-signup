import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import type { LastBooking } from "../components/card/implementations/last-booking/types";
import { formatTimeAgo } from "../utils";
import { SPORTS } from "./use-booking";

/**
 * Returns a formatted "Sport · Xm ago" label for the last booking, or null if
 * there is no last booking.
 *
 * Pass `bookingOverride` when the caller already holds the booking in React
 * state (e.g. BookingForm via useBooking) — the hook will use that value
 * directly and skip the AsyncStorage read.
 *
 * Omit the argument when the caller has no in-memory booking (e.g.
 * LastBookingCard) — the hook reads from AsyncStorage on every focus event.
 *
 * In both cases the label is recomputed every minute while the screen is
 * focused, so the "X minutes ago" text stays current.
 */
export const useLastBookingLabel = (
  bookingOverride?: LastBooking | null,
): string | null => {
  const useAsyncStorage = bookingOverride === undefined;
  const [asyncBooking, setAsyncBooking] = useState<LastBooking | null>(null);
  const [, setTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
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
    }, [useAsyncStorage]),
  );

  const booking = useAsyncStorage ? asyncBooking : (bookingOverride ?? null);
  if (!booking) {
    return null;
  }

  const sportLabel = SPORTS.find((s) => s.key === booking.sport)?.label;
  return sportLabel
    ? `${sportLabel} · ${formatTimeAgo(booking.bookedAt)}`
    : null;
};
