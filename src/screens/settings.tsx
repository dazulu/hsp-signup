import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../components/card";
import { DebugButton } from "../components/debug-button";
import { DeleteLikesButton } from "../components/delete-likes-button";
import { DevClearNotificationsButton } from "../components/dev-clear-notifications-button";
import { ExternalLink } from "../components/external-link";
import { LanguageSwitcher } from "../components/language-switcher";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { TrainingReminderSettings } from "../components/training-reminder-settings";
import { useWhatsNewSheet } from "../context/whats-new-sheet";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { WHATS_NEW_ITEMS } from "../whats-new/content";
import { styles } from "./settings.styles";

const { space, colors } = theme;

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/privacy-policy-app`
  : "/privacy-policy-app";

const RATE_APP_URL: string | null =
  Platform.OS === "android"
    ? "https://play.google.com/store/apps/details?id=com.dazulu.hamburggaa&showAllReviews=true"
    : Platform.OS === "ios"
      ? "" // Set to itms-apps:// URL once App Store ID is assigned
      : "https://play.google.com/store/apps/details?id=com.dazulu.hamburggaa&showAllReviews=true";

const SettingsScrollContent = () => {
  const { headerHeight, contentPaddingTop, onScrollHandler } =
    useScreenLayout();
  const { bottom } = useSafeAreaInsets();
  const { t } = useLocale();
  const { open: openWhatsNew } = useWhatsNewSheet();

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
      {Platform.OS !== "web" && WHATS_NEW_ITEMS.length > 0 ? (
        <Card>
          <Pressable
            style={styles.row}
            onPress={openWhatsNew}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>{t("settings.whatsNew")}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        </Card>
      ) : null}

      <Card>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("settings.language")}</Text>
          <LanguageSwitcher />
        </View>
      </Card>

      {Platform.OS !== "web" ? <TrainingReminderSettings /> : null}

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

      {__DEV__ && Platform.OS !== "web" ? (
        <DevClearNotificationsButton />
      ) : null}

      <DebugButton />
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
