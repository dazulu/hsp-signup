import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useLocale } from "../i18n";
import { onBookingChanged } from "../services/notifications";
import { useCredentials } from "./use-credentials";

const uuid = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const r = (Math.random() * 16) | 0;
    return (character === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

const API_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
const LOADING_DURATION = 50; // seconds — wait before polling begins
const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 20;

// Demo credentials for reviewers
const DEMO_EMAIL = "gaa@mumblebox.com";
const DEMO_PASSWORD = "10a72n_gtc483@viu1q6j#4nb";

export const SPORTS = [
  {
    key: "hurling",
    label: "Hurling & Camogie",
    translationKey: "booking.sport.hurling" as const,
  },
  {
    key: "football",
    label: "Gaelic Football",
    translationKey: "booking.sport.football" as const,
  },
] as const;

export type SportKey = (typeof SPORTS)[number]["key"];
export type BookingState =
  | { phase: "idle" }
  | { phase: "triggering" }
  | { phase: "waiting"; correlationId: string }
  | { phase: "polling"; correlationId: string }
  | { phase: "success" }
  | { phase: "already_booked" }
  | { phase: "failure" }
  | { phase: "auth_failed" }
  | { phase: "no_membership" }
  | { phase: "timeout"; correlationId: string };

export const useBooking = () => {
  const { t } = useLocale();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveCredentials,
    saveOnDevice,
    setSaveOnDevice,
  } = useCredentials();
  const [sport, setSport] = useState<SportKey | null>(null);
  const [booking, setBooking] = useState<BookingState>({ phase: "idle" });
  const [ready, setReady] = useState(false);
  const [lastBooking, setLastBooking] = useState<{
    sport: SportKey;
    bookedAt: number;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef(0);
  const doneAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useSharedValue(0);
  const sportRef = useRef<SportKey | null>(null);
  const isDemoRef = useRef(false);

  // Animate and fire haptic when booking reaches a terminal state
  useEffect(() => {
    if (
      booking.phase === "success" ||
      booking.phase === "already_booked" ||
      booking.phase === "failure" ||
      booking.phase === "auth_failed" ||
      booking.phase === "no_membership" ||
      booking.phase === "timeout"
    ) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          booking.phase === "success" || booking.phase === "already_booked"
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error,
        );
      }
      Animated.timing(doneAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [booking.phase, doneAnim]);

  // Start countdown after booking is triggered
  // biome-ignore lint/correctness/useExhaustiveDependencies: dont need to track on progressAnim
  const startCountdown = useCallback(
    (
      correlationId: string,
      remaining: number = LOADING_DURATION,
      total: number = LOADING_DURATION,
    ) => {
      setBooking({ phase: "waiting", correlationId });
      progressAnim.value = (total - remaining) / total;

      // Animate progress bar smoothly to 100% on the UI thread
      progressAnim.value = withTiming(1, { duration: remaining * 1000 });

      countdownRef.current = remaining;
      timerRef.current = setInterval(() => {
        countdownRef.current -= 1;
        if (countdownRef.current <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          timerRef.current = null;
          setBooking({ phase: "polling", correlationId });
        }
      }, 1000);
    },
    [],
  );

  // Poll GitHub for workflow status when in polling phase
  useEffect(() => {
    if (booking.phase !== "polling") {
      return;
    }
    const { correlationId } = booking;

    // Demo mode: simulate success locally without hitting the real API
    if (isDemoRef.current) {
      isDemoRef.current = false;
      const currentSport = sportRef.current;
      if (currentSport) {
        const bookingRecord = { sport: currentSport, bookedAt: Date.now() };
        AsyncStorage.setItem("hsp_last_booking", JSON.stringify(bookingRecord))
          .then(() => onBookingChanged(currentSport))
          .catch(() => {});
        setLastBooking(bookingRecord);
      }
      setBooking({ phase: "success" });
      return;
    }

    let cancelled = false;
    let attempt = 0;

    const poll = () => {
      const delay = attempt === 0 ? 0 : POLL_INTERVAL_MS;
      pollRef.current = setTimeout(async () => {
        if (cancelled) {
          return;
        }
        try {
          const response = await fetch(
            `${API_URL}/api/status?correlationId=${correlationId}`,
            { headers: { "x-api-key": API_KEY } },
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          if (cancelled) {
            return;
          }

          if (data.status === "success") {
            const currentSport = sportRef.current;
            if (!cancelled && currentSport) {
              const bookingRecord = {
                sport: currentSport,
                bookedAt: Date.now(),
              };
              await AsyncStorage.setItem(
                "hsp_last_booking",
                JSON.stringify(bookingRecord),
              );
              setLastBooking(bookingRecord);
              onBookingChanged(currentSport);
            }
            if (!cancelled) {
              setBooking({ phase: "success" });
            }
          } else if (data.status === "auth_failed") {
            if (!cancelled) {
              setBooking({ phase: "auth_failed" });
            }
          } else if (data.status === "no_membership") {
            if (!cancelled) {
              setBooking({ phase: "no_membership" });
            }
          } else if (data.status === "already_booked") {
            if (!cancelled) {
              setBooking({ phase: "already_booked" });
            }
          } else if (data.status === "failure") {
            if (!cancelled) {
              setBooking({ phase: "failure" });
            }
          } else {
            attempt += 1;
            if (attempt >= MAX_POLLS) {
              if (!cancelled) {
                setBooking({ phase: "timeout", correlationId });
              }
            } else {
              poll();
            }
          }
        } catch {
          attempt += 1;
          if (attempt >= MAX_POLLS) {
            if (!cancelled) {
              setBooking({ phase: "timeout", correlationId });
            }
          } else {
            poll();
          }
        }
      }, delay);
    };

    poll();

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearTimeout(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [booking]);

  // Load saved values on mount and resume countdown if active
  useEffect(() => {
    (async () => {
      const [
        savedSport,
        savedTriggeredAt,
        savedLastBooking,
        savedCorrelationId,
      ] = await Promise.all([
        AsyncStorage.getItem("hsp_sport"),
        AsyncStorage.getItem("hsp_triggered_at"),
        AsyncStorage.getItem("hsp_last_booking"),
        AsyncStorage.getItem("hsp_correlation_id"),
      ]);
      if (savedSport === "hurling" || savedSport === "football") {
        setSport(savedSport);
        sportRef.current = savedSport;
      }
      if (savedLastBooking) {
        try {
          setLastBooking(JSON.parse(savedLastBooking));
        } catch {}
      }

      // Resume in-progress booking if still within time window
      if (savedTriggeredAt && savedCorrelationId) {
        const elapsed = Math.floor(
          (Date.now() - Number(savedTriggeredAt)) / 1000,
        );
        const totalDuration =
          LOADING_DURATION + (POLL_INTERVAL_MS / 1000) * MAX_POLLS;
        if (elapsed < LOADING_DURATION) {
          startCountdown(savedCorrelationId, LOADING_DURATION - elapsed);
        } else if (elapsed < totalDuration) {
          setBooking({ phase: "polling", correlationId: savedCorrelationId });
        } else {
          setBooking({ phase: "timeout", correlationId: savedCorrelationId });
          doneAnim.setValue(1);
        }
      } else if (savedTriggeredAt) {
        // Stale state without correlationId — clear it
        await AsyncStorage.removeItem("hsp_triggered_at");
      }

      setReady(true);
    })();
  }, [startCountdown, doneAnim.setValue]);

  // Persist sport choice
  const pickSport = useCallback((s: SportKey) => {
    setSport(s);
    sportRef.current = s;
    AsyncStorage.setItem("hsp_sport", s);
  }, []);

  // Dismiss any terminal booking state
  const dismiss = useCallback(async () => {
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.value = 0;
    setBooking({ phase: "idle" });
    await Promise.all([
      AsyncStorage.removeItem("hsp_triggered_at"),
      AsyncStorage.removeItem("hsp_correlation_id"),
    ]);
  }, [doneAnim, progressAnim]);

  // Restart polling from the timeout state ("Check Again")
  const checkAgain = useCallback(() => {
    if (booking.phase !== "timeout") {
      return;
    }
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    setBooking({ phase: "polling", correlationId: booking.correlationId });
  }, [booking, doneAnim]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: progressAnim is a stable shared value — same ref across renders, like useRef
  const book = useCallback(async () => {
    if (!email || !password || !sport) {
      return;
    }

    const correlationId = uuid();
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.value = 0;
    setBooking({ phase: "triggering" });
    await saveCredentials();
    const now = Date.now();
    await Promise.all([
      AsyncStorage.setItem("hsp_triggered_at", String(now)),
      AsyncStorage.setItem("hsp_correlation_id", correlationId),
    ]);

    try {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        isDemoRef.current = true;
        const demoDuration = 3 + Math.floor(Math.random() * 3); // 3–5 seconds
        startCountdown(correlationId, demoDuration, demoDuration);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        return;
      }

      const response = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, password, sport, correlationId }),
      });
      const data = await response.json();
      if (!data.ok) {
        await Promise.all([
          AsyncStorage.removeItem("hsp_triggered_at"),
          AsyncStorage.removeItem("hsp_correlation_id"),
        ]);
        setBooking({ phase: "idle" });
        Alert.alert(t("booking.error.title"), t("booking.error.startFailed"));
        return;
      }

      startCountdown(correlationId);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      await Promise.all([
        AsyncStorage.removeItem("hsp_triggered_at"),
        AsyncStorage.removeItem("hsp_correlation_id"),
      ]);
      setBooking({ phase: "idle" });
      Alert.alert(t("booking.error.title"), t("booking.error.noInternet"));
    }
  }, [
    email,
    password,
    sport,
    saveCredentials,
    startCountdown,
    doneAnim,
    t,
    // TODO: migrate doneAnim from legacy Animated.Value to Reanimated shared value
  ]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    sport,
    pickSport,
    booking,
    book,
    dismiss,
    checkAgain,
    saveCredentials,
    saveOnDevice,
    setSaveOnDevice,
    lastBooking,
    ready,
    doneAnim,
    progressAnim,
  };
};
