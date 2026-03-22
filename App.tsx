import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "./secureStore";

const API_URL =
  Platform.OS === "web" ? "" : (process.env.EXPO_PUBLIC_API_URL ?? "");
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
const LOADING_DURATION = 50; // seconds — wait before polling begins
const POLL_INTERVAL_MS = 10_000;
const MAX_POLLS = 10;

const SPORTS = [
  { key: "hurling", label: "Hurling & Camogie" },
  { key: "football", label: "Gaelic Football" },
] as const;

type SportKey = (typeof SPORTS)[number]["key"];
type BookingState =
  | { phase: "idle" }
  | { phase: "triggering" }
  | { phase: "waiting"; correlationId: string }
  | { phase: "polling"; correlationId: string }
  | { phase: "success" }
  | { phase: "failure" }
  | { phase: "timeout"; correlationId: string };

export default function App() {
  const [fontsLoaded] = useFonts({
    "jakarta-400": require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    "jakarta-500": require("@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf"),
    "jakarta-600": require("@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf"),
    "jakarta-700": require("@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf"),
    "jakarta-800": require("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"),
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sport, setSport] = useState<SportKey | null>(null);
  const [booking, setBooking] = useState<BookingState>({ phase: "idle" });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [lastBooking, setLastBooking] = useState<{
    sport: SportKey;
    bookedAt: number;
  } | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const debugTaps = useRef(0);
  const debugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const sportRef = useRef<SportKey | null>(null);

  const handleCrestTap = useCallback(() => {
    if (!__DEV__) {
      return;
    }
    debugTaps.current += 1;
    if (debugTimer.current) {
      clearTimeout(debugTimer.current);
    }
    if (debugTaps.current >= 15) {
      debugTaps.current = 0;
      setDebugOpen((v) => !v);
    } else {
      debugTimer.current = setTimeout(() => {
        debugTaps.current = 0;
      }, 500);
    }
  }, []);

  // Animate and fire haptic when booking reaches a terminal state
  useEffect(() => {
    if (
      booking.phase === "success" ||
      booking.phase === "failure" ||
      booking.phase === "timeout"
    ) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          booking.phase === "success"
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
  const startCountdown = useCallback(
    (correlationId: string, remaining: number = LOADING_DURATION) => {
      setSecondsLeft(remaining);
      setBooking({ phase: "waiting", correlationId });
      progressAnim.setValue((LOADING_DURATION - remaining) / LOADING_DURATION);

      // Animate progress bar smoothly to 100%
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: remaining * 1000,
        useNativeDriver: false,
      }).start();

      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            timerRef.current = null;
            setBooking({ phase: "polling", correlationId });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [progressAnim],
  );

  // Poll GitHub for workflow status when in polling phase
  useEffect(() => {
    if (booking.phase !== "polling") {
      return;
    }
    const { correlationId } = booking;
    let cancelled = false;
    let attempt = 0;

    const poll = () => {
      const delay = attempt === 0 ? 0 : POLL_INTERVAL_MS;
      pollRef.current = setTimeout(async () => {
        if (cancelled) {
          return;
        }
        try {
          const res = await fetch(
            `${API_URL}/api/status?correlationId=${correlationId}`,
            { headers: { "x-api-key": API_KEY } },
          );
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
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
            }
            if (!cancelled) {
              setBooking({ phase: "success" });
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

  // Pulse animation while polling
  useEffect(() => {
    if (booking.phase === "polling") {
      pulseAnim.setValue(0.3);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => {
        animation.stop();
        pulseAnim.setValue(0);
      };
    }
  }, [booking.phase, pulseAnim]);

  // Load saved values on mount and resume countdown if active
  useEffect(() => {
    (async () => {
      const [
        savedEmail,
        savedPassword,
        savedSport,
        savedTriggeredAt,
        savedLastBooking,
        savedCorrelationId,
      ] = await Promise.all([
        SecureStore.getItemAsync("hsp_email"),
        SecureStore.getItemAsync("hsp_password"),
        AsyncStorage.getItem("hsp_sport"),
        AsyncStorage.getItem("hsp_triggered_at"),
        AsyncStorage.getItem("hsp_last_booking"),
        AsyncStorage.getItem("hsp_correlation_id"),
      ]);
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
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

  // Debug helpers (dev only)
  const debugFakeLoading = useCallback(() => {
    setDebugOpen(false);
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.setValue(0);
    setBooking({ phase: "triggering" });
    setTimeout(() => startCountdown(generateUUID()), 1500);
  }, [startCountdown, doneAnim, progressAnim]);

  const debugFakeSuccess = useCallback(() => {
    setDebugOpen(false);
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    setBooking({ phase: "success" });
  }, [doneAnim]);

  const debugFakeFailure = useCallback(() => {
    setDebugOpen(false);
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    setBooking({ phase: "failure" });
  }, [doneAnim]);

  const debugFakeLastBooking = useCallback(() => {
    setDebugOpen(false);
    setLastBooking({ sport: "hurling", bookedAt: Date.now() - 3600_000 });
  }, []);

  const debugReset = useCallback(() => {
    setDebugOpen(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
    if (pollRef.current) {
      clearTimeout(pollRef.current);
    }
    pollRef.current = null;
    setBooking({ phase: "idle" });
    setSecondsLeft(0);
    setLastBooking(null);
    progressAnim.setValue(0);
    doneAnim.setValue(0);
    pulseAnim.setValue(0);
    AsyncStorage.multiRemove([
      "hsp_triggered_at",
      "hsp_correlation_id",
      "hsp_last_booking",
    ]);
  }, [progressAnim, doneAnim, pulseAnim]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (pollRef.current) {
        clearTimeout(pollRef.current);
      }
    };
  }, []);

  // Persist sport choice
  const pickSport = useCallback((s: SportKey) => {
    setSport(s);
    sportRef.current = s;
    AsyncStorage.setItem("hsp_sport", s);
  }, []);

  // Save credentials
  const saveCredentials = useCallback(async () => {
    await Promise.all([
      SecureStore.setItemAsync("hsp_email", email),
      SecureStore.setItemAsync("hsp_password", password),
    ]);
  }, [email, password]);

  // Dismiss any terminal booking state
  const dismiss = useCallback(async () => {
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.setValue(0);
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

  // Book
  const book = useCallback(async () => {
    if (!email || !password || !sport) {
      return;
    }

    const correlationId = generateUUID();
    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.setValue(0);
    setBooking({ phase: "triggering" });
    await saveCredentials();
    const now = Date.now();
    await Promise.all([
      AsyncStorage.setItem("hsp_triggered_at", String(now)),
      AsyncStorage.setItem("hsp_correlation_id", correlationId),
    ]);

    try {
      const res = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, password, sport, correlationId }),
      });
      const data = await res.json();
      if (!data.ok) {
        await Promise.all([
          AsyncStorage.removeItem("hsp_triggered_at"),
          AsyncStorage.removeItem("hsp_correlation_id"),
        ]);
        setBooking({ phase: "idle" });
        Alert.alert(
          "Error",
          "Could not start the booking. Please try again later.",
        );
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
      Alert.alert(
        "Error",
        "Couldn't connect. Check your internet and try again.",
      );
    }
  }, [
    email,
    password,
    sport,
    saveCredentials,
    startCountdown,
    doneAnim,
    progressAnim,
  ]);

  const isLoading =
    booking.phase === "triggering" ||
    booking.phase === "waiting" ||
    booking.phase === "polling";
  const canBook = !!(email && password && sport) && !isLoading;

  if (!ready || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <LinearGradient
          colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A6CF7" />
          </SafeAreaView>
        </LinearGradient>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.flex}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable
                onPress={Platform.OS !== "web" ? Keyboard.dismiss : undefined}
                accessible={false}
              >
                <Pressable onPress={handleCrestTap}>
                  <Image
                    source={require("./assets/crest.png")}
                    style={styles.crest}
                    resizeMode="contain"
                  />
                </Pressable>

                {__DEV__ && debugOpen && (
                  <View style={styles.debugPanel}>
                    <Text style={styles.debugTitle}>Debug</Text>
                    <View style={styles.debugRow}>
                      <Pressable
                        style={styles.debugBtn}
                        onPress={debugFakeLoading}
                      >
                        <Text style={styles.debugBtnText}>Fake Loading</Text>
                      </Pressable>
                      <Pressable
                        style={styles.debugBtn}
                        onPress={debugFakeLastBooking}
                      >
                        <Text style={styles.debugBtnText}>
                          Fake Last Booking
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.debugBtn, styles.debugBtnReset]}
                        onPress={debugReset}
                      >
                        <Text style={styles.debugBtnText}>Reset</Text>
                      </Pressable>
                    </View>
                    <View style={[styles.debugRow, { marginTop: 8 }]}>
                      <Pressable
                        style={styles.debugBtn}
                        onPress={debugFakeSuccess}
                      >
                        <Text style={styles.debugBtnText}>Fake Success</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.debugBtn, styles.debugBtnReset]}
                        onPress={debugFakeFailure}
                      >
                        <Text style={styles.debugBtnText}>Fake Failure</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <View style={styles.card}>
                  <Text style={styles.title}>Book Training</Text>
                  <Text style={styles.subtitle}>
                    Books the next available training session open for signup on
                    the Hochschulsport website.
                  </Text>

                  {/* Email */}
                  <Text style={styles.label}>Hochschulsport Email</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.inputDisabled]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#b0b8c9"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!isLoading}
                    accessibilityLabel="Email address"
                  />

                  {/* Password */}
                  <Text style={styles.label}>Hochschulsport Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        isLoading && styles.inputDisabled,
                      ]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#b0b8c9"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      editable={!isLoading}
                      accessibilityLabel="Password"
                    />
                    <Pressable
                      style={[styles.eyeBtn, isLoading && styles.inputDisabled]}
                      onPress={() => setShowPassword((v) => !v)}
                      disabled={isLoading}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Text style={styles.eyeText}>
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Sport picker */}
                  <Text style={styles.label}>Sport</Text>
                  <View style={styles.sportRow}>
                    {SPORTS.map((s) => (
                      <Pressable
                        key={s.key}
                        style={[
                          styles.sportBtn,
                          sport === s.key && styles.sportBtnActive,
                          isLoading && styles.sportBtnDisabled,
                        ]}
                        onPress={() => pickSport(s.key)}
                        disabled={isLoading}
                        accessibilityRole="button"
                        accessibilityState={{ selected: sport === s.key }}
                        accessibilityLabel={`Select ${s.label}`}
                      >
                        <Text
                          style={[
                            styles.sportBtnText,
                            sport === s.key && styles.sportBtnTextActive,
                          ]}
                        >
                          {s.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Book button */}
                  <Pressable
                    style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
                    onPress={book}
                    disabled={!canBook}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isLoading
                        ? "Booking in progress"
                        : "Book training session"
                    }
                  >
                    {isLoading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.bookBtnText}>
                          {booking.phase === "triggering"
                            ? "Sending…"
                            : booking.phase === "polling"
                              ? "Checking result…"
                              : `Booking in progress… ${secondsLeft}s`}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.bookBtnText}>Book</Text>
                    )}
                  </Pressable>

                  {/* Progress bar */}
                  {(booking.phase === "waiting" ||
                    booking.phase === "polling") && (
                    <View style={styles.progressTrack}>
                      {booking.phase === "waiting" ? (
                        <Animated.View
                          style={[
                            styles.progressFill,
                            {
                              width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                      ) : (
                        <Animated.View
                          style={[
                            styles.progressFill,
                            styles.progressFillFull,
                            { opacity: pulseAnim },
                          ]}
                        />
                      )}
                    </View>
                  )}

                  {/* Success message */}
                  {booking.phase === "success" && (
                    <Animated.View
                      style={[styles.statusBox, { opacity: doneAnim }]}
                    >
                      <Text style={styles.statusText}>
                        You should receive an email shortly from Hochschulsport
                        Hamburg. If you have not received one within 10 minutes,
                        try again.
                      </Text>
                      <Pressable
                        style={styles.dismissBtn}
                        onPress={dismiss}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss success message"
                      >
                        <Text style={styles.dismissBtnText}>Dismiss</Text>
                      </Pressable>
                    </Animated.View>
                  )}

                  {/* Failure message */}
                  {booking.phase === "failure" && (
                    <Animated.View
                      style={[
                        styles.statusBox,
                        styles.statusBoxError,
                        { opacity: 1 },
                      ]}
                    >
                      <Text style={[styles.statusText, styles.statusTextError]}>
                        Booking unsuccessful. Ensure you have an active
                        Hochschulsport Hamburg account with paid membership.
                      </Text>
                      <Pressable
                        style={styles.dismissBtn}
                        onPress={dismiss}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss failure message"
                      >
                        <Text style={styles.dismissBtnText}>Dismiss</Text>
                      </Pressable>
                    </Animated.View>
                  )}

                  {/* Timeout message */}
                  {booking.phase === "timeout" && (
                    <Animated.View
                      style={[
                        styles.statusBox,
                        styles.statusBoxNeutral,
                        { opacity: doneAnim },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, styles.statusTextNeutral]}
                      >
                        Could not confirm success. If you don't receive a
                        confirmation email within 10 minutes, try again.
                      </Text>
                      <View style={styles.statusBtnRow}>
                        <Pressable
                          style={styles.dismissBtn}
                          onPress={checkAgain}
                          accessibilityRole="button"
                          accessibilityLabel="Check again"
                        >
                          <Text style={styles.dismissBtnText}>Check Again</Text>
                        </Pressable>
                        <Pressable
                          style={styles.dismissBtn}
                          onPress={dismiss}
                          accessibilityRole="button"
                          accessibilityLabel="Dismiss message"
                        >
                          <Text style={styles.dismissBtnText}>Dismiss</Text>
                        </Pressable>
                      </View>
                    </Animated.View>
                  )}
                </View>

                {lastBooking && booking.phase === "idle" && (
                  <View
                    style={[
                      styles.lastBookingBox,
                      isRecentBooking(lastBooking.bookedAt) &&
                        styles.lastBookingRecent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lastBookingText,
                        isRecentBooking(lastBooking.bookedAt) &&
                          styles.lastBookingTextRecent,
                      ]}
                    >
                      {"\u2713"}{" "}
                      {SPORTS.find((s) => s.key === lastBooking.sport)?.label}{" "}
                      {"\u00B7"} {formatTimeAgo(lastBooking.bookedAt)}
                    </Text>
                  </View>
                )}

                <Text style={styles.disclaimer}>
                  Your credentials are stored securely on this device and used
                  only to complete the booking.
                </Text>
              </Pressable>
            </ScrollView>
            <StatusBar style="dark" />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isRecentBooking(timestamp: number): boolean {
  return Date.now() - timestamp < 86_400_000; // 24 hours
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "yesterday";
  }
  if (days < 30) {
    return `${days}d ago`;
  }
  return new Date(timestamp).toLocaleDateString();
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingVertical: 40,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  crest: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#8ba4e8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: "jakarta-800",
    color: "#1a1f36",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "jakarta-400",
    color: "#6b7a99",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "jakarta-600",
    color: "#6b7a99",
    marginBottom: 6,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#f4f6fb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "jakarta-400",
    color: "#1a1f36",
    borderWidth: 1,
    borderColor: "#e8ecf4",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeBtn: {
    backgroundColor: "#f4f6fb",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: "#e8ecf4",
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 13,
    fontFamily: "jakarta-600",
    color: "#4A6CF7",
    includeFontPadding: false,
  },
  sportRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  sportBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e8ecf4",
    alignItems: "center",
    backgroundColor: "#f4f6fb",
  },
  sportBtnActive: {
    backgroundColor: "#4A6CF7",
    borderColor: "#4A6CF7",
  },
  sportBtnDisabled: {
    opacity: 0.5,
  },
  sportBtnText: {
    fontSize: 14,
    fontFamily: "jakarta-600",
    color: "#6b7a99",
    includeFontPadding: false,
  },
  sportBtnTextActive: { color: "#fff" },
  bookBtn: {
    marginTop: 28,
    backgroundColor: "#4A6CF7",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4A6CF7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bookBtnDisabled: {
    backgroundColor: "#A0AEC0",
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.7,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "jakarta-700",
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    marginTop: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e8ecf4",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#4A6CF7",
  },
  statusBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#eef7ee",
  },
  statusText: {
    fontSize: 14,
    fontFamily: "jakarta-400",
    lineHeight: 21,
    color: "#2e7d32",
  },
  dismissBtn: { marginTop: 12, alignSelf: "center" },
  dismissBtnText: { color: "#4A6CF7", fontFamily: "jakarta-600", fontSize: 14 },
  progressFillFull: { width: "100%" },
  statusBoxError: { backgroundColor: "#fdecea" },
  statusBoxNeutral: { backgroundColor: "#f4f6fb" },
  statusTextError: { color: "#c62828" },
  statusTextNeutral: { color: "#1a1f36" },
  statusBtnRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  lastBookingBox: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
    alignItems: "center",
    backgroundColor: "#f4f6fb",
  },
  lastBookingRecent: {
    backgroundColor: "#eef7ee",
  },
  lastBookingText: {
    fontSize: 13,
    color: "#6b7a99",
    fontFamily: "jakarta-500",
  },
  lastBookingTextRecent: {
    color: "#2e7d32",
  },
  debugPanel: {
    backgroundColor: "#1a1f36",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  debugTitle: {
    color: "#ff6b6b",
    fontFamily: "jakarta-700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  debugRow: {
    flexDirection: "row",
    gap: 8,
  },
  debugBtn: {
    flex: 1,
    backgroundColor: "#2d3352",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  debugBtnReset: {
    backgroundColor: "#4a2030",
  },
  debugBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "jakarta-600",
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: "jakarta-400",
    color: "#99a4be",
    textAlign: "center",
    lineHeight: 18,
    includeFontPadding: false,
  },
});
