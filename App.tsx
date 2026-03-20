import { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

const SPORTS = [
  { key: "hurling", label: "Hurling & Camogie" },
  { key: "football", label: "Gaelic Football" },
] as const;

type SportKey = (typeof SPORTS)[number]["key"];
type BookingState =
  | { phase: "idle" }
  | { phase: "triggering" }
  | { phase: "polling"; runId?: number }
  | { phase: "done"; success: boolean; message: string };

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sport, setSport] = useState<SportKey>("hurling");
  const [booking, setBooking] = useState<BookingState>({ phase: "idle" });
  const [ready, setReady] = useState(false);

  // Load saved values on mount
  useEffect(() => {
    (async () => {
      const [savedEmail, savedPassword, savedSport] = await Promise.all([
        SecureStore.getItemAsync("hsp_email"),
        SecureStore.getItemAsync("hsp_password"),
        AsyncStorage.getItem("hsp_sport"),
      ]);
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      if (savedSport === "hurling" || savedSport === "football")
        setSport(savedSport);
      setReady(true);
    })();
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

  // Poll for run status
  const pollStatus = useCallback(async () => {
    const maxAttempts = 60; // 5 minutes at 5s intervals
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const res = await fetch(`${API_URL}/api/status`, {
          headers: { "x-api-key": API_KEY },
        });
        const data = await res.json();
        if (data.status === "completed") {
          setBooking({
            phase: "done",
            success: data.conclusion === "success",
            message:
              data.conclusion === "success"
                ? "You're booked! Check your email for confirmation."
                : "Something went wrong with the booking. Please try again.",
          });
          return;
        }
      } catch {
        // Ignore poll errors, keep trying
      }
    }
    setBooking({
      phase: "done",
      success: false,
      message: "Still waiting on a result — try checking back later.",
    });
  }, []);

  // Book
  const book = useCallback(async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    setBooking({ phase: "triggering" });
    await saveCredentials();

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
        setBooking({
          phase: "done",
          success: false,
          message: "Could not start the booking. Please try again later.",
        });
        return;
      }

      setBooking({ phase: "polling" });
      pollStatus();
    } catch {
      setBooking({
        phase: "done",
        success: false,
        message: "Couldn't connect. Check your internet and try again.",
      });
    }
  }, [email, password, sport, saveCredentials, pollStatus]);

  const isLoading =
    booking.phase === "triggering" || booking.phase === "polling";

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>HamburgGAA HSP Booking</Text>

        {/* Email */}
        <Text style={styles.label}>HSP Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        {/* Password */}
        <Text style={styles.label}>HSP Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
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
                  : "Booking in progress…"}
              </Text>
            </View>
          ) : (
            <Text style={styles.bookBtnText}>Book</Text>
          )}
        </Pressable>

        {/* Status message */}
        {booking.phase === "done" && (
          <View
            style={[
              styles.statusBox,
              booking.success ? styles.statusOk : styles.statusErr,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                booking.success ? styles.statusTextOk : styles.statusTextErr,
              ]}
            >
              {booking.message}
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Your credentials are stored securely on this device and used only to
          complete the booking. They are not stored anywhere else.
        </Text>
      </ScrollView>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24, paddingTop: 80 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 28 },
  label: { fontSize: 14, color: "#555", marginBottom: 4, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  sportRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  sportBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  sportBtnActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sportBtnText: { fontSize: 14, fontWeight: "600", color: "#333" },
  sportBtnTextActive: { color: "#fff" },
  bookBtn: {
    marginTop: 28,
    backgroundColor: "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
  },
  statusOk: { backgroundColor: "#e8f5e9" },
  statusErr: { backgroundColor: "#fdecea" },
  statusText: { fontSize: 14, lineHeight: 20 },
  statusTextOk: { color: "#2e7d32" },
  statusTextErr: { color: "#c62828" },
  disclaimer: {
    marginTop: 24,
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
  },
});
