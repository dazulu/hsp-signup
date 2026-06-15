import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../components/card";
import { DebugButton } from "../components/debug-button";
import { DeleteLikesButton } from "../components/delete-likes-button";
import { DevClearNotificationsButton } from "../components/dev-clear-notifications-button";
import { ExternalLink } from "../components/external-link";
import { LanguageSwitcher } from "../components/language-switcher";
import { ScreenLayout, useScreenLayout } from "../components/screen-layout";
import { TrainingReminderSettings } from "../components/training-reminder-settings";
import { useLocale } from "../i18n";
import { theme } from "../theme";
import { styles } from "./settings.styles";

const { space } = theme;

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
