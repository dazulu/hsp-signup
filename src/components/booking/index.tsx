import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import type { ScrollView as ScrollViewType } from "react-native";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import { useMobileAppData } from "../../context/mobile-app-data";
import type { SportKey } from "../../hooks/use-booking";
import { SPORTS, useBooking } from "../../hooks/use-booking";
import { useLastBookingLabel } from "../../hooks/use-last-booking-label";
import { useLocale } from "../../i18n";
import type { TranslationKey } from "../../i18n/types";
import { theme } from "../../theme";
import { Card, CardGrid } from "../card";
import { NoticeCard } from "../card/implementations/notice";

import { styles } from "./styles";

const { colors } = theme;

const SPORT_LABEL_KEYS: Record<SportKey, TranslationKey> = {
  hurling: "booking.sport.hurling",
  football: "booking.sport.football",
};

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

export const BookingForm = ({
  scrollRef,
  refreshing,
  onRefresh,
}: {
  scrollRef?: React.RefObject<ScrollViewType | null>;
  refreshing?: boolean;
  onRefresh?: () => void;
}) => {
  const { t } = useLocale();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveOnDevice,
    setSaveOnDevice,
    sport,
    saveCredentials,
    pickSport,
    booking,
    book,
    dismiss,
    lastBooking,
    ready,
    doneAnim,
    progressAnim,
  } = useBooking();
  const { label: lastBookingLabel, isStale: lastBookingIsStale } =
    useLastBookingLabel(lastBooking);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const { data } = useMobileAppData();

  const isSportDisabled = useCallback(
    (s: SportKey): boolean => {
      const now = new Date();
      if (s === "hurling") {
        return (
          !!data?.booking?.hurlingDisabledUntil &&
          new Date(data.booking.hurlingDisabledUntil) > now
        );
      }
      return (
        !!data?.booking?.gaelicDisabledUntil &&
        new Date(data.booking.gaelicDisabledUntil) > now
      );
    },
    [data],
  );

  const isLoading =
    booking.phase === "triggering" ||
    booking.phase === "waiting" ||
    booking.phase === "polling";

  const canBook =
    !!(email && password && sport) &&
    !isLoading &&
    !(sport && isSportDisabled(sport));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
          />
        }
      >
        <DismissWrapper>
          {/* Web shows a centred crest above the card; native has its own
              absolute-positioned crest rendered at the navigator level. */}
          {Platform.OS === "web" && (
            <Image
              source={require("../../../assets/crest-web.png")}
              style={styles.crest}
              resizeMode="contain"
            />
          )}

          <CardGrid>
            <NoticeCard message={data?.booking?.notice ?? undefined} />

            <Card padding="md" span={2}>
              {/* Web keeps the card title/subtitle; native surfaces the title
                via ScreenLayout above the card. */}
              {Platform.OS === "web" && (
                <>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{t("booking.formTitle")}</Text>
                    <View style={styles.betaBadge}>
                      <Text style={styles.betaText}>BETA</Text>
                    </View>
                  </View>
                  <Text style={styles.subtitle}>
                    {t("booking.formSubtitle")}
                  </Text>
                </>
              )}

              {/* Email */}
              <Text style={styles.label}>{t("booking.emailLabel")}</Text>
              <TextInput
                style={[styles.input, isLoading && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder={t("booking.emailPlaceholder")}
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isLoading}
                onBlur={Platform.OS !== "web" ? saveCredentials : undefined}
                accessibilityLabel={t("booking.emailLabel")}
              />

              {/* Password */}
              <Text style={styles.label}>{t("booking.passwordLabel")}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isLoading && styles.inputDisabled,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("booking.passwordPlaceholder")}
                  placeholderTextColor={colors.textPlaceholder}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!isLoading}
                  onBlur={Platform.OS !== "web" ? saveCredentials : undefined}
                  accessibilityLabel={t("booking.passwordLabel")}
                />
                <Pressable
                  style={[styles.eyeBtn, isLoading && styles.inputDisabled]}
                  onPress={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? t("booking.hidePassword")
                      : t("booking.showPassword")
                  }
                >
                  <Text style={styles.eyeText}>
                    {showPassword
                      ? t("booking.hidePassword")
                      : t("booking.showPassword")}
                  </Text>
                </Pressable>
              </View>

              {/* Remember credentials checkbox — native only */}
              {Platform.OS !== "web" && (
                <Pressable
                  style={styles.saveOnDeviceRow}
                  onPress={() => setSaveOnDevice(!saveOnDevice)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: saveOnDevice }}
                  accessibilityLabel={t("booking.rememberMe")}
                  disabled={isLoading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      saveOnDevice && styles.checkboxChecked,
                    ]}
                  >
                    {saveOnDevice && (
                      <Text style={styles.checkboxTick}>{"\u2713"}</Text>
                    )}
                  </View>
                  <Text style={styles.saveOnDeviceLabel}>
                    {t("booking.rememberMe")}
                  </Text>
                </Pressable>
              )}

              {/* Sport picker */}
              <Text style={styles.label}>{t("booking.sportLabel")}</Text>
              <View style={styles.sportRow}>
                {SPORTS.map((s) => (
                  <Pressable
                    key={s.key}
                    style={[
                      styles.sportBtn,
                      sport === s.key && styles.sportBtnActive,
                      (isLoading || isSportDisabled(s.key)) &&
                        styles.sportBtnDisabled,
                    ]}
                    onPress={() => pickSport(s.key)}
                    disabled={isLoading || isSportDisabled(s.key)}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: sport === s.key,
                      disabled: isSportDisabled(s.key),
                    }}
                    accessibilityLabel={t(SPORT_LABEL_KEYS[s.key])}
                  >
                    <Text
                      style={[
                        styles.sportBtnText,
                        sport === s.key && styles.sportBtnTextActive,
                      ]}
                    >
                      {t(SPORT_LABEL_KEYS[s.key])}
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
                  isLoading ? t("booking.status.inProgress") : t("booking.cta")
                }
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator
                      color={colors.textOnPrimary}
                      size="small"
                    />
                    <Text style={styles.bookBtnText}>
                      {booking.phase === "triggering"
                        ? t("booking.status.starting")
                        : booking.phase === "polling"
                          ? t("booking.status.checking")
                          : t("booking.status.inProgress")}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.bookBtnText}>{t("booking.cta")}</Text>
                )}
              </Pressable>

              {/* Progress bar */}
              {booking.phase === "waiting" && (
                <View style={styles.progressTrack}>
                  <Reanimated.View
                    style={[styles.progressFill, progressStyle]}
                  />
                </View>
              )}

              {/* Success */}
              {booking.phase === "success" && (
                <Animated.View
                  style={[styles.statusBox, { opacity: doneAnim }]}
                >
                  <Text style={styles.statusText}>
                    {t("booking.result.success")}
                  </Text>
                  <Pressable
                    style={styles.dismissBtn}
                    onPress={dismiss}
                    accessibilityRole="button"
                    accessibilityLabel={t("booking.dismiss")}
                  >
                    <Text style={styles.dismissBtnText}>
                      {t("booking.dismiss")}
                    </Text>
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
                    {t("booking.result.failure")}
                  </Text>
                  <Pressable
                    style={styles.dismissBtn}
                    onPress={dismiss}
                    accessibilityRole="button"
                    accessibilityLabel={t("booking.dismiss")}
                  >
                    <Text style={styles.dismissBtnText}>
                      {t("booking.dismiss")}
                    </Text>
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
                    {t("booking.result.timeout")}
                  </Text>
                  <Pressable
                    style={styles.dismissBtn}
                    onPress={dismiss}
                    accessibilityRole="button"
                    accessibilityLabel={t("booking.dismiss")}
                  >
                    <Text style={styles.dismissBtnText}>
                      {t("booking.dismiss")}
                    </Text>
                  </Pressable>
                </Animated.View>
              )}
            </Card>
          </CardGrid>

          {lastBookingLabel && booking.phase === "idle" && (
            <View style={styles.lastBookingBox}>
              <Text style={styles.lastBookingText}>
                <Text style={styles.lastBookingTick}>{"\u2713"}</Text>
                {`  ${lastBookingLabel}`}
              </Text>
              {lastBookingIsStale && !nudgeDismissed && (
                <Pressable
                  style={styles.nudgePill}
                  onPress={() => setNudgeDismissed(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss"
                >
                  <Text style={styles.nudgeText}>
                    {t("card.lastBooking.staleNudge")}
                  </Text>
                  <Ionicons name="close" size={14} color={colors.warningText} />
                </Pressable>
              )}
            </View>
          )}

          <Text style={styles.disclaimer}>
            {Platform.OS === "web"
              ? t("booking.disclaimer.noSave")
              : saveOnDevice
                ? t("booking.disclaimer.saved")
                : t("booking.disclaimer.noSave")}
          </Text>
        </DismissWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
