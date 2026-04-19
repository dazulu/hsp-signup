import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import { useCallback } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../components/card";
import { DeleteLikesButton } from "../components/delete-likes-button";
import { ExternalLink } from "../components/external-link";
import { LanguageSwitcher } from "../components/language-switcher";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { styles } from "./settings.styles";

const { space } = theme;

const appVersion = Constants.expoConfig?.version ?? "—";

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/privacy-policy-app`
  : "/privacy-policy-app";

const RATE_APP_URL: string | null =
  Platform.OS === "android"
    ? "https://play.google.com/store/apps/details?id=com.dazulu.hamburggaa&showAllReviews=true"
    : Platform.OS === "ios"
      ? "" // Set to itms-apps:// URL once App Store ID is assigned
      : "https://play.google.com/store/apps/details?id=com.dazulu.hamburggaa&showAllReviews=true";

const STORAGE_KEYS = [
  "app_save_on_device",
  "hsp_sport",
  "hsp_triggered_at",
  "hsp_correlation_id",
  "hsp_last_booking",
  "app_strava_cache",
  "app_contentful_events",
  "app_gallery_cache_en",
  "app_gallery_cache_de",
  "app_has_opened_before",
  "app_locale",
  "app_training_promo_dismissed",
  "app_contentful_quote",
];

const SettingsScrollContent = () => {
  const { headerHeight, contentPaddingTop, onScrollHandler } =
    useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();

  const copyDebugInfo = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const pairs = await AsyncStorage.multiGet(STORAGE_KEYS);
    const storageLines = pairs
      .filter(([, storageValue]) => storageValue != null)
      .map(([storageKey, storageValue]) => `  ${storageKey}: ${storageValue}`)
      .join("\n");

    const brand = Device.brand ?? "";
    const model = Device.modelName ?? "unknown";
    const deviceLabel = brand ? `${brand} ${model}` : model;

    const lines = [
      `Device: ${deviceLabel}`,
      `OS: ${Platform.OS} ${Device.osVersion ?? Platform.Version}`,
      `App Version: ${appVersion}`,
      `OTA Update: ${Updates.updateId ?? "embedded"}`,
      Updates.createdAt ? `OTA Date: ${Updates.createdAt.toISOString()}` : "",
      `Runtime Version: ${Updates.runtimeVersion ?? "—"}`,
      `Channel: ${Updates.channel ?? "—"}`,
      storageLines ? `Storage:\n${storageLines}` : "Storage: (empty)",
    ].filter(Boolean);

    await Clipboard.setStringAsync(lines.join("\n"));
    Alert.alert(t("settings.version"), t("settings.debugCopied"));
  }, [t]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: contentPaddingTop, paddingBottom: bottom + space[12] },
      ]}
      scrollIndicatorInsets={{ top: headerHeight }}
      onScroll={onScrollHandler}
      scrollEventThrottle={16}
    >
      <Card>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.language")}</Text>
          <LanguageSwitcher />
        </View>
      </Card>

      <Card>
        <View style={styles.rowGap}>
          <ExternalLink label={t("settings.rateApp")} href={RATE_APP_URL} />
          <ExternalLink
            label={t("settings.privacyPolicy")}
            href={PRIVACY_POLICY_URL}
          />
        </View>
      </Card>

      <Card>
        <DeleteLikesButton />
      </Card>

      <Card onLongPress={copyDebugInfo} delayLongPress={500}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.version")}</Text>
          <Text style={styles.rowValue}>{appVersion}</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

export const SettingsScreen = () => {
  const { t } = useLocale();

  return (
    <ScreenLayout title={t("settings.title")} subtitle={t("settings.subtitle")}>
      <SettingsScrollContent />
    </ScreenLayout>
  );
};
