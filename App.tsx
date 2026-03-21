import { useEffect, useState, useCallback, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sport, setSport] = useState<SportKey>("hurling");
  const [booking, setBooking] = useState<BookingState>({ phase: "idle" });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [ready, setReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown after booking is triggered
  const startCountdown = useCallback((remaining: number = LOADING_DURATION) => {
    setSecondsLeft(remaining);
    setBooking({ phase: "waiting" });

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          timerRef.current = null;
          AsyncStorage.removeItem("hsp_triggered_at");
          setBooking({ phase: "done" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Load saved values on mount and resume countdown if active
  useEffect(() => {
    (async () => {
      const [savedEmail, savedPassword, savedSport, savedTriggeredAt] =
        await Promise.all([
          SecureStore.getItemAsync("hsp_email"),
          SecureStore.getItemAsync("hsp_password"),
          AsyncStorage.getItem("hsp_sport"),
          AsyncStorage.getItem("hsp_triggered_at"),
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

      // Resume countdown if booking was triggered recently
      if (savedTriggeredAt) {
        const elapsed = Math.floor(
          (Date.now() - Number(savedTriggeredAt)) / 1000,
        );
        if (elapsed < LOADING_DURATION) {
          startCountdown(LOADING_DURATION - elapsed);
        } else {
          // Timer expired while app was closed — show done state
          await AsyncStorage.removeItem("hsp_triggered_at");
          setBooking({ phase: "done" });
        }
      }

      setReady(true);
    })();
  }, [startCountdown]);

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
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    setBooking({ phase: "triggering" });
    await saveCredentials();
    await AsyncStorage.setItem("hsp_triggered_at", String(Date.now()));

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
    } catch {
      await AsyncStorage.removeItem("hsp_triggered_at");
      setBooking({ phase: "idle" });
      Alert.alert(
        "Error",
        "Couldn't connect. Check your internet and try again.",
      );
    }
  }, [email, password, sport, saveCredentials, startCountdown]);

  const isLoading =
    booking.phase === "triggering" || booking.phase === "waiting";

  if (!ready) {
    return (
      <LinearGradient colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6CF7" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#e8f0fe", "#d4e4fc", "#f0e6ff"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require("./assets/crest.png")} style={styles.crest} />
          <View style={styles.card}>
            <Text style={styles.title}>Book HSP training</Text>
            <Text style={styles.subtitle}>
              This will book the training session currently open for signups on
              the Hochschulsport website
            </Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#b0b8c9"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#b0b8c9"
              secureTextEntry
              editable={!isLoading}
            />

            {/* Sport picker */}
            <Text style={styles.label}>Sport</Text>
            <View style={styles.sportRow}>
              {SPORTS.map((s) => (
                <Pressable
                  key={s.key}
                  style={[
                    styles.sportBtn,
                    sport === s.key && styles.sportBtnActive,
                  ]}
                  onPress={() => pickSport(s.key)}
                  disabled={isLoading}
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
              style={[styles.bookBtn, isLoading && styles.bookBtnDisabled]}
              onPress={book}
              disabled={isLoading}
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

            {/* Status message */}
            {booking.phase === "done" && (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  You should receive a confirmation email shortly from
                  Hochschulsport Hamburg. If you have not received one within 10
                  minutes, please try again.
                </Text>
                <Pressable
                  style={styles.dismissBtn}
                  onPress={() => setBooking({ phase: "idle" })}
                >
                  <Text style={styles.dismissBtnText}>Dismiss</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text style={styles.disclaimer}>
            Your credentials are stored securely on this device and used only to
            complete the booking. They are not stored anywhere else.
          </Text>
        </ScrollView>
        <StatusBar style="dark" />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingVertical: 60 },
  crest: {
    width: 80,
    height: 80,
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
    fontWeight: "800",
    color: "#1a1f36",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7a99",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7a99",
    marginBottom: 6,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#f4f6fb",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: "#1a1f36",
    borderWidth: 1,
    borderColor: "#e8ecf4",
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
  sportBtnText: { fontSize: 14, fontWeight: "600", color: "#6b7a99" },
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
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#eef7ee",
  },
  statusText: { fontSize: 14, lineHeight: 21, color: "#2e7d32" },
  dismissBtn: { marginTop: 12, alignSelf: "center" },
  dismissBtnText: { color: "#4A6CF7", fontWeight: "600", fontSize: 14 },
  disclaimer: {
    marginTop: 24,
    fontSize: 12,
    color: "#99a4be",
    textAlign: "center",
    lineHeight: 18,
  },
});
