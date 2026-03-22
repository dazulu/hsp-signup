import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { DebugPanel } from "./components/DebugPanel";
import { SPORTS, useBooking } from "./hooks/useBooking";
import { styles } from "./styles";

export default function App() {
  const [fontsLoaded] = useFonts({
    "jakarta-400": require("@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf"),
    "jakarta-500": require("@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf"),
    "jakarta-600": require("@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf"),
    "jakarta-700": require("@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf"),
    "jakarta-800": require("@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf"),
  });

  const {
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
    lastBooking,
    ready,
    doneAnim,
    progressAnim,
    debugOpen,
    handleCrestTap,
    debugFakeLoading,
    debugFakeSuccess,
    debugFakeFailure,
    debugFakeLastBooking,
    debugReset,
  } = useBooking();

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
                  <DebugPanel
                    onFakeLoading={debugFakeLoading}
                    onFakeSuccess={debugFakeSuccess}
                    onFakeFailure={debugFakeFailure}
                    onFakeLastBooking={debugFakeLastBooking}
                    onReset={debugReset}
                  />
                )}

                <View style={styles.card}>
                  <Text style={styles.title}>Book Training</Text>
                  <Text style={styles.subtitle}>
                    Automatically books your next available Hamburg GAA training
                    session.
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
                            ? "Starting…"
                            : booking.phase === "polling"
                              ? "Checking…"
                              : "Booking in progress…"}
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

                  {/* Success message */}
                  {booking.phase === "success" && (
                    <Animated.View
                      style={[styles.statusBox, { opacity: doneAnim }]}
                    >
                      <Text style={styles.statusText}>
                        Booked! You'll get a confirmation email from
                        Hochschulsport Hamburg. Nothing within 10 minutes? Try
                        again.
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
                        Booking failed. Check your login details and that your
                        Hochschulsport Hamburg membership is active.
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
                        Couldn't confirm the result. Check your email — if
                        nothing from Hochschulsport Hamburg arrives within 10
                        minutes, try again.
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
