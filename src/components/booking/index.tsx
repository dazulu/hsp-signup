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
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { SPORTS, useBooking } from "../../hooks/use-booking";
import { formatTimeAgo } from "../../utils";
import { Card } from "../card";
import { DebugPanel } from "../debug-panel";
import { styles } from "./styles";

// On native, tapping outside inputs dismisses the keyboard. On web the
// keyboard is managed by the browser so a plain View is sufficient.
const DismissWrapper =
  Platform.OS === "web"
    ? View
    : ({ children }: { children: React.ReactNode }) => (
        <Pressable
          onPress={Keyboard.dismiss}
          accessible={false}
          focusable={false}
        >
          {children}
        </Pressable>
      );

export const BookingForm = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveOnWeb,
    setSaveOnWeb,
    sport,
    saveCredentials,
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
    handleDebugTap,
    debugFakeLoading,
    debugFakeSuccess,
    debugFakeFailure,
    debugFakeLastBooking,
    debugReset,
    debugClose,
  } = useBooking();

  const isLoading =
    booking.phase === "triggering" ||
    booking.phase === "waiting" ||
    booking.phase === "polling";
  const canBook = !!(email && password && sport) && !isLoading;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6CF7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <DismissWrapper>
          {/* Web shows a centred crest above the card; native has its own
              absolute-positioned crest rendered at the navigator level. */}
          {Platform.OS === "web" && (
            <Image
              source={require("../../../assets/crest.png")}
              style={styles.crest}
              resizeMode="contain"
            />
          )}

          {__DEV__ && debugOpen && (
            <DebugPanel
              onFakeLoading={debugFakeLoading}
              onFakeSuccess={debugFakeSuccess}
              onFakeFailure={debugFakeFailure}
              onFakeLastBooking={debugFakeLastBooking}
              onReset={debugReset}
              onClose={debugClose}
            />
          )}

          <Card>
            {/* Web keeps the card title/subtitle; native surfaces the title
                via ScreenLayout above the card. */}
            {Platform.OS === "web" && (
              <>
                <Text style={styles.title}>Book Training</Text>
                <Text style={styles.subtitle}>
                  Automatically books your next available Hamburg GAA training
                  session.
                </Text>
              </>
            )}

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
              onBlur={Platform.OS !== "web" ? saveCredentials : undefined}
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
                onBlur={Platform.OS !== "web" ? saveCredentials : undefined}
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

            {/* Save-on-web checkbox — native has SecureStore, no opt-in needed */}
            {Platform.OS === "web" && (
              <Pressable
                style={styles.saveOnWebRow}
                onPress={() => setSaveOnWeb(!saveOnWeb)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: saveOnWeb }}
                accessibilityLabel="Remember details in this browser"
                disabled={isLoading}
              >
                <View
                  style={[styles.checkbox, saveOnWeb && styles.checkboxChecked]}
                >
                  {saveOnWeb && <Text style={styles.checkboxTick}>{"✓"}</Text>}
                </View>
                <Text style={styles.saveOnWebLabel}>
                  Remember login details in this browser
                </Text>
              </Pressable>
            )}

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
                isLoading ? "Booking in progress" : "Book training session"
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
                <Reanimated.View style={[styles.progressFill, progressStyle]} />
              </View>
            )}

            {/* Success */}
            {booking.phase === "success" && (
              <Animated.View style={[styles.statusBox, { opacity: doneAnim }]}>
                <Text style={styles.statusText}>
                  Booked! You'll get a confirmation email from Hochschulsport
                  Hamburg. Nothing within 10 minutes? Try again.
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

            {/* Failure */}
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

            {/* Timeout */}
            {booking.phase === "timeout" && (
              <Animated.View
                style={[
                  styles.statusBox,
                  styles.statusBoxNeutral,
                  { opacity: doneAnim },
                ]}
              >
                <Text style={[styles.statusText, styles.statusTextNeutral]}>
                  Couldn't confirm the result. Check your email — if nothing
                  from Hochschulsport Hamburg arrives within 10 minutes, try
                  again.
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
          </Card>

          {lastBooking && booking.phase === "idle" && (
            <View style={styles.lastBookingBox}>
              <Text style={styles.lastBookingText}>
                <Text style={styles.lastBookingTick}>{"\u2713"}</Text>{" "}
                {SPORTS.find((s) => s.key === lastBooking.sport)?.label}
                {"\u00a0\u00b7\u00a0"}
                {formatTimeAgo(lastBooking.bookedAt)}
              </Text>
            </View>
          )}

          <Text
            style={styles.disclaimer}
            onPress={handleDebugTap}
            suppressHighlighting
          >
            {Platform.OS === "web"
              ? saveOnWeb
                ? "Your credentials are saved in this browser and used only to complete the booking."
                : "Your credentials are not saved and are used only to complete the booking."
              : "Your credentials are stored securely on this device and used only to complete the booking."}
          </Text>
        </DismissWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
