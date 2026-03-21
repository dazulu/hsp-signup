import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
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

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
const LOADING_DURATION = 60; // seconds

const SPORTS = [
  { key: "hurling", label: "Hurling & Camogie" },
  { key: "football", label: "Gaelic Football" },
] as const;

type SportKey = (typeof SPORTS)[number]["key"];
type BookingState =
  | { phase: "idle" }
  | { phase: "triggering" }
  | { phase: "waiting" }
  | { phase: "done" };

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
  const doneAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Animate done state when booking completes
  useEffect(() => {
    if (booking.phase === "done") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(doneAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [booking.phase, doneAnim]);

  // Start countdown after booking is triggered
  const startCountdown = useCallback(
    (remaining: number = LOADING_DURATION) => {
      setSecondsLeft(remaining);
      setBooking({ phase: "waiting" });
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
            setBooking({ phase: "done" });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [progressAnim],
  );

  // Load saved values on mount and resume countdown if active
  useEffect(() => {
    (async () => {
      const [
        savedEmail,
        savedPassword,
        savedSport,
        savedTriggeredAt,
        savedLastBooking,
      ] = await Promise.all([
        SecureStore.getItemAsync("hsp_email"),
        SecureStore.getItemAsync("hsp_password"),
        AsyncStorage.getItem("hsp_sport"),
        AsyncStorage.getItem("hsp_triggered_at"),
        AsyncStorage.getItem("hsp_last_booking"),
      ]);
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
      if (savedSport === "hurling" || savedSport === "football") {
        setSport(savedSport);
      }
      if (savedLastBooking) {
        try {
          setLastBooking(JSON.parse(savedLastBooking));
        } catch {}
      }

      // Resume countdown if booking was triggered recently
      if (savedTriggeredAt) {
        const elapsed = Math.floor(
          (Date.now() - Number(savedTriggeredAt)) / 1000,
        );
        if (elapsed < LOADING_DURATION) {
          startCountdown(LOADING_DURATION - elapsed);
        } else {
          // Timer expired while app was closed — show done state
          setBooking({ phase: "done" });
          doneAnim.setValue(1);
        }
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
    setTimeout(() => startCountdown(), 1500);
  }, [startCountdown, doneAnim, progressAnim]);

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
    setBooking({ phase: "idle" });
    setSecondsLeft(0);
    setLastBooking(null);
    progressAnim.setValue(0);
    doneAnim.setValue(0);
  }, [progressAnim, doneAnim]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Persist sport choice
  const pickSport = useCallback((s: SportKey) => {
    setSport(s);
    AsyncStorage.setItem("hsp_sport", s);
  }, []);

  // Save credentials
  const saveCredentials = useCallback(async () => {
    await Promise.all([
      SecureStore.setItemAsync("hsp_email", email),
      SecureStore.setItemAsync("hsp_password", password),
    ]);
  }, [email, password]);

  // Book
  const book = useCallback(async () => {
    if (!email || !password || !sport) {
      return;
    }

    doneAnim.stopAnimation();
    doneAnim.setValue(0);
    progressAnim.setValue(0);
    setBooking({ phase: "triggering" });
    await saveCredentials();
    const now = Date.now();
    await AsyncStorage.setItem("hsp_triggered_at", String(now));
    const bookingRecord = { sport, bookedAt: now };
    await AsyncStorage.setItem(
      "hsp_last_booking",
      JSON.stringify(bookingRecord),
    );
    setLastBooking(bookingRecord);

    try {
      const res = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, password, sport }),
      });
      const data = await res.json();
      if (!data.ok) {
        await AsyncStorage.removeItem("hsp_triggered_at");
        setBooking({ phase: "idle" });
        Alert.alert(
          "Error",
          "Could not start the booking. Please try again later.",
        );
        return;
      }

      startCountdown();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      await AsyncStorage.removeItem("hsp_triggered_at");
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
    doneAnim.setValue,
    doneAnim.stopAnimation,
    progressAnim.setValue,
  ]);

  const isLoading =
    booking.phase === "triggering" || booking.phase === "waiting";
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
              <Pressable onPress={Keyboard.dismiss} accessible={false}>
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
                            : `Booking in progress… ${secondsLeft}s`}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.bookBtnText}>Book</Text>
                    )}
                  </Pressable>

                  {/* Progress bar */}
                  {booking.phase === "waiting" && (
                    <View style={styles.progressTrack}>
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
                    </View>
                  )}

                  {/* Status message */}
                  {booking.phase === "done" && (
                    <Animated.View
                      style={[styles.statusBox, { opacity: doneAnim }]}
                    >
                      <Text style={styles.statusText}>
                        You should receive a confirmation email shortly from
                        Hochschulsport Hamburg. If you have not received one
                        within 10 minutes, try again.
                      </Text>
                      <Pressable
                        style={styles.dismissBtn}
                        onPress={() => setBooking({ phase: "idle" })}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss message"
                      >
                        <Text style={styles.dismissBtnText}>Dismiss</Text>
                      </Pressable>
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
